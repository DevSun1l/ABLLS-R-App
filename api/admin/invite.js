import { getDb, ensureNotificationsTable, ensureAdminAccountsTable } from '../_utils/db.js';
import { requireAuth } from '../_utils/auth.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const normalizeName = (firstName = '', lastName = '') =>
  `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');

const buildAdminPassword = (firstName = '', lastName = '') => {
  const base = `${firstName}${lastName}`.replace(/[^a-zA-Z0-9]/g, '') || 'Faculty';
  return `${base.slice(0, 10)}Admin2026!`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  
  try {
     const decoded = requireAuth(req);
     if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({error: 'Forbidden: Admin only'});
     }

     const { userId } = req.body;
     if (!userId) {
        return res.status(400).json({error: 'Missing faculty userId'});
     }

     const db = getDb();
     
     const { data: users, error: userError } = await db
       .from('users')
       .select('id, email, first_name, last_name, role, org_id, status')
       .eq('id', userId);

     if (userError || !users || users.length === 0) {
        return res.status(404).json({error: 'Faculty member not found'});
     }

     const targetUser = users[0];
     const baseLocalPart = `${normalizeName(targetUser.first_name, targetUser.last_name) || 'faculty'}admin`;
     let nextEmail = `${baseLocalPart}@cognifycareteam.com`;
     let counter = 2;

     const { data: adminAccounts, error: adminAccError } = await db
       .from('admin_accounts')
       .select('source_user_id, admin_user_id, users!admin_accounts_admin_user_id_fkey(email)')
       .eq('source_user_id', targetUser.id);

     if (adminAccError) return res.status(500).json({error: adminAccError.message});

     if (adminAccounts && adminAccounts.length > 0) {
        nextEmail = adminAccounts[0].users.email;
     } else {
        while (true) {
           const { data: existingEmail, error: emailError } = await db
              .from('users')
              .select('id')
              .eq('email', nextEmail);
           
           if (emailError) return res.status(500).json({error: emailError.message});
           if (!existingEmail || existingEmail.length === 0) break;
           nextEmail = `${baseLocalPart}${counter}@cognifycareteam.com`;
           counter += 1;
        }
     }

     const nextPassword = buildAdminPassword(targetUser.first_name, targetUser.last_name);
     const passwordHash = await bcrypt.hash(nextPassword, 10);

     let adminUserId = adminAccounts?.[0]?.admin_user_id;
     if (adminUserId) {
        const { error: updateError } = await db
          .from('users')
          .update({ email: nextEmail, password_hash: passwordHash, status: 'active' })
          .eq('id', adminUserId);
        if (updateError) return res.status(500).json({error: updateError.message});
     } else {
        adminUserId = `usr_${uuidv4().split('-')[0]}`;
        const { error: insertUserError } = await db
          .from('users')
          .insert({
             id: adminUserId, 
             email: nextEmail, 
             password_hash: passwordHash, 
             first_name: targetUser.first_name, 
             last_name: targetUser.last_name, 
             role: 'admin', 
             org_id: targetUser.org_id, 
             status: 'active'
          });
        if (insertUserError) return res.status(500).json({error: insertUserError.message});

        const { error: insertAccError } = await db
          .from('admin_accounts')
          .insert({ source_user_id: targetUser.id, admin_user_id: adminUserId });
        if (insertAccError) return res.status(500).json({error: insertAccError.message});
     }

     await db.from('notifications').insert({
        id: `ntf_${uuidv4().split('-')[0]}`,
        user_id: targetUser.id,
        type: 'admin_promotion',
        title: 'You have been made an admin',
        message: 'Your original user login still works. Open this notification to view your separate admin credentials and switch to the admin account.',
        details: {
          adminUsername: nextEmail,
          adminPassword: nextPassword,
          previousEmail: targetUser.email,
          promotedAt: new Date().toISOString(),
          adminUserId,
        }
     });

     await db.from('activity_logs').insert({
        user_id: targetUser.id,
        action: 'admin_promoted',
        details: {
          promoted_by: decoded.id,
          previous_email: targetUser.email,
          new_email: nextEmail,
          admin_user_id: adminUserId,
        },
        timestamp: new Date().toISOString()
     });

     return res.status(201).json({
       message: 'Faculty member promoted to admin successfully',
       userId: targetUser.id,
       username: nextEmail,
       password: nextPassword,
     });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

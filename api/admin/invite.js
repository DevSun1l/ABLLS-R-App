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
     await ensureNotificationsTable(db);
     await ensureAdminAccountsTable(db);
     
     const userResult = await db.execute({
        sql: "SELECT id, email, first_name, last_name, role, org_id, status FROM users WHERE id = ?",
        args: [userId]
     });

     if (userResult.rows.length === 0) {
        return res.status(404).json({error: 'Faculty member not found'});
     }

     const targetUser = userResult.rows[0];
     const baseLocalPart = `${normalizeName(targetUser.first_name, targetUser.last_name) || 'faculty'}admin`;
     let nextEmail = `${baseLocalPart}@cognifycareteam.com`;
     let counter = 2;

     const existingAdminAccount = await db.execute({
        sql: `
          SELECT a.source_user_id, a.admin_user_id, u.email
          FROM admin_accounts a
          JOIN users u ON u.id = a.admin_user_id
          WHERE a.source_user_id = ?
        `,
        args: [targetUser.id]
     });

     if (existingAdminAccount.rows.length > 0) {
        nextEmail = existingAdminAccount.rows[0].email;
     } else {
        while (true) {
           const existingEmail = await db.execute({
              sql: "SELECT id FROM users WHERE email = ?",
              args: [nextEmail]
           });
           if (existingEmail.rows.length === 0) break;
           nextEmail = `${baseLocalPart}${counter}@cognifycareteam.com`;
           counter += 1;
        }
     }

     const nextPassword = buildAdminPassword(targetUser.first_name, targetUser.last_name);
     const passwordHash = await bcrypt.hash(nextPassword, 10);

     let adminUserId = existingAdminAccount.rows[0]?.admin_user_id;
     if (adminUserId) {
        await db.execute({
           sql: "UPDATE users SET email = ?, password_hash = ?, status = ? WHERE id = ?",
           args: [nextEmail, passwordHash, 'active', adminUserId]
        });
     } else {
        adminUserId = `usr_${uuidv4().split('-')[0]}`;
        await db.execute({
           sql: "INSERT INTO users (id, email, password_hash, first_name, last_name, role, org_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
           args: [adminUserId, nextEmail, passwordHash, targetUser.first_name, targetUser.last_name, 'admin', targetUser.org_id, 'active']
        });
        await db.execute({
           sql: "INSERT INTO admin_accounts (source_user_id, admin_user_id) VALUES (?, ?)",
           args: [targetUser.id, adminUserId]
        });
     }

     await db.execute({
        sql: "INSERT INTO notifications (id, user_id, type, title, message, details) VALUES (?, ?, ?, ?, ?, ?)",
        args: [
          `ntf_${uuidv4().split('-')[0]}`,
          targetUser.id,
          'admin_promotion',
          'You have been made an admin',
          'Your original user login still works. Open this notification to view your separate admin credentials and switch to the admin account.',
          JSON.stringify({
            adminUsername: nextEmail,
            adminPassword: nextPassword,
            previousEmail: targetUser.email,
            promotedAt: new Date().toISOString(),
            adminUserId,
          })
        ]
     });

     await db.execute({
        sql: "INSERT INTO activity_logs (user_id, action, details, timestamp) VALUES (?, ?, ?, ?)",
        args: [
          targetUser.id,
          'admin_promoted',
          JSON.stringify({
            promoted_by: decoded.id,
            previous_email: targetUser.email,
            new_email: nextEmail,
            admin_user_id: adminUserId,
          }),
          new Date().toISOString()
        ]
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

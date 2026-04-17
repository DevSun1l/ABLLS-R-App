import { getDb } from '../_utils/db.js';
import { hashPassword, generateToken } from '../_utils/auth.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  try {
     const { firstName, lastName, email, password, role, organization } = req.body;
     
     if (!firstName || !lastName || !email || !password || !role || !organization) {
         return res.status(400).json({error: 'Missing required fields'});
     }

     const db = getDb();
     
     // Check if email exists
     let existing;
     try {
         existing = await db.execute({
            sql: "SELECT id FROM users WHERE email = ?",
            args: [email]
         });
     } catch(err) {
         return res.status(500).json({error: err.message});
     }
     
     if (existing && existing.rows.length > 0) {
        return res.status(400).json({error: 'Email already registered'});
     }
     
     const tx = await db.transaction('write');
     try {
         // Create organization (simplified mapping, creates org for every new user if free text)
         const orgId = `org_${uuidv4().substring(0,8)}`;
         await tx.execute({
             sql: "INSERT INTO organizations (id, name) VALUES (?, ?)",
             args: [orgId, organization]
         });
         
         const userId = `usr_${uuidv4().substring(0,8)}`;
         const hashed = await hashPassword(password);
         
         await tx.execute({
             sql: "INSERT INTO users (id, email, password_hash, first_name, last_name, role, org_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
             args: [userId, email, hashed, firstName, lastName, role, orgId]
         });
         
         await tx.commit();
         
         const user = { id: userId, email, role, first_name: firstName, last_name: lastName, org_id: orgId };
         const token = generateToken(user);
         
         return res.status(201).json({ token, user });
     } catch(e) {
         await tx.rollback();
         throw e;
     }
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

import { getDb } from '../_utils/db.js';
import { requireAuth } from '../_utils/auth.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  
  try {
     const decoded = requireAuth(req);
     if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({error: 'Forbidden: Admin only'});
     }

     const { email, firstName, lastName, role, orgId } = req.body;
     if (!email || !firstName || !lastName) {
        return res.status(400).json({error: 'Missing required fields'});
     }

     const db = getDb();
     
     // Check if user exists
     const existing = await db.execute({
        sql: "SELECT id FROM users WHERE email = ?",
        args: [email]
     });

     if (existing.rows.length > 0) {
        return res.status(400).json({error: 'User with this email already exists'});
     }

     // Use default password
     const defaultPassword = 'Cognify2026';
     const passwordHash = await bcrypt.hash(defaultPassword, 10);
     const userId = `usr_${uuidv4().split('-')[0]}`;

     await db.execute({
        sql: "INSERT INTO users (id, email, password_hash, first_name, last_name, role, org_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [userId, email, passwordHash, firstName, lastName, role || 'therapist', orgId || 'org_demo', 'active']
     });

     return res.status(201).json({ message: 'User invited successfully', userId });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     const db = getDb();
     const result = await db.execute({
        sql: "SELECT id, email, first_name, last_name, role, org_id, status FROM users WHERE id = ?",
        args: [decoded.id]
     });
     
     if (result.rows.length === 0) {
        return res.status(401).json({error: 'User not found'});
     }
     
     return res.status(200).json({ user: result.rows[0] });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

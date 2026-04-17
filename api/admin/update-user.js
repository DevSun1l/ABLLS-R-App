import { getDb } from '../_utils/db.js';
import { requireAuth } from '../_utils/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
     return res.status(405).json({error: 'Method not allowed'});
  }
  
  try {
     const decoded = requireAuth(req);
     if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({error: 'Forbidden: Admin only'});
     }

     const { userId, status } = req.body;
     if (!userId || !status) {
        return res.status(400).json({error: 'Missing userId or status'});
     }

     if (status !== 'active' && status !== 'blocked') {
        return res.status(400).json({error: 'Invalid status. Must be "active" or "blocked"'});
     }

     const db = getDb();
     
     const result = await db.execute({
        sql: "UPDATE users SET status = ? WHERE id = ?",
        args: [status, userId]
     });

     if (result.rowsAffected === 0) {
        return res.status(404).json({error: 'User not found'});
     }

     return res.status(200).json({ message: `User status updated to ${status}` });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

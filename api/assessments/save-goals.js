import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     const { studentId, smartGoals } = req.body;
     const db = getDb();
     
     const existing = await db.execute({
        sql: "SELECT id FROM assessments WHERE student_id = ? ORDER BY created_at DESC LIMIT 1",
        args: [studentId]
     });
     
     if (existing.rows.length > 0) {
        await db.execute({
           sql: "UPDATE assessments SET smart_goals = ? WHERE id = ?",
           args: [JSON.stringify(smartGoals), existing.rows[0].id]
        });
        return res.status(200).json({ success: true });
     } else {
        return res.status(400).json({error: 'No active assessment found'});
     }
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

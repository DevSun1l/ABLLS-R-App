import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     const { studentId, domainsData, status } = req.body;
     const db = getDb();
     
     // Check if there is an active assessment for this student by this assessor
     const existing = await db.execute({
        sql: "SELECT id FROM assessments WHERE student_id = ? AND status = 'in_progress' ORDER BY created_at DESC LIMIT 1",
        args: [studentId]
     });
     
     let assessmentId;
     if (existing.rows.length > 0) {
        assessmentId = existing.rows[0].id;
        await db.execute({
           sql: "UPDATE assessments SET domain_data = ?, status = ?, date = ? WHERE id = ?",
           args: [JSON.stringify(domainsData), status || 'in_progress', new Date().toISOString(), assessmentId]
        });
     } else {
        assessmentId = `ass_${Math.random().toString(36).substring(2,10)}`;
        await db.execute({
           sql: "INSERT INTO assessments (id, student_id, assessor_id, date, domain_data, status) VALUES (?, ?, ?, ?, ?, ?)",
           args: [assessmentId, studentId, decoded.id, new Date().toISOString(), JSON.stringify(domainsData), status || 'in_progress']
        });
     }
     
     return res.status(200).json({ success: true, assessmentId });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

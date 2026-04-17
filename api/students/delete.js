import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({error: 'Method not allowed'});
  
  try {
     const decoded = requireAuth(req);
     if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({error: 'Forbidden: Admin only'});
     }

     const { studentId } = req.body;
     if (!studentId) return res.status(400).json({error: 'Student ID required'});

     const db = getDb();
     
     // Get student name for logging before deletion
     const student = await db.execute({
        sql: "SELECT name FROM students WHERE id = ?",
        args: [studentId]
     });

     if (student.rows.length === 0) {
        return res.status(404).json({error: 'Student not found'});
     }

     const studentName = student.rows[0].name;

     // Delete student and their assessments
     await db.execute({ sql: "DELETE FROM assessments WHERE student_id = ?", args: [studentId] });
     await db.execute({ sql: "DELETE FROM students WHERE id = ?", args: [studentId] });

     // Log the action
     await db.execute({
        sql: "INSERT INTO activity_logs (user_id, action, details, timestamp) VALUES (?, ?, ?, ?)",
        args: [
           decoded.id, 
           'student_deleted', 
           JSON.stringify({ student_id: studentId, student_name: studentName }), 
           new Date().toISOString()
        ]
     });

     return res.status(200).json({ success: true });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

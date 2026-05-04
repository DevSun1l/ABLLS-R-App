import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({error: 'Method not allowed'});
  
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     const { studentId } = req.body;
     if (!studentId) return res.status(400).json({error: 'Student ID required'});

     const db = getDb();
     
     // Get student name for logging before deletion
     const { data: students, error: studentError } = await db
       .from('students')
       .select('id, name, created_by, org_id')
       .eq('id', studentId);

     if (studentError || !students || students.length === 0) {
        return res.status(404).json({error: 'Student not found'});
     }

     const studentRecord = students[0];
     const studentName = studentRecord.name;

     if (decoded.role !== 'admin' && studentRecord.org_id !== decoded.org_id) {
        return res.status(403).json({error: 'Forbidden'});
     }

     // Delete student and their assessments
     await db.from('assessments').delete().eq('student_id', studentId);
     await db.from('students').delete().eq('id', studentId);

     // Log the action
     await db.from('activity_logs').insert({
        user_id: decoded.id, 
        action: 'student_deleted', 
        details: { student_id: studentId, student_name: studentName }, 
        timestamp: new Date().toISOString()
     });

     return res.status(200).json({ success: true });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

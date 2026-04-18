import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  try {
      const decoded = requireAuth(req);
      if (!decoded || decoded.role !== 'admin') return res.status(403).json({error: 'Forbidden: Admin Only'});

      const db = getDb();
     
      // Fetch users with their student counts, assessment counts, and unique students assessed
      const usersResult = await db.execute(`
         SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.org_id, u.status, u.created_at,
         (SELECT COUNT(DISTINCT s.id) FROM students s LEFT JOIN assessments a ON s.id = a.student_id WHERE s.created_by = u.id OR a.assessor_id = u.id) as student_count,
         (SELECT COUNT(*) FROM assessments a WHERE a.assessor_id = u.id) as assessment_count,
         (SELECT COUNT(DISTINCT a.student_id) FROM assessments a WHERE a.assessor_id = u.id) as students_assessed_count
         FROM users u
      `);

      const studentsResult = await db.execute("SELECT id, name, age_years, age_months, org_id, created_at, created_by FROM students");
      const assessmentsResult = await db.execute("SELECT id, student_id, assessor_id, date, domain_data, status, created_at FROM assessments");
      
      // Fetch all logs for the system-wide activity redesigned tab
      const loginLogsResult = await db.execute("SELECT * FROM activity_logs ORDER BY timestamp DESC");
     
      return res.status(200).json({ 
         users: usersResult.rows,
         students: studentsResult.rows,
         assessments: assessmentsResult.rows,
         loginLogs: loginLogsResult.rows
      });
  } catch(e) {
      res.status(500).json({error: e.message});
  }
}

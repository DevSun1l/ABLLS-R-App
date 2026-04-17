import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded || decoded.role !== 'admin') return res.status(403).json({error: 'Forbidden: Admin Only'});

     const db = getDb();
     
     const usersResult = await db.execute("SELECT id, email, first_name, last_name, role, org_id, created_at FROM users");
     const studentsResult = await db.execute("SELECT id, name, age_years, age_months, org_id, created_at FROM students");
     const assessmentsResult = await db.execute("SELECT id, student_id, assessor_id, date, domain_data, status, created_at FROM assessments");
     
     return res.status(200).json({ 
        users: usersResult.rows,
        students: studentsResult.rows,
        assessments: assessmentsResult.rows
     });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

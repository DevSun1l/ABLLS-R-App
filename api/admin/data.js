import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  try {
      const decoded = requireAuth(req);
      if (!decoded || decoded.role !== 'admin') return res.status(403).json({error: 'Forbidden: Admin Only'});

      const db = getDb();
     
      const [usersRes, studentsRes, assessmentsRes, logsRes] = await Promise.all([
         db.from('users').select('id, email, first_name, last_name, role, org_id, status, created_at'),
         db.from('students').select('id, name, age_years, age_months, org_id, created_at, created_by'),
         db.from('assessments').select('id, student_id, assessor_id, date, domain_data, status, created_at'),
         db.from('activity_logs').select('*').order('timestamp', { ascending: false })
      ]);

      if (usersRes.error) throw usersRes.error;
      if (studentsRes.error) throw studentsRes.error;
      if (assessmentsRes.error) throw assessmentsRes.error;
      if (logsRes.error) throw logsRes.error;

      // Aggregating counts manually since Supabase client doesn't support complex subqueries easily
      const users = usersRes.data.map(u => {
         const userAssessments = assessmentsRes.data.filter(a => a.assessor_id === u.id);
         const studentsCreated = studentsRes.data.filter(s => s.created_by === u.id);
         const studentsAssessedIds = new Set(userAssessments.map(a => a.student_id));
         const allRelatedStudentIds = new Set([...studentsCreated.map(s => s.id), ...Array.from(studentsAssessedIds)]);

         return {
            ...u,
            student_count: allRelatedStudentIds.size,
            assessment_count: userAssessments.length,
            students_assessed_count: studentsAssessedIds.size
         };
      });
     
      return res.status(200).json({ 
         users,
         students: studentsRes.data,
         assessments: assessmentsRes.data,
         loginLogs: logsRes.data
      });
  } catch(e) {
      res.status(500).json({error: e.message});
  }
}

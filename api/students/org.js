import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     const db = getDb();
     
     // Fetch students attached to the user's organization
     const studentsResult = await db.execute({
        sql: "SELECT id, name, age_years, age_months, diagnoses, notes, created_at FROM students WHERE org_id = ? ORDER BY created_at DESC",
        args: [decoded.org_id]
     });
     
     const students = studentsResult.rows.map(row => ({
        ...row,
        diagnoses: row.diagnoses ? JSON.parse(row.diagnoses) : [],
        ageYears: row.age_years,
        ageMonths: row.age_months
     }));
     
     return res.status(200).json({ students });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

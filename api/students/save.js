import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     const { id, name, ageYears, ageMonths, diagnoses, notes } = req.body;
     const db = getDb();
     
     const existing = await db.execute({
        sql: "SELECT id FROM students WHERE id = ?",
        args: [id]
     });
     
     if (existing.rows.length > 0) {
        await db.execute({
           sql: "UPDATE students SET name=?, age_years=?, age_months=?, diagnoses=?, notes=? WHERE id=?",
           args: [name, ageYears, ageMonths, JSON.stringify(diagnoses), notes, id]
        });
     } else {
        await db.execute({
           sql: "INSERT INTO students (id, org_id, name, age_years, age_months, diagnoses, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
           args: [id, decoded.org_id, name, ageYears, ageMonths, JSON.stringify(diagnoses), notes]
        });
     }
     
     return res.status(200).json({ success: true, studentId: id });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

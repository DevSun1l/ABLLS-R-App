import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
   if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
   try {
      const decoded = requireAuth(req);
      if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.query;
      const db = getDb();

      const { data: students, error } = await db
         .from('students')
         .select('*')
         .eq('id', id);

      if (error || !students || students.length === 0) {
         return res.status(404).json({ error: "Student not found" });
      }

      const student = students[0];
      student.diagnoses = student.diagnoses || [];

      return res.status(200).json({ student });
   } catch (e) {
      res.status(500).json({ error: e.message });
   }
}

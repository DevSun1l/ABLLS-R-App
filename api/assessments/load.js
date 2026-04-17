import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     // Vercel routes without path logic get query from URL
     const url = new URL(req.url, `http://${req.headers.host}`);
     const studentId = url.searchParams.get('studentId');

     if (!studentId) return res.status(400).json({error: 'Missing studentId'});

     const db = getDb();
     
     const result = await db.execute({
        sql: "SELECT * FROM assessments WHERE student_id = ? ORDER BY created_at DESC LIMIT 1",
        args: [studentId]
     });
     
     if (result.rows.length > 0) {
        const assessment = result.rows[0];
        // Ensure valid JSON mapping for domains
        const parsedDomains = assessment.domain_data ? JSON.parse(assessment.domain_data) : {};
        return res.status(200).json({ assessment: { ...assessment, domain_data: parsedDomains } });
     }
     
     return res.status(200).json({ assessment: null });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     // Parse query from URL
     const url = new URL(req.url, `http://${req.headers.host}`);
     const studentId = url.searchParams.get('studentId');

     if (!studentId) return res.status(400).json({error: 'Missing studentId'});

     const db = getDb();
     
     const { data: assessments, error } = await db
        .from('assessments')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1);
     
     if (error) return res.status(500).json({error: error.message});

     if (assessments && assessments.length > 0) {
        const assessment = assessments[0];
        return res.status(200).json({ assessment });
     }
     
     return res.status(200).json({ assessment: null });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

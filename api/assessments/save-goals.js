import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     const { studentId, smartGoals } = req.body;
     const db = getDb();
     
     const { data: assessments, error: checkError } = await db
        .from('assessments')
        .select('id')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1);

     if (checkError) return res.status(500).json({error: checkError.message});
     
     if (assessments && assessments.length > 0) {
        const { error: updateError } = await db
          .from('assessments')
          .update({ smart_goals: smartGoals })
          .eq('id', assessments[0].id);
          
        if (updateError) return res.status(500).json({error: updateError.message});
        return res.status(200).json({ success: true });
     } else {
        return res.status(400).json({error: 'No active assessment found'});
     }
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

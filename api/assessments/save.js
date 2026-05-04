import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     const { studentId, domainsData, status } = req.body;
     const db = getDb();
     
     // Check if there is an active assessment for this student
     const { data: assessments, error: checkError } = await db
        .from('assessments')
        .select('id')
        .eq('student_id', studentId)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1);

     if (checkError) return res.status(500).json({error: checkError.message});
     
     let assessmentId;
     if (assessments && assessments.length > 0) {
        assessmentId = assessments[0].id;
        const { error: updateError } = await db
          .from('assessments')
          .update({
             domain_data: domainsData,
             status: status || 'in_progress',
             date: new Date().toISOString()
          })
          .eq('id', assessmentId);
        
        if (updateError) return res.status(500).json({error: updateError.message});
     } else {
        assessmentId = `ass_${Math.random().toString(36).substring(2,10)}`;
        const { error: insertError } = await db
          .from('assessments')
          .insert({
             id: assessmentId,
             student_id: studentId,
             assessor_id: decoded.id,
             date: new Date().toISOString(),
             domain_data: domainsData,
             status: status || 'in_progress'
          });

        if (insertError) return res.status(500).json({error: insertError.message});
        
        // Log the action
        await db.from('activity_logs').insert({
           user_id: decoded.id, 
           action: 'assessment_created', 
           details: { assessment_id: assessmentId, student_id: studentId }, 
           timestamp: new Date().toISOString()
        });
     }
     
     return res.status(200).json({ success: true, assessmentId });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

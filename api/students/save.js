import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     const { id, name, ageYears, ageMonths, diagnoses, notes } = req.body;
     const db = getDb();
     
     const { data: existing, error: checkError } = await db
       .from('students')
       .select('id')
       .eq('id', id);

     if (checkError) return res.status(500).json({error: checkError.message});
     
     if (existing && existing.length > 0) {
        const { error: updateError } = await db
          .from('students')
          .update({
             name,
             age_years: ageYears,
             age_months: ageMonths,
             diagnoses,
             notes
          })
          .eq('id', id);
        
        if (updateError) return res.status(500).json({error: updateError.message});
     } else {
        const { error: insertError } = await db
          .from('students')
          .insert({
             id,
             org_id: decoded.org_id,
             created_by: decoded.id,
             name,
             age_years: ageYears,
             age_months: ageMonths,
             diagnoses,
             notes
          });

        if (insertError) return res.status(500).json({error: insertError.message});
        
        // Log the action
        await db.from('activity_logs').insert({
           user_id: decoded.id, 
           action: 'student_created', 
           details: { student_id: id, student_name: name, org_id: decoded.org_id }, 
           timestamp: new Date().toISOString()
        });
     }
     
     return res.status(200).json({ success: true, studentId: id });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

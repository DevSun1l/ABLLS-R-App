import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     const { rating, word_rating, mood, description } = req.body;
     const db = getDb();
     const id = 'fb_' + Math.random().toString(36).substr(2, 9);
     const name = decoded.first_name ? `${decoded.first_name} ${decoded.last_name || ''}` : 'Unknown';
     
     // Insert feedback entry
     const { error: fbError } = await db
       .from('feedback')
       .insert({
          id, 
          user_id: decoded.id, 
          name, 
          assessor_type: decoded.role || 'Therapist', 
          rating, 
          one_word: word_rating, 
          mood, 
          comments: description
       });

     if (fbError) return res.status(500).json({error: fbError.message});

     // Log feedback activity
     await db.from('activity_logs').insert({
        user_id: decoded.id, 
        action: 'feedback_submitted', 
        details: { rating, mood }
     });

     return res.status(200).json({ success: true });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

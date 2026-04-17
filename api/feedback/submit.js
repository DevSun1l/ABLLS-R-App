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
     await db.execute({
        sql: "INSERT INTO feedback (id, user_id, name, assessor_type, rating, one_word, mood, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [id, decoded.id, name, decoded.role || 'Therapist', rating, word_rating, mood, description]
     });

     // Log feedback activity
     await db.execute({
        sql: "INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)",
        args: [decoded.id, 'feedback_submitted', JSON.stringify({ rating, mood })]
     });

     return res.status(200).json({ success: true });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

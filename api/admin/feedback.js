import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  
  try {
     const decoded = requireAuth(req);
     if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({error: 'Forbidden: Admin only'});
     }

     const db = getDb();
     
     // Fetch raw feedback entries
     const feedbackResult = await db.execute("SELECT * FROM feedback ORDER BY created_at DESC");
     
     // Calculate insights
     const entries = feedbackResult.rows;
     const avgRating = entries.length > 0 ? entries.reduce((acc, curr) => acc + (curr.rating || 0), 0) / entries.length : 0;
     
     const moodDistribution = {
        happy: entries.filter(e => e.mood === 'happy').length,
        neutral: entries.filter(e => e.mood === 'neutral').length,
        sad: entries.filter(e => e.mood === 'sad').length
     };

     return res.status(200).json({ 
        entries,
        insights: {
            avgRating,
            moodDistribution,
            totalCount: entries.length
        }
     });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

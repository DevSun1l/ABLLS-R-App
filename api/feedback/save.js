import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  
  try {
     const decoded = requireAuth(req);
     // Note: We allow submission even if not logged in for this demo, 
     // but we capture user id if available.
     
     const { name, assessorType, rating, oneWord, mood, comments } = req.body;
     
     const db = getDb();
     const feedbackId = `fb_${uuidv4().split('-')[0]}`;
     
     const { error } = await db
       .from('feedback')
       .insert({
          id: feedbackId, 
          user_id: decoded?.id || null, 
          name: name || 'Anonymous', 
          assessor_type: assessorType || 'Other', 
          rating: rating || 0, 
          one_word: oneWord || '', 
          mood: mood || '', 
          comments: comments || ''
       });

     if (error) return res.status(500).json({error: error.message});
     
     return res.status(201).json({ success: true, feedbackId });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

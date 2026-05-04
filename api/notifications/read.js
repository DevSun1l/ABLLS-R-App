import { requireAuth } from '../_utils/auth.js';
import { getDb, ensureNotificationsTable } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const decoded = requireAuth(req);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

    const { notificationId } = req.body || {};
    if (!notificationId) return res.status(400).json({ error: 'Missing notificationId' });

    const db = getDb();

    const { error } = await db
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', decoded.id);

    if (error) return res.status(500).json({error: error.message});

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

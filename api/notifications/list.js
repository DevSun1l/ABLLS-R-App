import { requireAuth } from '../_utils/auth.js';
import { getDb, ensureNotificationsTable } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const decoded = requireAuth(req);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

    const db = getDb();

    const { data: notifications, error } = await db
      .from('notifications')
      .select('id, user_id, type, title, message, details, read_at, created_at')
      .eq('user_id', decoded.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return res.status(500).json({error: error.message});

    return res.status(200).json({
      notifications,
      unreadCount: notifications.filter((row) => !row.read_at).length,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

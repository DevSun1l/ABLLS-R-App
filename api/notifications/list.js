import { requireAuth } from '../_utils/auth.js';
import { getDb, ensureNotificationsTable } from '../_utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const decoded = requireAuth(req);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

    const db = getDb();
    await ensureNotificationsTable(db);

    const result = await db.execute({
      sql: `
        SELECT id, user_id, type, title, message, details, read_at, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT 20
      `,
      args: [decoded.id],
    });

    return res.status(200).json({
      notifications: result.rows,
      unreadCount: result.rows.filter((row) => !row.read_at).length,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

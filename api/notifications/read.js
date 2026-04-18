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
    await ensureNotificationsTable(db);

    await db.execute({
      sql: `
        UPDATE notifications
        SET read_at = COALESCE(read_at, ?)
        WHERE id = ? AND user_id = ?
      `,
      args: [new Date().toISOString(), notificationId, decoded.id],
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

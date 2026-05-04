import { requireAuth } from '../_utils/auth.js';
import { getDb, ensureNotificationsTable } from '../_utils/db.js';

const parseDetails = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const decoded = requireAuth(req);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

    const db = getDb();

    const [logsResult, studentsResult, notificationsResult] = await Promise.all([
      db
        .from('activity_logs')
        .select(`
          id,
          user_id,
          action,
          details,
          timestamp,
          users (
            first_name,
            last_name,
            role,
            org_id
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(50),
      db.from('students').select('id, name, org_id'),
      db
        .from('notifications')
        .select('id, type, title, message, details, read_at, created_at')
        .eq('user_id', decoded.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (logsResult.error) throw logsResult.error;
    if (studentsResult.error) throw studentsResult.error;
    if (notificationsResult.error) throw notificationsResult.error;

    const studentsById = new Map(
      studentsResult.data.map((student) => [student.id, student])
    );

    const activity = logsResult.data
      .map(log => ({
         ...log,
         first_name: log.users?.first_name,
         last_name: log.users?.last_name,
         role: log.users?.role,
         org_id: log.users?.org_id
      }))
      .filter((log) => {
        const details = parseDetails(log.details);
        const student = details.student_id ? studentsById.get(details.student_id) : null;
        return (
          log.user_id === decoded.id ||
          log.org_id === decoded.org_id ||
          student?.org_id === decoded.org_id
        );
      })
      .slice(0, 20)
      .map((log) => {
        const details = parseDetails(log.details);
        const actorName = [log.first_name, log.last_name].filter(Boolean).join(' ') || 'A team member';
        const student = details.student_id ? studentsById.get(details.student_id) : null;

        switch (log.action) {
          case 'login':
            return {
              id: log.id,
              action: log.action,
              timestamp: log.timestamp,
              title: 'User logged in',
              message: `${actorName} signed in to Cognify.`,
              icon: 'login',
              accent: 'primary',
            };
          case 'student_created':
            return {
              id: log.id,
              action: log.action,
              timestamp: log.timestamp,
              title: 'New student added',
              message: `${actorName} added ${details.student_name || 'a student'} to the caseload.`,
              icon: 'person_add',
              accent: 'secondary',
            };
          case 'assessment_created':
            return {
              id: log.id,
              action: log.action,
              timestamp: log.timestamp,
              title: 'Assessment started',
              message: `${actorName} created an assessment for ${student?.name || 'a student'}.`,
              icon: 'assignment_turned_in',
              accent: 'tertiary',
            };
          case 'feedback_submitted':
            return {
              id: log.id,
              action: log.action,
              timestamp: log.timestamp,
              title: 'Feedback submitted',
              message: `${actorName} submitted platform feedback.`,
              icon: 'rate_review',
              accent: 'success',
            };
          case 'admin_promoted':
            return {
              id: log.id,
              action: log.action,
              timestamp: log.timestamp,
              title: 'Admin access granted',
              message: `${actorName} was promoted to admin access.`,
              icon: 'admin_panel_settings',
              accent: 'warning',
            };
          default:
            return {
              id: log.id,
              action: log.action,
              timestamp: log.timestamp,
              title: 'System activity',
              message: `${actorName} triggered ${log.action}.`,
              icon: 'history',
              accent: 'neutral',
            };
        }
      });

    return res.status(200).json({
      activity,
      notifications: notificationsResult.data,
      unreadCount: notificationsResult.data.filter((row) => !row.read_at).length,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

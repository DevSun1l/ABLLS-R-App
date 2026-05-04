export const parseDetails = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

export const transformActivityLogs = (logs, studentsById) => {
  return logs.map((log) => {
    const details = parseDetails(log.details);
    const user = log.users || {};
    const actorName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'A team member';
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
};

import { requireAuth } from '../_utils/auth.js';
import { getDb } from '../_utils/db.js';

const computeDomainScore = (domainData) => {
  if (!domainData || !domainData.skills) return 0;

  let score = 0;
  let totalScoreable = 0;
  for (const skillCode in domainData.skills) {
    const value = domainData.skills[skillCode];
    if (value === 'not_assessed') continue;
    totalScoreable += 1;
    if (value === 'yes') score += 1;
    if (value === 'sometimes') score += 0.5;
  }

  if (!totalScoreable) return 0;
  return Math.round((score / totalScoreable) * 100);
};

const computeOverallMastery = (domains) => {
  if (!domains) return 0;
  const entries = Object.values(domains);
  if (!entries.length) return 0;
  const total = entries.reduce((sum, domainData) => sum + computeDomainScore(domainData), 0);
  return Math.round(total / entries.length);
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  try {
     const decoded = requireAuth(req);
     if (!decoded) return res.status(401).json({error: 'Unauthorized'});

     const db = getDb();
     
     // Fetch students attached to the user's organization
     const studentsResult = await db.execute({
        sql: "SELECT id, name, age_years, age_months, diagnoses, notes, created_at, created_by FROM students WHERE org_id = ? ORDER BY created_at DESC",
        args: [decoded.org_id]
     });

     const assessmentsResult = await db.execute({
        sql: `
          SELECT student_id, domain_data, status, created_at
          FROM assessments
          WHERE student_id IN (SELECT id FROM students WHERE org_id = ?)
          ORDER BY datetime(created_at) DESC
        `,
        args: [decoded.org_id]
     });

     const latestAssessmentByStudent = new Map();
     const assessmentCountByStudent = new Map();
     assessmentsResult.rows.forEach((row) => {
        assessmentCountByStudent.set(
          row.student_id,
          (assessmentCountByStudent.get(row.student_id) || 0) + 1
        );
        if (!latestAssessmentByStudent.has(row.student_id)) {
          latestAssessmentByStudent.set(row.student_id, row);
        }
     });

     const students = studentsResult.rows.map(row => {
        const latestAssessment = latestAssessmentByStudent.get(row.id);
        const domains = latestAssessment?.domain_data
          ? (typeof latestAssessment.domain_data === 'string' ? JSON.parse(latestAssessment.domain_data) : latestAssessment.domain_data)
          : {};

        return {
        ...row,
        diagnoses: row.diagnoses ? JSON.parse(row.diagnoses) : [],
        ageYears: row.age_years,
        ageMonths: row.age_months,
        domains,
        masteryPercent: latestAssessment ? computeOverallMastery(domains) : undefined,
        assessmentCount: assessmentCountByStudent.get(row.id) || 0,
        hasAssessment: Boolean(latestAssessment),
        latestAssessmentStatus: latestAssessment?.status || null,
        };
     });
     
     return res.status(200).json({ students });
  } catch(e) {
     res.status(500).json({error: e.message});
  }
}

import type { DbIntervention, InterventionAction, InterventionStatusDb } from '../../types/schema';
import { calculateStudentRisk } from '../../engines/riskEngine';
import { generateInterventionRecommendation } from '../../engines/interventionEngine';
import { mulberry32, randChoice, randInt, type Rng } from '../random';
import { SUBJECTS, TEACHERS, subjectById } from './config';
import { ASSESSMENTS } from './assessments';
import { academicResults, students } from './students';
import { attendance } from './attendance';

const OBJECTIVE_BY_ACTION: Record<string, string> = {
  'Academic Rescue': 'Bring failing subjects back to at least a passing grade within one term',
  'Attendance Intervention': 'Restore attendance to above 90% within one term',
  'Subject Coaching': 'Close the gap in the single failing subject before the next assessment',
  'Parent Engagement': 'Establish a joint home-school support plan',
  Mentoring: 'Reverse the declining performance trend with regular check-ins',
  'Peer Support': 'Build consistent study habits through structured peer support',
  'STEM Rescue': 'Recover Mathematics/Science fundamentals to remain STEM-eligible',
  'Career Guidance': 'Clarify a post-SPM pathway aligned to strengths',
};

const STRATEGY_BY_ACTION: Record<string, string> = {
  'Academic Rescue': 'Daily subject clinics with the subject teacher, weekly progress review',
  'Attendance Intervention': 'Guardian notification after each absence, home visit if unresolved after 2 weeks',
  'Subject Coaching': 'Twice-weekly after-school coaching sessions',
  'Parent Engagement': 'Monthly parent-teacher meeting with a shared tracking sheet',
  Mentoring: 'Assigned senior-teacher mentor with fortnightly check-ins',
  'Peer Support': 'Paired with a high-performing peer for structured study sessions',
  'STEM Rescue': 'Targeted Mathematics/Science bootcamp sessions twice weekly',
  'Career Guidance': 'Counselling sessions mapping interests to SPM stream and post-SPM options',
};

// DbIntervention.status is PLANNED/ACTIVE/COMPLETED/CLOSED — a case's
// urgency is carried by risk_level, not by inventing extra status values.
function pickStatus(rng: Rng, priority: string): InterventionStatusDb {
  if (priority === 'P1') return rng() < 0.8 ? 'ACTIVE' : 'PLANNED';
  const roll = rng();
  if (roll < 0.55) return 'ACTIVE';
  if (roll < 0.9) return 'COMPLETED';
  return 'PLANNED';
}

const rng = mulberry32(20260404);
const interventions: DbIntervention[] = [];
const interventionActions: InterventionAction[] = [];

let counter = 0;

for (const student of students) {
  const latestResults = academicResults.filter((r) => r.student_id === student.id && r.assessment_id === ASSESSMENTS[1].id);
  const previousResults = academicResults.filter((r) => r.student_id === student.id && r.assessment_id === ASSESSMENTS[0].id);
  const attendanceRecords = attendance.filter((a) => a.student_id === student.id);

  const risk = calculateStudentRisk({ studentId: student.id, latestResults, previousResults, attendanceRecords, subjects: SUBJECTS });
  const failingSubjectNames = latestResults.filter((r) => r.grade === 'G').map((r) => subjectById(r.subject_id).name);
  const recommendation = generateInterventionRecommendation({ studentId: student.id, form: student.form, risk, failingSubjectNames });

  if (!recommendation.shouldIntervene || recommendation.actions.length === 0) continue;

  counter++;
  const id = `int-${String(counter).padStart(4, '0')}`;
  const category = recommendation.actions[0];
  const teacher = randChoice(rng, TEACHERS);
  const status = pickStatus(rng, recommendation.priority);
  const startMonth = randInt(rng, 1, 6);

  interventions.push({
    id,
    student_id: student.id,
    category,
    risk_level: risk.risk_level,
    problem: risk.reasons[0],
    objective: OBJECTIVE_BY_ACTION[category],
    strategy: STRATEGY_BY_ACTION[category],
    teacher_id: teacher.id,
    start_date: `2026-${String(startMonth).padStart(2, '0')}-${String(randInt(rng, 1, 28)).padStart(2, '0')}`,
    target_date: `2026-${String(Math.min(11, startMonth + 4)).padStart(2, '0')}-28`,
    status,
    outcome: status === 'COMPLETED' ? 'Target grade/attendance threshold met' : null,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-10-20T00:00:00Z',
  });

  const actionCount = status === 'COMPLETED' ? 3 : status === 'PLANNED' ? 1 : randInt(rng, 1, 2);
  for (let i = 0; i < actionCount; i++) {
    interventionActions.push({
      id: `${id}-act-${i + 1}`,
      intervention_id: id,
      action_date: `2026-${String(Math.min(10, startMonth + i)).padStart(2, '0')}-15`,
      action: `${category} session ${i + 1}`,
      person_in_charge: teacher.name,
      result: i === actionCount - 1 && status === 'COMPLETED' ? 'Improved; case closed successfully' : 'In progress; continue as planned',
      next_action: i === actionCount - 1 && status === 'COMPLETED' ? 'Transition to standard monitoring' : 'Follow-up session next cycle',
    });
  }
}

export { interventions, interventionActions };

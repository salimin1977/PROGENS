// Intervention Engine — turns a risk assessment into a concrete
// recommendation. This is advisory: it proposes actions and a priority,
// it does not itself create an intervention case record.

import type { ReapPriority } from '../types/schema';
import type { StudentRiskAssessment } from './riskEngine';

export type InterventionAction =
  | 'Academic Rescue'
  | 'Attendance Intervention'
  | 'Subject Coaching'
  | 'Parent Engagement'
  | 'Mentoring'
  | 'Peer Support'
  | 'STEM Rescue'
  | 'Career Guidance';

export interface InterventionRecommendation {
  studentId: string;
  shouldIntervene: boolean;
  priority: ReapPriority | 'NONE';
  actions: InterventionAction[];
  rationale: string[];
}

const STEM_SUBJECT_PATTERN = /math|matematik|sains|fizik|kimia|biologi|science/i;

const PRIORITY_BY_RISK: Record<StudentRiskAssessment['risk_level'], ReapPriority | 'NONE'> = {
  CRITICAL: 'P1',
  HIGH: 'P2',
  MEDIUM: 'P3',
  LOW: 'NONE',
};

export interface GenerateInterventionInput {
  studentId: string;
  form: 1 | 2 | 3 | 4 | 5;
  risk: StudentRiskAssessment;
  failingSubjectNames: string[];
}

export function generateInterventionRecommendation(input: GenerateInterventionInput): InterventionRecommendation {
  const { studentId, form, risk, failingSubjectNames } = input;
  const actions = new Set<InterventionAction>();

  if (risk.risk_level === 'CRITICAL') {
    actions.add('Academic Rescue');
    actions.add('Parent Engagement');
  }

  if (risk.attendanceRate < 90) {
    actions.add('Attendance Intervention');
  }

  const stemFailures = failingSubjectNames.filter((name) => STEM_SUBJECT_PATTERN.test(name));
  if (stemFailures.length > 0) {
    actions.add('STEM Rescue');
  } else if (failingSubjectNames.length === 1 && risk.risk_level !== 'CRITICAL') {
    actions.add('Subject Coaching');
  }

  if (risk.risk_level === 'MEDIUM' && risk.trendDelta > 0) {
    actions.add('Mentoring');
  }

  if (risk.risk_level === 'HIGH' && actions.size === 0) {
    actions.add('Peer Support');
  }

  if (form === 5 && (risk.risk_level === 'HIGH' || risk.risk_level === 'CRITICAL')) {
    actions.add('Career Guidance');
  }

  const shouldIntervene = risk.risk_level !== 'LOW' || actions.size > 0;

  return {
    studentId,
    shouldIntervene,
    priority: PRIORITY_BY_RISK[risk.risk_level],
    actions: Array.from(actions),
    rationale: risk.reasons,
  };
}

import type { Intervention, InterventionStatus } from '../types';
import { students } from './students';
import { mulberry32, randChoice, randInt } from './random';

const PROBLEMS: Record<string, string[]> = {
  academic: [
    'Consistently below mastery level in core subjects',
    'Declining performance across two consecutive terms',
    'Significant gap between class average and individual score',
    'Difficulty grasping Mathematics fundamentals',
    'Low engagement in Science practical work',
  ],
  attendance: [
    'Chronic absenteeism affecting academic continuity',
    'Frequent late arrivals disrupting learning routine',
    'Extended unexplained absences flagged by form teacher',
  ],
  behavioural: [
    'Low classroom engagement and participation',
    'Social-emotional challenges affecting focus',
    'Requires motivational and mentoring support',
  ],
};

const INTERVENTION_TYPES = [
  'Peer Mentoring Programme',
  'Subject Booster Class',
  'Counselling Support',
  'Parent-Teacher Engagement Plan',
  'Attendance Recovery Plan',
  'Personalised Learning Plan',
  'STEM Rescue Bootcamp',
  'Homeroom Check-in Schedule',
];

const TEACHERS = [
  'Pn. Rohana Ibrahim', 'En. Muthu Kumaran', 'Cik Ling Wei Yee', 'En. Zulfadli Aziz',
  'Pn. Kavitha Rajan', 'En. Chong Boon Hock', 'Pn. Nurul Huda', 'Cik Tan Mei Yin',
  'En. Faizal Rashid', 'Pn. Anitha Selvam',
];

const NEXT_ACTIONS: Record<InterventionStatus, string[]> = {
  Critical: ['Escalate to counselling unit this week', 'Schedule urgent parent meeting', 'Assign dedicated subject tutor'],
  Active: ['Continue weekly progress check-ins', 'Review mid-cycle assessment results', 'Adjust learning plan based on feedback'],
  Monitoring: ['Monthly progress review with form teacher', 'Track attendance pattern for 4 more weeks', 'Reassess in next PPT meeting'],
  Completed: ['Close case and archive record', 'Transition to standard monitoring', 'Celebrate milestone with student'],
};

const rng = mulberry32(30260101);

function pickProblem(riskLevel: string): string {
  const bucket = rng() < 0.5 ? 'academic' : rng() < 0.5 ? 'attendance' : 'behavioural';
  const list = PROBLEMS[bucket];
  return riskLevel === 'Critical' ? list[0] : randChoice(rng, list);
}

const candidates = students.filter((s) => s.riskLevel === 'Critical' || s.riskLevel === 'High' || (s.riskLevel === 'Moderate' && rng() < 0.25));

export const interventions: Intervention[] = candidates.map((student, index) => {
  let status: InterventionStatus;
  if (student.riskLevel === 'Critical') status = rng() < 0.6 ? 'Critical' : 'Active';
  else if (student.riskLevel === 'High') status = randChoice(rng, ['Active', 'Active', 'Monitoring']);
  else status = randChoice(rng, ['Monitoring', 'Completed']);

  const progress = status === 'Completed' ? 100 : status === 'Critical' ? randInt(rng, 5, 25) : status === 'Active' ? randInt(rng, 30, 70) : randInt(rng, 60, 95);

  return {
    id: `INT-${String(index + 1).padStart(3, '0')}`,
    studentId: student.id,
    studentName: student.name,
    className: student.className,
    problem: pickProblem(student.riskLevel),
    interventionType: randChoice(rng, INTERVENTION_TYPES),
    teacher: randChoice(rng, TEACHERS),
    startDate: `2026-0${randInt(rng, 1, 6)}-${String(randInt(rng, 1, 28)).padStart(2, '0')}`,
    status,
    progress,
    nextAction: randChoice(rng, NEXT_ACTIONS[status]),
    priority: student.riskLevel,
  };
});

export const interventionSummary = {
  notStarted: students.filter((s) => (s.riskLevel === 'Critical' || s.riskLevel === 'High') && !interventions.some((i) => i.studentId === s.id)).length,
  active: interventions.filter((i) => i.status === 'Active').length,
  completed: interventions.filter((i) => i.status === 'Completed').length,
  monitoring: interventions.filter((i) => i.status === 'Monitoring').length,
  critical: interventions.filter((i) => i.status === 'Critical').length,
};

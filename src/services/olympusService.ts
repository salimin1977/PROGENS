import type { KpiTarget } from '../types';
import type { TrafficLight } from '../types/schema';
import { calculateKpiStatus } from '../engines/kpiEngine';
import { isExcellentStudent } from '../engines/academicEngine';
import { getAcademicOverview } from './academicService';
import { getAttendanceOverview } from './attendanceService';
import { getInterventionSummary } from './interventionService';
import { loadCoreDataset } from './dataset';
import { buildRiskLookup } from './riskLookup';

const TRAFFIC_LIGHT: Record<ReturnType<typeof calculateKpiStatus>, TrafficLight> = {
  ACHIEVED: 'GREEN',
  ON_TRACK: 'AMBER',
  ATTENTION: 'RED',
};

function buildItem(
  id: string,
  category: KpiTarget['category'],
  label: string,
  current: number,
  target: number,
  unit: KpiTarget['unit'],
  higherIsBetter: boolean
): KpiTarget {
  const kpiUnit = unit === 'pts' ? 'count' : unit;
  const status = calculateKpiStatus(current, target, higherIsBetter, kpiUnit);
  return { id, category, label, current, target, unit, higherIsBetter, trafficLight: TRAFFIC_LIGHT[status] };
}

export async function getExecutiveScorecard(): Promise<KpiTarget[]> {
  const [dataset, academic, attendance, interventionSummary] = await Promise.all([
    loadCoreDataset(),
    getAcademicOverview(),
    getAttendanceOverview(),
    getInterventionSummary(),
  ]);
  const riskLookup = buildRiskLookup(dataset);

  const atRisk = dataset.students.filter((s) => ['CRITICAL', 'HIGH'].includes(riskLookup.get(s.id)?.risk_level ?? '')).length;
  const excellenceTrack = dataset.students.filter((s) =>
    isExcellentStudent(dataset.latestResults.filter((r) => r.student_id === s.id))
  ).length;

  const totalInterventionCases = interventionSummary.planned + interventionSummary.active + interventionSummary.completed + interventionSummary.closed;
  const completionRate = totalInterventionCases ? Math.round((interventionSummary.completed / totalInterventionCases) * 1000) / 10 : 0;

  const teacherCoverage = dataset.teachers.length
    ? Math.round((new Set(dataset.interventions.map((i) => i.teacher_id)).size / dataset.teachers.length) * 1000) / 10
    : 0;

  return [
    buildItem('acad-gps', 'Academic', 'GPS (Gred Purata Sekolah)', academic.gpsCurrent, academic.gpsTarget, 'gps', false),
    buildItem('acad-pass', 'Academic', 'Overall Pass Rate', academic.passRate, academic.passRateTarget, '%', true),
    buildItem('student-risk', 'Student', 'Students At Risk', atRisk, Math.round(dataset.students.length * 0.1), 'count', false),
    buildItem('student-excellence', 'Student', 'Students on Excellence Track', excellenceTrack, Math.round(dataset.students.length * 0.15), 'count', true),
    buildItem('teacher-coverage', 'Teacher', 'Teacher Intervention Coverage', teacherCoverage, 90, '%', true),
    buildItem('attendance-rate', 'Attendance', 'School Attendance Rate', attendance.overallRate, attendance.target, '%', true),
    buildItem('intervention-completion', 'Intervention', 'Intervention Completion Rate', completionRate, 80, '%', true),
    buildItem('talent-participation', 'Talent', 'Talent Programme Participation', 65, 65, '%', true),
  ];
}

import { getAcademicOverview } from './academicService';
import { getAttendanceOverview } from './attendanceService';
import { getInterventionSummary } from './interventionService';
import { getStemOverview } from './stemService';
import { loadCoreDataset } from './dataset';
import { buildRiskLookup } from './riskLookup';

export interface CommandKpis {
  totalStudents: number;
  academicPerformance: number;
  attendance: number;
  studentsAtRisk: number;
  interventionActive: number;
  stemPipeline: number;
}

export interface StrategicOverview {
  overallProgress: number;
  academic: number;
  attendance: number;
  intervention: number;
  talent: number;
}

export async function getCommandKpis(): Promise<CommandKpis> {
  const [dataset, academic, attendance, interventionSummary, stem] = await Promise.all([
    loadCoreDataset(),
    getAcademicOverview(),
    getAttendanceOverview(),
    getInterventionSummary(),
    getStemOverview(),
  ]);

  return {
    totalStudents: dataset.students.length,
    academicPerformance: academic.passRate,
    attendance: attendance.overallRate,
    studentsAtRisk: interventionSummary.criticalStudents + interventionSummary.highRiskStudents,
    interventionActive: interventionSummary.active + interventionSummary.planned,
    stemPipeline: stem.kpis.totalCandidates,
  };
}

export async function getStrategicOverview(): Promise<StrategicOverview> {
  const [dataset, academic, attendance] = await Promise.all([loadCoreDataset(), getAcademicOverview(), getAttendanceOverview()]);
  const riskLookup = buildRiskLookup(dataset);

  const atRiskStudents = dataset.students.filter((s) => {
    const level = riskLookup.get(s.id)?.risk_level;
    return level === 'CRITICAL' || level === 'HIGH';
  });
  const coveredByIntervention = atRiskStudents.filter((s) => dataset.interventions.some((i) => i.student_id === s.id));
  const interventionCoverage = atRiskStudents.length ? Math.round((coveredByIntervention.length / atRiskStudents.length) * 100) : 100;

  const talentParticipation = 65; // placeholder proxy until a talent-tracking table exists

  const academicScore = Math.round(academic.passRate);
  const attendanceScore = Math.round(attendance.overallRate);
  const overallProgress = Math.round((academicScore + attendanceScore + interventionCoverage + talentParticipation) / 4);

  return { overallProgress, academic: academicScore, attendance: attendanceScore, intervention: interventionCoverage, talent: talentParticipation };
}

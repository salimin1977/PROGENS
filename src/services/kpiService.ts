import { getAcademicOverview, type AcademicOverview } from './academicService';
import { getAttendanceOverview, type AttendanceOverview } from './attendanceService';
import { getInterventionSummary, type InterventionSummary } from './interventionService';
import { getStemOverview, type StemOverview } from './stemService';
import { loadCoreDataset } from './dataset';
import { buildRiskLookup } from './riskLookup';
import { isExcellentStudent } from '../engines/academicEngine';

export interface CommandKpis {
  totalStudents: number;
  academicPerformance: number;
  attendance: number;
  studentsAtRisk: number;
  interventionActive: number;
  stemPipeline: number;
  /** "Murid Cemerlang" — students whose latest assessment is A- or better in every subject. */
  excellentStudents: number;
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

  const excellentStudents = dataset.students.filter((s) =>
    isExcellentStudent(dataset.latestResults.filter((r) => r.student_id === s.id))
  ).length;

  return {
    totalStudents: dataset.students.length,
    academicPerformance: academic.passRate,
    attendance: attendance.overallRate,
    studentsAtRisk: interventionSummary.criticalStudents + interventionSummary.highRiskStudents,
    interventionActive: interventionSummary.active + interventionSummary.planned,
    stemPipeline: stem.kpis.totalCandidates,
    excellentStudents,
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

// --- Named per-domain KPI accessors -----------------------------------
// Thin wrappers over the domain services/engines — each domain's KPIs
// are computed exactly once (in that domain's service), never
// re-derived here.

export interface SchoolKpis {
  gpsSemasa: number;
  gpsSasaran: number;
  jurang: number;
  jumlahMurid: number;
  muridBerisiko: number;
  intervensiAktif: number;
  kehadiran: number;
  muridCemerlang: number;
}

/** The 8 named strategic KPIs: GPS Semasa/Sasaran/Jurang, Jumlah Murid, Murid Berisiko, Intervensi Aktif, Kehadiran, Murid Cemerlang. */
export async function getSchoolKPIs(): Promise<SchoolKpis> {
  const [command, academic] = await Promise.all([getCommandKpis(), getAcademicOverview()]);
  return {
    gpsSemasa: academic.gpsCurrent,
    gpsSasaran: academic.gpsTarget,
    jurang: academic.gpsGap,
    jumlahMurid: command.totalStudents,
    muridBerisiko: command.studentsAtRisk,
    intervensiAktif: command.interventionActive,
    kehadiran: command.attendance,
    muridCemerlang: command.excellentStudents,
  };
}

export async function getAcademicKPIs(): Promise<AcademicOverview> {
  return getAcademicOverview();
}

export async function getAttendanceKPIs(): Promise<AttendanceOverview> {
  return getAttendanceOverview();
}

export async function getInterventionKPIs(): Promise<InterventionSummary> {
  return getInterventionSummary();
}

export async function getSTEMKPIs(): Promise<StemOverview['kpis']> {
  const stem = await getStemOverview();
  return stem.kpis;
}

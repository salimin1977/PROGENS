import type { AcademicResult, AttendanceRecord, GROWProfile, REAPProfile, SEEDSProfile, RiskLevel, Student } from '../types';
import { selectLatestAssessmentResults } from './bottleneckEngine';

export interface Phase5Student {
  student: Student;
  seeds?: SEEDSProfile;
  grow?: GROWProfile;
  reap?: REAPProfile;
  absentDays: number;
}

export interface Phase5Summary {
  seeds: { total: number; foundation: number; developing: number; promising: number; highPotential: number; elite: number };
  grow: { total: number; average: number; watchlist: number; assessed: number };
  reap: { total: number; average: number; p1: number; p2: number; p3: number; assessed: number };
  students: Phase5Student[];
}

const round = (value: number, digits = 1) => Number(value.toFixed(digits));

function academicScore(results: AcademicResult[]): number {
  if (!results.length) return 0;
  return round(results.reduce((sum, r) => sum + (r.marks / r.maximumMarks) * 100, 0) / results.length);
}

function resultsByStudent(results: AcademicResult[]): Map<string, AcademicResult[]> {
  const map = new Map<string, AcademicResult[]>();
  for (const result of selectLatestAssessmentResults(results)) {
    const list = map.get(result.studentId) ?? [];
    list.push(result);
    map.set(result.studentId, list);
  }
  return map;
}

function absenceMap(attendance: AttendanceRecord[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const record of attendance) map.set(record.studentId, Math.max(map.get(record.studentId) ?? 0, record.absentDays));
  return map;
}

function seedsProfile(score: number, absentDays: number): SEEDSProfile {
  const adjusted = Math.max(0, score - (absentDays >= 20 ? 8 : absentDays >= 10 ? 4 : 0));
  const level: SEEDSProfile['level'] = adjusted >= 90 ? 'ELITE' : adjusted >= 80 ? 'HIGH_POTENTIAL' : adjusted >= 70 ? 'PROMISING' : adjusted >= 55 ? 'DEVELOPING' : 'FOUNDATION';
  const reasons = [`Academic index ${round(score)}`];
  if (absentDays > 0) reasons.push(`${absentDays} hari tidak hadir dalam ringkasan sumber`);
  if (absentDays >= 10) reasons.push('Kehadiran ialah signal risiko perkembangan');
  return { level, score: round(adjusted), reasons, nextAction: level === 'ELITE' || level === 'HIGH_POTENTIAL' ? 'Sustain + enrichment' : level === 'PROMISING' ? 'Targeted development' : 'Focused foundational support' };
}

function growProfile(results: AcademicResult[], risk: RiskLevel): GROWProfile {
  const ranked = [...results].sort((a, b) => b.marks / b.maximumMarks - a.marks / a.maximumMarks);
  const strength = ranked.slice(0, 3).map((r) => `${r.subject} ${round((r.marks / r.maximumMarks) * 100)}`);
  const gap = ranked.filter((r) => (r.marks / r.maximumMarks) * 100 < 65).sort((a, b) => a.marks / a.maximumMarks - b.marks / b.maximumMarks).slice(0, 3).map((r) => `${r.subject} ${round((r.marks / r.maximumMarks) * 100)}`);
  const score = academicScore(results);
  const target = score >= 75 ? 'Maintain ≥75 and deepen strengths' : 'Raise academic index to ≥75';
  return { strength, gap, target, action: risk === 'Critical' || risk === 'High' ? 'Priority intervention on largest subject gaps' : gap.length ? 'Target the lowest subject gaps first' : 'Enrichment and sustained progress' };
}

function reapProfile(results: AcademicResult[], risk: RiskLevel, absentDays: number, intervention: string): REAPProfile {
  const current = academicScore(results);
  const target = 75;
  const gap = round(Math.max(0, target - current));
  const priority: REAPProfile['priority'] = risk === 'Critical' || risk === 'High' ? 'P1' : risk === 'Moderate' || absentDays >= 10 ? 'P2' : 'P3';
  const readiness = Math.max(0, Math.min(100, round(current - (absentDays >= 20 ? 10 : absentDays >= 10 ? 5 : 0))));
  return { current, target, gap, risk, priority, intervention, spmReadiness: readiness };
}

/** Pure Phase 5 transformation. No fabricated attendance percentage or talent/career data. */
export function buildPhase5Summary(students: Student[], results: AcademicResult[], attendance: AttendanceRecord[], interventions: import('../types').Intervention[]): Phase5Summary {
  const resultMap = resultsByStudent(results);
  const absentMap = absenceMap(attendance);
  const interventionMap = new Map<string, string>();
  for (const item of interventions) {
    if (!interventionMap.has(item.studentId) && item.status !== 'Completed') interventionMap.set(item.studentId, item.interventionType || item.problem || 'Active intervention');
  }

  const rows = students.map((student) => {
    const studentResults = resultMap.get(student.id) ?? [];
    const absentDays = absentMap.get(student.id) ?? 0;
    const risk = student.riskLevel;
    const row: Phase5Student = { student, absentDays };
    if (student.form === 'Tingkatan 1' || student.form === 'Tingkatan 2' || student.form === 'Tingkatan 3') row.seeds = seedsProfile(academicScore(studentResults), absentDays);
    if (student.form === 'Tingkatan 4') row.grow = growProfile(studentResults, risk);
    if (student.form === 'Tingkatan 5') row.reap = reapProfile(studentResults, risk, absentDays, interventionMap.get(student.id) ?? 'Needs intervention assignment');
    return row;
  });

  const seedsRows = rows.filter((r) => r.seeds);
  const growRows = rows.filter((r) => r.grow);
  const reapRows = rows.filter((r) => r.reap);
  const countLevel = (level: SEEDSProfile['level']) => seedsRows.filter((r) => r.seeds?.level === level).length;
  const avg = (values: number[]) => values.length ? round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  return {
    seeds: { total: seedsRows.length, foundation: countLevel('FOUNDATION'), developing: countLevel('DEVELOPING'), promising: countLevel('PROMISING'), highPotential: countLevel('HIGH_POTENTIAL'), elite: countLevel('ELITE') },
    grow: { total: growRows.length, average: avg(growRows.map((r) => r.student.academicScore).filter((x) => x > 0)), watchlist: growRows.filter((r) => r.student.riskLevel === 'Critical' || r.student.riskLevel === 'High').length, assessed: growRows.filter((r) => (resultMap.get(r.student.id)?.length ?? 0) > 0).length },
    reap: { total: reapRows.length, average: avg(reapRows.map((r) => r.reap?.current ?? 0).filter((x) => x > 0)), p1: reapRows.filter((r) => r.reap?.priority === 'P1').length, p2: reapRows.filter((r) => r.reap?.priority === 'P2').length, p3: reapRows.filter((r) => r.reap?.priority === 'P3').length, assessed: reapRows.filter((r) => (resultMap.get(r.student.id)?.length ?? 0) > 0).length },
    students: rows,
  };
}

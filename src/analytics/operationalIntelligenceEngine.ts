import type { AcademicResult, AttendanceRecord, Intervention, RiskLevel, Student } from '../types';
import { selectLatestAssessmentResults } from './bottleneckEngine';

export type OperationalAction = 'OPEN_INTERVENTION' | 'REVIEW_ATTENDANCE' | 'REVIEW_ACADEMIC' | 'MONITOR_PROGRESS' | 'NO_ACTION';
export interface OperationalSignal { studentId: string; studentName: string; className: string; riskLevel: RiskLevel; score: number; reasons: string[]; action: OperationalAction; }
export interface InterventionOutcomeSummary { total: number; active: number; monitoring: number; completed: number; critical: number; averageProgress: number | null; studentsWithCases: number; }
export interface OperationalIntelligenceSummary { totalStudents: number; assessedStudents: number; coverage: number; signals: OperationalSignal[]; intervention: InterventionOutcomeSummary; }

const RISK_SCORE: Record<RiskLevel, number> = { Critical: 40, High: 30, Moderate: 15, Low: 0, Unassessed: 20 };
const average = (values: number[]): number | null => values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null;

export function buildOperationalIntelligenceSummary(students: Student[], results: AcademicResult[], attendance: AttendanceRecord[], interventions: Intervention[]): OperationalIntelligenceSummary {
  const latest = selectLatestAssessmentResults(results);
  const academic = new Map<string, number[]>();
  latest.forEach((r) => { if (r.maximumMarks > 0) academic.set(r.studentId, [...(academic.get(r.studentId) ?? []), (r.marks / r.maximumMarks) * 100]); });
  const absences = new Map<string, number>();
  attendance.forEach((r) => absences.set(r.studentId, Math.max(absences.get(r.studentId) ?? 0, r.absentDays ?? 0)));
  const cases = new Set(interventions.map((i) => i.studentId));
  const signals = students.map((s) => {
    const scoreParts = academic.get(s.id) ?? [];
    const academicScore = average(scoreParts);
    const absentDays = absences.get(s.id) ?? 0;
    const reasons: string[] = [];
    let score = RISK_SCORE[s.riskLevel];
    if (s.riskLevel === 'Critical' || s.riskLevel === 'High') reasons.push(`Risiko ${s.riskLevel}`);
    if (academicScore !== null && academicScore <= 50) { score += 20; reasons.push(`Prestasi ${academicScore}%`); }
    else if (academicScore !== null && academicScore <= 65) { score += 10; reasons.push(`Prestasi ${academicScore}%`); }
    if (absentDays >= 10) { score += 20; reasons.push(`${absentDays} hari tidak hadir`); }
    if ((s.riskLevel === 'Critical' || s.riskLevel === 'High') && !cases.has(s.id)) { score += 15; reasons.push('Tiada kes intervensi direkodkan'); }
    const action: OperationalAction = !cases.has(s.id) && (s.riskLevel === 'Critical' || s.riskLevel === 'High') ? 'OPEN_INTERVENTION' : absentDays >= 10 ? 'REVIEW_ATTENDANCE' : academicScore !== null && academicScore <= 65 ? 'REVIEW_ACADEMIC' : score > 0 ? 'MONITOR_PROGRESS' : 'NO_ACTION';
    return { studentId: s.id, studentName: s.name, className: s.className, riskLevel: s.riskLevel, score, reasons, action };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score || a.studentName.localeCompare(b.studentName));
  const progress = interventions.map((i) => i.progress).filter(Number.isFinite);
  const intervention: InterventionOutcomeSummary = { total: interventions.length, active: interventions.filter((i) => i.status === 'Active').length, monitoring: interventions.filter((i) => i.status === 'Monitoring').length, completed: interventions.filter((i) => i.status === 'Completed').length, critical: interventions.filter((i) => i.status === 'Critical').length, averageProgress: average(progress), studentsWithCases: cases.size };
  const assessedStudents = new Set(latest.map((r) => r.studentId)).size;
  return { totalStudents: students.length, assessedStudents, coverage: students.length ? Math.round((assessedStudents / students.length) * 100) : 0, signals, intervention };
}

import type { AcademicResult, AttendanceRecord, Intervention, Student } from '../types';
import { selectLatestAssessmentResults } from './bottleneckEngine';

export interface IntelligenceSignal { label: string; value: string; detail: string; severity: 'critical' | 'warning' | 'positive' | 'info'; }
export interface IntelligenceSummary {
  totalStudents: number;
  assessedStudents: number;
  coverage: number;
  criticalHigh: number;
  activeInterventionStudents: number;
  interventionGap: number;
  average: number | null;
  subjectBottlenecks: Array<{ subject: string; average: number; students: number }>;
  formPerformance: Array<{ form: string; average: number; students: number }>;
  signals: IntelligenceSignal[];
}

export function buildIntelligenceSummary(students: Student[], results: AcademicResult[], attendance: AttendanceRecord[], interventions: Intervention[]): IntelligenceSummary {
  const latest = selectLatestAssessmentResults(results);
  const byStudent = new Map<string, number[]>();
  const bySubject = new Map<string, number[]>();
  const byForm = new Map<string, { scores: number[]; students: Set<string> }>();
  for (const row of latest) {
    if (row.maximumMarks <= 0) continue;
    const score = (row.marks / row.maximumMarks) * 100;
    const scores = byStudent.get(row.studentId) ?? []; scores.push(score); byStudent.set(row.studentId, scores);
    const subjectScores = bySubject.get(row.subject) ?? []; subjectScores.push(score); bySubject.set(row.subject, subjectScores);
    const student = students.find((item) => item.id === row.studentId);
    if (student) { const bucket = byForm.get(student.form) ?? { scores: [], students: new Set<string>() }; bucket.scores.push(score); bucket.students.add(student.id); byForm.set(student.form, bucket); }
  }
  const assessedStudents = [...byStudent.keys()].length;
  const coverage = students.length ? Math.round((assessedStudents / students.length) * 100) : 0;
  const average = byStudent.size ? Math.round([...byStudent.values()].map((scores) => scores.reduce((a, b) => a + b, 0) / scores.length).reduce((a, b) => a + b, 0) / byStudent.size * 10) / 10 : null;
  const subjectBottlenecks = [...bySubject.entries()].map(([subject, scores]) => ({ subject, average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10, students: scores.length })).sort((a, b) => a.average - b.average).slice(0, 5);
  const formPerformance = [...byForm.entries()].map(([form, bucket]) => ({ form, average: Math.round(bucket.scores.reduce((a, b) => a + b, 0) / bucket.scores.length * 10) / 10, students: bucket.students.size })).sort((a, b) => a.form.localeCompare(b.form));
  const criticalHigh = students.filter((s) => s.riskLevel === 'Critical' || s.riskLevel === 'High').length;
  const activeInterventionStudents = new Set(interventions.filter((i) => i.status !== 'Completed').map((i) => i.studentId)).size;
  const interventionGap = Math.max(0, criticalHigh - activeInterventionStudents);
  const absent10 = new Set(attendance.filter((a) => a.absentDays >= 10).map((a) => a.studentId)).size;
  const signals: IntelligenceSignal[] = [
    { label: 'Data coverage', value: `${coverage}%`, detail: coverage < 100 ? `${students.length - assessedStudents} murid tiada keputusan terkini.` : 'Semua murid mempunyai sekurang-kurangnya satu keputusan terkini.', severity: coverage < 100 ? 'warning' : 'positive' },
    { label: 'Critical + High', value: String(criticalHigh), detail: interventionGap ? `${interventionGap} belum dilindungi oleh intervensi aktif.` : 'Coverage intervensi mencukupi berdasarkan rekod semasa.', severity: interventionGap ? 'critical' : 'positive' },
    { label: 'Attendance signal', value: String(absent10), detail: 'Murid dengan ≥10 hari tidak hadir dalam rekod agregat yang tersedia.', severity: absent10 ? 'warning' : 'info' },
    { label: 'Top bottleneck', value: subjectBottlenecks[0]?.subject ?? '—', detail: subjectBottlenecks[0] ? `Purata ${subjectBottlenecks[0].average}% daripada ${subjectBottlenecks[0].students} rekod murid-subjek terkini.` : 'Tiada data.', severity: subjectBottlenecks[0] && subjectBottlenecks[0].average < 65 ? 'critical' : 'info' },
  ];
  return { totalStudents: students.length, assessedStudents, coverage, criticalHigh, activeInterventionStudents, interventionGap, average, subjectBottlenecks, formPerformance, signals };
}

import type { AcademicResult, AttendanceRecord, Intervention, Student } from '../types';
import { selectLatestAssessmentResults } from './bottleneckEngine';

export interface QualityCheck { id: string; label: string; status: 'PASS' | 'WARN' | 'FAIL'; detail: string; count: number; }
export interface QualitySummary { checks: QualityCheck[]; score: number; ready: boolean; }

export function buildDataQualitySummary(students: Student[], results: AcademicResult[], attendance: AttendanceRecord[], interventions: Intervention[]): QualitySummary {
  const checks: QualityCheck[] = [];
  const studentIds = new Set(students.map((s) => s.id));
  const missingStudentResults = results.filter((r) => !studentIds.has(r.studentId)).length;
  checks.push({ id: 'student-master', label: 'Student master', status: students.length ? 'PASS' : 'FAIL', detail: `${students.length} murid aktif tersedia.`, count: students.length });
  checks.push({ id: 'result-links', label: 'Academic result links', status: missingStudentResults ? 'FAIL' : 'PASS', detail: missingStudentResults ? `${missingStudentResults} keputusan tidak mempunyai student master.` : 'Semua keputusan dipautkan kepada student master.', count: missingStudentResults });
  const invalidMarks = results.filter((r) => r.maximumMarks <= 0 || r.marks < 0 || r.marks > r.maximumMarks).length;
  checks.push({ id: 'marks-range', label: 'Marks range', status: invalidMarks ? 'FAIL' : 'PASS', detail: invalidMarks ? `${invalidMarks} rekod markah di luar julat.` : 'Semua markah berada dalam julat.', count: invalidMarks });
  const latest = selectLatestAssessmentResults(results);
  const assessed = new Set(latest.map((r) => r.studentId));
  const missingLatest = Math.max(0, students.length - assessed.size);
  checks.push({ id: 'latest-coverage', label: 'Latest assessment coverage', status: missingLatest ? 'WARN' : 'PASS', detail: missingLatest ? `${missingLatest} murid tiada keputusan terkini.` : 'Semua murid mempunyai keputusan terkini.', count: missingLatest });
  const seen = new Set<string>(); let duplicates = 0;
  for (const r of results) { const key = `${r.studentId}|${r.subject}|${r.assessmentId ?? r.assessmentName ?? r.assessment}`; if (seen.has(key)) duplicates += 1; else seen.add(key); }
  checks.push({ id: 'duplicates', label: 'Logical duplicates', status: duplicates ? 'WARN' : 'PASS', detail: duplicates ? `${duplicates} rekod berpotensi duplicate.` : 'Tiada duplicate logik dikesan.', count: duplicates });
  const missingGrade = results.filter((r) => !r.grade).length;
  checks.push({ id: 'grades', label: 'Grade completeness', status: missingGrade ? 'WARN' : 'PASS', detail: missingGrade ? `${missingGrade} keputusan tiada gred.` : 'Semua keputusan mempunyai gred.', count: missingGrade });
  const attendanceLinks = attendance.filter((r) => !studentIds.has(r.studentId)).length;
  checks.push({ id: 'attendance-links', label: 'Attendance links', status: attendanceLinks ? 'FAIL' : 'PASS', detail: attendanceLinks ? `${attendanceLinks} rekod kehadiran tiada student master.` : 'Semua rekod kehadiran dipautkan.', count: attendanceLinks });
  const interventionLinks = interventions.filter((r) => !studentIds.has(r.studentId)).length;
  checks.push({ id: 'intervention-links', label: 'Intervention links', status: interventionLinks ? 'FAIL' : 'PASS', detail: interventionLinks ? `${interventionLinks} intervensi tiada student master.` : 'Semua intervensi dipautkan.', count: interventionLinks });
  const pass = checks.filter((c) => c.status === 'PASS').length;
  const score = Math.round((pass / checks.length) * 100);
  return { checks, score, ready: checks.every((c) => c.status !== 'FAIL') };
}

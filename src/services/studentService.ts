import type { Student } from '../types';
import { calculateStudentGPM } from '../engines/academicEngine';
import type { StudentRiskAssessment } from '../engines/riskEngine';
import { classifyStemPipeline } from '../engines/stemEngine';
import { loadCoreDataset, type CoreDataset } from './dataset';
import { buildRiskLookup } from './riskLookup';
import { buildProgressTimeline, buildTalents, formLabel, progressStatusFor, toSubjectScores } from './mappers';
import type { DbStudent } from '../types/schema';

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function initialsOf(name: string): string {
  const parts = name.split(' ').filter((p) => !['bin', 'binti', 'a/l', 'a/p'].includes(p));
  return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function buildStudentView(dataset: CoreDataset, risk: StudentRiskAssessment, student: DbStudent): Student {
  const latestResults = dataset.latestResults.filter((r) => r.student_id === student.id);
  const previousResults = dataset.previousResults.filter((r) => r.student_id === student.id);
  const attendanceRecords = dataset.attendance.filter((a) => a.student_id === student.id);
  const interventions = dataset.interventions.filter((i) => i.student_id === student.id);

  const gpm = calculateStudentGPM(latestResults);
  const academicScore = average(latestResults.map((r) => r.percentage));
  const attendanceRate = attendanceRecords.length
    ? Math.round((attendanceRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length / attendanceRecords.length) * 100)
    : 100;

  const mathGrade = latestResults.find((r) => r.subject_id === 'sub-mat' || r.subject_id === 'sub-mt')?.grade;
  const scienceGrade = latestResults.find((r) => ['sub-sains', 'sub-fiz', 'sub-kim', 'sub-bio'].includes(r.subject_id))?.grade;
  const stem = classifyStemPipeline({ studentId: student.id, mathGrade, scienceGrade, stemInterest: gpm <= 4 });

  return {
    id: student.id,
    studentNo: student.student_no,
    name: student.name,
    gender: student.gender,
    className: dataset.classes.find((c) => c.id === student.class_id)?.name ?? student.class_id,
    form: formLabel(student.form),
    academicScore,
    gpm,
    attendanceRate,
    riskLevel: risk.risk_level,
    riskScore: risk.risk_score,
    riskReasons: risk.reasons,
    recommendedAction: risk.recommended_action,
    status: progressStatusFor(risk, gpm, attendanceRate),
    subjects: toSubjectScores(latestResults, dataset.subjects),
    talents: buildTalents(student.id),
    stemTrack: stem.inPipeline,
    stemReadiness: Math.round(100 - ((Math.max(...latestResults.map((r) => r.gp), 5) - 1) / 9) * 100),
    progressTimeline: buildProgressTimeline({ previousResults, latestResults, attendanceRecords, interventions, risk }),
    icLast4: student.ic_last4,
    photoInitials: initialsOf(student.name),
  };
}

export interface StudentListFilters {
  search?: string;
  className?: string;
  form?: Student['form'];
  riskLevel?: Student['riskLevel'];
}

export async function listStudents(filters: StudentListFilters = {}): Promise<Student[]> {
  const dataset = await loadCoreDataset();
  const riskLookup = buildRiskLookup(dataset);

  let views = dataset.students.map((s) => buildStudentView(dataset, riskLookup.get(s.id)!, s));

  if (filters.search) {
    const q = filters.search.toLowerCase();
    views = views.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.studentNo.toLowerCase().includes(q));
  }
  if (filters.className) views = views.filter((s) => s.className === filters.className);
  if (filters.form) views = views.filter((s) => s.form === filters.form);
  if (filters.riskLevel) views = views.filter((s) => s.riskLevel === filters.riskLevel);

  return views;
}

export async function getStudentProfile(studentId: string): Promise<Student | null> {
  const dataset = await loadCoreDataset();
  const student = dataset.students.find((s) => s.id === studentId);
  if (!student) return null;
  const riskLookup = buildRiskLookup(dataset);
  return buildStudentView(dataset, riskLookup.get(studentId)!, student);
}

export async function listClassNames(): Promise<string[]> {
  const dataset = await loadCoreDataset();
  return dataset.classes.map((c) => c.name);
}

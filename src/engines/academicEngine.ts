// Academic Engine — every school-wide, class-wide, subject-wide or
// student-wide academic number is computed here, once, and reused by
// services. No component or service should re-derive these formulas.
//
// Three metrics look similar but are NOT the same:
//   - GPM  (Gred Purata Murid)     — one student's average grade point.
//   - GPMP (Gred Purata Mata Pelajaran) — one subject's average grade
//                                          point across every student who
//                                          sat it (used to find subject
//                                          bottlenecks).
//   - GPS  (Gred Purata Sekolah)   — the whole school's average grade
//                                    point across every result.
// All three share the same 1-10 scale where LOWER is better.

import type { AcademicResult, ClassRoom, DbStudent, Subject } from '../types/schema';
import { isPass } from '../utils/grading';
import { GRADE_ORDER } from '../utils/grading';

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Re-exported for callers that only need grade -> point. */
export { calculateGP } from '../utils/grading';

/** GPM — a single student's average grade point across a set of results. */
export function calculateStudentGPM(results: AcademicResult[]): number {
  return round(average(results.map((r) => r.gp)));
}

/** GPS — the school (or any given result set)'s average grade point. */
export function calculateGPS(results: AcademicResult[]): number {
  return round(average(results.map((r) => r.gp)));
}

/** GPMP — one subject's average grade point across every student who sat it. */
export function calculateGPMP(results: AcademicResult[], subjectId: string): number {
  const subjectResults = results.filter((r) => r.subject_id === subjectId);
  return round(average(subjectResults.map((r) => r.gp)));
}

export function calculatePassRate(results: AcademicResult[]): number {
  if (results.length === 0) return 0;
  const passed = results.filter((r) => isPass(r.grade)).length;
  return round((passed / results.length) * 100, 1);
}

export interface GradeDistributionEntry {
  grade: string;
  count: number;
}

export function calculateGradeDistribution(results: AcademicResult[]): GradeDistributionEntry[] {
  return GRADE_ORDER.map((grade) => ({
    grade,
    count: results.filter((r) => r.grade === grade).length,
  }));
}

export interface SubjectPerformanceEntry {
  subjectId: string;
  subjectName: string;
  gpmp: number;
  passRate: number;
  averagePercentage: number;
  entrants: number;
}

export function calculateSubjectPerformance(results: AcademicResult[], subjects: Subject[]): SubjectPerformanceEntry[] {
  return subjects.map((subject) => {
    const subjectResults = results.filter((r) => r.subject_id === subject.id);
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      gpmp: calculateGPMP(results, subject.id),
      passRate: calculatePassRate(subjectResults),
      averagePercentage: round(average(subjectResults.map((r) => r.percentage)), 1),
      entrants: subjectResults.length,
    };
  }).filter((s) => s.entrants > 0);
}

export interface StudentPerformanceSummary {
  studentId: string;
  gpm: number;
  passRate: number;
  failingSubjects: string[];
  subjectResults: AcademicResult[];
}

export function calculateStudentPerformance(studentId: string, results: AcademicResult[]): StudentPerformanceSummary {
  const studentResults = results.filter((r) => r.student_id === studentId);
  return {
    studentId,
    gpm: calculateStudentGPM(studentResults),
    passRate: calculatePassRate(studentResults),
    failingSubjects: studentResults.filter((r) => !isPass(r.grade)).map((r) => r.subject_id),
    subjectResults: studentResults,
  };
}

export interface ClassPerformanceEntry {
  classId: string;
  className: string;
  averageGpm: number;
  passRate: number;
  studentCount: number;
}

export function calculateClassPerformance(classRoom: ClassRoom, students: DbStudent[], results: AcademicResult[]): ClassPerformanceEntry {
  const classStudentIds = new Set(students.filter((s) => s.class_id === classRoom.id).map((s) => s.id));
  const classResults = results.filter((r) => classStudentIds.has(r.student_id));
  return {
    classId: classRoom.id,
    className: classRoom.name,
    averageGpm: calculateGPS(classResults),
    passRate: calculatePassRate(classResults),
    studentCount: classStudentIds.size,
  };
}

export interface FieldPerformanceEntry {
  department: string;
  averageGp: number;
  passRate: number;
}

/** "Field" (bidang) performance — subjects grouped by department. */
export function calculateFieldPerformance(results: AcademicResult[], subjects: Subject[]): FieldPerformanceEntry[] {
  const departments = Array.from(new Set(subjects.map((s) => s.department)));
  return departments.map((department) => {
    const subjectIds = new Set(subjects.filter((s) => s.department === department).map((s) => s.id));
    const departmentResults = results.filter((r) => subjectIds.has(r.subject_id));
    return {
      department,
      averageGp: calculateGPS(departmentResults),
      passRate: calculatePassRate(departmentResults),
    };
  }).filter((d) => Number.isFinite(d.averageGp) && d.averageGp > 0);
}

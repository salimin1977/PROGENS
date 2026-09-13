import type { AcademicResult, GradeDistributionEntry, SubjectPerformance } from '../types';

export const calculateGP = (scores: number[]): number => scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
export const calculateGPI = (scores: number[]): number => calculateGP(scores);
export const calculateGPMP = (results: AcademicResult[]): number => calculateGP(results.map((r) => r.marks));
export const calculateGPS = (gradePoints: number[]): number => calculateGP(gradePoints);
export const calculatePassRate = (results: AcademicResult[], passMark = 40): number => results.length ? (results.filter((r) => r.marks >= passMark).length / results.length) * 100 : 0;
export const calculateGradeDistribution = (results: AcademicResult[]): GradeDistributionEntry[] => {
  const grades = ['A+', 'A', 'B', 'C', 'D', 'E', 'G'];
  return grades.map((grade) => ({ grade, count: results.filter((r) => r.grade === grade).length }));
};
export const calculateSubjectPerformance = (results: AcademicResult[], targets: Record<string, number> = {}): SubjectPerformance[] => {
  return [...new Set(results.map((r) => r.subject))].map((subject) => {
    const rows = results.filter((r) => r.subject === subject);
    return { subject, average: calculateGP(rows.map((r) => r.marks)), target: targets[subject] ?? 70, passRate: calculatePassRate(rows) };
  });
};
export const calculateClassPerformance = (results: AcademicResult[], studentClass: Record<string, string>) => {
  return [...new Set(Object.values(studentClass))].map((className) => {
    const ids = new Set(Object.entries(studentClass).filter(([, c]) => c === className).map(([id]) => id));
    const rows = results.filter((r) => ids.has(r.studentId));
    return { className, average: calculateGP(rows.map((r) => r.marks)), passRate: calculatePassRate(rows) };
  });
};
export const calculateAssessmentTrend = (results: AcademicResult[]) => {
  return [...new Set(results.map((r) => r.assessment))].map((assessment) => ({ assessment, average: calculateGP(results.filter((r) => r.assessment === assessment).map((r) => r.marks)) }));
};

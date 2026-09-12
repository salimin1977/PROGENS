import type { ClassPerformance, GpsTrendEntry, GradeDistributionEntry, SubjectPerformance } from '../types';
import { CLASSES, students } from './students';

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

const allSubjectNames = Array.from(new Set(students.flatMap((s) => s.subjects.map((sub) => sub.subject))));

export const subjectPerformance: SubjectPerformance[] = allSubjectNames.map((subject) => {
  const scores = students.flatMap((s) => s.subjects.filter((sub) => sub.subject === subject).map((sub) => sub.score));
  const passCount = scores.filter((s) => s >= 40).length;
  return {
    subject,
    average: average(scores),
    target: subject.includes('Additional Mathematics') || subject === 'Mathematics' ? 75 : 70,
    passRate: scores.length ? Math.round((passCount / scores.length) * 1000) / 10 : 0,
  };
});

const GRADE_ORDER = ['A+', 'A', 'B', 'C', 'D', 'E', 'G'];

export const gradeDistribution: GradeDistributionEntry[] = GRADE_ORDER.map((grade) => ({
  grade,
  count: students.flatMap((s) => s.subjects).filter((sub) => sub.grade === grade).length,
}));

export const classPerformance: ClassPerformance[] = CLASSES.map((c) => {
  const classStudents = students.filter((s) => s.className === c.name);
  const scores = classStudents.map((s) => s.academicScore);
  return {
    className: c.name,
    form: c.form,
    average: average(scores),
    passRate: Math.round((classStudents.filter((s) => s.academicScore >= 40).length / classStudents.length) * 1000) / 10,
    studentsAtRisk: classStudents.filter((s) => s.riskLevel === 'Critical' || s.riskLevel === 'High').length,
  };
});

// GPS follows Malaysian convention: lower value indicates stronger performance (closer to 1.0).
export const gpsTrend: GpsTrendEntry[] = [
  { year: '2023', gps: 5.62, target: 5.2 },
  { year: '2024', gps: 5.38, target: 5.0 },
  { year: '2025', gps: 5.11, target: 4.9 },
  { year: '2026', gps: 5.11, target: 4.84 },
];

export const academicKpi = {
  gpsCurrent: 5.11,
  gpsTarget: 4.84,
  gpmpCurrent: 62.4,
  gpmpTarget: 70,
  passRate: 91.67,
  passRateTarget: 95,
};

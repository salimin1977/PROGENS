import type { AcademicResult, Student } from '../types';

export interface BottleneckItem {
  key: string;
  label: string;
  average: number;
  assessedStudents: number;
  severity: 'Critical' | 'High' | 'Moderate' | 'Monitor';
  signal: string;
}

const severity = (average: number): BottleneckItem['severity'] => {
  if (average < 50) return 'Critical';
  if (average < 65) return 'High';
  if (average < 75) return 'Moderate';
  return 'Monitor';
};

export const calculateSubjectBottlenecks = (
  results: AcademicResult[],
  students: Student[],
): BottleneckItem[] => {
  const activeIds = new Set(students.map((student) => student.id));
  const groups = new Map<string, { total: number; count: number }>();

  for (const result of results) {
    if (!activeIds.has(result.studentId) || result.maximumMarks <= 0) continue;
    const current = groups.get(result.subject) ?? { total: 0, count: 0 };
    current.total += (result.marks / result.maximumMarks) * 100;
    current.count += 1;
    groups.set(result.subject, current);
  }

  return [...groups.entries()]
    .map(([key, group]) => {
      const average = Math.round((group.total / group.count) * 10) / 10;
      const level = severity(average);
      return {
        key,
        label: key,
        average,
        assessedStudents: group.count,
        severity: level,
        signal: level === 'Critical' ? 'Bottleneck utama' : level === 'High' ? 'Perlu tindakan' : level === 'Moderate' ? 'Perlu pemantauan' : 'Tidak kritikal',
      };
    })
    .sort((a, b) => a.average - b.average);
};

export const calculateClassBottlenecks = (
  results: AcademicResult[],
  students: Student[],
): BottleneckItem[] => {
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const groups = new Map<string, { total: number; count: number }>();

  for (const result of results) {
    const student = studentMap.get(result.studentId);
    if (!student || result.maximumMarks <= 0) continue;
    const current = groups.get(student.className) ?? { total: 0, count: 0 };
    current.total += (result.marks / result.maximumMarks) * 100;
    current.count += 1;
    groups.set(student.className, current);
  }

  return [...groups.entries()]
    .map(([key, group]) => {
      const average = Math.round((group.total / group.count) * 10) / 10;
      const level = severity(average);
      return {
        key,
        label: key,
        average,
        assessedStudents: group.count,
        severity: level,
        signal: level === 'Critical' ? 'Kelas bottleneck' : level === 'High' ? 'Perlu tindakan' : level === 'Moderate' ? 'Perlu pemantauan' : 'Stabil',
      };
    })
    .sort((a, b) => a.average - b.average);
};

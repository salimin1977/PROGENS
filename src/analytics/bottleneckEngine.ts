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

const toItem = (key: string, average: number, assessedStudents: number, classMode = false): BottleneckItem => {
  const level = severity(average);
  return {
    key,
    label: key,
    average,
    assessedStudents,
    severity: level,
    signal: classMode
      ? level === 'Critical' ? 'Kelas bottleneck' : level === 'High' ? 'Perlu tindakan' : level === 'Moderate' ? 'Perlu pemantauan' : 'Stabil'
      : level === 'Critical' ? 'Bottleneck utama' : level === 'High' ? 'Perlu tindakan' : level === 'Moderate' ? 'Perlu pemantauan' : 'Tidak kritikal',
  };
};

export const calculateSubjectBottlenecks = (results: AcademicResult[], students: Student[]): BottleneckItem[] => {
  const activeIds = new Set(students.map((student) => student.id));
  const groups = new Map<string, { total: number; count: number; students: Set<string> }>();
  for (const result of results) {
    if (!activeIds.has(result.studentId) || result.maximumMarks <= 0) continue;
    const current = groups.get(result.subject) ?? { total: 0, count: 0, students: new Set<string>() };
    current.total += (result.marks / result.maximumMarks) * 100;
    current.count += 1;
    current.students.add(result.studentId);
    groups.set(result.subject, current);
  }
  return [...groups.entries()]
    .map(([key, group]) => toItem(key, Math.round((group.total / group.count) * 10) / 10, group.students.size))
    .sort((a, b) => a.average - b.average);
};

export const calculateClassBottlenecks = (results: AcademicResult[], students: Student[]): BottleneckItem[] => {
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const groups = new Map<string, { total: number; count: number; students: Set<string> }>();
  for (const result of results) {
    const student = studentMap.get(result.studentId);
    if (!student || result.maximumMarks <= 0) continue;
    const current = groups.get(student.className) ?? { total: 0, count: 0, students: new Set<string>() };
    current.total += (result.marks / result.maximumMarks) * 100;
    current.count += 1;
    current.students.add(result.studentId);
    groups.set(student.className, current);
  }
  return [...groups.entries()]
    .map(([key, group]) => toItem(key, Math.round((group.total / group.count) * 10) / 10, group.students.size, true))
    .sort((a, b) => a.average - b.average);
};

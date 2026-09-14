import type { AcademicResult, Student } from '../types';

export interface BottleneckItem {
  key: string;
  label: string;
  average: number;
  assessedStudents: number;
  affectedStudentIds: string[];
  severity: 'Critical' | 'High' | 'Moderate' | 'Monitor';
  signal: string;
}

const severity = (average: number): BottleneckItem['severity'] => {
  if (average < 50) return 'Critical';
  if (average < 65) return 'High';
  if (average < 75) return 'Moderate';
  return 'Monitor';
};

const assessmentRank = (result: AcademicResult): number => {
  const name = (result.assessmentName ?? '').toUpperCase();
  if (name.includes('PERCUBAAN') && name.includes('SPM')) return 100;
  if (name.includes('SPM')) return 90;
  if (name.includes('PPSA')) return 70;
  if (name.includes('PASA')) return 60;
  if (name.includes('PPT')) return 50;
  if (name.includes('TOV')) return 10;
  return 1;
};

/** Select one current result per student+subject when multiple assessments exist. */
export const selectLatestAssessmentResults = (results: AcademicResult[]): AcademicResult[] => {
  const selected = new Map<string, AcademicResult>();
  for (const result of results) {
    const key = `${result.studentId}::${result.subject}`;
    const current = selected.get(key);
    if (!current) {
      selected.set(key, result);
      continue;
    }
    const currentRank = assessmentRank(current);
    const resultRank = assessmentRank(result);
    const currentDate = current.assessmentDate ?? '';
    const resultDate = result.assessmentDate ?? '';
    if (resultRank > currentRank || (resultRank === currentRank && resultDate > currentDate)) {
      selected.set(key, result);
    }
  }
  return [...selected.values()];
};

const toItem = (
  key: string,
  average: number,
  studentIds: Set<string>,
  classMode = false,
): BottleneckItem => {
  const level = severity(average);
  return {
    key,
    label: key,
    average,
    assessedStudents: studentIds.size,
    affectedStudentIds: [...studentIds],
    severity: level,
    signal: classMode
      ? level === 'Critical' ? 'Kelas bottleneck' : level === 'High' ? 'Perlu tindakan' : level === 'Moderate' ? 'Perlu pemantauan' : 'Stabil'
      : level === 'Critical' ? 'Bottleneck utama' : level === 'High' ? 'Perlu tindakan' : level === 'Moderate' ? 'Perlu pemantauan' : 'Tidak kritikal',
  };
};

const scopedResults = (results: AcademicResult[], assessmentId?: string): AcademicResult[] => {
  const scoped = assessmentId ? results.filter((result) => result.assessmentId === assessmentId) : results;
  return assessmentId ? scoped : selectLatestAssessmentResults(scoped);
};

export const calculateSubjectBottlenecks = (
  results: AcademicResult[],
  students: Student[],
  assessmentId?: string,
): BottleneckItem[] => {
  const activeIds = new Set(students.map((student) => student.id));
  const groups = new Map<string, { total: number; count: number; students: Set<string> }>();
  for (const result of scopedResults(results, assessmentId)) {
    if (!activeIds.has(result.studentId) || result.maximumMarks <= 0) continue;
    const current = groups.get(result.subject) ?? { total: 0, count: 0, students: new Set<string>() };
    current.total += (result.marks / result.maximumMarks) * 100;
    current.count += 1;
    current.students.add(result.studentId);
    groups.set(result.subject, current);
  }
  return [...groups.entries()]
    .map(([key, group]) => toItem(key, Math.round((group.total / group.count) * 10) / 10, group.students))
    .sort((a, b) => a.average - b.average);
};

export const calculateClassBottlenecks = (
  results: AcademicResult[],
  students: Student[],
  assessmentId?: string,
): BottleneckItem[] => {
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const groups = new Map<string, { total: number; count: number; students: Set<string> }>();
  for (const result of scopedResults(results, assessmentId)) {
    const student = studentMap.get(result.studentId);
    if (!student || result.maximumMarks <= 0) continue;
    const current = groups.get(student.className) ?? { total: 0, count: 0, students: new Set<string>() };
    current.total += (result.marks / result.maximumMarks) * 100;
    current.count += 1;
    current.students.add(result.studentId);
    groups.set(student.className, current);
  }
  return [...groups.entries()]
    .map(([key, group]) => toItem(key, Math.round((group.total / group.count) * 10) / 10, group.students, true))
    .sort((a, b) => a.average - b.average);
};

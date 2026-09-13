import type { AcademicResult, Student } from '../types';

export interface ValidationIssue { code: string; message: string; field?: string; }
export function validateStudents(students: Student[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  for (const student of students) {
    if (ids.has(student.id)) issues.push({ code: 'DUPLICATE_STUDENT_ID', message: `Duplicate student ID: ${student.id}`, field: 'id' });
    ids.add(student.id);
    if (!student.name.trim()) issues.push({ code: 'MISSING_STUDENT', message: `Missing student name for ${student.id}`, field: 'name' });
    if (!student.className.trim()) issues.push({ code: 'MISSING_CLASS', message: `Missing class for ${student.id}`, field: 'className' });
    for (const subject of student.subjects) if (!subject.subject.trim()) issues.push({ code: 'MISSING_SUBJECT', message: `Missing subject for ${student.id}`, field: 'subject' });
  }
  return issues;
}
export function validateAcademicResults(results: AcademicResult[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const r of results) {
    if (r.marks < 0 || r.maximumMarks <= 0 || r.marks > r.maximumMarks) issues.push({ code: 'INVALID_MARK', message: `Invalid marks for ${r.id}`, field: 'marks' });
    if (!r.studentId) issues.push({ code: 'MISSING_STUDENT', message: `Missing student for result ${r.id}`, field: 'studentId' });
    if (!r.subject.trim()) issues.push({ code: 'MISSING_SUBJECT', message: `Missing subject for result ${r.id}`, field: 'subject' });
    if (!['A+','A','B','C','D','E','G'].includes(r.grade)) issues.push({ code: 'INVALID_GRADE', message: `Invalid grade for ${r.id}`, field: 'grade' });
  }
  return issues;
}

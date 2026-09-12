// Data validation — every case Phase 2 explicitly calls out. Used both as
// a one-time integrity check over the seed dataset (see checkDatasetIntegrity)
// and as reusable guards for any future "add/edit result" form.

import { GRADE_ORDER } from './grading';
import type { AcademicResult, Assessment, ClassRoom, DbStudent, Subject } from '../types/schema';

export const MAX_MARKS = 100;

export interface ValidationIssue {
  code: string;
  message: string;
}

export function validateMarks(marks: number): ValidationIssue | null {
  if (Number.isNaN(marks)) return { code: 'INVALID_MARKS', message: 'Marks must be a number' };
  if (marks < 0) return { code: 'INVALID_MARKS', message: 'Marks cannot be negative' };
  if (marks > MAX_MARKS) return { code: 'MARKS_EXCEEDS_MAXIMUM', message: `Marks cannot exceed ${MAX_MARKS}` };
  return null;
}

export function validateGrade(grade: string): ValidationIssue | null {
  if (!GRADE_ORDER.includes(grade as (typeof GRADE_ORDER)[number])) {
    return { code: 'INVALID_GRADE', message: `"${grade}" is not a recognised grade (expected one of ${GRADE_ORDER.join(', ')})` };
  }
  return null;
}

export function validateStudentExists(studentId: string, students: DbStudent[]): ValidationIssue | null {
  if (!students.some((s) => s.id === studentId)) {
    return { code: 'MISSING_STUDENT', message: `Student "${studentId}" does not exist` };
  }
  return null;
}

export function validateClassExists(classId: string, classes: ClassRoom[]): ValidationIssue | null {
  if (!classes.some((c) => c.id === classId)) {
    return { code: 'INVALID_CLASS', message: `Class "${classId}" does not exist` };
  }
  return null;
}

export function validateSubjectExists(subjectId: string, subjects: Subject[]): ValidationIssue | null {
  if (!subjects.some((s) => s.id === subjectId)) {
    return { code: 'INVALID_SUBJECT', message: `Subject "${subjectId}" does not exist` };
  }
  return null;
}

export function validateAssessmentExists(assessmentId: string, assessments: Assessment[]): ValidationIssue | null {
  if (!assessments.some((a) => a.id === assessmentId)) {
    return { code: 'INVALID_ASSESSMENT', message: `Assessment "${assessmentId}" does not exist` };
  }
  return null;
}

export function findDuplicateStudentIds(students: DbStudent[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const s of students) {
    if (seen.has(s.id)) duplicates.add(s.id);
    seen.add(s.id);
  }
  return Array.from(duplicates);
}

export interface DatasetIntegrityInput {
  students: DbStudent[];
  classes: ClassRoom[];
  subjects: Subject[];
  assessments: Assessment[];
  academicResults: AcademicResult[];
}

/** Runs every check above across a full dataset; returns a flat issue list (empty = clean). */
export function checkDatasetIntegrity(input: DatasetIntegrityInput): ValidationIssue[] {
  const { students, classes, subjects, assessments, academicResults } = input;
  const issues: ValidationIssue[] = [];

  for (const id of findDuplicateStudentIds(students)) {
    issues.push({ code: 'DUPLICATE_STUDENT_ID', message: `Duplicate student id "${id}"` });
  }

  for (const student of students) {
    const classIssue = validateClassExists(student.class_id, classes);
    if (classIssue) issues.push(classIssue);
  }

  for (const result of academicResults) {
    const studentIssue = validateStudentExists(result.student_id, students);
    if (studentIssue) issues.push(studentIssue);

    const subjectIssue = validateSubjectExists(result.subject_id, subjects);
    if (subjectIssue) issues.push(subjectIssue);

    const assessmentIssue = validateAssessmentExists(result.assessment_id, assessments);
    if (assessmentIssue) issues.push(assessmentIssue);

    const marksIssue = validateMarks(result.marks);
    if (marksIssue) issues.push({ ...marksIssue, message: `${marksIssue.message} (result ${result.id})` });

    const gradeIssue = validateGrade(result.grade);
    if (gradeIssue) issues.push({ ...gradeIssue, message: `${gradeIssue.message} (result ${result.id})` });
  }

  return issues;
}

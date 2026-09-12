import { describe, expect, it } from 'vitest';
import { checkDatasetIntegrity, findDuplicateStudentIds, validateGrade, validateMarks } from './validation';
import type { AcademicResult, ClassRoom, DbStudent } from '../types/schema';

describe('validateMarks', () => {
  it('accepts marks within 0-100', () => {
    expect(validateMarks(0)).toBeNull();
    expect(validateMarks(100)).toBeNull();
    expect(validateMarks(57.5)).toBeNull();
  });

  it('rejects marks above the maximum', () => {
    expect(validateMarks(101)?.code).toBe('MARKS_EXCEEDS_MAXIMUM');
  });

  it('rejects negative marks', () => {
    expect(validateMarks(-1)?.code).toBe('INVALID_MARKS');
  });
});

describe('validateGrade', () => {
  it('accepts every grade in the fixed scale', () => {
    for (const grade of ['A+', 'A', 'A-', 'B+', 'B', 'C+', 'C', 'D', 'E', 'G']) {
      expect(validateGrade(grade)).toBeNull();
    }
  });

  it('rejects an unrecognised grade', () => {
    expect(validateGrade('F')?.code).toBe('INVALID_GRADE');
  });
});

describe('findDuplicateStudentIds', () => {
  it('finds duplicated ids without flagging unique ones', () => {
    const students = [{ id: 's1' }, { id: 's2' }, { id: 's1' }] as DbStudent[];
    expect(findDuplicateStudentIds(students)).toEqual(['s1']);
  });

  it('returns an empty array when every id is unique', () => {
    const students = [{ id: 's1' }, { id: 's2' }] as DbStudent[];
    expect(findDuplicateStudentIds(students)).toEqual([]);
  });
});

describe('checkDatasetIntegrity', () => {
  const classes = [{ id: 'c1' }] as ClassRoom[];

  it('reports no issues for a clean, consistent dataset', () => {
    const students = [{ id: 's1', class_id: 'c1' }] as DbStudent[];
    const results = [
      { id: 'r1', student_id: 's1', subject_id: 'sub1', assessment_id: 'a1', marks: 80, percentage: 80, grade: 'A' },
    ] as AcademicResult[];

    const issues = checkDatasetIntegrity({
      students,
      classes,
      subjects: [{ id: 'sub1' }] as never,
      assessments: [{ id: 'a1' }] as never,
      academicResults: results,
    });
    expect(issues).toEqual([]);
  });

  it('flags a result referencing a missing student and an out-of-range mark', () => {
    const students = [{ id: 's1', class_id: 'c1' }] as DbStudent[];
    const results = [
      { id: 'r1', student_id: 'ghost', subject_id: 'sub1', assessment_id: 'a1', marks: 150, percentage: 150, grade: 'A' },
    ] as AcademicResult[];

    const issues = checkDatasetIntegrity({
      students,
      classes,
      subjects: [{ id: 'sub1' }] as never,
      assessments: [{ id: 'a1' }] as never,
      academicResults: results,
    });
    expect(issues.some((i) => i.code === 'MISSING_STUDENT')).toBe(true);
    expect(issues.some((i) => i.code === 'MARKS_EXCEEDS_MAXIMUM')).toBe(true);
  });
});

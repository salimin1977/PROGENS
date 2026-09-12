import { describe, expect, it } from 'vitest';
import { calculateGPMP, calculateGPS, calculateGradeDistribution, calculatePassRate, calculateStudentGPM } from './academicEngine';
import type { AcademicResult, Grade } from '../types/schema';
import { calculateGP, resultStatus } from '../utils/grading';

let counter = 0;
function makeResult(studentId: string, subjectId: string, grade: Grade): AcademicResult {
  counter++;
  return {
    id: `res-${counter}`,
    student_id: studentId,
    subject_id: subjectId,
    assessment_id: 'assess-1',
    marks: 50,
    percentage: 50,
    grade,
    gp: calculateGP(grade),
    status: resultStatus(grade),
    created_at: '2026-01-01T00:00:00Z',
  };
}

describe('calculateStudentGPM', () => {
  it('averages a single student grade points', () => {
    const results = [makeResult('s1', 'math', 'A+'), makeResult('s1', 'bm', 'A')];
    // A+ = 1, A = 2 -> average 1.5
    expect(calculateStudentGPM(results)).toBe(1.5);
  });

  it('returns 0 for an empty result set', () => {
    expect(calculateStudentGPM([])).toBe(0);
  });
});

describe('calculateGPS', () => {
  it('averages grade points across every result regardless of student', () => {
    const results = [makeResult('s1', 'math', 'A+'), makeResult('s2', 'math', 'G')];
    // 1 and 10 -> average 5.5
    expect(calculateGPS(results)).toBe(5.5);
  });
});

describe('calculateGPMP', () => {
  it('only averages results for the requested subject', () => {
    const results = [makeResult('s1', 'math', 'A+'), makeResult('s1', 'bm', 'G'), makeResult('s2', 'math', 'A')];
    // math results: A+ (1), A (2) -> average 1.5; bm result excluded
    expect(calculateGPMP(results, 'math')).toBe(1.5);
  });

  it('returns 0 when no student sat the subject', () => {
    const results = [makeResult('s1', 'math', 'A+')];
    expect(calculateGPMP(results, 'physics')).toBe(0);
  });
});

describe('calculatePassRate', () => {
  it('counts every non-G grade as a pass', () => {
    const results = [makeResult('s1', 'math', 'A+'), makeResult('s1', 'bm', 'E'), makeResult('s1', 'sej', 'G')];
    // 2 of 3 pass -> 66.7%
    expect(calculatePassRate(results)).toBe(66.7);
  });

  it('returns 0 for an empty result set instead of NaN', () => {
    expect(calculatePassRate([])).toBe(0);
  });
});

describe('calculateGradeDistribution', () => {
  it('counts every grade, including grades with zero occurrences', () => {
    const results = [makeResult('s1', 'math', 'A+'), makeResult('s1', 'bm', 'A+')];
    const distribution = calculateGradeDistribution(results);
    expect(distribution.find((d) => d.grade === 'A+')?.count).toBe(2);
    expect(distribution.find((d) => d.grade === 'G')?.count).toBe(0);
    expect(distribution).toHaveLength(10);
  });
});

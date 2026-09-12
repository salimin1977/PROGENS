import { describe, expect, it } from 'vitest';
import { calculateStudentRisk } from './riskEngine';
import type { AcademicResult, AttendanceRecord, Grade } from '../types/schema';
import { calculateGP, resultStatus } from '../utils/grading';

let counter = 0;
function makeResult(grade: Grade): AcademicResult {
  counter++;
  return {
    id: `res-${counter}`,
    student_id: 's1',
    subject_id: `subject-${counter}`,
    assessment_id: 'assess-latest',
    marks: 50,
    percentage: 50,
    grade,
    gp: calculateGP(grade),
    status: resultStatus(grade),
    created_at: '2026-01-01T00:00:00Z',
  };
}

function makeAttendance(count: number, presentCount: number): AttendanceRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `att-${i}`,
    student_id: 's1',
    date: '2026-01-01',
    status: i < presentCount ? 'PRESENT' : 'ABSENT',
    class_id: 'c1',
    reason: null,
  }));
}

describe('calculateStudentRisk — G-grade-count base rule', () => {
  it('classifies 0 G grades with healthy attendance as LOW', () => {
    const risk = calculateStudentRisk({
      studentId: 's1',
      latestResults: [makeResult('A'), makeResult('B')],
      attendanceRecords: makeAttendance(20, 20),
    });
    expect(risk.risk_level).toBe('LOW');
  });

  it('classifies exactly 1 G grade as MEDIUM', () => {
    const risk = calculateStudentRisk({ studentId: 's1', latestResults: [makeResult('A'), makeResult('G')] });
    expect(risk.risk_level).toBe('MEDIUM');
  });

  it('classifies 2-3 G grades as HIGH', () => {
    const risk2 = calculateStudentRisk({ studentId: 's1', latestResults: [makeResult('G'), makeResult('G')] });
    const risk3 = calculateStudentRisk({ studentId: 's1', latestResults: [makeResult('G'), makeResult('G'), makeResult('G')] });
    expect(risk2.risk_level).toBe('HIGH');
    expect(risk3.risk_level).toBe('HIGH');
  });

  it('classifies 4 or more G grades as CRITICAL', () => {
    const risk = calculateStudentRisk({
      studentId: 's1',
      latestResults: [makeResult('G'), makeResult('G'), makeResult('G'), makeResult('G')],
    });
    expect(risk.risk_level).toBe('CRITICAL');
  });
});

describe('calculateStudentRisk — modifiers on a 0-G student', () => {
  it('escalates LOW to MEDIUM when attendance is below the 90% threshold', () => {
    const risk = calculateStudentRisk({
      studentId: 's1',
      latestResults: [makeResult('A')],
      attendanceRecords: makeAttendance(10, 8), // 80%
    });
    expect(risk.risk_level).toBe('MEDIUM');
    expect(risk.reasons.some((r) => r.includes('Attendance'))).toBe(true);
  });

  it('escalates LOW to MEDIUM on a significant academic decline', () => {
    const risk = calculateStudentRisk({
      studentId: 's1',
      latestResults: [makeResult('C')], // gp 7
      previousResults: [makeResult('A+')], // gp 1 -> delta 6, well past the 1.5 threshold
      attendanceRecords: makeAttendance(10, 10),
    });
    expect(risk.risk_level).toBe('MEDIUM');
    expect(risk.reasons.some((r) => r.includes('declined'))).toBe(true);
  });

  it('stays LOW when attendance and trend are both healthy', () => {
    const risk = calculateStudentRisk({
      studentId: 's1',
      latestResults: [makeResult('A')],
      previousResults: [makeResult('A')],
      attendanceRecords: makeAttendance(10, 10),
    });
    expect(risk.risk_level).toBe('LOW');
    expect(risk.reasons).toEqual(['No significant risk factors detected']);
  });
});

describe('calculateStudentRisk — edge cases', () => {
  it('handles a student with no results at all without throwing', () => {
    const risk = calculateStudentRisk({ studentId: 's1', latestResults: [] });
    expect(risk.risk_level).toBe('LOW');
    expect(risk.risk_score).toBe(0);
  });

  it('caps risk_score at 100', () => {
    const risk = calculateStudentRisk({
      studentId: 's1',
      latestResults: [makeResult('G'), makeResult('G'), makeResult('G'), makeResult('G'), makeResult('G')],
      attendanceRecords: makeAttendance(10, 5),
    });
    expect(risk.risk_score).toBeLessThanOrEqual(100);
  });
});

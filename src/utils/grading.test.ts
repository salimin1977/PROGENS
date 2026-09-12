import { describe, expect, it } from 'vitest';
import { calculateGP, gradeFromPercentage, gradeFromPoint, isPass, resultStatus } from './grading';

describe('calculateGP', () => {
  it('maps A+ to the best point (1)', () => {
    expect(calculateGP('A+')).toBe(1);
  });

  it('maps G to the worst point (10)', () => {
    expect(calculateGP('G')).toBe(10);
  });

  it('maps every grade to a unique point 1-10', () => {
    const points = (['A+', 'A', 'A-', 'B+', 'B', 'C+', 'C', 'D', 'E', 'G'] as const).map(calculateGP);
    expect(new Set(points).size).toBe(10);
    expect(Math.min(...points)).toBe(1);
    expect(Math.max(...points)).toBe(10);
  });
});

describe('gradeFromPoint', () => {
  it('round-trips with calculateGP', () => {
    expect(gradeFromPoint(calculateGP('B+'))).toBe('B+');
  });

  it('clamps out-of-range points instead of throwing', () => {
    expect(gradeFromPoint(0)).toBe('A+');
    expect(gradeFromPoint(99)).toBe('G');
  });
});

describe('gradeFromPercentage', () => {
  it('classifies boundary values into the correct band', () => {
    expect(gradeFromPercentage(100)).toBe('A+');
    expect(gradeFromPercentage(90)).toBe('A+');
    expect(gradeFromPercentage(89)).toBe('A');
    expect(gradeFromPercentage(40)).toBe('D');
    expect(gradeFromPercentage(29)).toBe('G');
    expect(gradeFromPercentage(0)).toBe('G');
  });
});

describe('isPass / resultStatus', () => {
  it('treats every grade except G as a pass', () => {
    expect(isPass('E')).toBe(true);
    expect(isPass('G')).toBe(false);
    expect(resultStatus('D')).toBe('PASS');
    expect(resultStatus('G')).toBe('FAIL');
  });
});

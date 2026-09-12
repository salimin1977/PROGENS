// Central grading utility — the ONLY place grade <-> point <-> percentage
// conversions happen. Every engine and service must import from here
// instead of re-deriving grade logic.
//
// PROGENS uses the Malaysian convention: grade point 1 (A+) is the best,
// 10 (G) is the worst — the same "lower is better" direction as GPS/GPMP.

import type { Grade, ResultStatus } from '../types/schema';

export const GRADE_ORDER: Grade[] = ['A+', 'A', 'A-', 'B+', 'B', 'C+', 'C', 'D', 'E', 'G'];

const GRADE_TO_POINT: Record<Grade, number> = {
  'A+': 1, A: 2, 'A-': 3, 'B+': 4, B: 5, 'C+': 6, C: 7, D: 8, E: 9, G: 10,
};

const POINT_TO_GRADE: Record<number, Grade> = Object.fromEntries(
  GRADE_ORDER.map((g) => [GRADE_TO_POINT[g], g])
) as Record<number, Grade>;

// Percentage band each grade occupies. Used only to synthesize a plausible
// `marks`/`percentage` for a chosen grade point — the grade itself is the
// source of truth, not something re-derived from marks.
const GRADE_PERCENTAGE_BAND: Record<Grade, [number, number]> = {
  'A+': [90, 100],
  A: [80, 89],
  'A-': [75, 79],
  'B+': [70, 74],
  B: [65, 69],
  'C+': [60, 64],
  C: [50, 59],
  D: [40, 49],
  E: [30, 39],
  G: [0, 29],
};

/** Grade -> grade point (1 = A+, 10 = G). */
export function calculateGP(grade: Grade): number {
  return GRADE_TO_POINT[grade];
}

/** Grade point (1-10) -> grade label. Clamps to the nearest valid point. */
export function gradeFromPoint(point: number): Grade {
  const clamped = Math.min(10, Math.max(1, Math.round(point)));
  return POINT_TO_GRADE[clamped];
}

/** Percentage marks -> grade, using the fixed PROGENS grade bands. */
export function gradeFromPercentage(percentage: number): Grade {
  for (const grade of GRADE_ORDER) {
    const [min, max] = GRADE_PERCENTAGE_BAND[grade];
    if (percentage >= min && percentage <= max) return grade;
  }
  return 'G';
}

export function percentageBandFor(grade: Grade): [number, number] {
  return GRADE_PERCENTAGE_BAND[grade];
}

/** A result is a PASS unless graded G. */
export function isPass(grade: Grade): boolean {
  return grade !== 'G';
}

export function resultStatus(grade: Grade): ResultStatus {
  return isPass(grade) ? 'PASS' : 'FAIL';
}

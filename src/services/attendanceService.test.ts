import { describe, expect, it } from 'vitest';
import { getAttendanceRisk } from './attendanceService';
import { ATTENDANCE_FLAG_THRESHOLD } from '../engines/attendanceEngine';

// Exercises against the real seeded dataset (via the default MockDataProvider)
// rather than a hand-built fixture, since the point of this test is the
// threshold parameter's behaviour, not attendance-rate arithmetic (already
// covered in attendanceEngine.test.ts... — see calculateAttendanceRate call
// sites for that).

describe('getAttendanceRisk', () => {
  it('defaults to the standard 90% flag threshold', async () => {
    const [atDefault, atExplicit90] = await Promise.all([getAttendanceRisk(), getAttendanceRisk(ATTENDANCE_FLAG_THRESHOLD)]);
    expect(atDefault.map((e) => e.studentId).sort()).toEqual(atExplicit90.map((e) => e.studentId).sort());
  });

  it('is configurable — a stricter threshold flags at least as many students', async () => {
    const at80 = await getAttendanceRisk(80);
    const at95 = await getAttendanceRisk(95);
    expect(at95.length).toBeGreaterThanOrEqual(at80.length);
  });

  it('every flagged entry is genuinely below the requested threshold', async () => {
    const threshold = 92;
    const flagged = await getAttendanceRisk(threshold);
    for (const entry of flagged) {
      expect(entry.rate).toBeLessThan(threshold);
    }
  });
});

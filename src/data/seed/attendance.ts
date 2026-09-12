import type { AttendanceRecord, AttendanceStatus } from '../../types/schema';
import { mulberry32, randFloat, type Rng } from '../random';
import { students } from './students';

// A sampled school calendar (2 representative days/month across 10 months)
// rather than a full daily log — enough real rows for monthly/yearly
// attendance aggregation without generating tens of thousands of records.
const SAMPLE_DATES: string[] = [
  '2026-01-14', '2026-01-28',
  '2026-02-11', '2026-02-25',
  '2026-03-11', '2026-03-25',
  '2026-04-08', '2026-04-22',
  '2026-05-06', '2026-05-20',
  '2026-06-10', '2026-06-24',
  '2026-07-08', '2026-07-22',
  '2026-08-12', '2026-08-26',
  '2026-09-09', '2026-09-23',
  '2026-10-07', '2026-10-21',
];

function pickStatus(rng: Rng, targetRate: number): AttendanceStatus {
  const roll = rng();
  if (roll < targetRate) return 'PRESENT';
  if (roll < targetRate + 0.35 * (1 - targetRate)) return 'LATE';
  if (roll < targetRate + 0.55 * (1 - targetRate)) return 'EXCUSED';
  return 'ABSENT';
}

const rng = mulberry32(20260303);

export const attendance: AttendanceRecord[] = students.flatMap((student) => {
  // Each student is assigned a personal attendance tendency so the sampled
  // days converge to a realistic, student-specific yearly rate.
  const tendencyRoll = rng();
  let targetRate: number;
  if (tendencyRoll < 0.08) targetRate = randFloat(rng, 0.62, 0.79, 2);
  else if (tendencyRoll < 0.22) targetRate = randFloat(rng, 0.8, 0.89, 2);
  else targetRate = randFloat(rng, 0.9, 1.0, 2);

  return SAMPLE_DATES.map((date, i) => {
    const status = pickStatus(rng, targetRate);
    return {
      id: `att-${student.id}-${i}`,
      student_id: student.id,
      date,
      status,
      class_id: student.class_id,
      reason: status === 'EXCUSED' ? 'Medical certificate' : status === 'ABSENT' ? null : null,
    };
  });
});

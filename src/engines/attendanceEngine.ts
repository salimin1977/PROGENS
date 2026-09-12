// Attendance Engine — turns raw daily attendance rows into the rates and
// rollups every dashboard needs. PRESENT and LATE both count as "attended"
// (the student was physically in school); ABSENT and EXCUSED do not.

import type { AttendanceRecord } from '../types/schema';

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calculateAttendanceRate(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  const attended = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  return round((attended / records.length) * 100);
}

export interface MonthlyAttendance {
  month: string;
  rate: number;
}

export function calculateMonthlyAttendance(records: AttendanceRecord[]): MonthlyAttendance[] {
  const byMonth = new Map<string, AttendanceRecord[]>();
  for (const record of records) {
    const month = record.date.slice(0, 7); // YYYY-MM
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month)!.push(record);
  }
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthRecords]) => ({ month, rate: calculateAttendanceRate(monthRecords) }));
}

export function calculateYearlyAttendance(records: AttendanceRecord[]): number {
  return calculateAttendanceRate(records);
}

/** Attendance dashboards must flag any student below this rate. */
export const ATTENDANCE_FLAG_THRESHOLD = 90;

export function isAttendanceFlagged(rate: number, threshold = ATTENDANCE_FLAG_THRESHOLD): boolean {
  return rate < threshold;
}

export function calculateChronicAbsenceCount(studentRates: Map<string, number>, threshold = 80): number {
  return Array.from(studentRates.values()).filter((rate) => rate < threshold).length;
}

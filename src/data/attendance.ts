import type { AttendanceByClass, AttendanceTrendEntry, RiskAttendanceBucket } from '../types';
import { CLASSES, students } from './students';

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

export const attendanceByClass: AttendanceByClass[] = CLASSES.map((c) => ({
  className: c.name,
  rate: average(students.filter((s) => s.className === c.name).map((s) => s.attendanceRate)),
}));

export const attendanceTrend: AttendanceTrendEntry[] = [
  { month: 'Jan', rate: 95.8 },
  { month: 'Feb', rate: 95.1 },
  { month: 'Mar', rate: 94.6 },
  { month: 'Apr', rate: 93.9 },
  { month: 'May', rate: 93.2 },
  { month: 'Jun', rate: 94.0 },
  { month: 'Jul', rate: 94.4 },
  { month: 'Aug', rate: 94.3 },
];

export const riskVsAttendance: RiskAttendanceBucket[] = [
  { band: '< 80%', studentCount: students.filter((s) => s.attendanceRate < 80).length, avgRisk: 3.6 },
  { band: '80% - 89%', studentCount: students.filter((s) => s.attendanceRate >= 80 && s.attendanceRate < 90).length, avgRisk: 2.4 },
  { band: '90% - 94%', studentCount: students.filter((s) => s.attendanceRate >= 90 && s.attendanceRate < 95).length, avgRisk: 1.5 },
  { band: '95% - 100%', studentCount: students.filter((s) => s.attendanceRate >= 95).length, avgRisk: 0.7 },
];

export const attendanceKpi = {
  overallRate: average(students.map((s) => s.attendanceRate)),
  chronicAbsence: students.filter((s) => s.attendanceRate < 80).length,
  below90: students.filter((s) => s.attendanceRate < 90).length,
  below80: students.filter((s) => s.attendanceRate < 80).length,
  target: 97,
};

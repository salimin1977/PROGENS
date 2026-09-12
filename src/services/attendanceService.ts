import type { AttendanceByClass, AttendanceTrendEntry, RiskAttendanceBucket } from '../types';
import type { AttendanceRecord } from '../types/schema';
import {
  ATTENDANCE_FLAG_THRESHOLD,
  calculateAttendanceRate,
  calculateChronicAbsenceCount,
  calculateMonthlyAttendance,
  type MonthlyAttendance,
} from '../engines/attendanceEngine';
import { loadCoreDataset } from './dataset';
import { buildRiskLookup } from './riskLookup';
import { getDataProvider } from '../providers';

export interface AttendanceOverview {
  overallRate: number;
  chronicAbsence: number;
  below90: number;
  below80: number;
  target: number;
  byClass: AttendanceByClass[];
  trend: AttendanceTrendEntry[];
  riskVsAttendance: RiskAttendanceBucket[];
}

export async function getAttendanceOverview(): Promise<AttendanceOverview> {
  const dataset = await loadCoreDataset();
  const riskLookup = buildRiskLookup(dataset);

  const byStudentRate = new Map<string, number>();
  for (const student of dataset.students) {
    const records = dataset.attendance.filter((a) => a.student_id === student.id);
    byStudentRate.set(student.id, calculateAttendanceRate(records));
  }

  const rates = Array.from(byStudentRate.values());
  const overallRate = Math.round((rates.reduce((a, b) => a + b, 0) / (rates.length || 1)) * 10) / 10;

  const byClass: AttendanceByClass[] = dataset.classes.map((c) => {
    const classStudentIds = dataset.students.filter((s) => s.class_id === c.id).map((s) => s.id);
    const classRates = classStudentIds.map((id) => byStudentRate.get(id) ?? 0);
    return { className: c.name, rate: Math.round((classRates.reduce((a, b) => a + b, 0) / (classRates.length || 1)) * 10) / 10 };
  });

  const trend: AttendanceTrendEntry[] = calculateMonthlyAttendance(dataset.attendance).map((m) => ({ month: m.month.slice(5), rate: m.rate }));

  const bands: { band: string; min: number; max: number }[] = [
    { band: '< 80%', min: 0, max: 79.999 },
    { band: '80% - 89%', min: 80, max: 89.999 },
    { band: '90% - 94%', min: 90, max: 94.999 },
    { band: '95% - 100%', min: 95, max: 100 },
  ];

  const riskVsAttendance: RiskAttendanceBucket[] = bands.map(({ band, min, max }) => {
    const studentsInBand = dataset.students.filter((s) => {
      const rate = byStudentRate.get(s.id) ?? 0;
      return rate >= min && rate <= max;
    });
    const avgRiskScore = average(studentsInBand.map((s) => riskLookup.get(s.id)?.risk_score ?? 0));
    return { band, studentCount: studentsInBand.length, avgRisk: Math.round((avgRiskScore / 20) * 10) / 10 };
  });

  return {
    overallRate,
    chronicAbsence: calculateChronicAbsenceCount(byStudentRate, 80),
    below90: Array.from(byStudentRate.values()).filter((r) => r < ATTENDANCE_FLAG_THRESHOLD).length,
    below80: calculateChronicAbsenceCount(byStudentRate, 80),
    target: 97,
    byClass,
    trend,
    riskVsAttendance,
  };
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// --- Granular attendance accessors ------------------------------------

export async function getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
  return getDataProvider().getAttendance({ studentId });
}

export async function getClassAttendance(classId: string): Promise<AttendanceRecord[]> {
  return getDataProvider().getAttendance({ classId });
}

/** Monthly attendance rollup, optionally scoped to one student. */
export async function getMonthlyAttendance(studentId?: string): Promise<MonthlyAttendance[]> {
  const records = await getDataProvider().getAttendance(studentId ? { studentId } : {});
  return calculateMonthlyAttendance(records);
}

export interface AttendanceRiskEntry {
  studentId: string;
  rate: number;
}

/**
 * Students below the attendance threshold — defaults to the standard
 * 90% flag (ATTENDANCE_FLAG_THRESHOLD) but accepts any threshold so
 * callers are not locked to one fixed cutoff.
 */
export async function getAttendanceRisk(threshold: number = ATTENDANCE_FLAG_THRESHOLD): Promise<AttendanceRiskEntry[]> {
  const dataset = await loadCoreDataset();
  const entries: AttendanceRiskEntry[] = [];
  for (const student of dataset.students) {
    const records = dataset.attendance.filter((a) => a.student_id === student.id);
    const rate = calculateAttendanceRate(records);
    if (rate < threshold) entries.push({ studentId: student.id, rate });
  }
  return entries;
}

import type { Student } from '../types';
import { calculateAttendanceRate } from './attendanceAnalytics';

export interface SchoolKpis { gpsCurrent: number; gpsTarget: number; gpsGap: number; totalStudents: number; studentsAtRisk: number; activeInterventions: number; attendance: number; excellenceStudents: number; }

export const calculateGPSGap = (current: number, target: number): number => Math.round((current - target) * 100) / 100;
export const calculateSchoolKpis = (students: Student[], activeInterventions: number, currentGPS = 5.11, targetGPS = 4.84): SchoolKpis => ({
  gpsCurrent: currentGPS,
  gpsTarget: targetGPS,
  gpsGap: calculateGPSGap(currentGPS, targetGPS),
  totalStudents: students.length,
  studentsAtRisk: students.filter((s) => s.riskLevel === 'Critical' || s.riskLevel === 'High').length,
  activeInterventions,
  attendance: Math.round(calculateAttendanceRate(students) * 10) / 10,
  excellenceStudents: students.filter((s) => s.status === 'Excellence Track').length,
});

import type { Student } from '../types';

export const calculateAttendanceRate = (students: Student[]): number => students.length ? students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length : 0;
export const getAttendanceRisk = (student: Student, threshold = 90): boolean => student.attendanceRate < threshold;
export const calculateAttendanceRiskCount = (students: Student[], threshold = 90): number => students.filter((s) => getAttendanceRisk(s, threshold)).length;

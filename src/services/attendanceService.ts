import type { Student } from '../types';
import { mockDataProvider } from '../providers/MockDataProvider';

export const ATTENDANCE_RISK_THRESHOLD = 90;
export const getStudentAttendance = async (studentId: string) => (await mockDataProvider.getAttendance()).filter((r) => r.studentId === studentId);
export const getClassAttendance = async (className: string) => {
  const students = (await mockDataProvider.getStudents()).filter((s) => s.className === className);
  return students.map((s) => ({ studentId: s.id, rate: s.attendanceRate }));
};
export const getMonthlyAttendance = async () => mockDataProvider.getAttendance();
export const getAttendanceRisk = async (threshold = ATTENDANCE_RISK_THRESHOLD): Promise<Student[]> => (await mockDataProvider.getStudents()).filter((s) => s.attendanceRate < threshold);

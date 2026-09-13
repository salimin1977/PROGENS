import type { Student } from '../types';
import { getConfiguredProvider } from '../providers';
import { getStudents } from './studentService';

export const ATTENDANCE_RISK_THRESHOLD = 90;
export const getStudentAttendance = async (studentId: string) => (await getConfiguredProvider().getAttendance()).filter((r) => r.studentId === studentId);
export const getClassAttendance = async (className: string) => {
  const students = (await getStudents()).filter((s) => s.className === className);
  return students.map((s) => ({ studentId: s.id, rate: s.attendanceRate }));
};
export const getMonthlyAttendance = async () => getConfiguredProvider().getAttendance();
export const getAttendanceRisk = async (threshold = ATTENDANCE_RISK_THRESHOLD): Promise<Student[]> => (await getStudents()).filter((s) => s.attendanceRate < threshold);

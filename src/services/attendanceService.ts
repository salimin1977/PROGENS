import type { Student } from '../types';
import { getConfiguredProvider } from '../providers';

export const ATTENDANCE_RISK_THRESHOLD = 10;
const provider = () => getConfiguredProvider();

export const getAttendanceRecords = async () => provider().getAttendance();
export const getStudentAttendance = async (studentId: string) => (await getAttendanceRecords()).filter((record) => record.studentId === studentId);
export const getClassAttendance = async (className: string) => {
  const [students, records] = await Promise.all([provider().getStudents(), getAttendanceRecords()]);
  const ids = new Set(students.filter((student) => student.className === className).map((student) => student.id));
  return records.filter((record) => ids.has(record.studentId));
};
export const getMonthlyAttendance = async () => getAttendanceRecords();
export const getAttendanceRisk = async (threshold = ATTENDANCE_RISK_THRESHOLD): Promise<Student[]> => {
  const [students, records] = await Promise.all([provider().getStudents(), getAttendanceRecords()]);
  const absentByStudent = new Map(records.map((record) => [record.studentId, record.absentDays]));
  return students.filter((student) => (absentByStudent.get(student.id) ?? 0) >= threshold);
};

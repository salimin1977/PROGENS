import type { AcademicResult, AttendanceRecord, Intervention, KPI, Student } from '../types';

export interface DataProvider {
  getStudents(): Promise<Student[]>;
  getStudentById(id: string): Promise<Student | undefined>;
  getAcademicResults(): Promise<AcademicResult[]>;
  getAttendance(): Promise<AttendanceRecord[]>;
  getInterventions(): Promise<Intervention[]>;
  getKPIs(): Promise<KPI[]>;
}

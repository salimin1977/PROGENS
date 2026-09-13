import type { AcademicResult, AttendanceRecord, Intervention, KPI, Student } from '../types';
import type { DataProvider } from './DataProvider';
import { students } from '../data/students';
import { interventions } from '../data/interventions';

const results: AcademicResult[] = students.flatMap((student) =>
  student.subjects.map((subject, index) => ({
    id: `${student.id}-${index + 1}`,
    studentId: student.id,
    subject: subject.subject,
    assessment: 'PPT' as const,
    marks: subject.score,
    maximumMarks: 100,
    grade: subject.grade,
  }))
);

const attendance: AttendanceRecord[] = students.map((student) => ({
  id: `ATT-${student.id}`,
  studentId: student.id,
  date: '2026-08-31',
  rate: student.attendanceRate,
  absentDays: 0,
  academicYear: 2026,
  sourceLabel: 'Mock Dataset',
}));

export class MockDataProvider implements DataProvider {
  async getStudents(): Promise<Student[]> { return students; }
  async getStudentById(id: string): Promise<Student | undefined> { return students.find((student) => student.id === id); }
  async getAcademicResults(): Promise<AcademicResult[]> { return results; }
  async getAttendance(): Promise<AttendanceRecord[]> { return attendance; }
  async getInterventions(): Promise<Intervention[]> { return interventions; }
  async getKPIs(): Promise<KPI[]> { return []; }
}

export const mockDataProvider = new MockDataProvider();

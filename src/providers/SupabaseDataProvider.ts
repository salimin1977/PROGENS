import type { DataProvider } from './DataProvider';
import type { AcademicResult, AttendanceRecord, Intervention, KPI, Student } from '../types';

/** Phase 3 adapter boundary. No credentials are read or required in Phase 2. */
export class SupabaseDataProvider implements DataProvider {
  private unavailable(): never { throw new Error('Supabase provider is not configured. Use MockDataProvider in Phase 2.'); }
  async getStudents(): Promise<Student[]> { return this.unavailable(); }
  async getStudentById(_id: string): Promise<Student | undefined> { return this.unavailable(); }
  async getAcademicResults(): Promise<AcademicResult[]> { return this.unavailable(); }
  async getAttendance(): Promise<AttendanceRecord[]> { return this.unavailable(); }
  async getInterventions(): Promise<Intervention[]> { return this.unavailable(); }
  async getKPIs(): Promise<KPI[]> { return this.unavailable(); }
}

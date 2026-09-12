// DataProvider abstraction — the UI and services never import mock data or
// a Supabase client directly. They call getDataProvider() and depend only
// on this interface, so swapping MockDataProvider for SupabaseDataProvider
// later requires no UI changes.

import type {
  AcademicResult,
  AcademicYear,
  Assessment,
  AttendanceRecord,
  ClassRoom,
  DbIntervention,
  DbStudent,
  InterventionAction,
  KpiSnapshotRow,
  KpiTargetRow,
  School,
  Subject,
  Teacher,
} from '../types/schema';

export interface AcademicResultFilter {
  studentId?: string;
  classId?: string;
  subjectId?: string;
  assessmentId?: string;
}

export interface AttendanceFilter {
  studentId?: string;
  classId?: string;
}

export interface InterventionFilter {
  studentId?: string;
  status?: DbIntervention['status'];
}

export interface DataProvider {
  readonly name: string;

  getSchool(): Promise<School>;
  getAcademicYears(): Promise<AcademicYear[]>;
  getCurrentAcademicYear(): Promise<AcademicYear>;

  getStudents(): Promise<DbStudent[]>;
  getStudentById(id: string): Promise<DbStudent | null>;

  getTeachers(): Promise<Teacher[]>;
  getTeacherById(id: string): Promise<Teacher | null>;

  getClasses(): Promise<ClassRoom[]>;
  getClassById(id: string): Promise<ClassRoom | null>;

  getSubjects(): Promise<Subject[]>;
  getAssessments(): Promise<Assessment[]>;

  getAcademicResults(filter?: AcademicResultFilter): Promise<AcademicResult[]>;
  getAttendance(filter?: AttendanceFilter): Promise<AttendanceRecord[]>;

  getInterventions(filter?: InterventionFilter): Promise<DbIntervention[]>;
  getInterventionActions(interventionId: string): Promise<InterventionAction[]>;

  getKpiTargets(): Promise<Omit<KpiTargetRow, 'status'>[]>;
  getKpiSnapshots(kpiName?: string): Promise<KpiSnapshotRow[]>;

  /**
   * Student ids for a named demonstration roster (NOVA/SUPERNOVA), in rank
   * order, if the backend pins one. Returns [] when it doesn't — callers
   * should fall back to computing the top-N themselves in that case, which
   * is exactly what a live deployment without a pinned roster should do.
   */
  getFlagshipRoster(program: 'NOVA' | 'SUPERNOVA'): Promise<string[]>;
}

export class DataProviderError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'DataProviderError';
  }
}

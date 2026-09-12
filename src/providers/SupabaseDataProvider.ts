// SupabaseDataProvider — the real backend, implementing the exact same
// DataProvider contract as MockDataProvider. Not exercised in the demo
// (no Supabase project is required to run PROGENS), but ready to activate
// the moment VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are configured —
// see supabase/migrations for the schema this expects.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AcademicResultFilter,
  AttendanceFilter,
  DataProvider,
  InterventionFilter,
  NewInterventionInput,
  UpdateInterventionInput,
} from './DataProvider';
import { DataProviderError } from './DataProvider';
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

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>, context: string): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new DataProviderError(`Supabase query failed: ${context}`, error);
  if (data === null) throw new DataProviderError(`Supabase query returned no data: ${context}`);
  return data;
}

export class SupabaseDataProvider implements DataProvider {
  readonly name = 'supabase';
  private client: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey);
  }

  async getSchool(): Promise<School> {
    const rows = await unwrap<School[]>(this.client.from('schools').select('*').limit(1), 'schools');
    if (!rows[0]) throw new DataProviderError('No school record found');
    return rows[0];
  }

  async getAcademicYears(): Promise<AcademicYear[]> {
    return unwrap(this.client.from('academic_years').select('*').order('year'), 'academic_years');
  }

  async getCurrentAcademicYear(): Promise<AcademicYear> {
    const rows = await unwrap<AcademicYear[]>(
      this.client.from('academic_years').select('*').eq('is_current', true).limit(1),
      'academic_years (current)'
    );
    if (!rows[0]) throw new DataProviderError('No current academic year configured');
    return rows[0];
  }

  async getStudents(): Promise<DbStudent[]> {
    return unwrap(this.client.from('students').select('*'), 'students');
  }

  async getStudentById(id: string): Promise<DbStudent | null> {
    const { data, error } = await this.client.from('students').select('*').eq('id', id).maybeSingle();
    if (error) throw new DataProviderError('Supabase query failed: students by id', error);
    return data;
  }

  async getTeachers(): Promise<Teacher[]> {
    return unwrap(this.client.from('teachers').select('*'), 'teachers');
  }

  async getTeacherById(id: string): Promise<Teacher | null> {
    const { data, error } = await this.client.from('teachers').select('*').eq('id', id).maybeSingle();
    if (error) throw new DataProviderError('Supabase query failed: teachers by id', error);
    return data;
  }

  async getClasses(): Promise<ClassRoom[]> {
    return unwrap(this.client.from('classes').select('*'), 'classes');
  }

  async getClassById(id: string): Promise<ClassRoom | null> {
    const { data, error } = await this.client.from('classes').select('*').eq('id', id).maybeSingle();
    if (error) throw new DataProviderError('Supabase query failed: classes by id', error);
    return data;
  }

  async getSubjects(): Promise<Subject[]> {
    return unwrap(this.client.from('subjects').select('*'), 'subjects');
  }

  async getAssessments(): Promise<Assessment[]> {
    return unwrap(this.client.from('assessments').select('*').order('date'), 'assessments');
  }

  async getAcademicResults(filter: AcademicResultFilter = {}): Promise<AcademicResult[]> {
    let query = this.client.from('academic_results').select('*');
    if (filter.studentId) query = query.eq('student_id', filter.studentId);
    if (filter.subjectId) query = query.eq('subject_id', filter.subjectId);
    if (filter.assessmentId) query = query.eq('assessment_id', filter.assessmentId);
    // filter.classId requires a join through students; left to a Postgres
    // view (v_academic_results_with_class) in a real deployment.
    return unwrap(query, 'academic_results');
  }

  async getAttendance(filter: AttendanceFilter = {}): Promise<AttendanceRecord[]> {
    let query = this.client.from('attendance').select('*');
    if (filter.studentId) query = query.eq('student_id', filter.studentId);
    if (filter.classId) query = query.eq('class_id', filter.classId);
    return unwrap(query, 'attendance');
  }

  async getInterventions(filter: InterventionFilter = {}): Promise<DbIntervention[]> {
    let query = this.client.from('interventions').select('*');
    if (filter.studentId) query = query.eq('student_id', filter.studentId);
    if (filter.status) query = query.eq('status', filter.status);
    return unwrap(query, 'interventions');
  }

  async getInterventionActions(interventionId: string): Promise<InterventionAction[]> {
    return unwrap(
      this.client.from('intervention_actions').select('*').eq('intervention_id', interventionId).order('action_date'),
      'intervention_actions'
    );
  }

  async createIntervention(input: NewInterventionInput): Promise<DbIntervention> {
    const row = await unwrap<DbIntervention[]>(
      this.client
        .from('interventions')
        .insert({ ...input, status: input.status ?? 'PLANNED', outcome: null })
        .select(),
      'interventions (create)'
    );
    return row[0];
  }

  async updateIntervention(id: string, patch: UpdateInterventionInput): Promise<DbIntervention> {
    const row = await unwrap<DbIntervention[]>(
      this.client.from('interventions').update(patch).eq('id', id).select(),
      'interventions (update)'
    );
    if (!row[0]) throw new DataProviderError(`Intervention "${id}" does not exist`);
    return row[0];
  }

  async closeIntervention(id: string, outcome: string): Promise<DbIntervention> {
    return this.updateIntervention(id, { status: 'CLOSED', outcome });
  }

  async addInterventionAction(action: Omit<InterventionAction, 'id'>): Promise<InterventionAction> {
    const row = await unwrap<InterventionAction[]>(
      this.client.from('intervention_actions').insert(action).select(),
      'intervention_actions (create)'
    );
    return row[0];
  }

  async getKpiTargets(): Promise<Omit<KpiTargetRow, 'status'>[]> {
    return unwrap(this.client.from('kpi_targets').select('*'), 'kpi_targets');
  }

  async getKpiSnapshots(kpiName?: string): Promise<KpiSnapshotRow[]> {
    let query = this.client.from('kpi_snapshots').select('*').order('snapshot_date');
    if (kpiName) query = query.eq('kpi_name', kpiName);
    return unwrap(query, 'kpi_snapshots');
  }

  async getFlagshipRoster(): Promise<string[]> {
    // No pinned-roster table in the live schema — callers fall back to
    // computing the top-N by GPM themselves, which is the correct
    // behaviour for a real deployment.
    return [];
  }
}

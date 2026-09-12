import type {
  AcademicResultFilter,
  AttendanceFilter,
  DataProvider,
  InterventionFilter,
  NewInterventionInput,
  UpdateInterventionInput,
} from './DataProvider';
import { DataProviderError } from './DataProvider';
import * as seed from '../data/seed';
import type { DbIntervention, InterventionAction } from '../types/schema';

// Wraps every call in Promise.resolve() so it behaves like a real async
// backend (and so it can be swapped for SupabaseDataProvider without
// changing any calling code).
export class MockDataProvider implements DataProvider {
  readonly name = 'mock';

  // Interventions/actions are cloned into instance state (rather than
  // read straight from src/data/seed) so create/update/close can mutate
  // them without corrupting the shared seed module — every other getter
  // stays a direct read of the immutable seed data.
  private interventions: DbIntervention[] = seed.interventions.map((i) => ({ ...i }));
  private interventionActions: InterventionAction[] = seed.interventionActions.map((a) => ({ ...a }));
  private nextInterventionId = seed.interventions.length + 1;
  private nextActionId = seed.interventionActions.length + 1;

  async getSchool() {
    return seed.SCHOOL;
  }

  async getAcademicYears() {
    return [seed.ACADEMIC_YEAR];
  }

  async getCurrentAcademicYear() {
    return seed.ACADEMIC_YEAR;
  }

  async getStudents() {
    return seed.students;
  }

  async getStudentById(id: string) {
    return seed.students.find((s) => s.id === id) ?? null;
  }

  async getTeachers() {
    return seed.TEACHERS;
  }

  async getTeacherById(id: string) {
    return seed.TEACHERS.find((t) => t.id === id) ?? null;
  }

  async getClasses() {
    return seed.CLASS_ROOMS;
  }

  async getClassById(id: string) {
    return seed.CLASS_ROOMS.find((c) => c.id === id) ?? null;
  }

  async getSubjects() {
    return seed.SUBJECTS;
  }

  async getAssessments() {
    return seed.ASSESSMENTS;
  }

  async getAcademicResults(filter: AcademicResultFilter = {}) {
    let results = seed.academicResults;
    if (filter.studentId) results = results.filter((r) => r.student_id === filter.studentId);
    if (filter.subjectId) results = results.filter((r) => r.subject_id === filter.subjectId);
    if (filter.assessmentId) results = results.filter((r) => r.assessment_id === filter.assessmentId);
    if (filter.classId) {
      const studentIds = new Set(seed.students.filter((s) => s.class_id === filter.classId).map((s) => s.id));
      results = results.filter((r) => studentIds.has(r.student_id));
    }
    return results;
  }

  async getAttendance(filter: AttendanceFilter = {}) {
    let records = seed.attendance;
    if (filter.studentId) records = records.filter((a) => a.student_id === filter.studentId);
    if (filter.classId) records = records.filter((a) => a.class_id === filter.classId);
    return records;
  }

  async getInterventions(filter: InterventionFilter = {}) {
    // .slice()/.filter() both already copy — this.interventions itself is
    // mutable (create/update push/replace into it), so callers must never
    // get back the live internal array, only a snapshot of it.
    let rows = this.interventions.slice();
    if (filter.studentId) rows = rows.filter((i) => i.student_id === filter.studentId);
    if (filter.status) rows = rows.filter((i) => i.status === filter.status);
    return rows;
  }

  async getInterventionActions(interventionId: string) {
    return this.interventionActions.filter((a) => a.intervention_id === interventionId);
  }

  async createIntervention(input: NewInterventionInput): Promise<DbIntervention> {
    const now = new Date().toISOString();
    const row: DbIntervention = {
      id: `int-new-${this.nextInterventionId++}`,
      student_id: input.student_id,
      category: input.category,
      risk_level: input.risk_level,
      problem: input.problem,
      objective: input.objective,
      strategy: input.strategy,
      teacher_id: input.teacher_id,
      start_date: input.start_date,
      target_date: input.target_date,
      status: input.status ?? 'PLANNED',
      outcome: null,
      created_at: now,
      updated_at: now,
    };
    this.interventions.push(row);
    return { ...row };
  }

  async updateIntervention(id: string, patch: UpdateInterventionInput): Promise<DbIntervention> {
    const index = this.interventions.findIndex((i) => i.id === id);
    if (index === -1) throw new DataProviderError(`Intervention "${id}" does not exist`);
    const updated: DbIntervention = { ...this.interventions[index], ...patch, updated_at: new Date().toISOString() };
    this.interventions[index] = updated;
    return { ...updated };
  }

  async closeIntervention(id: string, outcome: string): Promise<DbIntervention> {
    return this.updateIntervention(id, { status: 'CLOSED', outcome });
  }

  async addInterventionAction(action: Omit<InterventionAction, 'id'>): Promise<InterventionAction> {
    const row: InterventionAction = { ...action, id: `int-new-act-${this.nextActionId++}` };
    this.interventionActions.push(row);
    return { ...row };
  }

  async getKpiTargets() {
    return seed.KPI_TARGETS_SEED;
  }

  async getKpiSnapshots(kpiName?: string) {
    return kpiName ? seed.KPI_SNAPSHOTS_SEED.filter((s) => s.kpi_name === kpiName) : seed.KPI_SNAPSHOTS_SEED;
  }

  async getFlagshipRoster(program: 'NOVA' | 'SUPERNOVA') {
    return program === 'NOVA' ? seed.novaStudentIds : seed.supernovaStudentIds;
  }
}

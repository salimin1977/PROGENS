import type { AcademicResultFilter, AttendanceFilter, DataProvider, InterventionFilter } from './DataProvider';
import * as seed from '../data/seed';

// Wraps every call in Promise.resolve() so it behaves like a real async
// backend (and so it can be swapped for SupabaseDataProvider without
// changing any calling code).
export class MockDataProvider implements DataProvider {
  readonly name = 'mock';

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
    let rows = seed.interventions;
    if (filter.studentId) rows = rows.filter((i) => i.student_id === filter.studentId);
    if (filter.status) rows = rows.filter((i) => i.status === filter.status);
    return rows;
  }

  async getInterventionActions(interventionId: string) {
    return seed.interventionActions.filter((a) => a.intervention_id === interventionId);
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

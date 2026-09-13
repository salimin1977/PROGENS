import type { AcademicResult, AttendanceRecord, Intervention, KPI, Student } from '../types';
import type { DataProvider } from './DataProvider';
import { supabase } from '../lib/supabase';

const riskMap: Record<string, Student['riskLevel']> = {
  CRITICAL: 'Critical', HIGH: 'High', MODERATE: 'Moderate', LOW: 'Low', UNASSESSED: 'Unassessed',
};

function client() {
  if (!supabase) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  return supabase;
}

export class SupabaseDataProvider implements DataProvider {
  async getStudents(): Promise<Student[]> {
    const db = client();
    const [studentQuery, classQuery, resultQuery, riskQuery] = await Promise.all([
      db.from('students').select('id,name,class_id,form').eq('status', 'ACTIVE').order('name'),
      db.from('classes').select('id,name,form'),
      db.from('academic_results').select('student_id,subject_id,marks,max_marks,grade'),
      db.from('student_risk_profiles').select('student_id,risk_level'),
    ]);
    if (studentQuery.error) throw studentQuery.error;
    if (classQuery.error) throw classQuery.error;
    if (resultQuery.error) throw resultQuery.error;
    if (riskQuery.error) throw riskQuery.error;

    const classMap = new Map((classQuery.data ?? []).map((row) => [row.id, row.name]));
    const subjectIds = [...new Set((resultQuery.data ?? []).map((row) => row.subject_id))];
    const { data: subjects, error: subjectError } = subjectIds.length
      ? await db.from('subjects').select('id,name').in('id', subjectIds)
      : { data: [], error: null };
    if (subjectError) throw subjectError;
    const subjectMap = new Map((subjects ?? []).map((row) => [row.id, row.name]));
    const riskMapByStudent = new Map((riskQuery.data ?? []).map((row) => [row.student_id, row.risk_level]));

    const resultsByStudent = new Map<string, typeof resultQuery.data>();
    for (const result of resultQuery.data ?? []) {
      const existing = resultsByStudent.get(result.student_id) ?? [];
      existing.push(result);
      resultsByStudent.set(result.student_id, existing);
    }

    return (studentQuery.data ?? []).map((row) => {
      const studentResults = resultsByStudent.get(row.id) ?? [];
      const validResults = studentResults.filter((result) => result.max_marks != null && Number(result.max_marks) > 0);
      const hasAssessment = validResults.length > 0;
      const academicScore = hasAssessment
        ? Math.round((validResults.reduce((sum, result) => sum + (Number(result.marks ?? 0) / Number(result.max_marks)) * 100, 0) / validResults.length) * 10) / 10
        : 0;
      const riskLevel = hasAssessment ? (riskMap[riskMapByStudent.get(row.id) ?? 'LOW'] ?? 'Low') : 'Unassessed';

      return {
        id: row.id, name: row.name, gender: 'Male', className: classMap.get(row.class_id) ?? '',
        form: `Tingkatan ${row.form}` as Student['form'], academicScore, attendanceRate: 0, riskLevel,
        status: hasAssessment && (riskLevel === 'Critical' || riskLevel === 'High') ? 'On Watch' : hasAssessment ? 'Active' : 'Unassessed',
        subjects: validResults.map((result) => ({ subject: subjectMap.get(result.subject_id) ?? result.subject_id, score: Math.round(Number(result.marks ?? 0) * 10) / 10, grade: result.grade ?? '' })),
        talents: [], stemTrack: false, stemReadiness: 0, progressTimeline: [], guardianContact: '',
        photoInitials: row.name.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase(),
      };
    });
  }

  async getStudentById(id: string) { return (await this.getStudents()).find((student) => student.id === id); }

  async getAcademicResults(): Promise<AcademicResult[]> {
    const db = client();
    const [{ data, error }, { data: subjects, error: subjectError }, { data: assessments, error: assessmentError }] = await Promise.all([
      db.from('academic_results').select('id,student_id,subject_id,assessment_id,marks,max_marks,grade'),
      db.from('subjects').select('id,name'),
      db.from('assessments').select('id,assessment_type'),
    ]);
    if (error) throw error;
    if (subjectError) throw subjectError;
    if (assessmentError) throw assessmentError;
    const subjectMap = new Map((subjects ?? []).map((row) => [row.id, row.name]));
    const assessmentMap = new Map((assessments ?? []).map((row) => [row.id, row.assessment_type]));
    return (data ?? []).map((row) => ({ id: row.id, studentId: row.student_id, subject: subjectMap.get(row.subject_id) ?? row.subject_id, assessment: (assessmentMap.get(row.assessment_id) ?? 'PPT') as AcademicResult['assessment'], marks: Number(row.marks ?? 0), maximumMarks: Number(row.max_marks ?? 100), grade: row.grade ?? '' }));
  }

  async getAttendance(): Promise<AttendanceRecord[]> {
    const { data, error } = await client().from('attendance_summary').select('id,student_id,academic_year,absent_days,source_label,updated_at').order('absent_days', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, studentId: row.student_id, date: row.updated_at?.slice(0, 10) ?? `${row.academic_year}-01-01`, absentDays: Number(row.absent_days ?? 0), academicYear: Number(row.academic_year ?? 2026), sourceLabel: row.source_label ?? 'Attendance summary' }));
  }

  async getInterventions(): Promise<Intervention[]> {
    const { data, error } = await client().from('interventions').select('id,student_id,intervention_type,priority,status,title,action_plan,started_at');
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, studentId: row.student_id, studentName: '', className: '', problem: row.title ?? '', interventionType: row.intervention_type ?? '', teacher: '', startDate: row.started_at?.slice(0, 10) ?? '', status: row.status === 'CLOSED' ? 'Completed' : 'Active', progress: 0, nextAction: row.action_plan ?? '', priority: row.priority === 'P1' ? 'Critical' : row.priority === 'P2' ? 'High' : 'Moderate' }));
  }

  async getKPIs(): Promise<KPI[]> {
    const { data, error } = await client().from('progens_dashboard_kpi').select('*');
    if (error) throw error;
    return (data ?? []) as KPI[];
  }
}

import type { AcademicResult, AttendanceRecord, Intervention, KPI, Student } from '../types';
import type { DataProvider } from './DataProvider';
import { supabase } from '../lib/supabase';

const riskMap: Record<string, Student['riskLevel']> = {
  CRITICAL: 'Critical', HIGH: 'High', MODERATE: 'Moderate', LOW: 'Low',
};

function client() {
  if (!supabase) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  return supabase;
}

export class SupabaseDataProvider implements DataProvider {
  async getStudents(): Promise<Student[]> {
    const db = client();
    const [{ data: students, error: studentError }, { data: classes, error: classError }, { data: results, error: resultError }] = await Promise.all([
      db.from('students').select('id,name,gender,class_id,form,risk_level').eq('is_active', true).order('name'),
      db.from('classes').select('id,name,form'),
      db.from('academic_results').select('student_id,subject_id,marks,maximum_marks,grade'),
    ]);
    if (studentError) throw studentError;
    if (classError) throw classError;
    if (resultError) throw resultError;

    const classMap = new Map((classes ?? []).map((row) => [row.id, row.name]));
    const subjectIds = [...new Set((results ?? []).map((row) => row.subject_id))];
    const { data: subjects, error: subjectError } = subjectIds.length
      ? await db.from('subjects').select('id,name').in('id', subjectIds)
      : { data: [], error: null };
    if (subjectError) throw subjectError;
    const subjectMap = new Map((subjects ?? []).map((row) => [row.id, row.name]));

    const resultsByStudent = new Map<string, typeof results>();
    for (const result of results ?? []) {
      const existing = resultsByStudent.get(result.student_id) ?? [];
      existing.push(result);
      resultsByStudent.set(result.student_id, existing);
    }

    return (students ?? []).map((row) => {
      const studentResults = resultsByStudent.get(row.id) ?? [];
      const validResults = studentResults.filter((result) => result.maximum_marks != null && Number(result.maximum_marks) > 0);
      const hasAssessment = validResults.length > 0;
      const academicScore = hasAssessment
        ? Math.round((validResults.reduce((sum, result) => sum + (Number(result.marks ?? 0) / Number(result.maximum_marks)) * 100, 0) / validResults.length) * 10) / 10
        : 0;
      const riskLevel = hasAssessment ? (riskMap[row.risk_level] ?? 'Low') : 'Unassessed';

      return {
        id: row.id,
        name: row.name,
        gender: row.gender === 'F' || row.gender === 'Female' ? 'Female' : 'Male',
        className: classMap.get(row.class_id) ?? '',
        form: row.form as Student['form'],
        academicScore,
        attendanceRate: 0,
        riskLevel,
        status: hasAssessment && (riskLevel === 'Critical' || riskLevel === 'High') ? 'On Watch' : hasAssessment ? 'Active' : 'Unassessed',
        subjects: validResults.map((result) => ({
          subject: subjectMap.get(result.subject_id) ?? result.subject_id,
          score: Math.round(Number(result.marks ?? 0) * 10) / 10,
          grade: result.grade ?? '',
        })),
        talents: [], stemTrack: false, stemReadiness: 0,
        progressTimeline: [], guardianContact: '',
        photoInitials: row.name.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase(),
      };
    });
  }

  async getStudentById(id: string) {
    return (await this.getStudents()).find((student) => student.id === id);
  }

  async getAcademicResults(): Promise<AcademicResult[]> {
    const db = client();
    const [{ data, error }, { data: subjects, error: subjectError }, { data: assessments, error: assessmentError }] = await Promise.all([
      db.from('academic_results').select('id,student_id,subject_id,assessment_id,marks,maximum_marks,grade'),
      db.from('subjects').select('id,name'),
      db.from('assessments').select('id,type'),
    ]);
    if (error) throw error;
    if (subjectError) throw subjectError;
    if (assessmentError) throw assessmentError;
    const subjectMap = new Map((subjects ?? []).map((row) => [row.id, row.name]));
    const assessmentMap = new Map((assessments ?? []).map((row) => [row.id, row.type]));
    return (data ?? []).map((row) => ({
      id: row.id, studentId: row.student_id, subject: subjectMap.get(row.subject_id) ?? row.subject_id,
      assessment: assessmentMap.get(row.assessment_id) ?? 'PPT', marks: Number(row.marks ?? 0),
      maximumMarks: Number(row.maximum_marks ?? 100), grade: row.grade ?? '',
    }));
  }

  async getAttendance(): Promise<AttendanceRecord[]> {
    const { data, error } = await client().from('attendance').select('id,student_id,date,rate');
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, studentId: row.student_id, date: row.date, rate: Number(row.rate ?? 0) }));
  }

  async getInterventions(): Promise<Intervention[]> {
    const { data, error } = await client().from('interventions').select('id,student_id,intervention_type,start_date,status,progress,next_action,priority');
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id, studentId: row.student_id, studentName: '', className: '', problem: '',
      interventionType: row.intervention_type ?? '', teacher: '', startDate: row.start_date,
      status: row.status, progress: Number(row.progress ?? 0), nextAction: row.next_action ?? '',
      priority: riskMap[row.priority] ?? 'Low',
    }));
  }

  async getKPIs(): Promise<KPI[]> {
    const { data, error } = await client().from('progens_dashboard_kpi').select('*');
    if (error) throw error;
    return (data ?? []) as KPI[];
  }
}

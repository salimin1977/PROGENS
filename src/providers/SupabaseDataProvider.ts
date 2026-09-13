import type { AcademicResult, AttendanceRecord, Intervention, KPI, Student } from '../types';
import type { DataProvider } from './DataProvider';
import { supabase } from '../lib/supabase';

const riskMap: Record<string, Student['riskLevel']> = { CRITICAL: 'Critical', HIGH: 'High', MODERATE: 'Moderate', LOW: 'Low' };

function client() {
  if (!supabase) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  return supabase;
}

export class SupabaseDataProvider implements DataProvider {
  async getStudents(): Promise<Student[]> {
    const { data, error } = await client().from('students').select('id,name,gender,class_id,form,risk_level').eq('is_active', true).order('name');
    if (error) throw error;
    return (data ?? []).map((row) => {
      const riskLevel = riskMap[row.risk_level] ?? 'Low';
      return {
        id: row.id, name: row.name,
        gender: row.gender === 'F' || row.gender === 'Female' ? 'Female' : 'Male',
        className: row.class_id ?? '', form: row.form as Student['form'],
        academicScore: 0, attendanceRate: 0, riskLevel,
        status: riskLevel === 'Critical' || riskLevel === 'High' ? 'On Watch' : 'Active',
        subjects: [], talents: [], stemTrack: false, stemReadiness: 0,
        progressTimeline: [], guardianContact: '',
        photoInitials: row.name.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase(),
      };
    });
  }

  async getStudentById(id: string) { return (await this.getStudents()).find((student) => student.id === id); }

  async getAcademicResults(): Promise<AcademicResult[]> {
    const { data, error } = await client().from('academic_results').select('id,student_id,subject_id,assessment_id,marks,maximum_marks,grade');
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, studentId: row.student_id, subject: row.subject_id, assessment: 'PPT', marks: Number(row.marks ?? 0), maximumMarks: Number(row.maximum_marks ?? 100), grade: row.grade ?? '' }));
  }

  async getAttendance(): Promise<AttendanceRecord[]> {
    const { data, error } = await client().from('attendance').select('id,student_id,date,rate');
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, studentId: row.student_id, date: row.date, rate: Number(row.rate ?? 0) }));
  }

  async getInterventions(): Promise<Intervention[]> {
    const { data, error } = await client().from('interventions').select('id,student_id,intervention_type,start_date,status,progress,next_action,priority');
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, studentId: row.student_id, studentName: '', className: '', problem: '', interventionType: row.intervention_type ?? '', teacher: '', startDate: row.start_date, status: row.status, progress: Number(row.progress ?? 0), nextAction: row.next_action ?? '', priority: riskMap[row.priority] ?? 'Low' }));
  }

  async getKPIs(): Promise<KPI[]> {
    const { data, error } = await client().from('progens_dashboard_kpi').select('*');
    if (error) throw error;
    return (data ?? []) as KPI[];
  }
}

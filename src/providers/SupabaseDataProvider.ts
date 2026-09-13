import type { DataProvider } from './DataProvider';
import type { AcademicResult, AttendanceRecord, Intervention, KPI, Student } from '../types';
import { isSupabaseConfigured, supabaseSelect } from '../lib/supabaseRest';

type DbStudent = {
  id: string;
  student_code: string;
  name: string;
  form: number;
  status: string;
  classes?: { name: string; form: number; stream: string | null } | null;
};

type DbResult = {
  id: string;
  student_id: string;
  marks: number;
  max_marks: number;
  grade: string | null;
  subjects?: { name: string } | null;
  assessments?: { assessment_type: AcademicResult['assessment'] } | null;
};

type DbAttendance = { id: string; student_id: string; attendance_date: string; present: boolean };

type DbIntervention = {
  id: string;
  student_id: string;
  intervention_type: string;
  priority: 'P1' | 'P2' | 'P3';
  status: 'ACTIVE' | 'CLOSED';
  title: string;
  action_plan: string | null;
  started_at: string;
};

type DbKpi = {
  id: string;
  kpi_code: string;
  kpi_name: string;
  value: number;
  target: number | null;
  unit: string | null;
};

const riskLevel = (value: string): Student['riskLevel'] => {
  if (value === 'CRITICAL') return 'Critical';
  if (value === 'HIGH') return 'High';
  if (value === 'MODERATE') return 'Moderate';
  return 'Low';
};

const studentStatus = (value: string): Student['status'] => {
  if (value === 'INACTIVE') return 'On Watch';
  if (value === 'GRADUATED') return 'Excellence Track';
  return 'Active';
};

export class SupabaseDataProvider implements DataProvider {
  async getStudents(): Promise<Student[]> {
    if (!isSupabaseConfigured) return [];
    const rows = await supabaseSelect<DbStudent>('students', 'select=id,student_code,name,form,status,classes(name,form,stream)&order=name.asc');
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      gender: 'Male',
      className: row.classes?.name ?? 'Tidak Ditentukan',
      form: `Tingkatan ${row.form}` as Student['form'],
      academicScore: 0,
      attendanceRate: 0,
      riskLevel: 'Low',
      status: studentStatus(row.status),
      subjects: [],
      talents: [],
      stemTrack: false,
      stemReadiness: 0,
      progressTimeline: [],
      guardianContact: '',
      photoInitials: row.name.split(/\s+/).map((part) => part[0] ?? '').slice(0, 2).join('').toUpperCase(),
    }));
  }

  async getStudentById(id: string): Promise<Student | undefined> {
    const rows = await supabaseSelect<DbStudent>('students', `select=id,student_code,name,form,status,classes(name,form,stream)&id=eq.${encodeURIComponent(id)}&limit=1`);
    if (rows.length === 0) return undefined;
    const students = await this.getStudents();
    return students.find((student) => student.id === id);
  }

  async getAcademicResults(): Promise<AcademicResult[]> {
    if (!isSupabaseConfigured) return [];
    const rows = await supabaseSelect<DbResult>('academic_results', 'select=id,student_id,marks,max_marks,grade,subjects(name),assessments(assessment_type)&order=created_at.asc');
    return rows.map((row) => ({
      id: row.id,
      studentId: row.student_id,
      subject: row.subjects?.name ?? 'Unknown',
      assessment: row.assessments?.assessment_type ?? 'PPT',
      marks: Number(row.marks),
      maximumMarks: Number(row.max_marks),
      grade: row.grade ?? '',
    }));
  }

  async getAttendance(): Promise<AttendanceRecord[]> {
    if (!isSupabaseConfigured) return [];
    const rows = await supabaseSelect<DbAttendance>('attendance', 'select=id,student_id,attendance_date,present&order=attendance_date.asc');
    return rows.map((row) => ({
      id: row.id,
      studentId: row.student_id,
      date: row.attendance_date,
      rate: row.present ? 100 : 0,
    }));
  }

  async getInterventions(): Promise<Intervention[]> {
    if (!isSupabaseConfigured) return [];
    const rows = await supabaseSelect<DbIntervention>('interventions', 'select=id,student_id,intervention_type,priority,status,title,action_plan,started_at&order=started_at.desc');
    const students = await supabaseSelect<DbStudent>('students', 'select=id,name,form,status,student_code');
    const byId = new Map(students.map((student) => [student.id, student]));
    return rows.map((row) => {
      const student = byId.get(row.student_id);
      return {
        id: row.id,
        studentId: row.student_id,
        studentName: student?.name ?? 'Unknown',
        className: 'Tidak Ditentukan',
        problem: row.action_plan ?? row.title,
        interventionType: row.intervention_type,
        teacher: '',
        startDate: row.started_at.slice(0, 10),
        status: row.status === 'ACTIVE' ? 'Active' : 'Completed',
        progress: row.status === 'CLOSED' ? 100 : 0,
        nextAction: row.action_plan ?? row.title,
        priority: riskLevel(row.priority === 'P1' ? 'CRITICAL' : row.priority === 'P2' ? 'HIGH' : 'LOW'),
      };
    });
  }

  async getKPIs(): Promise<KPI[]> {
    if (!isSupabaseConfigured) return [];
    const rows = await supabaseSelect<DbKpi>('kpi', 'select=id,kpi_code,kpi_name,value,target,unit&order=kpi_code.asc');
    return rows.map((row) => ({
      id: row.kpi_code,
      category: 'School',
      label: row.kpi_name,
      current: Number(row.value),
      target: Number(row.target ?? row.value),
      unit: row.unit === 'gps' ? 'gps' : row.unit === 'pts' ? 'pts' : row.unit === 'count' ? 'count' : '%',
      higherIsBetter: row.kpi_code !== 'GPS_CURRENT',
    }));
  }
}

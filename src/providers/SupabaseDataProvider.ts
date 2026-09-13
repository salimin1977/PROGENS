import type { DataProvider } from './DataProvider';
import type { AcademicResult, AttendanceRecord, Intervention, KPI, RiskLevel, Student } from '../types';
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
  created_at: string;
  subjects?: { name: string } | null;
  assessments?: { assessment_type: AcademicResult['assessment'] } | null;
};

type DbAttendance = { id: string; student_id: string; attendance_date: string; present: boolean };

type DbRisk = {
  student_id: string;
  risk_level: string;
  risk_score: number;
};

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

const riskLevel = (value: string): RiskLevel => {
  if (value === 'CRITICAL') return 'Critical';
  if (value === 'HIGH') return 'High';
  if (value === 'MODERATE') return 'Moderate';
  return 'Low';
};

const fallbackRisk = (results: DbResult[]): RiskLevel => {
  const gCount = results.filter((row) => row.grade === 'G').length;
  if (gCount >= 4) return 'Critical';
  if (gCount >= 2) return 'High';
  if (gCount === 1) return 'Moderate';
  return 'Low';
};

const studentStatus = (value: string): Student['status'] => {
  if (value === 'INACTIVE') return 'On Watch';
  if (value === 'GRADUATED') return 'Excellence Track';
  return 'Active';
};

const percentage = (marks: number, maximum: number): number => maximum > 0 ? (marks / maximum) * 100 : 0;

export class SupabaseDataProvider implements DataProvider {
  async getStudents(): Promise<Student[]> {
    if (!isSupabaseConfigured) return [];

    const [studentRows, resultRows, attendanceRows, riskRows] = await Promise.all([
      supabaseSelect<DbStudent>('students', 'select=id,student_code,name,form,status,classes(name,form,stream)&order=name.asc'),
      supabaseSelect<DbResult>('academic_results', 'select=id,student_id,marks,max_marks,grade,created_at,subjects(name),assessments(assessment_type)&order=created_at.asc'),
      supabaseSelect<DbAttendance>('attendance', 'select=id,student_id,attendance_date,present&order=attendance_date.asc'),
      supabaseSelect<DbRisk>('student_risk_profiles', 'select=student_id,risk_level,risk_score&order=calculated_at.desc'),
    ]);

    const resultsByStudent = new Map<string, DbResult[]>();
    for (const row of resultRows) {
      const current = resultsByStudent.get(row.student_id) ?? [];
      current.push(row);
      resultsByStudent.set(row.student_id, current);
    }

    const attendanceByStudent = new Map<string, { total: number; present: number }>();
    for (const row of attendanceRows) {
      const current = attendanceByStudent.get(row.student_id) ?? { total: 0, present: 0 };
      current.total += 1;
      if (row.present) current.present += 1;
      attendanceByStudent.set(row.student_id, current);
    }

    const latestRisk = new Map<string, DbRisk>();
    for (const row of riskRows) {
      if (!latestRisk.has(row.student_id)) latestRisk.set(row.student_id, row);
    }

    return studentRows.map((row) => {
      const results = resultsByStudent.get(row.id) ?? [];
      const attendance = attendanceByStudent.get(row.id);
      const risk = latestRisk.get(row.id);
      const academicScore = results.length
        ? results.reduce((sum, item) => sum + percentage(Number(item.marks), Number(item.max_marks)), 0) / results.length
        : 0;
      const attendanceRate = attendance && attendance.total > 0
        ? (attendance.present / attendance.total) * 100
        : 0;
      const subjects = new Map<string, DbResult>();
      for (const result of results) {
        const subject = result.subjects?.name ?? 'Unknown';
        const existing = subjects.get(subject);
        if (!existing || result.created_at > existing.created_at) subjects.set(subject, result);
      }

      return {
        id: row.id,
        name: row.name,
        // Gender is not stored in the current Supabase students table; keep the legacy UI contract until the field is modelled.
        gender: 'Male',
        className: row.classes?.name ?? 'Tidak Ditentukan',
        form: `Tingkatan ${row.form}` as Student['form'],
        academicScore: Math.round(academicScore * 100) / 100,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        riskLevel: risk ? riskLevel(risk.risk_level) : fallbackRisk(results),
        status: studentStatus(row.status),
        subjects: [...subjects.entries()].map(([subject, item]) => ({
          subject,
          score: Math.round(percentage(Number(item.marks), Number(item.max_marks)) * 100) / 100,
          grade: item.grade ?? '',
        })),
        talents: [],
        stemTrack: false,
        stemReadiness: 0,
        progressTimeline: [],
        guardianContact: '',
        photoInitials: row.name.split(/\s+/).map((part) => part[0] ?? '').slice(0, 2).join('').toUpperCase(),
      };
    });
  }

  async getStudentById(id: string): Promise<Student | undefined> {
    const students = await this.getStudents();
    return students.find((student) => student.id === id);
  }

  async getAcademicResults(): Promise<AcademicResult[]> {
    if (!isSupabaseConfigured) return [];
    const rows = await supabaseSelect<DbResult>('academic_results', 'select=id,student_id,marks,max_marks,grade,created_at,subjects(name),assessments(assessment_type)&order=created_at.asc');
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
    const students = await supabaseSelect<DbStudent>('students', 'select=id,name,form,status,student_code,classes(name,form,stream)');
    const byId = new Map(students.map((student) => [student.id, student]));
    return rows.map((row) => {
      const student = byId.get(row.student_id);
      return {
        id: row.id,
        studentId: row.student_id,
        studentName: student?.name ?? 'Unknown',
        className: student?.classes?.name ?? 'Tidak Ditentukan',
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

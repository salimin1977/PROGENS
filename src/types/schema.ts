// Normalized relational entities mirroring the Supabase/PostgreSQL schema
// defined in supabase/migrations. These are the "database row" shapes —
// services translate them into the view-model shapes in src/types/index.ts
// that the UI already consumes.

export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'E' | 'G';
export type ResultStatus = 'PASS' | 'FAIL';

export type StudentStatusDb = 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type RiskLevelDb = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type InterventionStatusDb = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CLOSED';
export type AssessmentType = 'TOV' | 'PPT' | 'PPSA' | 'PASA' | 'SPM' | 'ETR';
export type Department = 'Kemanusiaan' | 'Bahasa' | 'Sains' | 'Matematik' | 'Teknik & Vokasional' | 'Pendidikan Jasmani' | 'Others';
export type StemStatus = 'PASS' | 'FAIL' | 'NOT_TAKEN';
export type StemPipelineStatus = 'ELITE' | 'BOOST' | 'RESCUE' | 'MONITOR';
export type ReapPriority = 'P1' | 'P2' | 'P3';
export type KpiStatus = 'ACHIEVED' | 'ON_TRACK' | 'ATTENTION';
export type AppRole = 'ADMIN' | 'PENGETUA' | 'GKMP' | 'TEACHER' | 'COUNSELLOR' | 'VIEWER';
export type TrafficLight = 'GREEN' | 'AMBER' | 'RED';

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  principal_name: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  year: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface DbStudent {
  id: string;
  student_no: string;
  name: string;
  gender: 'Male' | 'Female';
  ic_last4: string;
  form: 1 | 2 | 3 | 4 | 5;
  class_id: string;
  status: StudentStatusDb;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  staff_no: string;
  name: string;
  department: Department;
  position: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ClassRoom {
  id: string;
  name: string;
  form: 1 | 2 | 3 | 4 | 5;
  stream: 'General' | 'Akaun' | 'Sains' | 'Ekonomi' | 'Seni';
  teacher_id: string;
  capacity: number;
  academic_year_id: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: Department;
  is_spm_subject: boolean;
}

export interface StudentClass {
  id: string;
  student_id: string;
  class_id: string;
  academic_year_id: string;
  is_current: boolean;
}

export interface StudentSubject {
  id: string;
  student_id: string;
  subject_id: string;
  academic_year_id: string;
}

export interface Assessment {
  id: string;
  name: string;
  assessment_type: AssessmentType;
  academic_year_id: string;
  date: string;
}

export interface AcademicResult {
  id: string;
  student_id: string;
  subject_id: string;
  assessment_id: string;
  marks: number;
  percentage: number;
  grade: Grade;
  gp: number;
  status: ResultStatus;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
  class_id: string;
  reason: string | null;
}

export interface DbIntervention {
  id: string;
  student_id: string;
  category: string;
  risk_level: RiskLevelDb;
  problem: string;
  objective: string;
  strategy: string;
  teacher_id: string;
  start_date: string;
  target_date: string;
  status: InterventionStatusDb;
  outcome: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterventionAction {
  id: string;
  intervention_id: string;
  action_date: string;
  action: string;
  person_in_charge: string;
  result: string;
  next_action: string;
}

export interface SeedsProfile {
  id: string;
  student_id: string;
  academic_year_id: string;
  potential_level: 'LOW' | 'MEDIUM' | 'HIGH';
  academic_level: 'LOW' | 'MEDIUM' | 'HIGH';
  attendance_level: 'LOW' | 'MEDIUM' | 'HIGH';
  stem_interest: boolean;
  risk_level: RiskLevelDb;
  recommended_action: string;
  status: 'FOUNDATION' | 'DEVELOPING' | 'PROMISING' | 'HIGH POTENTIAL' | 'ELITE';
}

export interface GrowProfile {
  id: string;
  student_id: string;
  academic_year_id: string;
  academic_level: 'LOW' | 'MEDIUM' | 'HIGH';
  career_interest: string;
  strength: string;
  gap: string;
  target: string;
  action: string;
  status: 'ON TRACK' | 'NEEDS SUPPORT' | 'AT RISK';
}

export interface ReapProfile {
  id: string;
  student_id: string;
  academic_year_id: string;
  current_gps: number;
  target_gps: number;
  risk_level: RiskLevelDb;
  priority: ReapPriority;
  intervention_status: InterventionStatusDb | 'NONE';
  spm_readiness: number;
}

export interface StemPipelineRow {
  id: string;
  student_id: string;
  academic_year_id: string;
  current_form: 1 | 2 | 3 | 4 | 5;
  math_status: StemStatus;
  science_status: StemStatus;
  stem_interest: boolean;
  potential: 'LOW' | 'MEDIUM' | 'HIGH';
  pipeline_status: StemPipelineStatus;
  recommended_action: string;
}

export interface KpiTargetRow {
  id: string;
  academic_year_id: string;
  kpi_name: string;
  current_value: number;
  target_value: number;
  unit: '%' | 'gps' | 'count';
  status: KpiStatus;
  higher_is_better: boolean;
}

export interface KpiSnapshotRow {
  id: string;
  academic_year_id: string;
  snapshot_date: string;
  kpi_name: string;
  value: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  teacher_id: string | null;
}

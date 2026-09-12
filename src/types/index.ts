// Core domain types for PROGENS.
// Field names mirror the eventual Supabase/PostgreSQL schema so mock data
// can later be swapped for live queries with minimal refactoring.

export type Form = 'Tingkatan 1' | 'Tingkatan 2' | 'Tingkatan 3' | 'Tingkatan 4' | 'Tingkatan 5';

export type RiskLevel = 'Critical' | 'High' | 'Moderate' | 'Low';

export type StudentStatus = 'Active' | 'On Watch' | 'Excellence Track';

export type Gender = 'Male' | 'Female';

export interface SubjectScore {
  subject: string;
  score: number;
  grade: string;
}

export interface ProgressEvent {
  date: string;
  label: string;
  category: 'Academic' | 'Attendance' | 'Intervention' | 'Talent' | 'STEM';
  detail: string;
}

export interface TalentProfile {
  domain: string;
  level: 'Emerging' | 'Developing' | 'Proficient' | 'Elite';
  notes: string;
}

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  className: string;
  form: Form;
  academicScore: number;
  attendanceRate: number;
  riskLevel: RiskLevel;
  status: StudentStatus;
  subjects: SubjectScore[];
  talents: TalentProfile[];
  stemTrack: boolean;
  stemReadiness: number;
  progressTimeline: ProgressEvent[];
  guardianContact: string;
  photoInitials: string;
}

export type InterventionStatus = 'Critical' | 'Active' | 'Monitoring' | 'Completed';

export interface Intervention {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  problem: string;
  interventionType: string;
  teacher: string;
  startDate: string;
  status: InterventionStatus;
  progress: number;
  nextAction: string;
  priority: RiskLevel;
}

export interface SubjectPerformance {
  subject: string;
  average: number;
  target: number;
  passRate: number;
}

export interface GradeDistributionEntry {
  grade: string;
  count: number;
}

export interface ClassPerformance {
  className: string;
  form: Form;
  average: number;
  passRate: number;
  studentsAtRisk: number;
}

export interface GpsTrendEntry {
  year: string;
  gps: number;
  target: number;
}

export interface AttendanceByClass {
  className: string;
  rate: number;
}

export interface AttendanceTrendEntry {
  month: string;
  rate: number;
}

export interface RiskAttendanceBucket {
  band: string;
  studentCount: number;
  avgRisk: number;
}

export interface KpiTarget {
  id: string;
  category: 'Academic' | 'Student' | 'Teacher' | 'Attendance' | 'Intervention' | 'Talent' | 'Strategic';
  label: string;
  current: number;
  target: number;
  unit: '%' | 'pts' | 'count' | 'gps';
  higherIsBetter: boolean;
}

export type StemStage = 'Identified' | 'Mathematics' | 'Science' | 'STEM Boost' | 'STEM Elite' | 'STEM A';

export interface StemPipelineStage {
  stage: StemStage;
  count: number;
}

export interface StemCandidate {
  studentId: string;
  studentName: string;
  className: string;
  mathScore: number;
  scienceScore: number;
  category: 'STEM Elite' | 'STEM Boost' | 'STEM Rescue';
}

export interface AiInsight {
  id: string;
  headline: string;
  what: string;
  why: string;
  who: string;
  action: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface SchoolProfile {
  name: string;
  code: string;
  address: string;
  principal: string;
  academicYear: string;
  totalStudents: number;
  totalTeachers: number;
}

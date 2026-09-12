// UI view-model types. These are what pages/components render; services
// build them from the normalized rows in src/types/schema.ts so no
// component ever has to reshape raw database rows itself.

export type Form = 'Tingkatan 1' | 'Tingkatan 2' | 'Tingkatan 3' | 'Tingkatan 4' | 'Tingkatan 5';

// Matches RiskLevelDb exactly — one risk vocabulary across the whole app.
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type StudentProgressStatus = 'On Watch' | 'Active' | 'Excellence Track';

export type Gender = 'Male' | 'Female';

export interface SubjectScore {
  subject: string;
  score: number;
  grade: string;
  gp: number;
  department: string;
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
  studentNo: string;
  name: string;
  gender: Gender;
  className: string;
  form: Form;
  academicScore: number;
  gpm: number;
  attendanceRate: number;
  riskLevel: RiskLevel;
  riskScore: number;
  riskReasons: string[];
  recommendedAction: string;
  status: StudentProgressStatus;
  subjects: SubjectScore[];
  talents: TalentProfile[];
  stemTrack: boolean;
  stemReadiness: number;
  progressTimeline: ProgressEvent[];
  icLast4: string;
  photoInitials: string;
}

export type InterventionStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CLOSED';

export interface Intervention {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  category: string;
  problem: string;
  objective: string;
  strategy: string;
  teacher: string;
  startDate: string;
  targetDate: string;
  status: InterventionStatus;
  progress: number;
  outcome: string | null;
  nextAction: string;
  riskLevel: RiskLevel;
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
  trafficLight: 'GREEN' | 'AMBER' | 'RED';
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
  whatIfNothing: string;
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

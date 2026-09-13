export type Form = 'Tingkatan 1' | 'Tingkatan 2' | 'Tingkatan 3' | 'Tingkatan 4' | 'Tingkatan 5';
export type RiskLevel = 'Critical' | 'High' | 'Moderate' | 'Low';
export type StudentStatus = 'Active' | 'On Watch' | 'Excellence Track';
export type Gender = 'Male' | 'Female';
export type AssessmentType = 'TOV' | 'PPT' | 'PPSA' | 'PASA' | 'SPM' | 'ETR';

export interface SubjectScore { subject: string; score: number; grade: string; }
export interface ProgressEvent { date: string; label: string; category: 'Academic' | 'Attendance' | 'Intervention' | 'Talent' | 'STEM'; detail: string; }
export interface TalentProfile { domain: string; level: 'Emerging' | 'Developing' | 'Proficient' | 'Elite'; notes: string; }
export interface Student {
  id: string; name: string; gender: Gender; className: string; form: Form;
  academicScore: number; attendanceRate: number; riskLevel: RiskLevel; status: StudentStatus;
  subjects: SubjectScore[]; talents: TalentProfile[]; stemTrack: boolean; stemReadiness: number;
  progressTimeline: ProgressEvent[]; guardianContact: string; photoInitials: string;
}
export interface Teacher { id: string; name: string; email?: string; role?: string; }
export interface Class { id: string; name: string; form: Form; stream: string; }
export interface Subject { id: string; name: string; code?: string; }
export interface Assessment { id: string; type: AssessmentType; date: string; name?: string; }
export interface AcademicResult {
  id: string; studentId: string; subject: string; assessment: AssessmentType;
  marks: number; maximumMarks: number; grade: string;
}
export interface AttendanceRecord { id: string; studentId: string; date: string; rate: number; }
export type InterventionStatus = 'Critical' | 'Active' | 'Monitoring' | 'Completed';
export interface Intervention {
  id: string; studentId: string; studentName: string; className: string; problem: string;
  interventionType: string; teacher: string; startDate: string; status: InterventionStatus;
  progress: number; nextAction: string; priority: RiskLevel;
}
export interface InterventionAction { id: string; interventionId: string; date: string; action: string; owner: string; outcome?: string; }
export interface RiskProfile { riskLevel: RiskLevel; riskScore: number; reasons: string[]; recommendedAction: string; }
export type SEEDSLevel = 'FOUNDATION' | 'DEVELOPING' | 'PROMISING' | 'HIGH_POTENTIAL' | 'ELITE';
export interface SEEDSProfile { level: SEEDSLevel; score: number; reasons: string[]; nextAction: string; }
export interface GROWProfile { strength: string[]; gap: string[]; target: string; action: string; }
export type REAPPriority = 'P1' | 'P2' | 'P3';
export interface REAPProfile { current: number; target: number; gap: number; risk: RiskLevel; priority: REAPPriority; intervention: string; spmReadiness: number; }
export type StemStage = 'Identified' | 'Mathematics' | 'Science' | 'STEM Boost' | 'STEM Elite' | 'STEM A';
export interface StemPipelineStage { stage: StemStage; count: number; }
export interface StemCandidate { studentId: string; studentName: string; className: string; mathScore: number; scienceScore: number; category: 'STEM Elite' | 'STEM Boost' | 'STEM Rescue' | 'STEM Monitor'; }
export interface STEMPipeline { total: number; stages: StemPipelineStage[]; candidates: StemCandidate[]; }
export interface KPI { id: string; category: string; label: string; current: number; target: number; unit: '%' | 'pts' | 'count' | 'gps'; higherIsBetter: boolean; }
export interface SubjectPerformance { subject: string; average: number; target: number; passRate: number; }
export interface GradeDistributionEntry { grade: string; count: number; }
export interface ClassPerformance { className: string; form: Form; average: number; passRate: number; studentsAtRisk: number; }
export interface GpsTrendEntry { year: string; gps: number; target: number; }
export interface AttendanceByClass { className: string; rate: number; }
export interface AttendanceTrendEntry { month: string; rate: number; }
export interface RiskAttendanceBucket { band: string; studentCount: number; avgRisk: number; }
export interface KpiTarget extends KPI {}
export interface AiInsight { id: string; headline: string; what: string; why: string; who: string; action: string; severity: 'info' | 'warning' | 'critical'; }
export interface SchoolProfile { name: string; code: string; address: string; principal: string; academicYear: string; totalStudents: number; totalTeachers: number; }

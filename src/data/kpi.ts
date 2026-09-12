import type { AiInsight, KpiTarget, SchoolProfile } from '../types';
import { students } from './students';
import { academicKpi } from './academic';
import { attendanceKpi } from './attendance';
import { interventionSummary, interventions } from './interventions';
import { stemKpi } from './stem';

const atRisk = students.filter((s) => s.riskLevel === 'Critical' || s.riskLevel === 'High').length;

export const commandKpis = {
  totalStudents: students.length,
  academicPerformance: academicKpi.passRate,
  attendance: attendanceKpi.overallRate,
  studentsAtRisk: atRisk,
  interventionActive: interventionSummary.active + interventionSummary.critical,
  stemPipeline: stemKpi.totalCandidates,
};

export const strategicOverview = {
  overallProgress: 78,
  academic: 82,
  attendance: Math.round(attendanceKpi.overallRate),
  intervention: 71,
  talent: 76,
};

export const executiveScorecard: KpiTarget[] = [
  { id: 'acad-gps', category: 'Academic', label: 'GPS (School Average Grade)', current: academicKpi.gpsCurrent, target: academicKpi.gpsTarget, unit: 'gps', higherIsBetter: false },
  { id: 'acad-pass', category: 'Academic', label: 'Overall Pass Rate', current: academicKpi.passRate, target: 95, unit: '%', higherIsBetter: true },
  { id: 'student-risk', category: 'Student', label: 'Students At Risk', current: atRisk, target: 15, unit: 'count', higherIsBetter: false },
  { id: 'student-excellence', category: 'Student', label: 'Students on Excellence Track', current: students.filter((s) => s.status === 'Excellence Track').length, target: 40, unit: 'count', higherIsBetter: true },
  { id: 'teacher-coverage', category: 'Teacher', label: 'Teacher Intervention Coverage', current: 78, target: 90, unit: '%', higherIsBetter: true },
  { id: 'attendance-rate', category: 'Attendance', label: 'School Attendance Rate', current: Math.round(attendanceKpi.overallRate * 10) / 10, target: attendanceKpi.target, unit: '%', higherIsBetter: true },
  { id: 'intervention-completion', category: 'Intervention', label: 'Intervention Completion Rate', current: Math.round((interventionSummary.completed / (interventions.length || 1)) * 1000) / 10, target: 80, unit: '%', higherIsBetter: true },
  { id: 'talent-participation', category: 'Talent', label: 'Talent Programme Participation', current: Math.round((students.filter((s) => s.talents.length > 0).length / students.length) * 1000) / 10, target: 65, unit: '%', higherIsBetter: true },
];

export const aiInsights: AiInsight[] = [
  {
    id: 'insight-1',
    headline: 'Mathematics is the leading performance bottleneck',
    what: 'Mathematics and Additional Mathematics show the widest gap against subject targets across Tingkatan 4 and 5.',
    why: 'A high proportion of students remain below the 70-point mastery threshold, dragging down class and school GPS.',
    who: 'Most concentrated in 5 Ekonomi and 4 Akaun.',
    action: 'Launch a targeted Mathematics booster programme with weekly diagnostic tracking.',
    severity: 'critical',
  },
  {
    id: 'insight-2',
    headline: 'Attendance below 90% strongly correlates with academic risk',
    what: 'Students with attendance under 90% are disproportionately represented in the Critical and High risk bands.',
    why: 'Missed instructional time compounds gaps in core subjects, especially for students already below mastery.',
    who: 'Chronic absentee students across Tingkatan 2 and 3.',
    action: 'Activate the Attendance Recovery Plan and notify guardians within 48 hours of a 3-day absence streak.',
    severity: 'warning',
  },
  {
    id: 'insight-3',
    headline: '3 Cekap shows strong STEM pipeline potential',
    what: 'A large share of 3 Cekap students score above 75 in both Mathematics and Science.',
    why: 'Consistent teaching quality and peer learning culture in this class are producing STEM-ready students ahead of streaming.',
    who: '3 Cekap, feeding into the SOLARIS and STEM A Pipeline programmes.',
    action: 'Fast-track eligible students into STEM Elite enrichment before Tingkatan 4 streaming.',
    severity: 'info',
  },
];

export const schoolProfile: SchoolProfile = {
  name: 'SMK Taman Harmoni',
  code: 'BPS 1234',
  address: 'Jalan Harmoni 5, 43000 Kajang, Selangor',
  principal: 'Tuan Haji Ahmad Faizal bin Othman',
  academicYear: '2026',
  totalStudents: students.length,
  totalTeachers: 84,
};

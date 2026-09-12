// GROW Engine — Growth & Readiness Optimization, Tingkatan 4.
// Composite readiness score blending academic standing, attendance and
// career/field readiness ahead of Tingkatan 5 and SPM.

import type { Department } from '../types/schema';

export type GrowStatus = 'ON TRACK' | 'NEEDS SUPPORT' | 'AT RISK';

export interface GrowScoreInput {
  studentId: string;
  gpm: number; // 1 (best) - 10 (worst)
  attendanceRate: number; // 0-100
  careerReadiness: number; // 0-100, e.g. derived from strongest field performance
  strongestDepartment: Department;
}

export interface GrowScoreResult {
  studentId: string;
  academic_level: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
  status: GrowStatus;
  strength: string;
  recommended_pathway: string;
}

function gpmToScore(gpm: number): number {
  return Math.round(100 - ((gpm - 1) / 9) * 100);
}

const PATHWAY_BY_DEPARTMENT: Record<Department, string> = {
  Sains: 'STEM Pathway (Sains Tulen)',
  Matematik: 'STEM Pathway (Matematik & Kejuruteraan)',
  'Teknik & Vokasional': 'Business & Accounting Pathway',
  Kemanusiaan: 'Humanities & Social Science Pathway',
  Bahasa: 'Languages & Communication Pathway',
  'Pendidikan Jasmani': 'Sports Science Pathway',
  Others: 'Arts & Creative Pathway',
};

export function calculateGrowScore(input: GrowScoreInput): GrowScoreResult {
  const { studentId, gpm, attendanceRate, careerReadiness, strongestDepartment } = input;
  const academicScore = gpmToScore(gpm);
  const score = Math.round(academicScore * 0.4 + attendanceRate * 0.3 + careerReadiness * 0.3);

  const status: GrowStatus = score >= 75 ? 'ON TRACK' : score >= 55 ? 'NEEDS SUPPORT' : 'AT RISK';
  const academic_level = academicScore >= 70 ? 'HIGH' : academicScore >= 50 ? 'MEDIUM' : 'LOW';

  return {
    studentId,
    academic_level,
    score,
    status,
    strength: `Strongest in ${strongestDepartment}`,
    recommended_pathway: PATHWAY_BY_DEPARTMENT[strongestDepartment],
  };
}

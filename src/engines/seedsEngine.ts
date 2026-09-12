// SEEDS Engine — Student Early Excellence & Development System,
// Tingkatan 1-3. Screen -> Evaluate -> Empower -> Develop -> Sustain.

import type { RiskLevelDb } from '../types/schema';

export type SeedsLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type SeedsStatus = 'FOUNDATION' | 'DEVELOPING' | 'PROMISING' | 'HIGH POTENTIAL' | 'ELITE';

export interface SeedsClassificationInput {
  studentId: string;
  gpm: number;
  attendanceRate: number;
  riskLevel: RiskLevelDb;
  stemInterest: boolean;
}

export interface SeedsClassification {
  studentId: string;
  potential_level: SeedsLevel;
  academic_level: SeedsLevel;
  attendance_level: SeedsLevel;
  stem_interest: boolean;
  risk_level: RiskLevelDb;
  status: SeedsStatus;
  recommended_action: string;
}

function academicLevel(gpm: number): SeedsLevel {
  if (gpm <= 3) return 'HIGH';
  if (gpm <= 6) return 'MEDIUM';
  return 'LOW';
}

function attendanceLevel(rate: number): SeedsLevel {
  if (rate >= 95) return 'HIGH';
  if (rate >= 85) return 'MEDIUM';
  return 'LOW';
}

const STATUS_CAP: Record<RiskLevelDb, SeedsStatus | null> = {
  CRITICAL: 'FOUNDATION',
  HIGH: 'DEVELOPING',
  MEDIUM: null,
  LOW: null,
};

const STATUS_ORDER: SeedsStatus[] = ['FOUNDATION', 'DEVELOPING', 'PROMISING', 'HIGH POTENTIAL', 'ELITE'];

function statusFromGpm(gpm: number): SeedsStatus {
  if (gpm <= 1.5) return 'ELITE';
  if (gpm <= 2.5) return 'HIGH POTENTIAL';
  if (gpm <= 4) return 'PROMISING';
  if (gpm <= 6) return 'DEVELOPING';
  return 'FOUNDATION';
}

const RECOMMENDED_ACTION: Record<SeedsStatus, string> = {
  FOUNDATION: 'Enrol in Academic Rescue and structured foundation support',
  DEVELOPING: 'Targeted subject coaching to close core gaps',
  PROMISING: 'Enrich through subject clubs and consistency monitoring',
  'HIGH POTENTIAL': 'Fast-track into SOLARIS/NOVA/SUPERNOVA enrichment',
  ELITE: 'Advance to STEM A Pipeline and leadership development',
};

export function classifySeedsStudent(input: SeedsClassificationInput): SeedsClassification {
  const { studentId, gpm, attendanceRate, riskLevel, stemInterest } = input;
  let status = statusFromGpm(gpm);
  const cap = STATUS_CAP[riskLevel];
  if (cap && STATUS_ORDER.indexOf(status) > STATUS_ORDER.indexOf(cap)) {
    status = cap;
  }

  const academic = academicLevel(gpm);
  const attendance = attendanceLevel(attendanceRate);
  const potential: SeedsLevel = academic === 'HIGH' && attendance === 'HIGH' ? 'HIGH' : academic === 'LOW' && attendance === 'LOW' ? 'LOW' : 'MEDIUM';

  return {
    studentId,
    potential_level: potential,
    academic_level: academic,
    attendance_level: attendance,
    stem_interest: stemInterest,
    risk_level: riskLevel,
    status,
    recommended_action: RECOMMENDED_ACTION[status],
  };
}

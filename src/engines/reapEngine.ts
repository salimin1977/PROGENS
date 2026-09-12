// REAP Engine — Results Excellence & Achievement Programme, Tingkatan 5.
// Current GPS -> Target GPS -> Gap -> Priority -> SPM readiness.

import type { InterventionStatusDb, RiskLevelDb, ReapPriority } from '../types/schema';

export interface ReapPriorityInput {
  studentId: string;
  currentGpm: number;
  targetGps: number;
  riskLevel: RiskLevelDb;
  interventionStatus: InterventionStatusDb | 'NONE';
}

export interface ReapPriorityResult {
  studentId: string;
  gap: number;
  priority: ReapPriority;
  intervention_status: InterventionStatusDb | 'NONE';
  spm_readiness: number;
}

const RISK_PENALTY: Record<RiskLevelDb, number> = { CRITICAL: 20, HIGH: 10, MEDIUM: 5, LOW: 0 };

export function calculateReapPriority(input: ReapPriorityInput): ReapPriorityResult {
  const { studentId, currentGpm, targetGps, riskLevel, interventionStatus } = input;
  const gap = Math.round((currentGpm - targetGps) * 100) / 100;

  let priority: ReapPriority;
  if (riskLevel === 'CRITICAL' || gap >= 1.5) priority = 'P1';
  else if (riskLevel === 'HIGH' || gap >= 0.5) priority = 'P2';
  else priority = 'P3';

  const spm_readiness = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, gap) * 25 - RISK_PENALTY[riskLevel])));

  return { studentId, gap, priority, intervention_status: interventionStatus, spm_readiness };
}

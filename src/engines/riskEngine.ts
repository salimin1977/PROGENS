// Risk Engine — the single source of truth for a student's risk
// classification. Every module (Intervention, SEEDS, GROW, REAP, NEXUS)
// must call calculateStudentRisk() rather than re-deriving risk from raw
// grades itself.
//
// Base classification follows the fixed G-grade-count rule:
//   CRITICAL  4+ G grades
//   HIGH      2-3 G grades
//   MEDIUM    1 G grade
//   LOW       no G grades
// LOW is escalated to MEDIUM when a student with no failing grade still
// shows a significant academic decline or attendance below the 90%
// threshold — see docs/risk-engine.md for the full rationale.

import type { AcademicResult, AttendanceRecord, RiskLevelDb, Subject } from '../types/schema';
import { calculateStudentGPM } from './academicEngine';
import { calculateAttendanceRate, isAttendanceFlagged } from './attendanceEngine';

export interface StudentRiskAssessment {
  studentId: string;
  risk_level: RiskLevelDb;
  risk_score: number;
  reasons: string[];
  recommended_action: string;
  gCount: number;
  attendanceRate: number;
  trendDelta: number;
}

/** Alias — the shape callers elsewhere in PROGENS refer to as "RiskProfile". */
export type RiskProfile = StudentRiskAssessment;

const SIGNIFICANT_DECLINE_POINTS = 1.5;

/**
 * The fixed G-grade-count thresholds the base risk rule uses. Exported so
 * Settings can display the actual rule PROGENS enforces instead of a
 * disconnected, independently-editable copy of these numbers.
 */
export const RISK_G_COUNT_THRESHOLDS = { CRITICAL: 4, HIGH: 2, MEDIUM: 1 } as const;

function subjectName(subjects: Subject[] | undefined, subjectId: string): string {
  return subjects?.find((s) => s.id === subjectId)?.name ?? subjectId;
}

const RECOMMENDED_ACTION: Record<RiskLevelDb, string> = {
  CRITICAL: 'Immediate intervention required',
  HIGH: 'Structured intervention recommended',
  MEDIUM: 'Monitor closely with targeted support',
  LOW: 'Continue standard monitoring',
};

export interface CalculateStudentRiskInput {
  studentId: string;
  latestResults: AcademicResult[];
  previousResults?: AcademicResult[];
  attendanceRecords?: AttendanceRecord[];
  subjects?: Subject[];
}

export function calculateStudentRisk(input: CalculateStudentRiskInput): StudentRiskAssessment {
  const { studentId, latestResults, previousResults = [], attendanceRecords = [], subjects } = input;

  const failingResults = latestResults.filter((r) => r.grade === 'G');
  const gCount = failingResults.length;

  const attendanceRate = attendanceRecords.length > 0 ? calculateAttendanceRate(attendanceRecords) : 100;

  const latestGpm = calculateStudentGPM(latestResults);
  const previousGpm = previousResults.length > 0 ? calculateStudentGPM(previousResults) : latestGpm;
  const trendDelta = Math.round((latestGpm - previousGpm) * 100) / 100; // positive = got worse (higher GP)

  let riskLevel: RiskLevelDb;
  if (gCount >= RISK_G_COUNT_THRESHOLDS.CRITICAL) riskLevel = 'CRITICAL';
  else if (gCount >= RISK_G_COUNT_THRESHOLDS.HIGH) riskLevel = 'HIGH';
  else if (gCount === RISK_G_COUNT_THRESHOLDS.MEDIUM) riskLevel = 'MEDIUM';
  else riskLevel = isAttendanceFlagged(attendanceRate) || trendDelta >= SIGNIFICANT_DECLINE_POINTS ? 'MEDIUM' : 'LOW';

  let score = Math.min(80, gCount * 20);
  if (attendanceRate < 80) score += 15;
  else if (isAttendanceFlagged(attendanceRate)) score += 8;
  if (trendDelta >= SIGNIFICANT_DECLINE_POINTS) score += 15;
  else if (trendDelta >= 0.75) score += 8;
  const risk_score = Math.min(100, Math.round(score));

  const reasons: string[] = [];
  if (gCount > 0) {
    const names = failingResults.map((r) => subjectName(subjects, r.subject_id));
    reasons.push(`${gCount} failing subject${gCount > 1 ? 's' : ''} (${names.join(', ')})`);
  }
  if (isAttendanceFlagged(attendanceRate)) {
    reasons.push(`Attendance at ${attendanceRate}%, below the ${attendanceRate < 80 ? 'chronic-absence' : '90%'} threshold`);
  }
  if (trendDelta >= 0.75) {
    reasons.push(`Performance declined by ${trendDelta.toFixed(2)} grade points since the previous assessment`);
  }
  if (reasons.length === 0) {
    reasons.push('No significant risk factors detected');
  }

  return {
    studentId,
    risk_level: riskLevel,
    risk_score,
    reasons,
    recommended_action: RECOMMENDED_ACTION[riskLevel],
    gCount,
    attendanceRate,
    trendDelta,
  };
}

import type { RiskLevel, RiskProfile, Student } from '../types';

export interface RiskConfig { attendanceRiskThreshold: number; }
export const DEFAULT_RISK_CONFIG: RiskConfig = { attendanceRiskThreshold: 90 };

export function calculateStudentRisk(student: Student, config: RiskConfig = DEFAULT_RISK_CONFIG): RiskProfile {
  const gCount = student.subjects.filter((s) => s.grade === 'G').length;
  const failures = student.subjects.filter((s) => s.score < 40).length;
  let score = 0;
  const reasons: string[] = [];
  if (gCount >= 4) { score += 60; reasons.push(`${gCount} failing subjects`); }
  else if (gCount >= 2) { score += 40; reasons.push(`${gCount} G grades`); }
  else if (gCount === 1) { score += 25; reasons.push('1 G grade'); }
  if (student.attendanceRate < config.attendanceRiskThreshold) { score += 20; reasons.push(`Attendance ${student.attendanceRate}% below ${config.attendanceRiskThreshold}%`); }
  if (failures > gCount) { score += 10; reasons.push(`${failures} subject failures`); }
  if (student.academicScore < 60) { score += 10; reasons.push('Academic performance below 60'); }
  const riskLevel: RiskLevel = gCount >= 4 ? 'Critical' : gCount >= 2 ? 'High' : gCount === 1 ? 'Moderate' : score >= 40 ? 'High' : score >= 20 ? 'Moderate' : 'Low';
  const recommendedAction = riskLevel === 'Critical' ? 'Immediate Academic Rescue' : riskLevel === 'High' ? 'Targeted Intervention' : riskLevel === 'Moderate' ? 'Close Monitoring' : 'Sustain Progress';
  return { riskLevel, riskScore: Math.min(100, score), reasons: reasons.length ? reasons : ['No critical risk indicator'], recommendedAction };
}

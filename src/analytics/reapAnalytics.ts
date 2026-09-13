import type { REAPProfile, Student } from '../types';
import { calculateStudentRisk } from './riskAnalytics';

export function calculateREAPProfile(student: Student, target = 4.84): REAPProfile {
  const risk = calculateStudentRisk(student);
  const current = Math.max(1, Math.round((100 - student.academicScore) / 10 * 100) / 100);
  const gap = Math.round((current - target) * 100) / 100;
  const priority = risk.riskLevel === 'Critical' ? 'P1' : risk.riskLevel === 'High' ? 'P2' : 'P3';
  return { current, target, gap, risk: risk.riskLevel, priority, intervention: risk.recommendedAction, spmReadiness: Math.max(0, Math.min(100, student.academicScore * 0.7 + student.attendanceRate * 0.3)) };
}

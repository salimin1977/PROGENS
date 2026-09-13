import type { SEEDSProfile, Student } from '../types';

export function calculateSEEDSProfile(student: Student): SEEDSProfile {
  const score = Math.round(student.academicScore * 0.6 + student.attendanceRate * 0.2 + Math.min(student.talents.length, 2) * 10);
  const level = score >= 90 ? 'ELITE' : score >= 80 ? 'HIGH_POTENTIAL' : score >= 70 ? 'PROMISING' : score >= 55 ? 'DEVELOPING' : 'FOUNDATION';
  const reasons = [student.academicScore >= 70 ? 'Academic foundation is secure' : 'Academic foundation needs strengthening'];
  if (student.attendanceRate < 90) reasons.push('Attendance requires attention');
  if (student.talents.length) reasons.push(`${student.talents.length} talent domain(s) identified`);
  return { level, score: Math.min(100, score), reasons, nextAction: level === 'ELITE' || level === 'HIGH_POTENTIAL' ? 'Sustain and accelerate enrichment' : 'Target foundational development' };
}

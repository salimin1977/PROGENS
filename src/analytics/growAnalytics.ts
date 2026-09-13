import type { GROWProfile, Student } from '../types';

export function calculateGROWProfile(student: Student): GROWProfile {
  const strength = student.subjects.filter((s) => s.score >= 75).map((s) => s.subject);
  const gap = student.subjects.filter((s) => s.score < 60).map((s) => s.subject);
  return { strength, gap, target: 'Strengthen core subjects and align strengths with post-SPM pathway', action: gap.length ? `Close priority gaps: ${gap.slice(0, 2).join(', ')}` : 'Accelerate enrichment and career alignment' };
}

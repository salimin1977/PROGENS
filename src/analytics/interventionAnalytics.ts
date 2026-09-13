import type { Student } from '../types';

export type InterventionRecommendation = 'ACADEMIC_RESCUE' | 'SUBJECT_COACHING' | 'ATTENDANCE_INTERVENTION' | 'PARENT_ENGAGEMENT' | 'MENTORING' | 'PEER_SUPPORT' | 'STEM_RESCUE' | 'CAREER_GUIDANCE';

export function generateInterventionRecommendation(student: Student): InterventionRecommendation {
  const gCount = student.subjects.filter((s) => s.grade === 'G').length;
  if (student.attendanceRate < 90) return 'ATTENDANCE_INTERVENTION';
  if (gCount >= 4) return 'ACADEMIC_RESCUE';
  if (student.subjects.some((s) => /math/i.test(s.subject) && s.score < 40)) return 'STEM_RESCUE';
  if (student.subjects.some((s) => s.score < 40)) return 'SUBJECT_COACHING';
  if (student.academicScore < 60) return 'MENTORING';
  if (student.stemTrack) return 'PEER_SUPPORT';
  return 'CAREER_GUIDANCE';
}

export const generateInterventionRecommendations = (students: Student[]) => students.map((student) => ({ studentId: student.id, recommendation: generateInterventionRecommendation(student) }));

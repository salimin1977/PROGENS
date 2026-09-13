import type { Student, StemCandidate } from '../types';

export function classifySTEM(student: Student): StemCandidate {
  const math = student.subjects.find((s) => /math/i.test(s.subject))?.score ?? 0;
  const science = student.subjects.find((s) => /science|physics|chemistry|biology/i.test(s.subject))?.score ?? 0;
  const category = math >= 85 && science >= 85 ? 'STEM Elite' : math < 40 ? 'STEM Rescue' : math >= 70 && science >= 70 ? 'STEM Boost' : 'STEM Monitor';
  return { studentId: student.id, studentName: student.name, className: student.className, mathScore: math, scienceScore: science, category };
}
export const calculateSTEMPipeline = (students: Student[]) => students.filter((s) => s.form === 'Tingkatan 3').map(classifySTEM);

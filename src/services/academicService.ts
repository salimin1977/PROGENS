import type { AcademicResult, AssessmentType } from '../types';
import { getConfiguredProvider } from '../providers';

const provider = () => getConfiguredProvider();

export const getResults = async (): Promise<AcademicResult[]> => provider().getAcademicResults();
export const getStudentResults = async (studentId: string): Promise<AcademicResult[]> => (await getResults()).filter((r) => r.studentId === studentId);
export const getSubjectResults = async (subject: string): Promise<AcademicResult[]> => (await getResults()).filter((r) => r.subject === subject);
export const getClassResults = async (className: string): Promise<AcademicResult[]> => {
  const students = await provider().getStudents();
  const ids = new Set(students.filter((s) => s.className === className).map((s) => s.id));
  return (await getResults()).filter((r) => ids.has(r.studentId));
};
export const getAssessmentResults = async (assessment: AssessmentType): Promise<AcademicResult[]> => (await getResults()).filter((r) => r.assessment === assessment);

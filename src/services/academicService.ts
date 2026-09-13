import type { AcademicResult, AssessmentType } from '../types';
import { mockDataProvider } from '../providers/MockDataProvider';

export const getResults = async (): Promise<AcademicResult[]> => mockDataProvider.getAcademicResults();
export const getStudentResults = async (studentId: string) => (await getResults()).filter((r) => r.studentId === studentId);
export const getSubjectResults = async (subject: string) => (await getResults()).filter((r) => r.subject === subject);
export const getClassResults = async (className: string) => {
  const students = await mockDataProvider.getStudents();
  const ids = new Set(students.filter((s) => s.className === className).map((s) => s.id));
  return (await getResults()).filter((r) => ids.has(r.studentId));
};
export const getAssessmentResults = async (assessment: AssessmentType) => (await getResults()).filter((r) => r.assessment === assessment);

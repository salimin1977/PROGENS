import type { Form, RiskLevel, Student } from '../types';
import { getConfiguredProvider } from '../providers';

const provider = () => getConfiguredProvider();

export const getStudents = async (): Promise<Student[]> => provider().getStudents();
export const getStudentById = async (id: string) => provider().getStudentById(id);
export const getStudentsByForm = async (form: Form) => (await getStudents()).filter((s) => s.form === form);
export const getStudentsByClass = async (className: string) => (await getStudents()).filter((s) => s.className === className);
export const searchStudents = async (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return getStudents();
  return (await getStudents()).filter((s) => `${s.name} ${s.id} ${s.className}`.toLowerCase().includes(q));
};
export const getStudentsByRisk = async (risk: RiskLevel) => (await getStudents()).filter((s) => s.riskLevel === risk);
export const getTopStudents = async (limit = 10) => [...(await getStudents())].sort((a, b) => b.academicScore - a.academicScore).slice(0, limit);

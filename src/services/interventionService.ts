import type { Intervention } from '../types';
import { getConfiguredProvider } from '../providers';

export const getInterventions = async () => getConfiguredProvider().getInterventions();
export const getActiveInterventions = async () => (await getInterventions()).filter((i) => i.status === 'Active' || i.status === 'Critical');
export const getCriticalInterventions = async () => (await getInterventions()).filter((i) => i.status === 'Critical');
export const getStudentInterventions = async (studentId: string) => (await getInterventions()).filter((i) => i.studentId === studentId);
export const createIntervention = async (intervention: Intervention) => intervention;
export const updateIntervention = async (intervention: Intervention) => intervention;
export const closeIntervention = async (intervention: Intervention) => ({ ...intervention, status: 'Completed' as const, progress: 100 });

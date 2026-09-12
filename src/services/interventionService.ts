import type { Intervention, InterventionStatus, RiskLevel } from '../types';
import { loadCoreDataset, type CoreDataset } from './dataset';
import { buildRiskLookup } from './riskLookup';
import { getDataProvider, type NewInterventionInput, type UpdateInterventionInput } from '../providers';
import type { DataProvider } from '../providers';
import type { DbIntervention } from '../types/schema';

function computeProgress(status: InterventionStatus, startDate: string, targetDate: string): number {
  if (status === 'COMPLETED' || status === 'CLOSED') return 100;
  if (status === 'PLANNED') return 5;
  const start = new Date(startDate).getTime();
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  if (target <= start) return 50;
  const pct = ((now - start) / (target - start)) * 100;
  return Math.round(Math.min(95, Math.max(10, pct)));
}

/** The one place a DbIntervention row is turned into the UI's Intervention view. */
async function mapInterventionRow(row: DbIntervention, dataset: CoreDataset, provider: DataProvider): Promise<Intervention> {
  const student = dataset.students.find((s) => s.id === row.student_id);
  const teacher = dataset.teachers.find((t) => t.id === row.teacher_id);
  const className = dataset.classes.find((c) => c.id === student?.class_id)?.name ?? '';
  const actions = await provider.getInterventionActions(row.id);
  const latestAction = actions[actions.length - 1];

  return {
    id: row.id,
    studentId: row.student_id,
    studentName: student?.name ?? 'Unknown',
    className,
    category: row.category,
    problem: row.problem,
    objective: row.objective,
    strategy: row.strategy,
    teacher: teacher?.name ?? 'Unassigned',
    startDate: row.start_date,
    targetDate: row.target_date,
    status: row.status,
    progress: computeProgress(row.status, row.start_date, row.target_date),
    outcome: row.outcome,
    nextAction: latestAction?.next_action ?? 'Awaiting first action log',
    riskLevel: row.risk_level,
  };
}

export interface InterventionFilters {
  status?: InterventionStatus;
  search?: string;
  studentId?: string;
}

export async function listInterventions(filters: InterventionFilters = {}): Promise<Intervention[]> {
  const dataset = await loadCoreDataset();
  const provider = getDataProvider();

  const views = await Promise.all(dataset.interventions.map((row) => mapInterventionRow(row, dataset, provider)));

  let filtered = views;
  if (filters.status) filtered = filtered.filter((v) => v.status === filters.status);
  if (filters.studentId) filtered = filtered.filter((v) => v.studentId === filters.studentId);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter((v) => v.studentName.toLowerCase().includes(q));
  }
  return filtered;
}

// --- Named convenience accessors --------------------------------------

/** Alias of listInterventions() for API-naming parity. */
export async function getInterventions(filters: InterventionFilters = {}): Promise<Intervention[]> {
  return listInterventions(filters);
}

export async function getActiveInterventions(): Promise<Intervention[]> {
  return listInterventions({ status: 'ACTIVE' });
}

export async function getCriticalInterventions(): Promise<Intervention[]> {
  const all = await listInterventions();
  return all.filter((i) => i.riskLevel === ('CRITICAL' satisfies RiskLevel));
}

export async function getStudentInterventions(studentId: string): Promise<Intervention[]> {
  return listInterventions({ studentId });
}

// --- Write operations ---------------------------------------------------
// These go through DataProvider.createIntervention/updateIntervention, so
// MockDataProvider and SupabaseDataProvider both support them identically
// — a case created against the mock provider behaves exactly like one
// created against a real Supabase project would.

export async function createIntervention(input: NewInterventionInput): Promise<Intervention> {
  const provider = getDataProvider();
  const row = await provider.createIntervention(input);
  const dataset = await loadCoreDataset();
  return mapInterventionRow(row, dataset, provider);
}

export async function updateIntervention(id: string, patch: UpdateInterventionInput): Promise<Intervention> {
  const provider = getDataProvider();
  const row = await provider.updateIntervention(id, patch);
  const dataset = await loadCoreDataset();
  return mapInterventionRow(row, dataset, provider);
}

export async function closeIntervention(id: string, outcome: string): Promise<Intervention> {
  const provider = getDataProvider();
  const row = await provider.closeIntervention(id, outcome);
  const dataset = await loadCoreDataset();
  return mapInterventionRow(row, dataset, provider);
}

export interface InterventionSummary {
  planned: number;
  active: number;
  completed: number;
  closed: number;
  criticalStudents: number;
  highRiskStudents: number;
}

export async function getInterventionSummary(): Promise<InterventionSummary> {
  const dataset = await loadCoreDataset();
  const riskLookup = buildRiskLookup(dataset);

  return {
    planned: dataset.interventions.filter((i) => i.status === 'PLANNED').length,
    active: dataset.interventions.filter((i) => i.status === 'ACTIVE').length,
    completed: dataset.interventions.filter((i) => i.status === 'COMPLETED').length,
    closed: dataset.interventions.filter((i) => i.status === 'CLOSED').length,
    criticalStudents: Array.from(riskLookup.values()).filter((r) => r.risk_level === 'CRITICAL').length,
    highRiskStudents: Array.from(riskLookup.values()).filter((r) => r.risk_level === 'HIGH').length,
  };
}

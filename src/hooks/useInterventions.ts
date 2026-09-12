import { useAsync, type AsyncState } from './useAsync';
import { listInterventions, type InterventionFilters } from '../services/interventionService';
import type { Intervention } from '../types';

/** Intervention cases, optionally filtered by status/student/search. */
export function useInterventions(filters: InterventionFilters = {}): AsyncState<Intervention[]> {
  return useAsync(() => listInterventions(filters), [filters.status, filters.studentId, filters.search]);
}

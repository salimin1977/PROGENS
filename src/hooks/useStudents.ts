import { useAsync, type AsyncState } from './useAsync';
import { listStudents, type StudentListFilters } from '../services/studentService';
import type { Student } from '../types';

/** All students, optionally filtered — re-fetches whenever the filter values change. */
export function useStudents(filters: StudentListFilters = {}): AsyncState<Student[]> {
  return useAsync(() => listStudents(filters), [filters.search, filters.className, filters.form, filters.riskLevel]);
}

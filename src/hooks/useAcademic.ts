import { useAsync, type AsyncState } from './useAsync';
import { getAcademicOverview, type AcademicOverview } from '../services/academicService';

/** School-wide academic overview: GPS/GPMP, subject performance, grade distribution, class comparison, trend. */
export function useAcademic(): AsyncState<AcademicOverview> {
  return useAsync(getAcademicOverview, []);
}

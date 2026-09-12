import { useAsync, type AsyncState } from './useAsync';
import { getStemOverview, type StemOverview } from '../services/stemService';

/** STEM A Pipeline overview: funnel, candidates, KPIs, Tingkatan 3 class breakdown. */
export function useSTEM(): AsyncState<StemOverview> {
  return useAsync(getStemOverview, []);
}

import { useAsync, type AsyncState } from './useAsync';
import { getSchoolKPIs, type SchoolKpis } from '../services/kpiService';

/** The 8 named strategic KPIs (GPS Semasa/Sasaran/Jurang, Jumlah Murid, Murid Berisiko, Intervensi Aktif, Kehadiran, Murid Cemerlang). */
export function useKPIs(): AsyncState<SchoolKpis> {
  return useAsync(getSchoolKPIs, []);
}

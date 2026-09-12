import type { KpiSnapshotRow, KpiTargetRow } from '../../types/schema';
import { ACADEMIC_YEAR } from './config';

// Status is computed by kpiEngine at read time — these seed rows only carry
// the raw current/target figures for the strategic KPI set.
export const KPI_TARGETS_SEED: Omit<KpiTargetRow, 'status'>[] = [
  { id: 'kpi-gps', academic_year_id: ACADEMIC_YEAR.id, kpi_name: 'GPS Semasa', current_value: 5.11, target_value: 4.84, unit: 'gps', higher_is_better: false },
  { id: 'kpi-gpmp-mat', academic_year_id: ACADEMIC_YEAR.id, kpi_name: 'GPMP Matematik', current_value: 6.2, target_value: 5.0, unit: 'gps', higher_is_better: false },
  { id: 'kpi-attendance', academic_year_id: ACADEMIC_YEAR.id, kpi_name: 'Kehadiran', current_value: 92, target_value: 97, unit: '%', higher_is_better: true },
  { id: 'kpi-passrate', academic_year_id: ACADEMIC_YEAR.id, kpi_name: 'Kadar Lulus', current_value: 88, target_value: 95, unit: '%', higher_is_better: true },
];

export const KPI_SNAPSHOTS_SEED: KpiSnapshotRow[] = [
  { id: 'snap-gps-2023', academic_year_id: 'ay-2023', snapshot_date: '2023-11-30', kpi_name: 'GPS Semasa', value: 5.62 },
  { id: 'snap-gps-2024', academic_year_id: 'ay-2024', snapshot_date: '2024-11-30', kpi_name: 'GPS Semasa', value: 5.38 },
  { id: 'snap-gps-2025', academic_year_id: 'ay-2025', snapshot_date: '2025-11-30', kpi_name: 'GPS Semasa', value: 5.11 },
];

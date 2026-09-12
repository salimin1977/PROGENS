// KPI Engine — status and variance for any KPI target, direction-aware
// (some KPIs are "higher is better" like attendance, others are "lower is
// better" like GPS/GPMP).

import type { KpiStatus } from '../types/schema';

const TOLERANCE_BY_UNIT: Record<string, number> = { gps: 0.15, '%': 3, count: 3 };

export function calculateKpiVariance(current: number, target: number): number {
  return Math.round((target - current) * 100) / 100;
}

export function isKpiAchieved(current: number, target: number, higherIsBetter: boolean): boolean {
  return higherIsBetter ? current >= target : current <= target;
}

export function calculateKpiStatus(current: number, target: number, higherIsBetter: boolean, unit: string): KpiStatus {
  if (isKpiAchieved(current, target, higherIsBetter)) return 'ACHIEVED';
  const gap = Math.abs(current - target);
  const tolerance = TOLERANCE_BY_UNIT[unit] ?? 3;
  return gap <= tolerance ? 'ON_TRACK' : 'ATTENTION';
}

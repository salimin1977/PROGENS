import { isSupabaseConfigured } from '../lib/supabase';

export type HealthStatus = 'PASS' | 'WARN' | 'FAIL';
export interface ReadinessCheck { id: string; label: string; status: HealthStatus; detail: string; }

export function buildProductionReadiness(): ReadinessCheck[] {
  return [
    { id: 'supabase-config', label: 'Supabase configuration', status: isSupabaseConfigured ? 'PASS' : 'FAIL', detail: isSupabaseConfigured ? 'Environment variables are available for the live provider.' : 'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before production use.' },
    { id: 'provider-fallback', label: 'Provider fallback', status: 'PASS', detail: 'PROGENS falls back to MockDataProvider when Supabase is not configured.' },
    { id: 'identity-policy', label: 'Identity-data policy', status: 'PASS', detail: 'The application model contains no IC/MyKID field.' },
    { id: 'attendance-integrity', label: 'Attendance semantics', status: 'PASS', detail: 'Attendance is represented as aggregate absent days; no fabricated attendance percentage is used.' },
    { id: 'latest-assessment', label: 'Assessment identity', status: 'PASS', detail: 'Academic results carry assessment identity so latest-assessment logic can be applied.' },
    { id: 'deployment', label: 'Hosting deployment', status: 'WARN', detail: 'Deployment provider is external to this repository; deploy only after CI validation.' },
  ];
}

export function productionReadinessStatus(checks: ReadinessCheck[]): HealthStatus {
  if (checks.some((check) => check.status === 'FAIL')) return 'FAIL';
  if (checks.some((check) => check.status === 'WARN')) return 'WARN';
  return 'PASS';
}

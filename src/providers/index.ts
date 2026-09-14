import type { DataProvider } from './DataProvider';
export type { DataProvider } from './DataProvider';
export { MockDataProvider } from './MockDataProvider';
export { SupabaseDataProvider } from './SupabaseDataProvider';
import { MockDataProvider } from './MockDataProvider';
import { SupabaseDataProvider } from './SupabaseDataProvider';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type DataSourceState = 'LIVE' | 'MOCK' | 'ERROR' | 'NOT_CONFIGURED';

/** Live Supabase is selected only when both Vite environment variables exist. */
export const getConfiguredProvider = (): DataProvider =>
  isSupabaseConfigured ? new SupabaseDataProvider() : new MockDataProvider();

/**
 * Performs a small read-only connectivity check. No credentials or raw database
 * errors are returned to the UI.
 */
export async function checkSupabaseConnection(): Promise<DataSourceState> {
  if (!isSupabaseConfigured || !supabase) return 'NOT_CONFIGURED';
  try {
    const { error } = await supabase.from('students').select('id', { head: true, count: 'exact' });
    return error ? 'ERROR' : 'LIVE';
  } catch {
    return 'ERROR';
  }
}

export function getConfiguredDataSourceState(): DataSourceState {
  return isSupabaseConfigured ? 'LIVE' : 'MOCK';
}

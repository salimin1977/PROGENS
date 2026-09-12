import type { DataProvider } from './DataProvider';
import { MockDataProvider } from './MockDataProvider';
import { SupabaseDataProvider } from './SupabaseDataProvider';

export type {
  DataProvider,
  AcademicResultFilter,
  AttendanceFilter,
  InterventionFilter,
  NewInterventionInput,
  UpdateInterventionInput,
} from './DataProvider';
export { DataProviderError } from './DataProvider';

let cachedProvider: DataProvider | null = null;

/**
 * Returns the active DataProvider. Uses SupabaseDataProvider automatically
 * when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set; otherwise
 * falls back to the in-memory MockDataProvider so the app runs with zero
 * configuration.
 */
export function getDataProvider(): DataProvider {
  if (cachedProvider) return cachedProvider;

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  cachedProvider = url && anonKey ? new SupabaseDataProvider(url, anonKey) : new MockDataProvider();

  return cachedProvider;
}

/** Test/story helper — forces a specific provider instance. */
export function setDataProvider(provider: DataProvider): void {
  cachedProvider = provider;
}

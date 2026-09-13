export type { DataProvider } from './DataProvider';
export { MockDataProvider } from './MockDataProvider';
export { SupabaseDataProvider } from './SupabaseDataProvider';

import { MockDataProvider } from './MockDataProvider';
import { SupabaseDataProvider } from './SupabaseDataProvider';
import { isSupabaseConfigured } from '../lib/supabaseRest';

/** Phase 3: use live Supabase when configured; retain mock fallback for local development. */
export const getConfiguredProvider = () =>
  isSupabaseConfigured ? new SupabaseDataProvider() : new MockDataProvider();

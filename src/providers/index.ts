export type { DataProvider } from './DataProvider';
export { MockDataProvider } from './MockDataProvider';
export { SupabaseDataProvider } from './SupabaseDataProvider';
import { MockDataProvider } from './MockDataProvider';
import { SupabaseDataProvider } from './SupabaseDataProvider';
import { isSupabaseConfigured } from '../lib/supabase';

/** Live Supabase is selected only when both Vite environment variables exist. */
export const getConfiguredProvider = (): DataProvider =>
  isSupabaseConfigured ? new SupabaseDataProvider() : new MockDataProvider();

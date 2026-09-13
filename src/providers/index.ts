export type { DataProvider } from './DataProvider';
export { mockDataProvider, MockDataProvider } from './MockDataProvider';

// Phase 3 will provide SupabaseDataProvider. Keeping the contract here lets
// React pages and domain services remain independent of the persistence layer.
export const getConfiguredProvider = () => mockDataProvider;

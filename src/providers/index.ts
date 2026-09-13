export type { DataProvider } from './DataProvider';
export { MockDataProvider } from './MockDataProvider';
import { MockDataProvider } from './MockDataProvider';

// Keep the persistence boundary explicit. Phase 2 defaults to mock data;
// Phase 3 can switch the implementation without changing pages or services.
export const getConfiguredProvider = () => new MockDataProvider();

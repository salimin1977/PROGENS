import type { ReactNode } from 'react';
import type { AsyncState } from '../../hooks/useAsync';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

interface AsyncSectionProps<T> {
  state: AsyncState<T>;
  loadingLabel?: string;
  children: (data: T) => ReactNode;
}

/** Renders Loading / Error / Success for any useAsync() result — the one
 * place pages branch on request state instead of each reimplementing it. */
export default function AsyncSection<T>({ state, loadingLabel, children }: AsyncSectionProps<T>) {
  if (state.status === 'loading') return <LoadingState label={loadingLabel} />;
  if (state.status === 'error') return <ErrorState message={state.error} />;
  return <>{children(state.data)}</>;
}

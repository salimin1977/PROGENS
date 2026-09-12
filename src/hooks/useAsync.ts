import { useEffect, useRef, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: string };

/**
 * Runs an async loader whenever `deps` changes and exposes a discriminated
 * loading/success/error state — the one place every page gets its
 * loading/empty/error handling from, instead of re-implementing it.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading', data: null, error: null });
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    setState({ status: 'loading', data: null, error: null });

    loader()
      .then((data) => {
        if (requestId.current === id) setState({ status: 'success', data, error: null });
      })
      .catch((err: unknown) => {
        if (requestId.current === id) {
          const message = err instanceof Error ? err.message : 'Something went wrong while loading this data.';
          setState({ status: 'error', data: null, error: message });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

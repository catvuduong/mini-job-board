'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from './api';

interface Snapshot<T> {
  path: string;
  attempt: number;
  data?: T;
  error?: string;
}

// Loads a GET endpoint. Responses for a path that is no longer current are ignored, so fast filter changes
// cannot show results for an older filter. `data` keeps the previous result while the next one loads.
export function useApi<T>(path: string) {
  const [attempt, setAttempt] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot<T>>();

  useEffect(() => {
    let active = true;
    apiFetch<T>(path).then(
      (data) => {
        if (active) setSnapshot({ path, attempt, data });
      },
      (err: unknown) => {
        if (active) {
          setSnapshot({ path, attempt, error: err instanceof Error ? err.message : 'Something went wrong' });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [path, attempt]);

  const current = snapshot?.path === path && snapshot.attempt === attempt ? snapshot : undefined;

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  // Applies a local change (for example, a card moved between columns) without refetching.
  const mutate = useCallback(
    (update: (data: T) => T) =>
      setSnapshot((s) => (s?.data === undefined ? s : { ...s, data: update(s.data) })),
    [],
  );

  return {
    data: snapshot?.data,
    error: current?.error,
    loading: current === undefined,
    reload,
    mutate,
  };
}

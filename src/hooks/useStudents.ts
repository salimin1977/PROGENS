import { useEffect, useState } from 'react';
import type { Student } from '../types';
import { getStudents } from '../services/studentService';

export function useStudents() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getStudents()
      .then((students) => {
        if (mounted) setData(students);
      })
      .catch((err: unknown) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Unable to load students.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

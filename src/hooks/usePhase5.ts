import { useEffect, useState } from 'react';
import type { AcademicResult, AttendanceRecord, Intervention, Student } from '../types';
import { getConfiguredProvider } from '../providers';
import { buildPhase5Summary, type Phase5Summary } from '../analytics/phase5Engine';

export function usePhase5() {
  const [data, setData] = useState<Phase5Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const provider = getConfiguredProvider();
    Promise.all([
      provider.getStudents(),
      provider.getAcademicResults(),
      provider.getAttendance(),
      provider.getInterventions(),
    ])
      .then(([students, results, attendance, interventions]) => {
        if (active) setData(buildPhase5Summary(students as Student[], results as AcademicResult[], attendance as AttendanceRecord[], interventions as Intervention[]));
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load Phase 5 data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { data, loading, error };
}

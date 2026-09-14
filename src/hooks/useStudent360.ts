import { useEffect, useState } from 'react';
import { getConfiguredProvider } from '../providers';
import { buildStudent360, type Student360Snapshot } from '../analytics/student360Engine';

const provider = () => getConfiguredProvider();

export function useStudent360(studentId: string | undefined) {
  const [data, setData] = useState<Student360Snapshot>();
  const [loading, setLoading] = useState(Boolean(studentId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!studentId) { setData(undefined); setLoading(false); setError(null); return; }
    setLoading(true); setError(null);
    Promise.all([provider().getStudentById(studentId), provider().getAcademicResults(), provider().getAttendance(), provider().getInterventions()])
      .then(([student, results, attendance, interventions]) => {
        if (!active) return;
        if (!student) { setData(undefined); return; }
        setData(buildStudent360(student, results, attendance, interventions));
      })
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : 'Gagal memuatkan Student 360.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [studentId]);

  return { data, loading, error };
}

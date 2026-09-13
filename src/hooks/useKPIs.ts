import { useEffect, useState } from 'react';
import type { KPI } from '../types';
import { getSchoolKPIs } from '../services/kpiService';

export interface DashboardKPIs {
  gpsCurrent: number;
  gpsTarget: number;
  gpsGap: number;
  totalStudents: number;
  studentsAtRisk: number;
  activeInterventions: number;
  attendance: number | null;
  excellenceStudents: number;
}

const toDashboardKPIs = (items: KPI[]): DashboardKPIs => {
  const value = (id: string, fallback = 0): number => items.find((item) => item.id === id)?.current ?? fallback;
  const attendance = items.find((item) => item.id === 'ATTENDANCE')?.current;

  return {
    gpsCurrent: value('GPS_CURRENT', 5.11),
    gpsTarget: items.find((item) => item.id === 'GPS_CURRENT')?.target ?? 4.84,
    gpsGap: value('GPS_GAP'),
    totalStudents: value('TOTAL_STUDENTS'),
    studentsAtRisk: value('STUDENTS_AT_RISK'),
    activeInterventions: value('ACTIVE_INTERVENTIONS'),
    attendance: typeof attendance === 'number' ? attendance : null,
    excellenceStudents: value('EXCELLENCE_STUDENTS'),
  };
};

export function useKPIs() {
  const [data, setData] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSchoolKPIs()
      .then((items) => {
        if (active) setData(toDashboardKPIs(items));
      })
      .catch(() => {
        if (active) setData(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading };
}

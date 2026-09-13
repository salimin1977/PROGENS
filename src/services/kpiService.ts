import type { KPI } from '../types';
import { calculateAttendanceRate } from '../analytics/attendanceAnalytics';
import { calculateSchoolKpis } from '../analytics/kpiAnalytics';
import { getConfiguredProvider } from '../providers';

export const getSchoolKPIs = async (): Promise<KPI[]> => {
  const provider = getConfiguredProvider();
  const [students, interventions, storedKpis] = await Promise.all([
    provider.getStudents(),
    provider.getInterventions(),
    provider.getKPIs(),
  ]);

  if (storedKpis.length > 0) return storedKpis;

  const activeInterventions = interventions.filter(
    (intervention) => intervention.status !== 'Completed',
  ).length;
  const school = calculateSchoolKpis(students, activeInterventions);
  const attendance = calculateAttendanceRate(students);

  return [
    { id: 'GPS_CURRENT', category: 'Academic', label: 'GPS Semasa', current: school.gpsCurrent, target: school.gpsTarget, unit: 'gps', higherIsBetter: false },
    { id: 'GPS_GAP', category: 'Academic', label: 'GPS Gap', current: school.gpsGap, target: 0, unit: 'pts', higherIsBetter: false },
    { id: 'TOTAL_STUDENTS', category: 'Student', label: 'Jumlah Murid', current: school.totalStudents, target: school.totalStudents, unit: 'count', higherIsBetter: true },
    { id: 'STUDENTS_AT_RISK', category: 'Risk', label: 'Murid Berisiko', current: school.studentsAtRisk, target: 0, unit: 'count', higherIsBetter: false },
    { id: 'ACTIVE_INTERVENTIONS', category: 'Intervention', label: 'Intervensi Aktif', current: school.activeInterventions, target: 0, unit: 'count', higherIsBetter: false },
    { id: 'ATTENDANCE', category: 'Attendance', label: 'Kehadiran', current: Math.round(attendance * 10) / 10, target: 95, unit: '%', higherIsBetter: true },
    { id: 'EXCELLENCE_STUDENTS', category: 'Student', label: 'Murid Cemerlang', current: school.excellenceStudents, target: 0, unit: 'count', higherIsBetter: true },
  ];
};

import type { KPI } from '../types';
import { getConfiguredProvider } from '../providers';

const provider = () => getConfiguredProvider();

export const getSchoolKPIs = async (): Promise<KPI[]> => {
  const liveKpis = await provider().getKPIs();
  if (liveKpis.length > 0) return liveKpis;

  const [students, interventions, attendance] = await Promise.all([
    provider().getStudents(),
    provider().getInterventions(),
    provider().getAttendance(),
  ]);

  const activeInterventions = interventions.filter((item) => item.status === 'Active' || item.status === 'Critical').length;
  const studentsAtRisk = students.filter((student) => student.riskLevel === 'Critical' || student.riskLevel === 'High').length;
  const excellenceStudents = students.filter((student) => student.status === 'Excellence Track').length;
  const rates = attendance.map((item) => item.rate).filter((rate): rate is number => typeof rate === 'number' && Number.isFinite(rate));
  const attendanceRate = rates.length ? Math.round((rates.reduce((sum, rate) => sum + rate, 0) / rates.length) * 10) / 10 : null;

  const items: KPI[] = [
    { id: 'GPS_CURRENT', category: 'Academic', label: 'GPS Semasa', current: 5.11, target: 4.84, unit: 'gps', higherIsBetter: false },
    { id: 'GPS_GAP', category: 'Academic', label: 'GPS Gap', current: 0.27, target: 0, unit: 'pts', higherIsBetter: false },
    { id: 'TOTAL_STUDENTS', category: 'Student', label: 'Jumlah Murid', current: students.length, target: students.length, unit: 'count', higherIsBetter: true },
    { id: 'STUDENTS_AT_RISK', category: 'Risk', label: 'Murid Berisiko', current: studentsAtRisk, target: 0, unit: 'count', higherIsBetter: false },
    { id: 'ACTIVE_INTERVENTIONS', category: 'Intervention', label: 'Intervensi Aktif', current: activeInterventions, target: 0, unit: 'count', higherIsBetter: false },
    { id: 'EXCELLENCE_STUDENTS', category: 'Student', label: 'Murid Cemerlang', current: excellenceStudents, target: 0, unit: 'count', higherIsBetter: true },
  ];

  if (attendanceRate !== null) {
    items.push({ id: 'ATTENDANCE', category: 'Attendance', label: 'Kehadiran', current: attendanceRate, target: 95, unit: '%', higherIsBetter: true });
  }

  return items;
};

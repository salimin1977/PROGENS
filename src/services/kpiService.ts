import type { KPI } from '../types';
import { getConfiguredProvider } from '../providers';

const provider = () => getConfiguredProvider();

export const getSchoolKPIs = async (): Promise<KPI[]> => {
  const liveKpis = await provider().getKPIs();
  if (liveKpis.length > 0) return liveKpis;

  const [students, interventions] = await Promise.all([
    provider().getStudents(),
    provider().getInterventions(),
  ]);

  const activeInterventions = interventions.filter((item) => item.status === 'Active' || item.status === 'Critical').length;
  const studentsAtRisk = students.filter((student) => student.riskLevel === 'Critical' || student.riskLevel === 'High').length;
  const excellenceStudents = students.filter((student) => student.status === 'Excellence Track').length;
  const assessed = students.filter((student) => student.riskLevel !== 'Unassessed').length;

  return [
    { id: 'GPS_CURRENT', category: 'Academic', label: 'GPS Semasa', current: 5.11, target: 4.84, unit: 'gps', higherIsBetter: false },
    { id: 'GPS_GAP', category: 'Academic', label: 'GPS Gap', current: 0.27, target: 0, unit: 'pts', higherIsBetter: false },
    { id: 'TOTAL_STUDENTS', category: 'Student', label: 'Jumlah Murid', current: students.length, target: students.length, unit: 'count', higherIsBetter: true },
    { id: 'STUDENTS_ASSESSED', category: 'Coverage', label: 'Murid Dinilai', current: assessed, target: students.length, unit: 'count', higherIsBetter: true },
    { id: 'STUDENTS_AT_RISK', category: 'Risk', label: 'Murid Berisiko', current: studentsAtRisk, target: 0, unit: 'count', higherIsBetter: false },
    { id: 'ACTIVE_INTERVENTIONS', category: 'Intervention', label: 'Intervensi Aktif', current: activeInterventions, target: studentsAtRisk, unit: 'count', higherIsBetter: true },
    { id: 'EXCELLENCE_STUDENTS', category: 'Student', label: 'Murid Cemerlang', current: excellenceStudents, target: 0, unit: 'count', higherIsBetter: true },
  ];
};

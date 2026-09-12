import type { Student } from '../types';
import { calculateReapPriority, type ReapPriorityResult } from '../engines/reapEngine';
import { getDataProvider } from '../providers';
import { loadCoreDataset } from './dataset';
import { listStudents } from './studentService';

export interface ReapOverview {
  students: Student[];
  priorities: Map<string, ReapPriorityResult>;
  eliteStudents: Student[];
  atRiskStudents: Student[];
  kpis: {
    gpsCurrent: number;
    gpsTarget: number;
    passRate: number;
    aPlusStudents: number;
    atRiskStudents: number;
  };
}

export async function getReapOverview(): Promise<ReapOverview> {
  const provider = getDataProvider();
  const [dataset, students, kpiTargets] = await Promise.all([
    loadCoreDataset(),
    listStudents({ form: 'Tingkatan 5' }),
    provider.getKpiTargets(),
  ]);

  const targetGps = kpiTargets.find((k) => k.kpi_name === 'GPS Semasa')?.target_value ?? 4.84;

  const priorities = new Map<string, ReapPriorityResult>();
  for (const student of students) {
    const activeIntervention = dataset.interventions.find((i) => i.student_id === student.id && i.status === 'ACTIVE');
    priorities.set(
      student.id,
      calculateReapPriority({
        studentId: student.id,
        currentGpm: student.gpm,
        targetGps,
        riskLevel: student.riskLevel,
        interventionStatus: activeIntervention ? 'ACTIVE' : 'NONE',
      })
    );
  }

  const gpsCurrent = students.length ? Math.round((students.reduce((sum, s) => sum + s.gpm, 0) / students.length) * 100) / 100 : targetGps;
  const passRate = students.length ? Math.round((students.filter((s) => s.subjects.every((sub) => sub.grade !== 'G')).length / students.length) * 1000) / 10 : 0;
  const aPlusStudents = students.filter((s) => s.subjects.length > 0 && s.subjects.every((sub) => sub.grade === 'A+')).length;
  const atRiskStudents = students.filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH');

  return {
    students,
    priorities,
    eliteStudents: [...students].sort((a, b) => a.gpm - b.gpm).slice(0, 6),
    atRiskStudents,
    kpis: { gpsCurrent, gpsTarget: targetGps, passRate, aPlusStudents, atRiskStudents: atRiskStudents.length },
  };
}

import type { Student } from '../types';
import { classifySeedsStudent, type SeedsClassification } from '../engines/seedsEngine';
import { getDataProvider } from '../providers';
import { listStudents } from './studentService';

export interface SeedsFunnelStage {
  label: string;
  count: number;
}

export interface SeedsOverview {
  funnel: SeedsFunnelStage[];
  solaris: Student[];
  nova: Student[];
  supernova: Student[];
  stemPipeline: Student[];
  classifications: Map<string, SeedsClassification>;
}

function sortByGpm(students: Student[]): Student[] {
  return [...students].sort((a, b) => a.gpm - b.gpm);
}

async function rosterFor(program: 'NOVA' | 'SUPERNOVA', pool: Student[], fallbackCount: number): Promise<Student[]> {
  const provider = getDataProvider();
  const ids = await provider.getFlagshipRoster(program);
  if (ids.length > 0) {
    const byId = new Map(pool.map((s) => [s.id, s]));
    const roster = ids.map((id) => byId.get(id)).filter((s): s is Student => Boolean(s));
    if (roster.length > 0) return roster;
  }
  return sortByGpm(pool).slice(0, fallbackCount);
}

export async function getSeedsOverview(): Promise<SeedsOverview> {
  const lowerForm = (
    await Promise.all([
      listStudents({ form: 'Tingkatan 1' }),
      listStudents({ form: 'Tingkatan 2' }),
      listStudents({ form: 'Tingkatan 3' }),
    ])
  ).flat();

  const t1 = lowerForm.filter((s) => s.form === 'Tingkatan 1');
  const t2 = lowerForm.filter((s) => s.form === 'Tingkatan 2');
  const t3 = lowerForm.filter((s) => s.form === 'Tingkatan 3');
  const t3Cekap = t3.filter((s) => s.className === '3 Cekap');

  const classifications = new Map<string, SeedsClassification>();
  for (const student of lowerForm) {
    classifications.set(
      student.id,
      classifySeedsStudent({
        studentId: student.id,
        gpm: student.gpm,
        attendanceRate: student.attendanceRate,
        riskLevel: student.riskLevel,
        stemInterest: student.stemTrack,
      })
    );
  }

  const funnel: SeedsFunnelStage[] = [
    { label: 'Identified', count: lowerForm.length },
    { label: 'Screened', count: lowerForm.filter((s) => s.gpm <= 7).length },
    { label: 'Evaluated', count: lowerForm.filter((s) => s.gpm <= 6).length },
    { label: 'Developed', count: lowerForm.filter((s) => s.gpm <= 4).length },
    { label: 'Sustained', count: lowerForm.filter((s) => s.gpm <= 2.5).length },
    { label: 'Excellence', count: lowerForm.filter((s) => s.gpm <= 1.5).length },
  ];

  const solaris = sortByGpm(t1).slice(0, 5);
  const nova = await rosterFor('NOVA', t2, 10);
  const supernova = await rosterFor('SUPERNOVA', t3Cekap.length >= 10 ? t3Cekap : t3, 10);
  const stemPipeline = sortByGpm(lowerForm.filter((s) => s.stemTrack)).slice(0, 8);

  return { funnel, solaris, nova, supernova, stemPipeline, classifications };
}

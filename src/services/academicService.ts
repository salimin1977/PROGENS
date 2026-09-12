import type { ClassPerformance, GpsTrendEntry, GradeDistributionEntry, SubjectPerformance } from '../types';
import { calculateGPMP, calculateGPS, calculateGradeDistribution, calculatePassRate, calculateSubjectPerformance } from '../engines/academicEngine';
import { loadCoreDataset } from './dataset';
import { buildRiskLookup } from './riskLookup';
import { getDataProvider } from '../providers';

export interface AcademicOverview {
  gpsCurrent: number;
  gpsTarget: number;
  gpmpCurrent: number;
  gpmpTarget: number;
  passRate: number;
  passRateTarget: number;
  subjectPerformance: SubjectPerformance[];
  gradeDistribution: GradeDistributionEntry[];
  classPerformance: ClassPerformance[];
  gpsTrend: GpsTrendEntry[];
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export async function getAcademicOverview(): Promise<AcademicOverview> {
  const dataset = await loadCoreDataset();
  const provider = getDataProvider();
  const [kpiTargets, gpsSnapshots] = await Promise.all([provider.getKpiTargets(), provider.getKpiSnapshots('GPS Semasa')]);
  const riskLookup = buildRiskLookup(dataset);

  const gpsTargetRow = kpiTargets.find((k) => k.kpi_name === 'GPS Semasa');
  const gpmpTargetRow = kpiTargets.find((k) => k.kpi_name === 'GPMP Matematik');
  const passRateTargetRow = kpiTargets.find((k) => k.kpi_name === 'Kadar Lulus');

  const subjectPerf = calculateSubjectPerformance(dataset.latestResults, dataset.subjects);
  const gpsCurrent = calculateGPS(dataset.latestResults);

  const gpsTrend: GpsTrendEntry[] = [
    ...gpsSnapshots.map((s) => ({ year: s.snapshot_date.slice(0, 4), gps: s.value, target: gpsTargetRow?.target_value ?? 4.84 })),
    { year: dataset.academicYear.year.toString(), gps: gpsCurrent, target: gpsTargetRow?.target_value ?? 4.84 },
  ];

  const classPerformance: ClassPerformance[] = dataset.classes.map((c) => {
    const classStudents = dataset.students.filter((s) => s.class_id === c.id);
    const classStudentIds = new Set(classStudents.map((s) => s.id));
    const classResults = dataset.latestResults.filter((r) => classStudentIds.has(r.student_id));
    const atRisk = classStudents.filter((s) => {
      const level = riskLookup.get(s.id)?.risk_level;
      return level === 'CRITICAL' || level === 'HIGH';
    }).length;

    return {
      className: c.name,
      form: `Tingkatan ${c.form}` as ClassPerformance['form'],
      average: average(classResults.map((r) => r.percentage)),
      passRate: calculatePassRate(classResults),
      studentsAtRisk: atRisk,
    };
  });

  return {
    gpsCurrent,
    gpsTarget: gpsTargetRow?.target_value ?? 4.84,
    gpmpCurrent: calculateGPMP(dataset.latestResults, 'sub-mat'),
    gpmpTarget: gpmpTargetRow?.target_value ?? 5.0,
    passRate: calculatePassRate(dataset.latestResults),
    passRateTarget: passRateTargetRow?.target_value ?? 95,
    subjectPerformance: subjectPerf.map((s) => ({ subject: s.subjectName, average: s.averagePercentage, target: 70, passRate: s.passRate })),
    gradeDistribution: calculateGradeDistribution(dataset.latestResults),
    classPerformance,
    gpsTrend,
  };
}

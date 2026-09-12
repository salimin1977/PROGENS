import type { Student } from '../types';
import type { Department } from '../types/schema';
import { calculateGrowScore, type GrowScoreResult } from '../engines/growEngine';
import { loadCoreDataset } from './dataset';
import { listStudents } from './studentService';

export interface GrowOverview {
  students: Student[];
  scores: Map<string, GrowScoreResult>;
  classIndex: { className: string; academic: number; career: number; attendance: number; atRisk: number }[];
  watchlist: Student[];
}

function studentStrongestDepartment(dataset: Awaited<ReturnType<typeof loadCoreDataset>>, studentId: string): { department: Department; readiness: number } {
  const results = dataset.latestResults.filter((r) => r.student_id === studentId);
  const byDept = new Map<Department, number[]>();
  for (const r of results) {
    const subject = dataset.subjects.find((s) => s.id === r.subject_id);
    if (!subject) continue;
    if (!byDept.has(subject.department)) byDept.set(subject.department, []);
    byDept.get(subject.department)!.push(r.gp);
  }
  let best: Department = 'Others';
  let bestAvg = 11;
  for (const [dept, points] of byDept) {
    const avg = points.reduce((a, b) => a + b, 0) / points.length;
    if (avg < bestAvg) {
      bestAvg = avg;
      best = dept;
    }
  }
  const readiness = Math.round(100 - ((bestAvg - 1) / 9) * 100);
  return { department: best, readiness: Math.max(0, Math.min(100, readiness)) };
}

export async function getGrowOverview(): Promise<GrowOverview> {
  const [dataset, students] = await Promise.all([loadCoreDataset(), listStudents({ form: 'Tingkatan 4' })]);

  const scores = new Map<string, GrowScoreResult>();
  for (const student of students) {
    const { department, readiness } = studentStrongestDepartment(dataset, student.id);
    scores.set(
      student.id,
      calculateGrowScore({
        studentId: student.id,
        gpm: student.gpm,
        attendanceRate: student.attendanceRate,
        careerReadiness: readiness,
        strongestDepartment: department,
      })
    );
  }

  const classNames = Array.from(new Set(students.map((s) => s.className)));
  const classIndex = classNames.map((className) => {
    const classStudents = students.filter((s) => s.className === className);
    return {
      className,
      academic: Math.round(classStudents.reduce((sum, s) => sum + s.academicScore, 0) / classStudents.length),
      career: Math.round(classStudents.reduce((sum, s) => sum + (scores.get(s.id)?.score ?? 0), 0) / classStudents.length),
      attendance: Math.round(classStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / classStudents.length),
      atRisk: classStudents.filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH').length,
    };
  });

  const watchlist = students
    .filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH')
    .sort((a, b) => b.gpm - a.gpm);

  return { students, scores, classIndex, watchlist };
}

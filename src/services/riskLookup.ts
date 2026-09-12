import { calculateStudentRisk, type StudentRiskAssessment } from '../engines/riskEngine';
import type { CoreDataset } from './dataset';

/** Computes a risk assessment for every student once, keyed by student id. */
export function buildRiskLookup(dataset: CoreDataset): Map<string, StudentRiskAssessment> {
  const byStudentLatest = new Map<string, typeof dataset.latestResults>();
  const byStudentPrevious = new Map<string, typeof dataset.previousResults>();
  const byStudentAttendance = new Map<string, typeof dataset.attendance>();

  for (const r of dataset.latestResults) {
    if (!byStudentLatest.has(r.student_id)) byStudentLatest.set(r.student_id, []);
    byStudentLatest.get(r.student_id)!.push(r);
  }
  for (const r of dataset.previousResults) {
    if (!byStudentPrevious.has(r.student_id)) byStudentPrevious.set(r.student_id, []);
    byStudentPrevious.get(r.student_id)!.push(r);
  }
  for (const a of dataset.attendance) {
    if (!byStudentAttendance.has(a.student_id)) byStudentAttendance.set(a.student_id, []);
    byStudentAttendance.get(a.student_id)!.push(a);
  }

  const lookup = new Map<string, StudentRiskAssessment>();
  for (const student of dataset.students) {
    lookup.set(
      student.id,
      calculateStudentRisk({
        studentId: student.id,
        latestResults: byStudentLatest.get(student.id) ?? [],
        previousResults: byStudentPrevious.get(student.id) ?? [],
        attendanceRecords: byStudentAttendance.get(student.id) ?? [],
        subjects: dataset.subjects,
      })
    );
  }
  return lookup;
}

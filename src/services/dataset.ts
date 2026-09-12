// Shared dataset loader — every service pulls through here instead of
// calling the DataProvider directly, so the (admittedly bulk) fetch
// pattern that suits this school-wide dashboard lives in exactly one
// place. Not cached across calls: each page load gets a fresh read,
// which is what a real Supabase-backed deployment would want too.

import { getDataProvider } from '../providers';
import { checkDatasetIntegrity } from '../utils/validation';
import type {
  AcademicResult,
  AcademicYear,
  Assessment,
  AttendanceRecord,
  ClassRoom,
  DbIntervention,
  DbStudent,
  School,
  Subject,
  Teacher,
} from '../types/schema';

export interface CoreDataset {
  school: School;
  academicYear: AcademicYear;
  students: DbStudent[];
  teachers: Teacher[];
  classes: ClassRoom[];
  subjects: Subject[];
  assessments: Assessment[];
  latestAssessment: Assessment;
  previousAssessment: Assessment | null;
  latestResults: AcademicResult[];
  previousResults: AcademicResult[];
  attendance: AttendanceRecord[];
  interventions: DbIntervention[];
}

let integrityChecked = false;

export async function loadCoreDataset(): Promise<CoreDataset> {
  const provider = getDataProvider();

  const [school, academicYear, students, teachers, classes, subjects, assessments, attendance, interventions] = await Promise.all([
    provider.getSchool(),
    provider.getCurrentAcademicYear(),
    provider.getStudents(),
    provider.getTeachers(),
    provider.getClasses(),
    provider.getSubjects(),
    provider.getAssessments(),
    provider.getAttendance(),
    provider.getInterventions(),
  ]);

  const sortedAssessments = [...assessments].sort((a, b) => a.date.localeCompare(b.date));
  const latestAssessment = sortedAssessments[sortedAssessments.length - 1];
  const previousAssessment = sortedAssessments.length > 1 ? sortedAssessments[sortedAssessments.length - 2] : null;

  if (!latestAssessment) {
    throw new Error('No assessments configured for the current academic year');
  }

  const [latestResults, previousResults] = await Promise.all([
    provider.getAcademicResults({ assessmentId: latestAssessment.id }),
    previousAssessment ? provider.getAcademicResults({ assessmentId: previousAssessment.id }) : Promise.resolve([]),
  ]);

  if (import.meta.env.DEV && !integrityChecked) {
    integrityChecked = true;
    const issues = checkDatasetIntegrity({
      students,
      classes,
      subjects,
      assessments: sortedAssessments,
      academicResults: [...latestResults, ...previousResults],
    });
    if (issues.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(`[PROGENS] Dataset integrity check found ${issues.length} issue(s):`, issues);
    }
  }

  return {
    school,
    academicYear,
    students,
    teachers,
    classes,
    subjects,
    assessments: sortedAssessments,
    latestAssessment,
    previousAssessment,
    latestResults,
    previousResults,
    attendance,
    interventions,
  };
}

export function subjectName(subjects: Subject[], subjectId: string): string {
  return subjects.find((s) => s.id === subjectId)?.name ?? subjectId;
}

export function studentsByClass(students: DbStudent[], classId: string): DbStudent[] {
  return students.filter((s) => s.class_id === classId);
}

import type { SchoolProfile } from '../types';
import { loadCoreDataset } from './dataset';

export async function getSchoolProfile(): Promise<SchoolProfile> {
  const dataset = await loadCoreDataset();
  return {
    name: dataset.school.name,
    code: dataset.school.code,
    address: dataset.school.address,
    principal: dataset.school.principal_name,
    academicYear: dataset.academicYear.year.toString(),
    totalStudents: dataset.students.length,
    totalTeachers: dataset.teachers.length,
  };
}

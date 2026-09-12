import { useAsync, type AsyncState } from './useAsync';
import { getStudentProfile } from '../services/studentService';
import type { Student } from '../types';

/** A single student's full profile by id. */
export function useStudent(studentId: string | undefined): AsyncState<Student | null> {
  return useAsync(() => getStudentProfile(studentId ?? ''), [studentId]);
}

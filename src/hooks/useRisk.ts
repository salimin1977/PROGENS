import { useMemo } from 'react';
import type { Student } from '../types';
import { calculateStudentRisk } from '../analytics/riskAnalytics';
export function useRisk(student: Student | undefined) { return useMemo(() => student ? calculateStudentRisk(student) : undefined, [student]); }

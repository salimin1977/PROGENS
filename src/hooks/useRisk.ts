import { useAsync, type AsyncState } from './useAsync';
import { getStudentRiskProfile } from '../services/riskLookup';
import type { RiskProfile } from '../engines/riskEngine';

/** A single student's risk profile (risk_level, risk_score, reasons, recommended_action). */
export function useRisk(studentId: string | undefined): AsyncState<RiskProfile | null> {
  return useAsync(() => getStudentRiskProfile(studentId ?? ''), [studentId]);
}

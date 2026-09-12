// STEM Engine — the Mathematics/Science pipeline toward STEM A.
//
// IMPORTANT: a student who fails Mathematics OR Science is classified
// RESCUE and does NOT count toward the "STEM A Pipeline" identified pool —
// they are excluded entirely, not merely ranked lowest within it. This is
// why a class where every student fails Mathematics (e.g. 3 Berani in the
// 2027 cohort) contributes zero students to the pipeline, not a low tier
// within it.

import type { Grade, StemStatus } from '../types/schema';
import { calculateGP, isPass } from '../utils/grading';

export type StemPotential = 'LOW' | 'MEDIUM' | 'HIGH';
export type StemPipelineStatus = 'ELITE' | 'BOOST' | 'RESCUE' | 'MONITOR';

export interface StemClassificationInput {
  studentId: string;
  mathGrade?: Grade;
  scienceGrade?: Grade;
  stemInterest: boolean;
}

export interface StemClassification {
  studentId: string;
  math_status: StemStatus;
  science_status: StemStatus;
  stem_interest: boolean;
  potential: StemPotential;
  pipeline_status: StemPipelineStatus;
  /** True only for students counted in the identified STEM A Pipeline pool. */
  inPipeline: boolean;
  recommended_action: string;
}

function statusFor(grade?: Grade): StemStatus {
  if (!grade) return 'NOT_TAKEN';
  return isPass(grade) ? 'PASS' : 'FAIL';
}

const RECOMMENDED_ACTION: Record<StemPipelineStatus, string> = {
  ELITE: 'Fast-track into STEM Elite enrichment and Olympiad training',
  BOOST: 'Structured STEM Boost programme for Mathematics & Science mastery',
  MONITOR: 'Monitor progress; encourage STEM elective participation',
  RESCUE: 'Immediate STEM Rescue — remedial Mathematics/Science support',
};

export function classifyStemPipeline(input: StemClassificationInput): StemClassification {
  const { studentId, mathGrade, scienceGrade, stemInterest } = input;
  const math_status = statusFor(mathGrade);
  const science_status = statusFor(scienceGrade);
  const eligible = math_status === 'PASS' && science_status === 'PASS';

  if (!eligible) {
    return {
      studentId,
      math_status,
      science_status,
      stem_interest: stemInterest,
      potential: 'LOW',
      pipeline_status: 'RESCUE',
      inPipeline: false,
      recommended_action: RECOMMENDED_ACTION.RESCUE,
    };
  }

  const worstPoint = Math.max(calculateGP(mathGrade!), calculateGP(scienceGrade!));
  let potential: StemPotential;
  let pipeline_status: StemPipelineStatus;
  if (worstPoint <= 2) {
    potential = 'HIGH';
    pipeline_status = 'ELITE';
  } else if (worstPoint <= 5) {
    potential = 'MEDIUM';
    pipeline_status = 'BOOST';
  } else {
    potential = 'LOW';
    pipeline_status = 'MONITOR';
  }

  return {
    studentId,
    math_status,
    science_status,
    stem_interest: stemInterest,
    potential,
    pipeline_status,
    // MONITOR means "passing but low STEM potential" — not yet a pipeline
    // candidate. Only ELITE/BOOST count toward the identified pipeline pool.
    inPipeline: pipeline_status !== 'MONITOR',
    recommended_action: RECOMMENDED_ACTION[pipeline_status],
  };
}

import { describe, expect, it } from 'vitest';
import { generateInterventionRecommendation } from './interventionEngine';
import type { StudentRiskAssessment } from './riskEngine';

function makeRisk(overrides: Partial<StudentRiskAssessment> = {}): StudentRiskAssessment {
  return {
    studentId: 's1',
    risk_level: 'LOW',
    risk_score: 0,
    reasons: ['No significant risk factors detected'],
    recommended_action: 'Continue standard monitoring',
    gCount: 0,
    attendanceRate: 100,
    trendDelta: 0,
    ...overrides,
  };
}

describe('generateInterventionRecommendation', () => {
  it('recommends Academic Rescue and Parent Engagement for CRITICAL risk', () => {
    const rec = generateInterventionRecommendation({
      studentId: 's1',
      form: 2,
      risk: makeRisk({ risk_level: 'CRITICAL', gCount: 4 }),
      failingSubjectNames: ['Bahasa Melayu', 'Sejarah', 'Matematik', 'Sains'],
    });
    expect(rec.shouldIntervene).toBe(true);
    expect(rec.priority).toBe('P1');
    expect(rec.actions).toContain('Academic Rescue');
    expect(rec.actions).toContain('Parent Engagement');
    // Failing Matematik/Sains routes to STEM Rescue instead of generic coaching
    expect(rec.actions).toContain('STEM Rescue');
  });

  it('recommends Attendance Intervention whenever attendance is below 90%', () => {
    const rec = generateInterventionRecommendation({
      studentId: 's1',
      form: 2,
      risk: makeRisk({ attendanceRate: 85 }),
      failingSubjectNames: [],
    });
    expect(rec.actions).toContain('Attendance Intervention');
  });

  it('recommends Subject Coaching for a single non-STEM failing subject below CRITICAL', () => {
    const rec = generateInterventionRecommendation({
      studentId: 's1',
      form: 2,
      risk: makeRisk({ risk_level: 'MEDIUM', gCount: 1 }),
      failingSubjectNames: ['Sejarah'],
    });
    expect(rec.actions).toContain('Subject Coaching');
    expect(rec.actions).not.toContain('STEM Rescue');
  });

  it('adds Career Guidance for Tingkatan 5 students at HIGH or CRITICAL risk', () => {
    const rec = generateInterventionRecommendation({
      studentId: 's1',
      form: 5,
      risk: makeRisk({ risk_level: 'HIGH', gCount: 2 }),
      failingSubjectNames: ['Ekonomi', 'Sejarah'],
    });
    expect(rec.actions).toContain('Career Guidance');
  });

  it('does not intervene on a genuinely LOW-risk student with no failing subjects', () => {
    const rec = generateInterventionRecommendation({
      studentId: 's1',
      form: 3,
      risk: makeRisk(),
      failingSubjectNames: [],
    });
    expect(rec.shouldIntervene).toBe(false);
    expect(rec.priority).toBe('NONE');
    expect(rec.actions).toHaveLength(0);
  });
});

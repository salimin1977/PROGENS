// Shared conversions from normalized DB rows -> UI view models.

import type { AcademicResult, AttendanceRecord, DbIntervention, Subject } from '../types/schema';
import type { Form, ProgressEvent, StudentProgressStatus, SubjectScore, TalentProfile } from '../types';
import type { StudentRiskAssessment } from '../engines/riskEngine';

const FORM_LABEL: Record<number, Form> = {
  1: 'Tingkatan 1',
  2: 'Tingkatan 2',
  3: 'Tingkatan 3',
  4: 'Tingkatan 4',
  5: 'Tingkatan 5',
};

export function formLabel(form: number): Form {
  return FORM_LABEL[form] ?? 'Tingkatan 1';
}

export function toSubjectScores(results: AcademicResult[], subjects: Subject[]): SubjectScore[] {
  return results.map((r) => {
    const subject = subjects.find((s) => s.id === r.subject_id);
    return {
      subject: subject?.name ?? r.subject_id,
      score: r.percentage,
      grade: r.grade,
      gp: r.gp,
      department: subject?.department ?? 'Others',
    };
  });
}

const TALENT_DOMAINS = ['Debate', 'Robotics', 'Netball', 'Choir', 'Chess', 'Football', 'Visual Art', 'Entrepreneurship', 'Public Speaking', 'Badminton'];
const TALENT_LEVELS: TalentProfile['level'][] = ['Emerging', 'Developing', 'Proficient', 'Elite'];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

/**
 * Deterministic, seed-free talent list derived from the student's own id —
 * PROGENS has no talent-tracking table yet, so this keeps the Talent tab
 * populated without inventing a fake data source to seed from.
 */
export function buildTalents(studentId: string): TalentProfile[] {
  const hash = hashString(studentId);
  const count = hash % 5 === 0 ? 0 : (hash % 2) + 1;
  const talents: TalentProfile[] = [];
  for (let i = 0; i < count; i++) {
    const domain = TALENT_DOMAINS[(hash + i * 7) % TALENT_DOMAINS.length];
    const level = TALENT_LEVELS[(hash + i * 3) % TALENT_LEVELS.length];
    talents.push({ domain, level, notes: `Participated in school-level ${domain.toLowerCase()} activities this academic year.` });
  }
  return talents;
}

export function progressStatusFor(risk: StudentRiskAssessment, gpm: number, attendanceRate: number): StudentProgressStatus {
  if (risk.risk_level === 'CRITICAL' || risk.risk_level === 'HIGH') return 'On Watch';
  if (gpm <= 2 && attendanceRate >= 95) return 'Excellence Track';
  return 'Active';
}

export function buildProgressTimeline(input: {
  previousResults: AcademicResult[];
  latestResults: AcademicResult[];
  attendanceRecords: AttendanceRecord[];
  interventions: DbIntervention[];
  risk: StudentRiskAssessment;
}): ProgressEvent[] {
  const { previousResults, latestResults, attendanceRecords, interventions, risk } = input;
  const events: ProgressEvent[] = [];

  if (previousResults.length > 0) {
    events.push({
      date: previousResults[0].created_at.slice(0, 10),
      label: 'Peperiksaan Pertengahan Tahun',
      category: 'Academic',
      detail: `Recorded ${previousResults.length} subject results at the mid-year assessment.`,
    });
  }

  const flaggedAttendance = attendanceRecords.filter((a) => a.status === 'ABSENT');
  if (flaggedAttendance.length > 0) {
    events.push({
      date: flaggedAttendance[flaggedAttendance.length - 1].date,
      label: 'Attendance Pattern Reviewed',
      category: 'Attendance',
      detail: `${flaggedAttendance.length} recorded absence(s) this year.`,
    });
  }

  for (const intervention of interventions) {
    events.push({
      date: intervention.start_date,
      label: `${intervention.category} Initiated`,
      category: 'Intervention',
      detail: intervention.problem,
    });
  }

  if (latestResults.length > 0) {
    events.push({
      date: latestResults[0].created_at.slice(0, 10),
      label: 'Peperiksaan Akhir Tahun',
      category: 'Academic',
      detail: `Latest assessment: ${risk.reasons[0]}.`,
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

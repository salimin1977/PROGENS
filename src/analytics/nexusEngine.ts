// NEXUS analytics engine — the decision-support layer. Every insight
// answers WHAT is happening, WHY, WHO is affected, WHAT action to take,
// and WHAT HAPPENS IF NOTHING is done. Pure function over already-computed
// overviews so it stays independently testable from data fetching.

import type { AiInsight } from '../types';
import type { AcademicOverview } from '../services/academicService';
import type { AttendanceOverview } from '../services/attendanceService';
import type { StemOverview } from '../services/stemService';
import type { ClassPerformance } from '../types';

export interface NexusInput {
  academic: AcademicOverview;
  attendance: AttendanceOverview;
  stem: StemOverview;
}

function worstSubject(academic: AcademicOverview) {
  return [...academic.subjectPerformance].sort((a, b) => a.passRate - b.passRate)[0];
}

function weakestClasses(classPerformance: ClassPerformance[], count = 2) {
  return [...classPerformance].sort((a, b) => a.average - b.average).slice(0, count);
}

export function generateNexusInsights(input: NexusInput): AiInsight[] {
  const { academic, attendance, stem } = input;
  const insights: AiInsight[] = [];

  const bottleneck = worstSubject(academic);
  if (bottleneck) {
    const weakClasses = weakestClasses(academic.classPerformance);
    insights.push({
      id: 'insight-subject-bottleneck',
      headline: `${bottleneck.subject} is the leading performance bottleneck`,
      what: `${bottleneck.subject} has the lowest pass rate of any subject at ${bottleneck.passRate}%, against a target of ${bottleneck.target}%.`,
      why: 'A high proportion of students remain below the mastery threshold in this subject, dragging down class and school GPS.',
      who: weakClasses.map((c) => c.className).join(' and ') || 'Multiple classes school-wide',
      action: `Launch a targeted ${bottleneck.subject} booster programme with weekly diagnostic tracking.`,
      whatIfNothing: 'The school GPS gap to target will widen and more students will enter the at-risk band next assessment cycle.',
      severity: 'critical',
    });
  }

  const chronicRate = attendance.riskVsAttendance.find((b) => b.band === '< 80%');
  if (chronicRate && chronicRate.studentCount > 0) {
    insights.push({
      id: 'insight-attendance-risk',
      headline: 'Attendance below 80% strongly correlates with academic risk',
      what: `${chronicRate.studentCount} student(s) attend below 80% of school days, the highest average risk band recorded.`,
      why: 'Missed instructional time compounds gaps in core subjects, especially for students already below mastery.',
      who: 'Chronic absentee students across all forms.',
      action: 'Activate the Attendance Recovery Plan and notify guardians within 48 hours of a 3-day absence streak.',
      whatIfNothing: 'Chronic absentees are likely to accumulate additional failing subjects and require CRITICAL-tier intervention.',
      severity: 'warning',
    });
  }

  const berani = stem.form3ClassBreakdown.find((c) => c.allFailedMath);
  if (berani) {
    insights.push({
      id: 'insight-stem-crisis',
      headline: `${berani.className} — every student failed Mathematics`,
      what: `All ${berani.totalCount} students in ${berani.className} failed Mathematics in the latest assessment, contributing zero students to the STEM A Pipeline.`,
      why: 'A class-wide Mathematics failure points to a foundational or instructional gap rather than individual underperformance.',
      who: berani.className,
      action: 'Deploy STEM Rescue as a whole-class intervention and review Mathematics instruction delivery for this class.',
      whatIfNothing: 'The 2027 STEM A Pipeline cohort permanently loses this class as a source of candidates.',
      severity: 'critical',
    });
  }

  const strongClass = [...stem.form3ClassBreakdown].filter((c) => !c.allFailedMath).sort((a, b) => b.eligibleCount / (b.totalCount || 1) - a.eligibleCount / (a.totalCount || 1))[0];
  if (strongClass && strongClass.eligibleCount > 0) {
    const eligibleShare = Math.round((strongClass.eligibleCount / strongClass.totalCount) * 100);
    insights.push({
      id: 'insight-stem-strength',
      headline: `${strongClass.className} shows strong STEM pipeline potential`,
      what: `${eligibleShare}% of ${strongClass.className} students (${strongClass.eligibleCount} of ${strongClass.totalCount}) are STEM A Pipeline eligible.`,
      why: 'Consistent teaching quality and peer learning culture in this class are producing STEM-ready students ahead of streaming.',
      who: strongClass.className,
      action: 'Fast-track eligible students into STEM Elite enrichment before Tingkatan 4 streaming.',
      whatIfNothing: 'The school under-utilises a ready pipeline of STEM-capable students heading into Tingkatan 4 Sains.',
      severity: 'info',
    });
  }

  return insights;
}

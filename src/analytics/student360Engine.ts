import type { AcademicResult, AttendanceRecord, Intervention, Student } from '../types';
import { selectLatestAssessmentResults } from './bottleneckEngine';

export interface Student360Subject {
  subject: string;
  score: number;
  grade: string;
  assessmentName: string;
}

export interface Student360Snapshot {
  student: Student;
  academicScore: number | null;
  subjects: Student360Subject[];
  absentDays: number | null;
  attendanceSource: string | null;
  risk: Student['riskLevel'];
  interventions: Intervention[];
  activeInterventions: number;
  phase: 'SEEDS' | 'GROW' | 'REAP';
  continuum: string;
  strengths: string[];
  gaps: string[];
  nextActions: string[];
  dataCoverage: string[];
}

function phaseForForm(form: Student['form']): Student360Snapshot['phase'] {
  if (form === 'Tingkatan 5') return 'REAP';
  if (form === 'Tingkatan 4') return 'GROW';
  return 'SEEDS';
}

export function buildStudent360(
  student: Student,
  academicResults: AcademicResult[],
  attendance: AttendanceRecord[],
  interventions: Intervention[],
): Student360Snapshot {
  const latest = selectLatestAssessmentResults(academicResults).filter((row) => row.studentId === student.id && row.maximumMarks > 0);
  const subjects = latest.map((row) => ({
    subject: row.subject,
    score: Math.round((row.marks / row.maximumMarks) * 1000) / 10,
    grade: row.grade,
    assessmentName: row.assessmentName ?? row.assessment,
  })).sort((a, b) => b.score - a.score);
  const academicScore = subjects.length ? Math.round(subjects.reduce((sum, row) => sum + row.score, 0) / subjects.length * 10) / 10 : null;
  const attendanceRows = attendance.filter((row) => row.studentId === student.id);
  const absentDays = attendanceRows.length ? Math.max(...attendanceRows.map((row) => row.absentDays)) : null;
  const attendanceSource = attendanceRows[0]?.sourceLabel ?? null;
  const studentInterventions = interventions.filter((row) => row.studentId === student.id);
  const activeInterventions = studentInterventions.filter((row) => row.status !== 'Completed').length;
  const phase = phaseForForm(student.form);
  const continuum = phase === 'SEEDS' ? 'SEEDS → bina potensi' : phase === 'GROW' ? 'SEEDS → GROW → kukuhkan pencapaian' : 'SEEDS → GROW → REAP → kesiapsiagaan SPM';
  const strengths = subjects.filter((row) => row.score >= 75).slice(0, 3).map((row) => `${row.subject} ${row.score}%`);
  const gaps = subjects.filter((row) => row.score < 65).slice(-3).reverse().map((row) => `${row.subject} ${row.score}%`);
  const nextActions = [
    ...(gaps.length ? [`Fokus intervensi: ${gaps.join(', ')}`] : []),
    ...(absentDays !== null && absentDays >= 10 ? [`Semak punca ${absentDays} hari tidak hadir`] : []),
    ...(studentInterventions.length === 0 && (student.riskLevel === 'Critical' || student.riskLevel === 'High') ? ['Buka dan tetapkan intervensi'] : []),
    ...(nextActionsFallback(student, gaps, absentDays)),
  ].slice(0, 3);
  const dataCoverage = [
    subjects.length ? `Akademik: ${subjects.length} subjek` : 'Akademik: tiada keputusan terkini',
    attendanceRows.length ? `Kehadiran: agregat ${absentDays} hari tidak hadir` : 'Kehadiran: tiada rekod agregat',
    studentInterventions.length ? `Intervensi: ${studentInterventions.length} rekod` : 'Intervensi: tiada rekod',
  ];

  return { student, academicScore, subjects, absentDays, attendanceSource, risk: student.riskLevel, interventions: studentInterventions, activeInterventions, phase, continuum, strengths, gaps, nextActions, dataCoverage };
}

function nextActionsFallback(student: Student, gaps: string[], absentDays: number | null): string[] {
  if (!gaps.length && !(absentDays !== null && absentDays >= 10) && student.riskLevel !== 'Critical' && student.riskLevel !== 'High') {
    return ['Teruskan pemantauan dan rekodkan perkembangan seterusnya'];
  }
  return [];
}

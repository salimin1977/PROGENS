import type { AttendanceRecord, Intervention, Student } from '../types';

export interface CommandSignal { title: string; detail: string; severity: 'CRITICAL' | 'WATCH' | 'GOOD'; }
export interface CommandHQ { signals: CommandSignal[]; priorities: string[]; loop: string[]; }

export function buildCommandHQ(students: Student[], interventions: Intervention[], attendance: AttendanceRecord[]): CommandHQ {
  const critical = students.filter((s) => s.riskLevel === 'Critical').length;
  const high = students.filter((s) => s.riskLevel === 'High').length;
  const absent10 = new Set(attendance.filter((a) => a.absentDays >= 10).map((a) => a.studentId)).size;
  const activeInterventions = interventions.filter((i) => i.status !== 'Completed').length;
  const signals: CommandSignal[] = [
    { title: 'Critical students', detail: `${critical} student(s) currently classified Critical.`, severity: critical > 0 ? 'CRITICAL' : 'GOOD' },
    { title: 'High-risk students', detail: `${high} student(s) currently classified High.`, severity: high > 0 ? 'WATCH' : 'GOOD' },
    { title: 'Intervention queue', detail: `${activeInterventions} active intervention case(s) require follow-up.`, severity: activeInterventions > 0 ? 'WATCH' : 'GOOD' },
    { title: 'Attendance signal', detail: `${absent10} student(s) have verified aggregate absent days of 10 or more.`, severity: absent10 > 0 ? 'WATCH' : 'GOOD' },
  ];
  const priorities = [critical > 0 ? 'Resolve Critical risk cases first.' : 'No Critical risk case detected in the current provider view.', high > 0 ? 'Review High-risk students and assign a next action.' : 'No High-risk case detected in the current provider view.', activeInterventions > 0 ? 'Close the intervention loop: action → outcome → next review.' : 'Maintain monitoring and document outcomes.'];
  return { signals, priorities, loop: ['DATA', 'SIGNAL', 'DECISION', 'INTERVENTION', 'FOLLOW-UP', 'OUTCOME'] };
}

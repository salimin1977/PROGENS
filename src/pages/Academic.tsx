import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import ChartCard from '../components/ui/ChartCard';
import DataTable, { type Column } from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { getResults } from '../services/academicService';
import { getStudents } from '../services/studentService';
import type { AcademicResult, ClassPerformance, GradeDistributionEntry, Student, SubjectPerformance, GpsTrendEntry } from '../types';

const GRADE_COLORS: Record<string, string> = { 'A+': '#166b66', A: '#22a89b', B: '#3fc0b4', C: '#d6931f', D: '#e6ad33', E: '#fb7185', G: '#e11d48' };
const GRADE_ORDER = ['A+', 'A', 'B', 'C', 'D', 'E', 'G'];
const GPS_TREND: GpsTrendEntry[] = [
  { year: '2023', gps: 5.62, target: 5.2 },
  { year: '2024', gps: 5.38, target: 5.0 },
  { year: '2025', gps: 5.11, target: 4.9 },
  { year: '2026', gps: 5.11, target: 4.84 },
];

const average = (values: number[]) => values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;

export default function Academic() {
  const [results, setResults] = useState<AcademicResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getResults(), getStudents()])
      .then(([academicResults, studentRows]) => { setResults(academicResults); setStudents(studentRows); })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unable to load academic data.'))
      .finally(() => setLoading(false));
  }, []);

  const subjectPerformance = useMemo<SubjectPerformance[]>(() => {
    const subjects = Array.from(new Set(results.map((r) => r.subject)));
    return subjects.map((subject) => {
      const rows = results.filter((r) => r.subject === subject && r.maximumMarks > 0);
      const scores = rows.map((r) => (r.marks / r.maximumMarks) * 100);
      const passCount = scores.filter((score) => score >= 40).length;
      return { subject, average: average(scores), target: subject.includes('Additional Mathematics') || subject === 'Mathematics' ? 75 : 70, passRate: scores.length ? Math.round((passCount / scores.length) * 1000) / 10 : 0 };
    });
  }, [results]);

  const gradeDistribution = useMemo<GradeDistributionEntry[]>(() => GRADE_ORDER.map((grade) => ({ grade, count: results.filter((r) => r.grade === grade).length })), [results]);

  const classPerformance = useMemo<ClassPerformance[]>(() => {
    const classes = Array.from(new Set(students.map((s) => s.className).filter(Boolean)));
    return classes.map((className) => {
      const classStudents = students.filter((s) => s.className === className);
      const ids = new Set(classStudents.map((s) => s.id));
      const rows = results.filter((r) => ids.has(r.studentId) && r.maximumMarks > 0);
      const scores = rows.map((r) => (r.marks / r.maximumMarks) * 100);
      return { className, form: classStudents[0]?.form ?? 'Tingkatan 5', average: average(scores), passRate: scores.length ? Math.round((scores.filter((s) => s >= 40).length / scores.length) * 1000) / 10 : 0, studentsAtRisk: classStudents.filter((s) => s.riskLevel === 'Critical' || s.riskLevel === 'High').length };
    });
  }, [results, students]);

  const gradeA = gradeDistribution.filter((g) => g.grade === 'A+' || g.grade === 'A').reduce((sum, g) => sum + g.count, 0);

  const columns: Column<ClassPerformance>[] = [
    { header: 'Class', accessor: (c) => c.className },
    { header: 'Form', accessor: (c) => c.form.replace('Tingkatan ', 'T') },
    { header: 'Average Score', accessor: (c) => <span className="font-semibold">{c.average}</span> },
    { header: 'Pass Rate', accessor: (c) => `${c.passRate}%` },
    { header: 'Students At Risk', accessor: (c) => c.studentsAtRisk > 3 ? <StatusBadge status="High" /> : c.studentsAtRisk > 0 ? <StatusBadge status="Moderate" /> : <StatusBadge status="Low" /> },
  ];

  if (loading) return <div className="card p-6 text-sm text-slate-500">Loading live academic data...</div>;
  if (error) return <div className="card border border-red-200 p-6 text-sm text-red-700">Academic data error: {error}</div>;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <GapMetric label="Results Loaded" current={String(results.length)} target="—" gap="Live" />
        <GapMetric label="Students Assessed" current={String(new Set(results.map((r) => r.studentId)).size)} target="—" gap="Live" />
        <GapMetric label="Subjects" current={String(subjectPerformance.length)} target="—" gap="Live" />
        <GapMetric label="Grade A & Above" current={String(gradeA)} target="—" gap="Live" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Subject Performance" description="Live average score vs. target by subject">
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={subjectPerformance} layout="vertical" margin={{ left: 24 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" domain={[0, 100]} /><YAxis type="category" dataKey="subject" width={140} /><Tooltip /><Legend /><Bar dataKey="average" name="Average" fill="#17877e" /><Bar dataKey="target" name="Target" fill="#e6ad33" /></BarChart></ResponsiveContainer></div>
        </ChartCard>
        <ChartCard title="Grade Distribution" description="Live grade counts across loaded academic results">
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={gradeDistribution} dataKey="count" nameKey="grade" innerRadius={50} outerRadius={90} label={(entry) => entry.grade}>{gradeDistribution.map((g) => <Cell key={g.grade} fill={GRADE_COLORS[g.grade]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Class Comparison" description="Live average academic score by class">
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={classPerformance}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="className" angle={-30} textAnchor="end" height={60} /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="average" fill="#223e63" /></BarChart></ResponsiveContainer></div>
        </ChartCard>
        <ChartCard title="Performance Trend" description="GPS trajectory 2023-2026; historical target series retained">
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={GPS_TREND}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis domain={[4.5, 6]} reversed /><Tooltip /><Legend /><Line type="monotone" dataKey="gps" name="GPS" stroke="#166b66" strokeWidth={2.5} /><Line type="monotone" dataKey="target" name="Target" stroke="#d6931f" strokeDasharray="5 5" /></LineChart></ResponsiveContainer></div>
        </ChartCard>
      </section>

      <section className="card p-4"><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Class Performance Detail</h3><DataTable columns={columns} rows={classPerformance} keyFn={(c) => c.className} /></section>
    </div>
  );
}

function GapMetric({ label, current, target, gap }: { label: string; current: string; target: string; gap: string }) {
  return <div className="card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><div className="mt-2 flex items-baseline justify-between"><span className="text-xl font-extrabold text-navy-950">{current}</span><span className="text-xs text-slate-400">Target {target}</span></div><p className="mt-1 text-[11px] font-semibold text-gold-700">{gap}</p></div>;
}

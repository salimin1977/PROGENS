import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import ChartCard from '../components/ui/ChartCard';
import DataTable, { type Column } from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import AsyncSection from '../components/ui/AsyncSection';
import { useAsync } from '../hooks/useAsync';
import { getAcademicOverview } from '../services/academicService';
import type { ClassPerformance } from '../types';

const GRADE_COLORS: Record<string, string> = {
  'A+': '#166b66', A: '#22a89b', 'A-': '#3fc0b4', 'B+': '#5fd4c9', B: '#8fe3da', 'C+': '#e6ad33', C: '#d6931f', D: '#fb7185', E: '#e11d48', G: '#9f1239',
};

export default function Academic() {
  const state = useAsync(getAcademicOverview, []);

  const columns: Column<ClassPerformance>[] = [
    { header: 'Class', accessor: (c) => c.className },
    { header: 'Form', accessor: (c) => c.form.replace('Tingkatan ', 'T') },
    { header: 'Average Score', accessor: (c) => <span className="font-semibold">{c.average}</span> },
    { header: 'Pass Rate', accessor: (c) => `${c.passRate}%` },
    { header: 'Students At Risk', accessor: (c) => (c.studentsAtRisk > 3 ? <StatusBadge status="HIGH" /> : c.studentsAtRisk > 0 ? <StatusBadge status="MEDIUM" /> : <StatusBadge status="LOW" />) },
  ];

  return (
    <AsyncSection state={state} loadingLabel="Loading academic intelligence…">
      {(academic) => (
        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <GapMetric label="GPS" current={academic.gpsCurrent.toFixed(2)} target={academic.gpsTarget.toFixed(2)} gap={(academic.gpsCurrent - academic.gpsTarget).toFixed(2)} />
            <GapMetric label="GPMP (Matematik)" current={academic.gpmpCurrent.toFixed(2)} target={academic.gpmpTarget.toFixed(2)} gap={(academic.gpmpCurrent - academic.gpmpTarget).toFixed(2)} />
            <GapMetric label="Pass Rate" current={`${academic.passRate}%`} target={`${academic.passRateTarget}%`} gap={`${(academic.passRateTarget - academic.passRate).toFixed(1)}%`} />
            <GapMetric label="Grade A & Above" current={`${academic.gradeDistribution.filter((g) => g.grade === 'A+' || g.grade === 'A').reduce((a, g) => a + g.count, 0)}`} target="—" gap="—" />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Subject Performance" description="Average score vs. target by subject">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={academic.subjectPerformance} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis type="category" dataKey="subject" width={140} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" name="Average" fill="#17877e" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="target" name="Target" fill="#e6ad33" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Grade Distribution" description="School-wide grade counts across all subjects">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={academic.gradeDistribution} dataKey="count" nameKey="grade" innerRadius={50} outerRadius={90} label={(entry) => entry.grade}>
                      {academic.gradeDistribution.map((g) => (
                        <Cell key={g.grade} fill={GRADE_COLORS[g.grade]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Class Comparison" description="Average academic score by class">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={academic.classPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="className" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-30} textAnchor="end" height={60} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="average" fill="#223e63" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Performance Trend" description="GPS trajectory (lower is better)">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={academic.gpsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis domain={[4.5, 6]} reversed tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="gps" name="GPS" stroke="#166b66" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="target" name="Target" stroke="#d6931f" strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </section>

          <section className="card p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Class Performance Detail</h3>
            <DataTable columns={columns} rows={academic.classPerformance} keyFn={(c) => c.className} />
          </section>
        </div>
      )}
    </AsyncSection>
  );
}

function GapMetric({ label, current, target, gap }: { label: string; current: string; target: string; gap: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-xl font-extrabold text-navy-950">{current}</span>
        <span className="text-xs text-slate-400">Target {target}</span>
      </div>
      <p className="mt-1 text-[11px] font-semibold text-gold-700">Gap: {gap}</p>
    </div>
  );
}

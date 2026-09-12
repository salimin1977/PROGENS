import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import ChartCard from '../components/ui/ChartCard';
import DataTable, { type Column } from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import AsyncSection from '../components/ui/AsyncSection';
import { useAsync } from '../hooks/useAsync';
import { getGrowOverview } from '../services/growService';
import type { Student } from '../types';

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export default function Grow() {
  const state = useAsync(getGrowOverview, []);

  return (
    <AsyncSection state={state} loadingLabel="Loading GROW overview…">
      {({ students, scores, classIndex, watchlist }) => {
        const academic = average(students.map((s) => s.academicScore));
        const attendance = average(students.map((s) => s.attendanceRate));
        const career = average(Array.from(scores.values()).map((s) => s.score));
        const leadership = students.length ? Math.round((students.filter((s) => s.talents.length > 0).length / students.length) * 100) : 0;
        const engagement = Math.round(academic * 0.4 + attendance * 0.4 + leadership * 0.2);

        const growthIndex = [
          { dimension: 'Academic', score: academic },
          { dimension: 'Career', score: career },
          { dimension: 'Leadership', score: leadership },
          { dimension: 'Attendance', score: attendance },
          { dimension: 'Engagement', score: engagement },
        ];

        const columns: Column<Student>[] = [
          { header: 'Student', accessor: (s) => s.name },
          { header: 'Class', accessor: (s) => s.className },
          { header: 'Academic', accessor: (s) => s.academicScore },
          { header: 'GROW Score', accessor: (s) => scores.get(s.id)?.score ?? '—' },
          { header: 'Attendance', accessor: (s) => `${s.attendanceRate}%` },
          { header: 'Risk', accessor: (s) => <StatusBadge status={s.riskLevel} /> },
        ];

        return (
          <div className="space-y-6">
            <div className="card flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold-50 text-gold-700">
                <TrendingUp size={22} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-navy-950">GROW — Growth & Readiness Optimization</h2>
                <p className="mt-1 text-sm text-slate-500">Focused on Tingkatan 4, tracking academic growth, career readiness and holistic development ahead of SPM.</p>
              </div>
            </div>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Growth Index" description="Composite readiness dimensions for Tingkatan 4">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={growthIndex}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#334155' }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar dataKey="score" stroke="#166b66" fill="#22a89b" fillOpacity={0.4} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Growth Dimensions by Class" description="Academic, Career and Attendance comparison">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classIndex}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="className" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="academic" name="Academic" fill="#17877e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="career" name="Career" fill="#d6931f" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="attendance" name="Attendance" fill="#223e63" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </section>

            <section className="card p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Growth Watchlist — Tingkatan 4</h3>
              <p className="mb-3 text-xs text-slate-500">Students requiring focused support before SPM streaming continues into Tingkatan 5.</p>
              <DataTable columns={columns} rows={watchlist} keyFn={(s) => s.id} emptyMessage="No students currently on the growth watchlist." />
            </section>
          </div>
        );
      }}
    </AsyncSection>
  );
}

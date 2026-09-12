import { FlaskConical, Sigma, Atom, ShieldAlert, Trophy } from 'lucide-react';
import KPICard from '../components/ui/KPICard';
import ChartCard from '../components/ui/ChartCard';
import Funnel from '../components/ui/Funnel';
import DataTable, { type Column } from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import AsyncSection from '../components/ui/AsyncSection';
import { useAsync } from '../hooks/useAsync';
import { getStemOverview } from '../services/stemService';
import type { StemCandidate } from '../types';

export default function Stem() {
  const state = useAsync(getStemOverview, []);

  const columns: Column<StemCandidate>[] = [
    { header: 'Student', accessor: (c) => c.studentName },
    { header: 'Class', accessor: (c) => c.className },
    { header: 'Mathematics', accessor: (c) => c.mathScore },
    { header: 'Science', accessor: (c) => c.scienceScore },
    { header: 'Category', accessor: (c) => <StatusBadge status={c.category} /> },
  ];

  return (
    <AsyncSection state={state} loadingLabel="Loading STEM A Pipeline…">
      {({ pipeline, candidates, kpis, form3ClassBreakdown }) => {
        const beraniInsight = form3ClassBreakdown.find((c) => c.allFailedMath);

        return (
          <div className="space-y-6">
            <div className="card flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <FlaskConical size={22} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-navy-950">STEM A Pipeline</h2>
                <p className="mt-1 text-sm text-slate-500">Identifying and developing Mathematics and Science talent into STEM excellence.</p>
              </div>
            </div>

            {beraniInsight && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <span className="font-bold">Critical observation:</span> every student in {beraniInsight.className} failed Mathematics — the class contributes 0 candidates to the STEM A Pipeline this cohort.
              </div>
            )}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard label="Total STEM Candidates" value={kpis.totalCandidates.toString()} icon={FlaskConical} tone="neutral" />
              <KPICard label="Mathematics Readiness" value={`${kpis.mathReadiness}%`} icon={Sigma} tone="positive" />
              <KPICard label="Science Readiness" value={`${kpis.scienceReadiness}%`} icon={Atom} tone="positive" />
              <KPICard label="STEM Elite" value={kpis.stemElite.toString()} icon={Trophy} tone="positive" />
            </section>

            <ChartCard title="STEM Pipeline" description="Progression from identification to STEM A certification">
              <Funnel stages={pipeline.map((s) => ({ label: s.stage, count: s.count }))} />
            </ChartCard>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <CategoryCard title="STEM Elite" count={kpis.stemElite} description="Excelling in both Mathematics and Science — fast-tracked for enrichment." tone="positive" icon={Trophy} />
              <CategoryCard title="STEM Boost" count={candidates.filter((c) => c.category === 'STEM Boost').length} description="Solid potential requiring structured booster support." tone="warning" icon={FlaskConical} />
              <CategoryCard title="STEM Rescue" count={kpis.stemRisk} description="Failed Mathematics or Science — needs urgent rescue intervention, excluded from the pipeline pool." tone="critical" icon={ShieldAlert} />
            </section>

            <section>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Tingkatan 3 — STEM A Pipeline 2027 Cohort</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {form3ClassBreakdown.map((c) => (
                  <div key={c.className} className="card p-4 text-center">
                    <p className="text-2xl font-extrabold text-navy-950">{c.eligibleCount}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{c.className}</p>
                    {c.allFailedMath && <p className="mt-1 text-[11px] font-semibold text-rose-600">All failed Mathematics</p>}
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">STEM Candidate Register</h3>
              <DataTable columns={columns} rows={candidates} keyFn={(c) => c.studentId} />
            </section>
          </div>
        );
      }}
    </AsyncSection>
  );
}

function CategoryCard({ title, count, description, tone, icon: Icon }: { title: string; count: number; description: string; tone: 'positive' | 'warning' | 'critical'; icon: typeof Trophy }) {
  const toneStyles = {
    positive: 'bg-teal-50 text-teal-700 ring-teal-100',
    warning: 'bg-gold-50 text-gold-700 ring-gold-100',
    critical: 'bg-rose-50 text-rose-700 ring-rose-100',
  }[tone];
  return (
    <div className={`card p-5 ring-1 ${toneStyles}`}>
      <div className="flex items-center justify-between">
        <Icon size={20} />
        <span className="text-2xl font-extrabold">{count}</span>
      </div>
      <p className="mt-2 text-sm font-bold text-navy-950">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

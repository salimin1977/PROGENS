import { Wheat, ArrowDown, Award, AlertTriangle } from 'lucide-react';
import KPICard from '../components/ui/KPICard';
import ChartCard from '../components/ui/ChartCard';
import StudentCard from '../components/ui/StudentCard';
import AsyncSection from '../components/ui/AsyncSection';
import { useAsync } from '../hooks/useAsync';
import { getReapOverview } from '../services/reapService';

export default function Reap() {
  const state = useAsync(getReapOverview, []);

  return (
    <AsyncSection state={state} loadingLabel="Loading REAP overview…">
      {({ kpis, eliteStudents, atRiskStudents, priorities }) => (
        <div className="space-y-6">
          <div className="card flex items-start gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-300">
              <Wheat size={22} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-navy-950">REAP — Results Excellence & Achievement Programme</h2>
              <p className="mt-1 text-sm text-slate-500">Focused on Tingkatan 5, driving SPM outcomes toward the GPS {kpis.gpsTarget.toFixed(2)} target.</p>
            </div>
          </div>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">SPM Performance Command</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <KPICard label="GPS Current" value={kpis.gpsCurrent.toFixed(2)} icon={ArrowDown} tone="warning" />
              <KPICard label="GPS Target" value={kpis.gpsTarget.toFixed(2)} icon={ArrowDown} tone="positive" />
              <KPICard label="Pass Rate" value={`${kpis.passRate}%`} icon={Award} tone="positive" />
              <KPICard label="A+ Students" value={kpis.aPlusStudents.toString()} icon={Award} tone="positive" />
              <KPICard label="At-Risk Students" value={kpis.atRiskStudents.toString()} icon={AlertTriangle} tone="critical" />
            </div>
          </section>

          <ChartCard title="Road to Target" description="Strategic pathway from current performance to school target">
            <div className="flex flex-col items-center gap-3 py-4 sm:flex-row sm:justify-center sm:gap-6">
              <RoadStep label="Current GPS" value={kpis.gpsCurrent.toFixed(2)} tone="warning" />
              <ArrowConnector />
              <RoadStep label="Intervention" value="REAP + SEEDS/GROW Continuum" tone="neutral" wide />
              <ArrowConnector />
              <RoadStep label="Target GPS" value={kpis.gpsTarget.toFixed(2)} tone="positive" />
            </div>
          </ChartCard>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Elite Students</h3>
              <div className="space-y-2">
                {eliteStudents.map((s) => (
                  <StudentCard key={s.id} student={s} />
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">High-Risk Students &amp; Intervention Priority</h3>
              {atRiskStudents.length === 0 ? (
                <p className="text-sm text-slate-500">No high-risk students identified in Tingkatan 5.</p>
              ) : (
                <div className="space-y-2">
                  {atRiskStudents.slice(0, 6).map((s) => {
                    const priority = priorities.get(s.id);
                    return (
                      <div key={s.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-navy-950">{s.name}</p>
                          <span className="text-xs text-slate-400">{s.className}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Priority {priority?.priority ?? '—'} &middot; SPM readiness {priority?.spm_readiness ?? '—'}/100
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </AsyncSection>
  );
}

function RoadStep({ label, value, tone, wide }: { label: string; value: string; tone: 'warning' | 'positive' | 'neutral'; wide?: boolean }) {
  const toneStyles = {
    warning: 'bg-gold-50 text-gold-800 ring-gold-200',
    positive: 'bg-teal-50 text-teal-800 ring-teal-200',
    neutral: 'bg-slate-50 text-navy-800 ring-slate-200',
  }[tone];
  return (
    <div className={`rounded-xl px-5 py-4 text-center ring-1 ${toneStyles} ${wide ? 'sm:min-w-[220px]' : 'sm:min-w-[140px]'}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-extrabold">{value}</p>
    </div>
  );
}

function ArrowConnector() {
  return <div className="text-2xl font-bold text-slate-300 sm:rotate-[-90deg]">&darr;</div>;
}

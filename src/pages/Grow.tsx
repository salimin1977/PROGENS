import { TrendingUp } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { usePhase5 } from '../hooks/usePhase5';

export default function Grow() {
  const { data, loading, error } = usePhase5();
  if (loading) return <p className="text-sm text-slate-500">Loading GROW from live data...</p>;
  if (error || !data) return <p className="text-sm text-rose-600">Unable to load GROW: {error ?? 'No data.'}</p>;
  const rows = data.students.filter((r) => r.grow).sort((a, b) => (a.grow?.gap.length ?? 0) - (b.grow?.gap.length ?? 0));
  const watch = rows.filter((r) => r.student.riskLevel === 'Critical' || r.student.riskLevel === 'High');
  const assessed = rows.filter((r) => (r.grow?.strength.length ?? 0) > 0).length;

  return <div className="space-y-6">
    <div className="card flex items-start gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-50 text-gold-700"><TrendingUp size={22} /></div><div><h2 className="text-base font-extrabold text-navy-950">GROW — Growth & Readiness Optimization</h2><p className="mt-1 text-sm text-slate-500">Live Tingkatan 4 growth layer. Strengths and gaps come only from available academic results; no career or attendance percentage is invented.</p></div></div>
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4"><Metric label="T4 Students" value={data.grow.total} /><Metric label="Assessed" value={assessed} /><Metric label="Average Index" value={data.grow.average ? data.grow.average.toFixed(1) : '—'} /><Metric label="Watchlist" value={data.grow.watchlist} /></section>
    <div className="card p-5"><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">GROW Student Map</h3><div className="space-y-3">{rows.map((r) => <div key={r.student.id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold">{r.student.name}</p><p className="text-xs text-slate-500">{r.student.className} · Academic {r.student.academicScore}</p></div><StatusBadge status={r.student.riskLevel} /></div><div className="mt-3 grid gap-3 md:grid-cols-3"><div><p className="text-[11px] font-semibold uppercase text-slate-400">Strength</p><p className="text-xs text-slate-600">{r.grow?.strength.join(' · ') || '—'}</p></div><div><p className="text-[11px] font-semibold uppercase text-slate-400">Gap</p><p className="text-xs text-slate-600">{r.grow?.gap.join(' · ') || 'No gap below 65% in latest evidence'}</p></div><div><p className="text-[11px] font-semibold uppercase text-slate-400">Next action</p><p className="text-xs text-slate-600">{r.grow?.action}</p></div></div></div>)}</div>{rows.length === 0 && <p className="text-sm text-slate-500">No Tingkatan 4 records available.</p>}</div>
    <div className="card p-5"><h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-navy-900">Growth Watchlist</h3><p className="text-xs text-slate-500">{watch.length} students are currently Critical/High based on the configured risk profile.</p></div>
  </div>;
}
function Metric({ label, value }: { label: string; value: number | string }) { return <div className="card p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-navy-950">{value}</p></div>; }

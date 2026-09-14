import { Sprout } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import StudentCard from '../components/ui/StudentCard';
import { usePhase5 } from '../hooks/usePhase5';

const levels = [
  ['ELITE', 'Elite'], ['HIGH_POTENTIAL', 'High Potential'], ['PROMISING', 'Promising'], ['DEVELOPING', 'Developing'], ['FOUNDATION', 'Foundation'],
] as const;

export default function Seeds() {
  const { data, loading, error } = usePhase5();
  if (loading) return <p className="text-sm text-slate-500">Loading SEEDS from live data...</p>;
  if (error || !data) return <p className="text-sm text-rose-600">Unable to load SEEDS: {error ?? 'No data.'}</p>;
  const rows = data.students.filter((r) => r.seeds).sort((a, b) => (b.seeds?.score ?? 0) - (a.seeds?.score ?? 0));
  const top = rows.filter((r) => r.seeds?.level === 'ELITE' || r.seeds?.level === 'HIGH_POTENTIAL').slice(0, 10);
  const count = (level: string) => rows.filter((r) => r.seeds?.level === level).length;

  return <div className="space-y-6">
    <div className="card flex items-start gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><Sprout size={22} /></div><div><h2 className="text-base font-extrabold text-navy-950">SEEDS — Student Early Excellence & Development System</h2><p className="mt-1 text-sm text-slate-500">Live developmental screening for Tingkatan 1–3. Academic evidence is primary; absence is used only as a documented signal.</p></div></div>
    <section className="grid grid-cols-2 gap-3 md:grid-cols-5">{levels.map(([key, label]) => <div key={key} className="card p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-navy-950">{count(key)}</p></div>)}</section>
    <div className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-bold uppercase tracking-wide text-navy-900">SEEDS Funnel</h3><p className="text-xs text-slate-500">Current distribution from live student and latest-result evidence.</p></div><span className="text-xs font-semibold text-slate-500">{data.seeds.total} students</span></div><div className="space-y-2">{levels.map(([key, label]) => <div key={key} className="flex items-center gap-3"><div className="w-32 text-xs font-medium">{label}</div><div className="h-3 flex-1 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-teal-600" style={{ width: `${data.seeds.total ? (count(key) / data.seeds.total) * 100 : 0}%` }} /></div><span className="w-8 text-right text-xs font-bold">{count(key)}</span></div>)}</div></div>
    <div className="card p-5"><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-900">Priority Development</h3>{top.length ? <div className="space-y-2">{top.map((r) => <div key={r.student.id} className="rounded-lg border border-slate-200 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold">{r.student.name}</p><p className="text-xs text-slate-500">{r.student.className} · Score {r.seeds?.score}</p></div><StatusBadge status={r.seeds?.level ?? 'Unassessed'} /></div><p className="mt-2 text-xs text-slate-500">{r.seeds?.nextAction}</p></div>)}</div> : <p className="text-sm text-slate-500">No higher-potential students identified from current evidence.</p>}</div>
    <div className="grid gap-3 md:grid-cols-2">{rows.slice(0, 6).map((r) => <StudentCard key={r.student.id} student={r.student} />)}</div>
  </div>;
}

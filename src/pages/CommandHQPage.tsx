import { useEffect, useState } from 'react';
import { getConfiguredProvider } from '../providers';
import { buildCommandHQ, type CommandHQ } from '../analytics/commandHqEngine';

export default function CommandHQPage() {
  const [model, setModel] = useState<CommandHQ>();
  const [error, setError] = useState('');
  useEffect(() => {
    const provider = getConfiguredProvider();
    Promise.all([provider.getStudents(), provider.getInterventions(), provider.getAttendance()])
      .then(([students, interventions, attendance]) => setModel(buildCommandHQ(students, interventions, attendance)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Unable to load Command HQ.'));
  }, []);
  if (error) return <main className="p-8 text-red-700">{error}</main>;
  if (!model) return <main className="p-8 text-slate-500">Loading Command HQ…</main>;
  return <main className="space-y-6 p-6 lg:p-8">
    <header><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Phase 10</p><h1 className="text-3xl font-black text-navy-950">PROGENS Command HQ</h1><p className="mt-2 text-sm text-slate-500">Data → Signal → Decision → Intervention → Follow-up → Outcome</p></header>
    <section className="grid gap-4 md:grid-cols-2">{model.signals.map((s) => <article key={s.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between"><h2 className="font-bold text-navy-950">{s.title}</h2><span className="text-xs font-black">{s.severity}</span></div><p className="mt-2 text-sm text-slate-500">{s.detail}</p></article>)}</section>
    <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-black">Priority Queue</h2>{model.priorities.map((p, i) => <p key={p} className="mt-3 text-sm"><b>P{i + 1}</b> — {p}</p>)}</section>
    <section className="rounded-xl bg-navy-950 p-5 text-white"><h2 className="font-black">Operational Loop</h2><div className="mt-4 flex flex-wrap gap-2">{model.loop.map((step) => <span key={step} className="rounded-full border border-white/20 px-3 py-2 text-xs font-bold">{step}</span>)}</div></section>
  </main>;
}

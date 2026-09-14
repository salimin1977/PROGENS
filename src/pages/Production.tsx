import { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { buildProductionReadiness, productionReadinessStatus } from '../analytics/productionReadinessEngine';

export default function Production() {
  const checks = useMemo(() => buildProductionReadiness(), []);
  const status = productionReadinessStatus(checks);
  const Icon = status === 'PASS' ? CheckCircle2 : status === 'WARN' ? AlertTriangle : XCircle;
  return <main className="space-y-6 p-6 lg:p-8">
    <header><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Phase 9</p><h1 className="mt-1 text-3xl font-black text-navy-950">Production Readiness</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">Final gate for live PROGENS operation: configuration, data semantics, assessment integrity and deployment boundary.</p></header>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Icon className={status === 'PASS' ? 'text-emerald-600' : status === 'WARN' ? 'text-amber-500' : 'text-red-600'} size={26}/><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall gate</p><p className="text-xl font-black text-navy-950">{status}</p></div></div></section>
    <section className="grid gap-3 md:grid-cols-2">{checks.map((check) => <article key={check.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold text-navy-950">{check.label}</h2><p className="mt-1 text-sm text-slate-500">{check.detail}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-black ${check.status === 'PASS' ? 'bg-emerald-50 text-emerald-700' : check.status === 'WARN' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{check.status}</span></div></article>)}</section>
    <section className="rounded-2xl bg-navy-950 p-5 text-white"><div className="flex items-center gap-3"><ShieldCheck size={22} className="text-teal-400"/><h2 className="font-bold">Release rule</h2></div><p className="mt-2 text-sm leading-6 text-slate-300">Do not promote to the public production environment until CI build and lint pass and the live Supabase environment is configured.</p></section>
  </main>;
}

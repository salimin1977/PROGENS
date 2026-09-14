import { useEffect, useState } from 'react';
import { Database, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ChartCard from '../components/ui/ChartCard';
import KPICard from '../components/ui/KPICard';
import { getConfiguredProvider } from '../providers';
import { buildDataQualitySummary, type QualitySummary } from '../analytics/dataQualityEngine';

const provider = () => getConfiguredProvider();

export default function DataHealth() {
  const [summary, setSummary] = useState<QualitySummary>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    Promise.all([provider().getStudents(), provider().getAcademicResults(), provider().getAttendance(), provider().getInterventions()])
      .then(([students, results, attendance, interventions]) => active && setSummary(buildDataQualitySummary(students, results, attendance, interventions)))
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : 'Gagal menjalankan data health check.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);
  if (loading) return <div className="p-6 text-sm text-slate-500">Menjalankan data health check…</div>;
  if (error || !summary) return <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error ?? 'Tiada data.'}</div>;
  return <div className="space-y-6">
    <section className="card flex items-start gap-4 p-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-teal-300"><Database size={22}/></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Fasa 8 • Production Readiness</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Data Health & Governance</h2><p className="mt-1 text-sm text-slate-500">Semakan automatik sebelum data digunakan untuk keputusan sekolah.</p></div></section>
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3"><KPICard label="Quality Score" value={`${summary.score}%`} icon={ShieldCheck} tone={summary.score >= 90 ? 'positive' : summary.score >= 75 ? 'warning' : 'critical'} helperText={`${summary.checks.filter((c) => c.status === 'PASS').length}/${summary.checks.length} checks pass`} /><KPICard label="Ready" value={summary.ready ? 'YES' : 'NO'} icon={CheckCircle2} tone={summary.ready ? 'positive' : 'critical'} helperText="Tiada FAIL" /><KPICard label="Warnings" value={String(summary.checks.filter((c) => c.status === 'WARN').length)} icon={AlertTriangle} tone="warning" helperText="Perlu semakan" /></section>
    <ChartCard title="Quality Checks" description="PASS = selamat digunakan; WARN = perlu semakan; FAIL = jangan gunakan sebagai asas keputusan"><div className="space-y-3">{summary.checks.map((check) => <div key={check.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3"><div className={`mt-0.5 rounded-full p-1.5 ${check.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' : check.status === 'WARN' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{check.status === 'PASS' ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-navy-950">{check.label}</p><span className="text-xs font-extrabold">{check.status} • {check.count}</span></div><p className="mt-1 text-xs text-slate-500">{check.detail}</p></div></div>)}</div></ChartCard>
    <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600"><strong className="text-navy-950">Governance rule:</strong> Data health mengesahkan struktur dan linkage sahaja. Ia tidak mengesahkan bahawa sesuatu keputusan pedagogi adalah benar; keputusan masih perlu disemak oleh guru/pemimpin berdasarkan konteks sebenar.</section>
  </div>;
}

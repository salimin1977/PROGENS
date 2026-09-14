import { useEffect, useState } from 'react';
import { BrainCircuit, ShieldAlert, Target, CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChartCard from '../components/ui/ChartCard';
import KPICard from '../components/ui/KPICard';
import ProgressBar from '../components/ui/ProgressBar';
import { getConfiguredProvider } from '../providers';
import { buildIntelligenceSummary, type IntelligenceSummary } from '../analytics/intelligenceEngine';

const provider = () => getConfiguredProvider();

export default function Intelligence() {
  const [summary, setSummary] = useState<IntelligenceSummary>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    Promise.all([provider().getStudents(), provider().getAcademicResults(), provider().getAttendance(), provider().getInterventions()])
      .then(([students, results, attendance, interventions]) => { if (active) setSummary(buildIntelligenceSummary(students, results, attendance, interventions)); })
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : 'Gagal memuatkan intelligence.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);
  if (loading) return <div className="p-6 text-sm text-slate-500">Membina school intelligence…</div>;
  if (error || !summary) return <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error ?? 'Tiada data intelligence.'}</div>;
  return <div className="space-y-6">
    <section className="card flex items-start gap-4 p-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-teal-300"><BrainCircuit size={22}/></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Fasa 7 • School Intelligence</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Signal → Insight → Decision</h2><p className="mt-1 text-sm text-slate-500">Lapisan analitik berasaskan keputusan terkini, risiko, kehadiran agregat dan intervensi.</p></div></section>
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><KPICard label="Data Coverage" value={`${summary.coverage}%`} icon={Target} tone={summary.coverage === 100 ? 'positive' : 'warning'} helperText={`${summary.assessedStudents}/${summary.totalStudents} murid dinilai`} /><KPICard label="Latest Academic" value={summary.average === null ? '—' : `${summary.average}%`} icon={BrainCircuit} tone="neutral" helperText="Purata murid, keputusan terkini" /><KPICard label="Critical + High" value={String(summary.criticalHigh)} icon={ShieldAlert} tone="critical" helperText="Risk profile semasa" /><KPICard label="Attendance ≥10" value={summary.signals[2]?.value ?? '0'} icon={CalendarDays} tone="warning" helperText="Hari tidak hadir" /></section>
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2"><ChartCard title="Command Signals" description="Signal yang patut masuk ke agenda tindakan"><div className="space-y-3">{summary.signals.map((signal) => <div key={signal.label} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center justify-between gap-3"><span className="text-sm font-bold text-navy-950">{signal.label}</span><span className={`rounded-full px-2 py-1 text-xs font-extrabold ${signal.severity === 'critical' ? 'bg-rose-100 text-rose-700' : signal.severity === 'warning' ? 'bg-amber-100 text-amber-700' : signal.severity === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{signal.value}</span></div><p className="mt-1 text-xs text-slate-500">{signal.detail}</p></div>)}</div></ChartCard><ChartCard title="Form Performance" description="Purata keputusan terkini mengikut tingkatan"><div className="space-y-4">{summary.formPerformance.map((item) => <div key={item.form}><div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{item.form}</span><span className="font-bold">{item.average}%</span></div><ProgressBar value={item.average} tone={item.average >= 75 ? 'teal' : item.average >= 65 ? 'gold' : 'rose'} /><p className="mt-1 text-[11px] text-slate-400">{item.students} murid dengan data terkini</p></div>)}</div></ChartCard></section>
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2"><ChartCard title="Top 5 Academic Bottlenecks" description="Subjek terendah berdasarkan keputusan terkini"><div className="space-y-3">{summary.subjectBottlenecks.map((item, index) => <div key={item.subject} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><span className="w-5 text-center text-xs font-extrabold text-slate-400">{index + 1}</span><div className="min-w-0 flex-1"><p className="font-bold text-navy-950">{item.subject}</p><p className="text-xs text-slate-500">{item.students} rekod murid-subjek</p></div><span className="font-extrabold">{item.average}%</span></div>)}{!summary.subjectBottlenecks.length && <p className="text-sm text-slate-500">Tiada bottleneck.</p>}</div></ChartCard><ChartCard title="Decision Protocol" description="Gunakan intelligence tanpa overclaim"><ol className="space-y-3 text-sm text-slate-700"><li><strong>1.</strong> Semak coverage sebelum keputusan.</li><li><strong>2.</strong> Pilih satu bottleneck utama.</li><li><strong>3.</strong> Drill down ke murid melalui Student 360.</li><li><strong>4.</strong> Tetapkan intervensi dan owner.</li><li><strong>5.</strong> Ukur semula pada assessment seterusnya.</li></ol><Link to="/students" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-700">Buka Student 360 <ArrowRight size={14}/></Link></ChartCard></section>
  </div>;
}

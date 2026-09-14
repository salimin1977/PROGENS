import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Database, LockKeyhole, Rocket, ShieldCheck, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChartCard from '../components/ui/ChartCard';
import DataSourceBadge, { type DataSourceState } from '../components/system/DataSourceBadge';
import FreshnessBadge from '../components/system/FreshnessBadge';
import { checkSupabaseConnection, getConfiguredDataSourceState, getConfiguredProvider } from '../providers';
import { buildProductionReadiness, type ProductionReadinessResult, type ProductionCheck } from '../analytics/productionReadinessEngine';

function statusIcon(status: ProductionCheck['status']) { if (status === 'PASS') return <CheckCircle2 size={16} />; if (status === 'WARN') return <AlertTriangle size={16} />; return <XCircle size={16} />; }
function statusClass(status: ProductionCheck['status']) { if (status === 'PASS') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'; if (status === 'WARN') return 'bg-amber-50 text-amber-700 ring-amber-200'; return 'bg-rose-50 text-rose-700 ring-rose-200'; }
function gateClass(gate: ProductionReadinessResult['gate']) { if (gate === 'READY') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'; if (gate === 'READY WITH WARNINGS') return 'bg-amber-50 text-amber-700 ring-amber-200'; return 'bg-rose-50 text-rose-700 ring-rose-200'; }

export default function Production() {
  const [result, setResult] = useState<ProductionReadinessResult>();
  const [source, setSource] = useState<DataSourceState>(getConfiguredDataSourceState());
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const provider = getConfiguredProvider();
    const initialSource = getConfiguredDataSourceState();
    Promise.all([checkSupabaseConnection(), provider.getStudents(), provider.getAcademicResults(), provider.getAttendance(), provider.getInterventions()]).then(([connection, students, results, attendance, interventions]) => {
      if (!active) return;
      setSource(connection === 'ERROR' ? 'ERROR' : initialSource);
      setResult(buildProductionReadiness({ students, results, attendance, interventions, environment: { configured: initialSource === 'LIVE', productionBuild: import.meta.env.PROD }, provider: connection === 'LIVE' ? 'LIVE' : connection === 'ERROR' ? 'ERROR' : initialSource, database: connection === 'LIVE' ? 'CONNECTED' : connection === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'ERROR' }));
    }).catch(() => {
      if (!active) return;
      setError('Supabase connection failed. Check environment configuration.');
      setSource(initialSource === 'LIVE' ? 'ERROR' : initialSource);
      setResult(buildProductionReadiness({ students: [], results: [], attendance: [], interventions: [], environment: { configured: initialSource === 'LIVE', productionBuild: import.meta.env.PROD }, provider: initialSource === 'LIVE' ? 'ERROR' : 'MOCK', database: initialSource === 'LIVE' ? 'ERROR' : 'NOT_CONFIGURED' }));
    });
    return () => { active = false; };
  }, []);
  if (!result) return <div className="p-6 text-sm text-slate-500">Menjalankan production readiness checks…</div>;
  const groups = [
    ['SYSTEM', ['ENVIRONMENT', 'DATABASE', 'PROVIDER', 'BUILD']],
    ['DATA', ['DATA', 'ASSESSMENT', 'ATTENDANCE', 'INTERVENTION']],
    ['GOVERNANCE', ['PRIVACY', 'SECURITY']],
    ['RELEASE', ['RELEASE']],
  ] as const;
  const latestDate = result.latestAssessment.date;
  const freshness = latestDate ? 'UPDATED' : 'DATE UNAVAILABLE';
  return <div className="space-y-6">
    <section className="card flex flex-wrap items-start justify-between gap-4 p-5"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-teal-300"><Rocket size={22}/></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Fasa 9 • Production Readiness</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">PROGENS Production Readiness</h2><p className="mt-1 max-w-2xl text-sm text-slate-500">Trust → System Health → Privacy → Freshness → Error Safety → Release Control.</p></div></div><DataSourceBadge state={source} /></section>
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className={`rounded-xl p-5 ring-1 ${gateClass(result.gate)}`}><p className="text-xs font-extrabold uppercase tracking-widest opacity-70">Overall Status</p><p className="mt-2 text-2xl font-black">{result.gate}</p><p className="mt-1 text-xs">{result.criticalFailures} critical failure • {result.warnings} warning</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Database size={18} className="text-teal-700"/><p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Data Source</p></div><div className="mt-3"><DataSourceBadge state={source} compact /></div></div><div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-teal-700"/><p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Privacy</p></div><p className="mt-3 text-lg font-black text-navy-950">{result.checks.find((check) => check.id === 'identity-policy')?.status ?? 'UNKNOWN'}</p><p className="text-xs text-slate-500">No prohibited identity fields.</p></div></section>
    {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
    <ChartCard title="Production Checks" description="Setiap check mempunyai status, severity dan tindakan pembetulan yang jelas."><div className="space-y-6">{groups.map(([group, categories]) => <section key={group}><div className="mb-3 flex items-center gap-2"><LockKeyhole size={15} className="text-teal-700"/><h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">{group}</h3></div><div className="space-y-2">{result.checks.filter((check) => categories.some((category) => category === check.category)).map((check) => <div key={check.id} className="rounded-xl border border-slate-200 p-3"><div className="flex flex-wrap items-start gap-3"><span className={`mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${statusClass(check.status)}`}>{statusIcon(check.status)} {check.status}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-navy-950">{check.label}</p><span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{check.severity}</span></div><p className="mt-1 text-xs text-slate-500">{check.detail}</p>{check.status !== 'PASS' && <p className="mt-2 text-xs font-semibold text-slate-700">Action: {check.recommendation}</p>}</div></div></div>)}</div></section>)}</div></ChartCard>
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3"><ChartCard title="Assessment Freshness" description="Menggunakan assessment identity dan tarikh sebenar; tiada tarikh direka."><div className="space-y-3"><FreshnessBadge state={freshness} date={latestDate} /><p className="text-sm font-bold text-navy-950">{result.latestAssessment.name}</p><p className="text-xs text-slate-500">Type: {result.latestAssessment.type} • Coverage: {result.latestAssessment.coverage}%</p></div></ChartCard><ChartCard title="Attendance" description="Absence days tidak ditukar kepada attendance % tanpa denominator yang disahkan."><p className="text-2xl font-black text-navy-950">{result.latestAttendanceDate ?? 'Date unavailable'}</p><p className="mt-1 text-xs text-slate-500">Tarikh kemas kini sumber kehadiran, jika tersedia.</p></ChartCard><ChartCard title="Intervention" description="Semakan linkage dan rekod intervensi semasa."><p className="text-2xl font-black text-navy-950">{result.latestInterventionDate ?? 'Date unavailable'}</p><p className="mt-1 text-xs text-slate-500">Tarikh intervensi terkini, jika tersedia.</p></ChartCard></section>
    <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600"><strong className="text-navy-950">Release decision:</strong> {result.gate === 'READY' ? 'Tiada production blocker dikesan.' : result.gate === 'READY WITH WARNINGS' ? 'Tiada critical blocker, tetapi amaran perlu diselesaikan atau diterima secara sedar.' : 'PROGENS belum selamat untuk release kerana terdapat critical production blocker.'} <Link to="/data-health" className="ml-1 font-bold text-teal-700">Buka Data Health →</Link></section>
  </div>;
}

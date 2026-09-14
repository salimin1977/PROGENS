import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import DataSourceBadge, { type DataSourceState } from './DataSourceBadge';
import { buildDataQualitySummary } from '../../analytics/dataQualityEngine';
import { checkSupabaseConnection, getConfiguredDataSourceState, getConfiguredProvider } from '../../providers';

export default function ProductionStatusCard() {
  const [source, setSource] = useState<DataSourceState>(getConfiguredDataSourceState());
  const [quality, setQuality] = useState<'PASS' | 'WARN' | 'FAIL' | '—'>('—');
  const [warnings, setWarnings] = useState(0);

  useEffect(() => {
    let active = true;
    const provider = getConfiguredProvider();
    Promise.all([checkSupabaseConnection(), provider.getStudents(), provider.getAcademicResults(), provider.getAttendance(), provider.getInterventions()])
      .then(([connection, students, results, attendance, interventions]) => {
        if (!active) return;
        setSource(connection === 'LIVE' ? 'LIVE' : connection === 'ERROR' ? 'ERROR' : getConfiguredDataSourceState());
        const summary = buildDataQualitySummary(students, results, attendance, interventions);
        setQuality(summary.ready ? (summary.checks.some((check) => check.status === 'WARN') ? 'WARN' : 'PASS') : 'FAIL');
        setWarnings(summary.checks.filter((check) => check.status === 'WARN').length);
      })
      .catch(() => active && setSource(getConfiguredDataSourceState() === 'LIVE' ? 'ERROR' : 'MOCK'));
    return () => { active = false; };
  }, []);

  return <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-teal-700"/><p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Production Status</p></div><p className="mt-1 text-lg font-black text-navy-950">{source === 'LIVE' && quality === 'PASS' ? 'READY' : source === 'LIVE' && quality === 'WARN' ? 'READY WITH WARNINGS' : 'NOT READY'}</p><p className="text-xs text-slate-500">Data Health: {quality} • Warnings: {warnings}</p></div><div className="flex items-center gap-3"><DataSourceBadge state={source} compact /><Link to="/production" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-teal-700 hover:bg-slate-200">View Production Readiness <ArrowRight size={14}/></Link></div></div></section>;
}

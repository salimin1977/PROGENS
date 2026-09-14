import { Database, FlaskConical, PlugZap, XCircle } from 'lucide-react';

export type DataSourceState = 'LIVE' | 'MOCK' | 'ERROR' | 'NOT_CONFIGURED';

const config: Record<DataSourceState, { label: string; detail: string; className: string; icon: typeof Database }> = {
  LIVE: { label: 'LIVE — SUPABASE', detail: 'Live school data source', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: Database },
  MOCK: { label: 'MOCK FALLBACK', detail: 'Not production data', className: 'bg-amber-50 text-amber-700 ring-amber-200', icon: FlaskConical },
  ERROR: { label: 'CONNECTION ERROR', detail: 'Live source unavailable', className: 'bg-rose-50 text-rose-700 ring-rose-200', icon: XCircle },
  NOT_CONFIGURED: { label: 'NOT CONFIGURED', detail: 'Supabase environment missing', className: 'bg-slate-100 text-slate-600 ring-slate-200', icon: PlugZap },
};

export default function DataSourceBadge({ state, compact = false }: { state: DataSourceState; compact?: boolean }) {
  const item = config[state];
  const Icon = item.icon;
  return <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold ring-1 ${item.className}`} title={item.detail}>
    <Icon size={14} />
    <span>{item.label}</span>
    {!compact && <span className="hidden font-medium opacity-75 sm:inline">• {item.detail}</span>}
  </div>;
}

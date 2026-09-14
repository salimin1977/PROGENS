import { CheckCircle2, Clock3, HelpCircle, Radio, TimerReset } from 'lucide-react';

export type FreshnessState = 'LIVE' | 'UPDATED' | 'DATE UNAVAILABLE' | 'STALE' | 'UNKNOWN';

const meta: Record<FreshnessState, { icon: typeof CheckCircle2; className: string }> = {
  LIVE: { icon: Radio, className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  UPDATED: { icon: CheckCircle2, className: 'bg-teal-50 text-teal-700 ring-teal-200' },
  'DATE UNAVAILABLE': { icon: HelpCircle, className: 'bg-slate-100 text-slate-600 ring-slate-200' },
  STALE: { icon: TimerReset, className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  UNKNOWN: { icon: Clock3, className: 'bg-slate-100 text-slate-600 ring-slate-200' },
};

export default function FreshnessBadge({ state, date }: { state: FreshnessState; date?: string | null }) {
  const { icon: Icon, className } = meta[state];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${className}`}>
    <Icon size={13} /> {state}{date ? ` • ${date}` : ''}
  </span>;
}

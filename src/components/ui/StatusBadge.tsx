type Status = string;

const STATUS_STYLES: Record<string, string> = {
  // Risk levels
  CRITICAL: 'bg-rose-50 text-rose-700 ring-rose-200',
  HIGH: 'bg-rose-50 text-rose-700 ring-rose-200',
  MEDIUM: 'bg-gold-50 text-gold-700 ring-gold-200',
  LOW: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  // Intervention status
  PLANNED: 'bg-slate-100 text-slate-600 ring-slate-200',
  ACTIVE: 'bg-teal-50 text-teal-700 ring-teal-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-600 ring-slate-200',
  // Student progress status
  'On Watch': 'bg-gold-50 text-gold-700 ring-gold-200',
  'Excellence Track': 'bg-slate-100 text-navy-800 ring-slate-300',
  // GROW status
  'ON TRACK': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'NEEDS SUPPORT': 'bg-gold-50 text-gold-700 ring-gold-200',
  'AT RISK': 'bg-rose-50 text-rose-700 ring-rose-200',
  // REAP priority
  P1: 'bg-rose-50 text-rose-700 ring-rose-200',
  P2: 'bg-gold-50 text-gold-700 ring-gold-200',
  P3: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  // SEEDS status
  FOUNDATION: 'bg-slate-100 text-slate-600 ring-slate-200',
  DEVELOPING: 'bg-gold-50 text-gold-700 ring-gold-200',
  PROMISING: 'bg-teal-50 text-teal-700 ring-teal-200',
  'HIGH POTENTIAL': 'bg-teal-100 text-teal-800 ring-teal-300',
  ELITE: 'bg-navy-900 text-gold-300 ring-navy-800',
  // STEM pipeline status
  BOOST: 'bg-teal-50 text-teal-700 ring-teal-200',
  RESCUE: 'bg-rose-50 text-rose-700 ring-rose-200',
  MONITOR: 'bg-gold-50 text-gold-700 ring-gold-200',
  // Misc
  'STEM Track': 'bg-navy-900 text-teal-300 ring-navy-800',
};

function fallbackStyle(status: string): string {
  const key = status.toLowerCase();
  if (key.includes('risk') || key.includes('critical') || key.includes('rescue')) return STATUS_STYLES.CRITICAL;
  if (key.includes('warn') || key.includes('watch') || key.includes('moderate') || key.includes('support')) return STATUS_STYLES.MEDIUM;
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? fallbackStyle(status);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style} ${className}`}>
      {status}
    </span>
  );
}

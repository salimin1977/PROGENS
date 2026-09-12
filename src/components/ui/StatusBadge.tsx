type Status = string;

const STATUS_STYLES: Record<string, string> = {
  Critical: 'bg-rose-50 text-rose-700 ring-rose-200',
  High: 'bg-rose-50 text-rose-700 ring-rose-200',
  Active: 'bg-teal-50 text-teal-700 ring-teal-200',
  Moderate: 'bg-gold-50 text-gold-700 ring-gold-200',
  Monitoring: 'bg-gold-50 text-gold-700 ring-gold-200',
  Low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'On Watch': 'bg-gold-50 text-gold-700 ring-gold-200',
  'Excellence Track': 'bg-slate-100 text-navy-800 ring-slate-300',
  'Not Started': 'bg-slate-100 text-slate-600 ring-slate-200',
};

function fallbackStyle(status: string): string {
  const key = status.toLowerCase();
  if (key.includes('risk') || key.includes('critical')) return STATUS_STYLES.Critical;
  if (key.includes('warn') || key.includes('watch') || key.includes('moderate')) return STATUS_STYLES.Moderate;
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

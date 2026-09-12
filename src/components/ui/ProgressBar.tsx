interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: 'teal' | 'gold' | 'rose' | 'navy';
  showLabel?: boolean;
  className?: string;
}

const TONE_BAR: Record<string, string> = {
  teal: 'bg-teal-500',
  gold: 'bg-gold-500',
  rose: 'bg-rose-500',
  navy: 'bg-navy-700',
};

export default function ProgressBar({ value, max = 100, tone = 'teal', showLabel = false, className = '' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={className}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${TONE_BAR[tone]} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <p className="mt-1 text-xs font-medium text-slate-500">{Math.round(pct)}%</p>}
    </div>
  );
}

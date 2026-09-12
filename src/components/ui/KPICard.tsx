import type { ComponentType } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export type Tone = 'positive' | 'warning' | 'critical' | 'neutral';

const TONE_STYLES: Record<Tone, { icon: string; ring: string; badge: string }> = {
  positive: { icon: 'text-teal-600 bg-teal-50', ring: 'ring-teal-100', badge: 'text-teal-700 bg-teal-50' },
  warning: { icon: 'text-gold-600 bg-gold-50', ring: 'ring-gold-100', badge: 'text-gold-700 bg-gold-50' },
  critical: { icon: 'text-rose-600 bg-rose-50', ring: 'ring-rose-100', badge: 'text-rose-700 bg-rose-50' },
  neutral: { icon: 'text-navy-700 bg-slate-100', ring: 'ring-slate-100', badge: 'text-navy-700 bg-slate-100' },
};

interface KPICardProps {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  tone?: Tone;
  trend?: { direction: 'up' | 'down' | 'flat'; text: string };
  helperText?: string;
}

export default function KPICard({ label, value, icon: Icon, tone = 'neutral', trend, helperText }: KPICardProps) {
  const styles = TONE_STYLES[tone];
  const TrendIcon = trend?.direction === 'up' ? ArrowUpRight : trend?.direction === 'down' ? ArrowDownRight : Minus;

  return (
    <div className={`card p-5 ring-1 ${styles.ring}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-navy-950">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles.icon}`}>
          <Icon size={20} />
        </div>
      </div>
      {(trend || helperText) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${styles.badge}`}>
              <TrendIcon size={12} />
              {trend.text}
            </span>
          )}
          {helperText && <span className="text-slate-400">{helperText}</span>}
        </div>
      )}
    </div>
  );
}

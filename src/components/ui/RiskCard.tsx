interface RiskCardProps {
  label: string;
  count: number;
  tone: 'critical' | 'high' | 'moderate' | 'low';
}

const TONE_STYLES: Record<RiskCardProps['tone'], string> = {
  critical: 'border-rose-200 bg-rose-50 text-rose-700',
  high: 'border-rose-100 bg-rose-50/60 text-rose-600',
  moderate: 'border-gold-200 bg-gold-50 text-gold-700',
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export default function RiskCard({ label, count, tone }: RiskCardProps) {
  return (
    <div className={`rounded-xl border p-4 text-center ${TONE_STYLES[tone]}`}>
      <p className="text-2xl font-extrabold">{count}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide">{label}</p>
    </div>
  );
}

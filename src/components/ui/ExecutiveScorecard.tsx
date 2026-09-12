import type { KpiTarget } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const TRAFFIC_LIGHT_STYLE: Record<KpiTarget['trafficLight'], { label: string; tone: string; icon: typeof CheckCircle2 }> = {
  GREEN: { label: 'On Target', tone: 'text-teal-700 bg-teal-50', icon: CheckCircle2 },
  AMBER: { label: 'Near Target', tone: 'text-gold-700 bg-gold-50', icon: AlertTriangle },
  RED: { label: 'Improvement Required', tone: 'text-rose-700 bg-rose-50', icon: XCircle },
};

function formatValue(value: number, unit: KpiTarget['unit']): string {
  if (unit === '%') return `${value}%`;
  if (unit === 'gps') return value.toFixed(2);
  return `${value}`;
}

export default function ExecutiveScorecard({ items }: { items: KpiTarget[] }) {
  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category}>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{category}</h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items
              .filter((i) => i.category === category)
              .map((item) => {
                const status = TRAFFIC_LIGHT_STYLE[item.trafficLight];
                const Icon = status.icon;
                const gap = Math.abs(item.current - item.target);
                return (
                  <div key={item.id} className="card p-4">
                    <p className="text-xs font-medium text-slate-500">{item.label}</p>
                    <div className="mt-2 flex items-end justify-between">
                      <div>
                        <p className="text-lg font-extrabold text-navy-950">{formatValue(item.current, item.unit)}</p>
                        <p className="text-[11px] text-slate-400">Target {formatValue(item.target, item.unit)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${status.tone}`}>
                        <Icon size={12} /> {status.label}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Gap: {formatValue(gap, item.unit)}</p>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

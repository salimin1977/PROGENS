import type { AiInsight } from '../../types';
import { Sparkles } from 'lucide-react';

const SEVERITY_STYLES: Record<AiInsight['severity'], string> = {
  critical: 'border-l-rose-500',
  warning: 'border-l-gold-500',
  info: 'border-l-teal-500',
};

export default function InsightCard({ insight }: { insight: AiInsight }) {
  return (
    <div className={`card border-l-4 p-4 ${SEVERITY_STYLES[insight.severity]}`}>
      <div className="flex items-start gap-2">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-teal-600" />
        <p className="text-sm font-bold text-navy-950">{insight.headline}</p>
      </div>
      <dl className="mt-3 space-y-2 text-xs">
        <div>
          <dt className="font-semibold uppercase tracking-wide text-slate-400">What?</dt>
          <dd className="text-navy-800">{insight.what}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide text-slate-400">Why?</dt>
          <dd className="text-navy-800">{insight.why}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide text-slate-400">Who?</dt>
          <dd className="text-navy-800">{insight.who}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide text-teal-700">Action</dt>
          <dd className="font-medium text-navy-900">{insight.action}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide text-rose-500">If nothing is done?</dt>
          <dd className="text-navy-800">{insight.whatIfNothing}</dd>
        </div>
      </dl>
    </div>
  );
}

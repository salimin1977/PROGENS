import { CalendarDays, User } from 'lucide-react';
import type { Intervention } from '../../types';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';

export default function InterventionCard({ intervention }: { intervention: Intervention }) {
  const tone = intervention.status === 'Completed' ? 'teal' : intervention.status === 'Critical' ? 'rose' : 'gold';
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-navy-950">{intervention.studentName}</p>
          <p className="text-xs text-slate-500">{intervention.className}</p>
        </div>
        <StatusBadge status={intervention.status} />
      </div>

      <p className="mt-3 text-sm text-navy-800">{intervention.problem}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal-700">{intervention.interventionType}</p>

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <User size={13} /> {intervention.teacher}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays size={13} /> {intervention.startDate}
        </span>
      </div>

      <div className="mt-3">
        <ProgressBar value={intervention.progress} tone={tone} showLabel />
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-navy-700">
        <span className="font-semibold text-navy-900">Next action: </span>
        {intervention.nextAction}
      </div>
    </div>
  );
}

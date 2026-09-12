import { Link } from 'react-router-dom';
import type { Student } from '../../types';
import StatusBadge from './StatusBadge';

export default function StudentCard({ student }: { student: Student }) {
  return (
    <Link
      to={`/students/${student.id}`}
      className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-elevated"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-teal-300">
        {student.photoInitials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-navy-950">{student.name}</p>
        <p className="text-xs text-slate-500">{student.className}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-bold text-navy-900">{student.academicScore}</span>
        <StatusBadge status={student.riskLevel} />
      </div>
    </Link>
  );
}

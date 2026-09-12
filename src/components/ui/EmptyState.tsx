import type { ComponentType } from 'react';

interface EmptyStateProps {
  icon: ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <Icon size={28} className="text-slate-300" />
      <p className="mt-3 text-sm font-semibold text-navy-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
    </div>
  );
}

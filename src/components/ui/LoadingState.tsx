import { Loader2 } from 'lucide-react';

export default function LoadingState({ label = 'Loading data…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
      <Loader2 size={24} className="animate-spin text-teal-600" />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
    </div>
  );
}

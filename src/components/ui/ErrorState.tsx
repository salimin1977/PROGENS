import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
}

// User-facing only — the raw technical error is never rendered here; it's
// caller's responsibility to log it if needed (e.g. console.error upstream).
export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 py-16 text-center">
      <AlertTriangle size={24} className="text-rose-500" />
      <p className="mt-3 text-sm font-semibold text-rose-700">Unable to load this data right now</p>
      <p className="mt-1 max-w-sm text-xs text-rose-600">{message ?? 'Please try again shortly. If the problem persists, contact the system administrator.'}</p>
    </div>
  );
}

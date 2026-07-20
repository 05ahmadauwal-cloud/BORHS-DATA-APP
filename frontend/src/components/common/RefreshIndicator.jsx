import { Check, RefreshCw } from 'lucide-react';

export default function RefreshIndicator({ isRefreshing, progress }) {
  if (!isRefreshing && progress <= 0.08) return null;
  const ready = progress >= 1;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] flex justify-center" role="status" aria-live="polite">
      <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-semibold text-[var(--ds-text)] shadow-[var(--ds-shadow-float)] ring-1 ring-[var(--ds-stroke)]">
        {isRefreshing ? <RefreshCw size={15} className="animate-spin text-brand-700" /> : ready ? <Check size={15} className="text-green-600" /> : <RefreshCw size={15} className="text-brand-700" style={{ transform: `rotate(${progress * 180}deg)` }} />}
        {isRefreshing ? 'Refreshing…' : ready ? 'Release to refresh' : 'Pull to refresh'}
      </div>
    </div>
  );
}

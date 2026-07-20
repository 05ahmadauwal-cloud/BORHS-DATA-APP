import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import clsx from 'clsx';

const config = {
  info: [Info, 'bg-[var(--ds-info-soft)] text-brand-800 dark:text-brand-300'],
  success: [CheckCircle2, 'bg-[var(--ds-success-soft)] text-green-800 dark:text-green-300'],
  warning: [AlertTriangle, 'bg-[var(--ds-reward-soft)] text-amber-800 dark:text-amber-300'],
  danger: [AlertCircle, 'bg-[var(--ds-danger-soft)] text-red-800 dark:text-red-300'],
};

export default function Alert({ tone = 'info', title, children, onDismiss, className }) {
  const [Icon, toneClass] = config[tone];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={clsx('flex gap-3 rounded-[var(--ds-radius-control)] p-4', toneClass, className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/60 dark:bg-black/10"><Icon size={18} /></span>
      <div className="min-w-0 flex-1">{title && <p className="text-sm font-bold">{title}</p>}<div className={clsx('text-sm leading-relaxed opacity-90', title && 'mt-0.5')}>{children}</div></div>
      {onDismiss && <button type="button" onClick={onDismiss} className="h-9 w-9 rounded-xl p-2" aria-label="Dismiss"><X size={17} /></button>}
    </div>
  );
}

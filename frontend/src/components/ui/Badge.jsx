import clsx from 'clsx';

const tones = {
  neutral: 'bg-[var(--ds-surface-subtle)] text-[var(--ds-text-secondary)]',
  brand: 'bg-[var(--ds-info-soft)] text-brand-700',
  success: 'bg-[var(--ds-success-soft)] text-green-700 dark:text-green-400',
  reward: 'bg-[var(--ds-reward-soft)] text-amber-700 dark:text-amber-400',
  danger: 'bg-[var(--ds-danger-soft)] text-red-700 dark:text-red-400',
};

export default function Badge({ tone = 'neutral', dot = false, className, children }) {
  return <span className={clsx('inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold', tones[tone], className)}>{dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{children}</span>;
}

import { forwardRef } from 'react';
import clsx from 'clsx';

const IconButton = forwardRef(function IconButton({ icon: Icon, label, variant = 'secondary', className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition duration-[var(--ds-duration-fast)]',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-700/20 active:scale-95 disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary'
          ? 'bg-brand-700 text-white hover:bg-brand-800'
          : 'bg-[var(--ds-surface-subtle)] text-[var(--ds-text)] hover:text-brand-700',
        className,
      )}
      {...props}
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
});

export default IconButton;

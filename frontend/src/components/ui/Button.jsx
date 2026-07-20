import { forwardRef } from 'react';
import clsx from 'clsx';

const variants = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-700/20',
  secondary: 'bg-surface text-[var(--ds-text)] ring-1 ring-inset ring-[var(--ds-stroke)] hover:bg-[var(--ds-surface-subtle)] focus-visible:ring-brand-700/20',
  danger: 'bg-[var(--ds-danger)] text-white hover:brightness-95 focus-visible:ring-red-500/20',
  text: 'bg-transparent text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/20 focus-visible:ring-brand-700/20',
};

const sizes = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-12 px-5 text-sm',
  lg: 'min-h-14 px-6 text-base',
};

const Button = forwardRef(function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  children,
  disabled,
  type,
  ...props
}, ref) {
  return (
    <Component
      ref={ref}
      type={Component === 'button' ? (type || 'button') : type}
      disabled={Component === 'button' ? disabled || loading : undefined}
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-[var(--ds-radius-control)] font-semibold transition duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
        'focus:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        variants[variant], sizes[size], className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
      ) : Icon && iconPosition === 'left' ? <Icon size={18} aria-hidden="true" /> : null}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' ? <Icon size={18} aria-hidden="true" /> : null}
    </Component>
  );
});

export default Button;

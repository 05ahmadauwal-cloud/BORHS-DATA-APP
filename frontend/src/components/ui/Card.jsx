import clsx from 'clsx';

export default function Card({ as: Component = 'section', padding = 'md', interactive = false, className, children, ...props }) {
  const paddingClasses = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' };
  return (
    <Component
      className={clsx(
        'rounded-[var(--ds-radius-card)] bg-surface text-[var(--ds-text)] shadow-[var(--ds-shadow-card)]',
        interactive && 'transition duration-[var(--ds-duration-fast)] hover:-translate-y-0.5 hover:shadow-[var(--ds-shadow-float)]',
        paddingClasses[padding], className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ eyebrow, title, description, action, className }) {
  return (
    <header className={clsx('mb-5 flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-700">{eyebrow}</p>}
        <h2 className="text-lg font-bold leading-tight text-[var(--ds-text)]">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{description}</p>}
      </div>
      {action}
    </header>
  );
}

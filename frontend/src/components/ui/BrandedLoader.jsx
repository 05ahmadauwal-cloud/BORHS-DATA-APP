import clsx from 'clsx';

export default function BrandedLoader({
  overlay = false,
  title = 'Loading BORHS Data',
  message = 'Getting everything ready for you',
  icon: Icon,
  iconColor = 'var(--ds-brand-700)',
}) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center px-6 text-center',
        overlay ? 'fixed inset-0 z-[9990] bg-slate-950/45 backdrop-blur-sm' : 'min-h-screen bg-canvas'
      )}
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <div className={clsx(
        'flex w-full max-w-xs flex-col items-center',
        overlay && 'rounded-[2rem] bg-surface px-7 py-8 shadow-[var(--ds-shadow-float)] ring-1 ring-[var(--ds-stroke)]'
      )}>
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-white p-2.5 shadow-[var(--ds-shadow-card)] ring-1 ring-[var(--ds-stroke)]">
            <img src="/logo-mark.png" alt="" className="h-full w-full object-contain" />
          </div>
          {Icon && (
            <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-surface shadow-md ring-1 ring-[var(--ds-stroke)]" style={{ color: iconColor }}>
              <Icon size={15} strokeWidth={2.25} />
            </span>
          )}
        </div>
        <h2 className="mt-5 text-base font-bold text-[var(--ds-text)]">{title}</h2>
        <p className="mt-1.5 text-xs leading-5 text-[var(--ds-text-secondary)]">{message}</p>
        <div className="mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-[var(--ds-surface-subtle)]" aria-hidden="true">
          <span className="brand-loader-bar block h-full w-1/2 rounded-full bg-brand-700" />
        </div>
      </div>
    </div>
  );
}

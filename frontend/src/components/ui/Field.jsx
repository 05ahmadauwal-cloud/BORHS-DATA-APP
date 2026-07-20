import { forwardRef, useId } from 'react';
import clsx from 'clsx';

const fieldBase = 'min-h-12 w-full rounded-[var(--ds-radius-input)] bg-[var(--ds-surface-subtle)] px-4 text-base text-[var(--ds-text)] outline-none ring-1 ring-inset ring-transparent transition placeholder:text-[var(--ds-text-tertiary)] focus:bg-surface focus:ring-2 focus:ring-brand-700 disabled:cursor-not-allowed disabled:opacity-60';

function FieldFrame({ id, label, hint, error, required, children, className }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {label && <label htmlFor={id} className="block text-sm font-semibold text-[var(--ds-text)]">{label}{required && <span className="ml-1 text-[var(--ds-danger)]">*</span>}</label>}
      {children}
      {(error || hint) && <p id={`${id}-help`} className={clsx('text-xs leading-relaxed', error ? 'text-[var(--ds-danger)]' : 'text-[var(--ds-text-secondary)]')}>{error || hint}</p>}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, hint, error, required, className, inputClassName, id: suppliedId, leading: Leading, trailing, ...props }, ref) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        {Leading && <Leading size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ds-text-tertiary)]" aria-hidden="true" />}
        <input ref={ref} id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={(error || hint) ? `${id}-help` : undefined} className={clsx(fieldBase, Leading && 'pl-11', trailing && 'pr-12', error && '!ring-[var(--ds-danger)]', inputClassName)} {...props} />
        {trailing && <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
    </FieldFrame>
  );
});

export const Select = forwardRef(function Select({ label, hint, error, required, className, id: suppliedId, children, ...props }, ref) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select ref={ref} id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={(error || hint) ? `${id}-help` : undefined} className={clsx(fieldBase, 'appearance-none', error && '!ring-[var(--ds-danger)]')} {...props}>{children}</select>
    </FieldFrame>
  );
});

export const Textarea = forwardRef(function Textarea({ label, hint, error, required, className, id: suppliedId, ...props }, ref) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea ref={ref} id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={(error || hint) ? `${id}-help` : undefined} className={clsx(fieldBase, 'min-h-28 resize-y py-3', error && '!ring-[var(--ds-danger)]')} {...props} />
    </FieldFrame>
  );
});

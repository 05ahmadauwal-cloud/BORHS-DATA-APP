import { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import IconButton from './IconButton';

export default function Modal({ open, onClose, title, description, children, footer, size = 'md', className }) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event) => event.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', handleKey); };
  }, [open, onClose]);
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--ds-overlay)] p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}><section role="dialog" aria-modal="true" aria-labelledby="ds-modal-title" className={clsx('max-h-[92dvh] w-full overflow-hidden rounded-t-[var(--ds-radius-sheet)] bg-surface shadow-[var(--ds-shadow-float)] sm:rounded-[var(--ds-radius-sheet)]', widths[size], className)}><header className="flex items-start gap-4 border-b border-[var(--ds-stroke)] px-5 py-5 sm:px-6"><div className="min-w-0 flex-1"><h2 id="ds-modal-title" className="text-lg font-bold text-[var(--ds-text)]">{title}</h2>{description && <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{description}</p>}</div><IconButton icon={X} label="Close" onClick={onClose} /></header><div className="max-h-[calc(92dvh-10rem)] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>{footer && <footer className="border-t border-[var(--ds-stroke)] px-5 py-4 sm:px-6">{footer}</footer>}</section></div>;
}

import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function ServiceHeader({ icon: Icon, title, description, step, totalSteps = 2, className }) {
  const navigate = useNavigate();
  return (
    <header className={clsx('space-y-5', className)}>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-[var(--ds-text-secondary)] shadow-[var(--ds-shadow-card)] transition hover:text-brand-700"><ChevronLeft size={20} /></button>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-info-soft)] text-brand-700"><Icon size={22} /></span>
        <div className="min-w-0"><h1 className="text-xl font-bold text-[var(--ds-text)] sm:text-2xl">{title}</h1><p className="mt-0.5 text-sm text-[var(--ds-text-secondary)]">{description}</p></div>
      </div>
      {step && <div className="flex items-center gap-2" aria-label={`Step ${step} of ${totalSteps}`}>{Array.from({ length: totalSteps }, (_, index) => <span key={index} className={clsx('h-1.5 flex-1 rounded-full transition-colors', index < step ? 'bg-brand-700' : 'bg-[var(--ds-stroke)]')} />)}</div>}
    </header>
  );
}

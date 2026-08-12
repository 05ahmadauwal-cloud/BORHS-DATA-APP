import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';

export default function PurchaseConfirmation({ title, subtitle, amount, icon, details = [], children, onBack, onConfirm, confirmLabel, loading }) {
  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-[2rem] border border-[var(--ds-stroke)] bg-[var(--ds-surface)] shadow-[var(--ds-shadow-card)]">
      <div className="relative overflow-hidden bg-brand-700 px-5 pb-7 pt-5 text-white sm:px-7 sm:pt-7">
        <div className="absolute -right-14 -top-20 h-48 w-48 rounded-full bg-white/10" />
        <button type="button" onClick={onBack} className="relative inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-3 text-xs font-bold transition hover:bg-white/20"><ArrowLeft size={16} /> Back</button>
        <div className="relative mt-7 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-800 shadow-lg">{icon}</span>
          <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-100">Review purchase</p><h2 className="mt-1 text-xl font-bold">{title}</h2>{subtitle && <p className="mt-1 truncate text-sm text-teal-100">{subtitle}</p>}</div>
        </div>
        <div className="relative mt-7 border-t border-white/15 pt-5"><p className="text-xs font-medium text-teal-100">Total to pay</p><p className="mt-1 text-3xl font-black tabular-nums tracking-tight">{amount}</p></div>
      </div>
      <div className="space-y-6 p-5 sm:p-7">
        <div className="overflow-hidden rounded-2xl border border-[var(--ds-stroke)] bg-[var(--ds-surface-subtle)]">
          {details.map(({ label, value }) => <div key={label} className="flex min-h-12 items-center justify-between gap-4 border-b border-[var(--ds-stroke)] px-4 py-3 last:border-0"><span className="text-xs font-medium text-[var(--ds-text-secondary)]">{label}</span><span className="min-w-0 text-right text-sm font-bold text-[var(--ds-text)]">{value}</span></div>)}
        </div>
        {children}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]"><div className="flex gap-3"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400" /><div><p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Secure payment</p><p className="mt-0.5 text-[11px] leading-5 text-emerald-800/80 dark:text-emerald-300/80">Check the recipient carefully. Completed purchases may not be reversible.</p></div></div></div>
        <button type="button" onClick={onConfirm} disabled={loading} className="btn-primary btn-lg w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <LockKeyhole size={18} />}{loading ? 'Processing securely…' : confirmLabel}</button>
      </div>
    </div>
  );
}

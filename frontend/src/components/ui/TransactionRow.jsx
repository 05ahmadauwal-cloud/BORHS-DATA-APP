import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Badge from './Badge';
const statusTone = { success: 'success', successful: 'success', pending: 'reward', failed: 'danger', reversed: 'brand' };
export default function TransactionRow({ title, subtitle, amount, type = 'debit', status, date, icon: CustomIcon, onClick }) {
  const Icon = CustomIcon || (type === 'credit' ? ArrowDownLeft : ArrowUpRight);
  const content = <><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${type === 'credit' ? 'bg-[var(--ds-success-soft)] text-green-700 dark:text-green-400' : 'bg-[var(--ds-info-soft)] text-brand-700'}`}><Icon size={19} /></span><span className="min-w-0 flex-1 text-left"><span className="block truncate text-sm font-semibold text-[var(--ds-text)]">{title}</span><span className="mt-0.5 block truncate text-xs text-[var(--ds-text-secondary)]">{subtitle || date}</span></span><span className="text-right"><span className={`block text-sm font-bold ${type === 'credit' ? 'text-green-700 dark:text-green-400' : 'text-[var(--ds-text)]'}`}>{type === 'credit' ? '+' : '-'}{amount}</span>{status && <Badge tone={statusTone[status.toLowerCase()] || 'neutral'} className="mt-1 capitalize">{status}</Badge>}</span></>;
  const classes = 'flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition duration-[var(--ds-duration-fast)] hover:bg-[var(--ds-surface-subtle)]';
  return onClick ? <button type="button" className={classes} onClick={onClick}>{content}</button> : <div className={classes}>{content}</div>;
}

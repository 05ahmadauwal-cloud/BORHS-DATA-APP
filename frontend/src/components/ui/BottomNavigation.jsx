import { Gift, Grid2X2, Home, ReceiptText, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
const items = [
  { to: '/dashboard', label: 'Home', icon: Home, paths: ['/dashboard'] },
  { to: '/data', label: 'Services', icon: Grid2X2, paths: ['/data', '/airtime', '/electricity', '/cable', '/education'] },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText, paths: ['/transactions'] },
  { to: '/referrals', label: 'Rewards', icon: Gift, paths: ['/referrals', '/agent', '/become-agent'] },
  { to: '/profile', label: 'Profile', icon: User, paths: ['/profile'] },
];
export default function BottomNavigation() { const { pathname } = useLocation(); return <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden" aria-label="Primary navigation"><div className="mx-auto flex h-[var(--ds-bottom-nav-height)] max-w-md items-center justify-around rounded-[1.75rem] bg-surface px-2 shadow-[var(--ds-shadow-float)] ring-1 ring-[var(--ds-stroke)]">{items.map(({ to, label, icon: Icon, paths }) => { const active = paths.some((path) => pathname === path || (path === '/agent' && pathname.startsWith('/agent/'))); return <Link key={to} to={to} aria-current={active ? 'page' : undefined} className={clsx('group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition duration-[var(--ds-duration-fast)]', active ? 'text-brand-700' : 'text-[var(--ds-text-tertiary)] hover:text-[var(--ds-text)]')}><span className={clsx('flex h-8 w-10 items-center justify-center rounded-xl transition', active && 'bg-[var(--ds-info-soft)]')}><Icon size={19} strokeWidth={active ? 2.5 : 1.8} /></span><span className="truncate">{label}</span></Link>; })}</div></nav>; }

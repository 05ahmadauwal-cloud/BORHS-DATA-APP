import { useQuery } from '@tanstack/react-query';
import { agentAPI, referralAPI } from '../../api';
import { Award, Copy, Gift, Link as LinkIcon, TrendingUp, Users, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Button, Card, CardHeader } from '../../components/ui';

const money = (value) => `₦${(Number(value) || 0).toLocaleString('en-NG')}`;

export default function AgentDashboard() {
  const { user } = useAuthStore();
  const { data: stats } = useQuery({ queryKey: ['agent-stats'], queryFn: () => agentAPI.getStats(), select: (res) => res.data });
  const { data: referralStats } = useQuery({ queryKey: ['referral-stats'], queryFn: () => referralAPI.getStats(), select: (res) => res.data });
  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;
  const downlines = Number(stats?.downlineCount) || 0;
  const earnings = Number(stats?.commissionEarned) || 0;
  const target = Math.max(10, Math.ceil((downlines + 1) / 10) * 10);
  const progress = Math.min(100, (downlines / target) * 100);
  const statCards = [
    { label: 'Available balance', value: money(stats?.walletBalance), icon: Wallet, tone: 'bg-[var(--ds-info-soft)] text-brand-700' },
    { label: 'Total commission', value: money(earnings), icon: TrendingUp, tone: 'bg-[var(--ds-success-soft)] text-green-700 dark:text-green-400' },
    { label: 'Referral earnings', value: money(stats?.referralEarnings), icon: Gift, tone: 'bg-[var(--ds-reward-soft)] text-amber-700 dark:text-amber-400' },
    { label: 'Customers', value: downlines.toLocaleString(), icon: Users, tone: 'bg-[var(--ds-info-soft)] text-brand-700' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-brand-700">Agent workspace</p><h1 className="mt-1 text-2xl font-bold text-[var(--ds-text)]">Grow your BORHS business</h1><p className="mt-1 text-sm text-[var(--ds-text-secondary)]">Track customers, commissions and your next milestone.</p></div><Button as={Link} to="/data" size="sm" icon={TrendingUp}>Make an agent purchase</Button></header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">{statCards.map(({ label, value, icon: Icon, tone }) => <Card key={label} padding="sm"><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}><Icon size={18} /></span><p className="mt-5 text-xl font-bold tabular-nums text-[var(--ds-text)] sm:text-2xl">{value}</p><p className="mt-1 text-xs text-[var(--ds-text-secondary)] sm:text-sm">{label}</p></Card>)}</div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader eyebrow="Acquisition" title="Your referral network" description="Share one link and earn as your network grows." action={<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ds-info-soft)] text-brand-700"><LinkIcon size={19} /></span>} />
          <div className="flex items-center gap-2 rounded-[var(--ds-radius-input)] bg-[var(--ds-surface-subtle)] p-2 pl-4"><p className="min-w-0 flex-1 truncate text-xs text-[var(--ds-text-secondary)] sm:text-sm">{referralLink}</p><Button variant="secondary" size="sm" icon={Copy} onClick={() => { navigator.clipboard.writeText(referralLink); toast.success('Referral link copied'); }}>Copy</Button></div>
          <div className="mt-5 grid grid-cols-3 gap-3">{[
            { level: 'Direct', count: referralStats?.counts?.level1 || 0, rate: '5%' },
            { level: 'Level 2', count: referralStats?.counts?.level2 || 0, rate: '2%' },
            { level: 'Level 3', count: referralStats?.counts?.level3 || 0, rate: '1%' },
          ].map((item) => <div key={item.level} className="rounded-2xl bg-[var(--ds-surface-subtle)] p-4 text-center"><p className="text-xl font-bold text-[var(--ds-text)]">{item.count}</p><p className="mt-1 text-xs text-[var(--ds-text-secondary)]">{item.level}</p><p className="mt-2 text-xs font-bold text-green-700 dark:text-green-400">{item.rate} reward</p></div>)}</div>
        </Card>

        <Card className="bg-brand-700 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Award size={22} /></span><p className="mt-6 text-sm text-teal-100">Next achievement</p><h2 className="mt-1 text-xl font-bold">{target} active customers</h2><p className="mt-2 text-sm leading-relaxed text-teal-100">You are {Math.max(0, target - downlines)} customers away from your next network milestone.</p><div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-right text-xs font-semibold text-teal-100">{Math.round(progress)}%</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2"><Link to="/agent/downlines" className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ds-info-soft)] text-brand-700"><Users size={19} /></span><div><p className="font-bold text-[var(--ds-text)]">Customer network</p><p className="text-sm text-[var(--ds-text-secondary)]">View every downline and level</p></div></Link><Link to="/agent/commissions" className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ds-success-soft)] text-green-700 dark:text-green-400"><TrendingUp size={19} /></span><div><p className="font-bold text-[var(--ds-text)]">Commission history</p><p className="text-sm text-[var(--ds-text-secondary)]">Review earnings and payouts</p></div></Link></div>
    </div>
  );
}

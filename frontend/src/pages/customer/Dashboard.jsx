import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, GraduationCap, Gift, Phone, Send, Tv, UserPlus, Wallet, Wifi, Zap } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { bannerAPI, couponAPI, walletAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import { Button, Card, EmptyState, Input, TransactionRow } from '../../components/ui';

const quickActions = [
  { to: '/data', icon: Wifi, label: 'Buy Data' },
  { to: '/airtime', icon: Phone, label: 'Airtime' },
  { to: '/electricity', icon: Zap, label: 'Electricity' },
  { to: '/cable', icon: Tv, label: 'Cable TV' },
  { to: '/education', icon: GraduationCap, label: 'Exam PIN' },
  { to: '/wallet', icon: Wallet, label: 'Fund Wallet' },
  { to: '/wallet', icon: Send, label: 'Transfer' },
  { to: '/become-agent', icon: UserPlus, label: 'Become Agent' },
];

const creditTypes = ['wallet_fund', 'commission_earned', 'referral_bonus', 'coupon'];

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [couponCode, setCouponCode] = useState('');
  const { data: balanceData } = useQuery({ queryKey: ['wallet-balance'], queryFn: walletAPI.getBalance, select: (response) => response.data, refetchInterval: 10000 });
  const { data: transactionsData } = useQuery({ queryKey: ['recent-transactions'], queryFn: () => walletAPI.getTransactions({ limit: 5 }), select: (response) => response.data });
  const { data: banner } = useQuery({ queryKey: ['banner'], queryFn: bannerAPI.get, select: (response) => response.data.data, refetchInterval: 60000, staleTime: 30000 });
  const couponMutation = useMutation({
    mutationFn: () => couponAPI.redeem(couponCode.trim().toUpperCase()),
    onSuccess: (response) => {
      toast.success(response.data?.message || 'Coupon redeemed successfully');
      setCouponCode('');
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Coupon redeem failed'),
  });

  const balance = Number(balanceData?.walletBalance ?? user?.walletBalance ?? 0) || 0;
  const transactions = transactionsData?.data || [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const stats = [
    { label: 'Cashback', value: Number(balanceData?.cashback || 0), tone: 'text-amber-300' },
    { label: 'Commission', value: Number(balanceData?.commission || 0), tone: 'text-emerald-200' },
    { label: "Today's spending", value: Number(balanceData?.todaySpending || 0), tone: 'text-white' },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-3">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-[var(--ds-text-secondary)]">{greeting},</p>
          <h1 className="truncate text-2xl font-bold text-[var(--ds-text)]">{user?.firstName || 'Welcome'} <span aria-hidden="true">👋</span></h1>
        </div>
        <Link to="/profile" aria-label="Open profile" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ds-info-soft)] font-bold text-brand-700">{user?.firstName?.[0]}{user?.lastName?.[0]}</Link>
      </header>

      <section className="relative overflow-hidden rounded-[2rem] bg-brand-700 p-6 text-white shadow-[0_20px_45px_rgba(15,118,110,0.22)] sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 right-24 h-44 w-44 rounded-full border-[28px] border-white/5" />
        <div className="relative">
          <p className="text-sm font-medium text-teal-100">Available balance</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
          <div className="mt-6 flex gap-3">
            <Button as={Link} to="/wallet" variant="secondary" size="sm" icon={ArrowDownLeft} className="border-0 bg-white text-brand-800 ring-0 hover:bg-teal-50">Fund wallet</Button>
            <Button as={Link} to="/wallet" variant="text" size="sm" icon={ArrowUpRight} className="bg-white/10 text-white hover:bg-white/15">Transfer</Button>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/15 pt-5">
            {stats.map((stat) => <div key={stat.label} className="min-w-0"><p className="truncate text-[10px] font-medium text-teal-100 sm:text-xs">{stat.label}</p><p className={`mt-1 truncate text-xs font-bold tabular-nums sm:text-sm ${stat.tone}`}>₦{stat.value.toLocaleString()}</p></div>)}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between"><div><p className="text-lg font-bold text-[var(--ds-text)]">What would you like to do?</p><p className="mt-1 text-sm text-[var(--ds-text-secondary)]">Everyday services, in one place.</p></div></div>
        <div className="grid grid-cols-4 gap-x-2 gap-y-5 sm:gap-4">
          {quickActions.map(({ to, icon: Icon, label }, index) => <Link key={`${to}-${label}`} to={to} className="group flex min-w-0 flex-col items-center gap-2 text-center"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition duration-200 group-hover:-translate-y-0.5 ${index === 5 ? 'bg-brand-700 text-white' : index === 7 ? 'bg-[var(--ds-reward-soft)] text-amber-700' : 'bg-[var(--ds-info-soft)] text-brand-700'}`}><Icon size={20} /></span><span className="text-[11px] font-semibold leading-tight text-[var(--ds-text-secondary)] sm:text-xs">{label}</span></Link>)}
        </div>
      </section>

      {banner?.active && banner?.text && <section className="flex items-start gap-3 rounded-[var(--ds-radius-card)] bg-[var(--ds-reward-soft)] p-5 text-amber-900 dark:text-amber-200"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/60 text-amber-700 dark:bg-black/10"><Gift size={19} /></span><div><p className="text-sm font-bold">Something for you</p><p className="mt-1 text-sm leading-relaxed opacity-80">{banner.text}</p></div></section>}

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-[var(--ds-text)]">Recent transactions</h2><Link to="/transactions" className="text-sm font-semibold text-brand-700">See all</Link></div>
        <Card padding="sm">
          {transactions.length ? transactions.map((transaction) => {
            const isCredit = creditTypes.includes(transaction.type);
            return <TransactionRow key={transaction._id} type={isCredit ? 'credit' : 'debit'} title={transaction.description || transaction.type?.replace(/_/g, ' ')} subtitle={transaction.createdAt ? format(new Date(transaction.createdAt), 'MMM dd, h:mm a') : ''} amount={`₦${Number(transaction.amount || 0).toLocaleString()}`} status={transaction.status} />;
          }) : <EmptyState icon={Wallet} title="Your activity will appear here" description="Fund your wallet or buy a service to begin." />}
        </Card>
      </section>

      <Card className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Input label="Have a coupon?" hint="Enter your code to add the reward to your wallet." value={couponCode} onChange={(event) => setCouponCode(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && couponCode.trim() && couponMutation.mutate()} placeholder="Enter coupon code" />
        <Button variant="secondary" loading={couponMutation.isPending} disabled={!couponCode.trim()} onClick={() => couponMutation.mutate()}>Claim reward</Button>
      </Card>
    </div>
  );
}

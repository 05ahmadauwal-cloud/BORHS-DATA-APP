import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Building2, Check, Copy, GraduationCap, Gift, Phone, Send, ShieldCheck, Tv, UserPlus, Wallet, Wifi, Zap } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { bannerAPI, kycAPI, paymentAPI, walletAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import { Button, Card, EmptyState, Input, Modal, TransactionRow } from '../../components/ui';

const quickActions = [
  { to: '/data', icon: Wifi, label: 'Buy Data' },
  { to: '/airtime', icon: Phone, label: 'Airtime' },
  { to: '/electricity', icon: Zap, label: 'Electricity' },
  { to: '/cable', icon: Tv, label: 'Cable TV' },
  { to: '/education', icon: GraduationCap, label: 'Exam PIN' },
  { to: '/wallet', icon: Wallet, label: 'Fund Wallet' },
  { action: 'transfer', icon: Send, label: 'Transfer' },
  { to: '/become-agent', icon: UserPlus, label: 'Become Agent' },
];

const creditTypes = ['wallet_fund', 'commission_earned', 'referral_bonus', 'coupon'];

export default function Dashboard() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ recipient: '', amount: '', pin: '' });
  const [copied, setCopied] = useState(false);
  const [ninOpen, setNinOpen] = useState(false);
  const [nin, setNin] = useState('');
  const { data: balanceData } = useQuery({ queryKey: ['wallet-balance'], queryFn: walletAPI.getBalance, select: (response) => response.data, refetchInterval: 10000 });
  const { data: transactionsData } = useQuery({ queryKey: ['recent-transactions'], queryFn: () => walletAPI.getTransactions({ limit: 5 }), select: (response) => response.data });
  const { data: banner } = useQuery({ queryKey: ['banner'], queryFn: bannerAPI.get, select: (response) => response.data.data, refetchInterval: 60000, staleTime: 30000 });
  const hasDedicatedAccountKYC = ['tier2', 'tier3'].includes(user?.kycStatus);
  const { data: virtualAccount } = useQuery({
    queryKey: ['monnify-virtual-account'],
    queryFn: paymentAPI.getVirtualAccount,
    select: (response) => response.data?.virtualAccount || response.data?.data?.virtualAccount,
    enabled: hasDedicatedAccountKYC,
    staleTime: 5 * 60 * 1000,
  });
  const transferMutation = useMutation({
    mutationFn: () => walletAPI.transfer({ recipient: transferForm.recipient.trim(), amount: Number(transferForm.amount), pin: transferForm.pin }),
    onSuccess: () => {
      toast.success('Transfer successful');
      setTransferForm({ recipient: '', amount: '', pin: '' });
      setTransferOpen(false);
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Transfer failed'),
  });
  const ninMutation = useMutation({
    mutationFn: () => kycAPI.submitNinForAccount(nin),
    onSuccess: (response) => {
      toast.success(response.data?.message || 'Dedicated account created');
      updateUser({ kycStatus: 'tier2' });
      setNin('');
      setNinOpen(false);
      queryClient.invalidateQueries({ queryKey: ['monnify-virtual-account'] });
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
    },
    onError: (error) => toast.error(error.response?.data?.errors?.[0]?.message || error.response?.data?.message || error.message || 'NIN verification could not be completed'),
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
  const fundingAccount = virtualAccount?.accounts?.find((account) => /moniepoint/i.test(account.bankName || '')) || virtualAccount?.accounts?.[0];
  const copyAccount = async () => {
    if (!fundingAccount?.accountNumber) return;
    await navigator.clipboard.writeText(fundingAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-3">
      <header>
        <div className="min-w-0">
          <p className="text-sm text-[var(--ds-text-secondary)]">{greeting},</p>
          <h1 className="truncate text-2xl font-bold text-[var(--ds-text)]">{user?.firstName || 'Welcome'} <span aria-hidden="true">👋</span></h1>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-[2rem] bg-brand-700 p-6 text-white shadow-[0_20px_45px_rgba(15,118,110,0.22)] sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 right-24 h-44 w-44 rounded-full border-[28px] border-white/5" />
        <div className="relative">
          <p className="text-sm font-medium text-teal-100">Available balance</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
          <div className="mt-6 flex gap-3">
            <Button as={Link} to="/wallet" variant="secondary" size="sm" icon={ArrowDownLeft} className="border-0 bg-white text-brand-800 ring-0 hover:bg-teal-50">Fund wallet</Button>
            <Button variant="text" size="sm" icon={ArrowUpRight} className="bg-white/10 text-white hover:bg-white/15" onClick={() => setTransferOpen(true)}>Transfer</Button>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/15 pt-5">
            {stats.map((stat) => <div key={stat.label} className="min-w-0"><p className="truncate text-[10px] font-medium text-teal-100 sm:text-xs">{stat.label}</p><p className={`mt-1 truncate text-xs font-bold tabular-nums sm:text-sm ${stat.tone}`}>₦{stat.value.toLocaleString()}</p></div>)}
          </div>
        </div>
      </section>

      {fundingAccount && (
        <section className="rounded-[var(--ds-radius-card)] border border-emerald-200/80 bg-white p-5 shadow-[var(--ds-shadow-card)] dark:border-emerald-400/15 dark:bg-[var(--ds-surface)]">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300"><Building2 size={20} /></span>
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">Fund with bank transfer</p><ShieldCheck size={14} className="text-emerald-600" /></div><p className="mt-2 text-sm font-bold text-[var(--ds-text)]">{fundingAccount.bankName || 'Moniepoint'}</p><p className="mt-1 text-2xl font-black tracking-[0.08em] text-[var(--ds-text)]">{fundingAccount.accountNumber}</p><p className="mt-1 truncate text-xs text-[var(--ds-text-secondary)]">{virtualAccount?.accountName}</p></div>
            <button onClick={copyAccount} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 dark:bg-emerald-400/10 dark:ring-emerald-400/20" aria-label="Copy account number">{copied ? <Check size={18} /> : <Copy size={18} />}</button>
          </div>
        </section>
      )}

      {!hasDedicatedAccountKYC && (
        <section className="rounded-[var(--ds-radius-card)] border border-dashed border-teal-300 bg-teal-50/70 p-5 dark:border-teal-400/25 dark:bg-teal-400/[0.06]">
          <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-800 shadow-sm ring-1 ring-teal-200 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/20"><Building2 size={20} /></span><div className="min-w-0 flex-1"><p className="font-bold text-[var(--ds-text)]">Get your funding account</p><p className="mt-1 text-sm leading-6 text-[var(--ds-text-secondary)]">Verify your NIN to receive a dedicated Moniepoint account for automatic wallet funding.</p><Button size="sm" className="mt-4" icon={ShieldCheck} onClick={() => setNinOpen(true)}>Verify NIN</Button></div></div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between"><div><p className="text-lg font-bold text-[var(--ds-text)]">What would you like to do?</p><p className="mt-1 text-sm text-[var(--ds-text-secondary)]">Everyday services, in one place.</p></div></div>
        <div className="grid grid-cols-4 gap-x-2 gap-y-5 sm:gap-4">
          {quickActions.map(({ to, action, icon: Icon, label }, index) => { const Component = action ? 'button' : Link; return <Component key={`${to || action}-${label}`} {...(to ? { to } : { type: 'button', onClick: () => setTransferOpen(true) })} className="group flex min-w-0 flex-col items-center gap-2 text-center"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition duration-200 group-hover:-translate-y-0.5 ${index === 5 ? 'border-brand-700 bg-brand-700 text-white' : index === 7 ? 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300' : 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-400/15 dark:bg-teal-400/10 dark:text-teal-300'}`}><Icon size={20} strokeWidth={2.2} /></span><span className="text-[11px] font-semibold leading-tight text-[var(--ds-text)] sm:text-xs">{label}</span></Component>; })}
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

      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="Send money" description="Transfer from your BORHS wallet to another user." size="sm">
        <div className="space-y-4"><Input label="Recipient" hint="Email, phone number or referral code" value={transferForm.recipient} onChange={(event) => setTransferForm({ ...transferForm, recipient: event.target.value })} placeholder="Enter recipient" /><Input label="Amount (₦)" type="number" hint={`Available: ₦${balance.toLocaleString()}`} value={transferForm.amount} onChange={(event) => setTransferForm({ ...transferForm, amount: event.target.value })} placeholder="Minimum ₦100" /><Input label="Transaction PIN" type="password" inputMode="numeric" maxLength={4} value={transferForm.pin} onChange={(event) => setTransferForm({ ...transferForm, pin: event.target.value.replace(/\D/g, '') })} placeholder="••••" /><Button className="w-full" icon={Send} loading={transferMutation.isPending} disabled={!transferForm.recipient.trim() || Number(transferForm.amount) < 100 || (user?.isPinSet && transferForm.pin.length !== 4)} onClick={() => transferMutation.mutate()}>Send money</Button></div>
      </Modal>
      <Modal open={ninOpen} onClose={() => setNinOpen(false)} title="Verify your NIN" description="Verify your identity to activate automatic bank-transfer funding." size="sm">
        <div className="space-y-4"><Input label="National Identification Number" type="password" inputMode="numeric" maxLength={11} value={nin} onChange={(event) => setNin(event.target.value.replace(/\D/g, '').slice(0, 11))} hint="Enter the 11-digit NIN registered in your name." placeholder="11-digit NIN" autoFocus /><div className="rounded-2xl bg-[var(--ds-surface-subtle)] p-4 text-xs leading-5 text-[var(--ds-text-secondary)]"><ShieldCheck size={16} className="mb-2 text-brand-700" />Your account number appears only after the identity provider accepts your details.</div><Button className="w-full" icon={Building2} loading={ninMutation.isPending} disabled={nin.length !== 11} onClick={() => ninMutation.mutate()}>Verify and create account</Button></div>
      </Modal>
    </div>
  );
}

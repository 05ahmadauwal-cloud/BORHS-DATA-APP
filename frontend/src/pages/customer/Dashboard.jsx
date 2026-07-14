import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  GraduationCap,
  Phone,
  Send,
  TrendingUp,
  Tv,
  Wallet,
  Wifi,
  XCircle,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { bannerAPI, couponAPI, walletAPI } from '../../api';
import useAuthStore from '../../store/authStore';

const quickActions = [
  { to: '/data', icon: Wifi, label: 'Buy Data', color: '#2563eb', background: '#eff6ff' },
  { to: '/airtime', icon: Phone, label: 'Airtime', color: '#059669', background: '#ecfdf5' },
  { to: '/electricity', icon: Zap, label: 'Electricity', color: '#d97706', background: '#fffbeb' },
  { to: '/cable', icon: Tv, label: 'Cable TV', color: '#7c3aed', background: '#f5f3ff' },
  { to: '/education', icon: GraduationCap, label: 'Exam PINs', color: '#dc2626', background: '#fef2f2' },
  { to: '/referrals', icon: TrendingUp, label: 'Refer & Earn', color: '#0f766e', background: '#f0fdfa' },
];

const creditTypes = ['wallet_fund', 'commission_earned', 'referral_bonus', 'coupon'];

function TransactionStatus({ status }) {
  if (status === 'success') return <CheckCircle size={16} color="#10b981" />;
  if (status === 'failed') return <XCircle size={16} color="#ef4444" />;
  return <Clock size={16} color="#f59e0b" />;
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [couponCode, setCouponCode] = useState('');

  const { data: balanceData } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: walletAPI.getBalance,
    select: (response) => response.data,
    refetchInterval: 30000,
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => walletAPI.getTransactions({ limit: 5 }),
    select: (response) => response.data,
  });

  const { data: banner } = useQuery({
    queryKey: ['banner'],
    queryFn: bannerAPI.get,
    select: (response) => response.data.data,
    refetchInterval: 60000,
    staleTime: 30000,
  });

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
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const transactions = transactionsData?.data || [];

  const redeemCoupon = () => {
    if (!couponCode.trim() || couponMutation.isPending) return;
    couponMutation.mutate();
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <section className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-dark-400 sm:text-sm">{greeting}</p>
          <h1 className="truncate text-xl font-black text-dark-50 sm:text-2xl">
            {user?.firstName} {user?.lastName}
          </h1>
        </div>
        <Link to="/wallet" className="btn-primary btn-sm shrink-0">
          <Wallet size={15} /> Fund wallet
        </Link>
      </section>

      <section
        className="rounded-2xl border p-5 sm:p-7"
        style={{ backgroundColor: '#1d4ed8', borderColor: '#2563eb' }}
      >
        <p className="text-sm font-medium text-blue-100">Available balance</p>
        <p className="mt-1 text-3xl font-black tabular-nums text-white sm:text-4xl">
          ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/wallet" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-blue-700">
            <ArrowUpRight size={15} /> Fund Wallet
          </Link>
          <Link to="/wallet" className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-4 py-2 text-sm font-bold text-white">
            <Send size={15} /> Transfer
          </Link>
        </div>
      </section>

      {banner?.active && banner?.text && (
        <section className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-dark-200">Announcement</p>
          <p className="mt-1 text-sm leading-relaxed text-dark-300">{banner.text}</p>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-100">Quick actions</h2>
          <Link to="/pricing" className="text-xs font-semibold text-primary-400">View pricing</Link>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
          {quickActions.map(({ to, icon: Icon, label, color, background }) => (
            <Link
              key={to}
              to={to}
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-dark-700 bg-dark-800 p-3 text-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ color, backgroundColor: background }}>
                <Icon size={19} />
              </span>
              <span className="text-[11px] font-bold leading-tight text-dark-200 sm:text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dark-700 bg-dark-800 p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-base font-bold text-dark-100">Claim a coupon</h2>
          <p className="mt-1 text-xs text-dark-400">Enter a valid coupon code to add its value to your wallet.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && redeemCoupon()}
            className="input"
            placeholder="Enter coupon code"
          />
          <button
            type="button"
            onClick={redeemCoupon}
            disabled={!couponCode.trim() || couponMutation.isPending}
            className="btn-primary min-w-32"
          >
            {couponMutation.isPending ? 'Claiming…' : 'Claim Coupon'}
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-100">Recent transactions</h2>
          <Link to="/transactions" className="text-xs font-semibold text-primary-400">View all</Link>
        </div>

        {transactions.length ? (
          <div className="overflow-hidden rounded-2xl border border-dark-700 bg-dark-800">
            {transactions.map((transaction, index) => {
              const isCredit = creditTypes.includes(transaction.type);
              return (
                <div
                  key={transaction._id}
                  className={`flex items-center gap-3 p-4 ${index ? 'border-t border-dark-700' : ''}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dark-700">
                    <TransactionStatus status={transaction.status} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-dark-100">
                      {transaction.description || transaction.type?.replace(/_/g, ' ')}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-dark-400">
                      {transaction.createdAt ? format(new Date(transaction.createdAt), 'MMM dd, h:mm a') : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-black ${isCredit ? 'text-success-500' : 'text-dark-100'}`}>
                      {isCredit ? '+' : '-'}₦{Number(transaction.amount || 0).toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-[10px] capitalize text-dark-400">{transaction.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dark-700 bg-dark-800 p-8 text-center">
            <Clock size={30} className="mx-auto text-dark-500" />
            <p className="mt-3 text-sm font-semibold text-dark-300">No transactions yet</p>
            <p className="mt-1 text-xs text-dark-400">Fund your wallet to get started.</p>
          </div>
        )}
      </section>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Wallet, Wifi, Phone, Zap, Tv, GraduationCap,
  ArrowUpRight, TrendingUp, Clock, CheckCircle, XCircle, Send
} from 'lucide-react';
import { walletAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import { format } from 'date-fns';

const quickActions = [
  { to: '/data', icon: Wifi, label: 'Data', color: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400', border: 'hover:border-blue-500/30' },
  { to: '/airtime', icon: Phone, label: 'Airtime', color: 'from-green-500/20 to-green-600/5', iconColor: 'text-green-400', border: 'hover:border-green-500/30' },
  { to: '/electricity', icon: Zap, label: 'Electricity', color: 'from-yellow-500/20 to-yellow-600/5', iconColor: 'text-yellow-400', border: 'hover:border-yellow-500/30' },
  { to: '/cable', icon: Tv, label: 'Cable TV', color: 'from-purple-500/20 to-purple-600/5', iconColor: 'text-purple-400', border: 'hover:border-purple-500/30' },
  { to: '/education', icon: GraduationCap, label: 'Exam PINs', color: 'from-red-500/20 to-red-600/5', iconColor: 'text-red-400', border: 'hover:border-red-500/30' },
  { to: '/referrals', icon: TrendingUp, label: 'Refer & Earn', color: 'from-success-500/20 to-success-500/5', iconColor: 'text-success-500', border: 'hover:border-success-500/30' },
];

const StatusIcon = ({ status }) => {
  if (status === 'success') return <CheckCircle size={14} className="text-success-500" />;
  if (status === 'failed') return <XCircle size={14} className="text-red-400" />;
  return <Clock size={14} className="text-yellow-400" />;
};

const isCredit = (type) => ['wallet_fund', 'commission_earned', 'referral_bonus'].includes(type);

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: balanceData } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => walletAPI.getBalance(),
    select: (res) => res.data,
    refetchInterval: 30000,
  });

  const { data: txnsData } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => walletAPI.getTransactions({ limit: 5 }),
    select: (res) => res.data,
  });

  const balance = balanceData?.walletBalance ?? user?.walletBalance ?? 0;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-5 md:space-y-7 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-dark-400 text-xs sm:text-sm">{greeting},</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-dark-50 truncate">
            {user?.firstName} {user?.lastName} 👋
          </h1>
        </div>
        <Link to="/wallet" className="btn-primary btn-sm sm:btn gap-1.5 shrink-0">
          <Wallet size={14} /> Fund
        </Link>
      </div>

      {/* Balance Card */}
      <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-5 sm:p-7 overflow-hidden shadow-2xl shadow-primary-900/40">
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-28 translate-x-28" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-20" />
        <div className="relative">
          <p className="text-primary-200 text-xs sm:text-sm font-medium mb-1">Available Balance</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5 tabular-nums">
            ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link to="/wallet" className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:bg-white/10 text-white rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors">
              <ArrowUpRight size={14} /> Fund Wallet
            </Link>
            <Link to="/wallet" className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:bg-white/10 text-white rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors">
              <Send size={14} /> Transfer
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-dark-300 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${action.color} border border-dark-700/40 ${action.border} hover:scale-105 active:scale-95 transition-all duration-200 group`}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 bg-dark-800/80 rounded-xl flex items-center justify-center ${action.iconColor} group-hover:scale-110 transition-transform`}>
                <action.icon size={18} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-dark-300 text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-bold text-dark-300">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-primary-400 hover:text-primary-300 font-semibold">
            View all
          </Link>
        </div>

        {txnsData?.data?.length > 0 ? (
          <div className="card overflow-hidden">
            <div className="divide-y divide-dark-700/40">
              {txnsData.data.map((txn) => (
                <div key={txn._id} className="flex items-center gap-3 p-3.5 sm:p-4 hover:bg-dark-700/20 transition-colors active:bg-dark-700/30">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    txn.status === 'success' ? 'bg-success-500/10' :
                    txn.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                  }`}>
                    <StatusIcon status={txn.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-dark-100 truncate">
                      {txn.description || txn.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </p>
                    <p className="text-[10px] sm:text-xs text-dark-400 truncate">
                      {txn.reference} · {format(new Date(txn.createdAt), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black ${isCredit(txn.type) ? 'text-success-500' : 'text-red-400'}`}>
                      {isCredit(txn.type) ? '+' : '-'}₦{txn.amount.toLocaleString()}
                    </p>
                    <span className={`badge text-[10px] mt-0.5 ${
                      txn.status === 'success' ? 'badge-success' :
                      txn.status === 'failed' ? 'badge-danger' : 'badge-warning'
                    }`}>{txn.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-8 sm:p-12 text-center">
            <Clock size={36} className="text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">No transactions yet.</p>
            <p className="text-dark-500 text-xs mt-1 mb-4">Fund your wallet to get started</p>
            <Link to="/wallet" className="btn-primary btn-sm">Fund Wallet</Link>
          </div>
        )}
      </div>
    </div>
  );
}

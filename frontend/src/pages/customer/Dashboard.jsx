import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Wallet, Wifi, Phone, Zap, Tv, GraduationCap, ArrowUpRight, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { walletAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import { format } from 'date-fns';

const quickActions = [
  { to: '/data', icon: Wifi, label: 'Buy Data', color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400' },
  { to: '/airtime', icon: Phone, label: 'Airtime', color: 'from-green-500/20 to-green-600/10', iconColor: 'text-green-400' },
  { to: '/electricity', icon: Zap, label: 'Electricity', color: 'from-yellow-500/20 to-yellow-600/10', iconColor: 'text-yellow-400' },
  { to: '/cable', icon: Tv, label: 'Cable TV', color: 'from-purple-500/20 to-purple-600/10', iconColor: 'text-purple-400' },
  { to: '/education', icon: GraduationCap, label: 'Exam PINs', color: 'from-red-500/20 to-red-600/10', iconColor: 'text-red-400' },
  { to: '/wallet', icon: Wallet, label: 'Fund Wallet', color: 'from-success-500/20 to-success-500/10', iconColor: 'text-success-500' },
];

const StatusIcon = ({ status }) => {
  if (status === 'success') return <CheckCircle size={14} className="text-success-500" />;
  if (status === 'failed') return <XCircle size={14} className="text-red-400" />;
  return <Clock size={14} className="text-yellow-400" />;
};

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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-sm">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},</p>
          <h1 className="text-2xl md:text-3xl font-black text-dark-50">{user?.firstName} {user?.lastName} 👋</h1>
        </div>
        <Link to="/wallet" className="btn-primary gap-2 hidden sm:inline-flex">
          <Wallet size={16} /> Fund Wallet
        </Link>
      </div>

      {/* Balance Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <p className="text-primary-200 text-sm font-medium mb-2">Available Balance</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/wallet" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors">
              <ArrowUpRight size={15} /> Fund Wallet
            </Link>
            <Link to="/wallet" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors">
              <TrendingUp size={15} /> Transfer
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-dark-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-gradient-to-br ${action.color} border border-dark-700/50 hover:scale-105 transition-all duration-200 group`}
            >
              <div className={`w-10 h-10 bg-dark-800/80 rounded-xl flex items-center justify-center ${action.iconColor} group-hover:scale-110 transition-transform`}>
                <action.icon size={20} />
              </div>
              <span className="text-xs font-semibold text-dark-200 text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-100">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-primary-400 hover:text-primary-300 font-medium">View all</Link>
        </div>

        {txnsData?.data?.length > 0 ? (
          <div className="card overflow-hidden">
            <div className="divide-y divide-dark-700/50">
              {txnsData.data.map((txn) => (
                <div key={txn._id} className="flex items-center gap-4 p-4 hover:bg-dark-700/20 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    txn.status === 'success' ? 'bg-success-500/10' :
                    txn.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                  }`}>
                    <StatusIcon status={txn.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark-100 truncate">
                      {txn.description || txn.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-dark-400">
                      {txn.reference} · {format(new Date(txn.createdAt), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${
                      ['wallet_fund', 'commission_earned', 'referral_bonus'].includes(txn.type)
                        ? 'text-success-500' : 'text-red-400'
                    }`}>
                      {['wallet_fund', 'commission_earned', 'referral_bonus'].includes(txn.type) ? '+' : '-'}
                      ₦{txn.amount.toLocaleString()}
                    </p>
                    <span className={`badge text-xs ${
                      txn.status === 'success' ? 'badge-success' :
                      txn.status === 'failed' ? 'badge-danger' : 'badge-warning'
                    }`}>{txn.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center">
            <Clock size={40} className="text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">No transactions yet. Start by funding your wallet!</p>
            <Link to="/wallet" className="btn-primary mt-4">Fund Wallet</Link>
          </div>
        )}
      </div>
    </div>
  );
}

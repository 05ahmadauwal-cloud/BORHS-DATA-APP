import { useQuery } from '@tanstack/react-query';
import { agentAPI, referralAPI } from '../../api';
import { TrendingUp, Users, DollarSign, Wallet, Copy, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function AgentDashboard() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['agent-stats'],
    queryFn: () => agentAPI.getStats(),
    select: (res) => res.data,
  });

  const { data: referralStats } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => referralAPI.getStats(),
    select: (res) => res.data,
  });

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  const statCards = [
    { label: 'Wallet Balance', value: `₦${(Number(stats?.walletBalance) || 0).toLocaleString()}`, icon: Wallet, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
    { label: 'Commission Earned', value: `₦${(Number(stats?.commissionEarned) || 0).toLocaleString()}`, icon: DollarSign, color: 'text-success-500', bg: 'bg-success-500/10 border-success-500/20' },
    { label: 'Referral Earnings', value: `₦${(Number(stats?.referralEarnings) || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Total Downlines', value: (Number(stats?.downlineCount) || 0).toLocaleString(), icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><TrendingUp className="text-primary-400" />Agent Dashboard</h1>
        <p className="page-subtitle">Track your earnings and downline performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 ${stat.bg} border rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-black text-dark-50 mb-1">{stat.value}</p>
            <p className="text-dark-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Referral Card */}
      <div className="card p-6 bg-gradient-to-br from-success-500/10 to-primary-600/10 border border-success-500/20">
        <h2 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2"><LinkIcon size={18} className="text-success-500" />Your Referral Link</h2>
        <div className="flex items-center gap-2 bg-dark-800 border border-dark-600 rounded-xl px-3 py-2.5 mb-3">
          <p className="text-sm text-dark-300 truncate flex-1 font-mono">{referralLink}</p>
          <button onClick={() => { navigator.clipboard.writeText(referralLink); toast.success('Copied!'); }} className="btn-ghost btn-sm shrink-0 gap-1">
            <Copy size={12} /> Copy
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { level: 'L1', count: referralStats?.counts?.level1 || 0, rate: '5%' },
            { level: 'L2', count: referralStats?.counts?.level2 || 0, rate: '2%' },
            { level: 'L3', count: referralStats?.counts?.level3 || 0, rate: '1%' },
          ].map((l) => (
            <div key={l.level} className="bg-dark-800/50 rounded-xl p-3">
              <p className="text-xl font-black text-dark-50">{l.count}</p>
              <p className="text-xs text-dark-400">{l.level} Referrals</p>
              <p className="text-xs text-success-500 font-bold">{l.rate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { to: '/agent/downlines', label: 'View Downlines', icon: Users, color: 'text-primary-400' },
          { to: '/agent/commissions', label: 'Commission History', icon: DollarSign, color: 'text-success-500' },
          { to: '/data', label: 'Buy Data (Agent Rate)', icon: TrendingUp, color: 'text-yellow-400' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="card p-5 hover:border-primary-500/30 transition-all group flex items-center gap-3"
          >
            <item.icon size={20} className={item.color} />
            <span className="text-sm font-semibold text-dark-200 group-hover:text-dark-50">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

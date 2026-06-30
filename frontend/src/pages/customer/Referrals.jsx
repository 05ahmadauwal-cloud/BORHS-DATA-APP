import { useQuery } from '@tanstack/react-query';
import { referralAPI } from '../../api';
import { Users, Copy, TrendingUp, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export default function Referrals() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => referralAPI.getStats(),
    select: (res) => res.data,
  });

  const { data: tree } = useQuery({
    queryKey: ['referral-tree'],
    queryFn: () => referralAPI.getTree(),
    select: (res) => res.data,
  });

  const referralLink = stats?.referralLink || `${window.location.origin}/register?ref=${user?.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><Users className="text-success-500" />Referral Program</h1>
        <p className="page-subtitle">Earn commissions every time your referrals transact</p>
      </div>

      {/* Referral Link Card */}
      <div className="card p-6 bg-gradient-to-br from-success-500/10 to-primary-600/10 border border-success-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-success-500/10 border border-success-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <LinkIcon size={22} className="text-success-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-dark-100 mb-1">Your Referral Link</p>
            <div className="flex items-center gap-2 bg-dark-800 border border-dark-600 rounded-xl px-3 py-2">
              <p className="text-sm text-dark-300 truncate flex-1 font-mono">{referralLink}</p>
              <button onClick={copyLink} className="btn-ghost btn-sm shrink-0 gap-1">
                <Copy size={12} /> Copy
              </button>
            </div>
            <p className="text-xs text-dark-400 mt-2">Code: <span className="text-success-500 font-bold">{user?.referralCode}</span></p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `₦${(stats?.totalEarnings || 0).toLocaleString()}`, color: 'text-success-500' },
          { label: 'Level 1 Refs', value: stats?.counts?.level1 || 0, sub: '5% commission' },
          { label: 'Level 2 Refs', value: stats?.counts?.level2 || 0, sub: '2% commission' },
          { label: 'Level 3 Refs', value: stats?.counts?.level3 || 0, sub: '1% commission' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <p className={`text-2xl font-black mb-1 ${stat.color || 'text-dark-50'}`}>{stat.value}</p>
            <p className="text-dark-400 text-xs">{stat.label}</p>
            {stat.sub && <p className="text-dark-500 text-xs mt-0.5">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Commission Levels */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-success-500" /> How It Works</h2>
        <div className="space-y-3">
          {[
            { level: 1, desc: 'Direct referrals you bring in', rate: '5%', color: 'bg-success-500/10 border-success-500/20 text-success-500' },
            { level: 2, desc: 'People your referrals bring in', rate: '2%', color: 'bg-primary-500/10 border-primary-500/20 text-primary-400' },
            { level: 3, desc: 'Third-level downlines', rate: '1%', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
          ].map((l) => (
            <div key={l.level} className={`flex items-center justify-between p-4 rounded-xl border ${l.color}`}>
              <div>
                <p className="font-bold text-sm">Level {l.level} Referrals</p>
                <p className="text-xs opacity-70">{l.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{l.rate}</p>
                <p className="text-xs opacity-70">of every purchase</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level 1 Downlines */}
      {tree?.level1?.users?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-dark-100 mb-4">Level 1 Downlines ({tree.level1.count})</h2>
          <div className="divide-y divide-dark-700/50">
            {tree.level1.users.slice(0, 10).map((u) => (
              <div key={u._id} className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center">
                  <span className="text-primary-400 text-xs font-bold">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-dark-100">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-dark-400">{u.email}</p>
                </div>
                <p className="text-xs text-dark-500">{new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

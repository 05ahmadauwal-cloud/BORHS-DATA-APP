import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useState } from 'react';

const formatK = (v) =>
  v >= 1000000 ? `₦${(v / 1000000).toFixed(1)}M` :
  v >= 1000 ? `₦${(v / 1000).toFixed(0)}K` : `₦${v}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-dark-400 mb-1">{label}</p>
      <p className="text-primary-400 font-bold">{formatK(payload[0].value)}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const [period, setPeriod] = useState('30d');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => adminAPI.getAnalytics(period),
    select: (res) => res.data,
  });

  const summary = analytics?.summary || {};
  const trends = analytics?.trends || {};

  const statCards = [
    { label: 'Total Revenue', value: `₦${(summary.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-success-500', bg: 'bg-success-500/10 border-success-500/20', trend: trends.revenue ?? 0 },
    { label: 'New Users', value: (summary.users || 0).toLocaleString(), icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20', trend: trends.users ?? 0 },
    { label: 'Transactions', value: (summary.transactions || 0).toLocaleString(), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', trend: trends.transactions ?? 0 },
    { label: 'Avg. Order', value: summary.periodTransactions ? formatK(Math.round((summary.revenue || 0) / summary.periodTransactions)) : '₦0', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', trend: trends.averageOrder ?? 0 },
  ];

  return (
    <div className="space-y-5 md:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-dark-50">Analytics Overview</h1>
          <p className="text-dark-400 text-xs sm:text-sm mt-0.5">Platform performance metrics</p>
        </div>
        <div className="flex gap-1.5 bg-dark-800 p-1 rounded-xl w-fit">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                period === p ? 'bg-primary-600 text-white shadow' : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              {p === '7d' ? '7D' : p === '30d' ? '30D' : '90D'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-4 md:p-5">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className={`w-9 h-9 md:w-10 md:h-10 ${stat.bg} border rounded-xl flex items-center justify-center`}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${
                stat.trend > 0 ? 'text-success-500' : stat.trend < 0 ? 'text-red-400' : 'text-dark-400'
              }`} title="Compared with the previous equivalent period">
                {stat.trend > 0 ? <ArrowUpRight size={11} /> : stat.trend < 0 ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                {stat.trend > 0 ? '+' : ''}{stat.trend}%
              </span>
            </div>
            <p className="text-lg md:text-2xl font-black text-dark-50 mb-0.5 tabular-nums leading-tight">
              {isLoading ? <span className="inline-block w-16 h-5 bg-dark-700 rounded animate-pulse" /> : stat.value}
            </p>
            <p className="text-dark-400 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card p-4 md:p-6">
        <h2 className="text-sm md:text-base font-bold text-dark-100 mb-4">Daily Revenue</h2>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.dailyRevenue || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="_id" stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={(v) => v?.slice(5)} />
              <YAxis stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={formatK} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="url(#revGradient)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4 md:p-6">
          <h2 className="text-sm md:text-base font-bold text-dark-100 mb-4">Revenue by Service</h2>
          <div className="h-44 md:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(analytics?.revenueByType || []).slice(0, 5)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="_id" stroke="#475569" tick={{ fontSize: 9 }}
                  tickFormatter={(v) => v?.replace('_purchase', '').replace('_', ' ').slice(0, 6)} />
                <YAxis stroke="#475569" tick={{ fontSize: 9 }} tickFormatter={formatK} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 md:p-6">
          <h2 className="text-sm md:text-base font-bold text-dark-100 mb-4">User Growth</h2>
          <div className="h-44 md:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.userGrowth || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="_id" stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={(v) => v?.slice(5)} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#10B981" fill="url(#userGradient)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState } from 'react';

const COLORS = ['#2563EB', '#10B981', '#f59e0b', '#ef4444', '#8b5cf6'];

const formatK = (v) => v >= 1000000 ? `₦${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `₦${(v / 1000).toFixed(0)}K` : `₦${v}`;

export default function AdminDashboard() {
  const [period, setPeriod] = useState('30d');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => adminAPI.getAnalytics(period),
    select: (res) => res.data,
  });

  const summary = analytics?.summary || {};

  const statCards = [
    { label: 'Total Revenue', value: `₦${(summary.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-success-500', bg: 'bg-success-500/10 border-success-500/20', trend: '+12%' },
    { label: 'New Users', value: (summary.users || 0).toLocaleString(), icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20', trend: '+8%' },
    { label: 'Transactions', value: (summary.transactions || 0).toLocaleString(), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', trend: '+15%' },
    { label: 'Avg. Order Value', value: summary.transactions ? formatK(Math.round(summary.revenue / summary.transactions)) : '₦0', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', trend: '+3%' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dark-50">Analytics Overview</h1>
          <p className="text-dark-400 text-sm">Platform performance metrics</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                period === p ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${stat.bg} border rounded-xl flex items-center justify-center`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-success-500">
                <ArrowUpRight size={12} /> {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-black text-dark-50 mb-1">{isLoading ? '—' : stat.value}</p>
            <p className="text-dark-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-dark-100 mb-6">Daily Revenue</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.dailyRevenue || []}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="_id" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={formatK} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v) => [`₦${v.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="url(#revGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue by Type */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-dark-100 mb-6">Revenue by Service</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(analytics?.revenueByType || []).slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="_id" stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={(v) => v.replace('_purchase', '').replace('_', ' ')} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={formatK} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  formatter={(v) => [`₦${v.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-dark-100 mb-6">User Growth</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.userGrowth || []}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="_id" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#10B981" fill="url(#userGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

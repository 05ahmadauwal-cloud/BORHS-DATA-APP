import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { walletAPI } from '../../api';
import { History, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['all', 'success', 'failed', 'pending'];
const TYPE_OPTIONS = ['all', 'wallet_fund', 'data_purchase', 'airtime_purchase', 'electricity_purchase', 'cable_purchase', 'education_purchase', 'wallet_transfer', 'commission_earned', 'referral_bonus'];

export default function Transactions() {
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: '', type: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['all-transactions', filters],
    queryFn: () => walletAPI.getTransactions(filters),
    select: (res) => res.data,
  });

  const StatusIcon = ({ status }) => {
    if (status === 'success') return <CheckCircle size={14} className="text-success-500" />;
    if (status === 'failed') return <XCircle size={14} className="text-red-400" />;
    return <Clock size={14} className="text-yellow-400" />;
  };

  const isCredit = (type) => ['wallet_fund', 'commission_earned', 'referral_bonus'].includes(type);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><History className="text-primary-400" />Transactions</h1>
        <p className="page-subtitle">Complete history of all your transactions</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-dark-400" />
        <select
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-dark-200 focus:outline-none focus:border-primary-500"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s === 'all' ? '' : s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select
          className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-dark-200 focus:outline-none focus:border-primary-500"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t === 'all' ? '' : t}>{t === 'all' ? 'All Types' : t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-dark-700/50">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 animate-pulse">
                <div className="w-10 h-10 bg-dark-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-700 rounded w-2/3" />
                  <div className="h-3 bg-dark-700 rounded w-1/3" />
                </div>
                <div className="h-4 bg-dark-700 rounded w-20" />
              </div>
            ))}
          </div>
        ) : data?.data?.length > 0 ? (
          <>
            <div className="divide-y divide-dark-700/50">
              {data.data.map((txn) => (
                <div key={txn._id} className="flex items-center gap-4 p-4 hover:bg-dark-700/20 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    txn.status === 'success' ? 'bg-success-500/10' : txn.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                  }`}>
                    <StatusIcon status={txn.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark-100 truncate">
                      {txn.description || txn.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-dark-400 font-mono">{txn.reference}</p>
                    <p className="text-xs text-dark-500">{format(new Date(txn.createdAt), 'MMM dd, yyyy h:mm a')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm ${isCredit(txn.type) ? 'text-success-500' : 'text-red-400'}`}>
                      {isCredit(txn.type) ? '+' : '-'}₦{txn.amount.toLocaleString()}
                    </p>
                    <span className={`badge text-xs ${txn.status === 'success' ? 'badge-success' : txn.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.pagination && (
              <div className="flex items-center justify-between p-4 border-t border-dark-700">
                <p className="text-xs text-dark-400">
                  Showing {((filters.page - 1) * filters.limit) + 1}–{Math.min(filters.page * filters.limit, data.pagination.total)} of {data.pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={filters.page <= 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    className="btn-secondary btn-sm"
                  >
                    Prev
                  </button>
                  <button
                    disabled={!data.pagination.hasNext}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    className="btn-secondary btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <History size={48} className="text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}

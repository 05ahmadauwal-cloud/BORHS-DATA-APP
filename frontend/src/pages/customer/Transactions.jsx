import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { walletAPI } from '../../api';
import { History, CheckCircle, XCircle, Clock, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';

const isCredit = (type) => ['wallet_fund', 'commission_earned', 'referral_bonus'].includes(type);

const TYPE_LABELS = {
  wallet_fund: 'Wallet Fund',
  wallet_transfer: 'Transfer',
  data_purchase: 'Data',
  airtime_purchase: 'Airtime',
  electricity_purchase: 'Electricity',
  cable_purchase: 'Cable TV',
  education_purchase: 'Exam PIN',
  commission_earned: 'Commission',
  referral_bonus: 'Referral Bonus',
  withdrawal: 'Withdrawal',
};

export default function Transactions() {
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: '', type: '' });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['all-transactions', filters],
    queryFn: () => walletAPI.getTransactions(filters),
    select: (res) => res.data,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-4 md:space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-dark-50 flex items-center gap-2">
            <History size={20} className="text-primary-400" /> Transactions
          </h1>
          <p className="text-dark-400 text-xs mt-0.5">{data?.pagination?.total || 0} total</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary btn-sm gap-1.5 ${showFilters ? 'border-primary-500 text-primary-400' : ''}`}
        >
          <SlidersHorizontal size={14} /> Filter
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 grid grid-cols-2 gap-3 animate-slide-up">
          <div>
            <label className="label text-xs">Status</label>
            <select
              className="input text-sm py-2"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">Type</label>
            <select
              className="input text-sm py-2"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Status chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[['', 'All'], ['success', 'Success'], ['failed', 'Failed'], ['pending', 'Pending']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilters({ ...filters, status: val, page: 1 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filters.status === val
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-dark-700/40">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-4 animate-pulse">
                <div className="w-10 h-10 bg-dark-700 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-700 rounded w-3/4" />
                  <div className="h-3 bg-dark-700 rounded w-1/2" />
                </div>
                <div className="h-5 bg-dark-700 rounded w-20" />
              </div>
            ))}
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="divide-y divide-dark-700/40">
            {data.data.map((txn) => (
              <div key={txn._id} className="flex items-center gap-3 p-3.5 sm:p-4 hover:bg-dark-700/20 active:bg-dark-700/30 transition-colors">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  txn.status === 'success' ? 'bg-success-500/10' :
                  txn.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                }`}>
                  {txn.status === 'success' ? <CheckCircle size={15} className="text-success-500" /> :
                   txn.status === 'failed' ? <XCircle size={15} className="text-red-400" /> :
                   <Clock size={15} className="text-yellow-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark-100 truncate">
                    {TYPE_LABELS[txn.type] || txn.type?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[10px] sm:text-xs text-dark-400 truncate">
                    {txn.description || txn.reference}
                  </p>
                  <p className="text-[10px] text-dark-500 mt-0.5">
                    {format(new Date(txn.createdAt), 'MMM dd, yyyy · h:mm a')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-black text-sm ${isCredit(txn.type) ? 'text-success-500' : 'text-red-400'}`}>
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
        ) : (
          <div className="p-12 text-center">
            <History size={40} className="text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">No transactions found</p>
            {(filters.status || filters.type) && (
              <button onClick={() => setFilters({ page: 1, limit: 20, status: '', type: '' })} className="btn-ghost btn-sm mt-3">
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-dark-400">
            {((filters.page - 1) * filters.limit) + 1}–{Math.min(filters.page * filters.limit, data.pagination.total)} of {data.pagination.total}
          </p>
          <div className="flex gap-2">
            <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="btn-secondary btn-sm">← Prev</button>
            <button disabled={!data.pagination.hasNext} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="btn-secondary btn-sm">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

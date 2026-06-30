import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { History, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS = {
  success: 'badge-success',
  failed: 'badge-danger',
  reversed: 'badge-warning',
  pending: 'badge-gray',
};

export default function AdminTransactions() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', filters],
    queryFn: () => adminAPI.getTransactions(filters),
    select: (res) => res.data,
  });

  const reverseMutation = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.reverseTransaction(id, reason),
    onSuccess: () => { toast.success('Transaction reversed'); queryClient.invalidateQueries({ queryKey: ['admin-transactions'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div className="space-y-4 md:space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-dark-50 flex items-center gap-2">
          <History size={22} className="text-primary-400" /> Transactions
        </h1>
        <p className="text-dark-400 text-xs mt-0.5">{data?.pagination?.total || 0} total</p>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 flex-wrap">
        {['', 'success', 'failed', 'pending', 'reversed'].map((s) => (
          <button key={s}
            onClick={() => setFilters({ ...filters, status: s, page: 1 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filters.status === s
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-600'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="h-4 bg-dark-700 rounded animate-pulse" /></td>)}</tr>
                ))
              : data?.data?.map((txn) => (
                  <tr key={txn._id}>
                    <td><span className="font-mono text-xs text-dark-300">{txn.reference}</span></td>
                    <td>
                      <p className="font-medium text-dark-100 text-sm">{txn.user?.firstName} {txn.user?.lastName}</p>
                      <p className="text-xs text-dark-400">{txn.user?.email}</p>
                    </td>
                    <td><span className="text-xs text-dark-300 capitalize">{txn.type?.replace(/_/g, ' ')}</span></td>
                    <td><span className="font-bold text-dark-100">₦{txn.amount?.toLocaleString()}</span></td>
                    <td><span className={`badge text-xs ${STATUS_COLORS[txn.status] || 'badge-gray'}`}>{txn.status}</span></td>
                    <td className="text-dark-400 text-xs">{format(new Date(txn.createdAt), 'MMM dd, HH:mm')}</td>
                    <td>
                      {txn.status === 'success' && (
                        <button
                          onClick={() => { const r = prompt('Reversal reason:'); if (r) reverseMutation.mutate({ id: txn._id, reason: r }); }}
                          className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                          title="Reverse"
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse" />)
          : data?.data?.map((txn) => (
              <div key={txn._id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-dark-100 text-sm truncate">
                      {txn.user?.firstName} {txn.user?.lastName}
                    </p>
                    <p className="text-xs text-dark-400 capitalize">{txn.type?.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-dark-100 text-sm">₦{txn.amount?.toLocaleString()}</p>
                    <span className={`badge text-[10px] ${STATUS_COLORS[txn.status] || 'badge-gray'}`}>{txn.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono text-dark-500">{txn.reference}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-dark-500">{format(new Date(txn.createdAt), 'MMM dd, HH:mm')}</p>
                    {txn.status === 'success' && (
                      <button
                        onClick={() => { const r = prompt('Reversal reason:'); if (r) reverseMutation.mutate({ id: txn._id, reason: r }); }}
                        className="p-1 rounded-lg bg-yellow-500/10 text-yellow-400"
                      >
                        <RotateCcw size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-dark-400">Page {filters.page} of {data.pagination.pages}</p>
          <div className="flex gap-2">
            <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="btn-secondary btn-sm">Prev</button>
            <button disabled={!data.pagination.hasNext} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="btn-secondary btn-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { History, RotateCcw, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminTransactions() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: '', type: '' });

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark-50 flex items-center gap-3"><History className="text-primary-400" />Transactions</h1>
        <p className="text-dark-400 text-sm">{data?.pagination?.total || 0} total transactions</p>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <Filter size={16} className="text-dark-400 mt-2.5" />
        {['', 'success', 'failed', 'pending', 'reversed'].map((s) => (
          <button key={s}
            onClick={() => setFilters({ ...filters, status: s, page: 1 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filters.status === s ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30' : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}><td colSpan={7}><div className="h-8 bg-dark-700 rounded animate-pulse my-1" /></td></tr>
              ))
            ) : data?.data?.map((txn) => (
              <tr key={txn._id}>
                <td><span className="font-mono text-xs text-dark-300">{txn.reference}</span></td>
                <td>
                  <div>
                    <p className="font-medium text-dark-100 text-sm">{txn.user?.firstName} {txn.user?.lastName}</p>
                    <p className="text-xs text-dark-400">{txn.user?.email}</p>
                  </div>
                </td>
                <td><span className="text-xs text-dark-300 capitalize">{txn.type?.replace(/_/g, ' ')}</span></td>
                <td><span className="font-bold text-dark-100">₦{txn.amount?.toLocaleString()}</span></td>
                <td>
                  <span className={`badge text-xs ${
                    txn.status === 'success' ? 'badge-success' :
                    txn.status === 'failed' ? 'badge-danger' :
                    txn.status === 'reversed' ? 'badge-warning' : 'badge-gray'
                  }`}>{txn.status}</span>
                </td>
                <td className="text-dark-400 text-xs">{format(new Date(txn.createdAt), 'MMM dd, yyyy HH:mm')}</td>
                <td>
                  {txn.status === 'success' && (
                    <button
                      onClick={() => {
                        const reason = prompt('Reversal reason:');
                        if (reason) reverseMutation.mutate({ id: txn._id, reason });
                      }}
                      className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                      title="Reverse Transaction"
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

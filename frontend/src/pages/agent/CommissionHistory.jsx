import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentAPI } from '../../api';
import { DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function CommissionHistory() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['agent-commissions', page],
    queryFn: () => agentAPI.getCommissions({ page, limit: 20 }),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><DollarSign className="text-success-500" />Commission History</h1>
        <p className="page-subtitle">All earnings from commissions and referrals</p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}><td colSpan={5}><div className="h-8 bg-dark-700 rounded animate-pulse" /></td></tr>
              ))
            ) : data?.data?.length > 0 ? data.data.map((txn) => (
              <tr key={txn._id}>
                <td><span className="font-mono text-xs text-dark-300">{txn.reference}</span></td>
                <td>
                  <span className={`badge text-xs ${txn.type === 'commission_earned' ? 'badge-success' : 'badge-info'}`}>
                    {txn.type === 'commission_earned' ? 'Commission' : 'Referral Bonus'}
                  </span>
                </td>
                <td className="text-dark-300 text-sm">{txn.description}</td>
                <td className="font-black text-success-500">+₦{txn.amount.toLocaleString()}</td>
                <td className="text-dark-400 text-xs">{format(new Date(txn.createdAt), 'MMM dd, yyyy h:mm a')}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-center py-12 text-dark-400">No commission earnings yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-dark-400">Page {page} of {data.pagination.pages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm">Prev</button>
            <button disabled={!data.pagination.hasNext} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

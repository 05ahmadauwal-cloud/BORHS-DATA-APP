import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentAPI } from '../../api';
import { Users } from 'lucide-react';
import { format } from 'date-fns';

export default function Downlines() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['agent-downlines', page],
    queryFn: () => agentAPI.getDownlines({ page, limit: 20 }),
    select: (res) => res.data,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><Users className="text-primary-400" />My Downlines</h1>
        <p className="page-subtitle">{data?.pagination?.total || 0} users you've referred</p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Balance</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}><td colSpan={6}><div className="h-8 bg-dark-700 rounded animate-pulse" /></td></tr>
              ))
            ) : data?.data?.length > 0 ? data.data.map((u) => (
              <tr key={u._id}>
                <td className="font-medium text-dark-100">{u.firstName} {u.lastName}</td>
                <td className="text-dark-400 text-sm">{u.email}</td>
                <td className="text-dark-400 text-sm">{u.phone}</td>
                <td><span className="badge-info capitalize">{u.role}</span></td>
                <td className="font-semibold text-success-500">₦{(u.walletBalance || 0).toLocaleString()}</td>
                <td className="text-dark-400 text-xs">{format(new Date(u.createdAt), 'MMM dd, yyyy')}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="text-center py-12 text-dark-400">No downlines yet. Share your referral link!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data?.pagination && (
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

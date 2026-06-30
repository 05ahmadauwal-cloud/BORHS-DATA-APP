import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminKYC() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 20, tier: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['pending-kyc', filters],
    queryFn: () => adminAPI.getPendingKYC(filters),
    select: (res) => res.data,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, reason }) => adminAPI.reviewKYC(id, action, reason),
    onSuccess: (_, { action }) => {
      toast.success(`KYC ${action}d successfully`);
      queryClient.invalidateQueries({ queryKey: ['pending-kyc'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleReview = (kyc, action) => {
    if (action === 'reject') {
      const reason = prompt('Rejection reason (required):');
      if (!reason) return;
      reviewMutation.mutate({ id: kyc._id, action, reason });
    } else {
      reviewMutation.mutate({ id: kyc._id, action });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark-50 flex items-center gap-3"><Shield className="text-primary-400" />KYC Management</h1>
        <p className="text-dark-400 text-sm">{data?.pagination?.total || 0} pending verifications</p>
      </div>

      {/* Tier Filter */}
      <div className="flex gap-2">
        {[{ label: 'All', value: '' }, { label: 'Tier 1', value: '1' }, { label: 'Tier 2', value: '2' }, { label: 'Tier 3', value: '3' }].map((t) => (
          <button key={t.value} onClick={() => setFilters({ ...filters, tier: t.value, page: 1 })}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filters.tier === t.value ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30' : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-dark-800 rounded-xl animate-pulse" />)}
        </div>
      ) : data?.data?.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((kyc) => (
            <div key={kyc._id} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-primary-400 font-bold text-sm">{kyc.user?.firstName?.[0]}{kyc.user?.lastName?.[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-dark-100">{kyc.user?.firstName} {kyc.user?.lastName}</p>
                    <p className="text-sm text-dark-400">{kyc.user?.email} · {kyc.user?.phone}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="badge-info">Tier {kyc.tier}</span>
                      <span className="badge-warning flex items-center gap-1"><Clock size={10} /> Pending</span>
                      {kyc.idType && <span className="badge-gray capitalize">{kyc.idType.replace('_', ' ')}</span>}
                    </div>
                    {kyc.idNumber && <p className="text-xs text-dark-400 mt-1">ID: {kyc.idNumber}</p>}
                    <p className="text-xs text-dark-500 mt-1">Submitted: {format(new Date(kyc.submittedAt), 'MMM dd, yyyy h:mm a')}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleReview(kyc, 'approve')}
                      disabled={reviewMutation.isPending}
                      className="btn-success btn-sm gap-1"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleReview(kyc, 'reject')}
                      disabled={reviewMutation.isPending}
                      className="btn-danger btn-sm gap-1"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <CheckCircle size={48} className="text-success-500 mx-auto mb-4 opacity-50" />
          <p className="text-dark-400">No pending KYC submissions</p>
        </div>
      )}
    </div>
  );
}

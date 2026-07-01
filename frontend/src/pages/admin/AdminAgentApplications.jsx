import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import {
  Star, CheckCircle, XCircle, Clock, AlertCircle,
  Eye, X, ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-500/15 text-yellow-400',
    approved: 'bg-success-500/15 text-success-400',
    rejected: 'bg-red-500/15 text-red-400',
  };
  const Icon = status === 'approved' ? CheckCircle : status === 'rejected' ? XCircle : Clock;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${map[status] || 'bg-dark-700 text-dark-400'}`}>
      <Icon size={10} /> {status}
    </span>
  );
}

function ReviewModal({ app, onClose, onDone }) {
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: ({ act, r }) => adminAPI.reviewAgentApplication(app._id, act, r),
    onSuccess: (_, { act }) => {
      toast.success(act === 'approve' ? 'Application approved! User is now an agent.' : 'Application rejected. Fee refunded.');
      queryClient.invalidateQueries({ queryKey: ['agent-applications'] });
      queryClient.invalidateQueries({ queryKey: ['agent-application-counts'] });
      onDone();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed'),
  });

  const isPending = app.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md h-full overflow-y-auto shadow-2xl sm:rounded-l-3xl"
        style={{ background: 'var(--bg-surface)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b flex items-center gap-3"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-700 transition-colors">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div className="flex-1">
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Agent Application</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{app.user?.firstName} {app.user?.lastName}</p>
          </div>
          <StatusBadge status={app.status} />
        </div>

        <div className="p-6 space-y-5">
          {/* Applicant info */}
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'var(--bg-elevated)' }}>
            <div className="w-12 h-12 rounded-2xl bg-primary-500/15 flex items-center justify-center shrink-0">
              <span className="font-black text-primary-400">
                {app.user?.firstName?.[0]}{app.user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{app.user?.firstName} {app.user?.lastName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{app.user?.email}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{app.user?.phone}</p>
            </div>
          </div>

          {/* Application details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Amount Paid', `₦${app.amountPaid?.toLocaleString()}`],
              ['Submitted', app.submittedAt ? format(new Date(app.submittedAt), 'MMM d, yyyy') : '—'],
              ['Current Role', app.user?.role || '—'],
              ['Wallet Balance', `₦${app.user?.walletBalance?.toLocaleString() || '0'}`],
            ].map(([l, v]) => (
              <div key={l} className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{v}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
            <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Transaction Reference</p>
            <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{app.transactionRef}</p>
          </div>

          {/* Rejection reason (if already rejected) */}
          {app.rejectionReason && (
            <div className="p-4 rounded-2xl border" style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <p className="text-xs font-bold text-red-400 mb-1">Rejection Reason</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{app.rejectionReason}</p>
            </div>
          )}

          {app.reviewedBy && (
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              Reviewed by {app.reviewedBy.firstName} {app.reviewedBy.lastName}
              {app.reviewedAt ? ` · ${format(new Date(app.reviewedAt), 'MMM d, yyyy h:mm a')}` : ''}
            </p>
          )}

          {/* Action buttons — pending only */}
          {isPending && !action && (
            <div className="flex gap-3 pt-2">
              <button onClick={() => setAction('approve')} className="btn-success flex-1 gap-2">
                <CheckCircle size={15} /> Approve
              </button>
              <button onClick={() => setAction('reject')} className="btn-danger flex-1 gap-2">
                <XCircle size={15} /> Reject
              </button>
            </div>
          )}

          {isPending && action === 'approve' && (
            <div className="space-y-3 p-4 rounded-2xl border"
              style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <p className="text-sm font-semibold text-success-400">Confirm Approval</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                This will upgrade {app.user?.firstName}'s account to <strong>Agent</strong> and give them access to the agent dashboard and commissions.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setAction(null)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={() => reviewMutation.mutate({ act: 'approve', r: '' })}
                  disabled={reviewMutation.isPending}
                  className="btn-success flex-1 gap-2"
                >
                  {reviewMutation.isPending
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <CheckCircle size={14} />}
                  {reviewMutation.isPending ? 'Approving…' : 'Yes, Approve'}
                </button>
              </div>
            </div>
          )}

          {isPending && action === 'reject' && (
            <div className="space-y-3 p-4 rounded-2xl border"
              style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <p className="text-sm font-semibold text-red-400">Rejection Reason</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                The ₦{app.amountPaid?.toLocaleString()} fee will be automatically refunded to the user's wallet.
              </p>
              <textarea
                rows={3}
                className="input resize-none w-full"
                placeholder="Tell the applicant why they were rejected…"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => { setAction(null); setReason(''); }} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={() => reviewMutation.mutate({ act: 'reject', r: reason })}
                  disabled={reviewMutation.isPending || !reason.trim()}
                  className="btn-danger flex-1 gap-2"
                >
                  {reviewMutation.isPending
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <XCircle size={14} />}
                  {reviewMutation.isPending ? 'Rejecting…' : 'Reject & Refund'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

export default function AdminAgentApplications() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);

  const { data: counts, refetch: refetchCounts } = useQuery({
    queryKey: ['agent-application-counts'],
    queryFn: () => adminAPI.getAgentApplicationCounts(),
    select: (res) => res.data,
    refetchInterval: 30_000,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['agent-applications', { status, page }],
    queryFn: () => adminAPI.getAgentApplications({ status: status === 'all' ? undefined : status, page, limit: 15 }),
    select: (res) => res.data,
    refetchInterval: 30_000,
  });

  const list = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Star size={22} className="text-yellow-400" /> Agent Applications
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Review and approve users who want to become agents
          </p>
        </div>
        <button onClick={() => { refetch(); refetchCounts(); }} className="btn-secondary btn-sm gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {error?.response?.data?.message || 'Failed to load applications'}
          </p>
          <button onClick={() => refetch()} className="btn-secondary btn-sm shrink-0 ml-auto">Retry</button>
        </div>
      )}

      {/* Tabs with counts */}
      <div className="flex gap-1 p-1 rounded-2xl w-full sm:w-fit" style={{ background: 'var(--bg-surface)' }}>
        {STATUS_TABS.map((t) => {
          const count = t.value === 'all'
            ? (counts ? counts.pending + counts.approved + counts.rejected : null)
            : counts?.[t.value];
          return (
            <button
              key={t.value}
              onClick={() => { setStatus(t.value); setPage(1); }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                status === t.value ? 'bg-primary-600 text-white shadow-sm' : ''
              }`}
              style={{ color: status === t.value ? undefined : 'var(--text-muted)' }}
            >
              {t.label}
              {count != null && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                  status === t.value
                    ? 'bg-white/20 text-white'
                    : t.value === 'pending' && count > 0
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-dark-700 text-dark-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--bg-surface)' }} />
          ))}
        </div>
      ) : list.length > 0 ? (
        <div className="space-y-2">
          {list.map((app) => (
            <button
              key={app._id}
              onClick={() => setSelectedApp(app)}
              className="w-full text-left card p-4 flex items-center gap-4 hover:border-primary-500/30 transition-all active:scale-[0.99]"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                {app.user?.firstName?.[0]}{app.user?.lastName?.[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {app.user?.firstName} {app.user?.lastName}
                  </p>
                  <StatusBadge status={app.status} />
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{app.user?.email}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                  Paid ₦{app.amountPaid?.toLocaleString()} ·{' '}
                  {app.submittedAt ? format(new Date(app.submittedAt), 'MMM d, yyyy') : '—'}
                </p>
              </div>

              <Eye size={16} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--bg-elevated)' }}>
            <Star size={28} className="text-yellow-400 opacity-40" />
          </div>
          <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>
            No {status === 'all' ? '' : status} agent applications
          </p>
          {status === 'pending' && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
              When users apply to become agents, their applications appear here for review.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {pagination.page} of {pagination.pages} · {pagination.total} total
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary btn-sm gap-1">
              <ChevronLeft size={14} /> Prev
            </button>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages} className="btn-secondary btn-sm gap-1">
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {selectedApp && (
        <ReviewModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onDone={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import {
  Shield, CheckCircle, XCircle, Clock, AlertCircle,
  Eye, X, ChevronLeft, ChevronRight, User, FileText,
  BadgeCheck, Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_TABS = [
  { value: 'pending', label: 'Pending', color: 'text-yellow-400' },
  { value: 'approved', label: 'Approved', color: 'text-success-400' },
  { value: 'rejected', label: 'Rejected', color: 'text-red-400' },
  { value: 'all', label: 'All', color: 'text-dark-300' },
];

const TIER_FILTERS = ['All', 'Tier 1', 'Tier 2', 'Tier 3'];

const ID_TYPE_LABELS = {
  nin: 'NIN',
  drivers_license: "Driver's License",
  passport: 'Passport',
  voters_card: "Voter's Card",
};

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

function Lightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-white hover:bg-dark-600">
        <X size={18} />
      </button>
      <img
        src={src}
        alt="Document"
        className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

function ReviewModal({ kycId, onClose, onDone }) {
  const [action, setAction] = useState(null); // 'approve' | 'reject'
  const [reason, setReason] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const queryClient = useQueryClient();

  const { data: kycRes, isLoading } = useQuery({
    queryKey: ['kyc-detail', kycId],
    queryFn: () => adminAPI.getKYCById(kycId),
    select: (res) => res.data?.kyc,
    enabled: !!kycId,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ act, r }) => adminAPI.reviewKYC(kycId, act, r),
    onSuccess: (_, { act }) => {
      toast.success(`KYC ${act}d successfully`);
      queryClient.invalidateQueries({ queryKey: ['kyc-submissions'] });
      onDone();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const kyc = kycRes;
  const isPending = kyc?.status === 'pending';

  return (
    <>
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />

      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div
          className="w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-slide-up sm:animate-none sm:rounded-l-3xl"
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
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>KYC Review</p>
              {kyc && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tier {kyc.tier} · {kyc.user?.firstName} {kyc.user?.lastName}</p>}
            </div>
            {kyc && <StatusBadge status={kyc.status} />}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <span className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : kyc ? (
            <div className="p-6 space-y-6">
              {/* User info */}
              <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'var(--bg-elevated)' }}>
                <div className="w-12 h-12 rounded-2xl bg-primary-500/15 flex items-center justify-center shrink-0">
                  <span className="font-black text-primary-400">
                    {kyc.user?.firstName?.[0]}{kyc.user?.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{kyc.user?.firstName} {kyc.user?.lastName}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{kyc.user?.email}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{kyc.user?.phone}</p>
                </div>
              </div>

              {/* Tier 1 info */}
              {kyc.tier === 1 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>BASIC VERIFICATION</p>
                  <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-elevated)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      User confirmed their account details (name, phone, email) at registration.
                    </p>
                  </div>
                </div>
              )}

              {/* Tier 2 info */}
              {kyc.tier === 2 && (
                <div className="space-y-4">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>ID DOCUMENT</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['ID Type', ID_TYPE_LABELS[kyc.idType] || kyc.idType],
                      ['ID Number', kyc.idNumber],
                      ['BVN', kyc.bvn || '—'],
                      ['Submitted', kyc.submittedAt ? format(new Date(kyc.submittedAt), 'MMM d, yyyy') : '—'],
                    ].map(([l, v]) => (
                      <div key={l} className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                        <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Document images */}
                  <div className="grid grid-cols-2 gap-3">
                    {kyc.idFrontImage && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>ID FRONT</p>
                        <button onClick={() => setLightbox(kyc.idFrontImage)} className="w-full">
                          <img src={kyc.idFrontImage} alt="ID Front"
                            className="w-full h-36 object-cover rounded-xl border hover:opacity-80 transition-opacity"
                            style={{ borderColor: 'var(--border)' }} />
                        </button>
                      </div>
                    )}
                    {kyc.idBackImage && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>ID BACK</p>
                        <button onClick={() => setLightbox(kyc.idBackImage)} className="w-full">
                          <img src={kyc.idBackImage} alt="ID Back"
                            className="w-full h-36 object-cover rounded-xl border hover:opacity-80 transition-opacity"
                            style={{ borderColor: 'var(--border)' }} />
                        </button>
                      </div>
                    )}
                    {!kyc.idFrontImage && !kyc.idBackImage && (
                      <div className="col-span-2 p-4 rounded-xl text-center" style={{ background: 'var(--bg-elevated)' }}>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No document images uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tier 3 info */}
              {kyc.tier === 3 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>SELFIE</p>
                  {kyc.selfieImage ? (
                    <button onClick={() => setLightbox(kyc.selfieImage)} className="w-full">
                      <img src={kyc.selfieImage} alt="Selfie"
                        className="w-full h-56 object-cover rounded-2xl border hover:opacity-80 transition-opacity"
                        style={{ borderColor: 'var(--border)' }} />
                    </button>
                  ) : (
                    <div className="p-8 rounded-2xl text-center" style={{ background: 'var(--bg-elevated)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No selfie uploaded</p>
                    </div>
                  )}
                  <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>Click image to view full size</p>
                </div>
              )}

              {/* Rejection reason if already rejected */}
              {kyc.rejectionReason && (
                <div className="p-4 rounded-2xl border" style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)' }}>
                  <p className="text-xs font-bold text-red-400 mb-1">Rejection Reason</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{kyc.rejectionReason}</p>
                </div>
              )}

              {/* Reviewed by */}
              {kyc.reviewedBy && (
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  Reviewed by {kyc.reviewedBy.firstName} {kyc.reviewedBy.lastName} on{' '}
                  {kyc.reviewedAt ? format(new Date(kyc.reviewedAt), 'MMM d, yyyy h:mm a') : '—'}
                </p>
              )}

              {/* Action area — only for pending */}
              {isPending && !action && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setAction('approve')}
                    className="btn-success flex-1 gap-2"
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button
                    onClick={() => setAction('reject')}
                    className="btn-danger flex-1 gap-2"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}

              {/* Confirm approve */}
              {isPending && action === 'approve' && (
                <div className="space-y-3 p-4 rounded-2xl border"
                  style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
                  <p className="text-sm font-semibold text-success-400">Confirm Approval</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Approving will mark this Tier {kyc.tier} KYC as verified and unlock the next tier for this user.
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

              {/* Confirm reject */}
              {isPending && action === 'reject' && (
                <div className="space-y-3 p-4 rounded-2xl border"
                  style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
                  <p className="text-sm font-semibold text-red-400">Rejection Reason</p>
                  <textarea
                    rows={3}
                    className="input resize-none w-full"
                    placeholder="Tell the user why this was rejected…"
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
                      {reviewMutation.isPending ? 'Rejecting…' : 'Reject'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p style={{ color: 'var(--text-muted)' }}>Record not found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminKYC() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [tier, setTier] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['kyc-submissions', { status, tier, page }],
    queryFn: () => adminAPI.getAllKYC({ status, tier: tier || undefined, page, limit: 15 }),
    select: (res) => res.data,
  });

  const list = data?.data || [];
  const pagination = data?.pagination;

  const tierIcon = (t) => {
    if (t === 1) return <User size={13} />;
    if (t === 2) return <FileText size={13} />;
    return <Camera size={13} />;
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Shield size={22} className="text-primary-400" /> KYC Management
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {pagination?.total ?? 0} submission{pagination?.total !== 1 ? 's' : ''} · {status}
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 p-1 rounded-2xl w-full sm:w-fit" style={{ background: 'var(--bg-surface)' }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setStatus(t.value); setPage(1); }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              status === t.value ? 'bg-primary-600 text-white shadow-sm' : ''
            }`}
            style={{ color: status === t.value ? undefined : 'var(--text-muted)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tier chips */}
      <div className="flex gap-2 flex-wrap">
        {TIER_FILTERS.map((t, i) => {
          const val = i === 0 ? '' : String(i);
          return (
            <button
              key={t}
              onClick={() => { setTier(val); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                tier === val
                  ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                  : 'border'
              }`}
              style={tier !== val ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderColor: 'var(--border)' } : {}}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--bg-surface)' }} />
          ))}
        </div>
      ) : list.length > 0 ? (
        <div className="space-y-2">
          {list.map((kyc) => (
            <button
              key={kyc._id}
              onClick={() => setSelectedId(kyc._id)}
              className="w-full text-left card p-4 flex items-center gap-4 hover:border-primary-500/30 transition-all active:scale-[0.99]"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                {kyc.user?.firstName?.[0]}{kyc.user?.lastName?.[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {kyc.user?.firstName} {kyc.user?.lastName}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400">
                    {tierIcon(kyc.tier)} Tier {kyc.tier}
                  </span>
                  <StatusBadge status={kyc.status} />
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {kyc.user?.email}
                  {kyc.idType ? ` · ${ID_TYPE_LABELS[kyc.idType] || kyc.idType}` : ''}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                  {kyc.submittedAt ? format(new Date(kyc.submittedAt), 'MMM d, yyyy · h:mm a') : '—'}
                </p>
              </div>

              {/* Arrow */}
              <Eye size={16} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--bg-elevated)' }}>
            <CheckCircle size={28} className="text-success-400 opacity-60" />
          </div>
          <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>
            No {status === 'all' ? '' : status} KYC submissions{tier ? ` for Tier ${tier}` : ''}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {pagination.page} of {pagination.pages} · {pagination.total} total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary btn-sm gap-1"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="btn-secondary btn-sm gap-1"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Review modal */}
      {selectedId && (
        <ReviewModal
          kycId={selectedId}
          onClose={() => setSelectedId(null)}
          onDone={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentAPI, walletAPI } from '../../api';
import {
  Star, CheckCircle, Clock, XCircle, AlertCircle,
  Wallet, TrendingUp, Users, Zap, ArrowRight, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const BENEFITS = [
  { icon: TrendingUp, title: 'Earn Commissions', desc: 'Get paid on every data, airtime, electricity and cable purchase you make' },
  { icon: Users, title: 'Build Downlines', desc: 'Refer others and earn from their activity with multi-level commissions' },
  { icon: Zap, title: 'Priority Support', desc: 'Agents get faster response times and a dedicated support channel' },
  { icon: Star, title: 'Agent Dashboard', desc: 'Access your agent dashboard, commission history, and downline reports' },
];

function StatusCard({ application, fee }) {
  if (!application) return null;

  if (application.status === 'pending') {
    return (
      <div className="card p-6 space-y-4" style={{ borderColor: 'rgba(234,179,8,0.35)', background: 'rgba(234,179,8,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.12)' }}>
            <Clock size={24} className="text-yellow-400" />
          </div>
          <div>
            <p className="font-black text-yellow-400">Application Under Review</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Submitted {application.submittedAt ? format(new Date(application.submittedAt), 'MMM d, yyyy · h:mm a') : '—'}
            </p>
          </div>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your application is being reviewed by our admin team. This typically takes 24–48 hours. We'll notify you once a decision is made.
        </p>
        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          <Wallet size={14} style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            ₦{application.amountPaid?.toLocaleString()} deducted · Ref: <span className="font-mono">{application.transactionRef}</span>
          </p>
        </div>
      </div>
    );
  }

  if (application.status === 'rejected') {
    return (
      <div className="card p-6 space-y-4" style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <XCircle size={24} className="text-red-400" />
          </div>
          <div>
            <p className="font-black text-red-400">Application Rejected</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {application.reviewedAt ? format(new Date(application.reviewedAt), 'MMM d, yyyy') : '—'}
            </p>
          </div>
        </div>
        {application.rejectionReason && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Reason: {application.rejectionReason}
          </p>
        )}
        <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.07)' }}>
          <p className="text-xs text-success-400 font-semibold">
            ✓ ₦{application.amountPaid?.toLocaleString()} has been refunded to your wallet
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function BecomeAgent() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);

  const { data: feeData } = useQuery({
    queryKey: ['agent-fee'],
    queryFn: () => agentAPI.getFee(),
    select: (res) => res.data?.fee,
  });

  const { data: appData, isLoading } = useQuery({
    queryKey: ['my-agent-application'],
    queryFn: () => agentAPI.getMyApplication(),
    select: (res) => res.data,
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => walletAPI.getBalance(),
    select: (res) => res.data,
  });

  const applyMutation = useMutation({
    mutationFn: () => agentAPI.apply(),
    onSuccess: () => {
      toast.success('Application submitted! We will review within 24–48 hours.');
      setConfirmed(false);
      queryClient.invalidateQueries({ queryKey: ['my-agent-application'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Application failed'),
  });

  const fee = feeData ?? 5000;
  const application = appData?.application;
  const balance = walletData?.balance ?? 0;
  const hasEnough = balance >= fee;
  const isAgent = user?.role === 'agent' || user?.role === 'admin' || user?.role === 'super_admin';
  const hasPending = application?.status === 'pending';
  const wasRejected = application?.status === 'rejected';

  if (isAgent) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(16,185,129,0.12)' }}>
            <CheckCircle size={32} className="text-success-400" />
          </div>
          <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>You're already an Agent!</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Access your agent dashboard to view your stats, downlines, and commissions.
          </p>
          <Link to="/agent" className="btn-primary gap-2 justify-center">
            <Star size={16} /> Go to Agent Dashboard <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Star size={22} className="text-yellow-400" /> Become an Agent
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Join our agent program and start earning commissions on every transaction
        </p>
      </div>

      {/* Application status card (if exists) */}
      {!isLoading && application && (
        <StatusCard application={application} fee={fee} />
      )}

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BENEFITS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-4 flex gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(37,99,235,0.12)' }}>
              <Icon size={18} className="text-primary-400" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fee & Apply */}
      {!hasPending && (
        <div className="card p-6 space-y-5">
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
              {wasRejected ? 'REAPPLICATION FEE' : 'REGISTRATION FEE'}
            </p>
            <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
              ₦{fee.toLocaleString()}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              One-time payment, deducted from your wallet. Refunded if rejected.
            </p>
          </div>

          {/* Wallet balance check */}
          <div className={`flex items-center gap-3 p-3 rounded-xl ${hasEnough ? '' : 'border'}`}
            style={{
              background: hasEnough ? 'var(--bg-elevated)' : 'rgba(239,68,68,0.07)',
              borderColor: hasEnough ? undefined : 'rgba(239,68,68,0.2)',
            }}>
            <Wallet size={15} className={hasEnough ? 'text-success-400' : 'text-red-400'} />
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Wallet Balance: <strong>₦{balance.toLocaleString()}</strong>
              </p>
              {!hasEnough && (
                <p className="text-xs text-red-400 mt-0.5">
                  You need ₦{(fee - balance).toLocaleString()} more.{' '}
                  <Link to="/wallet" className="underline">Fund wallet</Link>
                </p>
              )}
            </div>
            {hasEnough && <CheckCircle size={15} className="text-success-400 shrink-0" />}
          </div>

          {wasRejected && (
            <div className="flex gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(234,179,8,0.07)', color: 'var(--text-muted)' }}>
              <AlertCircle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
              <span>Your previous application was rejected. You may reapply by paying the fee again.</span>
            </div>
          )}

          {/* Confirmation */}
          {!confirmed ? (
            <button
              onClick={() => setConfirmed(true)}
              disabled={!hasEnough}
              className="btn-primary w-full gap-2 justify-center"
            >
              <Star size={16} /> Apply Now — ₦{fee.toLocaleString()}
            </button>
          ) : (
            <div className="space-y-3 p-4 rounded-2xl border"
              style={{ background: 'rgba(37,99,235,0.06)', borderColor: 'rgba(37,99,235,0.25)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Confirm Payment</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ₦{fee.toLocaleString()} will be deducted from your wallet and your application submitted for admin review.
                If rejected, the fee is automatically refunded.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmed(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
                  className="btn-primary flex-1 gap-2"
                >
                  {applyMutation.isPending
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <CheckCircle size={14} />}
                  {applyMutation.isPending ? 'Submitting…' : 'Confirm & Pay'}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-faint)' }}>
            <Shield size={12} className="shrink-0 mt-0.5" />
            <span>Your application will be reviewed by an admin. Decision is usually within 24–48 hours.</span>
          </div>
        </div>
      )}
    </div>
  );
}

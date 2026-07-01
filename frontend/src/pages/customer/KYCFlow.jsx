import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kycAPI } from '../../api';
import {
  CheckCircle, Clock, AlertCircle, Upload, Camera,
  Shield, BadgeCheck, User, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const ID_TYPES = [
  { value: 'nin', label: 'National ID (NIN)' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'passport', label: 'International Passport' },
  { value: 'voters_card', label: "Voter's Card" },
];

function StatusBadge({ status }) {
  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-success-500/15 text-success-400">
      <CheckCircle size={10} /> Approved
    </span>
  );
  if (status === 'pending') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">
      <Clock size={10} /> Under Review
    </span>
  );
  if (status === 'rejected') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
      <AlertCircle size={10} /> Rejected
    </span>
  );
  return null;
}

function TierCard({ tier, label, desc, icon: Icon, status, locked, lockedMsg, children }) {
  const isApproved = status === 'approved';
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <div
      className="card overflow-hidden transition-all"
      style={{
        ...(isApproved && { borderColor: 'rgba(16,185,129,0.35)' }),
        ...(isPending && { borderColor: 'rgba(234,179,8,0.35)' }),
        ...(isRejected && { borderColor: 'rgba(239,68,68,0.35)' }),
        ...(locked && { opacity: 0.55 }),
      }}
    >
      <div className="p-4 flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: isApproved ? 'rgba(16,185,129,0.12)' :
              isPending ? 'rgba(234,179,8,0.12)' :
              isRejected ? 'rgba(239,68,68,0.12)' :
              'var(--bg-elevated)',
          }}
        >
          {isApproved ? <CheckCircle size={22} className="text-success-400" /> :
           isPending  ? <Clock size={22} className="text-yellow-400" /> :
           isRejected ? <AlertCircle size={22} className="text-red-400" /> :
           <Icon size={18} className={locked ? 'text-dark-600' : 'text-primary-400'} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              Tier {tier}
            </span>
            {status && <StatusBadge status={status} />}
            {locked && !status && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dark-800 text-dark-500">
                {lockedMsg}
              </span>
            )}
          </div>
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
        </div>
      </div>

      {!locked && children}
    </div>
  );
}

function ImageUpload({ label, required, preview, capture, onChange }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        {label} {required && <span className="text-red-400">*</span>}
      </p>
      {preview ? (
        <div className="relative">
          <img src={preview} alt={label} className="w-full h-36 object-cover rounded-xl border" style={{ borderColor: 'var(--border)' }} />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-primary-500/60"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
        >
          {capture ? <Camera size={22} style={{ color: 'var(--text-muted)' }} /> : <Upload size={22} style={{ color: 'var(--text-muted)' }} />}
          <span className="text-xs mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
            {capture ? 'Take photo / Upload' : 'Click to upload'}
          </span>
          <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>JPG, PNG, WEBP · max 5MB</span>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            capture={capture || undefined}
            className="hidden"
            onChange={(e) => onChange(e.target.files[0] || null)}
          />
        </label>
      )}
    </div>
  );
}

export default function KYCFlow() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [t2Form, setT2Form] = useState({ idType: '', idNumber: '', bvn: '' });
  const [t2Files, setT2Files] = useState({ idFront: null, idBack: null });
  const [t2Previews, setT2Previews] = useState({ idFront: null, idBack: null });
  const [resubmitT2, setResubmitT2] = useState(false);

  const [t3File, setT3File] = useState(null);
  const [t3Preview, setT3Preview] = useState(null);
  const [resubmitT3, setResubmitT3] = useState(false);

  const { data: kycData } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => kycAPI.getStatus(),
    select: (res) => res.data,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['kyc-status'] });

  const tier1 = kycData?.records?.find(r => r.tier === 1);
  const tier2 = kycData?.records?.find(r => r.tier === 2);
  const tier3 = kycData?.records?.find(r => r.tier === 3);

  const t1Done = tier1?.status === 'approved';
  const t2Done = tier2?.status === 'approved';

  const tier1Mutation = useMutation({
    mutationFn: () => kycAPI.submitTier1(),
    onSuccess: () => {
      toast.success('Tier 1 verified!');
      updateUser({ kycStatus: 'tier1' });
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Verification failed'),
  });

  const handleFile = (key, file, setFiles, setPreviews) => {
    setFiles(p => ({ ...p, [key]: file }));
    setPreviews(p => ({ ...p, [key]: file ? URL.createObjectURL(file) : null }));
  };

  const tier2Mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('idType', t2Form.idType);
      fd.append('idNumber', t2Form.idNumber);
      if (t2Form.bvn) fd.append('bvn', t2Form.bvn);
      fd.append('idFront', t2Files.idFront);
      if (t2Files.idBack) fd.append('idBack', t2Files.idBack);
      return kycAPI.submitTier2(fd);
    },
    onSuccess: () => {
      toast.success('ID documents submitted! Awaiting review.');
      setResubmitT2(false);
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Submission failed'),
  });

  const tier3Mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('selfie', t3File);
      return kycAPI.submitTier3(fd);
    },
    onSuccess: () => {
      toast.success('Selfie submitted! Awaiting review.');
      setResubmitT3(false);
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Submission failed'),
  });

  const canSubmitT2 = t2Form.idType && t2Form.idNumber.trim() && t2Files.idFront;

  const allDone = tier3?.status === 'approved';

  return (
    <div className="space-y-3">
      {/* Info banner */}
      <div className="flex gap-3 p-4 rounded-2xl border"
        style={{ background: 'rgba(37,99,235,0.07)', borderColor: 'rgba(37,99,235,0.2)' }}>
        <Shield size={17} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-300">Identity Verification</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Complete all 3 tiers to unlock higher limits and full platform access.
          </p>
        </div>
      </div>

      {/* ── TIER 1 ── */}
      <TierCard tier={1} label="Basic Verification" desc="Confirm your account details"
        icon={User} status={tier1?.status}>
        {!tier1 && (
          <div className="px-5 pb-5 border-t pt-4 space-y-4" style={{ borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-2 gap-3">
              {[['Full Name', `${user?.firstName} ${user?.lastName}`], ['Phone', user?.phone], ['Email', user?.email]].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{v}</p>
                </div>
              ))}
            </div>
            <button onClick={() => tier1Mutation.mutate()} disabled={tier1Mutation.isPending} className="btn-primary gap-2">
              {tier1Mutation.isPending
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</>
                : <><CheckCircle size={15} />Verify My Details</>}
            </button>
          </div>
        )}
        {tier1?.status === 'rejected' && (
          <div className="px-5 pb-5 border-t pt-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm text-red-400">Reason: {tier1.rejectionReason || 'Contact support'}</p>
            <button onClick={() => tier1Mutation.mutate()} disabled={tier1Mutation.isPending} className="btn-primary gap-2">
              <CheckCircle size={15} /> Retry
            </button>
          </div>
        )}
      </TierCard>

      {/* ── TIER 2 ── */}
      <TierCard tier={2} label="ID Document" desc="Upload a government-issued ID"
        icon={BadgeCheck} status={tier2?.status}
        locked={!t1Done} lockedMsg="Complete Tier 1 first">

        {/* Form — shown when no submission yet, OR resubmitting after rejection */}
        {t1Done && (!tier2 || (tier2.status === 'rejected' && resubmitT2)) && (
          <div className="px-5 pb-5 border-t pt-4 space-y-4" style={{ borderColor: 'var(--border)' }}>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  ID Type <span className="text-red-400">*</span>
                </label>
                <select className="input" value={t2Form.idType} onChange={e => setT2Form(p => ({ ...p, idType: e.target.value }))}>
                  <option value="">Select ID type…</option>
                  {ID_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  ID Number <span className="text-red-400">*</span>
                </label>
                <input className="input" placeholder="Enter your ID number"
                  value={t2Form.idNumber} onChange={e => setT2Form(p => ({ ...p, idNumber: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  BVN <span className="text-[10px] text-dark-500">(optional)</span>
                </label>
                <input className="input" placeholder="11-digit BVN"
                  value={t2Form.bvn} onChange={e => setT2Form(p => ({ ...p, bvn: e.target.value.replace(/\D/g, '').slice(0, 11) }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ImageUpload label="ID Front" required
                  preview={t2Previews.idFront}
                  onChange={f => handleFile('idFront', f, setT2Files, setT2Previews)} />
                <ImageUpload label="ID Back"
                  preview={t2Previews.idBack}
                  onChange={f => handleFile('idBack', f, setT2Files, setT2Previews)} />
              </div>
            </div>
            <div className="flex gap-2">
              {resubmitT2 && (
                <button onClick={() => setResubmitT2(false)} className="btn-secondary">Cancel</button>
              )}
              <button
                onClick={() => tier2Mutation.mutate()}
                disabled={tier2Mutation.isPending || !canSubmitT2}
                className="btn-primary flex-1 gap-2"
              >
                {tier2Mutation.isPending
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                  : <><Upload size={15} />Submit ID Documents</>}
              </button>
            </div>
          </div>
        )}

        {/* Pending state */}
        {t1Done && tier2?.status === 'pending' && (
          <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(234,179,8,0.07)' }}>
              <Clock size={15} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Your ID documents are under review. This typically takes 1–24 hours. We'll notify you once reviewed.
              </p>
            </div>
          </div>
        )}

        {/* Rejected state */}
        {t1Done && tier2?.status === 'rejected' && !resubmitT2 && (
          <div className="px-5 pb-5 border-t pt-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.07)' }}>
              <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-400">Rejection Reason</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{tier2.rejectionReason || 'Contact support for details'}</p>
              </div>
            </div>
            <button onClick={() => { setResubmitT2(true); setT2Form({ idType: '', idNumber: '', bvn: '' }); setT2Files({ idFront: null, idBack: null }); setT2Previews({ idFront: null, idBack: null }); }} className="btn-secondary gap-2">
              <Upload size={14} /> Resubmit Documents
            </button>
          </div>
        )}
      </TierCard>

      {/* ── TIER 3 ── */}
      <TierCard tier={3} label="Selfie Verification" desc="A live selfie to confirm your identity"
        icon={Camera} status={tier3?.status}
        locked={!t2Done} lockedMsg="Complete Tier 2 first">

        {t2Done && (!tier3 || (tier3.status === 'rejected' && resubmitT3)) && (
          <div className="px-5 pb-5 border-t pt-4 space-y-4" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Take a clear selfie with good lighting. Your face must be fully visible and unobstructed.
            </p>
            <ImageUpload label="Your Selfie" required capture="user"
              preview={t3Preview}
              onChange={f => { setT3File(f); setT3Preview(f ? URL.createObjectURL(f) : null); }} />
            <div className="flex gap-2">
              {resubmitT3 && (
                <button onClick={() => setResubmitT3(false)} className="btn-secondary">Cancel</button>
              )}
              <button
                onClick={() => tier3Mutation.mutate()}
                disabled={tier3Mutation.isPending || !t3File}
                className="btn-primary flex-1 gap-2"
              >
                {tier3Mutation.isPending
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                  : <><Camera size={15} />Submit Selfie</>}
              </button>
            </div>
          </div>
        )}

        {t2Done && tier3?.status === 'pending' && (
          <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(234,179,8,0.07)' }}>
              <Clock size={15} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Your selfie is under review. This usually takes a few hours.
              </p>
            </div>
          </div>
        )}

        {t2Done && tier3?.status === 'rejected' && !resubmitT3 && (
          <div className="px-5 pb-5 border-t pt-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.07)' }}>
              <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-400">Rejection Reason</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{tier3.rejectionReason || 'Contact support for details'}</p>
              </div>
            </div>
            <button onClick={() => { setResubmitT3(true); setT3File(null); setT3Preview(null); }} className="btn-secondary gap-2">
              <Camera size={14} /> Retake Selfie
            </button>
          </div>
        )}
      </TierCard>

      {/* Fully verified banner */}
      {allDone && (
        <div className="card p-6 text-center space-y-3"
          style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.25)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(16,185,129,0.12)' }}>
            <CheckCircle size={32} className="text-success-400" />
          </div>
          <p className="font-black text-lg text-success-400">Fully Verified!</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            All 3 KYC tiers completed. Your account is fully unlocked.
          </p>
        </div>
      )}
    </div>
  );
}

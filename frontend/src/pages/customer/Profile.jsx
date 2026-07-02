import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI, walletAPI } from '../../api';
import {
  User, Shield, Lock, KeyRound, CheckCircle, Copy, Check, Clock,
  Mail, Phone, Calendar, Star, Wallet, Eye, EyeOff, AlertCircle, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import KYCFlow from './KYCFlow';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'kyc', label: 'KYC', icon: Shield },
  { id: 'security', label: 'Security', icon: Lock },
];

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg transition-all hover:bg-dark-600 active:scale-90"
      style={{ color: 'var(--text-muted)' }}
      title="Copy"
    >
      {copied ? <Check size={13} className="text-success-400" /> : <Copy size={13} />}
    </button>
  );
}

function InfoRow({ icon: Icon, label, value, copyable }) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'var(--bg-elevated)' }}>
        <Icon size={15} style={{ color: 'var(--text-muted)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{value || '—'}</p>
      </div>
      {copyable && value && <CopyButton value={value} />}
    </div>
  );
}

function PasswordInput({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className="input pr-10"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--text-muted)' }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pin, setPin] = useState('');
  const [resetPinForm, setResetPinForm] = useState({ password: '', newPin: '' });
  const [showResetPin, setShowResetPin] = useState(false);

  const changePwMutation = useMutation({
    mutationFn: () => authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    onSuccess: () => { toast.success('Password changed!'); setPwForm({ currentPassword: '', newPassword: '', confirm: '' }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const setPinMutation = useMutation({
    mutationFn: () => walletAPI.setPin(pin),
    onSuccess: () => { toast.success('Transaction PIN set!'); setPin(''); updateUser({ isPinSet: true }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const resetPinMutation = useMutation({
    mutationFn: () => walletAPI.resetPin(resetPinForm.password, resetPinForm.newPin),
    onSuccess: () => {
      toast.success('Transaction PIN reset successfully!');
      setResetPinForm({ password: '', newPin: '' });
      setShowResetPin(false);
      updateUser({ isPinSet: true });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to reset PIN'),
  });

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }) : '—';
  const balance = (user?.walletBalance || 0).toLocaleString('en-NG');

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-6">

      {/* Hero Card */}
      <div className="card overflow-hidden">
        {/* Banner gradient */}
        <div className="h-24 sm:h-28 relative" style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2942 40%, #1a1f3a 100%)',
        }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)' }}
          />
        </div>

        <div className="px-4 sm:px-6 pb-5">
          {/* Avatar — overlaps banner */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-4 flex items-center justify-center shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  borderColor: 'var(--bg-card)',
                }}>
                <span className="text-2xl font-black text-white">{initials}</span>
              </div>
              {user?.isEmailVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 rounded-full flex items-center justify-center border-2"
                  style={{ borderColor: 'var(--bg-card)' }}>
                  <Check size={10} className="text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full capitalize"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>

          {/* Name & email */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { icon: Wallet, label: 'Balance', value: `₦${balance}`, color: 'text-success-400' },
              { icon: Calendar, label: 'Member Since', value: memberSince, color: 'text-blue-400' },
              { icon: Star, label: 'Referral Code', value: user?.referralCode, color: 'text-yellow-400', copy: true },
            ].map(({ icon: Icon, label, value, color, copy }) => (
              <div key={label} className="rounded-xl p-3 flex flex-col gap-1"
                style={{ background: 'var(--bg-elevated)' }}>
                <Icon size={14} className={color} />
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <div className="flex items-center gap-1">
                  <p className={`text-xs sm:text-sm font-bold truncate ${color}`}>{value || '—'}</p>
                  {copy && value && <CopyButton value={value} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl" style={{ background: 'var(--bg-surface)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'hover:text-dark-100'
            }`}
            style={{ color: activeTab === id ? undefined : 'var(--text-muted)' }}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden text-xs">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Profile Tab ──────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2"
            style={{ borderColor: 'var(--border)' }}>
            <User size={16} className="text-primary-400" />
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Account Information</h2>
          </div>
          <div className="px-5 divide-y" style={{ divideColor: 'var(--border)' }}>
            <InfoRow icon={User} label="First Name" value={user?.firstName} />
            <InfoRow icon={User} label="Last Name" value={user?.lastName} />
            <InfoRow icon={User} label="Username" value={user?.username ? `@${user.username}` : '—'} copyable={!!user?.username} />
            <InfoRow icon={Mail} label="Email Address" value={user?.email} copyable />
            <InfoRow icon={Phone} label="Phone Number" value={user?.phone} copyable />
            <InfoRow icon={Star} label="Referral Code" value={user?.referralCode} copyable />
            <InfoRow icon={Calendar} label="Member Since" value={memberSince} />
          </div>

          {/* Badges */}
          <div className="px-5 py-4 flex flex-wrap gap-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
              user?.isEmailVerified ? 'bg-success-500/10 text-success-400 border border-success-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              {user?.isEmailVerified ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
              {user?.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
              user?.isPhoneVerified ? 'bg-success-500/10 text-success-400 border border-success-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              {user?.isPhoneVerified ? <CheckCircle size={11} /> : <Clock size={11} />}
              {user?.isPhoneVerified ? 'Phone Verified' : 'Phone Unverified'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Shield size={11} />
              KYC: {user?.kycStatus || 'None'}
            </span>
          </div>
        </div>
      )}

      {/* ── KYC Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'kyc' && <KYCFlow />}

      {/* ── Security Tab ─────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="space-y-4">

          {/* Change Password */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)' }}>
              <Lock size={16} className="text-primary-400" />
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Change Password</h3>
            </div>
            <div className="p-5 space-y-3">
              <PasswordInput
                placeholder="Current password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              />
              <PasswordInput
                placeholder="New password (min 8 characters)"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
              <PasswordInput
                placeholder="Confirm new password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              />

              {/* Strength hint */}
              {pwForm.newPassword.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                      pwForm.newPassword.length >= i * 3
                        ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-yellow-500' : i <= 3 ? 'bg-blue-500' : 'bg-success-500'
                        : 'bg-dark-600'
                    }`} />
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
                  if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
                  changePwMutation.mutate();
                }}
                disabled={changePwMutation.isPending || !pwForm.currentPassword || !pwForm.newPassword}
                className="btn-primary w-full gap-2"
              >
                {changePwMutation.isPending
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
                  : <><Lock size={15} />Update Password</>}
              </button>
            </div>
          </div>

          {/* Transaction PIN */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border)' }}>
              <KeyRound size={16} className="text-primary-400" />
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {user?.isPinSet ? 'Change Transaction PIN' : 'Set Transaction PIN'}
              </h3>
              {user?.isPinSet && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-success-500/10 text-success-400 border border-success-500/20">
                  Active
                </span>
              )}
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                This 4-digit PIN is required to authorise wallet transfers and sensitive transactions.
              </p>

              {/* PIN dots input */}
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    pin.length > i ? 'border-primary-500' : 'border-dark-600'
                  }`} style={{ background: 'var(--bg-elevated)' }}>
                    {pin[i] ? <span className="w-3 h-3 bg-primary-400 rounded-full" /> : null}
                  </div>
                ))}
              </div>

              {/* Hidden actual input */}
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                className="input text-center text-2xl tracking-[1rem] font-bold"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />

              <button
                onClick={() => {
                  if (pin.length !== 4) return toast.error('PIN must be exactly 4 digits');
                  setPinMutation.mutate();
                }}
                disabled={setPinMutation.isPending || pin.length !== 4}
                className="btn-primary w-full gap-2"
              >
                {setPinMutation.isPending
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Setting PIN...</>
                  : <><KeyRound size={15} />{user?.isPinSet ? 'Update PIN' : 'Set PIN'}</>}
              </button>

              {/* Reset PIN via password */}
              {user?.isPinSet && (
                <div>
                  <button
                    onClick={() => setShowResetPin(!showResetPin)}
                    className="text-xs font-semibold text-primary-400 hover:text-primary-300 underline underline-offset-2"
                  >
                    Forgot PIN? Reset using password
                  </button>

                  {showResetPin && (
                    <div className="mt-3 space-y-3 p-4 rounded-xl border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        Enter your login password to set a new PIN
                      </p>
                      <PasswordInput
                        placeholder="Your login password"
                        value={resetPinForm.password}
                        onChange={(e) => setResetPinForm({ ...resetPinForm, password: e.target.value })}
                      />
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        className="input text-center text-2xl tracking-[1rem] font-bold"
                        placeholder="New 4-digit PIN"
                        value={resetPinForm.newPin}
                        onChange={(e) => setResetPinForm({ ...resetPinForm, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      />
                      <button
                        onClick={() => {
                          if (!resetPinForm.password) return toast.error('Enter your login password');
                          if (resetPinForm.newPin.length !== 4) return toast.error('New PIN must be exactly 4 digits');
                          resetPinMutation.mutate();
                        }}
                        disabled={resetPinMutation.isPending}
                        className="btn-primary w-full gap-2"
                      >
                        {resetPinMutation.isPending
                          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</>
                          : <><KeyRound size={15} />Reset PIN</>}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Security tips */}
          <div className="card p-4" style={{ background: 'rgba(37,99,235,0.05)', borderColor: 'rgba(37,99,235,0.15)' }}>
            <p className="text-xs font-bold text-blue-400 mb-2">Security Tips</p>
            <ul className="space-y-1.5">
              {[
                'Never share your PIN or password with anyone',
                'Use a strong password with letters, numbers and symbols',
                'Log out from devices you no longer use',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <ChevronRight size={12} className="text-blue-400 shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

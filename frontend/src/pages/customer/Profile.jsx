import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authAPI, kycAPI, walletAPI } from '../../api';
import { User, Shield, Lock, KeyRound, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const TABS = ['Profile', 'KYC', 'Security'];

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Profile');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pin, setPin] = useState('');

  const { data: kycStatus } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => kycAPI.getStatus(),
    select: (res) => res.data,
  });

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

  const tier1Mutation = useMutation({
    mutationFn: () => kycAPI.submitTier1(),
    onSuccess: () => { toast.success('Tier 1 KYC completed!'); updateUser({ kycStatus: 'tier1' }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Phone must be verified first'),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><User className="text-primary-400" />My Profile</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile */}
      {activeTab === 'Profile' && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500/30 to-success-500/30 border-2 border-primary-500/30 rounded-full flex items-center justify-center">
              <span className="text-3xl font-black text-primary-400">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-dark-50">{user?.firstName} {user?.lastName}</h2>
              <p className="text-dark-400">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="badge-info capitalize">{user?.role?.replace('_', ' ')}</span>
                <span className={`badge ${user?.isEmailVerified ? 'badge-success' : 'badge-warning'}`}>
                  {user?.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
                </span>
                <span className="badge-gray capitalize">KYC: {user?.kycStatus || 'none'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              ['First Name', user?.firstName],
              ['Last Name', user?.lastName],
              ['Email', user?.email],
              ['Phone', user?.phone],
              ['Referral Code', user?.referralCode],
              ['Wallet Balance', `₦${(user?.walletBalance || 0).toLocaleString()}`],
              ['Member Since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'],
              ['Role', user?.role?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-dark-500 mb-1">{label}</p>
                <p className="text-dark-100 font-medium">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KYC */}
      {activeTab === 'KYC' && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2"><Shield size={18} className="text-primary-400" />KYC Verification</h2>
          <p className="text-dark-400 text-sm">Complete KYC to unlock higher transaction limits and withdrawal features.</p>

          <div className="space-y-3">
            {[
              { tier: 1, label: 'Tier 1 – Phone Verification', desc: 'Verify your phone number', status: kycStatus?.overallStatus === 'none' ? 'pending' : 'completed' },
              { tier: 2, label: 'Tier 2 – ID Verification', desc: 'Upload your national ID, drivers license, or passport', status: kycStatus?.records?.find(r => r.tier === 2)?.status || 'pending' },
              { tier: 3, label: 'Tier 3 – Selfie Verification', desc: 'Take a selfie for face verification', status: kycStatus?.records?.find(r => r.tier === 3)?.status || 'pending' },
            ].map((item) => (
              <div key={item.tier} className="flex items-center justify-between p-4 rounded-xl border border-dark-600">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.status === 'approved' || item.status === 'completed' ? 'bg-success-500/10 text-success-500 border border-success-500/20' : 'bg-dark-700 text-dark-400 border border-dark-600'
                  }`}>
                    {item.status === 'approved' || item.status === 'completed' ? <CheckCircle size={14} /> : item.tier}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-100 text-sm">{item.label}</p>
                    <p className="text-xs text-dark-400">{item.desc}</p>
                  </div>
                </div>
                <span className={`badge text-xs ${
                  item.status === 'approved' || item.status === 'completed' ? 'badge-success' :
                  item.status === 'pending' && item.tier === 1 ? 'badge-gray' : 'badge-warning'
                }`}>{item.status}</span>
              </div>
            ))}
          </div>

          {user?.isPhoneVerified && user?.kycStatus === 'none' && (
            <button onClick={() => tier1Mutation.mutate()} disabled={tier1Mutation.isPending} className="btn-primary">
              Complete Tier 1 KYC
            </button>
          )}
        </div>
      )}

      {/* Security */}
      {activeTab === 'Security' && (
        <div className="space-y-5">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-dark-100 flex items-center gap-2"><Lock size={16} className="text-primary-400" />Change Password</h3>
            <div className="space-y-3">
              <input type="password" className="input" placeholder="Current password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
              <input type="password" className="input" placeholder="New password (min 8 chars)" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
              <input type="password" className="input" placeholder="Confirm new password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            </div>
            <button
              onClick={() => {
                if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
                changePwMutation.mutate();
              }}
              disabled={changePwMutation.isPending}
              className="btn-primary gap-2"
            >
              <Lock size={15} />
              {changePwMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-dark-100 flex items-center gap-2">
              <KeyRound size={16} className="text-primary-400" />
              {user?.isPinSet ? 'Change Transaction PIN' : 'Set Transaction PIN'}
            </h3>
            <p className="text-dark-400 text-sm">This 4-digit PIN is required for wallet transfers.</p>
            <input
              type="password"
              maxLength={4}
              className="input tracking-widest w-40 text-center text-xl font-bold"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            />
            <button
              onClick={() => {
                if (pin.length !== 4) return toast.error('PIN must be exactly 4 digits');
                setPinMutation.mutate();
              }}
              disabled={setPinMutation.isPending || pin.length !== 4}
              className="btn-primary gap-2"
            >
              <KeyRound size={15} />
              {setPinMutation.isPending ? 'Setting...' : 'Set PIN'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

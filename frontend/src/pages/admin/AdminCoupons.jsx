import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponAPI } from '../../api';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-lg transition-colors hover:bg-dark-600"
      title="Copy code"
    >
      {copied ? <Check size={13} className="text-success-400" /> : <Copy size={13} className="text-dark-400" />}
    </button>
  );
}

const EMPTY = { code: '', description: '', amount: '', maxUses: '', expiresAt: '', type: 'money', dataNetwork: '', dataSize: '' };

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => couponAPI.list(),
    select: (res) => res.data?.coupons || [],
  });

  const createMutation = useMutation({
    mutationFn: () => couponAPI.create(form),
    onSuccess: () => {
      toast.success('Coupon created');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setForm(EMPTY);
      setShowForm(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create coupon'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => couponAPI.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
    onError: () => toast.error('Failed to update coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => couponAPI.remove(id),
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const totalRedemptions = coupons.reduce((sum, c) => sum + c.usedCount, 0);
  const totalValue = coupons.reduce((sum, c) => sum + c.usedCount * c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Coupons</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Create and manage promo codes</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary gap-2">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Coupons', value: coupons.length },
          { label: 'Total Redemptions', value: totalRedemptions },
          { label: 'Total Value Given', value: `₦${totalValue.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Create Coupon</h3>

          {/* Coupon type */}
          <div>
            <label className="label">Coupon Type</label>
            <div className="flex gap-2">
              {[{ id: 'money', label: '💰 Money (wallet credit)' }, { id: 'data', label: '📶 Data coupon' }].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setForm({ ...form, type: id })}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    form.type === id
                      ? 'border-primary-500/40 bg-primary-500/10 text-primary-300'
                      : 'border-transparent bg-dark-800 text-dark-400 hover:border-dark-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Code *</label>
              <input
                className="input uppercase"
                placeholder="e.g. BORHS100"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="label">{form.type === 'data' ? 'Wallet Credit Value (₦) *' : 'Amount (₦) *'}</label>
              <input
                type="number"
                className="input"
                placeholder={form.type === 'data' ? 'e.g. 200 (for 200MB data value)' : 'e.g. 500'}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            {form.type === 'data' && (
              <>
                <div>
                  <label className="label">Network</label>
                  <select
                    className="input"
                    value={form.dataNetwork}
                    onChange={(e) => setForm({ ...form, dataNetwork: e.target.value })}
                  >
                    <option value="">Any network</option>
                    {['mtn', 'airtel', 'glo', '9mobile'].map(n => (
                      <option key={n} value={n}>{n.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Data Size</label>
                  <input
                    className="input"
                    placeholder="e.g. 1GB"
                    value={form.dataSize}
                    onChange={(e) => setForm({ ...form, dataSize: e.target.value })}
                  />
                </div>
              </>
            )}

            <div>
              <label className="label">Max Uses (0 = unlimited)</label>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Expires At (optional)</label>
              <input
                type="datetime-local"
                className="input"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="label">Description (optional)</label>
              <input
                className="input"
                placeholder="e.g. Welcome bonus for new users"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate()}
              disabled={!form.code || form.amount === '' || createMutation.isPending}
              className="btn-primary gap-2"
            >
              {createMutation.isPending
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Plus size={14} />}
              Create
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Coupons list */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Tag size={28} className="mx-auto opacity-30" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No coupons yet. Create your first one.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {coupons.map((c) => {
              const expired = c.expiresAt && new Date() > new Date(c.expiresAt);
              const exhausted = c.maxUses > 0 && c.usedCount >= c.maxUses;
              return (
                <div key={c._id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black tracking-widest text-sm" style={{ color: 'var(--text-primary)' }}>
                        {c.code}
                      </span>
                      <CopyButton text={c.code} />
                      {!c.isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold">Inactive</span>
                      )}
                      {expired && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-bold">Expired</span>
                      )}
                      {exhausted && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-bold">Exhausted</span>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{c.description}</p>
                    )}
                    <div className="flex gap-3 mt-1 text-[11px] flex-wrap" style={{ color: 'var(--text-faint)' }}>
                      {c.type === 'data' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold">
                          📶 {c.dataSize || 'Data'}{c.dataNetwork ? ` · ${c.dataNetwork.toUpperCase()}` : ''}
                        </span>
                      ) : null}
                      <span>₦{c.amount.toLocaleString()} credit</span>
                      <span>·</span>
                      <span>{c.usedCount}{c.maxUses > 0 ? `/${c.maxUses}` : ''} uses</span>
                      {c.expiresAt && <><span>·</span><span>Expires {format(new Date(c.expiresAt), 'MMM dd, yyyy')}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleMutation.mutate({ id: c._id, isActive: !c.isActive })}
                      className="p-2 rounded-lg transition-colors hover:bg-dark-600"
                      title={c.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {c.isActive
                        ? <ToggleRight size={20} className="text-success-400" />
                        : <ToggleLeft size={20} className="text-dark-500" />}
                    </button>
                    <button
                      onClick={() => { if (window.confirm('Delete this coupon?')) deleteMutation.mutate(c._id); }}
                      className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 size={15} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

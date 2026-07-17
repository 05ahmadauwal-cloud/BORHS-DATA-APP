import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import {
  Settings, Save, Megaphone, Shield, Wallet, Users, Percent,
  Star, Zap, Phone, Tv, GraduationCap, CreditCard, AlertTriangle,
  ChevronDown, ChevronUp, CheckCircle, ToggleLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

function SectionCard({ icon: Icon, title, subtitle, iconColor = 'text-primary-400', iconBg = 'bg-primary-500/10', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon size={17} className={iconColor} />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</p>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={16} style={{ color: 'var(--text-faint)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-faint)' }} />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, colorOn = 'bg-primary-600' }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${checked ? colorOn : 'bg-dark-600'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function FieldRow({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{hint}</p>}
    </div>
  );
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminAPI.getSettings(),
    select: (res) => res.data.settings,
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: () => adminAPI.updateSettings(form),
    onSuccess: () => {
      toast.success('Settings saved');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const depositChargeType = form.deposit_charge_type || 'none';
  const depositChargeValue = parseFloat(form.deposit_charge_value) || 0;
  const exampleDeposit = 5000;
  const exampleFee = depositChargeType === 'percentage'
    ? Math.round((exampleDeposit * depositChargeValue) / 100 * 100) / 100
    : depositChargeType === 'flat' ? depositChargeValue : 0;
  const exampleCredit = exampleDeposit - exampleFee;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <Settings size={22} className="text-primary-400" /> Platform Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Configure all platform-wide settings</p>
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className={`btn-primary gap-2 shrink-0 transition-all ${saved ? 'bg-success-600' : ''}`}
        >
          {mutation.isPending
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {mutation.isPending ? 'Saving…' : saved ? 'Saved!' : 'Save All'}
        </button>
      </div>

      {/* ── Advert Banner ── */}
      <SectionCard
        icon={Megaphone}
        title="Advert Banner"
        subtitle="Scrolling ticker shown on the customer dashboard"
        iconColor="text-yellow-400"
        iconBg="bg-yellow-500/10"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Enable Banner</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Show scrolling announcement to all users</p>
            </div>
            <ToggleSwitch
              checked={!!form.banner_active}
              onChange={(v) => set('banner_active', v)}
              colorOn="bg-yellow-500"
            />
          </div>
          <FieldRow label="Banner Text">
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="e.g. 🔥 Limited offer! Use code BORHS100 for ₦100 free today!"
              value={form.banner_text || ''}
              onChange={(e) => set('banner_text', e.target.value)}
            />
          </FieldRow>
          <div>
            <label className="label">Banner Color</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'primary', label: 'Blue', cls: 'bg-primary-600' },
                { id: 'yellow', label: 'Yellow', cls: 'bg-yellow-500' },
                { id: 'green', label: 'Green', cls: 'bg-success-500' },
                { id: 'red', label: 'Red', cls: 'bg-red-500' },
              ].map(({ id, label, cls }) => {
                const active = (form.banner_color || 'primary') === id;
                return (
                  <button
                    key={id}
                    onClick={() => set('banner_color', id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      active ? 'border-white/30' : 'border-transparent opacity-50 hover:opacity-75'
                    }`}
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <span className={`w-3 h-3 rounded-full ${cls}`} />
                    {label}
                    {active && <CheckCircle size={11} className="text-success-400" />}
                  </button>
                );
              })}
            </div>
          </div>
          {form.banner_text && (
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[10px] px-2 py-1 font-medium" style={{ background: 'var(--bg-elevated)', color: 'var(--text-faint)' }}>Preview</p>
              <div className={`py-2.5 px-4 ${
                (form.banner_color || 'primary') === 'yellow' ? 'bg-yellow-500/15' :
                (form.banner_color || 'primary') === 'green' ? 'bg-success-500/15' :
                (form.banner_color || 'primary') === 'red' ? 'bg-red-500/15' : 'bg-primary-500/15'
              }`}>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>📢 {form.banner_text}</p>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Maintenance Mode ── */}
      <SectionCard
        icon={AlertTriangle}
        title="Maintenance Mode"
        subtitle="When on, customers see a maintenance page"
        iconColor="text-red-400"
        iconBg="bg-red-500/10"
        defaultOpen={false}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Enable Maintenance Mode</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>All customer actions will be blocked</p>
          </div>
          <ToggleSwitch checked={!!form.maintenance_mode} onChange={(v) => set('maintenance_mode', v)} colorOn="bg-red-500" />
        </div>
      </SectionCard>

      {/* ── Funding Methods ── */}
      <SectionCard
        icon={ToggleLeft}
        title="Funding Methods"
        subtitle="Enable or disable specific wallet top-up channels"
        iconColor="text-blue-400"
        iconBg="bg-blue-500/10"
      >
        <div className="space-y-4">
          {[
            { key: 'funding_bank_transfer', label: 'Bank Transfer (Monnify)', desc: 'Customers pay via dedicated bank account' },
            { key: 'funding_paystack', label: 'Paystack (Card / Transfer)', desc: 'Online payment via Paystack checkout' },
            { key: 'funding_flutterwave', label: 'Flutterwave (Card / Transfer)', desc: 'Online payment via Flutterwave checkout' },
            { key: 'funding_billstack', label: 'Billstack (Bank Transfer)', desc: 'Dedicated virtual account powered by Billstack' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <ToggleSwitch
                checked={key === 'funding_billstack' ? form[key] === true : form[key] !== false}
                onChange={(v) => set(key, v)}
                colorOn="bg-blue-600"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Deposit Charges ── */}
      <SectionCard
        icon={CreditCard}
        title="Deposit Charges"
        subtitle="Fees deducted from customer wallet top-ups"
        iconColor="text-orange-400"
        iconBg="bg-orange-500/10"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Charge Type</label>
            <div className="flex gap-3">
              {[
                { id: 'none', label: 'No Charge' },
                { id: 'percentage', label: 'Percentage (%)' },
                { id: 'flat', label: 'Flat Fee (₦)' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => set('deposit_charge_type', id)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    depositChargeType === id
                      ? 'border-orange-500/40 bg-orange-500/10 text-orange-300'
                      : 'border-transparent bg-dark-800 text-dark-400 hover:border-dark-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {depositChargeType !== 'none' && (
            <FieldRow
              label={depositChargeType === 'percentage' ? 'Charge Rate (%)' : 'Flat Fee Amount (₦)'}
              hint={depositChargeType === 'percentage' ? 'e.g. 1.5 means 1.5% of deposit amount' : 'Fixed amount deducted per deposit'}
            >
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder={depositChargeType === 'percentage' ? '1.5' : '50'}
                value={form.deposit_charge_value || ''}
                onChange={(e) => set('deposit_charge_value', Number(e.target.value))}
              />
            </FieldRow>
          )}
          {depositChargeType !== 'none' && depositChargeValue > 0 && (
            <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Fee Preview — ₦{exampleDeposit.toLocaleString()} deposit</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-faint)' }}>Amount deposited</span>
                  <span style={{ color: 'var(--text-primary)' }}>₦{exampleDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-faint)' }}>Fee deducted</span>
                  <span className="text-orange-400">– ₦{exampleFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold border-t pt-1" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <span>Credited to wallet</span>
                  <span className="text-success-400">₦{exampleCredit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── App Configuration ── */}
      <SectionCard
        icon={Settings}
        title="App Configuration"
        subtitle="Basic platform info and support details"
        iconColor="text-primary-400"
        iconBg="bg-primary-500/10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'app_name', label: 'App Name', type: 'text', placeholder: 'BORHS Data' },
            { key: 'app_tagline', label: 'Tagline', type: 'text', placeholder: 'Nigeria\'s best VTU platform' },
            { key: 'support_email', label: 'Support Email', type: 'email', placeholder: 'support@borhs.com' },
            { key: 'support_phone', label: 'Support Phone', type: 'text', placeholder: '07065896598' },
          ].map(({ key, label, type, placeholder }) => (
            <FieldRow key={key} label={label}>
              <input
                type={type}
                className="input"
                placeholder={placeholder}
                value={form[key] || ''}
                onChange={(e) => set(key, e.target.value)}
              />
            </FieldRow>
          ))}
        </div>
      </SectionCard>

      {/* ── Wallet Limits ── */}
      <SectionCard
        icon={Wallet}
        title="Wallet Limits"
        subtitle="Min and max amounts users can deposit"
        iconColor="text-green-400"
        iconBg="bg-green-500/10"
      >
        <div className="grid grid-cols-2 gap-4">
          <FieldRow label="Minimum Fund Amount (₦)" hint="Smallest single deposit allowed">
            <input
              type="number"
              className="input"
              placeholder="100"
              value={form.min_wallet_fund || ''}
              onChange={(e) => set('min_wallet_fund', Number(e.target.value))}
            />
          </FieldRow>
          <FieldRow label="Maximum Fund Amount (₦)" hint="Largest single deposit allowed">
            <input
              type="number"
              className="input"
              placeholder="500000"
              value={form.max_wallet_fund || ''}
              onChange={(e) => set('max_wallet_fund', Number(e.target.value))}
            />
          </FieldRow>
        </div>
      </SectionCard>

      {/* ── Referral Commission ── */}
      <SectionCard
        icon={Users}
        title="Referral Commission"
        subtitle="Percentage earned per referral level"
        iconColor="text-purple-400"
        iconBg="bg-purple-500/10"
      >
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'referral_level1_percent', label: 'Level 1 (%)' },
            { key: 'referral_level2_percent', label: 'Level 2 (%)' },
            { key: 'referral_level3_percent', label: 'Level 3 (%)' },
          ].map(({ key, label }) => (
            <FieldRow key={key} label={label}>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="input pr-8"
                  placeholder="0"
                  value={form[key] || ''}
                  onChange={(e) => set(key, Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-dark-400">%</span>
              </div>
            </FieldRow>
          ))}
        </div>
      </SectionCard>

      {/* ── Service Commission ── */}
      <SectionCard
        icon={Percent}
        title="Service Commission"
        subtitle="Platform margin earned on each transaction type"
        iconColor="text-teal-400"
        iconBg="bg-teal-500/10"
        defaultOpen={false}
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'data_commission_rate', label: 'Data Commission (%)', icon: Zap },
            { key: 'airtime_commission_rate', label: 'Airtime Commission (%)', icon: Phone },
          ].map(({ key, label, icon: Icon }) => (
            <FieldRow key={key} label={label}>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="input pr-8"
                  placeholder="0"
                  value={form[key] || ''}
                  onChange={(e) => set(key, Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-dark-400">%</span>
              </div>
            </FieldRow>
          ))}
        </div>
      </SectionCard>

      {/* ── Agent Program ── */}
      <SectionCard
        icon={Star}
        title="Agent Program"
        subtitle="Settings for the agent onboarding program"
        iconColor="text-yellow-400"
        iconBg="bg-yellow-500/10"
        defaultOpen={false}
      >
        <FieldRow
          label="Agent Registration Fee (₦)"
          hint="Amount users pay to apply as an agent. Rejected applicants are automatically refunded."
        >
          <input
            type="number"
            className="input"
            placeholder="0"
            value={form.agent_fee || ''}
            onChange={(e) => set('agent_fee', Number(e.target.value))}
          />
        </FieldRow>
      </SectionCard>

      {/* Floating save button hint */}
      <p className="text-xs text-center pb-6" style={{ color: 'var(--text-faint)' }}>
        Remember to click <span className="font-bold" style={{ color: 'var(--text-muted)' }}>Save All</span> after making changes.
      </p>
    </div>
  );
}

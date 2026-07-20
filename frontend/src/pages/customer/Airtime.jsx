import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { airtimeAPI } from '../../api';
import { Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { NetworkButton, NetworkLogo } from '../../components/NetworkLogo';
import Receipt, { PurchaseLoader } from '../../components/ui/Receipt';
import { ServiceHeader } from '../../components/ui';
import { detectNetwork, isPhoneComplete, NETWORK_LABELS } from '../../utils/phoneNetwork';

const NETWORKS = [
  { id: 'mtn', label: 'MTN' },
  { id: 'airtel', label: 'Airtel' },
  { id: 'glo', label: 'Glo' },
  { id: '9mobile', label: '9Mobile' },
];
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function Airtime() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ network: 'mtn', phone: '', amount: '' });
  const [step, setStep] = useState(1);
  const [receipt, setReceipt] = useState(null);
  const [pin, setPin] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const walletBalance = Number(user?.walletBalance) || 0;
  const airtimeAmount = Number(form.amount) || 0;
  const insufficientFunds = airtimeAmount > walletBalance;
  const amountShort = Math.max(0, airtimeAmount - walletBalance);

  const { data: recentRecipients = [] } = useQuery({
    queryKey: ['airtime-recipient-history'],
    queryFn: () => airtimeAPI.getHistory({ limit: 30 }),
    select: (res) => {
      const seen = new Set();
      return (res.data?.data || [])
        .filter((item) => item.status === 'success' && item.phone)
        .filter((item) => {
          if (seen.has(item.phone)) return false;
          seen.add(item.phone);
          return true;
        })
        .slice(0, 5);
    },
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (payload) => airtimeAPI.purchase(payload),
    onSuccess: (res) => {
      const purchase = res.data?.purchase || {};
      updateUser({ walletBalance: Number(user?.walletBalance || 0) - Number(form.amount) });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['airtime-recipient-history'] });
      setReceipt({
        type: 'airtime',
        reference: purchase.reference,
        date: purchase.createdAt || new Date(),
        status: 'success',
        amount: Number(form.amount),
        network: form.network.toUpperCase(),
        phone: form.phone,
      });
      setForm({ network: 'mtn', phone: '', amount: '' });
      setPin('');
      setStep(1);
    },
    onError: (err) => {
      const status = err?.response?.status;
      if (status === 401) {
        const next = pinAttempts + 1;
        setPinAttempts(next);
        if (next >= 3) {
          const until = Date.now() + 5 * 60 * 1000;
          setLockUntil(until);
          toast.error('Too many incorrect PIN attempts. Try again in 5 minutes.');
        } else {
          toast.error('Invalid transaction PIN');
        }
      } else {
        toast.error(err.response?.data?.message || 'Airtime purchase failed');
      }
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PurchaseLoader visible={mutation.isPending} type="airtime" />
      <Receipt data={receipt} onClose={() => setReceipt(null)} />
      <ServiceHeader icon={Phone} title="Buy airtime" description="Top up any Nigerian network instantly." step={step} />

      {step === 1 ? (
        <div className="card p-6 space-y-6">
          <div>
            <label className="label">Select Network</label>
            <div className="grid grid-cols-4 gap-2">
              {NETWORKS.map((n) => (
                <NetworkButton
                  key={n.id}
                  network={n.id}
                  selected={form.network === n.id}
                  onClick={() => setForm({ ...form, network: n.id })}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              className={`input ${isPhoneComplete(form.phone) && detectNetwork(form.phone) && detectNetwork(form.phone) !== form.network ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}`}
              placeholder="08012345678"
              value={form.phone}
              onChange={(e) => {
                const val = e.target.value;
                const detected = detectNetwork(val);
                if (detected && detected !== form.network) {
                  setForm({ ...form, phone: val, network: detected });
                  toast.success(`Network switched to ${NETWORK_LABELS[detected]}`, { icon: '📱', duration: 2500 });
                } else {
                  setForm({ ...form, phone: val });
                }
              }}
            />
            {recentRecipients.some((recipient) => !form.phone || recipient.phone.includes(form.phone)) && form.phone.length < 11 && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Recent recipients</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recentRecipients.filter((recipient) => !form.phone || recipient.phone.includes(form.phone)).map((recipient) => (
                    <button
                      key={recipient.phone}
                      type="button"
                      onClick={() => setForm({ ...form, phone: recipient.phone, network: recipient.network || form.network })}
                      className="shrink-0 px-3 py-2 rounded-xl border text-left transition-colors hover:border-primary-500/50"
                      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                    >
                      <span className="block text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{recipient.phone}</span>
                      <span className="block text-[10px] uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>{recipient.network}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Detection badge */}
            {isPhoneComplete(form.phone) && (
              <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-medium ${
                detectNetwork(form.phone) && detectNetwork(form.phone) !== form.network
                  ? 'text-red-400'
                  : detectNetwork(form.phone) ? 'text-success-500' : 'text-dark-500'
              }`}>
                {detectNetwork(form.phone) ? (
                  detectNetwork(form.phone) === form.network ? (
                    <><CheckCircle size={12} /><span><strong>{NETWORK_LABELS[form.network]}</strong> number confirmed</span></>
                  ) : (
                    <><AlertTriangle size={12} /><span>Detected <strong>{NETWORK_LABELS[detectNetwork(form.phone)]}</strong> — switching network</span></>
                  )
                ) : (
                  <span>Network could not be auto-detected</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="label">Amount (₦)</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setForm({ ...form, amount: String(amt) })}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    form.amount === String(amt) ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-dark-600 text-dark-400 hover:border-dark-500'
                  }`}
                >
                  ₦{amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input"
              placeholder="Or enter custom amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <p className="text-xs text-dark-500 mt-1">Balance: ₦{(Number(user?.walletBalance) || 0).toLocaleString()}</p>
            {insufficientFunds && (
              <div className="flex items-start gap-2 mt-3 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs font-semibold">
                  Insufficient funds. Add ₦{amountShort.toLocaleString()} to your wallet to buy this airtime.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (!form.phone) return toast.error('Enter phone number');
              if (!form.amount || Number(form.amount) < 100) return toast.error('Minimum amount is ₦100');
              if (insufficientFunds) return toast.error(`Insufficient funds. You need ₦${amountShort.toLocaleString()} more.`);
              const detected = detectNetwork(form.phone);
              if (isPhoneComplete(form.phone) && detected && detected !== form.network) {
                return toast.error(`This number belongs to ${NETWORK_LABELS[detected]}, not ${NETWORK_LABELS[form.network]}. Please correct the selection.`, { duration: 5000 });
              }
              setStep(2);
            }}
            disabled={!form.phone || !form.amount || Number(form.amount) < 100 || insufficientFunds}
            className="btn-primary w-full btn-lg"
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-bold text-dark-100">Confirm Purchase</h2>
          <div className="bg-dark-700/50 rounded-xl p-5 space-y-3">
            {[
              ['Network', <NetworkLogo key="net" network={form.network} size="sm" />],
              ['Phone', form.phone],
              ['Amount', `₦${Number(form.amount).toLocaleString()}`],
              ['New Balance', `₦${(Number(user?.walletBalance || 0) - Number(form.amount)).toLocaleString()}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-dark-400">{k}</span>
                <span className={`font-semibold ${k === 'Amount' ? 'text-green-400' : 'text-dark-100'}`}>{v}</span>
              </div>
            ))}
          </div>
            <div className="space-y-3">
              <div>
                <label className="label">Transaction PIN</label>
                <input className="input text-center tracking-[0.4em]" type="password" inputMode="numeric" autoComplete="off" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} disabled={lockUntil && Date.now() < lockUntil} />
                {lockUntil && Date.now() < lockUntil && <p className="text-xs text-red-400 mt-1">Locked due to multiple failed attempts.</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button
                  onClick={() => {
                    if (lockUntil && Date.now() < lockUntil) return toast.error('Locked due to multiple failed attempts');
                    if (Number(form.amount) > (Number(user?.walletBalance) || 0)) return toast.error('Insufficient funds. Please fund your wallet and try again.');
                    if (!/^[0-9]{4}$/.test(pin)) return toast.error('Enter a valid 4-digit PIN');
                    mutation.mutate({ ...form, pin });
                  }}
                  disabled={mutation.isPending}
                  className="btn-primary flex-1"
                >
                  {mutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Buy Airtime'}
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}

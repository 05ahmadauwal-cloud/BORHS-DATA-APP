import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { electricityAPI } from '../../api';
import { Zap, CheckCircle, Copy, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Receipt, { PurchaseLoader } from '../../components/ui/Receipt';
import { ServiceHeader } from '../../components/ui';

const PROVIDERS = [
  { id: 'ikedc', label: 'IKEDC', full: 'Ikeja Electric' },
  { id: 'ekedc', label: 'EKEDC', full: 'Eko Electric' },
  { id: 'aedc', label: 'AEDC', full: 'Abuja Electric' },
  { id: 'kedco', label: 'KEDCO', full: 'Kano Electric' },
  { id: 'jed', label: 'JED', full: 'Jos Electric' },
  { id: 'phed', label: 'PHED', full: 'Port Harcourt Electric' },
];

export default function Electricity() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ provider: 'ikedc', meterNumber: '', meterType: 'prepaid', amount: '', phone: '' });
  const [customerInfo, setCustomerInfo] = useState(null);
  const [step, setStep] = useState(1);
  const [result, setResult] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [pin, setPin] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);

  const verifyMutation = useMutation({
    mutationFn: () => electricityAPI.verifyMeter({ provider: form.provider, meterNumber: form.meterNumber, meterType: form.meterType }),
    onSuccess: (res) => {
      setCustomerInfo(res.data.customer);
      setStep(2);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Meter verification failed'),
  });

  const purchaseMutation = useMutation({
    mutationFn: (payload) => electricityAPI.purchase(payload),
    onSuccess: (res) => {
      const p = res.data.purchase;
      setResult(p);
      updateUser({ walletBalance: Number(user?.walletBalance || 0) - Number(form.amount) });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      setReceipt({
        type: 'electricity',
        reference: p.reference,
        date: p.createdAt || new Date(),
        status: 'success',
        amount: Number(form.amount),
        provider: form.provider.toUpperCase(),
        meterNumber: form.meterNumber,
        meterType: form.meterType,
        customerName: customerInfo?.customerName,
        token: p.token,
        units: p.units,
      });
      setStep(4);
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
        toast.error(err.response?.data?.message || 'Purchase failed');
      }
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PurchaseLoader visible={purchaseMutation.isPending} type="electricity" />
      <Receipt data={receipt} onClose={() => setReceipt(null)} />
      <ServiceHeader icon={Zap} title="Electricity" description="Verify your meter and pay securely." step={step === 1 ? 1 : 2} />

      {step <= 3 && (
        <div className="card p-6 space-y-6">
          {/* Step 1: Select Provider & Meter */}
          <div>
            <label className="label">Distribution Company</label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setForm({ ...form, provider: p.id })}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    form.provider === p.id ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-600 text-dark-400 hover:border-dark-500'
                  }`}
                >
                  <p className="font-bold">{p.label}</p>
                  <p className="text-dark-500 font-normal text-xs truncate">{p.full}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Meter Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['prepaid', 'postpaid'].map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, meterType: t })}
                  className={`py-3 rounded-xl border text-sm font-semibold capitalize transition-all ${
                    form.meterType === t ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-600 text-dark-400 hover:border-dark-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Meter Number</label>
            <input
              className="input"
              placeholder="Enter meter number"
              value={form.meterNumber}
              onChange={(e) => setForm({ ...form, meterNumber: e.target.value })}
            />
          </div>

          {customerInfo && step === 2 && (
            <div className="bg-success-500/10 border border-success-500/20 rounded-xl p-4">
              <p className="text-success-500 font-semibold text-sm flex items-center gap-2 mb-2"><CheckCircle size={14} /> Meter Verified</p>
              <p className="text-dark-100 font-medium">{customerInfo.customerName}</p>
              {customerInfo.customerAddress && <p className="text-dark-400 text-xs mt-1">{customerInfo.customerAddress}</p>}
            </div>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="label">Amount (₦)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Min ₦500"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
                <p className="text-xs text-dark-500 mt-1">Balance: ₦{(Number(user?.walletBalance) || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="label">Phone (for token delivery)</label>
                <input
                  className="input"
                  placeholder="08012345678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </>
          )}

          {step === 1 ? (
            <button
              onClick={() => verifyMutation.mutate()}
              disabled={!form.meterNumber || verifyMutation.isPending}
              className="btn-primary w-full btn-lg"
            >
              {verifyMutation.isPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Meter'}
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="label">Transaction PIN</label>
                <input className="input text-center tracking-[0.4em]" type="password" inputMode="numeric" autoComplete="off" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} disabled={lockUntil && Date.now() < lockUntil} />
              {lockUntil && Date.now() < lockUntil && <p className="text-xs text-red-400 mt-1">Locked due to multiple failed attempts.</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setStep(1); setCustomerInfo(null); }} className="btn-secondary flex-1">Back</button>
                <button
                  onClick={() => {
                    if (lockUntil && Date.now() < lockUntil) return toast.error('Locked due to multiple failed attempts');
                    if (!/^[0-9]{4}$/.test(pin)) return toast.error('Enter a valid 4-digit PIN');
                    purchaseMutation.mutate({ ...form, pin });
                  }}
                  disabled={!form.amount || Number(form.amount) < 500 || purchaseMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {purchaseMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Buy Units'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 4 && result && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-success-500/10 border border-success-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-success-500" />
          </div>
          <h2 className="text-xl font-bold text-dark-50 mb-2">Payment Successful!</h2>
          {result.token && (
            <div className="bg-dark-700 rounded-xl p-4 my-4">
              <p className="text-xs text-dark-400 mb-1">Electricity Token</p>
              <p className="text-2xl font-black text-success-500 tracking-widest font-mono">{result.token}</p>
              <button
                onClick={() => { navigator.clipboard.writeText(result.token); toast.success('Token copied!'); }}
                className="btn-ghost btn-sm mt-3 gap-1"
              >
                <Copy size={12} /> Copy Token
              </button>
            </div>
          )}
          {result.units && <p className="text-dark-300 text-sm">{result.units} units</p>}
          <div className="flex gap-3 mt-6 justify-center">
            <button onClick={() => setReceipt({ type: 'electricity', reference: result.reference, date: result.createdAt || new Date(), status: 'success', amount: Number(form.amount), provider: form.provider.toUpperCase(), meterNumber: form.meterNumber, meterType: form.meterType, customerName: customerInfo?.customerName, token: result.token, units: result.units })} className="btn-secondary gap-2">
              <Printer size={14} /> Receipt
            </button>
            <button onClick={() => { setStep(1); setResult(null); setForm({ provider: 'ikedc', meterNumber: '', meterType: 'prepaid', amount: '', phone: '' }); }} className="btn-secondary">
              New Purchase
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

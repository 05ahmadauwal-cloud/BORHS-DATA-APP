import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { airtimeAPI } from '../../api';
import { Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const NETWORKS = [
  { id: 'mtn', label: 'MTN', emoji: '🟡' },
  { id: 'airtel', label: 'Airtel', emoji: '🔴' },
  { id: 'glo', label: 'Glo', emoji: '🟢' },
  { id: '9mobile', label: '9Mobile', emoji: '🟩' },
];
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function Airtime() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ network: 'mtn', phone: '', amount: '' });
  const [step, setStep] = useState(1);

  const mutation = useMutation({
    mutationFn: () => airtimeAPI.purchase(form),
    onSuccess: () => {
      toast.success(`₦${form.amount} ${form.network.toUpperCase()} airtime sent to ${form.phone}!`);
      updateUser({ walletBalance: user.walletBalance - Number(form.amount) });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      setForm({ network: 'mtn', phone: '', amount: '' });
      setStep(1);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Airtime purchase failed'),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><Phone className="text-green-400" />Buy Airtime</h1>
        <p className="page-subtitle">Top up any Nigerian network instantly</p>
      </div>

      {step === 1 ? (
        <div className="card p-6 space-y-6">
          <div>
            <label className="label">Select Network</label>
            <div className="grid grid-cols-4 gap-2">
              {NETWORKS.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setForm({ ...form, network: n.id })}
                  className={`py-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-1 ${
                    form.network === n.id ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-dark-600 text-dark-400 hover:border-dark-500'
                  }`}
                >
                  <span className="text-xl">{n.emoji}</span>
                  <span>{n.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              className="input"
              placeholder="08012345678"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
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
            <p className="text-xs text-dark-500 mt-1">Balance: ₦{(user?.walletBalance || 0).toLocaleString()}</p>
          </div>

          <button
            onClick={() => {
              if (!form.phone) return toast.error('Enter phone number');
              if (!form.amount || Number(form.amount) < 100) return toast.error('Minimum amount is ₦100');
              setStep(2);
            }}
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
              ['Network', form.network.toUpperCase()],
              ['Phone', form.phone],
              ['Amount', `₦${Number(form.amount).toLocaleString()}`],
              ['New Balance', `₦${((user?.walletBalance || 0) - Number(form.amount)).toLocaleString()}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-dark-400">{k}</span>
                <span className={`font-semibold ${k === 'Amount' ? 'text-green-400' : 'text-dark-100'}`}>{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="btn-primary flex-1"
            >
              {mutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Buy Airtime'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

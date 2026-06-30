import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { educationAPI } from '../../api';
import { GraduationCap, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const EXAMS = [
  { id: 'waec', label: 'WAEC', desc: 'West African Examinations Council' },
  { id: 'neco', label: 'NECO', desc: 'National Examinations Council' },
  { id: 'nabteb', label: 'NABTEB', desc: 'National Business & Technical Examinations' },
  { id: 'jamb', label: 'JAMB', desc: 'Joint Admissions & Matriculation Board' },
];

export default function Education() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [examType, setExamType] = useState('waec');
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState(null);

  const { data: prices } = useQuery({
    queryKey: ['exam-prices'],
    queryFn: () => educationAPI.getPrices(),
    select: (res) => res.data.prices,
  });

  const mutation = useMutation({
    mutationFn: () => educationAPI.purchase({ examType, quantity }),
    onSuccess: (res) => {
      setResult(res.data.purchase);
      const cost = (prices?.[examType] || 0) * quantity;
      updateUser({ walletBalance: user.walletBalance - cost });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Purchase failed'),
  });

  const selectedExam = EXAMS.find((e) => e.id === examType);
  const unitPrice = prices?.[examType] || 0;
  const total = unitPrice * quantity;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><GraduationCap className="text-red-400" />Exam PINs</h1>
        <p className="page-subtitle">Purchase WAEC, NECO, NABTEB, and JAMB e-PINs</p>
      </div>

      {!result ? (
        <div className="card p-6 space-y-6">
          <div>
            <label className="label">Exam Type</label>
            <div className="grid grid-cols-2 gap-3">
              {EXAMS.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => setExamType(exam.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    examType === exam.id ? 'border-red-500 bg-red-500/10' : 'border-dark-600 hover:border-dark-500'
                  }`}
                >
                  <p className={`font-bold text-sm ${examType === exam.id ? 'text-red-300' : 'text-dark-100'}`}>{exam.label}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{exam.desc}</p>
                  {prices?.[exam.id] && (
                    <p className="text-sm font-black text-primary-400 mt-1">₦{prices[exam.id].toLocaleString()}/pin</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Quantity (1–10)</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl bg-dark-700 text-dark-100 font-bold text-lg hover:bg-dark-600 transition-colors">−</button>
              <span className="text-2xl font-black text-dark-50 w-12 text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-10 h-10 rounded-xl bg-dark-700 text-dark-100 font-bold text-lg hover:bg-dark-600 transition-colors">+</button>
            </div>
          </div>

          <div className="bg-dark-700/50 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-dark-400">Unit Price</span>
              <span className="text-dark-200">₦{unitPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-dark-400">Quantity</span>
              <span className="text-dark-200">× {quantity}</span>
            </div>
            <div className="flex justify-between font-bold mt-2 pt-2 border-t border-dark-600">
              <span className="text-dark-100">Total</span>
              <span className="text-primary-400">₦{total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-dark-500 mt-1">Balance after: ₦{((user?.walletBalance || 0) - total).toLocaleString()}</p>
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || total > (user?.walletBalance || 0)}
            className="btn-primary w-full btn-lg"
          >
            {mutation.isPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : `Purchase ${quantity} ${selectedExam?.label} PIN${quantity > 1 ? 's' : ''}`}
          </button>
          {total > (user?.walletBalance || 0) && (
            <p className="text-red-400 text-xs text-center">Insufficient balance. Please fund your wallet.</p>
          )}
        </div>
      ) : (
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-success-500/10 border border-success-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={32} className="text-success-500" />
            </div>
            <h2 className="text-xl font-bold text-dark-50">PINs Generated!</h2>
            <p className="text-dark-400 text-sm mt-1">{result.pins?.length} {examType.toUpperCase()} PIN(s) purchased</p>
          </div>

          <div className="space-y-3">
            {result.pins?.map((pin, i) => (
              <div key={i} className="bg-dark-700 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-dark-400 mb-1">Serial: {pin.serial}</p>
                  <p className="font-black text-success-500 text-lg font-mono tracking-widest">{pin.pin}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(pin.pin); toast.success('PIN copied!'); }}
                  className="btn-ghost btn-sm gap-1"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            ))}
          </div>

          <button onClick={() => setResult(null)} className="btn-secondary w-full mt-6">Buy More PINs</button>
        </div>
      )}
    </div>
  );
}

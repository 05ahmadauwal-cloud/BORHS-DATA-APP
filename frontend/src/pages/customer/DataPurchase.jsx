import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataAPI } from '../../api';
import { Wifi, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const NETWORKS = [
  { id: 'mtn', label: 'MTN', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  { id: 'airtel', label: 'Airtel', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  { id: 'glo', label: 'Glo', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  { id: '9mobile', label: '9Mobile', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
];
const DATA_TYPES = ['sme', 'corporate', 'gifting', 'direct'];

export default function DataPurchase() {
  const { user, updateUser } = useAuthStore();
  const [network, setNetwork] = useState('mtn');
  const [dataType, setDataType] = useState('sme');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['data-plans', network, dataType],
    queryFn: () => dataAPI.getPlans({ network, dataType }),
    select: (res) => res.data.plans,
  });

  const purchaseMutation = useMutation({
    mutationFn: () => dataAPI.purchase({ network, planId: selectedPlan.planId, phone, dataType }),
    onSuccess: (res) => {
      toast.success(`${selectedPlan.dataSize} data sent to ${phone}!`);
      updateUser({ walletBalance: user.walletBalance - selectedPlan.sellingPrice });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      setStep(1);
      setSelectedPlan(null);
      setPhone('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Purchase failed'),
  });

  const handleProceed = () => {
    if (!selectedPlan) return toast.error('Please select a data plan');
    if (!phone) return toast.error('Please enter a phone number');
    setStep(2);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><Wifi className="text-primary-400" />Buy Data</h1>
        <p className="page-subtitle">SME, Corporate, Gifting & Direct data bundles at the cheapest rates</p>
      </div>

      {step === 1 ? (
        <div className="card p-6 space-y-6">
          {/* Network */}
          <div>
            <label className="label">Select Network</label>
            <div className="grid grid-cols-4 gap-2">
              {NETWORKS.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { setNetwork(n.id); setSelectedPlan(null); }}
                  className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                    network === n.id ? `${n.bg} ${n.color}` : 'border-dark-600 text-dark-400 hover:border-dark-500'
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Type */}
          <div>
            <label className="label">Data Type</label>
            <div className="flex gap-2 flex-wrap">
              {DATA_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => { setDataType(t); setSelectedPlan(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    dataType === t ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30' : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Plans */}
          <div>
            <label className="label">Select Plan</label>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 bg-dark-700 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : plans?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan._id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedPlan?._id === plan._id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-600 hover:border-dark-500 hover:bg-dark-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="badge-info text-xs">{plan.dataSize}</span>
                      {selectedPlan?._id === plan._id && <CheckCircle size={14} className="text-primary-400" />}
                    </div>
                    <p className="font-bold text-dark-100 text-sm">{plan.name}</p>
                    <p className="text-xl font-black text-primary-400">₦{plan.sellingPrice.toLocaleString()}</p>
                    {plan.validity && <p className="text-xs text-dark-500">{plan.validity}</p>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dark-400 text-sm">No plans available for this selection</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="label">Phone Number</label>
            <input
              className="input"
              placeholder="Enter recipient phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-dark-500 mt-1">
              Your balance: ₦{(user?.walletBalance || 0).toLocaleString()}
              {selectedPlan && <span className="text-primary-400 ml-2">· Cost: ₦{selectedPlan.sellingPrice.toLocaleString()}</span>}
            </p>
          </div>

          <button onClick={handleProceed} disabled={!selectedPlan || !phone} className="btn-primary w-full btn-lg">
            Continue
          </button>
        </div>
      ) : (
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-bold text-dark-100">Confirm Purchase</h2>
          <div className="bg-dark-700/50 rounded-xl p-5 space-y-3">
            {[
              ['Network', network.toUpperCase()],
              ['Plan', `${selectedPlan.dataSize} - ${selectedPlan.name}`],
              ['Validity', selectedPlan.validity || 'N/A'],
              ['Phone', phone],
              ['Amount', `₦${selectedPlan.sellingPrice.toLocaleString()}`],
              ['New Balance', `₦${((user?.walletBalance || 0) - selectedPlan.sellingPrice).toLocaleString()}`],
            ].map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-dark-400">{key}</span>
                <span className={`font-semibold ${key === 'Amount' ? 'text-primary-400' : 'text-dark-100'}`}>{val}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button
              onClick={() => purchaseMutation.mutate()}
              disabled={purchaseMutation.isPending}
              className="btn-primary flex-1 gap-2"
            >
              {purchaseMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {purchaseMutation.isPending ? 'Processing...' : 'Confirm Purchase'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

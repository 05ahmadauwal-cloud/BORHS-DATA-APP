import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataAPI } from '../../api';
import { Wifi, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { NetworkButton, NetworkLogo } from '../../components/NetworkLogo';
import Receipt, { PurchaseLoader } from '../../components/ui/Receipt';
import { detectNetwork, isPhoneComplete, NETWORK_LABELS } from '../../utils/phoneNetwork';

const NETWORKS = [
  { id: 'mtn', label: 'MTN' },
  { id: 'airtel', label: 'Airtel' },
  { id: 'glo', label: 'Glo' },
  { id: '9mobile', label: '9Mobile' },
];
const DATA_TYPES = ['sme', 'corporate', 'gifting', 'direct'];

export default function DataPurchase() {
  const { user, updateUser } = useAuthStore();
  const [network, setNetwork] = useState('mtn');
  const [dataType, setDataType] = useState('sme');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1);
  const [receipt, setReceipt] = useState(null);
  const [pin, setPin] = useState('');
  const [pinAttempts, setPinAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const queryClient = useQueryClient();

  const effectivePrice = (plan) =>
    user?.role === 'agent' && plan.agentPrice ? plan.agentPrice : plan.sellingPrice;

  const { data: plans, isLoading } = useQuery({
    queryKey: ['data-plans', network, dataType],
    queryFn: () => dataAPI.getPlans({ network, dataType }),
    select: (res) => res.data.plans,
  });

  const purchaseMutation = useMutation({
    mutationFn: (payload) => dataAPI.purchase(payload),
    onSuccess: (res) => {
      const purchase = res.data?.purchase || {};
      updateUser({ walletBalance: Number(user?.walletBalance || 0) - effectivePrice(selectedPlan) });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      setReceipt({
        type: 'data',
        reference: purchase.reference,
        date: purchase.createdAt || new Date(),
        status: 'success',
        amount: effectivePrice(selectedPlan),
        network: network.toUpperCase(),
        phone,
        dataSize: selectedPlan.dataSize,
        planName: selectedPlan.name,
        validity: selectedPlan.validity,
        dataType: dataType.toUpperCase(),
      });
      setStep(1);
      setSelectedPlan(null);
      setPhone('');
      setPin('');
    },
    onError: (err) => {
      const status = err?.response?.status;
      if (status === 401) {
        const next = pinAttempts + 1;
        setPinAttempts(next);
        if (next >= 3) {
          const until = Date.now() + 5 * 60 * 1000; // 5 minutes
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

  const detectedNetwork = detectNetwork(phone);
  const phoneComplete = isPhoneComplete(phone);
  const networkMismatch = phoneComplete && detectedNetwork && detectedNetwork !== network;

  const handleProceed = () => {
    if (!selectedPlan) return toast.error('Please select a data plan');
    if (!phone) return toast.error('Please enter a phone number');
    if (networkMismatch) {
      return toast.error(
        `This number belongs to ${NETWORK_LABELS[detectedNetwork]}, but you selected ${NETWORK_LABELS[network]}. Please correct the network or phone number.`,
        { duration: 5000 }
      );
    }
    setStep(2);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PurchaseLoader visible={purchaseMutation.isPending} type="data" />
      <Receipt data={receipt} onClose={() => setReceipt(null)} />
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
                <NetworkButton
                  key={n.id}
                  network={n.id}
                  selected={network === n.id}
                  onClick={() => { setNetwork(n.id); setSelectedPlan(null); }}
                />
              ))}
            </div>
          </div>

          {/* Data Type */}
          <div>
            <label className="label">Data Type</label>
            <div className="hidden md:flex gap-2 flex-wrap">
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
            <div className="md:hidden">
              <select
                className="input w-full"
                value={dataType}
                onChange={(e) => { setDataType(e.target.value); setSelectedPlan(null); }}
              >
                {DATA_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
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
              <>
                <div className="hidden md:grid grid-cols-2 md:grid-cols-3 gap-3">
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
                      <p className="text-xl font-black text-primary-400">₦{effectivePrice(plan).toLocaleString()}</p>
                      {plan.validity && <p className="text-xs text-dark-500">{plan.validity}</p>}
                    </button>
                  ))}
                </div>
                <div className="md:hidden">
                  <select
                    className="input w-full"
                    value={selectedPlan?._id || ''}
                    onChange={(e) => {
                      const plan = plans.find((item) => item._id === e.target.value);
                      setSelectedPlan(plan || null);
                    }}
                  >
                    <option value="" disabled>Select a plan</option>
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {`${plan.dataSize} - ${plan.name} · ₦${effectivePrice(plan).toLocaleString()}`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-dark-400 text-sm">No plans available for this selection</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="label">Phone Number</label>
            <input
              className={`input ${networkMismatch ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}`}
              placeholder="Enter recipient phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {/* Network detection feedback */}
            {phoneComplete && (
              <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-medium ${networkMismatch ? 'text-red-400' : 'text-success-500'}`}>
                {networkMismatch ? (
                  <>
                    <AlertTriangle size={12} />
                    <span>Number belongs to <strong>{NETWORK_LABELS[detectedNetwork]}</strong> — you selected <strong>{NETWORK_LABELS[network]}</strong></span>
                  </>
                ) : detectedNetwork ? (
                  <>
                    <CheckCircle size={12} />
                    <span><strong>{NETWORK_LABELS[detectedNetwork]}</strong> number confirmed</span>
                  </>
                ) : (
                  <span className="text-dark-500">Network could not be auto-detected</span>
                )}
              </div>
            )}
            <p className="text-xs text-dark-500 mt-1">
              Your balance: ₦{(user?.walletBalance || 0).toLocaleString()}
              {selectedPlan && <span className="text-primary-400 ml-2">· Cost: ₦{effectivePrice(selectedPlan).toLocaleString()}</span>}
            </p>
          </div>

          <button onClick={handleProceed} disabled={!selectedPlan || !phone || networkMismatch} className="btn-primary w-full btn-lg">
            Continue
          </button>
        </div>
      ) : (
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-bold text-dark-100">Confirm Purchase</h2>
          <div className="bg-dark-700/50 rounded-xl p-5 space-y-3">
            {[
              ['Network', <NetworkLogo key="net" network={network} size="sm" />],
              ['Plan', `${selectedPlan.dataSize} - ${selectedPlan.name}`],
              ['Validity', selectedPlan.validity || 'N/A'],
              ['Phone', phone],
              ['Amount', `₦${effectivePrice(selectedPlan).toLocaleString()}`],
              ['New Balance', `₦${(Number(user?.walletBalance || 0) - effectivePrice(selectedPlan)).toLocaleString()}`],
            ].map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-dark-400">{key}</span>
                <span className={`font-semibold ${key === 'Amount' ? 'text-primary-400' : 'text-dark-100'}`}>{val}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <div className="space-y-3">
              <div>
                <label className="label">Transaction PIN</label>
                <input
                  className="input"
                  placeholder="Enter 4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  disabled={lockUntil && Date.now() < lockUntil}
                />
                {lockUntil && Date.now() < lockUntil && (
                  <p className="text-xs text-red-400 mt-1">Locked due to multiple failed attempts. Try again later.</p>
                )}
              </div>
              <button
                onClick={() => {
                  if (lockUntil && Date.now() < lockUntil) return toast.error('Locked due to multiple failed attempts');
                  if (!/^[0-9]{4}$/.test(pin)) return toast.error('Enter a valid 4-digit PIN');
                  purchaseMutation.mutate({ network, planId: selectedPlan.planId, phone, dataType, pin });
                }}
                disabled={purchaseMutation.isPending}
                className="btn-primary flex-1 gap-2"
              >
                {purchaseMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {purchaseMutation.isPending ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

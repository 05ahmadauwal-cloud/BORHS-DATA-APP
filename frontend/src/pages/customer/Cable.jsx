import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cableAPI } from '../../api';
import { Tv, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Receipt, { PurchaseLoader } from '../../components/ui/Receipt';

const PROVIDERS = [
  { id: 'dstv', label: 'DStv', emoji: '📡' },
  { id: 'gotv', label: 'GOtv', emoji: '📺' },
  { id: 'startimes', label: 'StarTimes', emoji: '⭐' },
];

export default function Cable() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState('dstv');
  const [smartCard, setSmartCard] = useState('');
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [step, setStep] = useState(1);
  const [receipt, setReceipt] = useState(null);

  const { data: packages } = useQuery({
    queryKey: ['cable-packages', provider],
    queryFn: () => cableAPI.getPackages(provider),
    select: (res) => res.data.packages,
  });

  const verifyMutation = useMutation({
    mutationFn: () => cableAPI.verifySmartCard({ provider, smartCardNumber: smartCard }),
    onSuccess: (res) => { setCustomerInfo(res.data.customer); setStep(2); },
    onError: (err) => toast.error(err.response?.data?.message || 'Smart card verification failed'),
  });

  const purchaseMutation = useMutation({
    mutationFn: () => cableAPI.purchase({ provider, smartCardNumber: smartCard, packageId: selectedPkg.id }),
    onSuccess: (res) => {
      const purchase = res.data?.purchase || {};
      updateUser({ walletBalance: Number(user?.walletBalance || 0) - Number(selectedPkg.amount) });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      setReceipt({
        type: 'cable',
        reference: purchase.reference,
        date: purchase.createdAt || new Date(),
        status: 'success',
        amount: selectedPkg.amount,
        provider: provider.toUpperCase(),
        smartCardNumber: smartCard,
        customerName: customerInfo?.customerName,
        packageName: selectedPkg.name,
      });
      setStep(1); setSmartCard(''); setSelectedPkg(null); setCustomerInfo(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Subscription failed'),
  });

  const pkgList = Array.isArray(packages) ? packages : packages?.[provider] || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PurchaseLoader visible={purchaseMutation.isPending} type="cable" />
      <Receipt data={receipt} onClose={() => setReceipt(null)} />
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3"><Tv className="text-purple-400" />Cable TV</h1>
        <p className="page-subtitle">Subscribe to DStv, GOtv & StarTimes instantly</p>
      </div>

      <div className="card p-6 space-y-6">
        <div>
          <label className="label">Provider</label>
          <div className="grid grid-cols-3 gap-3">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setProvider(p.id); setSelectedPkg(null); }}
                className={`py-4 rounded-xl border text-sm font-bold flex flex-col items-center gap-1 transition-all ${
                  provider === p.id ? 'border-purple-500 bg-purple-500/10 text-purple-300' : 'border-dark-600 text-dark-400 hover:border-dark-500'
                }`}
              >
                <span className="text-2xl">{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Smart Card / Decoder Number</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Enter smart card number"
              value={smartCard}
              onChange={(e) => setSmartCard(e.target.value)}
            />
            <button
              onClick={() => verifyMutation.mutate()}
              disabled={!smartCard || verifyMutation.isPending}
              className="btn-secondary px-5 shrink-0"
            >
              {verifyMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify'}
            </button>
          </div>
          {customerInfo && (
            <div className="mt-2 bg-success-500/10 border border-success-500/20 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-success-500" />
              <span className="text-dark-100 text-sm font-medium">{customerInfo.customerName}</span>
            </div>
          )}
        </div>

        {step >= 2 && (
          <div>
            <label className="label">Select Package</label>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {pkgList.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    selectedPkg?.id === pkg.id ? 'border-purple-500 bg-purple-500/10' : 'border-dark-600 hover:border-dark-500 hover:bg-dark-700/30'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-dark-100 text-sm">{pkg.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-purple-400">₦{pkg.amount.toLocaleString()}</p>
                    {selectedPkg?.id === pkg.id && <CheckCircle size={14} className="text-purple-400 mt-1 ml-auto" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step >= 2 && selectedPkg && (
          <button
            onClick={() => purchaseMutation.mutate()}
            disabled={purchaseMutation.isPending}
            className="btn-primary w-full btn-lg"
          >
            {purchaseMutation.isPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : `Subscribe - ₦${selectedPkg.amount.toLocaleString()}`}
          </button>
        )}
      </div>
    </div>
  );
}

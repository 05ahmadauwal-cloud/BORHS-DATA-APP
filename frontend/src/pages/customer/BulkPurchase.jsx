import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ListPlus, Wifi, Phone, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { airtimeAPI, dataAPI, purchaseToolsAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import { NetworkButton } from '../../components/NetworkLogo';
import { AutoRenewalOption, PaymentSourceSelect, ServiceHeader } from '../../components/ui';
import { detectNetwork, NETWORK_LABELS } from '../../utils/phoneNetwork';

const NETWORKS = ['mtn', 'airtel', 'glo', '9mobile'];
const DATA_TYPES = ['sme', 'corporate', 'gifting', 'direct'];
const REQUEST_BATCH_SIZE = 20;

function parsePhones(value) {
  return [...new Set(value.split(/[\s,;]+/).map((phone) => phone.replace(/\D/g, '')).filter(Boolean))];
}

export default function BulkPurchase() {
  const [type, setType] = useState('data');
  const [network, setNetwork] = useState('mtn');
  const [dataType, setDataType] = useState('sme');
  const [planId, setPlanId] = useState('');
  const [amount, setAmount] = useState('');
  const [phoneText, setPhoneText] = useState('');
  const [pin, setPin] = useState('');
  const [paymentSource, setPaymentSource] = useState('main');
  const [results, setResults] = useState(null);
  const [listName, setListName] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);
  const [renewalFrequency, setRenewalFrequency] = useState('monthly');
  const { user, refreshUser } = useAuthStore();
  const queryClient = useQueryClient();
  const phones = useMemo(() => parsePhones(phoneText), [phoneText]);
  const { data: savedLists = [] } = useQuery({ queryKey: ['recipient-lists'], queryFn: purchaseToolsAPI.getRecipientLists, select: (response) => response.data.lists || [] });
  const { data: renewals = [] } = useQuery({ queryKey: ['auto-renewals'], queryFn: purchaseToolsAPI.getAutoRenewals, select: (response) => response.data.renewals || [] });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['bulk-data-plans', network, dataType],
    queryFn: () => dataAPI.getPlans({ network, dataType }),
    select: (response) => response.data.plans || [],
    enabled: type === 'data',
  });
  const selectedPlan = plans.find((plan) => String(plan.planId) === String(planId));
  const unitPrice = type === 'data'
    ? Number(user?.role === 'agent' && selectedPlan?.agentPrice ? selectedPlan.agentPrice : selectedPlan?.sellingPrice || 0)
    : Number(amount || 0);
  const estimatedTotal = unitPrice * phones.length;

  const mutation = useMutation({
    mutationFn: async () => {
      const recipients = type === 'data'
        ? phones.map((phone) => ({ phone, network, planId, dataType }))
        : phones.map((phone) => ({ phone, network: detectNetwork(phone) || network, amount: Number(amount) }));
      const batchResults = [];
      for (let index = 0; index < recipients.length; index += REQUEST_BATCH_SIZE) {
        const batch = recipients.slice(index, index + REQUEST_BATCH_SIZE);
        const response = type === 'data'
          ? await dataAPI.purchaseBulk(batch, pin, paymentSource)
          : await airtimeAPI.purchaseBulk(batch, pin, paymentSource);
        batchResults.push(...(response.data.results || []));
      }
      return batchResults;
    },
    onSuccess: (batchResults) => {
      setResults(batchResults);
      setPin('');
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['data-recipient-history'] });
      queryClient.invalidateQueries({ queryKey: ['airtime-recipient-history'] });
      refreshUser();
      const succeeded = batchResults.filter((item) => item.status === 'success').length;
      toast.success(`${succeeded} of ${batchResults.length} purchases completed`);
      if (autoRenew) {
        const recipients = type === 'data' ? phones.map((phone) => ({ phone, network, planId, dataType })) : phones.map((phone) => ({ phone, network: detectNetwork(phone) || network, amount: Number(amount) }));
        purchaseToolsAPI.createAutoRenewal({ serviceType: type, label: listName || `Bulk ${type} (${phones.length})`, payload: type === 'data' ? { network, planId, dataType } : { amount: Number(amount) }, recipients, frequency: renewalFrequency, paymentSource, pin })
          .then(() => toast.success('Bulk auto-renewal activated'))
          .catch((error) => toast.error(error.response?.data?.message || 'Batch completed, but auto-renewal could not be activated'));
      }
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Bulk purchase failed'),
  });

  const submit = () => {
    if (!phones.length) return toast.error('Enter at least one phone number');
    if (phones.some((phone) => !/^0\d{10}$/.test(phone))) return toast.error('Every phone number must be 11 digits and start with 0');
    if (type === 'data' && !selectedPlan) return toast.error('Select a data plan');
    if (type === 'data' && phones.some((phone) => detectNetwork(phone) && detectNetwork(phone) !== network)) return toast.error(`All numbers must belong to ${NETWORK_LABELS[network]}`);
    if (type === 'airtime' && (Number(amount) < 100 || Number(amount) > 50000)) return toast.error('Airtime amount must be between ₦100 and ₦50,000');
    const available = paymentSource === 'main' ? Number(user?.walletBalance || 0)
      : paymentSource === 'reward' ? Number(user?.rewardBalance || 0)
      : Number(user?.walletBalance || 0) + Number(user?.rewardBalance || 0);
    if (estimatedTotal > available) return toast.error('Insufficient balance in the selected wallet source');
    if (!/^\d{4}$/.test(pin)) return toast.error('Enter your 4-digit transaction PIN');
    setResults(null);
    mutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ServiceHeader icon={ListPlus} title="Bulk purchase" description="Send data or airtime to every number in your list." />
      <div className="card p-5 space-y-5">
        <div className="grid grid-cols-2 gap-2">
          {[['data', Wifi, 'Bulk Data'], ['airtime', Phone, 'Bulk Airtime']].map(([value, Icon, label]) => (
            <button key={value} type="button" onClick={() => { setType(value); setResults(null); }} className={`py-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${type === value ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-600 text-dark-400'}`}>
              <Icon size={17} />{label}
            </button>
          ))}
        </div>

        {type === 'data' && <>
          <div><label className="label">Network</label><div className="grid grid-cols-4 gap-2">{NETWORKS.map((item) => <NetworkButton key={item} network={item} selected={network === item} onClick={() => { setNetwork(item); setPlanId(''); }} />)}</div></div>
          <div><label className="label">Data type</label><select className="input" value={dataType} onChange={(event) => { setDataType(event.target.value); setPlanId(''); }}>{DATA_TYPES.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></div>
          <div><label className="label">Plan</label><select className="input" value={planId} disabled={plansLoading} onChange={(event) => setPlanId(event.target.value)}><option value="">{plansLoading ? 'Loading plans...' : 'Select plan'}</option>{plans.map((plan) => <option key={plan.planId} value={plan.planId}>{plan.dataSize} · {plan.validity} · ₦{Number(user?.role === 'agent' && plan.agentPrice ? plan.agentPrice : plan.sellingPrice).toLocaleString()}</option>)}</select></div>
        </>}

        {type === 'airtime' && <div><label className="label">Amount for each number (₦)</label><input type="number" min="100" max="50000" className="input" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="500" /><p className="mt-1 text-xs text-dark-500">The network will be detected for each phone number.</p></div>}

        <div><label className="label">Saved recipient list</label><select className="input" defaultValue="" onChange={(event) => { const list = savedLists.find((item) => item._id === event.target.value); if (list) { setPhoneText(list.numbers.join('\n')); setListName(list.name); } }}><option value="">Choose a saved list</option>{savedLists.map((list) => <option key={list._id} value={list._id}>{list.name} ({list.numbers.length})</option>)}</select></div>
        <div><label className="label">Phone numbers ({phones.length})</label><textarea className="input min-h-36 resize-y" value={phoneText} onChange={(event) => setPhoneText(event.target.value)} placeholder={'08012345678\n08123456789\n07012345678'} /><p className="mt-1 text-xs text-dark-500">Enter one per line, or separate numbers with commas. Duplicate numbers are removed automatically.</p></div>
        <div className="flex gap-2"><input className="input" value={listName} onChange={(event) => setListName(event.target.value)} placeholder="List name, e.g. Staff" /><button type="button" className="btn-secondary shrink-0" disabled={!listName.trim() || !phones.length} onClick={() => purchaseToolsAPI.saveRecipientList(listName.trim(), phones).then(() => { toast.success('Recipient list saved'); queryClient.invalidateQueries({ queryKey: ['recipient-lists'] }); }).catch((error) => toast.error(error.response?.data?.message || 'Could not save list'))}>Save List</button></div>
        <div className="rounded-xl bg-dark-700/50 p-4 flex justify-between"><span className="text-sm text-dark-400">Estimated total</span><strong className="text-dark-100">₦{estimatedTotal.toLocaleString()}</strong></div>
        <PaymentSourceSelect value={paymentSource} onChange={setPaymentSource} user={user} />
        <AutoRenewalOption enabled={autoRenew} onEnabledChange={setAutoRenew} frequency={renewalFrequency} onFrequencyChange={setRenewalFrequency} />
        <div><label className="label">Transaction PIN</label><input type="password" inputMode="numeric" maxLength={4} className="input text-center tracking-[0.7em] text-lg" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" /></div>
        <button type="button" onClick={submit} disabled={mutation.isPending} className="btn-primary btn-lg w-full">{mutation.isPending ? 'Processing batch...' : `Purchase for ${phones.length} number${phones.length === 1 ? '' : 's'}`}</button>
      </div>

      {results && <div className="card p-5 space-y-3"><h2 className="font-bold text-dark-100">Batch results</h2>{results.map((result, index) => <div key={`${result.phone}-${index}`} className="flex items-start gap-3 border-b border-dark-700 py-3 last:border-0">{result.status === 'success' ? <CheckCircle className="text-success-500 shrink-0" size={18} /> : <XCircle className="text-red-400 shrink-0" size={18} />}<div className="min-w-0"><p className="font-bold text-sm text-dark-100">{result.phone}</p><p className="text-xs text-dark-400 break-words">{result.reference || result.error}</p></div></div>)}</div>}
      {(savedLists.length > 0 || renewals.length > 0) && <div className="card p-5 space-y-5">
        {renewals.length > 0 && <div><h2 className="font-bold text-dark-100">Auto-renewals</h2><div className="mt-2 space-y-2">{renewals.map((renewal) => <div key={renewal._id} className="flex items-center gap-3 rounded-xl border border-dark-600 p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-dark-100">{renewal.label || renewal.serviceType}</p><p className="text-[11px] text-dark-400 capitalize">{renewal.frequency} · Next: {new Date(renewal.nextRunAt).toLocaleDateString()}</p></div><button type="button" className="btn-ghost btn-sm" onClick={() => purchaseToolsAPI.setAutoRenewalActive(renewal._id, !renewal.isActive).then(() => queryClient.invalidateQueries({ queryKey: ['auto-renewals'] }))}>{renewal.isActive ? 'Pause' : 'Resume'}</button><button type="button" className="text-xs font-bold text-red-400" onClick={() => purchaseToolsAPI.deleteAutoRenewal(renewal._id).then(() => queryClient.invalidateQueries({ queryKey: ['auto-renewals'] }))}>Delete</button></div>)}</div></div>}
        {savedLists.length > 0 && <div><h2 className="font-bold text-dark-100">Saved lists</h2><div className="mt-2 space-y-2">{savedLists.map((list) => <div key={list._id} className="flex items-center gap-3 rounded-xl border border-dark-600 p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-dark-100">{list.name}</p><p className="text-[11px] text-dark-400">{list.numbers.length} recipients</p></div><button type="button" className="text-xs font-bold text-red-400" onClick={() => purchaseToolsAPI.deleteRecipientList(list._id).then(() => queryClient.invalidateQueries({ queryKey: ['recipient-lists'] }))}>Delete</button></div>)}</div></div>}
      </div>}
    </div>
  );
}

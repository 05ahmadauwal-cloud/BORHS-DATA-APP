import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletAPI, paymentAPI } from '../../api';
import { Wallet as WalletIcon, Send, CreditCard, ArrowUpRight, CheckCircle, XCircle, Clock, ArrowDownLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TABS = ['Fund', 'Transfer', 'History'];
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];
const isCredit = (type) => ['wallet_fund', 'commission_earned', 'referral_bonus'].includes(type);

export default function Wallet() {
  const [activeTab, setActiveTab] = useState('Fund');
  const [fundAmount, setFundAmount] = useState('');
  const [gateway, setGateway] = useState('paystack');
  const [transferForm, setTransferForm] = useState({ recipient: '', amount: '', pin: '' });
  const queryClient = useQueryClient();

  const { data: balance } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => walletAPI.getBalance(),
    select: (res) => res.data,
    refetchInterval: 30000,
  });

  const { data: txns, isLoading } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletAPI.getTransactions({ limit: 30 }),
    select: (res) => res.data,
  });

  const fundMutation = useMutation({
    mutationFn: () => gateway === 'paystack'
      ? paymentAPI.initializePaystack(Number(fundAmount))
      : paymentAPI.initializeFlutterwave(Number(fundAmount)),
    onSuccess: (res) => {
      const url = res.data.authorizationUrl || res.data.paymentLink;
      if (url) window.open(url, '_blank');
      else toast.error('Could not get payment URL');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to initialize payment'),
  });

  const transferMutation = useMutation({
    mutationFn: () => walletAPI.transfer(transferForm),
    onSuccess: () => {
      toast.success('Transfer successful!');
      setTransferForm({ recipient: '', amount: '', pin: '' });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Transfer failed'),
  });

  const walletBalance = balance?.walletBalance || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-dark-50">Wallet</h1>
        <p className="text-dark-400 text-xs mt-0.5">Fund, transfer and track your balance</p>
      </div>

      {/* Balance Card */}
      <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary-600 to-primary-900 p-5 sm:p-7 overflow-hidden shadow-2xl shadow-primary-900/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="relative">
          <p className="text-primary-200 text-xs sm:text-sm mb-1">Available Balance</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-5 tabular-nums">
            ₦{walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={() => setActiveTab('Fund')} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors">
              <ArrowUpRight size={14} /> Fund
            </button>
            <button onClick={() => setActiveTab('Transfer')} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors">
              <Send size={14} /> Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 p-1 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === tab ? 'bg-primary-600 text-white shadow' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Fund Tab */}
      {activeTab === 'Fund' && (
        <div className="card p-4 sm:p-6 space-y-5">
          <div>
            <label className="label">Quick Amount</label>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setFundAmount(String(amt))}
                  className={`py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                    fundAmount === String(amt)
                      ? 'bg-primary-600/20 border-primary-500 text-primary-300'
                      : 'border-dark-600 text-dark-400 hover:border-primary-500/40'
                  }`}
                >
                  ₦{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Or enter amount</label>
            <input
              type="number"
              className="input text-base"
              placeholder="Min ₦100"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {[['paystack', 'Paystack', '💳'], ['flutterwave', 'Flutterwave', '⚡']].map(([id, name, emoji]) => (
                <button
                  key={id}
                  onClick={() => setGateway(id)}
                  className={`p-4 rounded-xl border text-sm font-semibold transition-all text-left active:scale-95 ${
                    gateway === id ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-dark-600 text-dark-400 hover:border-primary-500/30'
                  }`}
                >
                  <span className="text-xl block mb-1">{emoji}</span>
                  {name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => fundMutation.mutate()}
            disabled={!fundAmount || Number(fundAmount) < 100 || fundMutation.isPending}
            className="btn-primary w-full btn-lg gap-2 text-base"
          >
            {fundMutation.isPending
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <CreditCard size={18} />
            }
            {fundMutation.isPending ? 'Redirecting...' : `Fund ₦${Number(fundAmount || 0).toLocaleString()}`}
          </button>
        </div>
      )}

      {/* Transfer Tab */}
      {activeTab === 'Transfer' && (
        <div className="card p-4 sm:p-6 space-y-4">
          <div>
            <label className="label">Recipient</label>
            <input
              className="input"
              placeholder="Email, phone or referral code"
              value={transferForm.recipient}
              onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Amount (₦)</label>
            <input
              type="number"
              className="input"
              placeholder="Min ₦100"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
            />
            <p className="text-xs text-dark-500 mt-1">Balance: ₦{walletBalance.toLocaleString()}</p>
          </div>
          <div>
            <label className="label">Transaction PIN</label>
            <input
              type="password"
              maxLength={4}
              className="input tracking-[0.5em] text-center text-xl font-bold"
              placeholder="••••"
              value={transferForm.pin}
              onChange={(e) => setTransferForm({ ...transferForm, pin: e.target.value.replace(/\D/g, '') })}
            />
          </div>
          <button
            onClick={() => transferMutation.mutate()}
            disabled={!transferForm.recipient || !transferForm.amount || transferMutation.isPending}
            className="btn-primary w-full btn-lg gap-2"
          >
            {transferMutation.isPending
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={18} />
            }
            {transferMutation.isPending ? 'Sending...' : 'Send Money'}
          </button>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'History' && (
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-dark-700/40">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-4 animate-pulse">
                  <div className="w-10 h-10 bg-dark-700 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-dark-700 rounded w-3/4" />
                    <div className="h-3 bg-dark-700 rounded w-1/2" />
                  </div>
                  <div className="h-5 bg-dark-700 rounded w-20" />
                </div>
              ))}
            </div>
          ) : txns?.data?.length > 0 ? (
            <div className="divide-y divide-dark-700/40">
              {txns.data.map((txn) => (
                <div key={txn._id} className="flex items-center gap-3 p-4 hover:bg-dark-700/20 active:bg-dark-700/30 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    txn.status === 'success' ? 'bg-success-500/10' : txn.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                  }`}>
                    {txn.status === 'success'
                      ? <CheckCircle size={15} className="text-success-500" />
                      : txn.status === 'failed'
                      ? <XCircle size={15} className="text-red-400" />
                      : <Clock size={15} className="text-yellow-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark-100 truncate">
                      {txn.description || txn.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </p>
                    <p className="text-[11px] text-dark-400">{format(new Date(txn.createdAt), 'MMM dd, h:mm a')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-sm ${isCredit(txn.type) ? 'text-success-500' : 'text-red-400'}`}>
                      {isCredit(txn.type) ? '+' : '-'}₦{txn.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-dark-500 tabular-nums">₦{txn.balanceAfter?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-dark-400 text-sm">No transactions yet</div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletAPI, paymentAPI } from '../../api';
import { Wallet as WalletIcon, Send, CreditCard, History, ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TABS = ['Fund Wallet', 'Transfer', 'Transactions'];

export default function Wallet() {
  const [activeTab, setActiveTab] = useState('Fund Wallet');
  const [fundAmount, setFundAmount] = useState('');
  const [gateway, setGateway] = useState('paystack');
  const [transferForm, setTransferForm] = useState({ recipient: '', amount: '', pin: '' });
  const queryClient = useQueryClient();

  const { data: balance } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => walletAPI.getBalance(),
    select: (res) => res.data,
  });

  const { data: txns } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletAPI.getTransactions({ limit: 20 }),
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

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="page-header">
        <h1 className="page-title">Wallet</h1>
        <p className="page-subtitle">Manage your balance and transactions</p>
      </div>

      {/* Balance Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-primary-600 to-primary-900 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="relative">
          <p className="text-primary-200 text-sm">Wallet Balance</p>
          <h2 className="text-5xl font-black text-white my-3">
            ₦{(balance?.walletBalance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('Fund Wallet')} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors">
              <ArrowUpRight size={15} /> Fund
            </button>
            <button onClick={() => setActiveTab('Transfer')} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors">
              <Send size={15} /> Transfer
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
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab ? 'bg-primary-600 text-white shadow-sm' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Fund Wallet */}
      {activeTab === 'Fund Wallet' && (
        <div className="card p-6 space-y-6">
          <div>
            <label className="label">Select Amount</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setFundAmount(String(amt))}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    fundAmount === String(amt)
                      ? 'bg-primary-600/20 border-primary-500 text-primary-300'
                      : 'border-dark-600 text-dark-300 hover:border-primary-500/50 hover:text-dark-100'
                  }`}
                >
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="input"
              placeholder="Or enter custom amount (min ₦100)"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Payment Gateway</label>
            <div className="grid grid-cols-2 gap-3">
              {[['paystack', 'Paystack', '💳'], ['flutterwave', 'Flutterwave', '⚡']].map(([id, name, emoji]) => (
                <button
                  key={id}
                  onClick={() => setGateway(id)}
                  className={`p-4 rounded-xl border text-sm font-semibold transition-all text-left ${
                    gateway === id ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-dark-600 text-dark-300 hover:border-primary-500/50'
                  }`}
                >
                  <span className="text-2xl block mb-1">{emoji}</span>
                  {name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => fundMutation.mutate()}
            disabled={!fundAmount || Number(fundAmount) < 100 || fundMutation.isPending}
            className="btn-primary w-full btn-lg gap-2"
          >
            {fundMutation.isPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CreditCard size={18} />}
            {fundMutation.isPending ? 'Redirecting...' : `Fund ₦${Number(fundAmount || 0).toLocaleString()} via ${gateway === 'paystack' ? 'Paystack' : 'Flutterwave'}`}
          </button>
        </div>
      )}

      {/* Transfer */}
      {activeTab === 'Transfer' && (
        <div className="card p-6 space-y-5">
          <div>
            <label className="label">Recipient (email, phone, or referral code)</label>
            <input
              className="input"
              placeholder="e.g. 08012345678 or user@email.com"
              value={transferForm.recipient}
              onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Amount (₦)</label>
            <input
              type="number"
              className="input"
              placeholder="Enter amount"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Transaction PIN</label>
            <input
              type="password"
              maxLength={4}
              className="input tracking-widest"
              placeholder="••••"
              value={transferForm.pin}
              onChange={(e) => setTransferForm({ ...transferForm, pin: e.target.value })}
            />
          </div>
          <button
            onClick={() => transferMutation.mutate()}
            disabled={!transferForm.recipient || !transferForm.amount || transferMutation.isPending}
            className="btn-primary w-full btn-lg gap-2"
          >
            {transferMutation.isPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
            {transferMutation.isPending ? 'Transferring...' : 'Transfer'}
          </button>
        </div>
      )}

      {/* Transactions */}
      {activeTab === 'Transactions' && (
        <div className="card overflow-hidden">
          {txns?.data?.length > 0 ? (
            <div className="divide-y divide-dark-700/50">
              {txns.data.map((txn) => (
                <div key={txn._id} className="flex items-center gap-4 p-4 hover:bg-dark-700/20">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    txn.status === 'success' ? 'bg-success-500/10' : txn.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                  }`}>
                    {txn.status === 'success' ? <CheckCircle size={16} className="text-success-500" /> :
                     txn.status === 'failed' ? <XCircle size={16} className="text-red-400" /> :
                     <Clock size={16} className="text-yellow-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark-100 truncate">{txn.description || txn.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-dark-400">{format(new Date(txn.createdAt), 'MMM dd, yyyy h:mm a')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${['wallet_fund', 'commission_earned', 'referral_bonus'].includes(txn.type) ? 'text-success-500' : 'text-red-400'}`}>
                      {['wallet_fund', 'commission_earned', 'referral_bonus'].includes(txn.type) ? '+' : '-'}₦{txn.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-dark-500 font-mono">Bal: ₦{txn.balanceAfter.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-dark-400">
              <History size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No transactions yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

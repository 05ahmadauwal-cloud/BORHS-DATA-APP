import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletAPI, paymentAPI } from '../../api';
import { useSearchParams } from 'react-router-dom';
import {
  Wallet as WalletIcon, Send, CreditCard, ArrowUpRight,
  CheckCircle, XCircle, Clock, Copy, Check, Building2,
  RefreshCw, AlertCircle, Banknote,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TABS = ['Bank Transfer', 'Online Payment', 'Send Money', 'History'];
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];
const isCredit = (type) => [
  'wallet_fund', 'commission_earned', 'referral_bonus', 'refund',
].includes(type);

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
      style={{
        background: copied ? 'rgba(16,185,129,0.15)' : 'var(--bg-elevated)',
        color: copied ? '#10b981' : 'var(--text-muted)',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
      }}
    >
      {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
    </button>
  );
}

function BankTransferTab() {
  const queryClient = useQueryClient();

  const { data: vaRes, isLoading, isError, refetch } = useQuery({
    queryKey: ['virtual-account'],
    queryFn: () => paymentAPI.getVirtualAccount(),
    select: (res) => res.data?.virtualAccount,
    retry: 1,
  });

  const va = vaRes;
  const accounts = va?.accounts || [];

  return (
    <div className="space-y-4">
      {/* Headline */}
      <div className="flex gap-3 p-4 rounded-2xl border"
        style={{ background: 'rgba(37,99,235,0.06)', borderColor: 'rgba(37,99,235,0.2)' }}>
        <Banknote size={18} className="text-primary-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Your Dedicated Account Number
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Transfer any amount to this account from any Nigerian bank. Your wallet is credited automatically within seconds.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
          ))}
        </div>
      ) : isError || accounts.length === 0 ? (
        <div className="card p-8 text-center space-y-3">
          <AlertCircle size={28} className="text-yellow-400 mx-auto opacity-70" />
          <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
            Virtual account not available yet
          </p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            This is set up automatically when you register. It may take a few minutes or require a page refresh.
          </p>
          <button onClick={() => refetch()} className="btn-secondary btn-sm gap-2 mx-auto">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Account cards */}
          {accounts.map((acct, idx) => (
            <div key={idx} className="card p-5 space-y-3"
              style={{ borderColor: idx === 0 ? 'rgba(37,99,235,0.35)' : undefined }}>
              {idx === 0 && (
                <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400">
                  Primary Account
                </span>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <Building2 size={18} className="text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Bank Name</p>
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{acct.bankName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Account Number</p>
                  <p className="text-xl font-black tracking-wider" style={{ color: 'var(--text-primary)' }}>
                    {acct.accountNumber}
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  <p className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Account Name</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{va.accountName}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <CopyButton text={acct.accountNumber} />
                <CopyButton text={`${acct.bankName} | ${acct.accountNumber} | ${va.accountName}`} />
              </div>
            </div>
          ))}

          <div className="p-3 rounded-xl text-xs space-y-1" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>How it works</p>
            <p>1. Open your banking app or USSD</p>
            <p>2. Transfer any amount to the account above</p>
            <p>3. Your BORHS wallet is credited automatically</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>
              Credits are usually instant. Contact support if not received within 5 minutes.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function Wallet() {
  const [activeTab, setActiveTab] = useState('Bank Transfer');
  const [fundAmount, setFundAmount] = useState('');
  const [gateway, setGateway] = useState('paystack');
  const [transferForm, setTransferForm] = useState({ recipient: '', amount: '', pin: '' });
  const [verifyStatus, setVerifyStatus] = useState(null);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-verify after Paystack / Flutterwave redirect
  useEffect(() => {
    const ref = searchParams.get('reference') || searchParams.get('trxref');
    const txId = searchParams.get('transaction_id');

    if (ref) {
      setVerifyStatus('verifying');
      paymentAPI.verifyPaystack(ref)
        .then((res) => {
          setVerifyStatus('success');
          toast.success(`₦${res.data.amount?.toLocaleString()} added to your wallet!`);
          queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
          queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
          setSearchParams({});
        })
        .catch(() => { setVerifyStatus('failed'); toast.error('Payment verification failed. Contact support.'); });
    }

    if (txId) {
      setVerifyStatus('verifying');
      paymentAPI.verifyFlutterwave(txId)
        .then((res) => {
          setVerifyStatus('success');
          toast.success(`₦${res.data.amount?.toLocaleString()} added to your wallet!`);
          queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
          queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
          setSearchParams({});
        })
        .catch(() => { setVerifyStatus('failed'); toast.error('Payment verification failed. Contact support.'); });
    }
  }, []);

  const { data: balance } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => walletAPI.getBalance(),
    select: (res) => res.data,
    refetchInterval: 15_000, // poll faster so bank transfer credit shows quickly
  });

  const { data: txns, isLoading: txLoading } = useQuery({
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
        <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Wallet</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Fund, transfer and track your balance</p>
      </div>

      {/* Verification banners */}
      {verifyStatus === 'verifying' && (
        <div className="card p-4 flex items-center gap-3 animate-pulse"
          style={{ borderColor: 'rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.05)' }}>
          <span className="w-5 h-5 border-2 border-primary-400/40 border-t-primary-400 rounded-full animate-spin shrink-0" />
          <p className="text-sm text-primary-400 font-semibold">Verifying your payment…</p>
        </div>
      )}
      {verifyStatus === 'success' && (
        <div className="card p-4 flex items-center gap-3"
          style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
          <CheckCircle size={18} className="text-success-500 shrink-0" />
          <p className="text-sm text-success-500 font-semibold">Payment verified! Your wallet has been credited.</p>
        </div>
      )}

      {/* Balance card */}
      <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary-600 to-primary-900 p-5 sm:p-7 overflow-hidden shadow-2xl shadow-primary-900/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="relative">
          <p className="text-primary-200 text-xs sm:text-sm mb-1">Available Balance</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-5 tabular-nums">
            ₦{walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={() => setActiveTab('Bank Transfer')} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors">
              <Building2 size={14} /> Bank Transfer
            </button>
            <button onClick={() => setActiveTab('Send Money')} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors">
              <Send size={14} /> Send
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto" style={{ background: 'var(--bg-surface)' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-none px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab ? 'bg-primary-600 text-white shadow-sm' : ''
            }`}
            style={{ color: activeTab === tab ? undefined : 'var(--text-muted)' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bank Transfer Tab */}
      {activeTab === 'Bank Transfer' && <BankTransferTab />}

      {/* Online Payment Tab */}
      {activeTab === 'Online Payment' && (
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
            <label className="label">Payment Gateway</label>
            <div className="grid grid-cols-2 gap-3">
              {[['paystack', 'Paystack', 'Card · Transfer · USSD'], ['flutterwave', 'Flutterwave', 'Card · Bank · USSD']].map(([id, name, desc]) => (
                <button
                  key={id}
                  onClick={() => setGateway(id)}
                  className={`p-4 rounded-xl border text-left transition-all active:scale-95 ${
                    gateway === id ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600 hover:border-primary-500/30'
                  }`}
                >
                  <p className={`text-sm font-bold ${gateway === id ? 'text-primary-300' : 'text-dark-300'}`}>{name}</p>
                  <p className="text-[10px] text-dark-500 mt-0.5">{desc}</p>
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
              : <CreditCard size={18} />}
            {fundMutation.isPending ? 'Opening payment page…' : `Pay ₦${Number(fundAmount || 0).toLocaleString()}`}
          </button>
        </div>
      )}

      {/* Send Money Tab */}
      {activeTab === 'Send Money' && (
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
              : <Send size={18} />}
            {transferMutation.isPending ? 'Sending…' : 'Send Money'}
          </button>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'History' && (
        <div className="card overflow-hidden">
          {txLoading ? (
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
                <div key={txn._id} className="flex items-center gap-3 p-4 hover:bg-dark-700/20 transition-colors">
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
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {txn.description || txn.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                      {format(new Date(txn.createdAt), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-sm ${isCredit(txn.type) ? 'text-success-500' : 'text-red-400'}`}>
                      {isCredit(txn.type) ? '+' : '-'}₦{txn.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] tabular-nums" style={{ color: 'var(--text-faint)' }}>
                      ₦{txn.balanceAfter?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-sm" style={{ color: 'var(--text-faint)' }}>No transactions yet</div>
          )}
        </div>
      )}
    </div>
  );
}

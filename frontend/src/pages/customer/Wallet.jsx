import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletAPI, paymentAPI, couponAPI, publicAPI } from '../../api';
import { useSearchParams } from 'react-router-dom';
import {
  Wallet as WalletIcon, Send, CreditCard,
  CheckCircle, XCircle, Clock, Copy, Check, Building2,
  RefreshCw, AlertCircle, Banknote, Tag, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TABS = ['Bank Transfer', 'Online Payment', 'Promo Code', 'Send Money', 'History'];
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];
const isCredit = (type) => [
  'wallet_fund', 'commission_earned', 'referral_bonus', 'refund',
].includes(type);

function computeFee(amount, type, value) {
  const amt = Number(amount) || 0;
  if (!amt || !type || type === 'none' || !value) return { fee: 0, credit: amt };
  const fee = type === 'percentage'
    ? Math.round((amt * value) / 100 * 100) / 100
    : Number(value);
  return { fee: Math.min(fee, amt), credit: Math.max(0, amt - fee) };
}

function FeeBreakdown({ amount, chargeType, chargeValue }) {
  const amt = Number(amount) || 0;
  if (!amt || !chargeType || chargeType === 'none' || !chargeValue) return null;
  const { fee, credit } = computeFee(amt, chargeType, chargeValue);
  if (!fee) return null;
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(251,146,60,0.25)', background: 'rgba(251,146,60,0.05)' }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'rgba(251,146,60,0.15)' }}>
        <Info size={12} className="text-orange-400 shrink-0" />
        <p className="text-[11px] font-bold text-orange-400">Deposit Fee Applies</p>
      </div>
      <div className="px-3 py-2.5 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span style={{ color: 'var(--text-muted)' }}>You pay</span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            ₦{amt.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: 'var(--text-muted)' }}>
            Processing fee ({chargeType === 'percentage' ? `${chargeValue}%` : `₦${chargeValue} flat`})
          </span>
          <span className="font-semibold text-orange-400">
            – ₦{fee.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-xs font-bold pt-1 border-t" style={{ borderColor: 'rgba(251,146,60,0.15)' }}>
          <span style={{ color: 'var(--text-primary)' }}>Credited to wallet</span>
          <span className="text-success-400">
            ₦{credit.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

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

function BankTransferTab({ chargeType, chargeValue }) {
  const queryClient = useQueryClient();
  const [previewAmt, setPreviewAmt] = useState('');

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

      {/* Fee calculator for bank transfer */}
      {chargeType && chargeType !== 'none' && chargeValue > 0 && (
        <div className="card p-4 space-y-2">
          <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Fee Calculator</p>
          <input
            type="number"
            className="input"
            placeholder="Enter transfer amount to see fee"
            value={previewAmt}
            onChange={(e) => setPreviewAmt(e.target.value)}
          />
          <FeeBreakdown amount={previewAmt} chargeType={chargeType} chargeValue={chargeValue} />
          {!previewAmt && (
            <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
              A {chargeType === 'percentage' ? `${chargeValue}%` : `₦${chargeValue} flat`} processing fee applies on bank transfers.
            </p>
          )}
        </div>
      )}

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

  // Load Paystack inline JS
  useEffect(() => {
    if (document.getElementById('paystack-inline')) return;
    const script = document.createElement('script');
    script.id = 'paystack-inline';
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const creditWallet = (amount) => {
    setVerifyStatus('success');
    toast.success(`₦${amount?.toLocaleString()} added to your wallet!`);
    queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
  };

  // Fallback: auto-verify after redirect (Flutterwave always redirects; Paystack redirect if popup blocked)
  useEffect(() => {
    const ref = searchParams.get('reference') || searchParams.get('trxref');
    const txId = searchParams.get('transaction_id');

    if (ref) {
      setVerifyStatus('verifying');
      paymentAPI.verifyPaystack(ref)
        .then((res) => { creditWallet(res.data.amount); setSearchParams({}); })
        .catch(() => { setVerifyStatus('failed'); toast.error('Payment verification failed. Contact support.'); });
    }

    if (txId) {
      setVerifyStatus('verifying');
      paymentAPI.verifyFlutterwave(txId)
        .then((res) => { creditWallet(res.data.amount); setSearchParams({}); })
        .catch(() => { setVerifyStatus('failed'); toast.error('Payment verification failed. Contact support.'); });
    }
  }, []);

  const { data: chargeInfo } = useQuery({
    queryKey: ['deposit-charge'],
    queryFn: () => publicAPI.getDepositCharge(),
    select: (res) => res.data.data,
    staleTime: 5 * 60 * 1000,
  });

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
      if (gateway === 'paystack') {
        const { accessCode, reference } = res.data;
        if (!accessCode || !window.PaystackPop) {
          // Fallback to redirect if inline JS hasn't loaded
          const url = res.data.authorizationUrl;
          if (url) window.open(url, '_blank');
          else toast.error('Could not open payment. Try again.');
          return;
        }
        const popup = new window.PaystackPop();
        popup.resumeTransaction(accessCode, {
          onSuccess: () => {
            setVerifyStatus('verifying');
            paymentAPI.verifyPaystack(reference)
              .then((r) => { creditWallet(r.data.amount); setFundAmount(''); })
              .catch(() => { setVerifyStatus('failed'); toast.error('Verification failed. Contact support.'); });
          },
          onCancel: () => toast('Payment cancelled', { icon: '⚠️' }),
          onError: (err) => toast.error(err?.message || 'Payment error. Try again.'),
        });
      } else {
        const url = res.data.paymentLink;
        if (url) window.open(url, '_blank');
        else toast.error('Could not get payment URL');
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to initialize payment'),
  });

  const [couponCode, setCouponCode] = useState('');
  const couponMutation = useMutation({
    mutationFn: () => couponAPI.redeem(couponCode),
    onSuccess: (res) => {
      creditWallet(res.data.amount);
      setCouponCode('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid coupon code'),
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
      {activeTab === 'Bank Transfer' && (
        <BankTransferTab chargeType={chargeInfo?.type} chargeValue={chargeInfo?.value} />
      )}

      {/* Online Payment Tab */}
      {activeTab === 'Online Payment' && (
        <div className="card p-4 sm:p-6 space-y-5">
          <div>
            <label className="label">Quick Amount</label>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((amt) => {
                const { fee, credit } = computeFee(amt, chargeInfo?.type, chargeInfo?.value);
                const hasCharge = fee > 0;
                return (
                  <button
                    key={amt}
                    onClick={() => setFundAmount(String(amt))}
                    className={`py-2.5 px-2 rounded-xl border transition-all active:scale-95 text-center ${
                      fundAmount === String(amt)
                        ? 'bg-primary-600/20 border-primary-500 text-primary-300'
                        : 'border-dark-600 text-dark-400 hover:border-primary-500/40'
                    }`}
                  >
                    <p className="text-sm font-bold">₦{amt >= 1000 ? `${amt / 1000}k` : amt}</p>
                    {hasCharge && (
                      <p className="text-[9px] mt-0.5 text-orange-400 font-medium">
                        get ₦{credit >= 1000 ? `${(credit / 1000).toFixed(credit % 1000 === 0 ? 0 : 1)}k` : credit}
                      </p>
                    )}
                  </button>
                );
              })}
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

          {/* Fee breakdown — shows as soon as amount is entered */}
          <FeeBreakdown
            amount={fundAmount}
            chargeType={chargeInfo?.type}
            chargeValue={chargeInfo?.value}
          />

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

          {(() => {
            const { fee, credit } = computeFee(fundAmount, chargeInfo?.type, chargeInfo?.value);
            const hasCharge = fee > 0;
            const displayAmt = Number(fundAmount || 0);
            return (
              <button
                onClick={() => fundMutation.mutate()}
                disabled={!fundAmount || displayAmt < 100 || fundMutation.isPending}
                className="btn-primary w-full btn-lg gap-2 text-base"
              >
                {fundMutation.isPending
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <CreditCard size={18} />}
                {fundMutation.isPending
                  ? 'Opening payment…'
                  : hasCharge
                  ? `Pay ₦${displayAmt.toLocaleString()} → Get ₦${credit.toLocaleString()}`
                  : `Pay ₦${displayAmt.toLocaleString()}`}
              </button>
            );
          })()}
        </div>
      )}

      {/* Promo Code Tab */}
      {activeTab === 'Promo Code' && (
        <div className="card p-4 sm:p-6 space-y-5">
          <div className="flex gap-3 p-4 rounded-2xl border"
            style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <Tag size={18} className="text-success-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Redeem a Promo Code</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Enter a valid coupon code to instantly credit your wallet.
              </p>
            </div>
          </div>
          <div>
            <label className="label">Promo Code</label>
            <input
              className="input uppercase tracking-widest text-lg font-bold"
              placeholder="e.g. BORHS100"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && couponCode && couponMutation.mutate()}
            />
          </div>
          <button
            onClick={() => couponMutation.mutate()}
            disabled={!couponCode || couponMutation.isPending}
            className="btn-primary w-full btn-lg gap-2 text-base"
          >
            {couponMutation.isPending
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Tag size={18} />}
            {couponMutation.isPending ? 'Redeeming…' : 'Redeem Code'}
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

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataAPI } from '../../api';
import {
  Wifi, CheckCircle, Phone, Zap, Tv, ArrowRight,
  Hash, Smartphone, ChevronRight, Star, BadgeCheck, Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const NETWORKS = [
  { id: 'mtn',     label: 'MTN',     bg: 'bg-yellow-400',  text: 'text-yellow-900', activeBg: 'bg-yellow-400/15', activeBorder: 'border-yellow-400/40', activeText: 'text-yellow-300', dot: 'bg-yellow-400' },
  { id: 'airtel',  label: 'Airtel',  bg: 'bg-red-500',     text: 'text-white',      activeBg: 'bg-red-500/15',    activeBorder: 'border-red-500/40',    activeText: 'text-red-400',    dot: 'bg-red-400' },
  { id: 'glo',     label: 'Glo',     bg: 'bg-green-600',   text: 'text-white',      activeBg: 'bg-green-500/15',  activeBorder: 'border-green-500/40',  activeText: 'text-green-400',  dot: 'bg-green-400' },
  { id: '9mobile', label: '9Mobile', bg: 'bg-teal-500',    text: 'text-white',      activeBg: 'bg-teal-500/15',   activeBorder: 'border-teal-500/40',   activeText: 'text-teal-400',   dot: 'bg-teal-400' },
];

const DATA_TYPES = [
  { id: 'sme',       label: 'SME Data',       desc: 'Cheapest — for personal use' },
  { id: 'corporate', label: 'Corporate',      desc: 'Rolls over, no expiry' },
  { id: 'gifting',   label: 'Gifting',        desc: 'Send data to anyone' },
  { id: 'direct',    label: 'DG / Direct',    desc: 'Direct gifting data' },
];

const BALANCE_USSD = [
  {
    network: 'MTN',
    color: 'bg-yellow-400',
    text: 'text-yellow-900',
    accent: 'text-yellow-400',
    border: 'border-yellow-400/20',
    bg: 'bg-yellow-400/8',
    codes: [
      { code: '*556#', desc: 'Check data balance' },
      { code: '*310#', desc: 'Check main balance' },
      { code: '*323#', desc: 'Check bonus balance' },
    ],
  },
  {
    network: 'Airtel',
    color: 'bg-red-500',
    text: 'text-white',
    accent: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/8',
    codes: [
      { code: '*140#', desc: 'Check main balance' },
      { code: '*123#', desc: 'Airtel self service' },
      { code: '*141*712*0#', desc: 'Check data balance' },
    ],
  },
  {
    network: 'Glo',
    color: 'bg-green-600',
    text: 'text-white',
    accent: 'text-green-400',
    border: 'border-green-500/20',
    bg: 'bg-green-500/8',
    codes: [
      { code: '*127*0#', desc: 'Check data balance' },
      { code: '*124*1#', desc: 'Check main balance' },
      { code: '*777#', desc: 'Glo self service' },
    ],
  },
  {
    network: '9Mobile',
    color: 'bg-teal-500',
    text: 'text-white',
    accent: 'text-teal-400',
    border: 'border-teal-400/20',
    bg: 'bg-teal-500/8',
    codes: [
      { code: '*228#', desc: 'Check data balance' },
      { code: '*232#', desc: 'Check main balance' },
      { code: '*200#', desc: '9mobile self care' },
    ],
  },
];

const OTHER_SERVICES = [
  {
    icon: Phone,
    label: 'Airtime',
    color: 'text-green-400',
    iconBg: 'bg-green-500/10',
    items: [
      'MTN — face value',
      'Airtel — face value',
      'Glo — face value',
      '9mobile — face value',
      'Instant delivery, 24/7',
    ],
  },
  {
    icon: Zap,
    label: 'Electricity',
    color: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10',
    items: [
      'IKEDC, EKEDC, AEDC',
      'KEDCO, JED, PHED',
      'EEDC, IBEDC, BEDC',
      'Min purchase: ₦500',
      'Token in under 30s',
    ],
  },
  {
    icon: Tv,
    label: 'Cable TV',
    color: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    items: [
      'All DStv bouquets',
      'All GOtv packages',
      'Startimes bundles',
      'Same-day activation',
      'Auto-renewal available',
    ],
  },
];

function PlanCard({ plan, networkMeta }) {
  return (
    <div
      className="group relative flex flex-col rounded-2xl p-5 border transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Network pill */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${networkMeta.bg} ${networkMeta.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-70`} />
          {plan.network}
        </span>
        {plan.dataType && (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-faint)' }}>
            {plan.dataType}
          </span>
        )}
      </div>

      {/* Size */}
      <p className="text-2xl font-black mb-0.5" style={{ color: 'var(--text-primary)' }}>
        {plan.dataSize}
      </p>
      <p className="text-xs mb-3 truncate" style={{ color: 'var(--text-faint)' }}>
        {plan.name}
        {plan.validity ? ` · ${plan.validity}` : ''}
      </p>

      {/* Price */}
      <div className="mt-auto">
        <p className="text-2xl font-black text-primary-400 tabular-nums">
          ₦{plan.sellingPrice.toLocaleString()}
        </p>
        <Link
          to="/register"
          className="flex items-center justify-center gap-1.5 w-full mt-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          Buy Now <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export default function Pricing() {
  const [selectedNetwork, setSelectedNetwork] = useState('mtn');
  const [selectedType, setSelectedType] = useState('sme');

  const networkMeta = NETWORKS.find((n) => n.id === selectedNetwork) || NETWORKS[0];

  const { data: plans, isLoading } = useQuery({
    queryKey: ['data-plans', selectedNetwork, selectedType],
    queryFn: () => dataAPI.getPlans({ network: selectedNetwork, dataType: selectedType }),
    select: (res) => res.data.plans,
  });

  return (
    <div>

      {/* ── Hero ── */}
      <section className="relative py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[140px]"
            style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.1) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-bold"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', color: '#60a5fa' }}>
            <BadgeCheck size={13} /> Always the cheapest rates in Nigeria
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4"
            style={{ color: 'var(--text-primary)' }}>
            Transparent <span className="gradient-text">Pricing</span>
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            No hidden fees. No surprises. What you see is what you pay — always the lowest VTU prices available.
          </p>
        </div>
      </section>

      {/* ── Data Plans ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* Network tabs */}
        <div className="flex gap-2 sm:gap-3 justify-center flex-wrap mb-6">
          {NETWORKS.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNetwork(n.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-150 ${
                selectedNetwork === n.id
                  ? `${n.activeBg} ${n.activeBorder} ${n.activeText}`
                  : 'hover:bg-white/5'
              }`}
              style={selectedNetwork !== n.id ? { borderColor: 'var(--border)', color: 'var(--text-muted)' } : undefined}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedNetwork === n.id ? n.dot : 'bg-dark-600'}`} />
              {n.label}
            </button>
          ))}
        </div>

        {/* Data type tabs */}
        <div className="flex gap-2 justify-center flex-wrap mb-10">
          {DATA_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                selectedType === t.id
                  ? 'bg-primary-500/15 border-primary-500/35 text-primary-400'
                  : 'hover:bg-white/5'
              }`}
              style={selectedType !== t.id ? { borderColor: 'var(--border)', color: 'var(--text-faint)' } : undefined}
              title={t.desc}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Plans grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="h-3 rounded mb-3 w-16" style={{ background: 'var(--bg-elevated)' }} />
                <div className="h-7 rounded mb-2 w-24" style={{ background: 'var(--bg-elevated)' }} />
                <div className="h-3 rounded mb-4 w-20" style={{ background: 'var(--bg-elevated)' }} />
                <div className="h-6 rounded mb-3 w-20" style={{ background: 'var(--bg-elevated)' }} />
                <div className="h-9 rounded-xl w-full" style={{ background: 'var(--bg-elevated)' }} />
              </div>
            ))}
          </div>
        ) : plans?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {plans.map((plan) => (
              <PlanCard key={plan._id} plan={plan} networkMeta={networkMeta} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Wifi size={40} className="mx-auto mb-4 text-primary-500/30" />
            <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>No plans found for this selection.</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>Try a different network or data type.</p>
          </div>
        )}

        {/* Sign-up nudge */}
        <div className="mt-8 text-center">
          <p className="text-sm mb-3" style={{ color: 'var(--text-faint)' }}>
            Already a member? Prices update automatically in your dashboard.
          </p>
          <Link to="/register" className="btn-primary gap-2 group">
            Create Free Account <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ── Other Services ── */}
      <section className="py-20" style={{ background: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest mb-2 text-primary-400">More than data</p>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
              Other Service Rates
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {OTHER_SERVICES.map((s) => (
              <div key={s.label} className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4 ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <h3 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>{s.label}</h3>
                <ul className="space-y-2.5">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle size={13} className="text-success-500 shrink-0" />
                      <span style={{ color: 'var(--text-muted)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Check Balance ── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest mb-3 text-primary-400">Quick reference</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
              How to Check Your Balance
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
              USSD codes for every Nigerian network — dial from your phone keypad.
            </p>
          </div>

          {/* BORHS wallet balance card */}
          <div className="mb-6 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0.04) 100%)',
              border: '1px solid rgba(37,99,235,0.25)',
            }}>
            <div className="w-10 h-10 bg-primary-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Smartphone size={20} className="text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
                BORHS Data Wallet Balance
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Log in to your dashboard — your wallet balance is displayed on the home screen at the top of every page.
              </p>
            </div>
            <Link to="/login" className="btn-primary btn-sm gap-1.5 shrink-0">
              Check Balance <ArrowRight size={13} />
            </Link>
          </div>

          {/* Network USSD cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {BALANCE_USSD.map((n) => (
              <div key={n.network} className="rounded-2xl p-5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-xl ${n.color} flex items-center justify-center shrink-0`}>
                    <span className={`font-black text-xs ${n.text}`}>{n.network[0]}</span>
                  </div>
                  <h3 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{n.network}</h3>
                </div>
                <div className="space-y-2.5">
                  {n.codes.map((c) => (
                    <div key={c.code} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: 'var(--bg-elevated)' }}>
                      <div className="flex items-center gap-2.5">
                        <Hash size={12} className={n.accent} />
                        <code className={`text-sm font-black tracking-wide ${n.accent}`}>{c.code}</code>
                      </div>
                      <span className="text-xs text-right" style={{ color: 'var(--text-faint)' }}>{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Info note */}
          <div className="mt-6 flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <Info size={14} className="text-primary-400 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              USSD codes are provided for reference only. Dial them from your registered SIM. Codes may vary based on your mobile network's updates.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden text-center p-10 sm:p-14"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, var(--bg-card) 50%, rgba(16,185,129,0.08) 100%)',
              border: '1px solid rgba(37,99,235,0.2)',
            }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl pointer-events-none"
              style={{ background: 'rgba(37,99,235,0.2)' }} />
            <div className="relative">
              <div className="flex justify-center gap-1 mb-4">
                {[1,2,3,4,5].map((i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
                Ready to Start Saving?
              </h2>
              <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                Create a free account in under 60 seconds and start buying at Nigeria's cheapest rates.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className="btn-primary btn-lg gap-2 group">
                  Get Started Free <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/contact" className="btn-secondary btn-lg">
                  Talk to Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

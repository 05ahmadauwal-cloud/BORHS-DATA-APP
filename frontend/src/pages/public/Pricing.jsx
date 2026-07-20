import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '../../api';
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
  { id: 'sme',       label: 'SME Data',    desc: 'Cheapest — for personal use' },
  { id: 'corporate', label: 'Corporate',   desc: 'Rolls over, no expiry' },
  { id: 'gifting',   label: 'Gifting',     desc: 'Send data to anyone' },
  { id: 'direct',    label: 'DG / Direct', desc: 'Direct gifting data' },
];

const BALANCE_USSD = [
  {
    network: 'MTN', color: 'bg-yellow-400', text: 'text-yellow-900', accent: 'text-yellow-400',
    codes: [
      { code: '*556#', desc: 'Check data balance' },
      { code: '*310#', desc: 'Check main balance' },
      { code: '*323#', desc: 'Check bonus balance' },
    ],
  },
  {
    network: 'Airtel', color: 'bg-red-500', text: 'text-white', accent: 'text-red-400',
    codes: [
      { code: '*140#',       desc: 'Check main balance' },
      { code: '*123#',       desc: 'Airtel self service' },
      { code: '*141*712*0#', desc: 'Check data balance' },
    ],
  },
  {
    network: 'Glo', color: 'bg-green-600', text: 'text-white', accent: 'text-green-400',
    codes: [
      { code: '*127*0#', desc: 'Check data balance' },
      { code: '*124*1#', desc: 'Check main balance' },
      { code: '*777#',   desc: 'Glo self service' },
    ],
  },
  {
    network: '9Mobile', color: 'bg-teal-500', text: 'text-white', accent: 'text-teal-400',
    codes: [
      { code: '*228#', desc: 'Check data balance' },
      { code: '*232#', desc: 'Check main balance' },
      { code: '*200#', desc: '9mobile self care' },
    ],
  },
];

const OTHER_SERVICES = [
  {
    icon: Phone, label: 'Airtime', color: 'text-green-400', iconBg: 'bg-green-500/10',
    items: ['MTN — face value', 'Airtel — face value', 'Glo — face value', '9mobile — face value', 'Instant delivery, 24/7'],
  },
  {
    icon: Zap, label: 'Electricity', color: 'text-yellow-400', iconBg: 'bg-yellow-500/10',
    items: ['IKEDC, EKEDC, AEDC', 'KEDCO, JED, PHED', 'EEDC, IBEDC, BEDC', 'Min purchase: ₦500', 'Token in under 30s'],
  },
  {
    icon: Tv, label: 'Cable TV', color: 'text-purple-400', iconBg: 'bg-purple-500/10',
    items: ['All DStv bouquets', 'All GOtv packages', 'Startimes bundles', 'Same-day activation', 'Auto-renewal available'],
  },
];

function PlanCard({ plan, networkMeta }) {
  return (
    <div
      className="group relative flex flex-col rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', padding: 'clamp(12px,2vw,18px)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${networkMeta.bg} ${networkMeta.text}`}>
          <span className="w-1 h-1 rounded-full bg-current opacity-70" />
          {plan.network}
        </span>
        {plan.dataType && (
          <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-faint)' }}>
            {plan.dataType}
          </span>
        )}
      </div>

      <p className="text-xl font-black mb-0.5" style={{ color: 'var(--text-primary)' }}>
        {plan.dataSize}
      </p>
      <p className="text-[10px] mb-2 truncate" style={{ color: 'var(--text-faint)' }}>
        {plan.name}{plan.validity ? ` · ${plan.validity}` : ''}
      </p>

      <div className="mt-auto">
        <p className="text-xl font-black text-primary-400 tabular-nums">
          ₦{plan.sellingPrice.toLocaleString()}
        </p>
        <Link
          to="/register"
          className="flex items-center justify-center gap-1 w-full mt-2 py-2 rounded-lg text-[11px] font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          Buy Now <ChevronRight size={10} />
        </Link>
      </div>
    </div>
  );
}

export default function Pricing() {
  const [selectedNetwork, setSelectedNetwork] = useState('mtn');
  const [selectedType, setSelectedType] = useState('sme');

  const networkMeta = NETWORKS.find((n) => n.id === selectedNetwork) || NETWORKS[0];

  const { data: allPlans = [], isLoading, isError } = useQuery({
    queryKey: ['public-featured-plans'],
    queryFn: publicAPI.getFeaturedPlans,
    select: (res) => Array.isArray(res.data?.data) ? res.data.data : [],
    staleTime: 60_000,
  });

  const availableTypes = new Set(
    allPlans
      .filter((plan) => plan.network?.toLowerCase() === selectedNetwork)
      .map((plan) => plan.dataType?.toLowerCase())
      .filter(Boolean)
  );

  const plans = allPlans.filter((plan) => (
    plan.network?.toLowerCase() === selectedNetwork
    && plan.dataType?.toLowerCase() === selectedType
  ));

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ padding: 'clamp(28px,5vw,56px) 0' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-[140px]"
            style={{ background: 'radial-gradient(ellipse,rgba(37,99,235,0.1) 0%,transparent 70%)' }} />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 text-[10px] font-bold"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', color: '#60a5fa' }}>
            <BadgeCheck size={11} /> Always the cheapest rates in Nigeria
          </div>
          <h1 style={{ fontSize: 'clamp(22px,5.5vw,52px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 10 }}>
            Transparent <span className="gradient-text">Pricing</span>
          </h1>
          <p style={{ fontSize: 'clamp(12px,1.5vw,15px)', color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto' }}>
            No hidden fees. No surprises. What you see is what you pay — always the lowest VTU prices.
          </p>
        </div>
      </section>

      {/* ── Data Plans ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">

        {/* Network tabs */}
        <div className="flex gap-2 justify-center flex-wrap mb-4">
          {NETWORKS.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setSelectedNetwork(n.id);
                const networkTypes = allPlans
                  .filter((plan) => plan.network?.toLowerCase() === n.id)
                  .map((plan) => plan.dataType?.toLowerCase());
                if (!networkTypes.includes(selectedType) && networkTypes[0]) setSelectedType(networkTypes[0]);
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-150 ${
                selectedNetwork === n.id
                  ? `${n.activeBg} ${n.activeBorder} ${n.activeText}`
                  : 'hover:bg-white/5'
              }`}
              style={selectedNetwork !== n.id ? { borderColor: 'var(--border)', color: 'var(--text-muted)' } : undefined}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${selectedNetwork === n.id ? n.dot : 'bg-dark-600'}`} />
              {n.label}
            </button>
          ))}
        </div>

        {/* Data type tabs */}
        <div className="flex gap-2 justify-center flex-wrap mb-6">
          {DATA_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              disabled={!isLoading && !availableTypes.has(t.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="h-3 rounded mb-2 w-14" style={{ background: 'var(--bg-elevated)' }} />
                <div className="h-6 rounded mb-1.5 w-20" style={{ background: 'var(--bg-elevated)' }} />
                <div className="h-2.5 rounded mb-3 w-16" style={{ background: 'var(--bg-elevated)' }} />
                <div className="h-5 rounded mb-2 w-16" style={{ background: 'var(--bg-elevated)' }} />
                <div className="h-8 rounded-lg w-full" style={{ background: 'var(--bg-elevated)' }} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-[1.75rem] bg-[#fff1ed] px-6 py-12 text-center">
            <Wifi size={30} className="mx-auto text-red-500" />
            <p className="mt-4 text-sm font-bold text-[#7f1d1d]">Pricing is temporarily unavailable.</p>
            <p className="mt-1 text-xs text-[#9f3a2c]">Please refresh the page or try again shortly.</p>
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
            {plans.map((plan) => (
              <PlanCard key={plan._id} plan={plan} networkMeta={networkMeta} />
            ))}
          </div>
        ) : (
          <div className="text-center py-14 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Wifi size={32} className="mx-auto mb-3 text-primary-500/30" />
            <p className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>No plans found for this selection.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Try a different network or data type.</p>
          </div>
        )}

        {/* Sign-up nudge */}
        <div className="mt-5 text-center">
          <p className="text-xs mb-2" style={{ color: 'var(--text-faint)' }}>
            Already a member? Prices update automatically in your dashboard.
          </p>
          <Link to="/register" className="btn-primary gap-2 group" style={{ fontSize: 13 }}>
            Create Free Account <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ── Other Services ── */}
      <section className="py-10 sm:py-14" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-7">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-primary-400">More than data</p>
            <h2 style={{ fontSize: 'clamp(18px,3.5vw,32px)', fontWeight: 900, color: 'var(--text-primary)' }}>
              Other Service Rates
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {OTHER_SERVICES.map((s) => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon size={17} />
                </div>
                <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>{s.label}</h3>
                <ul className="space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs">
                      <CheckCircle size={11} className="text-success-500 shrink-0" />
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
      <section className="py-10 sm:py-14" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-7">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-primary-400">Quick reference</p>
            <h2 style={{ fontSize: 'clamp(18px,3.5vw,32px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>
              How to Check Your Balance
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              USSD codes for every Nigerian network — dial from your phone keypad.
            </p>
          </div>

          {/* BORHS wallet balance card */}
          <div className="mb-4 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3"
            style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.12) 0%,rgba(37,99,235,0.04) 100%)', border: '1px solid rgba(37,99,235,0.25)' }}>
            <div className="w-9 h-9 bg-primary-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Smartphone size={17} className="text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-xs mb-0.5" style={{ color: 'var(--text-primary)' }}>BORHS Data Wallet Balance</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Log in to your dashboard — wallet balance is shown at the top of every page.
              </p>
            </div>
            <Link to="/login" className="btn-primary btn-sm gap-1.5 shrink-0" style={{ fontSize: 12 }}>
              Check Balance <ArrowRight size={12} />
            </Link>
          </div>

          {/* Network USSD cards */}
          <div className="grid sm:grid-cols-2 gap-3">
            {BALANCE_USSD.map((n) => (
              <div key={n.network} className="rounded-xl p-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${n.color} flex items-center justify-center shrink-0`}>
                    <span className={`font-black text-xs ${n.text}`}>{n.network[0]}</span>
                  </div>
                  <h3 className="font-black text-xs" style={{ color: 'var(--text-primary)' }}>{n.network}</h3>
                </div>
                <div className="space-y-1.5">
                  {n.codes.map((c) => (
                    <div key={c.code} className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg"
                      style={{ background: 'var(--bg-elevated)' }}>
                      <div className="flex items-center gap-2">
                        <Hash size={10} className={n.accent} />
                        <code className={`text-xs font-black tracking-wide ${n.accent}`}>{c.code}</code>
                      </div>
                      <span className="text-[10px] text-right" style={{ color: 'var(--text-faint)' }}>{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <Info size={12} className="text-primary-400 shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              USSD codes are for reference only. Dial from your registered SIM. Codes may vary based on network updates.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-10 sm:pb-14" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="relative rounded-2xl overflow-hidden text-center"
            style={{
              padding: 'clamp(28px,5vw,52px) clamp(18px,5vw,44px)',
              background: 'linear-gradient(135deg,rgba(37,99,235,0.18) 0%,var(--bg-card) 50%,rgba(16,185,129,0.08) 100%)',
              border: '1px solid rgba(37,99,235,0.2)',
            }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-28 blur-3xl pointer-events-none"
              style={{ background: 'rgba(37,99,235,0.18)' }} />
            <div className="relative">
              <div className="flex justify-center gap-0.5 mb-3">
                {[1,2,3,4,5].map((i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <h2 style={{ fontSize: 'clamp(18px,3.5vw,32px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
                Ready to Start Saving?
              </h2>
              <p className="text-sm mb-5 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                Create a free account in under 60 seconds and buy at Nigeria's cheapest rates.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <Link to="/register" className="btn-primary btn-lg gap-2 group" style={{ fontSize: 13 }}>
                  Get Started Free <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/contact" className="btn-secondary btn-lg" style={{ fontSize: 13 }}>
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

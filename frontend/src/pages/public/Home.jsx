import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '../../api';
import {
  Wifi, Phone, Zap, Tv, GraduationCap, Shield, Clock, Users, Star,
  ArrowRight, CheckCircle, TrendingUp, Bolt, BadgeCheck, Headphones,
  ChevronRight, Sparkles, Activity, Award,
} from 'lucide-react';

const NET = {
  mtn:      { display: 'MTN',     bg: '#FFCC00', fg: '#0a0a00', short: 'MTN' },
  airtel:   { display: 'Airtel',  bg: '#E11B22', fg: '#ffffff', short: 'Air' },
  glo:      { display: 'Glo',     bg: '#00A651', fg: '#ffffff', short: 'Glo' },
  '9mobile':{ display: '9mobile', bg: '#006837', fg: '#76BC21', short: '9m'  },
};

const SERVICES = [
  { icon: Wifi,          label: 'Data Bundles',   tag: 'Cheapest',   accent: '#3b82f6', to: '/data',
    desc: 'SME & Corporate data — up to 40% cheaper than retail.' },
  { icon: Phone,         label: 'Airtime Top-Up', tag: null,         accent: '#10b981', to: '/airtime',
    desc: 'Instant recharge for any Nigerian network, 24/7.' },
  { icon: Zap,           label: 'Electricity',    tag: null,         accent: '#f59e0b', to: '/electricity',
    desc: 'Pay EKEDC, IKEDC, AEDC, PHEDC and all DISCOs.' },
  { icon: Tv,            label: 'Cable TV',       tag: null,         accent: '#8b5cf6', to: '/cable',
    desc: 'DStv, GOtv and Startimes renewed in seconds.' },
  { icon: GraduationCap, label: 'Exam PINs',      tag: null,         accent: '#ef4444', to: '/education',
    desc: 'WAEC, NECO, NABTEB and JAMB ePINs instantly.' },
  { icon: TrendingUp,    label: 'Earn Referrals', tag: 'Side Income',accent: '#10b981', to: '/referrals',
    desc: 'Earn up to 5% on every purchase your referrals make.' },
];

const STEPS = [
  { n: 1, icon: Users,  title: 'Create Free Account', desc: 'Sign up in 60 seconds — no ID, no paperwork.' },
  { n: 2, icon: Shield, title: 'Fund Your Wallet',    desc: 'Bank transfer, card payment, or promo code.' },
  { n: 3, icon: Bolt,   title: 'Buy in Seconds',      desc: 'Pick a service, enter details — done in under 10s.' },
];

const FEATURES = [
  { icon: Bolt,       title: 'Under 10 Seconds',        desc: 'Average delivery time across all services.' },
  { icon: Shield,     title: 'Bank-Grade Security',      desc: 'AES-256 encryption and 2FA on every account.' },
  { icon: BadgeCheck, title: 'Lowest Prices Guaranteed', desc: "Find it cheaper anywhere — we'll match it." },
  { icon: Headphones, title: 'Real Human Support',       desc: 'WhatsApp and live chat, 24/7 by real people.' },
  { icon: Activity,   title: '99.9% Uptime',             desc: 'Enterprise infrastructure built for reliability.' },
  { icon: Award,      title: 'Agent Commissions',        desc: 'Earn up to 5% on every transaction in your network.' },
];

const TESTIMONIALS = [
  { initial: 'AO', color: '#FFCC00', name: 'Adebayo Okonkwo', role: 'Data Reseller · Lagos',
    text: 'Eight months, hundreds of customers, zero failed transactions.' },
  { initial: 'CE', color: '#E11B22', name: 'Chioma Eze', role: 'University Student · Enugu',
    text: "1GB for ₦285 sounds impossible but it's real and instant. Nothing touches BORHS." },
  { initial: 'IM', color: '#00A651', name: 'Ibrahim Musa', role: 'Agent · Kano',
    text: "Referral commissions cover my phone bill every month. Fast, fair prices." },
];

const ACTIVITY = [
  { name: 'Emeka O.',    city: 'Lagos',         item: '1GB MTN SME',   price: '₦285' },
  { name: 'Fatima A.',   city: 'Kano',          item: '2GB Airtel',    price: '₦580' },
  { name: 'Chukwudi N.', city: 'Onitsha',       item: 'Electricity',   price: '₦2,000' },
  { name: 'Aisha B.',    city: 'Abuja',         item: '2GB MTN SME',   price: '₦510' },
  { name: 'Tunde F.',    city: 'Ibadan',        item: 'DStv Compact',  price: '₦9,000' },
  { name: 'Grace E.',    city: 'Port Harcourt', item: '2GB Glo',       price: '₦550' },
];

function formatVolume(n) {
  if (!n) return '₦0';
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

function Stars() {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[0,1,2,3,4].map((i) => <Star key={i} size={11} style={{ color: '#fbbf24', fill: '#fbbf24' }} />)}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.18)',
      borderRadius: 999, padding: '4px 11px', marginBottom: 10,
      fontSize: 10, fontWeight: 800, color: '#60a5fa',
      letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>
      {children}
    </div>
  );
}

function AppCard({ cheapestPlan }) {
  const net = cheapestPlan ? NET[cheapestPlan.network] : NET['mtn'];
  const price = cheapestPlan ? `₦${cheapestPlan.sellingPrice.toLocaleString()}` : '₦285';
  const size = cheapestPlan ? cheapestPlan.dataSize : '1GB';
  const planLabel = cheapestPlan ? cheapestPlan.name : '1GB SME Data';

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 288, margin: '0 auto', userSelect: 'none' }}>
      <div style={{
        background: 'linear-gradient(150deg,rgba(15,23,42,0.98) 0%,rgba(30,41,59,0.96) 100%)',
        border: '1px solid rgba(51,65,85,0.65)', borderRadius: 18, padding: 18,
        boxShadow: '0 28px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Wallet Balance</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.02em' }}>
              ₦12,500<span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>.00</span>
            </div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wifi size={15} style={{ color: '#60a5fa' }} />
          </div>
        </div>

        <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.14)', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
          <div style={{ fontSize: 8, fontWeight: 800, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Last Purchase</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: net.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: net.fg }}>
              {net.short}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{planLabel}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 3 }}>
                <CheckCircle size={9} style={{ color: '#10b981', flexShrink: 0 }} /> Delivered in 4s
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#f1f5f9', flexShrink: 0 }}>{price}</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 8, fontWeight: 600, color: '#475569', letterSpacing: '0.04em', marginBottom: 7 }}>Available Networks</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
            {Object.entries(NET).map(([key, n]) => (
              <div key={key} style={{ height: 24, borderRadius: 7, background: n.bg + '1A', border: `1px solid ${n.bg}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 900, color: n.bg === '#FFCC00' ? '#a89200' : n.fg === '#fff' ? n.bg : n.fg }}>
                {n.short}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: -12, right: -12, background: 'linear-gradient(135deg,rgba(16,185,129,0.97),rgba(5,150,105,0.97))', borderRadius: 12, padding: '8px 10px', boxShadow: '0 5px 18px rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 19, height: 19, borderRadius: 6, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={11} style={{ color: 'white' }} />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Delivered!</div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.75)' }}>{size} {net.display} · {price}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: -12, left: -12, background: 'rgba(9,11,17,0.96)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 12, padding: '8px 10px', boxShadow: '0 5px 18px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 19, height: 19, borderRadius: 6, background: 'rgba(37,99,235,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bolt size={10} style={{ color: '#60a5fa' }} />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>~6 seconds</div>
          <div style={{ fontSize: 8, color: '#64748b' }}>Avg. delivery</div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function Home() {
  const { data: plansRes } = useQuery({
    queryKey: ['featured-plans'],
    queryFn: () => publicAPI.getFeaturedPlans(),
    select: (r) => r.data.data,
    staleTime: 10 * 60 * 1000,
  });

  const { data: statsRes } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => publicAPI.getPublicStats(),
    select: (r) => r.data.data,
    staleTime: 5 * 60 * 1000,
  });

  const plans = plansRes || [];

  const byNetwork = {};
  plans.forEach((p) => {
    if (!byNetwork[p.network] || p.sellingPrice < byNetwork[p.network].sellingPrice)
      byNetwork[p.network] = p;
  });
  const cheapestMtn = byNetwork['mtn'];

  const tickerBase = plans.map((p) => {
    const n = NET[p.network] || { bg: '#888', fg: '#fff', short: p.network };
    return { short: n.short, bg: n.bg, fg: n.fg, size: p.dataSize, price: `₦${p.sellingPrice.toLocaleString()}` };
  });
  const tickerItems = tickerBase.length > 0
    ? [...tickerBase, ...tickerBase, ...tickerBase, ...tickerBase]
    : [];

  const tablePlans = plans.slice(0, 8);
  const userCount = statsRes?.userCount ?? null;
  const volumeProcessed = statsRes?.volumeProcessed ?? null;

  const statItems = [
    { value: userCount !== null ? `${userCount}+` : '—', label: 'Active Users',   sub: 'and growing',      icon: Users,    color: '#3b82f6' },
    { value: volumeProcessed !== null ? formatVolume(volumeProcessed) + '+' : '—', label: 'Processed', sub: 'in transactions', icon: TrendingUp, color: '#10b981' },
    { value: '99.9%', label: 'Uptime',        sub: 'guaranteed SLA',  icon: Activity, color: '#8b5cf6' },
    { value: '<10s',  label: 'Delivery',      sub: 'avg. speed',       icon: Clock,    color: '#f59e0b' },
  ];

  return (
    <div style={{ overflowX: 'hidden' }}>
      <style>{`
        @keyframes scrollLeft { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .ticker-track { display:flex; width:max-content; animation:scrollLeft 40s linear infinite; }
        .ticker-track:hover { animation-play-state:paused; }
        @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .float-hero { animation:floatCard 6s ease-in-out infinite; }
        @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.5)} 50%{box-shadow:0 0 0 5px rgba(16,185,129,0)} }
        .live-dot { animation:livePulse 2s ease-in-out infinite; }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', padding: 'clamp(28px,5vw,64px) 0 clamp(32px,5vw,72px)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80vw', maxWidth: 900, height: 400, borderRadius: '50%', filter: 'blur(140px)', background: 'radial-gradient(ellipse,rgba(37,99,235,0.13) 0%,transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40vw', maxWidth: 400, height: 380, borderRadius: '50%', filter: 'blur(120px)', background: 'radial-gradient(ellipse,rgba(16,185,129,0.08) 0%,transparent 70%)' }} />
        </div>

        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 16px', position: 'relative' }}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">

            {/* Copy */}
            <div className="text-center lg:text-left">

              {/* Status pills */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14, flexWrap: 'wrap' }} className="lg:justify-start">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: 999, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: '#10b981' }}>
                  <span className="live-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'block', flexShrink: 0 }} />
                  All systems live
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(37,99,235,0.09)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 999, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: '#60a5fa' }}>
                  <Users size={9} />
                  {userCount !== null ? `${userCount}+ Users` : 'Growing Daily'}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(24px,6.5vw,58px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 12 }}>
                Nigeria's Cheapest{' '}
                <span style={{ background: 'linear-gradient(90deg,#3b82f6,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>Data &amp; Bills</span>{' '}
                Platform
              </h1>

              <p style={{ fontSize: 'clamp(13px,1.6vw,16px)', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20, maxWidth: 460 }} className="mx-auto lg:mx-0">
                Buy MTN 1GB for just{' '}
                <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                  {cheapestMtn ? `₦${cheapestMtn.sellingPrice.toLocaleString()}` : '₦285'}
                </strong>.{' '}
                Pay electricity, cable and airtime in under 10 seconds.
              </p>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }} className="lg:justify-start">
                <Link to="/register" className="btn-primary btn-lg" style={{ gap: 7, fontSize: 13, padding: '11px 22px', boxShadow: '0 5px 20px rgba(37,99,235,0.36)' }}>
                  Get Started Free <ArrowRight size={14} />
                </Link>
                <Link to="/pricing" className="btn-secondary btn-lg" style={{ fontSize: 13, padding: '11px 18px' }}>
                  See Prices
                </Link>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center', fontSize: 11, color: 'var(--text-faint)' }} className="lg:justify-start">
                {['Free to join', 'No hidden fees', 'Instant delivery', 'Secure'].map((t) => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={10} style={{ color: '#10b981', flexShrink: 0 }} /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* App card — only in the 2-col layout (lg+) */}
            <div className="hidden lg:flex justify-center items-center" style={{ padding: '24px 20px' }}>
              <div className="float-hero">
                <AppCard cheapestPlan={cheapestMtn} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICE TICKER ══════════════════════════════════════════════ */}
      {tickerItems.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '9px 0', overflow: 'hidden' }}>
          <div className="ticker-track">
            {tickerItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px', flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: item.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 900, color: item.fg }}>
                  {item.short}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{item.size}</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: '#10b981', whiteSpace: 'nowrap' }}>{item.price}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-hover)', flexShrink: 0, margin: '0 2px' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ STATS ═════════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(24px,4vw,52px) 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'var(--border)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {statItems.map((s) => (
              <div key={s.label} style={{ background: 'var(--bg-surface)', padding: 'clamp(14px,2.5vw,24px) 12px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.7 }} />
                <div style={{ width: 30, height: 30, borderRadius: 9, background: s.color + '18', border: `1px solid ${s.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <s.icon size={13} style={{ color: s.color }} />
                </div>
                <div style={{ fontSize: 'clamp(18px,3.5vw,26px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 1 }}>{s.label}</div>
                <div style={{ fontSize: 9, color: 'var(--text-faint)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(28px,5vw,56px) 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <SectionLabel><Sparkles size={10} /> What we offer</SectionLabel>
            <h2 style={{ fontSize: 'clamp(18px,3.5vw,36px)', fontWeight: 900, lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: 8 }}>
              Everything Under One Roof
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto' }}>
              Every digital service Nigerians need — at rates you won't find elsewhere.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {SERVICES.map((s) => (
              <Link key={s.label} to={s.to}
                style={{ display: 'flex', flexDirection: 'column', padding: '16px 18px', borderRadius: 14, textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)', transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = s.accent + '55'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.2), 0 0 0 1px ${s.accent}22`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${s.accent},transparent)`, opacity: 0.5 }} />
                {s.tag && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: s.accent + '1A', border: `1px solid ${s.accent}30`, borderRadius: 999, padding: '2px 8px', fontSize: 8, fontWeight: 800, color: s.accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.tag}</div>
                )}
                <div style={{ width: 38, height: 38, borderRadius: 11, background: s.accent + '18', border: `1px solid ${s.accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, flexShrink: 0 }}>
                  <s.icon size={17} style={{ color: s.accent }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 5 }}>{s.label}</div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55, flex: 1 }}>{s.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 10, fontSize: 11, fontWeight: 700, color: s.accent }}>
                  Buy now <ChevronRight size={11} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ REAL PRICES ═══════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(28px,5vw,56px) 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <SectionLabel>Real prices</SectionLabel>
            <h2 style={{ fontSize: 'clamp(18px,3.5vw,34px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>
              No Surprises. Ever.
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              What you see is what you pay — zero hidden charges.
            </p>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 80px', padding: '9px 14px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
              {['Network', 'Size', 'Price'].map((h) => (
                <div key={h} style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-faint)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>

            {tablePlans.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 80px', padding: '11px 14px', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', gap: 8 }}>
                    {[70, 36, 44].map((w, j) => (
                      <div key={j} style={{ height: 12, width: w, borderRadius: 4, background: 'var(--bg-elevated)', opacity: 0.5 }} />
                    ))}
                  </div>
                ))
              : tablePlans.map((p, i) => {
                  const n = NET[p.network] || { bg: '#888', fg: '#fff', short: p.network, display: p.network };
                  return (
                    <div key={p._id || i} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 80px', padding: '10px 14px', alignItems: 'center', borderBottom: i < tablePlans.length - 1 ? '1px solid var(--border)' : 'none', background: p.dataType === 'sme' && p.dataSize === '1GB' ? 'rgba(37,99,235,0.04)' : 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 900, color: n.fg, flexShrink: 0 }}>{n.short}</div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{n.display}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'capitalize' }}>{p.dataType}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>{p.dataSize}</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#10b981' }}>₦{p.sellingPrice.toLocaleString()}</div>
                    </div>
                  );
                })
            }
          </div>

          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <Link to="/pricing" style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              View all plans <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(28px,5vw,56px) 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <SectionLabel>Simple process</SectionLabel>
            <h2 style={{ fontSize: 'clamp(18px,3.5vw,36px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>
              Up and Running in 2 Minutes
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 340, margin: '0 auto' }}>
              No forms, no documents. Create, fund, and start saving today.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-2.5">
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ padding: '18px 16px', borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', position: 'relative', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 8, fontWeight: 900, color: 'var(--text-faint)', background: 'var(--bg-elevated)', borderRadius: 5, padding: '2px 7px' }}>0{step.n}</div>
                <div style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', background: i === 1 ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : 'var(--bg-elevated)', border: i === 1 ? 'none' : '1px solid var(--border)', boxShadow: i === 1 ? '0 8px 24px rgba(37,99,235,0.4)' : 'none' }}>
                  <step.icon size={18} style={{ color: i === 1 ? 'white' : 'var(--text-faint)' }} />
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/register" className="btn-primary btn-lg" style={{ gap: 7, fontSize: 13, padding: '11px 22px', boxShadow: '0 5px 20px rgba(37,99,235,0.3)' }}>
              Create Free Account <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ LIVE ACTIVITY ═════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(24px,4vw,48px) 16px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'block', flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live Activity</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#60a5fa' }}>
                  {a.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name} · {a.city}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>{a.item} · {a.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY BORHS ═════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(28px,5vw,56px) 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <SectionLabel>Why we're different</SectionLabel>
            <h2 style={{ fontSize: 'clamp(18px,3.5vw,36px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 7 }}>Built for Real Nigerians</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
              A platform built by Nigerians — with your daily needs in mind.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {FEATURES.map((f) => (
              <div key={f.title} style={{ padding: '16px', borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={15} style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{f.title}</div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(28px,5vw,56px) 16px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 'clamp(18px,3.5vw,34px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 5 }}>Real People. Real Results.</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>What our users say about BORHS Data.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} style={{ padding: '18px', borderRadius: 16, background: i === 1 ? 'linear-gradient(150deg,rgba(37,99,235,0.09) 0%,var(--bg-surface) 100%)' : 'var(--bg-surface)', border: i === 1 ? '1px solid rgba(37,99,235,0.28)' : '1px solid var(--border)', boxShadow: i === 1 ? '0 10px 30px rgba(37,99,235,0.1)' : 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Stars />
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: t.color + '28', border: `2px solid ${t.color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: t.color === '#FFCC00' ? '#a89200' : t.color }}>
                    {t.initial}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ AGENT PROGRAM ═════════════════════════════════════════════ */}
      <section style={{ padding: '0 16px clamp(28px,5vw,56px)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ borderRadius: 18, padding: 'clamp(20px,4vw,38px) clamp(18px,4vw,36px)', background: 'linear-gradient(135deg,rgba(234,179,8,0.1) 0%,rgba(234,179,8,0.03) 100%)', border: '1px solid rgba(234,179,8,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(234,179,8,0.07)', filter: 'blur(50px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 999, padding: '3px 10px', fontSize: 9, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                <Sparkles size={9} /> Agent Program
              </div>
              <h3 style={{ fontSize: 'clamp(15px,2.5vw,24px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>Turn Data Selling into Real Income</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 380, lineHeight: 1.6, marginBottom: 14 }}>
                Earn up to <strong style={{ color: 'var(--text-primary)' }}>5% commission</strong> on every downline purchase — credited instantly.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[{ label: '5% Commission', sub: 'Per transaction' }, { label: 'No Team Cap', sub: 'Unlimited' }, { label: 'Instant Credit', sub: 'Wallet payouts' }].map((b) => (
                  <div key={b.label}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24' }}>{b.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1 }}>{b.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/become-agent" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 20px', borderRadius: 11, fontSize: 13, fontWeight: 800, background: 'linear-gradient(135deg,#eab308,#ca8a04)', color: '#1a1200', textDecoration: 'none', flexShrink: 0, boxShadow: '0 5px 20px rgba(234,179,8,0.35)' }}>
              Apply Now <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════════ */}
      <section style={{ padding: '0 16px clamp(28px,5vw,56px)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ borderRadius: 20, padding: 'clamp(32px,6vw,60px) clamp(18px,5vw,44px)', textAlign: 'center', background: 'linear-gradient(150deg,rgba(37,99,235,0.17) 0%,rgba(15,23,42,0.95) 48%,rgba(16,185,129,0.1) 100%)', border: '1px solid rgba(37,99,235,0.22)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 140, borderRadius: '50%', filter: 'blur(70px)', background: 'rgba(37,99,235,0.18)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 999, padding: '4px 12px', fontSize: 9, fontWeight: 800, color: '#60a5fa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>
                <Sparkles size={9} /> Free for everyone, always
              </div>
              <h2 style={{ fontSize: 'clamp(20px,4.5vw,42px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 10 }}>
                Start Saving Money{' '}
                <span style={{ background: 'linear-gradient(90deg,#3b82f6,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>Right Now</span>
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.65 }}>
                {userCount !== null ? `Join ${userCount}+ Nigerians` : 'Join Nigerians'} who never overpay for data. Sign up in 60 seconds.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn-primary btn-lg" style={{ gap: 7, fontSize: 13, padding: '11px 24px', boxShadow: '0 5px 24px rgba(37,99,235,0.4)' }}>
                  Create Free Account <ArrowRight size={14} />
                </Link>
                <Link to="/login" className="btn-secondary btn-lg" style={{ fontSize: 13, padding: '11px 18px' }}>Sign In</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

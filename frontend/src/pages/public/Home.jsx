import { Link } from 'react-router-dom';
import {
  Wifi, Phone, Zap, Tv, GraduationCap, Shield, Clock, Users, Star,
  ArrowRight, CheckCircle, TrendingUp, Bolt, BadgeCheck, Headphones,
  ChevronRight, Sparkles, Activity, Award,
} from 'lucide-react';

/* ─── Data ─────────────────────────────────────────────────────────── */

const NETWORKS = [
  { id: 'mtn',     name: 'MTN',     bg: '#FFCC00', fg: '#0a0a00' },
  { id: 'airtel',  name: 'Airtel',  bg: '#E11B22', fg: '#ffffff' },
  { id: 'glo',     name: 'Glo',     bg: '#00A651', fg: '#ffffff' },
  { id: '9mobile', name: '9mobile', bg: '#006837', fg: '#76BC21' },
];

const TICKER = [
  { net: 'MTN',     bg: '#FFCC00', fg: '#0a0a00', items: [['500MB','₦140'],['1GB','₦280'],['2GB','₦550'],['5GB','₦1,250']] },
  { net: 'Airtel',  bg: '#E11B22', fg: '#fff',    items: [['1.5GB','₦500'],['3GB','₦950'],['6GB','₦1,800']] },
  { net: 'Glo',     bg: '#00A651', fg: '#fff',    items: [['1GB','₦300'],['5GB','₦1,000'],['10GB','₦1,800']] },
  { net: '9mobile', bg: '#006837', fg: '#76BC21', items: [['1.5GB','₦400'],['4GB','₦1,200']] },
];

const SERVICES = [
  { icon: Wifi,         label: 'Data Bundles',    tag: 'Cheapest',   accent: '#3b82f6', to: '/data',
    desc: 'SME & Corporate data for MTN, Airtel, Glo, 9mobile — up to 40% cheaper than retail.' },
  { icon: Phone,        label: 'Airtime Top-Up',  tag: null,         accent: '#10b981', to: '/airtime',
    desc: 'Instant airtime recharge to any Nigerian network. Works around the clock, every day.' },
  { icon: Zap,          label: 'Electricity',     tag: null,         accent: '#f59e0b', to: '/electricity',
    desc: 'Pay EKEDC, IKEDC, AEDC, PHEDC and all other DISCOs from your phone in seconds.' },
  { icon: Tv,           label: 'Cable TV',        tag: null,         accent: '#8b5cf6', to: '/cable',
    desc: 'Renew DStv, GOtv and Startimes in seconds. Never miss a live match again.' },
  { icon: GraduationCap, label: 'Exam PINs',     tag: null,         accent: '#ef4444', to: '/education',
    desc: 'WAEC, NECO, NABTEB and JAMB result checker ePINs delivered instantly.' },
  { icon: TrendingUp,   label: 'Earn Referrals', tag: 'Side Income', accent: '#10b981', to: '/referrals',
    desc: 'Invite friends, earn up to 5% on every purchase they make — automatically, forever.' },
];

const PLANS_PREVIEW = [
  { net: 'MTN',     bg: '#FFCC00', fg: '#0a0a00', size: '500MB', price: 140 },
  { net: 'MTN',     bg: '#FFCC00', fg: '#0a0a00', size: '1GB',   price: 280,   popular: true },
  { net: 'MTN',     bg: '#FFCC00', fg: '#0a0a00', size: '2GB',   price: 550 },
  { net: 'Airtel',  bg: '#E11B22', fg: '#fff',    size: '1.5GB', price: 500 },
  { net: 'Airtel',  bg: '#E11B22', fg: '#fff',    size: '3GB',   price: 950,   popular: true },
  { net: 'Glo',     bg: '#00A651', fg: '#fff',    size: '1GB',   price: 300 },
];

const STEPS = [
  { n: 1, icon: Users,  title: 'Create Free Account',   desc: 'Sign up in 60 seconds. No ID, no paperwork, no fees — ever.' },
  { n: 2, icon: Shield, title: 'Fund Your Wallet',      desc: 'Bank transfer, card payment, or enter a promo code for instant credit.' },
  { n: 3, icon: Bolt,   title: 'Buy in Seconds',        desc: 'Pick a service, enter your details, and it\'s delivered under 10 seconds.' },
];

const FEATURES = [
  { icon: Bolt,        title: 'Under 10 Seconds',       desc: 'Average delivery time on all services. We are obsessively fast — no exceptions.' },
  { icon: Shield,      title: 'Bank-Grade Security',    desc: 'Your wallet is protected with AES-256 encryption and two-factor authentication.' },
  { icon: BadgeCheck,  title: 'Lowest Prices Guaranteed', desc: 'Find a cheaper VTU price anywhere in Nigeria — we\'ll match it immediately.' },
  { icon: Headphones,  title: 'Real Human Support',     desc: 'WhatsApp and live chat staffed by real people 24/7 — not bots, ever.' },
  { icon: Activity,    title: '99.9% Uptime',           desc: 'Our infrastructure runs on enterprise-grade servers built for five-nines reliability.' },
  { icon: Award,       title: 'Agent Commissions',      desc: 'Resellers earn up to 5% on every transaction from their entire downline network.' },
];

const TESTIMONIALS = [
  { initial: 'AO', color: '#FFCC00', name: 'Adebayo Okonkwo', role: 'Data Reseller · Lagos',
    text: 'Eight months, 200+ customers, zero failed transactions. My customers refuse to let me switch platforms. BORHS just works.' },
  { initial: 'CE', color: '#E11B22', name: 'Chioma Eze', role: 'University Student · Enugu',
    text: '1GB for ₦280 sounds like a lie but it\'s real and instant. I\'ve tried every VTU platform in Nigeria and nothing touches BORHS.' },
  { initial: 'IM', color: '#00A651', name: 'Ibrahim Musa', role: 'Agent · Kano',
    text: 'My referral commissions alone cover my phone bill each month. The platform is fast, the prices are fair, and support always responds.' },
];

const ACTIVITY = [
  { name: 'Emeka O.',    city: 'Lagos',         item: '1GB MTN',          price: '₦280',   ago: '2m ago' },
  { name: 'Fatima A.',   city: 'Kano',          item: '3GB Airtel',       price: '₦950',   ago: '5m ago' },
  { name: 'Chukwudi N.', city: 'Onitsha',       item: 'Electricity token', price: '₦2,000', ago: '8m ago' },
  { name: 'Aisha B.',    city: 'Abuja',         item: '2GB MTN',          price: '₦550',   ago: '11m ago' },
  { name: 'Tunde F.',    city: 'Ibadan',        item: 'DStv Compact',     price: '₦9,000', ago: '14m ago' },
  { name: 'Grace E.',    city: 'Port Harcourt', item: '5GB Glo',          price: '₦1,000', ago: '18m ago' },
];

/* ─── Sub-components ────────────────────────────────────────────────── */

function Stars({ n = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={13} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.18)',
      borderRadius: 999, padding: '6px 16px',
      fontSize: 11, fontWeight: 800, color: '#60a5fa',
      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

function NetChip({ name, bg, fg, short }) {
  return (
    <div style={{
      padding: '6px 12px', borderRadius: 8, background: bg,
      fontSize: 10, fontWeight: 900, color: fg, letterSpacing: '0.04em',
    }}>
      {short || name}
    </div>
  );
}

/* ─── Hero product card ─────────────────────────────────────────────── */
function AppCard() {
  return (
    <div style={{ position: 'relative', width: 320, margin: '0 auto', userSelect: 'none' }}>

      {/* Main card */}
      <div style={{
        background: 'linear-gradient(150deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.96) 100%)',
        border: '1px solid rgba(51,65,85,0.65)',
        borderRadius: 24, padding: 26,
        boxShadow: '0 48px 120px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
      }}>

        {/* Balance row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Wallet Balance
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.02em' }}>
              ₦12,500<span style={{ fontSize: 18, color: '#475569', fontWeight: 600 }}>.00</span>
            </div>
          </div>
          <div style={{
            width: 42, height: 42, borderRadius: 13, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0.08) 100%)',
            border: '1px solid rgba(37,99,235,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wifi size={19} style={{ color: '#60a5fa' }} />
          </div>
        </div>

        {/* Recent transaction */}
        <div style={{
          background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.14)',
          borderRadius: 14, padding: '14px 16px', marginBottom: 18,
        }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Last Purchase
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: '#FFCC00', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 900, color: '#0a0a00',
            }}>MTN</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 3 }}>1GB SME Data</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={11} style={{ color: '#10b981' }} />
                Delivered in 4 seconds
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f1f5f9' }}>₦280</div>
          </div>
        </div>

        {/* Network grid */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.04em', marginBottom: 10 }}>Networks</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
            {NETWORKS.map((n) => (
              <div key={n.id} style={{
                height: 32, borderRadius: 9,
                background: n.bg + '1A', border: `1px solid ${n.bg}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 900,
                color: n.bg === '#FFCC00' ? '#a89200' : n.fg === '#fff' ? n.bg : n.fg,
              }}>
                {n.id === '9mobile' ? '9m' : n.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating "delivered" badge — top right */}
      <div style={{
        position: 'absolute', top: -16, right: -16,
        background: 'linear-gradient(135deg, rgba(16,185,129,0.97), rgba(5,150,105,0.97))',
        borderRadius: 16, padding: '10px 14px',
        boxShadow: '0 8px 28px rgba(16,185,129,0.4), 0 0 0 1px rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={14} style={{ color: 'white' }} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Delivered!</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>2GB Airtel · ₦500</div>
        </div>
      </div>

      {/* Floating speed badge — bottom left */}
      <div style={{
        position: 'absolute', bottom: -16, left: -16,
        background: 'rgba(9,11,17,0.96)',
        border: '1px solid rgba(37,99,235,0.3)',
        borderRadius: 16, padding: '10px 14px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(37,99,235,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bolt size={13} style={{ color: '#60a5fa' }} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>~6 seconds</div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>Avg. delivery time</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function Home() {
  // Build flat ticker items once
  const tickerFlat = TICKER.flatMap((t) =>
    t.items.map((it) => ({ net: t.net, bg: t.bg, fg: t.fg, size: it[0], price: it[1] }))
  );
  const tickerItems = [...tickerFlat, ...tickerFlat, ...tickerFlat, ...tickerFlat];

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: scrollLeft 40s linear infinite;
        }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        .float-hero { animation: floatCard 7s ease-in-out infinite; }
        @keyframes livePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          50%       { opacity: 0.8; box-shadow: 0 0 0 6px rgba(16,185,129,0); }
        }
        .live-dot { animation: livePulse 2s ease-in-out infinite; }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', padding: '80px 0 110px', overflow: 'hidden' }}>

        {/* Ambient glows */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, borderRadius: '50%', filter: 'blur(160px)', background: 'radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: 0, right: '-5%', width: 500, height: 500, borderRadius: '50%', filter: 'blur(120px)', background: 'radial-gradient(ellipse, rgba(16,185,129,0.09) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '40%', left: '-3%', width: 320, height: 320, borderRadius: '50%', filter: 'blur(100px)', background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)' }} />
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left copy */}
            <div className="text-center lg:text-left">

              {/* Trust badges */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 30, flexWrap: 'wrap' }} className="lg:justify-start">
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.22)',
                  borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#10b981',
                }}>
                  <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'block', flexShrink: 0 }} />
                  All systems live
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'rgba(37,99,235,0.09)', border: '1px solid rgba(37,99,235,0.2)',
                  borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#60a5fa',
                }}>
                  <Users size={11} /> Trusted by 300+ Nigerians
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 900,
                lineHeight: 1.05, letterSpacing: '-0.02em',
                color: 'var(--text-primary)', marginBottom: 22,
              }}>
                Nigeria's Cheapest
                <br />
                <span style={{
                  background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>Data &amp; Bills</span>
                <br />
                Platform
              </h1>

              <p style={{
                fontSize: 'clamp(15px, 1.8vw, 18px)', color: 'var(--text-muted)',
                lineHeight: 1.72, marginBottom: 36, maxWidth: 500,
              }} className="mx-auto lg:mx-0">
                Buy MTN 1GB for just{' '}
                <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>₦280</strong>.
                Pay electricity, cable and airtime in under 10 seconds.
                Used daily by thousands of Nigerians.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }} className="lg:justify-start">
                <Link to="/register" className="btn-primary btn-lg" style={{
                  gap: 8, fontSize: 15, padding: '14px 30px',
                  boxShadow: '0 8px 28px rgba(37,99,235,0.38)',
                }}>
                  Get Started Free <ArrowRight size={17} />
                </Link>
                <Link to="/pricing" className="btn-secondary btn-lg" style={{ fontSize: 15, padding: '14px 28px' }}>
                  See All Prices
                </Link>
              </div>

              {/* Trust row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', justifyContent: 'center', fontSize: 13, color: 'var(--text-faint)' }} className="lg:justify-start">
                {['Free to join', 'No hidden fees', 'Instant delivery', 'Secure payments'].map((t) => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: floating app card */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 24px' }}>
              <div className="float-hero">
                <AppCard />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ PRICE TICKER ══════════════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '13px 0', overflow: 'hidden' }}>
        <div className="ticker-track">
          {tickerItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', flexShrink: 0 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7, background: item.bg, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 900, color: item.fg,
              }}>
                {item.net === '9mobile' ? '9m' : item.net}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{item.size}</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#10b981', whiteSpace: 'nowrap' }}>{item.price}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-hover)', flexShrink: 0, margin: '0 6px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ══ STATS ═════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'var(--border)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {[
              { value: '300+',  label: 'Active Users',       sub: 'and growing',       icon: Users,    color: '#3b82f6' },
              { value: '₦500K+', label: 'Processed',         sub: 'in transactions',   icon: TrendingUp, color: '#10b981' },
              { value: '99.9%', label: 'Platform Uptime',    sub: 'guaranteed SLA',    icon: Activity, color: '#8b5cf6' },
              { value: '<10s',  label: 'Delivery Speed',     sub: 'average time',      icon: Clock,    color: '#f59e0b' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'var(--bg-surface)', padding: '32px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, opacity: 0.7 }} />
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: s.color + '18', border: `1px solid ${s.color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <s.icon size={19} style={{ color: s.color }} />
                </div>
                <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════════════ */}
      <section style={{ padding: '40px 24px 100px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '70px 0 56px' }}>
            <SectionLabel><Sparkles size={11} /> What we offer</SectionLabel>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 14 }}>
              Everything Under One Roof
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
              Every digital service Nigerians need — at rates you won't find anywhere else.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s) => (
              <Link key={s.label} to={s.to}
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: 28, borderRadius: 20, textDecoration: 'none',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = s.accent + '55';
                  e.currentTarget.style.boxShadow = `0 20px 48px rgba(0,0,0,0.25), 0 0 0 1px ${s.accent}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.accent} 0%, transparent 100%)`, opacity: 0.6 }} />

                {s.tag && (
                  <div style={{
                    position: 'absolute', top: 20, right: 20,
                    background: s.accent + '1A', border: `1px solid ${s.accent}30`,
                    borderRadius: 999, padding: '3px 10px',
                    fontSize: 9, fontWeight: 800, color: s.accent, letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>{s.tag}</div>
                )}

                <div style={{
                  width: 50, height: 50, borderRadius: 15,
                  background: s.accent + '18', border: `1px solid ${s.accent}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22,
                }}>
                  <s.icon size={23} style={{ color: s.accent }} />
                </div>

                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>{s.label}</div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, flex: 1 }}>{s.desc}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 22, fontSize: 12, fontWeight: 700, color: s.accent }}>
                  Buy now <ChevronRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ACTUAL PRICES ═════════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <SectionLabel>Real prices</SectionLabel>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>
              No Surprises. Ever.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
              What you see is exactly what you pay. Zero hidden charges, zero markup.
            </p>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', padding: '13px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
              {['Network', 'Bundle', 'Price', 'Validity'].map((h) => (
                <div key={h} style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>

            {PLANS_PREVIEW.map((p, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
                padding: '17px 20px', alignItems: 'center',
                borderBottom: i < PLANS_PREVIEW.length - 1 ? '1px solid var(--border)' : 'none',
                background: p.popular ? 'rgba(37,99,235,0.04)' : 'transparent',
                transition: 'background 0.15s',
              }}>
                {/* Network */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: p.fg, flexShrink: 0 }}>
                    {p.net === '9mobile' ? '9m' : p.net}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{p.net}</span>
                </div>

                {/* Bundle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{p.size}</span>
                  {p.popular && (
                    <span style={{ fontSize: 9, fontWeight: 800, background: 'rgba(37,99,235,0.14)', color: '#60a5fa', borderRadius: 999, padding: '2px 8px', border: '1px solid rgba(37,99,235,0.22)' }}>
                      Popular
                    </span>
                  )}
                </div>

                {/* Price */}
                <div style={{ fontSize: 17, fontWeight: 900, color: '#10b981' }}>
                  ₦{p.price.toLocaleString()}
                </div>

                {/* Validity */}
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-faint)' }}>30 days</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 22 }}>
            <Link to="/pricing" style={{ fontSize: 14, fontWeight: 700, color: '#60a5fa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              View all plans and prices <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px 100px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionLabel>Simple process</SectionLabel>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>
              Up and Running in 2 Minutes
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto' }}>
              No forms, no documents, no waiting. Create, fund, and start saving today.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <div key={step.n} style={{
                padding: '32px 26px 28px', borderRadius: 22,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                position: 'relative', textAlign: 'center',
              }}>
                {/* Step number */}
                <div style={{
                  position: 'absolute', top: 18, right: 18,
                  fontSize: 10, fontWeight: 900, color: 'var(--text-faint)',
                  background: 'var(--bg-elevated)', borderRadius: 8, padding: '3px 9px',
                }}>0{step.n}</div>

                {/* Icon circle */}
                <div style={{
                  width: 56, height: 56, borderRadius: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 22px',
                  background: i === 1
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : 'var(--bg-elevated)',
                  border: i === 1 ? 'none' : '1px solid var(--border)',
                  boxShadow: i === 1 ? '0 12px 36px rgba(37,99,235,0.45)' : 'none',
                }}>
                  <step.icon size={23} style={{ color: i === 1 ? 'white' : 'var(--text-faint)' }} />
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <Link to="/register" className="btn-primary btn-lg" style={{ gap: 8, boxShadow: '0 8px 28px rgba(37,99,235,0.32)' }}>
              Create Free Account <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ LIVE ACTIVITY ═════════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <span className="live-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'block', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Live Activity Feed
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 14,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                  background: 'rgba(37,99,235,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 900, color: '#60a5fa',
                }}>
                  {a.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.name} · {a.city}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                    {a.item}{a.price ? ` · ${a.price}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', whiteSpace: 'nowrap', flexShrink: 0 }}>{a.ago}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY BORHS ═════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px 100px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <SectionLabel>Why we're different</SectionLabel>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>
              Built for Real Nigerians
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
              Not a startup experiment. A platform built by Nigerians, for Nigerians, with your actual daily needs in mind.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                padding: '24px 22px', borderRadius: 18,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 13,
                  background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.icon size={19} style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 7 }}>{f.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.68 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 10 }}>
              Real People. Real Results.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
              300+ Nigerians already know. Here's what they say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} style={{
                padding: 28, borderRadius: 22,
                background: i === 1
                  ? 'linear-gradient(150deg, rgba(37,99,235,0.09) 0%, var(--bg-surface) 100%)'
                  : 'var(--bg-surface)',
                border: i === 1 ? '1px solid rgba(37,99,235,0.28)' : '1px solid var(--border)',
                boxShadow: i === 1 ? '0 16px 48px rgba(37,99,235,0.13)' : 'none',
                display: 'flex', flexDirection: 'column', gap: 18,
              }}>
                <Stars />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.72, flex: 1 }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                    background: t.color + '28', border: `2px solid ${t.color}45`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 900,
                    color: t.color === '#FFCC00' ? '#a89200' : t.color,
                  }}>{t.initial}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ AGENT PROGRAM ═════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{
            borderRadius: 28, padding: '52px 48px', overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(234,179,8,0.1) 0%, rgba(234,179,8,0.03) 100%)',
            border: '1px solid rgba(234,179,8,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 36, position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(234,179,8,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)',
                borderRadius: 999, padding: '5px 14px',
                fontSize: 11, fontWeight: 800, color: '#fbbf24',
                letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 18,
              }}>
                <Sparkles size={11} /> Agent Program
              </div>

              <h3 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>
                Turn Data Selling into Real Income
              </h3>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 440, lineHeight: 1.68, marginBottom: 24 }}>
                Apply to become a BORHS Agent. Earn up to{' '}
                <strong style={{ color: 'var(--text-primary)' }}>5% commission</strong> on every purchase
                from your entire downline — credited instantly to your wallet.
              </p>

              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                {[
                  { label: '5% Commission', sub: 'Per transaction' },
                  { label: 'No Team Cap',   sub: 'Unlimited downlines' },
                  { label: 'Instant Credit', sub: 'Wallet payouts' },
                ].map((b) => (
                  <div key={b.label}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>{b.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{b.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/become-agent" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 28px', borderRadius: 14, fontSize: 15, fontWeight: 800,
              background: 'linear-gradient(135deg, #eab308, #ca8a04)',
              color: '#1a1200', textDecoration: 'none', flexShrink: 0,
              boxShadow: '0 8px 28px rgba(234,179,8,0.38)',
            }}>
              Apply Now <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{
            borderRadius: 32, padding: '80px 48px', textAlign: 'center',
            background: 'linear-gradient(150deg, rgba(37,99,235,0.18) 0%, rgba(15,23,42,0.95) 48%, rgba(16,185,129,0.1) 100%)',
            border: '1px solid rgba(37,99,235,0.22)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Glow */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 500, height: 220, borderRadius: '50%', filter: 'blur(90px)', background: 'rgba(37,99,235,0.2)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
                borderRadius: 999, padding: '6px 16px',
                fontSize: 11, fontWeight: 800, color: '#60a5fa',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 26,
              }}>
                <Sparkles size={11} /> Free for everyone, always
              </div>

              <h2 style={{
                fontSize: 'clamp(30px, 5vw, 54px)', fontWeight: 900,
                color: 'var(--text-primary)', lineHeight: 1.08,
                letterSpacing: '-0.02em', marginBottom: 18,
              }}>
                Start Saving Money
                <br />
                <span style={{ background: 'linear-gradient(90deg, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Right Now
                </span>
              </h2>

              <p style={{ fontSize: 17, color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.68 }}>
                Join 300+ Nigerians who never overpay for data. Sign up takes 60 seconds.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn-primary btn-lg" style={{ gap: 8, fontSize: 15, padding: '14px 32px', boxShadow: '0 8px 32px rgba(37,99,235,0.42)' }}>
                  Create Free Account <ArrowRight size={17} />
                </Link>
                <Link to="/login" className="btn-secondary btn-lg" style={{ fontSize: 15, padding: '14px 28px' }}>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

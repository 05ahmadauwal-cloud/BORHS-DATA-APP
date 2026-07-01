import { Link } from 'react-router-dom';
import {
  Wifi, Phone, Zap, Tv, GraduationCap, Shield, Clock, Users, Star,
  ArrowRight, CheckCircle, TrendingUp, Bolt, BadgeCheck, Headphones,
  ChevronRight, Sparkles,
} from 'lucide-react';

const networks = [
  { name: 'MTN', bg: 'bg-yellow-400', text: 'text-yellow-900', short: 'M' },
  { name: 'Airtel', bg: 'bg-red-500', text: 'text-white', short: 'A' },
  { name: 'Glo', bg: 'bg-green-600', text: 'text-white', short: 'G' },
  { name: '9mobile', bg: 'bg-teal-500', text: 'text-white', short: '9' },
];

const services = [
  {
    icon: Wifi, label: 'Data Bundles', tag: 'Most Popular',
    desc: 'SME, Corporate & gifting data — MTN, Airtel, Glo, 9mobile at the cheapest rates.',
    color: 'from-blue-500/20 to-blue-600/5', iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400', border: 'hover:border-blue-500/30',
    to: '/data',
  },
  {
    icon: Phone, label: 'Airtime Top-Up', tag: null,
    desc: 'Instant airtime recharge to any Nigerian network 24/7.',
    color: 'from-green-500/20 to-green-600/5', iconBg: 'bg-green-500/15', iconColor: 'text-green-400', border: 'hover:border-green-500/30',
    to: '/airtime',
  },
  {
    icon: Zap, label: 'Electricity Bills', tag: null,
    desc: 'Pay IKEDC, EKEDC, AEDC, PHEDC & all other DISCOs instantly.',
    color: 'from-yellow-500/20 to-yellow-600/5', iconBg: 'bg-yellow-500/15', iconColor: 'text-yellow-400', border: 'hover:border-yellow-500/30',
    to: '/electricity',
  },
  {
    icon: Tv, label: 'Cable TV', tag: null,
    desc: 'Renew DStv, GOtv, Startimes subscriptions in seconds.',
    color: 'from-purple-500/20 to-purple-600/5', iconBg: 'bg-purple-500/15', iconColor: 'text-purple-400', border: 'hover:border-purple-500/30',
    to: '/cable',
  },
  {
    icon: GraduationCap, label: 'Exam PINs', tag: null,
    desc: 'Scratch WAEC, NECO, NABTEB & JAMB ePIN checker cards.',
    color: 'from-red-500/20 to-red-600/5', iconBg: 'bg-red-500/15', iconColor: 'text-red-400', border: 'hover:border-red-500/30',
    to: '/education',
  },
  {
    icon: TrendingUp, label: 'Referral Earnings', tag: 'Earn Cash',
    desc: 'Invite friends, earn up to 5% commission on every purchase they make.',
    color: 'from-success-500/20 to-success-500/5', iconBg: 'bg-success-500/15', iconColor: 'text-success-500', border: 'hover:border-success-500/30',
    to: '/referrals',
  },
];

const stats = [
  { value: '300+', label: 'Active Users', icon: Users },
  { value: '₦500K+', label: 'Processed', icon: TrendingUp },
  { value: '99.9%', label: 'Uptime', icon: Shield },
  { value: '< 10s', label: 'Avg Delivery', icon: Clock },
];

const features = [
  { icon: Bolt, title: 'Instant Delivery', desc: 'Data and airtime credited in under 10 seconds, every time.' },
  { icon: Shield, title: 'Bank-Level Security', desc: 'Your wallet and transactions are protected with enterprise-grade encryption.' },
  { icon: BadgeCheck, title: 'Best Prices in Nigeria', desc: 'We beat any VTU price. Guaranteed lowest rates on all networks.' },
  { icon: Headphones, title: '24/7 Support', desc: 'Real humans on WhatsApp and live chat — always available.' },
];

const steps = [
  { n: '01', title: 'Create Free Account', desc: 'Sign up in under 60 seconds — no paperwork, no fees.' },
  { n: '02', title: 'Fund Your Wallet', desc: 'Bank transfer, card payment, or use a promo code to top up.' },
  { n: '03', title: 'Buy Instantly', desc: 'Choose a service, enter details, and you\'re done. That fast.' },
];

const testimonials = [
  { name: 'Adebayo Okonkwo', role: 'Reseller Agent', text: 'BORHS Data transformed my business. Cheapest rates + instant delivery keeps my 200+ customers loyal.', stars: 5 },
  { name: 'Chioma Eze', role: 'Customer', text: 'Six months in, not a single failed transaction. The app is crazy fast and simple to use.', stars: 5 },
  { name: 'Ibrahim Musa', role: 'Side Hustler', text: 'Referral commissions alone cover my subscription costs. This platform is legitimately the best.', stars: 5 },
];

export default function Home() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative py-20 md:py-28 lg:py-36 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[160px]"
            style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 text-sm font-semibold"
              style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', color: '#60a5fa' }}>
              <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse shrink-0" />
              All systems live · Trusted by 300+ Nigerians
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] mb-6"
              style={{ color: 'var(--text-primary)' }}>
              Buy Data & Pay Bills
              <br />
              <span className="gradient-text">Cheaper & Faster</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
              style={{ color: 'var(--text-muted)' }}>
              MTN, Airtel, Glo, 9mobile data bundles, airtime, electricity, cable TV and exam PINs — all under one roof at Nigeria's lowest prices.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Link to="/register"
                className="btn-primary btn-lg gap-2 group text-base"
                style={{ padding: '14px 32px' }}>
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/pricing" className="btn-secondary btn-lg text-base" style={{ padding: '14px 32px' }}>
                See Pricing
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm"
              style={{ color: 'var(--text-faint)' }}>
              {['No registration fee', 'Instant delivery', '24/7 support', 'Secure payments'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-success-500 shrink-0" />
                  {t}
                </span>
              ))}
            </div>

            {/* Network pills */}
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              <span className="text-xs mr-1" style={{ color: 'var(--text-faint)' }}>Works with</span>
              {networks.map((n) => (
                <span key={n.name}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${n.bg} ${n.text}`}>
                  {n.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 border-y" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {stats.map((s) => (
              <div key={s.label} className="text-center space-y-1">
                <p className="text-3xl md:text-4xl font-black gradient-text">{s.value}</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest mb-3 text-primary-400">What we offer</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4"
              style={{ color: 'var(--text-primary)' }}>
              Everything in One Place
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Every digital payment service Nigerians need — faster, cheaper, and more reliable than anywhere else.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <Link
                key={s.label}
                to={s.to}
                className={`group relative flex flex-col p-6 rounded-2xl bg-gradient-to-br ${s.color} border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${s.border}`}
                style={{ borderColor: 'var(--border)' }}
              >
                {s.tag && (
                  <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                    {s.tag}
                  </span>
                )}
                <div className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center mb-4 ${s.iconColor}`}>
                  <s.icon size={22} />
                </div>
                <h3 className="font-bold text-base mb-1.5" style={{ color: 'var(--text-primary)' }}>{s.label}</h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-primary-400 group-hover:gap-2 transition-all">
                  Get started <ChevronRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24" style={{ background: 'var(--bg-surface)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest mb-3 text-primary-400">Simple process</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              Up and Running in 3 Steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
              style={{ background: 'linear-gradient(90deg, var(--border) 0%, rgba(37,99,235,0.4) 50%, var(--border) 100%)' }} />

            {steps.map((step, i) => (
              <div key={step.n} className="relative flex flex-col items-center text-center p-6 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 font-black text-lg relative z-10"
                  style={{
                    background: i === 1
                      ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                      : 'var(--bg-elevated)',
                    color: i === 1 ? 'white' : 'var(--text-faint)',
                    border: i === 1 ? 'none' : '1px solid var(--border)',
                    boxShadow: i === 1 ? '0 8px 24px rgba(37,99,235,0.4)' : undefined,
                  }}>
                  {step.n}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/register" className="btn-primary btn-lg gap-2 group">
              Create Free Account
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US + TESTIMONIALS ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Features */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3 text-primary-400">Why we're different</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-8"
                style={{ color: 'var(--text-primary)' }}>
                Built for Nigerian
                <br /><span className="gradient-text">Speed & Savings</span>
              </h2>
              <div className="space-y-5">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-4 p-4 rounded-2xl transition-colors"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <f.icon size={18} className="text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest mb-5 text-primary-400">What users say</p>
              {testimonials.map((t, i) => (
                <div key={t.name}
                  className="p-5 rounded-2xl transition-all"
                  style={{
                    background: i === 0 ? 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, var(--bg-card) 100%)' : 'var(--bg-card)',
                    border: i === 0 ? '1px solid rgba(37,99,235,0.25)' : '1px solid var(--border)',
                  }}>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-primary-400 font-bold text-xs">{t.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AGENT PROMO BANNER ── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden p-7 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(234,179,8,0.04) 100%)', border: '1px solid rgba(234,179,8,0.25)' }}>
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #eab308 0%, transparent 70%)' }} />
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-yellow-400" />
                <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Agent Program</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
                Earn Money Selling Data
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Apply to be a BORHS Agent. Earn commission on every transaction your downlines make.
              </p>
            </div>
            <Link to="/become-agent"
              className="btn-lg gap-2 shrink-0 font-bold"
              style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)', color: '#1a1a00', borderRadius: '12px', padding: '12px 28px' }}>
              Become an Agent <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden text-center p-10 sm:p-16"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, var(--bg-card) 50%, rgba(16,185,129,0.1) 100%)',
              border: '1px solid rgba(37,99,235,0.2)',
            }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl rounded-full pointer-events-none"
              style={{ background: 'rgba(37,99,235,0.2)' }} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-bold"
                style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.25)' }}>
                <Sparkles size={12} /> Free forever for customers
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
                Start Saving Money Today
              </h2>
              <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                Join 300+ Nigerians who trust BORHS Data for daily top-ups. No fees, no delays.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className="btn-primary btn-lg gap-2 group text-base">
                  Create Free Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/pricing" className="btn-secondary btn-lg text-base">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

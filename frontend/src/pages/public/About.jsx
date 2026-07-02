import { Shield, Zap, Heart, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PILLARS = [
  { icon: Zap,    title: 'Our Mission',   color: '#fbbf24', desc: 'Fastest and cheapest VTU services in Nigeria — empowering individuals and businesses alike.' },
  { icon: Shield, title: 'Our Values',    color: '#60a5fa', desc: 'Transparency, reliability and customer satisfaction guide every decision we make.' },
  { icon: Heart,  title: 'Our Community', color: '#f87171', desc: "Built for Nigerians, by Nigerians. We understand this market like no one else." },
  { icon: Users,  title: 'Our Team',      color: '#34d399', desc: 'Dedicated tech enthusiasts working round the clock to keep the platform running 24/7.' },
];

export default function About() {
  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── Header ── */}
      <section style={{ padding: 'clamp(28px,5vw,60px) 16px clamp(20px,4vw,48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '70vw', maxWidth: 700, height: 300, borderRadius: '50%', filter: 'blur(120px)', background: 'radial-gradient(ellipse,rgba(37,99,235,0.11) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <h1 style={{ fontSize: 'clamp(24px,5vw,52px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
            About <span className="gradient-text">BORHS Data</span>
          </h1>
          <p style={{ fontSize: 'clamp(13px,1.6vw,16px)', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            Nigeria's most trusted VTU and bills payment platform. On a mission to make digital payments fast, affordable, and accessible to every Nigerian — from individuals to businesses.
          </p>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section style={{ padding: '0 16px clamp(28px,5vw,56px)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', paddingTop: 'clamp(24px,4vw,48px)' }}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PILLARS.map((item) => (
              <div key={item.title} className="card" style={{ padding: 'clamp(16px,3vw,24px)', textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: item.color + '18', border: `1px solid ${item.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: item.color }}>
                  <item.icon size={18} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section style={{ padding: 'clamp(24px,4vw,48px) 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Our Story</p>
          <h2 style={{ fontSize: 'clamp(18px,3.5vw,32px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.15 }}>
            Built out of Frustration, Refined by Purpose
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 10 }}>
            BORHS Data was born when our founder got tired of paying inflated prices for mobile data. After months of research and development, we launched a platform that connects Nigerians directly to network operators — cutting out the middlemen and passing the savings straight to you.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75 }}>
            Today, thousands of Nigerians — from students and professionals to small business owners and data resellers — trust BORHS Data every single day to top up their phones, pay electricity bills, renew cable TV subscriptions, and much more. All in under 10 seconds.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'clamp(24px,4vw,48px) 16px clamp(28px,5vw,56px)' }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <div className="card" style={{ padding: 'clamp(24px,5vw,48px)', textAlign: 'center', background: 'linear-gradient(135deg,rgba(37,99,235,0.1) 0%,var(--bg-card) 50%,rgba(16,185,129,0.05) 100%)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <h2 style={{ fontSize: 'clamp(18px,3.5vw,32px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>Ready to Join Us?</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 380, margin: '0 auto 18px', lineHeight: 1.65 }}>
              Start saving money on data and bills today. Join thousands of Nigerians already using BORHS Data.
            </p>
            <Link to="/register" className="btn-primary btn-lg" style={{ gap: 7, fontSize: 13, padding: '11px 22px', boxShadow: '0 5px 20px rgba(37,99,235,0.3)' }}>
              Create Free Account <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

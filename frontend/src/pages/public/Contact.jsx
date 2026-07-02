import { Mail, Phone, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const CHANNELS = [
  { icon: Mail,          title: 'Email Support', value: '05ahmadauwal@gmail.com', sub: 'We reply within 2 hours',     href: 'mailto:05ahmadauwal@gmail.com' },
  { icon: Phone,         title: 'Phone Support', value: '+234 706 589 6598',      sub: 'Mon–Fri, 8am–10pm',           href: 'tel:+2347065896598' },
  { icon: MessageSquare, title: 'WhatsApp',      value: '+234 706 589 6598',      sub: '24/7 automated + live support', href: 'https://wa.me/2347065896598' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent! We'll respond within 24 hours.");
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── Header ── */}
      <section style={{ padding: 'clamp(28px,5vw,56px) 16px clamp(20px,4vw,40px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '60vw', maxWidth: 600, height: 260, borderRadius: '50%', filter: 'blur(120px)', background: 'radial-gradient(ellipse,rgba(37,99,235,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 'clamp(22px,5vw,46px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Get In <span className="gradient-text">Touch</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            We're here to help — reach us through any channel below.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section style={{ padding: '0 16px clamp(28px,5vw,60px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="grid md:grid-cols-2 gap-5 md:gap-8">

            {/* Channels */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {CHANNELS.map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="card"
                    style={{ display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'flex-start', textDecoration: 'none', transition: 'border-color 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ width: 36, height: 36, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={15} style={{ color: '#60a5fa' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', marginBottom: 2 }}>{item.title}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa', marginBottom: 2 }}>{item.value}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>{item.sub}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Response time note */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <Clock size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Average response time: under 2 hours.</strong> For urgent issues, WhatsApp is fastest — we have live agents available.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="card" style={{ padding: 'clamp(18px,4vw,28px)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>Send a Message</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Name</label>
                    <input
                      className="input"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input
                    className="input"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea
                    className="input resize-none"
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full" style={{ marginTop: 2, fontSize: 13 }}>
                  Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

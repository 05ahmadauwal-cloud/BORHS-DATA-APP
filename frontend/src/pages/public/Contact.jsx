import { Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const submit = (event) => { event.preventDefault(); toast.success("Message sent. We'll respond within 24 hours."); setForm({ name: '', email: '', subject: '', message: '' }); };
  return <div>
    <section className="mx-4 mt-4 rounded-[2rem] bg-[#e8eee7] px-6 py-16 sm:mx-6 sm:px-12 sm:py-20 lg:mx-auto lg:max-w-7xl"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><div><p className="public-kicker">Real people, ready to help</p><h1 className="mt-5 text-5xl font-bold leading-[0.95] tracking-[-0.05em] text-[#073b2a] sm:text-7xl">Let’s solve it together.</h1></div><p className="max-w-xl text-base leading-7 text-[#315c4d] lg:justify-self-end">Whether a transaction needs attention or you simply want to understand a service, tell us what happened in plain language.</p></div></section>
    <section className="mx-auto grid max-w-6xl gap-8 px-5 py-20 lg:grid-cols-[0.75fr_1.25fr] lg:px-8"><div className="space-y-4">{[
      [MessageCircle, 'WhatsApp', '+234 706 589 6598', 'https://wa.me/2347065896598'],
      [Mail, 'Email', '05ahmadauwal@gmail.com', 'mailto:05ahmadauwal@gmail.com'],
      [Phone, 'Phone', '+234 706 589 6598', 'tel:+2347065896598'],
    ].map(([Icon, title, value, href]) => <a key={title} href={href} className="flex items-center gap-4 rounded-[1.5rem] bg-[#f0f2ec] p-5 transition hover:-translate-y-0.5"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0f766e]"><Icon size={20} /></span><span><span className="block text-xs font-bold uppercase tracking-wider text-[#789084]">{title}</span><span className="mt-1 block text-sm font-bold text-[#073b2a]">{value}</span></span></a>)}</div>
      <form onSubmit={submit} className="rounded-[2rem] bg-[#073b2a] p-6 text-white sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-400">Send a message</p><h2 className="mt-3 text-3xl font-bold">What can we help with?</h2><div className="mt-8 grid gap-4 sm:grid-cols-2"><input className="public-input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><input className="public-input" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div><input className="public-input mt-4" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /><textarea className="public-input mt-4 min-h-36 resize-y py-4" placeholder="Tell us what happened…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /><button className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-bold text-[#073b2a] transition hover:bg-amber-300">Send message <Send size={16} /></button></form>
    </section>
  </div>;
}

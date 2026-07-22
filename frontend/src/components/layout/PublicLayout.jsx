import { Outlet, Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import WhatsAppButton from '../ui/WhatsAppButton';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  useEffect(() => { document.body.style.overflow = menuOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [menuOpen]);

  return (
    <div className="public-site min-h-screen bg-[#fafaf7] text-[#103c2d]">
      <header className="sticky top-0 z-40 border-b border-[#103c2d]/10 bg-[#fafaf7]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="shrink-0"><img src="/logo.png" alt="BORHS Data" className="h-11 w-auto" /></Link>
          <nav className="hidden items-center gap-8 md:flex">{navLinks.map(({ to, label }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `text-xs font-bold uppercase tracking-[0.08em] transition ${isActive ? 'text-[#0f766e]' : 'text-[#103c2d]/70 hover:text-[#0f766e]'}`}>{label}</NavLink>)}</nav>
          <div className="hidden items-center gap-2 md:flex">{isAuthenticated ? <Link to="/dashboard" className="public-btn-primary">Dashboard <ArrowRight size={15} /></Link> : <><Link to="/login" className="public-btn-ghost">Sign in</Link><Link to="/register" className="public-btn-primary">Get started</Link></>}</div>
          <button type="button" onClick={() => setMenuOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#103c2d]/15 md:hidden" aria-label="Open menu"><Menu size={22} /></button>
        </div>
      </header>

      <div className={`fixed inset-0 z-50 transition md:hidden ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <button className={`absolute inset-0 bg-[#082c21]/45 transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMenuOpen(false)} aria-label="Close menu" />
        <aside className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-[#fafaf7] p-6 shadow-2xl transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between"><img src="/logo.png" alt="BORHS Data" className="h-10 w-auto" /><button onClick={() => setMenuOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef1e9]" aria-label="Close"><X size={18} /></button></div>
          <nav className="mt-12 space-y-2">{navLinks.map(({ to, label }, index) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center justify-between border-b border-[#103c2d]/10 py-5 text-2xl font-bold ${isActive ? 'text-[#0f766e]' : ''}`}><span>{label}</span><span className="text-xs font-medium">0{index + 1}</span></NavLink>)}</nav>
          <div className="mt-auto grid gap-3">{isAuthenticated ? <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="public-btn-primary justify-center">Open dashboard</Link> : <><Link to="/register" onClick={() => setMenuOpen(false)} className="public-btn-primary justify-center">Create free account</Link><Link to="/login" onClick={() => setMenuOpen(false)} className="public-btn-outline justify-center">Sign in</Link></>}</div>
        </aside>
      </div>

      <main><Outlet /></main>
      <footer className="mx-4 mb-4 mt-20 rounded-[2rem] bg-[#073b2a] px-6 py-12 text-white sm:mx-6 sm:px-10 lg:mx-auto lg:max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]"><div><img src="/logo.png" alt="BORHS Data" className="h-12 w-auto rounded-xl bg-white p-1" /><p className="mt-5 max-w-xs text-sm leading-6 text-white/65">One dependable balance for data, airtime, bills and everyday Nigerian payments.</p></div>{[
          ['Services', [['Data', '/data'], ['Airtime', '/airtime'], ['Electricity', '/electricity'], ['Cable TV', '/cable']]],
          ['Company', [['About', '/about'], ['Pricing', '/pricing'], ['Contact', '/contact'], ['Agents', '/become-agent']]],
          ['Account', [['Create account', '/register'], ['Sign in', '/login'], ['Dashboard', '/dashboard'], ['Support', '/contact']]],
        ].map(([title, items]) => <div key={title}><p className="text-xs font-bold uppercase tracking-widest text-amber-400">{title}</p><ul className="mt-4 space-y-3">{items.map(([label, to]) => <li key={label}><Link to={to} className="text-sm text-white/70 transition hover:text-white">{label}</Link></li>)}</ul></div>)}</div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/50 sm:flex-row sm:justify-between"><p>© {new Date().getFullYear()} BORHS Data. All rights reserved.</p><p>Everyday services. One dependable balance.</p></div>
      </footer>
      <WhatsAppButton />
    </div>
  );
}

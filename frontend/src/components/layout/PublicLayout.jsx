import { Outlet, Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Zap, Sun, Moon, Home, Tag, Info, MessageCircle, ArrowRight, LogIn } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import WhatsAppButton from '../ui/WhatsAppButton';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/pricing', label: 'Pricing', icon: Tag },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: MessageCircle },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme, initTheme } = useThemeStore();

  useEffect(() => { initTheme(); }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Topbar ── */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{ background: 'var(--bg-surface-blur, rgba(9,11,17,0.8))', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>
                BORHS <span className="text-primary-400">Data</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${isActive ? 'text-primary-400' : 'hover:text-dark-100'}`
                  }
                  style={({ isActive }) => ({ color: isActive ? undefined : 'var(--text-muted)' })}
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-xl transition-colors"
                style={{ color: 'var(--text-muted)' }} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary btn-sm">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost btn-sm">Sign In</Link>
                  <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                </>
              )}
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center gap-1">
              <button onClick={toggleTheme} className="p-2 rounded-xl transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 rounded-xl transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer backdrop ── */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer panel — slides from right */}
        <div
          className={`absolute top-0 right-0 h-full w-[78vw] max-w-xs flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            background: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border)',
            boxShadow: '-24px 0 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
            style={{ borderColor: 'var(--border)' }}>
            <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
                <Zap size={15} className="text-white" fill="white" />
              </div>
              <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>
                BORHS <span className="text-primary-400">Data</span>
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive ? 'bg-primary-500/12' : 'hover:bg-white/5 active:bg-white/10'
                  }`
                }
                style={({ isActive }) => ({ color: isActive ? '#60a5fa' : 'var(--text-secondary)' })}
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-primary-500/20' : 'bg-white/5'
                    }`}>
                      <Icon size={15} strokeWidth={isActive ? 2.4 : 1.8}
                        className={isActive ? 'text-primary-400' : ''}
                        style={!isActive ? { color: 'var(--text-muted)' } : undefined} />
                    </div>
                    <span className="flex-1">{label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom auth section */}
          <div className="shrink-0 p-4 border-t space-y-2.5" style={{ borderColor: 'var(--border)' }}>
            {/* Live status pill */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}>
              <span className="w-1.5 h-1.5 bg-success-400 rounded-full animate-pulse shrink-0" />
              <span className="text-[11px] font-semibold" style={{ color: '#34d399' }}>
                All systems operational
              </span>
            </div>

            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                className="btn-primary w-full gap-2 justify-center">
                Go to Dashboard <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  <LogIn size={15} /> Sign In
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="btn-primary w-full gap-2 justify-center">
                  Get Started Free <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <main>
        <Outlet />
      </main>

      <footer className="border-t mt-16" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Main grid: brand row + 3 link columns always side by side */}
          <div className="flex flex-col gap-7 sm:flex-row sm:gap-6">

            {/* Brand */}
            <div className="sm:w-52 shrink-0">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center shrink-0">
                  <Zap size={13} className="text-white" fill="white" />
                </div>
                <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>BORHS Data</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                Nigeria's most reliable VTU platform. Fast, cheap, and secure.
              </p>
              <a
                href="https://wa.me/2347065896598"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors hover:opacity-80"
                style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366' }}
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Chat Support
              </a>
            </div>

            {/* Links — always 3 columns side by side */}
            <div className="flex-1 grid grid-cols-3 gap-4">
              {[
                {
                  title: 'Services',
                  items: [
                    { label: 'Buy Data', to: '/data' },
                    { label: 'Buy Airtime', to: '/airtime' },
                    { label: 'Electricity', to: '/electricity' },
                    { label: 'Cable TV', to: '/cable' },
                    { label: 'Exam PINs', to: '/education' },
                  ],
                },
                {
                  title: 'Company',
                  items: [
                    { label: 'About Us', to: '/about' },
                    { label: 'Pricing', to: '/pricing' },
                    { label: 'Contact', to: '/contact' },
                    { label: 'Refer & Earn', to: '/referrals' },
                  ],
                },
                {
                  title: 'Support',
                  items: [
                    { label: 'Help Center', to: '/contact' },
                    { label: 'Terms of Use', to: '/contact' },
                    { label: 'Privacy Policy', to: '/contact' },
                    { label: 'Become Agent', to: '/become-agent' },
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>
                    {col.title}
                  </p>
                  <ul className="space-y-2">
                    {col.items.map(({ label, to }) => (
                      <li key={label}>
                        <Link
                          to={to}
                          className="text-xs font-medium transition-colors hover:text-primary-400 leading-snug block"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-7 pt-5 border-t flex flex-col sm:flex-row items-center justify-between gap-2"
            style={{ borderColor: 'var(--border)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
              © {new Date().getFullYear()} BORHS Data. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                Built by <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>Ahmad Auwal Abubakar</span>
              </p>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg transition-colors hover:bg-dark-700/60"
                style={{ color: 'var(--text-faint)' }}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            </div>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}

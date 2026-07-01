import { Outlet, Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Zap, Sun, Moon } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import WhatsAppButton from '../ui/WhatsAppButton';

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme, initTheme } = useThemeStore();

  useEffect(() => { initTheme(); }, []);

  return (
    <div className="min-h-screen bg-dark-950">
      <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="font-black text-dark-50 text-lg">BORHS <span className="text-primary-400">Data</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {[['/', 'Home'], ['/pricing', 'Pricing'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${isActive ? 'text-primary-400' : 'text-dark-300 hover:text-dark-100'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-colors"
                style={{ color: 'var(--text-muted)' }}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
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

            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-xl text-dark-400 hover:bg-dark-700"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden border-t border-dark-700 py-4 space-y-1 animate-slide-up">
              {[['/', 'Home'], ['/pricing', 'Pricing'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
                <Link
                  key={path}
                  to={path}
                  className="block px-4 py-2.5 text-dark-300 hover:text-dark-100 hover:bg-dark-700/60 rounded-xl text-sm font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-3 flex flex-col gap-2 px-4 border-t border-dark-700/50 mt-2">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-primary" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary" onClick={() => setMenuOpen(false)}>Sign In</Link>
                    <Link to="/register" className="btn-primary" onClick={() => setMenuOpen(false)}>Get Started</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="border-t mt-16" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Main grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-7">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center shrink-0">
                  <Zap size={13} className="text-white" fill="white" />
                </div>
                <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>BORHS Data</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                Nigeria's most reliable VTU platform. Fast, cheap, and secure.
              </p>
              {/* WhatsApp badge */}
              <a
                href={`https://wa.me/2347065896598`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors hover:opacity-80"
                style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366' }}
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Chat Support
              </a>
            </div>

            {/* Links */}
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
                  { label: 'Terms of Service', to: '/contact' },
                  { label: 'Privacy Policy', to: '/contact' },
                  { label: 'Become an Agent', to: '/become-agent' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.items.map(({ label, to }) => (
                    <li key={label}>
                      <Link
                        to={to}
                        className="text-xs font-medium transition-colors hover:text-primary-400"
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

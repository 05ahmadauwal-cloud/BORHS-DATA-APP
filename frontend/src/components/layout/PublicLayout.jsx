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

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-dark-400 hover:bg-dark-700"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden border-t border-dark-700 py-4 space-y-2 animate-slide-up">
              {[['/', 'Home'], ['/pricing', 'Pricing'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
                <Link
                  key={path}
                  to={path}
                  className="block px-4 py-2 text-dark-300 hover:text-dark-100 hover:bg-dark-700 rounded-lg text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-2 flex flex-col gap-2 px-4">
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

      <footer className="bg-dark-900 border-t border-dark-700/50 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center">
                  <Zap size={15} className="text-white" fill="white" />
                </div>
                <span className="font-black text-dark-50">BORHS Data</span>
              </div>
              <p className="text-dark-400 text-sm leading-relaxed">
                Nigeria's most reliable VTU platform. Fast, cheap, and secure.
              </p>
            </div>
            {[
              { title: 'Services', links: ['Buy Data', 'Buy Airtime', 'Electricity', 'Cable TV', 'Exam PINs'] },
              { title: 'Company', links: ['About Us', 'Pricing', 'Contact', 'Blog'] },
              { title: 'Support', links: ['Help Center', 'API Docs', 'Terms of Service', 'Privacy Policy'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-dark-200 mb-4 text-sm">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-dark-400 hover:text-dark-200 text-sm transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-dark-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-500 text-sm">© 2024 BORHS Data. All rights reserved.</p>
            <p className="text-dark-500 text-sm">Built with ❤️ in Nigeria 🇳🇬</p>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}

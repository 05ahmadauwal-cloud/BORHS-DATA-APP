import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  BarChart3, Users, History, Settings, Shield, Zap,
  LogOut, LayoutDashboard, Menu, X, Star, Tag, Megaphone, Sun, Moon,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import toast from 'react-hot-toast';
import WhatsAppButton from '../ui/WhatsAppButton';
import VerificationBadge from '../common/VerificationBadge';

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/transactions', icon: History, label: 'Transactions' },
  { to: '/admin/services', icon: Zap, label: 'Services' },
  { to: '/admin/kyc', icon: Shield, label: 'KYC' },
  { to: '/admin/agent-applications', icon: Star, label: 'Agents' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { to: '/admin/notifications', icon: Megaphone, label: 'Broadcast' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-canvas flex text-[var(--ds-text)]">

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 safe-fixed-y left-0 z-30 w-[min(15rem,88vw)] bg-surface border-r border-[var(--ds-stroke)] flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--ds-stroke)]">
          <Link to="/admin" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.svg" alt="BORHS" style={{ height: 38, width: 'auto', display: 'block', maxWidth: 140 }} />
            <span className="text-xs text-dark-400 capitalize truncate">{user?.role?.replace('_', ' ')}</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-dark-400 hover:bg-dark-700">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={17} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
          <div className="pt-3 border-t border-[var(--ds-stroke)] mt-3">
            <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)} className="sidebar-link">
              <LayoutDashboard size={17} className="shrink-0" />
              <span>Customer View</span>
            </NavLink>
          </div>
        </nav>

        <div className="p-2 border-t border-[var(--ds-stroke)]">
          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[var(--ds-surface-subtle)]">
            <div className="w-8 h-8 bg-[var(--ds-info-soft)] rounded-xl flex items-center justify-center shrink-0">
              <span className="text-primary-400 font-bold text-xs">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-dark-100 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-dark-400 truncate">{user?.email?.split('@')[0]}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-dark-400 hover:text-red-400 transition-colors shrink-0">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:ml-60">
        {/* Admin topbar */}
        <header className="sticky top-0 z-10 bg-surface/90 border-b border-[var(--ds-stroke)] backdrop-blur-md h-16 flex items-center px-4 sm:px-6 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-dark-400 hover:bg-dark-700/60">
            <Menu size={20} />
          </button>
          <span className="font-bold text-[var(--ds-text)] text-sm lg:hidden">Operations</span>
          <div className="flex-1" />
          <VerificationBadge user={user} />
          <Link to="/dashboard" className="text-xs text-dark-400 hover:text-dark-200 transition-colors hidden sm:block">
            ← Customer View
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-colors hover:bg-dark-700/60"
            style={{ color: 'var(--text-muted)' }}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </header>

        <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      <WhatsAppButton />
    </div>
  );
}

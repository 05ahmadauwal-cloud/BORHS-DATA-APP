import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  BarChart3, Users, History, Settings, Shield, Zap,
  LogOut, LayoutDashboard, Menu, X
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import WhatsAppButton from '../ui/WhatsAppButton';

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/transactions', icon: History, label: 'Transactions' },
  { to: '/admin/services', icon: Zap, label: 'Services' },
  { to: '/admin/kyc', icon: Shield, label: 'KYC' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-56 bg-dark-900 border-r border-dark-700/50 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex items-center justify-between p-4 border-b border-dark-700/50">
          <Link to="/admin" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center shrink-0">
              <Zap size={15} className="text-white" fill="white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-dark-50 text-sm leading-none">Admin</p>
              <p className="text-xs text-dark-400 mt-0.5 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
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
          <div className="pt-3 border-t border-dark-700/50 mt-3">
            <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)} className="sidebar-link">
              <LayoutDashboard size={17} className="shrink-0" />
              <span>Customer View</span>
            </NavLink>
          </div>
        </nav>

        <div className="p-2 border-t border-dark-700/50">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-dark-800/50">
            <div className="w-8 h-8 bg-primary-500/20 border border-primary-500/30 rounded-full flex items-center justify-center shrink-0">
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
      <div className="flex-1 flex flex-col min-w-0 lg:ml-56">
        {/* Admin topbar */}
        <header className="sticky top-0 z-10 bg-dark-900/90 border-b border-dark-700/50 backdrop-blur-md h-14 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-dark-400 hover:bg-dark-700/60">
            <Menu size={20} />
          </button>
          <span className="font-bold text-dark-200 text-sm lg:hidden">Admin Panel</span>
          <div className="flex-1" />
          <Link to="/dashboard" className="text-xs text-dark-400 hover:text-dark-200 transition-colors hidden sm:block">
            ← Customer View
          </Link>
        </header>

        <main className="flex-1 p-3 sm:p-5 lg:p-7 overflow-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      <WhatsAppButton />
    </div>
  );
}

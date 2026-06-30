import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { BarChart3, Users, History, Settings, Shield, Zap, LogOut, LayoutDashboard } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/transactions', icon: History, label: 'Transactions' },
  { to: '/admin/services', icon: Zap, label: 'Services' },
  { to: '/admin/kyc', icon: Shield, label: 'KYC Management' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Admin Sidebar */}
      <aside className="w-60 bg-dark-900 border-r border-dark-700/50 flex flex-col fixed inset-y-0">
        <div className="p-5 border-b border-dark-700/50">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" fill="white" />
            </div>
            <div>
              <p className="font-bold text-dark-50 text-sm">Admin Panel</p>
              <p className="text-xs text-dark-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}

          <div className="pt-4 border-t border-dark-700/50 mt-4">
            <NavLink to="/dashboard" className="sidebar-link">
              <LayoutDashboard size={17} />
              Customer View
            </NavLink>
          </div>
        </nav>

        <div className="p-3 border-t border-dark-700/50">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-dark-800/50">
            <div className="w-8 h-8 bg-primary-500/20 border border-primary-500/30 rounded-full flex items-center justify-center">
              <span className="text-primary-400 font-bold text-xs">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-dark-100 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-dark-400">{user?.email?.split('@')[0]}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-dark-400 hover:text-red-400 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-60">
        <main className="p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

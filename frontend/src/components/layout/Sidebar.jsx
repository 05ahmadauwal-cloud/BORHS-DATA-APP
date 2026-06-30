import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, Wifi, Phone, Zap, Tv, GraduationCap,
  Users, BarChart3, History, User, X, LogOut, ChevronRight, TrendingUp
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/data', icon: Wifi, label: 'Buy Data' },
  { to: '/airtime', icon: Phone, label: 'Buy Airtime' },
  { to: '/electricity', icon: Zap, label: 'Electricity' },
  { to: '/cable', icon: Tv, label: 'Cable TV' },
  { to: '/education', icon: GraduationCap, label: 'Exam PINs' },
  { to: '/referrals', icon: Users, label: 'Referrals' },
  { to: '/transactions', icon: History, label: 'Transactions' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const agentItems = [
  { to: '/agent', icon: TrendingUp, label: 'Agent Dashboard' },
  { to: '/agent/downlines', icon: Users, label: 'My Downlines' },
  { to: '/agent/commissions', icon: BarChart3, label: 'Commissions' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isAgentOrAdmin = ['agent', 'admin', 'super_admin'].includes(user?.role);

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-dark-900 border-r border-dark-700/50
      transform transition-transform duration-300 ease-in-out flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">B</span>
          </div>
          <div>
            <p className="font-bold text-dark-50 text-sm">BORHS Data</p>
            <p className="text-xs text-dark-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-dark-700 text-dark-400">
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link group ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}

        {isAgentOrAdmin && (
          <>
            <div className="mt-4 mb-2 px-4">
              <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider">Agent Tools</p>
            </div>
            {agentItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/agent'}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link group ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            ))}
          </>
        )}

        {isAgentOrAdmin && (
          <>
            <div className="mt-4 mb-2 px-4">
              <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider">Admin</p>
            </div>
            <NavLink to="/admin" onClick={onClose} className={({ isActive }) => `sidebar-link group ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} />
              <span>Admin Panel</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-dark-700/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500/20 to-success-500/20 border border-primary-500/30 rounded-full flex items-center justify-center">
            <span className="text-primary-400 font-bold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-100 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-dark-400 truncate">₦{(user?.walletBalance || 0).toLocaleString()}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

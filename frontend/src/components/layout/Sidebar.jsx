import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, Wifi, Phone, Zap, Tv, GraduationCap,
  Users, BarChart3, History, User, X, LogOut, TrendingUp, Star,
  ShieldCheck, ArrowUpRight,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const mainNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/transactions', icon: History, label: 'Transactions' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const servicesNav = [
  { to: '/data', icon: Wifi, label: 'Buy Data' },
  { to: '/airtime', icon: Phone, label: 'Buy Airtime' },
  { to: '/electricity', icon: Zap, label: 'Electricity' },
  { to: '/cable', icon: Tv, label: 'Cable TV' },
  { to: '/education', icon: GraduationCap, label: 'Exam PINs' },
  { to: '/referrals', icon: Users, label: 'Refer & Earn' },
];

const agentNav = [
  { to: '/agent', icon: TrendingUp, label: 'Agent Dashboard', end: true },
  { to: '/agent/downlines', icon: Users, label: 'My Downlines' },
  { to: '/agent/commissions', icon: BarChart3, label: 'Commissions' },
];

function NavSection({ label, children }) {
  return (
    <div className="space-y-0.5">
      <p className="px-3 pt-4 pb-1.5 text-[10px] font-black uppercase tracking-[0.12em]"
        style={{ color: 'var(--text-faint)' }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function SidebarLink({ to, icon: Icon, label, end = false, accent, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl mx-1 text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'text-white'
            : 'hover:bg-white/5'
        }`
      }
      style={({ isActive }) => isActive ? {
        background: 'linear-gradient(90deg, rgba(37,99,235,0.25) 0%, rgba(37,99,235,0.08) 100%)',
        color: 'var(--text-primary)',
      } : { color: 'var(--text-muted)' }}
    >
      {({ isActive }) => (
        <>
          {/* Left accent bar */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary-400" />
          )}
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-150 ${
            isActive ? 'bg-primary-500/20' : 'group-hover:bg-white/5'
          }`}>
            <Icon
              size={16}
              strokeWidth={isActive ? 2.4 : 1.8}
              className={isActive ? 'text-primary-400' : ''}
              style={!isActive ? { color: accent || 'var(--text-muted)' } : undefined}
            />
          </div>
          <span className="flex-1 truncate">{label}</span>
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isAgentOrAdmin = ['agent', 'admin', 'super_admin'].includes(user?.role);
  const balance = Number(user?.walletBalance) || 0;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 flex-col transform transition-all duration-300 ease-in-out ${
        isOpen ? 'flex translate-x-0' : 'hidden -translate-x-full'
      } lg:flex lg:translate-x-0`}
      style={{
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-card) 100%)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* ── Brand header ── */}
      <div className="px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="BORHS" style={{ height: 44, width: 'auto', display: 'block', maxWidth: 160 }} />
            <span className="text-[10px] font-semibold capitalize shrink-0" style={{ color: 'var(--text-faint)' }}>
              {user?.role?.replace('_', ' ')}
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Balance strip */}
        <Link
          to="/wallet"
          onClick={onClose}
          className="flex items-center justify-between mt-3.5 px-3 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.06) 100%)', border: '1px solid rgba(37,99,235,0.2)' }}
        >
          <div>
            <p className="text-[10px] font-semibold" style={{ color: 'var(--text-faint)' }}>Wallet Balance</p>
            <p className="text-base font-black text-primary-300 tabular-nums leading-tight">
              ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <ArrowUpRight size={14} className="text-primary-400" />
          </div>
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0" style={{ scrollbarWidth: 'none' }}>

        <NavSection label="Menu">
          {mainNav.map((item) => (
            <SidebarLink key={item.to} {...item} onNavigate={onClose} />
          ))}
        </NavSection>

        <NavSection label="Services">
          {servicesNav.map((item) => (
            <SidebarLink key={item.to} {...item} onNavigate={onClose} />
          ))}
        </NavSection>

        {/* Become Agent CTA */}
        {!isAgentOrAdmin && (
          <div className="mx-3 mt-3">
            <Link
              to="/become-agent"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(234,179,8,0.05) 100%)', border: '1px solid rgba(234,179,8,0.2)' }}
            >
              <div className="w-7 h-7 bg-yellow-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Star size={14} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-yellow-300">Become an Agent</p>
                <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Earn on every referral</p>
              </div>
            </Link>
          </div>
        )}

        {isAgentOrAdmin && (
          <NavSection label="Agent Tools">
            {agentNav.map((item) => (
              <SidebarLink key={item.to} {...item} onNavigate={onClose} />
            ))}
          </NavSection>
        )}

        {isAgentOrAdmin && (
          <NavSection label="Administration">
            <SidebarLink to="/admin" icon={ShieldCheck} label="Admin Panel" onNavigate={onClose} />
          </NavSection>
        )}
      </nav>

      {/* ── User footer ── */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex items-center gap-3 p-2.5 rounded-xl"
          style={{ background: 'var(--bg-elevated)' }}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(37,99,235,0.3) 0%, rgba(16,185,129,0.3) 100%)',
                border: '1.5px solid rgba(37,99,235,0.4)',
                color: 'var(--text-primary)',
              }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success-400 rounded-full border-2 border-dark-900" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-faint)' }}>
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/15 hover:text-red-400 shrink-0"
            style={{ color: 'var(--text-faint)' }}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

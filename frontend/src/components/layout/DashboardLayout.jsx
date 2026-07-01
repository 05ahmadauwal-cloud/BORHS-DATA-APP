import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Wallet, Wifi, MoreHorizontal, User, Shield, Lock } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import WhatsAppButton from '../ui/WhatsAppButton';
import useAuthStore from '../../store/authStore';

const ADMIN_ROLES = ['admin', 'super_admin'];

const mobileNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/data', icon: Wifi, label: 'Data' },
  { to: '/transactions', icon: MoreHorizontal, label: 'More' },
  { to: '/profile', icon: User, label: 'Profile' },
];

// Pages the KYC gate should NOT block (profile/kyc page, wallet funding, auth)
const KYC_EXEMPT_PATHS = ['/profile', '/wallet', '/transactions'];

function KYCGate() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-sm text-center space-y-6 animate-fade-in">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
          <Shield size={36} className="text-primary-400" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
            Verify Your Identity
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            You need to complete KYC verification before you can buy data, airtime, or use any services on BORHS Data.
          </p>
        </div>

        {/* Steps preview */}
        <div className="text-left space-y-2 px-2">
          {[
            { step: 1, text: 'Confirm your account details', time: '10 seconds' },
            { step: 2, text: 'Upload a government ID', time: '2 minutes' },
            { step: 3, text: 'Take a quick selfie', time: '1 minute' },
          ].map(({ step, text, time }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black"
                style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>
                {step}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{text}</p>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{time}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link to="/profile?tab=kyc" className="btn-primary w-full gap-2 justify-center">
          <Shield size={16} /> Start Verification
        </Link>

        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          You can still fund your wallet while verification is pending.{' '}
          <Link to="/wallet" className="text-primary-400 hover:underline">Fund wallet</Link>
        </p>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const location = useLocation();

  const isAdmin = ADMIN_ROLES.includes(user?.role);
  const needsKYC = !isAdmin && user?.kycStatus === 'none';
  const isExemptPath = KYC_EXEMPT_PATHS.some(p => location.pathname.startsWith(p));
  const showGate = needsKYC && !isExemptPath;

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/70 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 overflow-auto animate-fade-in">
          <Outlet />
        </main>

        <WhatsAppButton />

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-dark-900/95 border-t border-dark-700/50 backdrop-blur-md">
          <div className="flex items-center justify-around h-16 px-2 safe-area-bottom">
            {mobileNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-0 ${
                    isActive
                      ? 'text-primary-400'
                      : 'text-dark-500 hover:text-dark-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-10 h-6 flex items-center justify-center rounded-full transition-all ${isActive ? 'bg-primary-500/15' : ''}`}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-[10px] font-semibold truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* KYC gate — shown over all non-exempt pages for unverified users */}
      {showGate && <KYCGate />}
    </div>
  );
}

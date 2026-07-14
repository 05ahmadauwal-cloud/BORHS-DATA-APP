import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Wallet, Wifi, MoreHorizontal, User, Shield, Lock, KeyRound } from 'lucide-react';
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
// Pages the PIN gate should NOT block
const PIN_EXEMPT_PATHS = ['/profile', '/wallet', '/dashboard', '/transactions'];

function PinGate() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-sm text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)' }}>
          <KeyRound size={36} className="text-yellow-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
            Set Your Transaction PIN
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            A 4-digit PIN is required to make purchases. This protects your wallet from unauthorized transactions.
          </p>
        </div>
        <Link to="/profile?tab=security" className="btn-primary w-full gap-2 justify-center"
          style={{ background: 'linear-gradient(135deg,#ca8a04,#a16207)' }}>
          <KeyRound size={16} /> Set Transaction PIN
        </Link>
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          You can still browse your dashboard and fund your wallet.{' '}
          <Link to="/wallet" className="text-primary-400 hover:underline">Fund wallet</Link>
        </p>
      </div>
    </div>
  );
}

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
            A quick one-time identity check is required before you can buy data, airtime, or use any services. Takes under 30 seconds.
          </p>
        </div>

        {/* Steps preview */}
        <div className="text-left space-y-2 px-2">
          {[
            { step: 1, text: 'Confirm your account details', time: '~10 seconds', required: true },
            { step: 2, text: 'Upload a government ID', time: 'optional', required: false },
            { step: 3, text: 'Take a selfie', time: 'optional', required: false },
          ].map(({ step, text, time, required }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black"
                style={{
                  background: required ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.05)',
                  color: required ? '#60a5fa' : 'var(--text-faint)',
                }}>
                {step}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: required ? 'var(--text-secondary)' : 'var(--text-faint)' }}>{text}</p>
              </div>
              <span className={`text-[10px] font-semibold ${required ? 'text-primary-400' : ''}`}
                style={{ color: required ? undefined : 'var(--text-faint)' }}>
                {time}
              </span>
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
  const isKycExemptPath = KYC_EXEMPT_PATHS.some(p => location.pathname.startsWith(p));
  const showKycGate = needsKYC && !isKycExemptPath;

  const needsPin = !isAdmin && !user?.isPinSet;
  const isPinExemptPath = PIN_EXEMPT_PATHS.some(p => location.pathname.startsWith(p));
  const showPinGate = needsPin && !isPinExemptPath && !showKycGate;

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

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>

        <WhatsAppButton />

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20">
          {/* bar */}
          <div
            className="relative bg-dark-900 border-t border-white/[0.07] px-1 pb-safe"
            style={{ borderRadius: '22px 22px 0 0', boxShadow: '0 -8px 32px rgba(0,0,0,0.45)' }}
          >
            <div className="flex items-end justify-around h-[62px]">
              {mobileNav.map((item, idx) => {
                const isCenter = idx === Math.floor(mobileNav.length / 2);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'}
                    className={`flex-1 flex justify-center ${isCenter ? 'relative' : ''}`}
                  >
                    {({ isActive }) =>
                      isCenter ? (
                        /* ── Elevated center FAB ── */
                        <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2" style={{ bottom: 10 }}>
                          <div
                            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90"
                            style={{
                              background: isActive
                                ? 'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)'
                                : 'linear-gradient(135deg,#2563eb 0%,#1e40af 100%)',
                              boxShadow: '0 4px 18px rgba(37,99,235,0.55)',
                            }}
                          >
                            <item.icon size={22} className="text-white" strokeWidth={2.2} />
                          </div>
                          <span className={`text-[9px] font-black mt-1 tracking-wide ${isActive ? 'text-primary-400' : 'text-dark-500'}`}>
                            {item.label}
                          </span>
                        </div>
                      ) : (
                        /* ── Regular tab ── */
                        <div className="flex flex-col items-center gap-0.5 pb-1 pt-2 w-full transition-all duration-200">
                          <div className={`relative flex items-center justify-center w-10 h-[30px] rounded-xl transition-all duration-200 ${isActive ? 'bg-primary-500/15' : ''}`}>
                            {isActive && (
                              <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-3.5 h-[3px] rounded-full bg-primary-400" />
                            )}
                            <item.icon
                              size={19}
                              strokeWidth={isActive ? 2.5 : 1.7}
                              className={`transition-colors duration-200 ${isActive ? 'text-primary-400' : 'text-dark-500'}`}
                            />
                          </div>
                          <span className={`text-[10px] font-bold ${isActive ? 'text-primary-400' : 'text-dark-600'}`}>
                            {item.label}
                          </span>
                        </div>
                      )
                    }
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* KYC gate — shown over all non-exempt pages for unverified users */}
      {showKycGate && <KYCGate />}

      {/* PIN gate — shown over purchase pages if PIN not set */}
      {showPinGate && <PinGate />}
    </div>
  );
}

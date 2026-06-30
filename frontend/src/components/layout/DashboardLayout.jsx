import { Outlet, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Wallet, Wifi, MoreHorizontal, User } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const mobileNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/data', icon: Wifi, label: 'Data' },
  { to: '/transactions', icon: MoreHorizontal, label: 'More' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    </div>
  );
}

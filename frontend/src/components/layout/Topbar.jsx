import { Menu, Bell, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationAPI.getAll({ unreadOnly: true, limit: 5 }),
    select: (res) => res.data,
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.unreadCount || 0;

  return (
    <header className="sticky top-0 z-10 bg-dark-900/80 border-b border-dark-700/50 backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 md:px-6 h-16">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-700/50 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:flex items-center gap-2 bg-dark-800/50 border border-dark-700/50 rounded-xl px-3 py-2">
          <Search size={15} className="text-dark-400 shrink-0" />
          <input
            type="text"
            placeholder="Search transactions, services..."
            className="flex-1 bg-transparent text-sm text-dark-200 placeholder-dark-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-700/50 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-dark-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 card shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-dark-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-dark-100 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="badge-info">{unreadCount} new</span>
                    )}
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications?.data?.length > 0 ? (
                    notifications.data.map((n) => (
                      <div key={n._id} className="p-3 border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                        <p className="text-sm font-medium text-dark-100">{n.title}</p>
                        <p className="text-xs text-dark-400 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-dark-400 text-sm">No new notifications</div>
                  )}
                </div>
                <div className="p-3 border-t border-dark-700">
                  <Link
                    to="/transactions"
                    className="text-xs text-primary-400 hover:text-primary-300 font-medium"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all activity
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <Link to="/profile" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-dark-700/50 transition-colors group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500/30 to-success-500/30 border border-primary-500/30 rounded-full flex items-center justify-center">
              <span className="text-primary-400 font-bold text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-dark-200">{user?.firstName}</p>
              <p className="text-xs text-dark-400">₦{(user?.walletBalance || 0).toLocaleString()}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

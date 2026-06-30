import { Menu, Bell, Wallet } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationAPI.getAll({ unreadOnly: 'true', limit: 8 }),
    select: (res) => res.data,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: () => notificationAPI.markRead([]),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications?.unreadCount || 0;
  const balance = user?.walletBalance || 0;

  return (
    <header className="sticky top-0 z-10 bg-dark-900/90 border-b border-dark-700/50 backdrop-blur-md">
      <div className="flex items-center gap-3 px-3 sm:px-4 md:px-6 h-14 md:h-16">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-700/60 transition-colors shrink-0"
        >
          <Menu size={20} />
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">B</span>
          </div>
          <span className="font-black text-dark-50 text-sm">BORHS Data</span>
        </div>

        <div className="flex-1" />

        {/* Balance pill — visible on sm+ */}
        <Link
          to="/wallet"
          className="hidden sm:flex items-center gap-2 bg-dark-800 border border-dark-700/50 rounded-xl px-3 py-2 hover:border-primary-500/40 transition-colors"
        >
          <Wallet size={14} className="text-primary-400 shrink-0" />
          <span className="text-sm font-bold text-dark-100">
            ₦{balance.toLocaleString()}
          </span>
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) markReadMutation.mutate();
            }}
            className="relative p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-700/60 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-dark-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-1rem)] card shadow-2xl z-50 overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b border-dark-700">
                <h3 className="font-bold text-dark-100 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="badge-info text-xs">{unreadCount} new</span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-dark-700/40">
                {notifications?.data?.length > 0 ? (
                  notifications.data.map((n) => (
                    <div key={n._id} className={`p-3.5 hover:bg-dark-700/30 transition-colors ${!n.isRead ? 'border-l-2 border-primary-500' : ''}`}>
                      <p className="text-sm font-semibold text-dark-100 leading-tight">{n.title}</p>
                      <p className="text-xs text-dark-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-dark-600 mt-1">{format(new Date(n.createdAt), 'MMM dd, h:mm a')}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-dark-400 text-sm">No new notifications</div>
                )}
              </div>
              <div className="p-3 border-t border-dark-700">
                <Link
                  to="/transactions"
                  className="text-xs text-primary-400 hover:text-primary-300 font-semibold"
                  onClick={() => setShowNotifications(false)}
                >
                  View all transactions →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-700/50 transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500/30 to-success-500/30 border border-primary-500/40 rounded-full flex items-center justify-center shrink-0">
            <span className="text-primary-400 font-black text-xs">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-dark-200 leading-none">{user?.firstName}</p>
            <p className="text-xs text-dark-500 mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}

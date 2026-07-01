import { Menu, Bell, Wallet, Sun, Moon, X, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationAPI.getAll({ unreadOnly: 'false', limit: 20 }),
    select: (res) => res.data,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: () => notificationAPI.markRead([]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.unreadCount || 0;
  const balance = user?.walletBalance || 0;

  const openPanel = () => {
    setOpen(true);
    if (unreadCount > 0) markReadMutation.mutate();
  };

  const closePanel = () => setOpen(false);

  return (
    <>
      <header className="sticky top-0 z-10 bg-dark-900/90 border-b border-dark-700/50 backdrop-blur-md">
        <div className="flex items-center gap-3 px-3 sm:px-4 md:px-6 h-14 md:h-16">

          {/* Hamburger */}
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

          {/* Balance pill */}
          <Link
            to="/wallet"
            className="hidden sm:flex items-center gap-2 bg-dark-800 border border-dark-700/50 rounded-xl px-3 py-2 hover:border-primary-500/40 transition-colors"
          >
            <Wallet size={14} className="text-primary-400 shrink-0" />
            <span className="text-sm font-bold text-dark-100">
              ₦{balance.toLocaleString()}
            </span>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-colors hover:bg-dark-700/60"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ color: 'var(--text-muted)' }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Bell button */}
          <button
            onClick={openPanel}
            className="relative p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-700/60 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[8px] h-2 bg-red-500 rounded-full ring-2 ring-dark-900 animate-pulse" />
            )}
          </button>

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

      {/* Notification panel — backdrop + drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closePanel}
          />

          {/* Panel */}
          <div className="fixed z-50 animate-slide-up"
            style={{
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '380px',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
            }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Bell size={17} style={{ color: 'var(--text-secondary)' }} />
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications?.data?.some((n) => !n.isRead) && (
                  <button
                    onClick={() => markReadMutation.mutate()}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors hover:bg-dark-700/50"
                    style={{ color: 'var(--text-muted)' }}
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} />
                    <span className="hidden sm:inline">All read</span>
                  </button>
                )}
                <button
                  onClick={closePanel}
                  className="p-1.5 rounded-lg transition-colors hover:bg-dark-700/50"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto divide-y"
              style={{ borderColor: 'var(--border)', WebkitOverflowScrolling: 'touch' }}>
              {notifications?.data?.length > 0 ? (
                notifications.data.map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3.5 transition-colors ${!n.isRead ? 'border-l-2 border-primary-500' : ''}`}
                    style={{
                      background: !n.isRead ? 'rgba(37,99,235,0.04)' : undefined,
                    }}
                  >
                    <p className="text-sm font-semibold leading-snug"
                      style={{ color: 'var(--text-primary)' }}>
                      {n.title}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed"
                      style={{ color: 'var(--text-muted)' }}>
                      {n.message}
                    </p>
                    <p className="text-[11px] mt-1.5"
                      style={{ color: 'var(--text-faint)' }}>
                      {format(new Date(n.createdAt), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <Bell size={28} className="opacity-20" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <Link
                to="/transactions"
                onClick={closePanel}
                className="text-xs font-semibold text-primary-400 hover:text-primary-300"
              >
                View all transactions →
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

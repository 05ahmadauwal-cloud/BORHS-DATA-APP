import { Menu, Bell, Wallet, Sun, Moon, X, CheckCheck, UserRound, TicketPercent } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponAPI, notificationAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button, Input, Modal } from '../ui';
import toast from 'react-hot-toast';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationAPI.getAll({ unreadOnly: 'false', limit: 20 }),
    select: (res) => res.data,
    refetchInterval: 60000,
  });

  const markReadMutation = useMutation({
    mutationFn: () => notificationAPI.markRead([]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.unreadCount || 0;
  const balance = Number(user?.walletBalance) || 0;

  const openPanel = () => {
    setOpen(true);
    if (unreadCount > 0) markReadMutation.mutate();
  };

  const closePanel = () => setOpen(false);
  const couponMutation = useMutation({
    mutationFn: () => couponAPI.redeem(couponCode.trim().toUpperCase()),
    onSuccess: (response) => {
      toast.success(response.data?.message || 'Coupon redeemed successfully');
      setCouponCode('');
      setCouponOpen(false);
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Coupon redemption failed'),
  });

  return (
    <>
      <header className="relative lg:sticky lg:top-0 z-10 bg-surface/95 border-b border-[var(--ds-stroke)] lg:backdrop-blur-md">
        <div className="flex items-center gap-3 px-3 sm:px-4 md:px-6 h-14 md:h-16">

          {/* Hamburger */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-[var(--ds-text-secondary)] hover:text-brand-700 hover:bg-[var(--ds-info-soft)] transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>

          {/* Mobile logo */}
          <Link to="/dashboard" className="lg:hidden flex items-center" aria-label="BORHS Data home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white p-1.5 shadow-sm ring-1 ring-[var(--ds-stroke)]">
              <img src="/logo-mark.png" alt="" className="h-full w-full object-contain" />
            </span>
          </Link>

          <div className="flex-1" />

          {/* Balance pill */}
          <Link
            to="/wallet"
            className="hidden sm:flex items-center gap-2 bg-[var(--ds-surface-subtle)] rounded-xl px-3 py-2 hover:text-brand-700 transition-colors"
          >
            <Wallet size={14} className="text-brand-700 shrink-0" />
            <span className="text-sm font-bold text-[var(--ds-text)]">
              ₦{balance.toLocaleString()}
            </span>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={() => setCouponOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 transition hover:-translate-y-0.5 hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20"
            title="Redeem coupon"
            aria-label="Redeem coupon"
          >
            <TicketPercent size={18} />
          </button>

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
            className="relative p-2 rounded-xl text-[var(--ds-text-secondary)] hover:text-brand-700 hover:bg-[var(--ds-info-soft)] transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[8px] h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Avatar */}
          <Link
            to="/profile"
            className="group flex items-center gap-2 rounded-2xl p-1 transition-colors hover:bg-[var(--ds-surface-subtle)]"
            aria-label="Open profile"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-[#0b3b78] via-[#0f766e] to-[#4aae28] shadow-[0_6px_16px_rgba(15,118,110,0.22)] ring-2 ring-white transition-transform duration-200 group-hover:-translate-y-0.5">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound size={19} strokeWidth={2} className="text-white" />
              )}
              <span className="absolute inset-x-1 bottom-0 h-px bg-white/35" />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-dark-200 leading-none">{user?.firstName}</p>
              <p className="text-[10px] text-dark-500 mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </Link>
        </div>
      </header>

      <Modal open={couponOpen} onClose={() => setCouponOpen(false)} title="Redeem a coupon" description="Enter your BORHS reward code to claim it instantly." size="sm">
        <div className="space-y-5">
          <Input label="Coupon code" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} onKeyDown={(event) => event.key === 'Enter' && couponCode.trim() && couponMutation.mutate()} placeholder="e.g. BORHS100" autoFocus />
          <Button className="w-full" icon={TicketPercent} loading={couponMutation.isPending} disabled={!couponCode.trim()} onClick={() => couponMutation.mutate()}>Redeem coupon</Button>
        </div>
      </Modal>

      {/* Notification panel — backdrop + drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closePanel}
          />

          {/* Panel */}
          <div className="fixed safe-fixed-inset z-50 animate-slide-up"
            style={{
              top: 'env(safe-area-inset-top, 0px)',
              right: 'env(safe-area-inset-right, 0px)',
              bottom: 'env(safe-area-inset-bottom, 0px)',
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

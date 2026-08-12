import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Gift } from 'lucide-react';
import { bannerAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const RETURN_COOLDOWN_MS = 30 * 60 * 1000;
const colorStyles = {
  primary: 'bg-[var(--ds-info-soft)] text-blue-900 dark:text-blue-200',
  yellow: 'bg-[var(--ds-reward-soft)] text-amber-900 dark:text-amber-200',
  green: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-200',
  red: 'bg-red-100 text-red-900 dark:bg-red-400/10 dark:text-red-200',
};

const signatureFor = (banner) => `${banner?.color || 'primary'}:${banner?.text || ''}`;

export default function AnnouncementPopup() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [open, setOpen] = useState(false);
  const storageKey = useMemo(() => `borhs-announcement:${user?._id || 'guest'}`, [user?._id]);
  const { data: banner, refetch } = useQuery({
    queryKey: ['banner'],
    queryFn: bannerAPI.get,
    select: (response) => response.data.data,
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  const considerShowing = useCallback((currentBanner, forceNewText = false) => {
    if (!isAuthenticated || !currentBanner?.active || !currentBanner?.text) return;
    let previous = {};
    try { previous = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { previous = {}; }
    const changed = previous.signature !== signatureFor(currentBanner);
    const cooldownPassed = Date.now() - Number(previous.shownAt || 0) >= RETURN_COOLDOWN_MS;
    if (changed || cooldownPassed || forceNewText) setOpen(true);
  }, [isAuthenticated, storageKey]);

  useEffect(() => {
    if (banner) considerShowing(banner);
  }, [banner, considerShowing]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const onReturn = async () => {
      if (document.visibilityState !== 'visible') return;
      const result = await refetch();
      considerShowing(result.data);
    };
    document.addEventListener('visibilitychange', onReturn);
    let nativeListener;
    if (Capacitor.isNativePlatform()) {
      nativeListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) onReturn();
      });
    }
    return () => {
      document.removeEventListener('visibilitychange', onReturn);
      nativeListener?.then((handle) => handle.remove());
    };
  }, [considerShowing, isAuthenticated, refetch]);

  const dismiss = () => {
    localStorage.setItem(storageKey, JSON.stringify({
      shownAt: Date.now(),
      signature: signatureFor(banner),
    }));
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={dismiss} title="Announcement" description="A message from BORHS Data" size="sm"
      footer={<Button className="w-full" onClick={dismiss}>Got it</Button>}>
      <div className={`rounded-2xl p-5 ${colorStyles[banner?.color] || colorStyles.primary}`}>
        <Gift size={24} />
        <p className="mt-4 whitespace-pre-wrap text-sm font-semibold leading-6">{banner?.text}</p>
      </div>
    </Modal>
  );
}

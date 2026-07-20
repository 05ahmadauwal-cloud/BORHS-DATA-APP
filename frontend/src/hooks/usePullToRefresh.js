import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';

const PULL_THRESHOLD = 80;

export default function usePullToRefresh() {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const startY = useRef(null);
  const refreshingRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);

  useEffect(() => {
    const reset = () => { startY.current = null; setPullProgress(0); };
    const onTouchStart = (event) => {
      if (refreshingRef.current) return;
      startY.current = window.scrollY <= 0 ? event.touches[0].clientY : null;
    };
    const onTouchMove = (event) => {
      if (startY.current === null || window.scrollY > 0) return;
      const distance = Math.max(0, event.touches[0].clientY - startY.current);
      setPullProgress(Math.min(1, distance / PULL_THRESHOLD));
    };
    const onTouchEnd = async (event) => {
      if (startY.current === null || refreshingRef.current) return;
      const distance = event.changedTouches[0].clientY - startY.current;
      reset();
      if (distance < PULL_THRESHOLD || window.scrollY > 0) return;
      refreshingRef.current = true;
      setIsRefreshing(true);
      navigator.vibrate?.(12);
      try {
        await Promise.all([
          queryClient.invalidateQueries(),
          isAuthenticated ? refreshUser() : Promise.resolve(),
        ]);
      } finally {
        refreshingRef.current = false;
        setIsRefreshing(false);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', reset, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', reset);
    };
  }, [isAuthenticated, queryClient, refreshUser]);

  return { isRefreshing, pullProgress };
}

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';

const PULL_THRESHOLD = 80;

export default function usePullToRefresh() {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const startY = useRef(null);

  useEffect(() => {
    const onTouchStart = (event) => {
      startY.current = window.scrollY <= 0 ? event.touches[0].clientY : null;
    };

    const onTouchEnd = async (event) => {
      if (startY.current === null) return;

      const distance = event.changedTouches[0].clientY - startY.current;
      startY.current = null;
      if (distance < PULL_THRESHOLD || window.scrollY > 0) return;

      await Promise.all([
        queryClient.invalidateQueries(),
        isAuthenticated ? refreshUser() : Promise.resolve(),
      ]);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isAuthenticated, queryClient, refreshUser]);
}

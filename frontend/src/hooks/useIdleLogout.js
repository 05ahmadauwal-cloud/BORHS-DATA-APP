import { useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const LAST_ACTIVITY_KEY = 'borhs-last-activity';
const DEFAULT_TIMEOUT_MINUTES = 24 * 60;
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'];

const configuredMinutes = Number(import.meta.env.VITE_IDLE_TIMEOUT_MINUTES);
const timeoutMs = (Number.isFinite(configuredMinutes) && configuredMinutes > 0
  ? configuredMinutes
  : DEFAULT_TIMEOUT_MINUTES) * 60 * 1000;

export default function useIdleLogout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      return undefined;
    }

    let timer;
    let expired = false;
    let lastRecordedActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now();

    const expireSession = () => {
      if (expired) return;
      expired = true;
      clearTimeout(timer);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      logout();
      toast.error('You were logged out due to inactivity. Please sign in again.');
    };

    const scheduleLogout = () => {
      clearTimeout(timer);
      const remaining = timeoutMs - (Date.now() - lastRecordedActivity);
      if (remaining <= 0) {
        expireSession();
        return;
      }
      timer = setTimeout(expireSession, remaining);
    };

    const recordActivity = () => {
      const now = Date.now();
      // Avoid writing to localStorage for every scroll or mouse event.
      if (now - lastRecordedActivity < 1000) return;
      lastRecordedActivity = now;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      scheduleLogout();
    };

    // Android may suspend JavaScript timers while the app is backgrounded.
    // Re-check elapsed time immediately whenever the app becomes visible again.
    const checkSession = () => {
      if (document.visibilityState === 'hidden') return;
      lastRecordedActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || lastRecordedActivity;
      scheduleLogout();
    };

    localStorage.setItem(LAST_ACTIVITY_KEY, String(lastRecordedActivity));
    scheduleLogout();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    document.addEventListener('visibilitychange', checkSession);
    window.addEventListener('focus', checkSession);
    window.addEventListener('pageshow', checkSession);

    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, recordActivity));
      document.removeEventListener('visibilitychange', checkSession);
      window.removeEventListener('focus', checkSession);
      window.removeEventListener('pageshow', checkSession);
    };
  }, [isAuthenticated, logout]);
}

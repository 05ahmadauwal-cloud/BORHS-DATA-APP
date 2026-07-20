import { useEffect } from 'react';

export default function InteractionFeedback() {
  useEffect(() => {
    if (!('vibrate' in navigator) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const onClick = (event) => {
      const target = event.target.closest('button, a, [role="button"]');
      if (!target || target.matches(':disabled') || target.getAttribute('aria-disabled') === 'true') return;
      navigator.vibrate(6);
    };
    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getSystemTheme = () => (
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
);

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
};

let removeSystemListener;

const useThemeStore = create(
  persist(
    (set, get) => ({
      mode: 'system',
      theme: getSystemTheme(),

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ mode: next, theme: next });
        applyTheme(next);
      },

      useSystemTheme: () => {
        const next = getSystemTheme();
        set({ mode: 'system', theme: next });
        applyTheme(next);
      },

      initTheme: () => {
        removeSystemListener?.();
        const media = window.matchMedia('(prefers-color-scheme: light)');
        const resolved = get().mode === 'system' ? getSystemTheme() : get().mode;
        set({ theme: resolved });
        applyTheme(resolved);

        const handleSystemChange = (event) => {
          if (get().mode !== 'system') return;
          const next = event.matches ? 'light' : 'dark';
          set({ theme: next });
          applyTheme(next);
        };
        media.addEventListener('change', handleSystemChange);
        removeSystemListener = () => media.removeEventListener('change', handleSystemChange);
      },
    }),
    {
      name: 'borhs-theme',
      version: 1,
      partialize: (state) => ({ mode: state.mode }),
      migrate: () => ({ mode: 'system', theme: getSystemTheme() }),
    }
  )
);

export default useThemeStore;

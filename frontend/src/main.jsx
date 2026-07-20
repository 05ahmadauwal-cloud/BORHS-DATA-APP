import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import App from './App';
import useThemeStore from './store/themeStore';
import './index.css';

// Apply the persisted theme before React paints to avoid a light/dark flash.
useThemeStore.getState().initTheme();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnMount: 'always',
      refetchOnWindowFocus: 'always',
    },
    mutations: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--ds-surface)',
            color: 'var(--ds-text)',
            border: '1px solid var(--ds-stroke)',
            borderRadius: '16px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: 'var(--ds-success)', secondary: 'var(--ds-surface)' },
          },
          error: {
            iconTheme: { primary: 'var(--ds-danger)', secondary: 'var(--ds-surface)' },
          },
        }}
      />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
);

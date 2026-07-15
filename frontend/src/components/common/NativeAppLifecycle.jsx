import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import useThemeStore from '../../store/themeStore';

export default function NativeAppLifecycle() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack && location.pathname !== '/') navigate(-1);
      else CapacitorApp.exitApp();
    });

    return () => { listener.then((handle) => handle.remove()); };
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    // Keep system information readable while matching the active dashboard theme.
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.setStyle({ style: theme === 'dark' ? Style.Light : Style.Dark });
    StatusBar.setBackgroundColor({ color: theme === 'dark' ? '#020617' : '#f1f5f9' });
  }, [theme]);

  return null;
}

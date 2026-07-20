import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Fingerprint, LogIn, Sun, Moon } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import {
  AccessControl,
  BiometricAuthError,
  NativeBiometric,
} from '@capgo/capacitor-native-biometric';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import toast from 'react-hot-toast';

const schema = z.object({
  identifier: z.string().min(3, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

const BIOMETRIC_SERVER = 'com.borhsdata.app';
const REMEMBERED_IDENTIFIER_KEY = 'borhs_remembered_identifier';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricSaved, setBiometricSaved] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(true);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [rememberIdentifier, setRememberIdentifier] = useState(true);
  const { login, isLoading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: localStorage.getItem(REMEMBERED_IDENTIFIER_KEY) || '',
      password: '',
    },
  });

  const navigateAfterLogin = (user) => {
    if (['admin', 'super_admin'].includes(user.role)) {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    let active = true;
    const checkBiometrics = async () => {
      try {
        const availability = await NativeBiometric.isAvailable();
        if (!active || !availability.isAvailable) return;

        const saved = await NativeBiometric.isCredentialsSaved({ server: BIOMETRIC_SERVER });
        if (active) {
          setBiometricAvailable(true);
          setBiometricSaved(saved.isSaved);
        }
      } catch {
        if (active) setBiometricAvailable(false);
      }
    };

    checkBiometrics();
    return () => { active = false; };
  }, []);

  const onSubmit = async (data) => {
    try {
      const result = await login(data.identifier, data.password);

      if (rememberIdentifier) {
        localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, data.identifier.trim());
      } else {
        localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
      }

      if (biometricAvailable && enableBiometric && !biometricSaved) {
        try {
          await NativeBiometric.setCredentials({
            username: data.identifier,
            password: data.password,
            server: BIOMETRIC_SERVER,
            accessControl: AccessControl.BIOMETRY_CURRENT_SET,
          });
          setBiometricSaved(true);
          toast.success('Fingerprint login enabled on this device.');
        } catch {
          toast('Signed in, but fingerprint setup was not completed.');
        }
      }

      toast.success(`Welcome back, ${result.user.firstName}!`);
      navigateAfterLogin(result.user);
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    }
  };

  const signInWithFingerprint = async () => {
    setBiometricLoading(true);
    try {
      const credentials = await NativeBiometric.getSecureCredentials({
        server: BIOMETRIC_SERVER,
        reason: 'Confirm your identity to sign in to BORHS',
        title: 'Fingerprint login',
        subtitle: 'Sign in securely',
        description: 'Touch the fingerprint sensor to continue.',
        negativeButtonText: 'Use password',
      });
      const result = await login(credentials.username, credentials.password);
      toast.success(`Welcome back, ${result.user.firstName}!`);
      navigateAfterLogin(result.user);
    } catch (error) {
      if ([BiometricAuthError.USER_CANCEL, BiometricAuthError.USER_FALLBACK].includes(Number(error?.code))) {
        return;
      }

      if ([401, 403].includes(error.response?.status)) {
        await NativeBiometric.deleteCredentials({ server: BIOMETRIC_SERVER }).catch(() => {});
        setBiometricSaved(false);
        toast.error('Saved login has expired. Sign in with your password again.');
      } else {
        toast.error('Fingerprint authentication was not completed.');
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 py-10">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-2xl transition-colors hover:bg-[var(--ds-surface-subtle)]"
        style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center mb-6">
            <img src="/logo.svg" alt="BORHS Data" className="h-20 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--ds-text)]">Welcome back</h1>
          <p className="text-[var(--ds-text-secondary)] mt-2 text-sm">Your everyday services are waiting.</p>
        </div>

        <div className="rounded-[var(--ds-radius-sheet)] bg-surface p-6 shadow-[var(--ds-shadow-card)] sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email or Username</label>
              <input
                {...register('identifier')}
                type="text"
                className={`input ${errors.identifier ? 'input-error' : ''}`}
                placeholder="you@example.com or @username"
                autoComplete="username"
              />
              {errors.identifier && <p className="text-red-400 text-xs mt-1">{errors.identifier.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer text-sm"
              style={{ color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={rememberIdentifier}
                onChange={(event) => {
                  setRememberIdentifier(event.target.checked);
                  if (!event.target.checked) {
                    localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
                  }
                }}
                className="h-4 w-4 accent-primary-500"
              />
              Remember email or username
            </label>

            {biometricAvailable && !biometricSaved && (
              <label className="flex items-start gap-3 cursor-pointer rounded-xl p-3"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <input
                  type="checkbox"
                  checked={enableBiometric}
                  onChange={(event) => setEnableBiometric(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary-500"
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Enable fingerprint login on this device
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full btn-lg gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            {biometricAvailable && biometricSaved && (
              <>
                <div className="flex items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
                  <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
                </div>
                <button
                  type="button"
                  onClick={signInWithFingerprint}
                  disabled={biometricLoading || isLoading}
                  className="btn-secondary w-full btn-lg gap-2"
                >
                  {biometricLoading ? (
                    <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    <Fingerprint size={20} />
                  )}
                  {biometricLoading ? 'Checking fingerprint...' : 'Sign in with fingerprint'}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold">Create one free</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

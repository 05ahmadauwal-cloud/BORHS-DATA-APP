import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff, UserPlus, CheckCircle, Sun, Moon } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import toast from 'react-hot-toast';

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-z0-9_]+$/i, 'Only letters, numbers and underscore allowed'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(10, 'Enter a valid Nigerian phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Must contain at least one uppercase letter')
    .regex(/(?=.*[0-9])/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: storeRegister, isLoading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const { register, handleSubmit, watch, setValue, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { referralCode: refCode },
  });

  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...payload } = data;
      const result = await storeRegister(payload);
      toast.success(`Welcome to BORHS Data, ${result.user.firstName}!`);
      navigate('/dashboard');
    } catch (error) {
      const response = error.response?.data;
      const validationErrors = Array.isArray(response?.errors) ? response.errors : [];

      validationErrors.forEach(({ field, message }) => {
        if (field) setError(field, { type: 'server', message });
      });

      const message = validationErrors.map((item) => item.message).filter(Boolean).join('. ')
        || response?.message
        || 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  const passwordChecks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 py-12">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-xl transition-colors hover:bg-dark-700/60"
        style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center mb-6">
            <img src="/logo.png" alt="BORHS Data App" style={{ height: 100, width: 'auto', display: 'block' }} />
          </Link>
          <h1 className="text-2xl font-black text-dark-50">Create your account</h1>
          <p className="text-dark-400 mt-2 text-sm">Join 50,000+ Nigerians saving money on data & bills</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input {...register('firstName')} className={`input ${errors.firstName ? 'input-error' : ''}`} placeholder="John" />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...register('lastName')} className={`input ${errors.lastName ? 'input-error' : ''}`} placeholder="Doe" />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 font-bold text-sm">@</span>
                <input
                  {...register('username')}
                  className={`input pl-7 ${errors.username ? 'input-error' : ''}`}
                  placeholder="yourname"
                  autoComplete="username"
                  onInput={(e) => {
                    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    if (clean !== e.target.value) {
                      e.target.value = clean;
                      setValue('username', clean, { shouldValidate: true });
                    }
                  }}
                />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="label">Email Address</label>
              <input {...register('email')} type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="john@example.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input {...register('phone')} type="tel" className={`input ${errors.phone ? 'input-error' : ''}`} placeholder="08012345678" />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Create a strong password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 p-1">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-1">
                      <CheckCircle size={11} className={check.met ? 'text-success-500' : 'text-dark-600'} />
                      <span className={`text-xs ${check.met ? 'text-success-500' : 'text-dark-500'}`}>{check.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Repeat your password"
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="label">Referral Code <span className="text-dark-500">(optional)</span></label>
              <input {...register('referralCode')} className="input" placeholder="Enter referral code" />
            </div>

            <button type="submit" disabled={isLoading || isSubmitting} className="btn-primary w-full btn-lg gap-2 mt-2">
              {isLoading || isSubmitting
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <UserPlus size={18} />
              }
              {isLoading || isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-xs text-dark-400 text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary-400 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary-400 hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
              <Zap size={17} className="text-white" fill="white" />
            </div>
            <span className="font-black text-dark-50 text-lg">BORHS Data</span>
          </Link>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-success-500/10 border border-success-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success-500" />
              </div>
              <h2 className="text-xl font-bold text-dark-50 mb-2">Check Your Email</h2>
              <p className="text-dark-400 text-sm mb-6">
                If an account with <strong className="text-dark-200">{email}</strong> exists, we've sent a password reset link.
              </p>
              <Link to="/login" className="btn-secondary gap-2"><ArrowLeft size={16} /> Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-dark-50 mb-2">Forgot Password?</h2>
                <p className="text-dark-400 text-sm">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      className="input pl-10"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-dark-400 hover:text-dark-200 text-sm flex items-center justify-center gap-1">
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

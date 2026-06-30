import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';
import { authAPI } from '../../api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-success-500 rounded-xl flex items-center justify-center">
            <Zap size={17} className="text-white" fill="white" />
          </div>
          <span className="font-black text-dark-50 text-lg">BORHS Data</span>
        </Link>

        <div className="card p-10">
          {status === 'loading' && (
            <>
              <Loader2 size={48} className="text-primary-400 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-bold text-dark-50 mb-2">Verifying your email...</h2>
              <p className="text-dark-400 text-sm">Please wait a moment</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle size={56} className="text-success-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-dark-50 mb-2">Email Verified!</h2>
              <p className="text-dark-400 text-sm mb-6">Your email has been verified. You can now access all features.</p>
              <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle size={56} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-dark-50 mb-2">Verification Failed</h2>
              <p className="text-dark-400 text-sm mb-6">The link may be invalid or expired. Please request a new verification email.</p>
              <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { 
  KeyRound, 
  Mail, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import TurnstileWidget from '../components/TurnstileWidget';

export default function ForgotPassword() {
  const { requestForgotPasswordOtp, loading } = useAuth();
  const { activeTheme } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please provide your registered email address.');
      return;
    }

    // Request 6-digit OTP from backend
    const res = await requestForgotPasswordOtp(email, captchaToken);
    
    if (res.success) {
      // Direct navigation to dedicated /reset-password page!
      navigate('/reset-password', {
        state: {
          email: email.trim().toLowerCase()
        }
      });
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className={`min-h-screen ${activeTheme.bg} flex flex-col items-center justify-center py-12 px-4 relative`}>
      
      {/* Back to Login Link */}
      <div className="absolute top-8 left-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative animate-fade-in">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-xs text-slate-400">
            Enter your registered email address to receive a secure 6-digit password reset code.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Cloudflare Turnstile CAPTCHA */}
          <TurnstileWidget
            onSuccess={(token) => setCaptchaToken(token)}
            onError={() => setCaptchaToken('')}
            onExpire={() => setCaptchaToken('')}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl ${activeTheme.primaryBtn} font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all`}
          >
            <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Remembered your password?{' '}
          <Link to="/login" className={`${activeTheme.accentText} font-bold hover:underline`}>
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}

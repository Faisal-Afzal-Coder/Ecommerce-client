import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { Sparkles, User, Mail, Lock, UserPlus, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import TurnstileWidget from '../components/TurnstileWidget';
import OtpModal from '../components/OtpModal';

export default function Register() {
  const { user, requestSignupOtp, verifySignupOtp, loading } = useAuth();
  const { storeConfig, activeTheme } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [existingAccount, setExistingAccount] = useState(false);

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'One special character (! @ # $ etc.)', met: /[^A-Za-z0-9\s]/.test(password) }
  ];
  const isStrongPassword = passwordRequirements.every((requirement) => requirement.met);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setExistingAccount(false);

    if (!isStrongPassword) {
      setErrorMsg('Please meet all password requirements before creating your account.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    // Request OTP from backend (validates fields, checks existing email, verifies Turnstile)
    const res = await requestSignupOtp(name, email, password, confirmPassword, captchaToken);
    if (res.success) {
      setOtpError('');
      setIsOtpModalOpen(true);
    } else {
      setErrorMsg(res.message);
      setExistingAccount(/already exists/i.test(res.message));
    }
  };

  const handleVerifyOtp = async (otpCode) => {
    setOtpVerifyLoading(true);
    setOtpError('');

    const res = await verifySignupOtp(name, email, password, otpCode);
    setOtpVerifyLoading(false);

    if (res.success) {
      setIsOtpModalOpen(false);
      navigate('/');
    } else {
      setOtpError(res.message);
    }
  };

  const handleResendOtp = async () => {
    const res = await requestSignupOtp(name, email, password, confirmPassword, captchaToken);
    if (!res.success) {
      throw new Error(res.message);
    }
  };

  return (
    <div className={`min-h-screen ${activeTheme.bg} flex flex-col items-center justify-center py-12 px-4 relative`}>
      
      {/* Return to Storefront Link */}
      <div className="absolute top-8 left-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>
      </div>

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative">
        
        <div className="text-center space-y-2">
          <div className={`w-12 h-12 rounded-2xl ${activeTheme.primaryBtn} flex items-center justify-center mx-auto shadow-lg`}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-xs text-slate-400">Join {storeConfig.navbarLogoText || 'LuxeStore'} today with verified email</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {errorMsg}
              {existingAccount && (
                <>
                  {' '}
                  <Link to="/login" className="font-bold text-white underline underline-offset-2 hover:text-indigo-200">
                    Sign in instead
                  </Link>
                </>
              )}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-2">
              <p className="text-[11px] font-semibold text-slate-300">Your password must include:</p>
              <ul className="space-y-1.5" aria-live="polite">
                {passwordRequirements.map((requirement) => (
                  <li
                    key={requirement.label}
                    className={`flex items-center gap-2 text-[11px] transition-colors ${
                      requirement.met ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {requirement.met ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border border-slate-600" aria-hidden="true" />
                    )}
                    <span>{requirement.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter identical password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Cloudflare Turnstile CAPTCHA Widget */}
          <TurnstileWidget
            onSuccess={(token) => setCaptchaToken(token)}
            onError={() => setCaptchaToken('')}
            onExpire={() => setCaptchaToken('')}
          />

          <button
            type="submit"
            disabled={loading || !isStrongPassword}
            className={`w-full py-3 rounded-xl ${activeTheme.primaryBtn} font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Sending Verification Code...' : 'Continue with Verification'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className={`${activeTheme.accentText} font-bold hover:underline`}>
            Sign In Here
          </Link>
        </div>

      </div>

      {/* 6-Digit Email OTP Verification Dialog */}
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={email}
        title="Verify Your Registration"
        subtitle="We have sent a 6-digit code to"
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        loading={otpVerifyLoading}
        error={otpError}
      />

    </div>
  );
}

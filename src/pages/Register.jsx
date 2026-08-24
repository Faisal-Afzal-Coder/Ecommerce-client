import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  UserPlus, 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle2,
  ArrowRight,
  LogIn,
  KeyRound
} from 'lucide-react';
import TurnstileWidget from '../components/TurnstileWidget';

export default function Register() {
  const { user, requestSignupOtp, loading } = useAuth();
  const { storeConfig, activeTheme } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [existingAccount, setExistingAccount] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

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

  // Real-time Email check when user finishes typing email
  const handleEmailBlur = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) return;

    try {
      setCheckingEmail(true);
      const res = await axios.get(`/api/auth/check-email?email=${encodeURIComponent(cleanEmail)}`, {
        silentToast: true
      });
      setCheckingEmail(false);

      if (res.data?.exists) {
        setExistingAccount(true);
        setErrorMsg('An account with this email is already registered.');
      } else {
        setExistingAccount(false);
        if (errorMsg === 'An account with this email is already registered.') {
          setErrorMsg('');
        }
      }
    } catch (err) {
      setCheckingEmail(false);
    }
  };

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

    // Request 6-digit OTP code from server
    const res = await requestSignupOtp(name, email.trim().toLowerCase(), password, confirmPassword, captchaToken);
    
    if (res.success) {
      // Direct navigation to dedicated /verify-otp page!
      navigate('/verify-otp', {
        state: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password
        }
      });
    } else {
      setErrorMsg(res.message);
      setExistingAccount(
        res.alreadyRegistered || 
        /already exists|already registered/i.test(res.message)
      );
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

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative animate-fade-in">
        
        <div className="text-center space-y-2">
          <div className={`w-12 h-12 rounded-2xl ${activeTheme.primaryBtn} flex items-center justify-center mx-auto shadow-lg`}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-xs text-slate-400">Join {storeConfig.navbarLogoText || 'LuxeStore'} today with verified email</p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs space-y-2.5 animate-fade-in">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            
            {existingAccount && (
              <div className="flex items-center gap-2 pt-1 border-t border-rose-500/20">
                <Link
                  to="/login"
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-center flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/forgot-password"
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset Password</span>
                </Link>
              </div>
            )}
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (existingAccount) setExistingAccount(false);
                }}
                onBlur={handleEmailBlur}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            {checkingEmail && (
              <p className="text-[11px] text-slate-500 mt-1 animate-pulse">Checking email availability...</p>
            )}
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
              <ul className="space-y-1.5">
                {passwordRequirements.map((requirement) => (
                  <li
                    key={requirement.label}
                    className={`flex items-center gap-2 text-[11px] transition-colors ${
                      requirement.met ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {requirement.met ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border border-slate-600" />
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
            className={`w-full py-3.5 rounded-xl ${activeTheme.primaryBtn} font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Sending Verification Code...' : 'Create Account & Send Code'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className={`${activeTheme.accentText} font-bold hover:underline`}>
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}

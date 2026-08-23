import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  RefreshCw,
  Check
} from 'lucide-react';

export default function ResetPassword() {
  const { resetPasswordWithOtp, requestForgotPasswordOtp } = useAuth();
  const { activeTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve state passed from forgot-password page
  const passedEmail = location.state?.email || '';
  const [email, setEmail] = useState(passedEmail);

  // 6-Digit OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [successReset, setSuccessReset] = useState(false);
  const [loading, setLoading] = useState(false);

  // Timers
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef([]);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(newPassword) },
    { label: 'One special character (! @ # $ etc.)', met: /[^A-Za-z0-9\s]/.test(newPassword) }
  ];
  const isStrongPassword = passwordRequirements.every((requirement) => requirement.met);

  // Auto-focus first digit box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    let cooldownTimer;
    if (resendCooldown > 0 && !canResend) {
      cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cooldownTimer);
  }, [resendCooldown, canResend]);

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleanValue.length > 1) {
      // Pasted full 6-digit code
      const pasted = cleanValue.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIdx = Math.min(cleanValue.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtpClick = async () => {
    if (!canResend) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await requestForgotPasswordOtp(email, 'test');
      if (res.success) {
        setSuccessMsg('A new 6-digit password reset code has been sent.');
        setTimeLeft(300);
        setCanResend(false);
        setResendCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (!isStrongPassword) {
      setErrorMsg('Please ensure your new password meets all security criteria.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordWithOtp(email, otpCode, newPassword, confirmPassword);
    setLoading(false);

    if (res.success) {
      setSuccessReset(true);
      // Auto navigate to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', {
          state: {
            successMessage: 'Your password has been updated successfully! Please sign in with your new password.'
          }
        });
      }, 2000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (successReset) {
    return (
      <div className={`min-h-screen ${activeTheme.bg} flex flex-col items-center justify-center py-12 px-4`}>
        <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/40 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Password Reset Complete!</h2>
            <p className="text-xs text-slate-400">
              Your account password has been updated securely. You can now sign in with your new credentials.
            </p>
          </div>
          <Link
            to="/login"
            className={`w-full py-3.5 rounded-xl ${activeTheme.primaryBtn} text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2`}
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${activeTheme.bg} flex flex-col items-center justify-center py-12 px-4 relative`}>

      {/* Back to Forgot Password Link */}
      <div className="absolute top-8 left-8">
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Forgot Password</span>
        </Link>
      </div>

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative animate-fade-in">

        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-300">
            Enter the 6-digit code sent to:
          </p>
          <p className="font-mono text-sm font-bold text-indigo-400 bg-slate-900/80 py-1.5 px-3 rounded-xl border border-slate-800 inline-block">
            {email || 'your registered email'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5 text-xs">

          {/* 6 Digit Verification Code */}
          <div>
            <label className="block text-slate-400 font-semibold mb-2 text-center text-xs">
              Enter 6-Digit OTP Code
            </label>

            <div className="flex justify-center gap-2 sm:gap-2.5">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-mono font-black text-white bg-slate-900 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition-all"
                />
              ))}
            </div>

            {/* Countdown Timer & Resend */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                Expires in: <strong className={timeLeft < 60 ? 'text-rose-400 font-mono' : 'text-slate-200 font-mono'}>{formattedTime}</strong>
              </span>

              <button
                type="button"
                onClick={handleResendOtpClick}
                disabled={!canResend}
                className={`font-semibold flex items-center gap-1 transition-colors ${canResend
                    ? 'text-pink-400 hover:text-pink-300 underline cursor-pointer'
                    : 'text-slate-600 cursor-not-allowed'
                  }`}
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>{canResend ? 'Resend Code' : `Resend in ${resendCooldown}s`}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create your new password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-300">Password Requirements:</p>
              <ul className="space-y-1">
                {passwordRequirements.map((requirement) => (
                  <li
                    key={requirement.label}
                    className={`flex items-center gap-1.5 text-[10px] transition-colors ${requirement.met ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                  >
                    {requirement.met ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-600" />
                    )}
                    <span>{requirement.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isStrongPassword || otpDigits.join('').length !== 6}
            className={`w-full py-3.5 rounded-xl ${activeTheme.primaryBtn} font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Updating Password...' : 'Save New Password & Login'}</span>
          </button>

          <div className="text-center pt-1 border-t border-slate-800">
            <Link
              to="/forgot-password"
              className="text-xs text-slate-400 hover:text-white underline underline-offset-2 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Email or Request Code Again</span>
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}

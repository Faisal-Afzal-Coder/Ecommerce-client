import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { KeyRound, Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import TurnstileWidget from '../components/TurnstileWidget';
import OtpModal from '../components/OtpModal';

export default function ForgotPassword() {
  const { requestForgotPasswordOtp, resetPasswordWithOtp, loading } = useAuth();
  const { storeConfig, activeTheme } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email + CAPTCHA, 2: Reset Form with OTP
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [successReset, setSuccessReset] = useState(false);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const passwordRequirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(newPassword) },
    { label: 'One special character (! @ # $ etc.)', met: /[^A-Za-z0-9\s]/.test(newPassword) }
  ];
  const isStrongPassword = passwordRequirements.every((requirement) => requirement.met);

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!email) {
      setMessage({ type: 'error', text: 'Please provide your email address.' });
      return;
    }

    const res = await requestForgotPasswordOtp(email, captchaToken);
    if (res.success) {
      setStep(2);
      setMessage({ type: 'success', text: res.message });
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!otp || otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter the full 6-digit verification code.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    if (!isStrongPassword) {
      setMessage({ type: 'error', text: 'Please ensure your new password meets all security criteria.' });
      return;
    }

    const res = await resetPasswordWithOtp(email, otp, newPassword, confirmPassword);
    if (res.success) {
      setSuccessReset(true);
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  if (successReset) {
    return (
      <div className={`min-h-screen ${activeTheme.bg} flex flex-col items-center justify-center py-12 px-4`}>
        <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/40 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Password Reset Complete</h2>
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

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {step === 1 ? 'Reset Password' : 'Set New Password'}
          </h2>
          <p className="text-xs text-slate-400">
            {step === 1
              ? 'Enter your account email to receive a secure 6-digit verification code.'
              : `Enter the 6-digit verification code sent to ${email}`}
          </p>
        </div>

        {message && (
          <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {step === 1 ? (
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
                  placeholder="Enter your registered email address"
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
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            
            <div>
              <label className="block text-slate-400 font-semibold mb-1">6-Digit Verification Code</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-base tracking-widest focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Check your inbox/spam folder for the code.</p>
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

              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-2">
                <p className="text-[11px] font-semibold text-slate-300">Password Requirements:</p>
                <ul className="space-y-1.5" aria-live="polite">
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
              disabled={loading || !isStrongPassword || otp.length !== 6}
              className={`w-full py-3.5 rounded-xl ${activeTheme.primaryBtn} font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-2"
              >
                Change Email or Request Code Again
              </button>
            </div>
          </form>
        )}

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

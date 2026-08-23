import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Mail,
  Check
} from 'lucide-react';

export default function VerifyOtp() {
  const { verifySignupOtp, requestSignupOtp } = useAuth();
  const { activeTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve state passed from registration page
  const registrationData = location.state || {};
  const [email, setEmail] = useState(registrationData.email || '');
  const [name, setName] = useState(registrationData.name || '');
  const [password, setPassword] = useState(registrationData.password || '');

  // 6 Digit OTP Box State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown & Resend Timers
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
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

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    if (!email) {
      setErrorMsg('Email address is missing. Please return to registration.');
      return;
    }

    setLoading(true);
    const res = await verifySignupOtp(name, email, password, otpCode);
    setLoading(false);

    if (res.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await requestSignupOtp(name, email, password, password, 'test');
      if (res.success) {
        setSuccessMsg('A new 6-digit verification code has been generated and sent.');
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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className={`min-h-screen ${activeTheme.bg} flex flex-col items-center justify-center py-12 px-4 relative`}>
      
      {/* Return to Registration / Store Link */}
      <div className="absolute top-8 left-8">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Register</span>
        </Link>
      </div>

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative animate-fade-in">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center mx-auto shadow-xl">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-xs text-slate-300">
            We sent a 6-digit verification code to:
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

        <form onSubmit={handleVerifySubmit} className="space-y-6">
          
          {/* 6 Digit Interactive Boxes */}
          <div>
            <label className="block text-slate-400 font-semibold mb-2 text-center text-xs">
              Enter 6-Digit OTP Code
            </label>
            
            <div className="flex justify-center gap-2 sm:gap-3">
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
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-mono font-black text-white bg-slate-900 border border-slate-700 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition-all"
                />
              ))}
            </div>
          </div>

          {/* Countdown Timer & Resend Button */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Code expires in: <strong className={timeLeft < 60 ? 'text-rose-400 font-mono' : 'text-slate-200 font-mono'}>{formattedTime}</strong>
            </span>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend}
              className={`font-semibold flex items-center gap-1 transition-colors ${
                canResend
                  ? 'text-pink-400 hover:text-pink-300 underline cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>{canResend ? 'Resend Code' : `Resend in ${resendCooldown}s`}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otpDigits.join('').length !== 6}
            className={`w-full py-3.5 rounded-xl ${activeTheme.primaryBtn} text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all`}
          >
            {loading ? (
              <span>Verifying Code...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Complete Registration</span>
              </>
            )}
          </button>

          <div className="text-center pt-2 border-t border-slate-800">
            <Link
              to="/register"
              className="text-xs text-slate-400 hover:text-white underline underline-offset-2 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Email or Re-enter Details</span>
            </Link>
          </div>

        </form>

      </div>
    </div>
  );
}

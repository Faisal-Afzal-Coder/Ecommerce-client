import React, { useState, useEffect, useRef } from 'react';
import { Mail, Clock, RefreshCw, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function OtpModal({
  isOpen,
  onClose,
  email,
  title = 'Verify Your Email',
  subtitle = 'We have sent a 6-digit verification code to',
  onVerify,
  onResend,
  loading = false,
  error = ''
}) {
  const { activeTheme } = useStore();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [localError, setLocalError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      setDigits(['', '', '', '', '', '']);
      setLocalError('');
      return;
    }

    setCountdown(300);
    setCanResend(false);
    setLocalError('');

    // Focus first input
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 150);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        if (prev <= 240) {
          // Allow resend after 60s
          setCanResend(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleChange = (index, value) => {
    setLocalError('');
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    // Handle paste of full 6-digit code
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = value;
    setDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newDigits = pastedData.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = digits.join('');
    if (otpCode.length !== 6) {
      setLocalError('Please enter the full 6-digit verification code.');
      return;
    }
    onVerify(otpCode);
  };

  const handleTriggerResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setLocalError('');
    try {
      if (onResend) {
        await onResend();
      }
      setCountdown(300);
      setCanResend(false);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setLocalError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const displayError = error || localError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {subtitle} <span className="font-semibold text-indigo-300 font-mono block mt-0.5">{email}</span>
          </p>
        </div>

        {/* Error Alert */}
        {displayError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 6 Digit Input Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl bg-slate-900 border-2 border-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-900/90 transition-all shadow-inner"
              />
            ))}
          </div>

          {/* Countdown & Resend Option */}
          <div className="flex items-center justify-between text-xs px-1 text-slate-400">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Expires in <strong className="text-white">{formatTime(countdown)}</strong></span>
            </div>

            <button
              type="button"
              onClick={handleTriggerResend}
              disabled={!canResend || resending}
              className={`flex items-center gap-1 font-semibold transition-colors ${
                canResend && !resending
                  ? `${activeTheme.accentText} hover:underline cursor-pointer`
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Sending...' : 'Resend Code'}</span>
            </button>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading || digits.join('').length !== 6}
            className={`w-full py-3.5 rounded-2xl ${activeTheme.primaryBtn} text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying Code...</span>
              </div>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Verify Account</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

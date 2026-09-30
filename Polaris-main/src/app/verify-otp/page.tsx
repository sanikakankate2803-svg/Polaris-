'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  KeyRound,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, allUsersList } = useAuth();

  const queryEmail = searchParams.get('email');
  const [email] = useState<string>(() => {
    if (queryEmail) return queryEmail;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('polaris_pending_email');
      if (stored) return stored;
    }
    return user?.email || '';
  });

  const [otp, setOtp] = useState('');
  const [activeCode, setActiveCode] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && email) {
      try {
        const storedOtp = localStorage.getItem(`polaris_active_otp_${email.toLowerCase()}`);
        if (storedOtp) {
          const parsed = JSON.parse(storedOtp);
          if (parsed.code) return parsed.code;
        }
      } catch {
        // ignore
      }
    }
    return null;
  });
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch active code for sandbox / local test helper
  useEffect(() => {
    if (!email) return;
    let isMounted = true;

    fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status', email }),
    })
      .then(r => r.json())
      .then(data => {
        if (isMounted && data.code) {
          setActiveCode(data.code);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [email]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify via API (which also sets the polaris_otp_verified=true cookie for middleware)
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email,
          code: cleanOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP code. Please check and try again.');
      }

      // Also set client-side cookie directly for guaranteed instant parity
      document.cookie = 'polaris_otp_verified=true; path=/; max-age=86400; SameSite=Lax';

      setSuccessMessage('Verification successful! Unlocking your dashboard...');

      // Update current user profile in storage/context
      const matchedProfile = allUsersList.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      ) || user;

      if (matchedProfile) {
        const verifiedProfile = {
          ...matchedProfile,
          email_verified: true,
        };
        localStorage.setItem('polaris_current_user', JSON.stringify(verifiedProfile));
        localStorage.removeItem('polaris_pending_email');
      }

      // Short delay for user feedback then redirect based on role
      setTimeout(() => {
        if (matchedProfile?.verification_status === 'pending') {
          router.push('/verification-pending');
        } else if (matchedProfile?.role === 'startup') {
          router.push('/startups/dashboard');
        } else if (matchedProfile?.role === 'admin') {
          router.push('/admin');
        } else if (matchedProfile?.role === 'validator') {
          router.push('/validation');
        } else {
          router.push('/dashboard');
        }
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to verify OTP code.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend', email }),
      });
      const data = await res.json();
      if (data.code) {
        setActiveCode(data.code);
      }
      setCountdown(60);
      setSuccessMessage('A fresh 6-digit verification code has been dispatched.');
    } catch {
      setErrorMessage('Failed to resend verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-sky-400 shadow-md">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">
          Two-Factor Authentication
        </h2>
        <p className="text-xs text-slate-600">
          Enter the 6-digit one-time code sent to your email to verify your identity and access Polaris.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-5">
        {/* Recipient Notice */}
        <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-200 flex items-start gap-3 text-xs text-sky-900">
          <Mail className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">OTP Verification Code Dispatched</span>
            <p className="text-slate-600">
              Code was sent to <strong className="text-slate-900 font-mono">{email || 'your registered email'}</strong>.
            </p>
          </div>
        </div>

        {/* Sandbox & Demo Helper Callout */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Sandbox / Demo Verification Assistant
            </span>
            <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded font-mono font-semibold">
              Local Testing
            </span>
          </div>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            In this environment, email delivery is simulated. Your generated 6-digit OTP code is:
          </p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold bg-white px-3 py-1 rounded border border-amber-300 text-slate-900 tracking-wider">
              {activeCode || '849201'}
            </span>
            <button
              type="button"
              onClick={() => setOtp(activeCode || '849201')}
              className="text-[11px] bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold px-2.5 py-1.5 rounded transition-colors"
            >
              Click to Auto-fill Code
            </button>
          </div>
          <p className="text-[10px] text-amber-700">
            *Universal test fallback code <code className="font-mono font-bold">849201</code> is also accepted.
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
              Enter 6-Digit Verification Code
            </label>
            <div className="flex justify-center">
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                autoFocus
                className="w-48 text-center text-2xl font-mono font-bold tracking-[0.5em] py-2.5 px-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-center text-slate-500 mt-1.5">
              Enter numbers only (6 digits)
            </p>
          </div>

          {/* Resend Row */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500">Didn&apos;t receive code?</span>
            {countdown > 0 ? (
              <span className="text-slate-400 font-medium">
                Resend available in {countdown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Resend Code Now
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 cursor-pointer"
          >
            {isLoading ? (
              'Verifying Code...'
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Verify & Unlock Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Entered the wrong email?{' '}
          <Link href="/signup" className="text-sky-600 font-semibold hover:underline">
            Register again
          </Link>
          {' · '}
          <Link href="/login" className="text-sky-600 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <Suspense fallback={<div className="text-slate-500 text-xs">Loading verification portal...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}

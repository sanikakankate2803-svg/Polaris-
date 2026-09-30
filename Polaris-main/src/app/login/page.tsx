'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, PRESET_USERS } from '@/context/auth-context';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Building2,
  Rocket,
  Scale,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = await login(email);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to sign in. Please verify your credentials.');
      return;
    }

    // Redirect to /verify-otp for two-factor verification challenge
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
  };

  const handleQuickPersona = (presetKey: keyof typeof PRESET_USERS) => {
    switchDemoRole(presetKey);
    const target = PRESET_USERS[presetKey];
    if (target.verification_status === 'pending') {
      router.push('/verification-pending');
    } else if (target.role === 'startup') {
      router.push('/startups/dashboard');
    } else if (target.role === 'admin') {
      router.push('/admin');
    } else if (target.role === 'validator') {
      router.push('/validation');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-sky-400 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">
            Sign In to Polaris
          </h2>
          <p className="text-xs text-slate-600">
            Government innovation procurement, pilot tracking, and milestone escrow portal.
          </p>
        </div>

        {/* Quick Demo Personas Bar */}
        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Quick Demo Personas (1-Click Login):
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickPersona('department')}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 flex flex-col gap-0.5 transition-colors"
            >
              <div className="flex items-center justify-between text-sky-400 font-bold text-[11px]">
                <span>Dept Official</span>
                <Building2 className="w-3 h-3" />
              </div>
              <span className="text-[10px] text-slate-400 truncate">MeitY (Verified)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPersona('startup')}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 flex flex-col gap-0.5 transition-colors"
            >
              <div className="flex items-center justify-between text-indigo-400 font-bold text-[11px]">
                <span>Startup Founder</span>
                <Rocket className="w-3 h-3" />
              </div>
              <span className="text-[10px] text-slate-400 truncate">AeroVision AI</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPersona('validator')}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 flex flex-col gap-0.5 transition-colors"
            >
              <div className="flex items-center justify-between text-purple-400 font-bold text-[11px]">
                <span>Validator</span>
                <Scale className="w-3 h-3" />
              </div>
              <span className="text-[10px] text-slate-400 truncate">Testing Council</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPersona('admin')}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 flex flex-col gap-0.5 transition-colors"
            >
              <div className="flex items-center justify-between text-amber-400 font-bold text-[11px]">
                <span>Admin</span>
                <Lock className="w-3 h-3" />
              </div>
              <span className="text-[10px] text-slate-400 truncate">Procurement PMO</span>
            </button>
          </div>

          {/* Pending Official quick test */}
          <button
            type="button"
            onClick={() => handleQuickPersona('pending_official')}
            className="w-full py-1.5 px-2 rounded-lg bg-yellow-950/60 hover:bg-yellow-900/60 border border-yellow-800/80 text-yellow-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
            Test Unverified Official Persona (Routes to Pending Screen)
          </button>
        </div>

        {/* Standard Form */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="officer@meity.gov.in or founder@startup.io"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow transition-all flex items-center justify-center gap-2"
            >
              Sign In to Portal
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-sky-600 font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

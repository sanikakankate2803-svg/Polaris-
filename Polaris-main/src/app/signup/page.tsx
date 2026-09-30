'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import type { UserRole } from '@/types/database';
import {
  isGovernmentEmail,
  validateGovernmentEmail,
  ALLOWED_GOVERNMENT_DOMAINS,
} from '@/config/government-domains';
import {
  ShieldAlert,
  Building2,
  Rocket,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, isLoading } = useAuth();

  const roleParam = searchParams.get('role');
  const isOfficialParam = roleParam === 'department' || roleParam === 'validator' || roleParam === 'admin';

  // Mode: 'startup' (Public) vs 'official' (Restricted Gov Domain)
  const [tab, setTab] = useState<'startup' | 'official'>(() => (isOfficialParam ? 'official' : 'startup'));

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orgOrDepartment, setOrgOrDepartment] = useState('');
  const [officialRole, setOfficialRole] = useState<UserRole>(() => {
    if (roleParam === 'validator') return 'validator';
    if (roleParam === 'admin') return 'admin';
    return 'department_official';
  });
  const [password, setPassword] = useState('');

  // UI validation & feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [domainWarning, setDomainWarning] = useState<string | null>(null);

  // Real-time domain validation as the user types in official mode
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setErrorMessage(null);

    if (tab === 'official' && val.includes('@')) {
      const validation = validateGovernmentEmail(val);
      if (!validation.isValid) {
        setDomainWarning(validation.error || 'Must be an authorized government domain.');
      } else {
        setDomainWarning(null);
      }
    } else {
      setDomainWarning(null);
    }
  };

  // Submit Registration -> Send OTP & Redirect immediately to /verify-otp
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetRole: UserRole = tab === 'startup' ? 'startup' : officialRole;

    // Strict Form-Level Guard for Official roles
    if (tab === 'official') {
      const check = validateGovernmentEmail(email);
      if (!check.isValid) {
        setErrorMessage(
          check.error ||
            'Submission rejected: Government Official roles require an authorized @gov.in or official agency email domain.'
        );
        return;
      }
    }

    const result = await signup({
      email,
      role: targetRole,
      name,
      org_or_department: orgOrDepartment,
      password,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Registration failed. Please review your details.');
      return;
    }

    // Immediately route to /verify-otp challenge
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="max-w-md w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-sky-400 shadow-md">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">
          Create a Polaris Account
        </h2>
        <p className="text-xs text-slate-600">
          Select your registration channel below. A 6-digit OTP will be dispatched to verify your identity.
        </p>
      </div>

      {/* Tab Selection */}
      <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-lg text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setTab('startup');
            setErrorMessage(null);
            setDomainWarning(null);
          }}
          className={`py-2.5 rounded-md flex items-center justify-center gap-2 transition-all ${
            tab === 'startup'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          Startup (Public)
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('official');
            setErrorMessage(null);
            setDomainWarning(null);
          }}
          className={`py-2.5 rounded-md flex items-center justify-center gap-2 transition-all ${
            tab === 'official'
              ? 'bg-slate-900 text-sky-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Official Role (Restricted)
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-5">
        {/* Official Domain Notice */}
        {tab === 'official' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Authorized Government Domain Required</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Department Officials, Validators, and Admins must register with a recognized government email address. Non-government emails are automatically blocked.
            </p>
            <div className="text-[11px] text-amber-900/80 font-mono flex flex-wrap gap-1 pt-1">
              <span className="font-sans font-semibold">Allowed:</span>
              {ALLOWED_GOVERNMENT_DOMAINS.slice(0, 6).map(d => (
                <span key={d} className="bg-amber-100 px-1 py-0.2 rounded">
                  @{d}
                </span>
              ))}
              <span>...</span>
            </div>
          </div>
        ) : (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Open to registered technology startups. You will verify your account via OTP on the next screen before accessing the startup portal.
            </p>
          </div>
        )}

        {/* Form Error Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSignupSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name / Officer Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={tab === 'official' ? 'Rajesh Kumar, IAS' : 'Priya Sharma'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Official Role Selection (ONLY in official tab) */}
          {tab === 'official' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Role Requested
              </label>
              <select
                value={officialRole}
                onChange={e => setOfficialRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="department_official">Department Official (Buyer/Officer)</option>
                <option value="validator">Independent Validator (Auditor/Testing Agency)</option>
                <option value="admin">System Administrator (Procurement Cell)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                *Official roles require administrative verification before procurement dashboards unlock.
              </p>
            </div>
          )}

          {/* Organization / Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {tab === 'official' ? 'Government Ministry / Department / Agency' : 'Startup Company Name'}
            </label>
            <input
              type="text"
              required
              value={orgOrDepartment}
              onChange={e => setOrgOrDepartment(e.target.value)}
              placeholder={
                tab === 'official'
                  ? 'Ministry of Housing & Urban Affairs'
                  : 'AeroVision Autonomous Systems'
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Email with real-time feedback */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {tab === 'official' ? 'Official Government Email' : 'Work Email'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => handleEmailChange(e.target.value)}
              placeholder={
                tab === 'official' ? 'officer.name@meity.gov.in' : 'contact@aerovision.io'
              }
              className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                domainWarning
                  ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500'
                  : 'border-slate-300 focus:ring-sky-500'
              }`}
            />

            {/* Real-time domain validation message */}
            {domainWarning && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-start gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{domainWarning}</span>
              </p>
            )}

            {tab === 'official' && !domainWarning && email.includes('@') && isGovernmentEmail(email) && (
              <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Authorized government domain recognized.</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || Boolean(domainWarning && tab === 'official')}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm shadow transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'official'
                ? 'bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-indigo-300'
            }`}
          >
            {isLoading ? (
              'Creating Account & Dispatching OTP...'
            ) : (
              <>
                Register & Proceed to OTP Verification
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Already have an account?{' '}
          <Link href="/login" className="text-sky-600 font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <Suspense fallback={<div className="text-slate-500 text-xs">Loading registration portal...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}

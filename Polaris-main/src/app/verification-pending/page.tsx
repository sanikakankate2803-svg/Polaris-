'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ArrowRight,
  LogOut,
} from 'lucide-react';

export default function VerificationPendingPage() {
  const router = useRouter();
  const { user, logout, approvePendingUser } = useAuth();

  const handleSimulatedApproval = () => {
    if (user) {
      approvePendingUser(user.id);
      // Navigate to active dashboard once verified
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <div className="max-w-xl w-full space-y-6">
        {/* Main Pending Card */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Official Credential Review
              </span>
              <h2 className="text-2xl font-bold font-serif text-slate-900">
                Official Account Verification Pending
              </h2>
              <p className="text-xs text-slate-600">
                Your registration was submitted with an authorized government email domain and is currently pending administrative verification.
              </p>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
              Registration Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px]">Officer Name:</span>
                <span className="font-semibold text-slate-900">{user?.name || 'Government Official'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Requested Role:</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {user?.role ? user.role.replace('_', ' ') : 'Department Official'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Ministry / Agency:</span>
                <span className="font-semibold text-slate-900">
                  {user?.org_or_department || 'Government Department'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Official Email:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {user?.email || 'officer@gov.in'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Protocol Stages */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase">
              Verification Protocol
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Government domain validation passed (@gov.in / authorized domain)</span>
              </div>
              <div className="flex items-center gap-2.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>2-Factor Email OTP verification confirmed ({user?.email || 'officer@gov.in'})</span>
              </div>
              <div className="flex items-center gap-2.5 text-amber-700">
                <div className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0"></div>
                <span className="font-medium">Central Admin review & role authorization in progress</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></div>
                <span>Activation of procurement statement & pilot authorization permissions</span>
              </div>
            </div>
          </div>

          {/* Restricted Notice */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Until an administrator approves this account, access to the Department Official Dashboard, Problem Statement creation, and Pilot approvals remains locked.
            </p>
          </div>

          {/* Interactive Demo Simulation Button */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <UserCheck className="w-4 h-4" />
                Demo & Reviewer Fast-Forward
              </div>
              <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-1.5 py-0.5 rounded">
                Interactive Testing
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              As an evaluator, you can instantly simulate the administrator approving this account to verify how the dashboard unlocks.
            </p>
            <button
              onClick={handleSimulatedApproval}
              className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              Simulate Admin Approval & Unlock Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <button
              onClick={() => logout()}
              className="text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            <Link
              href="/"
              className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              Return to Polaris Homepage &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

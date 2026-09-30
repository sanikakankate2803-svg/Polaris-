'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Building2,
  Rocket,
  Coins,
  Scale,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-24 border-b border-slate-700">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            {/* Government Seal Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-sky-400 text-xs font-semibold shadow-inner">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>National Innovation & Fast-Track Procurement Sandbox</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-serif leading-[1.15]">
              Accelerating Government Procurement of Startup Innovations.
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl font-normal">
              Polaris replaces slow, paperwork-heavy tendering with an AI-driven, template-structured, milestone-based procurement framework designed for public sector impact.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-900/40 transition-all hover:translate-y-[-1px]"
              >
                Enter Official Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup?role=startup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
              >
                <Rocket className="w-4 h-4 text-indigo-400" />
                Register as Startup
              </Link>
            </div>

            {/* Quick Testing Callout */}
            <div className="pt-6 text-xs text-slate-400 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Currently testing as:</span>
              <span className="font-semibold text-sky-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                {user ? `${user.name} (${user.role.replace('_', ' ')})` : 'Guest'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Use the top bar buttons to switch roles anytime.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Mechanism: 4 Pillars */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-700">
              Structured Procurement Lifecycle
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">
              From Informal Need to Nationwide Scaled Deployment
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every stage is governed by transparent metrics, auditable milestones, and independent validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-4 font-bold text-sm">
                  01
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  AI Problem Structuring
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Department officials submit raw, unstructured operational bottlenecks. Polaris transforms them into clean procurement-ready scopes with defined KPIs and success metrics.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-semibold text-sky-700">
                Template-driven RFP creation
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 font-bold text-sm">
                  02
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Objective Match & Scoring
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Startups are matched via algorithmic relevance and evaluated across product maturity, technical readiness, references, and past pilot ratings.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-semibold text-indigo-700">
                Transparent eligibility scoring
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 font-bold text-sm">
                  03
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  Milestone Escrow Pilots
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilot contracts are divided into transparent milestones. Funds are escrowed and released incrementally upon mutual approval of verified deliverables.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-semibold text-emerald-700">
                Risk-mitigated disbursements
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-4 font-bold text-sm">
                  04
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-600" />
                  Independent Validation
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Accredited third-party validators audit pilot outcomes against SLA metrics. Certified solutions graduate directly into the Public Solutions Library.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-semibold text-purple-700">
                Direct nationwide scale-up
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Access Rules Transparency */}
      <section className="py-16 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Strict Government Domain Validation Enforced
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900">
                  Role Registration Security Policy
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  To safeguard procurement integrity, Department Official, Validator, and Admin credentials can only be registered via authorized government email domains (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-xs">@gov.in</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-xs">@nic.in</code>). Newly submitted official profiles remain in <span className="font-semibold text-amber-700">pending status</span> until validated by a designated administrator.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto">
                <Link
                  href="/signup?role=department"
                  className="px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold text-center transition-colors flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-sky-400" />
                  Register Department Official
                </Link>
                <Link
                  href="/signup?role=startup"
                  className="px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold text-center transition-colors flex items-center justify-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  Register Startup Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

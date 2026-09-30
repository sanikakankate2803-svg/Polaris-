'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getStartupByProfileId, getAllStartups, calculateStartupEligibility } from '@/lib/startups-store';
import { getAllProblemStatements } from '@/lib/problem-statements-store';
import type { Startup } from '@/types/database';
import {
  Rocket,
  CheckCircle2,
  Clock,
  Coins,
  Edit,
  Sparkles,
  Globe,
  Tag,
} from 'lucide-react';

function StartupDashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const onboardingJustCompleted = searchParams.get('onboarding') === 'complete';

  // Find startup linked to user, or fallback to first seeded startup (AeroVision)
  const [activeStartup] = useState<Startup>(() => {
    if (user) {
      const found = getStartupByProfileId(user.id);
      if (found) return found;
    }
    const all = getAllStartups();
    return all[0];
  });

  const [problemStatements] = useState(() => getAllProblemStatements());

  const eligibility = calculateStartupEligibility(activeStartup);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Onboarding success notification */}
      {onboardingJustCompleted && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-sm">Onboarding Profile Saved Successfully!</span>
              <p className="text-[11px] text-emerald-700">
                Your startup credentials, TRL maturity, and references have been indexed by the Polaris matching engine.
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded uppercase">
            Profile Active
          </span>
        </div>
      )}

      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
            <Rocket className="w-4 h-4" />
            <span>GovTech Startup Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            {activeStartup.name}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
            <span>Representative: <strong className="text-slate-900">{user?.name || 'Startup Partner'}</strong></span>
            <span>&bull;</span>
            <span>Sector: <strong className="text-slate-900">{activeStartup.sector}</strong></span>
            {activeStartup.website && (
              <>
                <span>&bull;</span>
                <a
                  href={activeStartup.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  Website
                </a>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/startups/onboarding"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Onboarding Profile
          </Link>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-2 rounded-lg shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified Vendor
          </span>
        </div>
      </div>

      {/* Priority Action Notification */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Active Milestone Due in 4 Days
          </div>
          <h2 className="text-lg font-bold">
            Milestone 2 Deliverable: Edge Video Inference Accuracy Benchmark
          </h2>
          <p className="text-xs text-indigo-200 max-w-xl">
            Department of Electronics & IT • Escrow Hold: <span className="font-semibold text-white">₹4,50,000</span>. Please upload the test harness documentation and latency reports.
          </p>
        </div>
        <Link
          href="/pilots/pilot-101"
          className="px-4 py-2.5 rounded-lg bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 shadow transition-colors shrink-0"
        >
          Submit Deliverable &rarr;
        </Link>
      </div>

      {/* Grid: Eligibility Score Breakdown & Key Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Eligibility Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Procurement Eligibility Rating
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded capitalize">
              {activeStartup.product_maturity}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-serif text-slate-900">
              {eligibility.totalScore}
            </span>
            <span className="text-slate-400 text-sm font-medium">/ 100 Score</span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Product Maturity (TRL)</span>
                <span className="font-semibold text-slate-900">
                  {eligibility.breakdown.product_maturity_score} / 25
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(eligibility.breakdown.product_maturity_score / 25) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Technical Fit & Solution Scope</span>
                <span className="font-semibold text-slate-900">
                  {eligibility.breakdown.technical_fit_score} / 35
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(eligibility.breakdown.technical_fit_score / 35) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Past Public Pilots & Track Record</span>
                <span className="font-semibold text-slate-900">
                  {eligibility.breakdown.past_pilot_score} / 25
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${(eligibility.breakdown.past_pilot_score / 25) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>References & Team Leadership</span>
                <span className="font-semibold text-slate-900">
                  {eligibility.breakdown.references_score} / 15
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(eligibility.breakdown.references_score / 15) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{activeStartup.references.length} verified references</span>
            <Link href="/startups/onboarding" className="text-indigo-600 font-semibold hover:underline">
              Update &rarr;
            </Link>
          </div>
        </div>

        {/* Escrow Funds */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Escrow Funds Contracted</span>
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold font-serif text-slate-900">₹12,50,000</div>
            <p className="text-xs text-slate-600 mt-2">
              Disbursed upon completion of verified milestones. Protected via automated public procurement escrow.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            ₹4,00,000 released for Milestone 1
          </div>
        </div>

        {/* Tags & Competencies */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Registered Competencies</span>
              <Tag className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(activeStartup.tags || []).map(t => (
                <span
                  key={t}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 text-xs text-indigo-700 font-semibold flex items-center justify-between">
            <span>Matching Active across {problemStatements.length} challenges</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Matched Government Problem Statements Opportunities */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-serif text-slate-900">
              Matched Government Innovation Challenges ({problemStatements.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Opportunities relevant to your technical capability profile.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Problem Statement Title</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Estimated Budget</th>
                <th className="px-6 py-3">Timeline</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {problemStatements.map(ps => (
                <tr key={ps.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/problem-statements/${ps.id}`}
                      className="font-semibold text-slate-900 hover:text-indigo-600 block"
                    >
                      {ps.title}
                    </Link>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {ps.raw_input}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {ps.department_name || 'Government Ministry'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {ps.budget_estimate || '₹18,00,000'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {ps.target_timeline || '90 Days'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/problem-statements/${ps.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      View Challenge &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function StartupDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Startup Dashboard...</div>}>
      <StartupDashboardContent />
    </Suspense>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { getAllProblemStatements } from '@/lib/problem-statements-store';
import type { ProblemStatement } from '@/types/database';
import {
  Sparkles,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Coins,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [problemStatements] = useState<ProblemStatement[]>(() => getAllProblemStatements());

  // Route pending users immediately
  if (user?.verification_status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900">
            Official Access Locked (Pending Verification)
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Your government official account (<span className="font-semibold">{user.email}</span>) is pending administrative credential approval. Official dashboards are disabled until authorized.
          </p>
          <div className="pt-2">
            <Link
              href="/verification-pending"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors"
            >
              View Verification Status & Actions &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is a Startup, direct to Startup Dashboard
  if (user?.role === 'startup') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900">
            Startup Innovation Workspace
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Welcome, <span className="font-semibold">{user.name}</span>. Track matched government challenges, pilot proposals, and milestone deliverables in your dedicated workspace.
          </p>
          <div className="pt-2">
            <Link
              href="/startups/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Open Startup Dashboard &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Department Official Dashboard (Default)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>{user?.org_or_department || 'Department of Electronics & IT'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            Department Procurement & Pilot Portal
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Logged in as <span className="font-medium text-slate-900">{user?.name}</span> (Verified Official)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/problem-statements/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all"
          >
            <Sparkles className="w-4 h-4 text-sky-200" />
            Draft Problem Statement (AI)
          </Link>
        </div>
      </div>

      {/* "WHAT NEEDS MY ACTION" - Priority Action Hub */}
      <div className="bg-white rounded-xl border border-sky-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sky-900 to-indigo-900 px-6 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider">
              Priority Tasks Requiring Department Action (3 Pending)
            </h2>
          </div>
          <span className="text-[11px] bg-sky-800 text-sky-200 px-2 py-0.5 rounded font-mono">
            Updated just now
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Action item 1 */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Milestone 2 Deliverable Review Due
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pilot: <span className="font-medium text-slate-800">Autonomous Edge AI Traffic Management</span> • Startup: AeroVision Systems • ₹4,50,000 escrow hold.
                </p>
              </div>
            </div>
            <Link
              href="/pilots/pilot-101"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-md transition-colors shrink-0"
            >
              Review Deliverable &rarr;
            </Link>
          </div>

          {/* Action item 2 */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    4 High-Relevance Startups Matched
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                    New AI Matches
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Problem Statement: <span className="font-medium text-slate-800">Real-Time Leakage Detection in Urban Water Pipelines</span> • Highest Match: 94% fit.
                </p>
              </div>
            </div>
            <Link
              href="/problem-statements/ps-201/matches"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors shrink-0"
            >
              Inspect Matches &rarr;
            </Link>
          </div>

          {/* Action item 3 */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Pilot Validation Certified by QCI
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                    Ready for Scale-Up
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pilot: <span className="font-medium text-slate-800">Optical OCR for Land Records Digitization</span> • Readiness Score: 9.4/10 • Scalable across state circles.
                </p>
              </div>
            </div>
            <Link
              href="/solutions"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors shrink-0"
            >
              View in Solution Library &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Active Problem Statements</span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">{problemStatements.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Innovation challenges published</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Funds Escrowed</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">₹24,50,000</div>
          <span className="text-[11px] text-slate-500">₹8,00,000 disbursed upon deliverables</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Avg. Days to Pilot</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">18.5 Days</div>
          <span className="text-[11px] text-emerald-600 font-medium">72% faster than traditional RFP</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Validated Scaled</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">2 Solutions</div>
          <span className="text-[11px] text-slate-500">Published to national library</span>
        </div>
      </div>

      {/* Dynamic Problem Statements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-serif text-slate-900">
              Department Problem Statements & Innovation Challenges ({problemStatements.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Published innovation challenges with AI-matched startup rankings.
            </p>
          </div>
          <Link
            href="/problem-statements/new"
            className="text-xs text-sky-700 font-semibold hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Submit New Statement
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Statement Title</th>
                <th className="px-6 py-3">Domain Tags</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Budget / Timeline</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {problemStatements.map(ps => (
                <tr key={ps.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/problem-statements/${ps.id}`}
                      className="font-semibold text-slate-900 hover:text-sky-600 block"
                    >
                      {ps.title}
                    </Link>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Submitted {new Date(ps.created_at).toLocaleDateString()} • {ps.department_name || user?.org_or_department}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {ps.category_tags.slice(0, 3).map(tag => (
                        <span key={tag} className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-[10px]">
                          {tag}
                        </span>
                      ))}
                      {ps.category_tags.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{ps.category_tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {ps.status === 'published' || ps.status === 'matching' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                        Matching Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{ps.budget_estimate || '₹18,00,000'}</div>
                    <div className="text-[11px] text-slate-500">{ps.target_timeline || '90 Days'}</div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/problem-statements/${ps.id}`}
                      className="text-slate-600 hover:text-slate-900 font-medium hover:underline"
                    >
                      Details
                    </Link>
                    <span className="text-slate-300">|</span>
                    <Link
                      href={`/problem-statements/${ps.id}/matches`}
                      className="text-sky-600 font-semibold hover:underline"
                    >
                      Matches &rarr;
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

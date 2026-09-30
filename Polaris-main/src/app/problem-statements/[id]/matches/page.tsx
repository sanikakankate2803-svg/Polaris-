'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProblemStatementById } from '@/lib/problem-statements-store';
import { getMatchesForProblem, updateMatchStatus } from '@/lib/matches-store';
import type { Match, MatchStatus } from '@/types/database';
import {
  Sparkles,
  Building2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Coins,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileCheck2,
  Globe,
  Award,
} from 'lucide-react';

export default function ProblemMatchesPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const [problem] = useState(() => (id ? getProblemStatementById(id) || null : null));
  const [matches, setMatches] = useState<Match[]>(() => (id ? getMatchesForProblem(id) : []));
  const [activeFilter, setActiveFilter] = useState<'all' | 'shortlisted' | 'top_tier'>('all');
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h2 className="text-xl font-bold font-serif text-slate-900">
            Problem Statement Not Found
          </h2>
          <p className="text-xs text-slate-600">
            The requested statement was not found in the innovation registry.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-sky-600 text-white rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Department Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (matchId: string, newStatus: MatchStatus, startupName: string) => {
    await updateMatchStatus(matchId, newStatus);
    setMatches(prev =>
      prev.map(m => (m.id === matchId ? { ...m, status: newStatus } : m))
    );

    if (newStatus === 'shortlisted') {
      setActionNotice(`${startupName} has been shortlisted for pilot evaluation.`);
    } else if (newStatus === 'rejected') {
      setActionNotice(`${startupName} marked as passed.`);
    } else {
      setActionNotice(`Status updated for ${startupName}.`);
    }

    setTimeout(() => setActionNotice(null), 4000);
  };

  const toggleBreakdown = (matchId: string) => {
    setExpandedBreakdownId(expandedBreakdownId === matchId ? null : matchId);
  };

  const shortlistedCount = matches.filter(m => m.status === 'shortlisted' || m.status === 'invited_to_pilot').length;

  const filteredMatches = matches.filter(m => {
    if (activeFilter === 'shortlisted') {
      return m.status === 'shortlisted' || m.status === 'invited_to_pilot';
    }
    if (activeFilter === 'top_tier') {
      return (m.combined_score || 0) >= 80;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>{problem.department_name || 'Department Innovation Challenge'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            AI Startup Matches & Eligibility Breakdown
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Ranked candidate startups evaluated against your challenge requirements and procurement criteria.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/problem-statements/${problem.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            View RFP Statement
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
          >
            Dashboard &rarr;
          </Link>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Problem Statement Summary Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-mono text-slate-400">Target Challenge</span>
            <h2 className="text-base font-bold text-slate-900">{problem.title}</h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            {problem.budget_estimate && (
              <div className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Budget: <strong className="text-slate-900">{problem.budget_estimate}</strong></span>
              </div>
            )}
            {problem.target_timeline && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Timeline: <strong className="text-slate-900">{problem.target_timeline}</strong></span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 text-[11px] font-medium">Domain Tags:</span>
            {problem.category_tags.map(t => (
              <span key={t} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-600">
              Evaluated: <strong className="text-slate-900">{matches.length} Startups</strong>
            </span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold">
              Shortlisted: <strong>{shortlistedCount} Selected</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Governance Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-sky-950">
            Human-in-the-Loop Procurement Assurance
          </span>
          <p className="text-sky-800 leading-relaxed text-[11px]">
            The Polaris matching engine scans technical competency, TRL maturity, and prior public track record to recommend candidates.
            <strong> The AI never auto-approves contracts</strong> — department officials inspect the full eligibility breakdown and manually shortlist candidates.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Candidates ({matches.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('shortlisted')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeFilter === 'shortlisted'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Shortlisted ({shortlistedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('top_tier')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeFilter === 'top_tier'
                ? 'bg-indigo-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Top Fit (&gt;80%)
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Ranked by Relevance &amp; Vendor Procurement Readiness
        </span>
      </div>

      {/* Ranked Candidate Cards */}
      <div className="space-y-4">
        {filteredMatches.map((match, idx) => {
          const startup = match.startup;
          if (!startup) return null;

          const isExpanded = expandedBreakdownId === match.id;
          const isShortlisted = match.status === 'shortlisted' || match.status === 'invited_to_pilot';
          const isRejected = match.status === 'rejected';

          return (
            <div
              key={match.id}
              className={`bg-white rounded-xl border transition-all shadow-sm overflow-hidden ${
                isShortlisted
                  ? 'border-emerald-300 ring-1 ring-emerald-300'
                  : isRejected
                  ? 'border-slate-200 opacity-60'
                  : 'border-slate-200 hover:border-sky-300'
              }`}
            >
              {/* Main Candidate Card Body */}
              <div className="p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Identity & Rank */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold font-serif text-slate-900">
                          {startup.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                          {startup.sector}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                          {startup.product_maturity}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {startup.description}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                        {startup.website && (
                          <a
                            href={startup.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-600 hover:underline inline-flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            {startup.website.replace('https://', '')}
                          </a>
                        )}
                        <span>&bull;</span>
                        <span>{startup.references.length} verified pilot reference(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-right">
                      {/* Relevance Score */}
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-500">
                          Relevance
                        </span>
                        <span className="text-lg font-extrabold font-serif text-sky-700">
                          {match.relevance_score}%
                        </span>
                      </div>

                      <div className="h-6 w-px bg-slate-200"></div>

                      {/* Eligibility Score */}
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-500">
                          Eligibility
                        </span>
                        <span className="text-lg font-extrabold font-serif text-emerald-700">
                          {startup.eligibility_score}/100
                        </span>
                      </div>

                      <div className="h-6 w-px bg-slate-200"></div>

                      {/* Composite Rank */}
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-indigo-700">
                          Overall Fit
                        </span>
                        <span className="text-xl font-extrabold font-serif text-slate-900">
                          {match.combined_score}%
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full justify-end">
                      {isShortlisted ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Shortlisted
                          </span>
                          <button
                            onClick={() => handleStatusChange(match.id, 'new', startup.name)}
                            className="text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1"
                          >
                            Remove
                          </button>
                        </>
                      ) : isRejected ? (
                        <button
                          onClick={() => handleStatusChange(match.id, 'new', startup.name)}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 underline"
                        >
                          Undo Pass
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStatusChange(match.id, 'rejected', startup.name)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            Pass
                          </button>
                          <button
                            onClick={() => handleStatusChange(match.id, 'shortlisted', startup.name)}
                            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Shortlist for Pilot
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Match Explanation Callout */}
                <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-950 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-sky-900">AI Match Evaluation:</span>
                    <p className="text-sky-900/90 leading-relaxed text-[11px]">
                      {match.match_explanation}
                    </p>
                  </div>
                </div>

                {/* Toggle Visible Eligibility Breakdown */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleBreakdown(match.id)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>
                      {isExpanded ? 'Hide' : 'Inspect'} 4-Pillar Eligibility Breakdown
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isShortlisted && (
                    <Link
                      href={`/pilots/new?problem_id=${problem.id}&startup_id=${startup.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <span>Initiate Milestone Pilot Contract &rarr;</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Collapsible Detailed Eligibility Breakdown Component */}
              {isExpanded && (
                <div className="bg-slate-50 border-t border-slate-200 p-6 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Detailed Eligibility & Technical Audit Breakdown
                    </h4>
                    <span className="text-xs font-bold text-emerald-800">
                      Total Score: {startup.eligibility_score} / 100
                    </span>
                  </div>

                  {/* 4 Score Progress Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>Product Maturity</span>
                        <span className="text-slate-900">{match.eligibility_breakdown.product_maturity_score} / 25</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(match.eligibility_breakdown.product_maturity_score / 25) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 capitalize">Stage: {startup.product_maturity}</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>Technical Fit</span>
                        <span className="text-slate-900">{match.eligibility_breakdown.technical_fit_score} / 35</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(match.eligibility_breakdown.technical_fit_score / 35) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500">Domain & model scope</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>Past Public Pilots</span>
                        <span className="text-slate-900">{match.eligibility_breakdown.past_pilot_score} / 25</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${(match.eligibility_breakdown.past_pilot_score / 25) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500">{startup.references.length} verified trials</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>References & Team</span>
                        <span className="text-slate-900">{match.eligibility_breakdown.references_score} / 15</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(match.eligibility_breakdown.references_score / 15) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500">Leadership credentials</span>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-700">Auditor Notes:</span>
                    <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                      {match.eligibility_breakdown.notes.map((note, nIdx) => (
                        <li key={nIdx}>{note}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Prior Public References List */}
                  {startup.references.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700">Documented Prior References:</span>
                      <div className="flex flex-wrap gap-2">
                        {startup.references.map((ref, rIdx) => (
                          <span
                            key={rIdx}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md text-[11px] text-slate-800 shadow-2xs"
                          >
                            <FileCheck2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

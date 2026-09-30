'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProblemStatementById, updateProblemStatementStatus } from '@/lib/problem-statements-store';
import type { ProblemStatement } from '@/types/database';
import {
  Sparkles,
  Building2,
  ArrowLeft,
  ArrowRight,
  FileText,
  Clock,
  Coins,
  Tag,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function ProblemStatementDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const [statement, setStatement] = useState<ProblemStatement | null>(() => {
    return id ? getProblemStatementById(id) || null : null;
  });

  const handlePublish = () => {
    if (statement) {
      updateProblemStatementStatus(statement.id, 'published');
      setStatement({ ...statement, status: 'published' });
    }
  };

  if (!statement) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h2 className="text-xl font-bold font-serif text-slate-900">
            Problem Statement Not Found
          </h2>
          <p className="text-xs text-slate-600">
            The requested statement with ID &ldquo;{id}&rdquo; was not found in the innovation registry.
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>{statement.department_name || 'Department Innovation Challenge'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            {statement.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statement ID: <span className="font-mono text-slate-700">{statement.id}</span> &bull; Submitted {new Date(statement.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>

          <Link
            href={`/problem-statements/${statement.id}/matches`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-lg shadow transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Matched Startups &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Status & Highlights Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Procurement Status:</span>
          {statement.status === 'published' || statement.status === 'matching' ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Published & Open for Matches
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              Draft (Unpublished)
            </span>
          )}
        </div>

        <div className="flex items-center gap-6 text-slate-600">
          {statement.budget_estimate && (
            <div className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>Budget: <strong className="text-slate-900">{statement.budget_estimate}</strong></span>
            </div>
          )}
          {statement.target_timeline && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Timeline: <strong className="text-slate-900">{statement.target_timeline}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Raw Input Reference + Structured RFP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Original Raw Input (Archived) */}
        <div className="space-y-4">
          <div className="bg-slate-100 rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Original Raw Department Input</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic bg-white/80 p-3.5 rounded-lg border border-slate-200/80">
              &ldquo;{statement.raw_input}&rdquo;
            </p>
            <p className="text-[11px] text-slate-500 leading-normal">
              Stored alongside the structured RFP for public sector auditability and procurement compliance.
            </p>
          </div>

          {/* Category Tags */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>Domain & Technology Tags</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {statement.category_tags.map(t => (
                <span
                  key={t}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Structured Procurement RFP Statement */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Structured Innovation Statement
              </span>
              {statement.status === 'draft' && (
                <button
                  onClick={handlePublish}
                  className="text-xs font-semibold px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
                >
                  Publish Statement Now
                </button>
              )}
            </div>

            {/* Background */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Operational Background & Problem Formulation
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {statement.background}
              </p>
            </div>

            {/* Outcome */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Desired Technical Outcome & Solution Scope
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {statement.outcome}
              </p>
            </div>

            {/* Success Metrics */}
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Auditable Success Metrics & SLA Benchmarks ({statement.metrics.length})
              </h3>

              <div className="space-y-2">
                {statement.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps CTA */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Ready to review eligible startup submissions?
              </span>
              <Link
                href={`/problem-statements/${statement.id}/matches`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
              >
                <span>View Matched Startups</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { getAllPilots } from '@/lib/pilots-store';
import { getAllCertifiedSolutions, getAllValidationReports } from '@/lib/solutions-store';
import {
  Scale,
  ShieldCheck,
  FileCheck,
  Award,
  Clock,
  Building2,
  Rocket,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function ValidationPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'certified' | 'standards'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const pilots = useMemo(() => getAllPilots(), []);
  const certifiedSolutions = useMemo(() => getAllCertifiedSolutions(), []);
  const validationReports = useMemo(() => getAllValidationReports(), []);

  // Filter pilots ready for audit (all milestones cleared or status completed)
  const auditReadyPilots = useMemo(() => {
    return pilots.filter(p => {
      const milestones = p.milestones || [];
      const clearedCount = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length;
      return p.status === 'completed' || (milestones.length > 0 && clearedCount >= 2);
    });
  }, [pilots]);

  const filteredCertified = useMemo(() => {
    if (!searchQuery.trim()) return certifiedSolutions;
    const q = searchQuery.toLowerCase();
    return certifiedSolutions.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.vendor_name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q)
    );
  }, [certifiedSolutions, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4 text-purple-600" />
            <span>Independent Testing & Quality Certification Agency</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            Validator Portal & Scale-Up Certification
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Accredited auditing console for independent assessment of completed GovTech sandboxes. Certified innovations receive official seals and are published to the National Solutions Library.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-purple-900 bg-purple-100 border border-purple-300 px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>Accredited Auditor: {user?.role === 'validator' ? user.org_or_department : 'Quality Council of India (QCI)'}</span>
          </span>
        </div>
      </div>

      {/* Validation Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pilots Ready for Audit</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {auditReadyPilots.length}
          </div>
          <p className="text-[11px] text-amber-700 font-medium">Completed sandbox milestones</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Solutions Certified</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-700">
            {certifiedSolutions.length}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">Published in National Library</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg. Readiness Score</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            9.3 <span className="text-sm font-sans text-slate-500">/ 10</span>
          </div>
          <p className="text-[11px] text-purple-700 font-medium">Scale-up threshold &gt;= 9.0</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">State Replications</span>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            9 Circles
          </div>
          <p className="text-[11px] text-sky-700 font-medium">Direct procurement adoptions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'border-purple-600 text-purple-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pilots Awaiting Independent Audit ({auditReadyPilots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certified')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'certified'
              ? 'border-purple-600 text-purple-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certified & Published Solutions ({certifiedSolutions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('standards')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'standards'
              ? 'border-purple-600 text-purple-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Audit Standards & Evaluation Framework</span>
        </button>
      </div>

      {/* TAB 1: PILOTS AWAITING INDEPENDENT AUDIT */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold font-serif text-slate-900">
                Completed Sandbox Pilots Ready for Independent Validation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect milestone deliverables, verify telemetry accuracy, and determine whether solutions meet criteria for national scale-up.
              </p>
            </div>
            <span className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md font-semibold border border-purple-200 self-start sm:self-auto">
              {auditReadyPilots.length} Sandboxes Eligible
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditReadyPilots.map((p) => {
              const milestones = p.milestones || [];
              const clearedCount = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length;
              const hasReport = validationReports.some(r => r.pilot_id === p.id);

              return (
                <div
                  key={p.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {p.id.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        Audit Ready
                      </span>
                      <span className="text-xs text-slate-500">
                        Timeline: {p.timeline}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 font-serif">
                      {p.problem_statement?.title || 'GovTech Pilot Sandbox'}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {p.scope}
                    </p>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-sky-600" />
                        Buyer: <strong className="text-slate-800">{p.problem_statement?.department_name || 'Ministry of Electronics & IT'}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Rocket className="w-3.5 h-3.5 text-indigo-600" />
                        Vendor: <strong className="text-slate-800">{p.startup?.name}</strong> ({p.startup?.sector})
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">
                        {clearedCount} of {milestones.length} Sprints Approved
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/validation/${p.id}`}
                      className="px-4 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow transition-all flex items-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{hasReport ? 'Re-inspect Audit' : 'Start Validation Audit'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CERTIFIED & PUBLISHED SOLUTIONS */}
      {activeTab === 'certified' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search certified solutions..."
                className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <Link
              href="/solutions"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline shrink-0"
            >
              <span>Explore Public Solutions Library</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCertified.map((sol) => (
              <div
                key={sol.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                      {sol.sector}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {sol.scale_up_readiness_score} / 10 Readiness
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-serif text-slate-900">
                    {sol.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {sol.tagline}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div>
                      Vendor: <strong className="text-slate-900">{sol.vendor_name}</strong> &bull; {sol.product_maturity}
                    </div>
                    <div>
                      Auditor: <span className="font-semibold text-purple-900">{sol.validator_name}</span> &bull; {sol.validation_date}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {sol.adoption_count} department replications
                  </span>
                  <Link
                    href={`/solutions#${sol.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900"
                  >
                    <span>View Public Certificate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STANDARDS & AUDIT FRAMEWORK */}
      {activeTab === 'standards' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold font-serif text-slate-900">
              GovTech Validation & Quality Certification Standards
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Guidelines conforming to General Financial Rules (GFR 2017) Rule 149 and Ministry of Finance innovation directives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                1. Technical Performance (40%)
              </span>
              <p className="text-slate-600 leading-relaxed">
                Verification that pilot deliverables meet or exceed quantitative performance metrics specified in the original challenge statement (e.g. latency, throughput, error rates, model accuracy).
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                2. Security & Compliance (30%)
              </span>
              <p className="text-slate-600 leading-relaxed">
                CERT-In aligned cybersecurity assessment, data localization, zero unencrypted telemetry, and compliance with the Digital Personal Data Protection (DPDP) Act.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                3. Interoperability & Scalability (30%)
              </span>
              <p className="text-slate-600 leading-relaxed">
                Open API architectures, containerized infrastructure, compatibility with state data centers (SDCs) and national digital public infrastructure (India Stack).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

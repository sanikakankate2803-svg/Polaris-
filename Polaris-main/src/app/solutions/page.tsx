'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { getAllCertifiedSolutions, recordSolutionAdoption, type CertifiedSolution } from '@/lib/solutions-store';
import {
  Award,
  ShieldCheck,
  Building2,
  Rocket,
  CheckCircle2,
  Search,
  Download,
  FileCheck,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Filter,
  ArrowRight,
  X,
} from 'lucide-react';

export default function SolutionsLibraryPage() {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<CertifiedSolution[]>(() => getAllCertifiedSolutions());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [expandedSolutionId, setExpandedSolutionId] = useState<string | null>(null);

  // Adoption modal state
  const [adoptingSolution, setAdoptingSolution] = useState<CertifiedSolution | null>(null);
  const [departmentName, setDepartmentName] = useState(user?.org_or_department || 'State Smart City Mission');
  const [deploymentScope, setDeploymentScope] = useState('Immediate replication deployment across municipal wards under fast-track innovation directives.');
  const [isAdopting, setIsAdopting] = useState(false);
  const [adoptionSuccessMessage, setAdoptionSuccessMessage] = useState<string | null>(null);

  // Filtered solutions
  const filteredSolutions = useMemo(() => {
    return solutions.filter(s => {
      if (selectedSector !== 'all' && !s.sector.toLowerCase().includes(selectedSector.toLowerCase())) {
        return false;
      }
      if (minScore > 0 && s.scale_up_readiness_score < minScore) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesVendor = s.vendor_name.toLowerCase().includes(q);
        const matchesDept = s.originating_department.toLowerCase().includes(q);
        const matchesTags = s.tags.some(t => t.toLowerCase().includes(q));
        const matchesSector = s.sector.toLowerCase().includes(q);
        return matchesTitle || matchesVendor || matchesDept || matchesTags || matchesSector;
      }
      return true;
    });
  }, [solutions, selectedSector, minScore, searchQuery]);

  // Handle direct procurement adoption
  const handleExecuteAdoption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adoptingSolution) return;

    setIsAdopting(true);
    const success = recordSolutionAdoption(adoptingSolution.id);
    setIsAdopting(false);

    if (success) {
      // Update local state
      setSolutions(prev =>
        prev.map(s => (s.id === adoptingSolution.id ? { ...s, adoption_count: s.adoption_count + 1 } : s))
      );
      const title = adoptingSolution.title;
      setAdoptingSolution(null);
      setAdoptionSuccessMessage(`Fast-track adoption requisition initiated for "${title}" on behalf of ${departmentName}!`);
      setTimeout(() => setAdoptionSuccessMessage(null), 6000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>National Scale-Up Innovation Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            GovTech Certified Solutions Library
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Public catalog of pre-validated, independently audited GovTech solutions that successfully cleared sandbox pilots. Government entities across India can replicate and procure these proven technologies directly under fast-track provisions without running redundant exploratory RFPs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>GFR Rule 149 Compliant</span>
          </span>
        </div>
      </div>

      {/* Adoption Success Notification */}
      {adoptionSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs text-emerald-900 flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{adoptionSuccessMessage}</span>
        </div>
      )}

      {/* GFR Policy Assurance Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Fast-Track Public Procurement Framework
          </div>
          <h2 className="text-lg font-bold text-white">
            Pre-Tested & Verified: Ready for Immediate Department Replication
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every solution listed below has successfully completed a live municipal sandbox pilot with verified SLAs, zero security vulnerabilities, and formal certification by accredited testing authorities (QCI, STQC, CRRI).
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0 text-right">
          <div>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
              {solutions.length}
            </span>
            <span className="text-xs text-slate-300 block">Certified Innovations</span>
          </div>
          <div className="text-[11px] text-sky-200">
            Avg. Readiness: <strong>9.3 / 10</strong>
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by solution, vendor, or sector..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline flex items-center gap-1">
            <Filter className="w-3 h-3" /> Sector:
          </span>
          <button
            onClick={() => setSelectedSector('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSector === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Sectors ({solutions.length})
          </button>
          <button
            onClick={() => setSelectedSector('Mobility')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSector === 'Mobility'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Smart Mobility
          </button>
          <button
            onClick={() => setSelectedSector('Water')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSector === 'Water'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Water & Utilities
          </button>
          <button
            onClick={() => setSelectedSector('Land')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSector === 'Land'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Civic AI & Land
          </button>

          <span className="text-slate-300 mx-1 hidden sm:inline">|</span>

          {/* Rating filter */}
          <button
            onClick={() => setMinScore(minScore === 9.2 ? 0 : 9.2)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
              minScore === 9.2
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3 h-3" />
            Top Tier (&gt;=9.2)
          </button>
        </div>
      </div>

      {/* Solutions Cards Grid */}
      <div className="space-y-6">
        {filteredSolutions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Certified Solutions Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No solutions match the selected search keywords or sector filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('all');
                setMinScore(0);
              }}
              className="text-xs font-semibold text-emerald-600 hover:underline pt-1"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredSolutions.map((sol) => {
            const isExpanded = expandedSolutionId === sol.id;

            return (
              <div
                key={sol.id}
                id={sol.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all overflow-hidden p-6 sm:p-8 space-y-6"
              >
                {/* Top Strip: Sector Tag & Scale-Up Rating Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {sol.sector}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-500">
                      Product Maturity: <strong className="text-slate-800">{sol.product_maturity}</strong>
                    </span>
                  </div>

                  {/* Certified Readiness Rating */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-sm">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Scale-Up Readiness:</span>
                      <span className="font-mono text-emerald-950 font-extrabold text-sm">
                        {sol.scale_up_readiness_score} / 10
                      </span>
                    </div>
                  </div>
                </div>

                {/* Solution Title & Tagline */}
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                    {sol.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {sol.tagline}
                  </p>
                </div>

                {/* Proven Sandbox Metadata Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-sky-600" />
                      Originating Department
                    </span>
                    <span className="font-bold text-slate-900 block truncate">
                      {sol.originating_department}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Rocket className="w-3.5 h-3.5 text-indigo-600" />
                      Certified Startup Vendor
                    </span>
                    <span className="font-bold text-slate-900 block truncate">
                      {sol.vendor_name}
                      {sol.vendor_website && (
                        <a
                          href={sol.vendor_website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 ml-1.5 text-[11px] font-normal"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      Accredited Testing Authority
                    </span>
                    <span className="font-bold text-purple-900 block truncate">
                      {sol.validator_name} ({sol.validation_date})
                    </span>
                  </div>
                </div>

                {/* Verified Performance Metrics Achieved */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Verified Benchmark Metrics & Impact:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sol.metrics_achieved.map((metric, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/80 text-xs text-slate-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium leading-relaxed">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {sol.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      {t}
                    </span>
                  ))}
                </div>

                {/* Expandable Technical Audit Summary */}
                {isExpanded && (
                  <div className="p-5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3 text-xs animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-purple-600" />
                        Accredited Auditor Findings & Recommendation Brief
                      </span>
                      <span className="text-[11px] text-purple-700 font-mono">
                        Audit ID: QCI-GOVTECH-2026-CERT
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed bg-white p-4 rounded-lg border border-purple-100">
                      {sol.audit_summary}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-purple-800 pt-1">
                      <span>Tested in sandbox budget: ₹{sol.pilot_budget.toLocaleString('en-IN')}</span>
                      <span>Verified compliant with GFR 149 sandbox directives</span>
                    </div>
                  </div>
                )}

                {/* Action Strip */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedSolutionId(isExpanded ? null : sol.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <span>Hide Audit Brief</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Inspect Audit Brief</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <span className="text-slate-300">•</span>

                    <span className="text-xs text-slate-500 font-medium">
                      <strong>{sol.adoption_count}</strong> Department Replications
                    </span>
                  </div>

                  {/* Direct Procurement CTA */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        alert(`Downloading cryptographically verified certificate for ${sol.title} (Issued by ${sol.validator_name}).`);
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                      title="Download Certificate"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Certificate PDF</span>
                    </button>

                    <button
                      onClick={() => setAdoptingSolution(sol)}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Direct Procurement Requisition</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADOPTION / DIRECT PROCUREMENT MODAL */}
      {adoptingSolution && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-scale-in">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                  Fast-Track Procurement Sandbox
                </span>
                <h3 className="text-lg font-bold font-serif text-slate-900 mt-0.5">
                  Direct Innovation Procurement Requisition
                </h3>
              </div>
              <button
                onClick={() => setAdoptingSolution(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-1 text-xs">
              <div className="font-bold text-emerald-950">{adoptingSolution.title}</div>
              <div className="text-emerald-800">
                Vendor: <strong>{adoptingSolution.vendor_name}</strong> &bull; Validated by: {adoptingSolution.validator_name} (Score: {adoptingSolution.scale_up_readiness_score}/10)
              </div>
            </div>

            <form onSubmit={handleExecuteAdoption} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                  Procuring Department / Municipal Authority *
                </label>
                <input
                  type="text"
                  required
                  value={departmentName}
                  onChange={e => setDepartmentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                  Deployment Scope & Operational Objectives *
                </label>
                <textarea
                  rows={3}
                  required
                  value={deploymentScope}
                  onChange={e => setDeploymentScope(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-tight">
                <strong>GFR Exemption Clause:</strong> Because this solution has already completed formal sandbox verification under QCI accreditation, this requisition proceeds directly to contract drafting without exploratory RFP cycles.
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdoptingSolution(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdopting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>{isAdopting ? 'Executing...' : 'Execute Fast-Track Requisition'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

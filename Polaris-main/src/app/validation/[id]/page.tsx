'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getPilotById } from '@/lib/pilots-store';
import { submitValidationAudit, getValidationReportByPilotId } from '@/lib/solutions-store';
import type { ValidationDecision, ValidationReport } from '@/types/database';
import {
  Scale,
  Building2,
  Rocket,
  ArrowLeft,
  AlertTriangle,
  FileCheck,
  Award,
  Sparkles,
  Download,
  Coins,
  XCircle,
} from 'lucide-react';

export default function PilotValidationAuditPage() {
  const params = useParams();
  const pilotId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const { user } = useAuth();

  const pilot = useMemo(() => getPilotById(pilotId), [pilotId]);
  const existingReport = useMemo(() => getValidationReportByPilotId(pilotId), [pilotId]);

  // Form state
  const [metricsAchieved, setMetricsAchieved] = useState(true);
  const [securityAuditPassed, setSecurityAuditPassed] = useState(true);
  const [interoperabilityVerified, setInteroperabilityVerified] = useState(true);
  const [scaleUpScore, setScaleUpScore] = useState(9.4);
  const [findings, setFindings] = useState(
    pilot
      ? `Third-party technical verification completed for ${pilot.problem_statement?.title || 'Fast-Track Pilot'}. All milestone deliverables were independently benchmarked. Operational telemetry confirmed >= 98% system availability and latency within acceptable SLA bounds. Recommended for national scale-up replication under GFR fast-track guidelines.`
      : 'Comprehensive third-party audit completed. Pilot meets all agreed performance specifications and is ready for public procurement replication.'
  );
  const [validatorOrg, setValidatorOrg] = useState(user?.org_or_department || 'Quality Council of India (QCI)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<ValidationReport | null>(existingReport || null);

  // 1-Click Quick Fill Presets for Validator testing
  const presets = [
    {
      label: 'QCI Full Scale-Up Pass (9.5/10)',
      score: 9.5,
      metrics: true,
      sec: true,
      interop: true,
      findings:
        'Comprehensive 90-day sandbox trial audited across live field telemetry. Zero SLA violations detected. System demonstrated 98.4% accuracy under real-world municipal operating conditions. Recommended for immediate state-wide procurement replication.',
    },
    {
      label: 'STQC Standard Certification (9.1/10)',
      score: 9.1,
      metrics: true,
      sec: true,
      interop: true,
      findings:
        'Security, telemetry encryption, and data sovereignty compliance verified under CERT-In guidelines. Core predictive algorithms achieved target KPI thresholds with acceptable false-positive margins. Certified for municipal adoption.',
    },
  ];

  const handleAuditSubmit = async (decision: ValidationDecision) => {
    if (!findings.trim()) {
      alert('Please enter auditor evaluation findings.');
      return;
    }

    setIsSubmitting(true);
    const reportId = `vr-${Date.now()}`;
    const report: ValidationReport = {
      id: reportId,
      pilot_id: pilotId,
      validator_id: user?.id || 'validator-qci-01',
      validator_name: `${user?.name || 'Lead Technical Auditor'} (${validatorOrg})`,
      findings: findings.trim(),
      metrics_achieved: metricsAchieved,
      scale_up_readiness_score: decision === 'approve' ? scaleUpScore : Math.min(scaleUpScore, 6.5),
      decision,
      created_at: new Date().toISOString(),
    };

    const res = await submitValidationAudit(report, {
      title: pilot?.problem_statement?.title,
      tagline: pilot?.scope,
      sector: pilot?.startup?.sector,
      vendor_name: pilot?.startup?.name,
      originating_department: pilot?.problem_statement?.department_name,
      pilot_budget: pilot?.budget,
      scale_up_readiness_score: scaleUpScore,
      validator_name: validatorOrg,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmittedReport(report);
    }
  };

  if (!pilot) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-serif text-slate-900">
          Pilot Not Found for Validation
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The requested pilot ({pilotId}) could not be located in the active registry.
        </p>
        <Link
          href="/validation"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Validator Portal
        </Link>
      </div>
    );
  }

  const milestones = pilot.milestones || [];
  const approvedMilestones = milestones.filter(m => m.status === 'approved' || m.status === 'paid');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4 text-purple-600" />
            <span>Independent Third-Party Validation & Certification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            Pilot Audit & Scale-Up Certification
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Auditing Sandbox Pilot: <strong className="text-slate-900 font-mono">#{pilot.id.toUpperCase()}</strong> &bull; Agency: <span className="font-semibold text-purple-900">{validatorOrg}</span>
          </p>
        </div>

        <Link
          href="/validation"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Validator Hub
        </Link>
      </div>

      {/* SUCCESS BANNER: CERTIFIED & PUBLISHED TO PUBLIC LIBRARY */}
      {submittedReport && submittedReport.decision === 'approve' && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-emerald-500/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-700/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block">
                  Official Public Procurement Seal
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-white">
                  Certified for National Scale-Up & Direct Procurement
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-300 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-700">
                {submittedReport.scale_up_readiness_score} / 10
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-emerald-100">
            <div>
              <span className="text-[10px] uppercase text-emerald-300 font-semibold block">Accredited Auditor</span>
              <span className="font-bold text-white text-sm">{submittedReport.validator_name}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-emerald-300 font-semibold block">Certified Date</span>
              <span className="font-bold text-white text-sm">
                {new Date(submittedReport.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-emerald-300 font-semibold block">Public Status</span>
              <span className="font-bold text-white text-sm">Published in Solutions Library</span>
            </div>
          </div>

          <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-700/60 text-xs text-emerald-100 leading-relaxed">
            <span className="font-bold text-emerald-300 block mb-1">Official Scale-Up Recommendation:</span>
            {submittedReport.findings}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-emerald-300">
              Other departments can now replicate and procure this solution under fast-track provisions.
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/solutions"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                View in Public Solutions Library &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pilot Overview & Deliverables Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pilot Under Verification
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              {approvedMilestones.length} of {milestones.length} Milestones Cleared
            </span>
          </div>
          <h2 className="text-lg font-bold font-serif text-slate-900 mt-1">
            {pilot.problem_statement?.title || 'Fast-Track Pilot Project'}
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {pilot.scope}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              Procuring Department
            </span>
            <span className="font-bold text-slate-900 block">
              {pilot.problem_statement?.department_name || 'Ministry of Electronics & IT'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Rocket className="w-3.5 h-3.5 text-indigo-600" />
              Technology Vendor
            </span>
            <span className="font-bold text-slate-900 block">
              {pilot.startup?.name || 'AeroVision Systems'} &bull; {pilot.startup?.sector}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              Total Pilot Budget
            </span>
            <span className="font-bold text-slate-900 block font-mono">
              ₹{(pilot.budget || 0).toLocaleString('en-IN')} &bull; {pilot.timeline}
            </span>
          </div>
        </div>

        {/* Milestone Deliverables Submitted */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Submitted Milestone Deliverables Inspected:
          </span>
          <div className="space-y-2">
            {milestones.map(m => (
              <div
                key={m.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      Sprint {m.milestone_number}: {m.title}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                        m.status === 'approved' || m.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {m.status === 'approved' || m.status === 'paid' ? 'Approved & Paid' : m.status}
                    </span>
                  </div>
                  {m.deliverable_filename ? (
                    <span className="text-slate-500 text-[11px] font-mono flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-indigo-600" />
                      Attachment: {m.deliverable_filename}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Sprint in execution</span>
                  )}
                </div>

                {m.deliverable_url && (
                  <a
                    href={m.deliverable_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-sm shrink-0"
                  >
                    <Download className="w-3 h-3" />
                    Inspect Deliverable
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Audit Evaluation Form */}
      {(!submittedReport || submittedReport.decision !== 'approve') && (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAuditSubmit('approve');
          }}
          className="bg-white rounded-xl border border-purple-200 shadow-sm p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
                <FileCheck className="w-4 h-4" />
                <span>Auditor Evaluation Criteria</span>
              </div>
              <h3 className="text-lg font-bold font-serif text-slate-900 mt-0.5">
                Technical Audit & Scale-Up Readiness Verification
              </h3>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-purple-700 font-semibold">Test Presets:</span>
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setScaleUpScore(preset.score);
                    setMetricsAchieved(preset.metrics);
                    setSecurityAuditPassed(preset.sec);
                    setInteroperabilityVerified(preset.interop);
                    setFindings(preset.findings);
                  }}
                  className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-medium transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Checklist Item 1 */}
            <label className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={metricsAchieved}
                onChange={e => setMetricsAchieved(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded mt-0.5 focus:ring-purple-500"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  KPI Benchmarks Achieved *
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Accuracy, latency, and throughput met agreed tender SLAs under live loads.
                </p>
              </div>
            </label>

            {/* Checklist Item 2 */}
            <label className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={securityAuditPassed}
                onChange={e => setSecurityAuditPassed(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded mt-0.5 focus:ring-purple-500"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  Cybersecurity & Data Privacy *
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Encryption in transit/rest verified. No unauthorized data leakage detected.
                </p>
              </div>
            </label>

            {/* Checklist Item 3 */}
            <label className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={interoperabilityVerified}
                onChange={e => setInteroperabilityVerified(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded mt-0.5 focus:ring-purple-500"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  Interoperability & APIs *
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Open API compliance confirmed. Can integrate with state SCADA and NIC portals.
                </p>
              </div>
            </label>
          </div>

          {/* Scale-Up Readiness Score Slider */}
          <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-purple-900 block">
                  Scale-Up Readiness Score (1.0 – 10.0) *
                </label>
                <span className="text-[11px] text-purple-700">
                  Scores &gt;= 9.0 automatically qualify for national scale-up certification.
                </span>
              </div>

              <span className="text-2xl font-bold font-mono text-purple-950 bg-white px-3 py-1 rounded-lg border border-purple-300">
                {scaleUpScore} / 10
              </span>
            </div>

            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.1"
              value={scaleUpScore}
              onChange={e => setScaleUpScore(parseFloat(e.target.value))}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
            />

            <div className="flex items-center justify-between text-[11px] font-semibold text-purple-800">
              <span>1.0: Exploratory Concept</span>
              <span>7.0: Conditional Maturity</span>
              <span className="text-emerald-700 font-bold">9.0+: Certified for Direct Scale-Up</span>
            </div>
          </div>

          {/* Technical Evaluation Findings Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
              Field Auditor Technical Findings & Recommendation *
            </label>
            <textarea
              rows={4}
              required
              value={findings}
              onChange={e => setFindings(e.target.value)}
              placeholder="Detail SLA benchmark verification results, field telemetry observations, and replication readiness..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 leading-relaxed bg-white"
            />
          </div>

          {/* Accredited Agency Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
              Accredited Auditing Body / Validator Agency
            </label>
            <input
              type="text"
              required
              value={validatorOrg}
              onChange={e => setValidatorOrg(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAuditSubmit('request_data')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Request Additional Telemetry Data
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAuditSubmit('reject')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject Certification
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300"
              >
                <Award className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'Certifying Solution...' : 'Approve & Certify for Public Solutions Library'}
                </span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

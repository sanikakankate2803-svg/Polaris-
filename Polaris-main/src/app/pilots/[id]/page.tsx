'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getPilotById, submitMilestoneDeliverable, reviewMilestone } from '@/lib/pilots-store';
import type { Pilot } from '@/types/database';
import {
  ShieldCheck,
  Building2,
  Rocket,
  ArrowLeft,
  Coins,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Download,
  AlertTriangle,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  XCircle,
  Sparkles,
} from 'lucide-react';

export default function PilotDetailPage() {
  const params = useParams();
  const pilotId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const { user, switchDemoRole } = useAuth();

  const [pilot, setPilot] = useState<Pilot | undefined>(() => getPilotById(pilotId));
  const [activeTab, setActiveTab] = useState<'milestones' | 'scope' | 'escrow'>('milestones');
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  // Deliverable submission form state (for startups)
  const [submittingMilestoneId, setSubmittingMilestoneId] = useState<string | null>(null);
  const [deliverableFile, setDeliverableFile] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [isSubmittingDeliverable, setIsSubmittingDeliverable] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Official review state (for department officials)
  const [reviewingMilestoneId, setReviewingMilestoneId] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Refresh pilot data from store
  const refreshPilot = () => {
    const updated = getPilotById(pilotId);
    setPilot(updated);
  };

  if (!pilot) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-serif text-slate-900">
          Pilot Contract Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The requested pilot contract ({pilotId}) could not be located in the local registry or Supabase storage.
        </p>
        <Link
          href="/pilots"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Pilots Directory
        </Link>
      </div>
    );
  }

  // Calculate financial totals
  const totalBudget = pilot.budget || 0;
  const milestones = pilot.milestones || [];
  const disbursedAmount = milestones
    .filter(m => m.payment_status === 'paid')
    .reduce((sum, m) => sum + (m.payment_amount || 0), 0);
  const escrowedAmount = milestones
    .filter(m => m.payment_status === 'escrowed')
    .reduce((sum, m) => sum + (m.payment_amount || 0), 0);
  const approvedMilestonesCount = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length;
  const isPilotCompleted = pilot.status === 'completed' || (milestones.length > 0 && approvedMilestonesCount === milestones.length);

  // Quick fill presets for deliverable submission
  const quickFillDeliverables = [
    {
      filename: `${pilot.startup?.name?.replace(/\s+/g, '_') || 'Vendor'}_Validation_Report_v1.0.pdf`,
      notes: 'Automated test suite completed. All target KPI thresholds met under simulated municipal traffic loads.',
      url: 'https://polaris.gov/storage/deliverables/Report_v1.pdf',
    },
    {
      filename: 'Field_Sensor_Calibration_Telemetry_Log.xlsx',
      notes: 'Telemetry logs from all IoT nodes verified across 7 consecutive operational days. Zero packet drops.',
      url: 'https://polaris.gov/storage/deliverables/Telemetry_Log.xlsx',
    },
    {
      filename: 'QCI_Compliant_Pilot_Verification_Bundle.zip',
      notes: 'Comprehensive source bundle, latency benchmarks, raw sensor telemetry, and third-party audit reports.',
      url: 'https://polaris.gov/storage/deliverables/Verification_Bundle.zip',
    },
  ];

  // Handler for startup deliverable submission
  const handleDeliverableSubmit = async (milestoneId: string) => {
    if (!deliverableFile.trim() || !submissionNotes.trim()) {
      alert('Please enter a deliverable file name and submission notes.');
      return;
    }

    setIsSubmittingDeliverable(true);
    const success = await submitMilestoneDeliverable(pilot.id, milestoneId, {
      deliverableFilename: deliverableFile.trim(),
      submissionNotes: submissionNotes.trim(),
      deliverableUrl: deliverableUrl.trim() || `https://polaris.gov/storage/deliverables/${deliverableFile.trim()}`,
    });

    setIsSubmittingDeliverable(false);
    if (success) {
      setSubmittingMilestoneId(null);
      setDeliverableFile('');
      setSubmissionNotes('');
      setDeliverableUrl('');
      setSubmissionSuccess(`Deliverable submitted successfully! Department official has been notified for review.`);
      refreshPilot();
      setTimeout(() => setSubmissionSuccess(null), 5000);
    }
  };

  // Handler for department official review (approve or request revision)
  const handleReviewSubmit = async (milestoneId: string, action: 'approve' | 'reject') => {
    setIsReviewing(true);
    const feedback = reviewFeedback.trim() || (action === 'approve' ? 'Approved by department procurement committee. Escrow payment released.' : 'Revisions requested. Please review notes and resubmit.');

    const success = await reviewMilestone(pilot.id, milestoneId, action, feedback);
    setIsReviewing(false);

    if (success) {
      setReviewingMilestoneId(null);
      setReviewFeedback('');
      setActionMessage(
        action === 'approve'
          ? 'Milestone approved! Escrow payment released to startup.'
          : 'Revisions requested. Startup has been notified.'
      );
      refreshPilot();
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Role Context & Interactive Switching Helper */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            Viewing as <strong className="text-white capitalize">{user?.role?.replace('_', ' ')}</strong> ({user?.name})
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 hidden md:inline">
            Mutual workspace with role-gated deliverable submission and escrow release
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Switch perspective:</span>
          <button
            onClick={() => switchDemoRole('department')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              user?.role === 'department_official'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Dept Official
          </button>
          <button
            onClick={() => switchDemoRole('startup')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              user?.role === 'startup'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Startup Founder
          </button>
          <button
            onClick={() => switchDemoRole('validator')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              user?.role === 'validator'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Validator
          </button>
        </div>
      </div>

      {/* Action and Alert Notifications */}
      {submissionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{submissionSuccess}</span>
        </div>
      )}

      {actionMessage && (
        <div className="bg-sky-50 border border-sky-300 rounded-xl p-4 text-xs text-sky-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>GovTech Pilot Sandbox • Contract #{pilot.id.toUpperCase()}</span>
            <span className="text-slate-300">•</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isPilotCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-sky-100 text-sky-800 border border-sky-300'
              }`}
            >
              {isPilotCompleted ? 'Completed' : pilot.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            {pilot.problem_statement?.title || 'Fast-Track Innovation Pilot'}
          </h1>
          <div className="text-xs text-slate-600 mt-1 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Activated: {new Date(pilot.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Timeline: {pilot.timeline}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-800">
              {approvedMilestonesCount} of {milestones.length} Milestones Cleared
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/pilots"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Pilots
          </Link>
          {pilot.problem_statement_id && (
            <Link
              href={`/problem-statements/${pilot.problem_statement_id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              View Challenge
            </Link>
          )}
        </div>
      </div>

      {/* Completion Banner if all milestones are approved */}
      {isPilotCompleted && (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-xl p-6 shadow-sm border border-emerald-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              100% Milestones Successfully Completed
            </div>
            <h3 className="text-lg font-bold">
              Pilot Ready for Independent Third-Party Validation
            </h3>
            <p className="text-xs text-emerald-100 max-w-2xl">
              All agreed milestones have been delivered and approved. Total escrow contract of ₹{totalBudget.toLocaleString('en-IN')} has been disbursed. Submit this pilot for scale-up certification.
            </p>
          </div>
          <Link
            href={`/validation/${pilot.id}`}
            className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors shrink-0 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Launch Validation Audit &rarr;
          </Link>
        </div>
      )}

      {/* Contract Parties & Escrow Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Procuring Department Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Procuring Department</span>
            </div>
            <span className="text-[10px] bg-sky-50 text-sky-700 font-semibold px-2 py-0.5 rounded border border-sky-200">
              Verified Buyer
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              {pilot.problem_statement?.department_name || 'Ministry of Electronics & Information Technology'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Contact Official: {user?.role === 'department_official' ? user.name : 'Director of Digital Initiatives'}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Disbursement Sign-Off:</span>
            <span className="font-semibold text-slate-900">Required per milestone</span>
          </div>
        </div>

        {/* Technology Partner Startup Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <Rocket className="w-4 h-4 text-indigo-600" />
              <span>Technology Partner</span>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
              Vetted Vendor
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              {pilot.startup?.name || 'GovTech Innovation Partner'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Sector: {pilot.startup?.sector || 'Smart Governance & AI'} &bull; TRL: {pilot.startup?.product_maturity?.toUpperCase() || 'DEPLOYED'}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Eligibility Rating:</span>
            <span className="font-semibold text-emerald-700">{pilot.startup?.eligibility_score || 92}/100</span>
          </div>
        </div>

        {/* Escrow Status Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Escrow Financial Ledger</span>
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
              Secured Escrow
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Contract</span>
              <div className="text-base font-bold text-slate-900">₹{totalBudget.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-emerald-700 uppercase">Released</span>
              <div className="text-base font-bold text-emerald-700">₹{disbursedAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">In Escrow Hold:</span>
            <span className="font-bold text-amber-700">₹{escrowedAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('milestones')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'milestones'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Milestones & Deliverables ({milestones.length})
        </button>
        <button
          onClick={() => setActiveTab('scope')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'scope'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Contract Scope & Legal Terms
        </button>
        <button
          onClick={() => setActiveTab('escrow')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'escrow'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Escrow Audit Trail
        </button>
      </div>

      {/* TAB 1: MILESTONES & DELIVERABLES */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          {/* Milestone Progress Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">
                Milestone Clearance Progress: {approvedMilestonesCount} of {milestones.length} Sprints Approved
              </span>
              <span className="text-emerald-700 font-bold">
                {milestones.length > 0 ? Math.round((approvedMilestonesCount / milestones.length) * 100) : 0}% Complete
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              {milestones.map((m, idx) => {
                const isApproved = m.status === 'approved' || m.status === 'paid';
                const isSubmitted = m.status === 'submitted';
                const isInProgress = m.status === 'in_progress';
                return (
                  <div
                    key={idx}
                    className={`h-full transition-all border-r border-white/40 last:border-0 ${
                      isApproved
                        ? 'bg-emerald-500'
                        : isSubmitted
                        ? 'bg-amber-400'
                        : isInProgress
                        ? 'bg-sky-400 animate-pulse'
                        : 'bg-slate-200'
                    }`}
                    style={{ width: `${100 / milestones.length}%` }}
                    title={`Milestone ${m.milestone_number}: ${m.title} (${m.status})`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Approved & Paid
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                Submitted (Under Review)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
                In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block"></span>
                Scheduled
              </span>
            </div>
          </div>

          {/* Milestone List Cards */}
          <div className="space-y-4">
            {milestones.map((milestone) => {
              const isApproved = milestone.status === 'approved' || milestone.status === 'paid';
              const isSubmitted = milestone.status === 'submitted';
              const isInProgress = milestone.status === 'in_progress';
              const isSubmittingFormOpen = submittingMilestoneId === milestone.id;
              const isReviewingFormOpen = reviewingMilestoneId === milestone.id;
              const isExpanded = expandedMilestone === milestone.id || isSubmitted || isSubmittingFormOpen || isReviewingFormOpen;

              return (
                <div
                  key={milestone.id}
                  className={`bg-white rounded-xl border transition-all shadow-sm ${
                    isSubmitted
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : isApproved
                      ? 'border-emerald-200'
                      : isInProgress
                      ? 'border-sky-300'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Milestone Header Strip */}
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Milestone Number Badge */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isApproved
                            ? 'bg-emerald-600 text-white'
                            : isSubmitted
                            ? 'bg-amber-500 text-white'
                            : isInProgress
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isApproved ? <CheckCircle2 className="w-5 h-5" /> : milestone.milestone_number}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Sprint {milestone.milestone_number}
                          </span>
                          <span className="text-slate-300">•</span>
                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isSubmitted
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isInProgress
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isApproved ? 'Approved & Paid' : isSubmitted ? 'Deliverable Under Review' : milestone.status.replace('_', ' ')}
                          </span>

                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Due: {milestone.due_date}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900">
                          {milestone.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                          {milestone.description}
                        </p>
                      </div>
                    </div>

                    {/* Milestone Payment & Actions */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Escrow Payout</span>
                        <div className="text-base font-bold text-slate-900">
                          ₹{milestone.payment_amount.toLocaleString('en-IN')}
                        </div>
                        <span
                          className={`text-[10px] font-semibold ${
                            milestone.payment_status === 'paid'
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {milestone.payment_status === 'paid' ? '✓ Disbursed' : 'Escrowed'}
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium pt-1"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Details</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>View Deliverable</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details Body */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
                      {/* Submitted Deliverable Info (if available) */}
                      {milestone.deliverable_filename && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              Submitted Deliverable Attachment
                            </span>
                            <a
                              href={milestone.deliverable_url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download / Inspect
                            </a>
                          </div>

                          <div className="text-xs font-mono text-slate-800 bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between">
                            <span className="truncate">{milestone.deliverable_filename}</span>
                            <span className="text-[10px] text-slate-500 shrink-0 ml-2">Verified PDF / Archive</span>
                          </div>

                          {milestone.submission_notes && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-slate-600">Startup Technical Submission Notes:</span>
                              <p className="text-xs text-slate-800 bg-white p-3 rounded border border-slate-200 leading-relaxed">
                                {milestone.submission_notes}
                              </p>
                            </div>
                          )}

                          {milestone.feedback && (
                            <div className="space-y-1 pt-1">
                              <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Official Department Sign-Off Notes:
                              </span>
                              <p className="text-xs text-emerald-950 bg-emerald-50/80 p-3 rounded border border-emerald-200 leading-relaxed">
                                {milestone.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ACTION PANEL 1: STARTUP - SUBMIT DELIVERABLE FORM */}
                      {user?.role === 'startup' && (isInProgress || milestone.status === 'pending') && (
                        <div className="bg-indigo-50/60 p-5 rounded-xl border border-indigo-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-900">
                              <UploadCloud className="w-4 h-4 text-indigo-600" />
                              <span>Submit Deliverable for Milestone Verification</span>
                            </div>
                            {!isSubmittingFormOpen && (
                              <button
                                onClick={() => {
                                  setSubmittingMilestoneId(milestone.id);
                                  setDeliverableFile(quickFillDeliverables[0].filename);
                                  setSubmissionNotes(quickFillDeliverables[0].notes);
                                  setDeliverableUrl(quickFillDeliverables[0].url);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm"
                              >
                                Open Submission Form
                              </button>
                            )}
                          </div>

                          {isSubmittingFormOpen && (
                            <div className="space-y-4 pt-2 border-t border-indigo-100">
                              {/* Quick Fill Presets */}
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className="text-[11px] text-indigo-700 font-semibold">1-Click Presets:</span>
                                {quickFillDeliverables.map((preset, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setDeliverableFile(preset.filename);
                                      setSubmissionNotes(preset.notes);
                                      setDeliverableUrl(preset.url);
                                    }}
                                    className="px-2 py-0.5 rounded bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] transition-colors"
                                  >
                                    Preset {idx + 1}
                                  </button>
                                ))}
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Deliverable File Name / Documentation Title *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={deliverableFile}
                                  onChange={e => setDeliverableFile(e.target.value)}
                                  placeholder="e.g. AeroVision_Accuracy_Test_Harness_v1.pdf"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Technical Documentation & Verification Notes *
                                </label>
                                <textarea
                                  rows={3}
                                  required
                                  value={submissionNotes}
                                  onChange={e => setSubmissionNotes(e.target.value)}
                                  placeholder="Summarize benchmark metrics achieved, test harness configuration, and operating logs..."
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  External Artifact Link (GitHub, Cloud Storage, or Live Dashboard)
                                </label>
                                <input
                                  type="url"
                                  value={deliverableUrl}
                                  onChange={e => setDeliverableUrl(e.target.value)}
                                  placeholder="https://..."
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setSubmittingMilestoneId(null)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isSubmittingDeliverable}
                                  onClick={() => handleDeliverableSubmit(milestone.id)}
                                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5 disabled:bg-slate-300"
                                >
                                  <UploadCloud className="w-3.5 h-3.5" />
                                  <span>{isSubmittingDeliverable ? 'Submitting...' : 'Confirm & Submit Deliverable'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ACTION PANEL 2: DEPARTMENT OFFICIAL - REVIEW DELIVERABLE & RELEASE ESCROW */}
                      {user?.role === 'department_official' && isSubmitted && (
                        <div className="bg-amber-50/80 p-5 rounded-xl border border-amber-300 space-y-4">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span>Official Action Required: Review Deliverable & Release Escrow</span>
                          </div>

                          <p className="text-xs text-amber-900/80 leading-relaxed">
                            The startup has submitted deliverables for Sprint {milestone.milestone_number}. Review the attached documentation above. Approving this milestone releases <strong className="font-bold text-slate-900">₹{milestone.payment_amount.toLocaleString('en-IN')}</strong> directly from escrow to the startup vendor.
                          </p>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                              Official Evaluation Notes & Procurement Sign-Off Remarks:
                            </label>
                            <textarea
                              rows={3}
                              value={reviewFeedback}
                              onChange={e => setReviewFeedback(e.target.value)}
                              placeholder="e.g. Verification team verified >= 98% accuracy on 6 camera feeds. Deliverables meet tender compliance. Approved for payment release."
                              className="w-full px-3 py-2 border border-amber-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 bg-white leading-relaxed"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                            <button
                              type="button"
                              disabled={isReviewing}
                              onClick={() => handleReviewSubmit(milestone.id, 'reject')}
                              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Request Revisions / Reject
                            </button>

                            <button
                              type="button"
                              disabled={isReviewing}
                              onClick={() => handleReviewSubmit(milestone.id, 'approve')}
                              className="w-full sm:w-auto px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors flex items-center justify-center gap-1.5 disabled:bg-slate-300"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                {isReviewing ? 'Releasing Escrow...' : `Approve Deliverable & Release ₹${milestone.payment_amount.toLocaleString('en-IN')}`}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reviewing state for startup if submitted */}
                      {user?.role === 'startup' && isSubmitted && (
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <span className="font-bold">Awaiting Department Official Review.</span> Escrow funds of ₹{milestone.payment_amount.toLocaleString('en-IN')} remain locked and will be disbursed upon committee verification.
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
      )}

      {/* TAB 2: CONTRACT SCOPE & LEGAL SPECIFICATIONS */}
      {activeTab === 'scope' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold font-serif text-slate-900">
              Pilot Operational Scope & Governance Framework
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Binding fast-track procurement sandbox terms executed between procuring department and technology startup.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                1. Scope of Deployment
              </h4>
              <p className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                {pilot.scope}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Target Duration
                </span>
                <p>{pilot.timeline}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Total Authorized Budget
                </span>
                <p className="font-bold text-slate-900">₹{totalBudget.toLocaleString('en-IN')} (Milestone-based Escrow)</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                2. Key Performance Indicators & Target Benchmarks
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                {pilot.problem_statement?.metrics && pilot.problem_statement.metrics.length > 0 ? (
                  pilot.problem_statement.metrics.map((m, idx) => <li key={idx}>{m}</li>)
                ) : (
                  <>
                    <li>&gt;= 98% system availability during 24x7 operating conditions.</li>
                    <li>Sub-400ms edge inferencing latency verified across all live junctions.</li>
                    <li>Zero security breaches or unencrypted telemetry transmission.</li>
                  </>
                )}
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                3. Escrow Governance Policy
              </h4>
              <p className="text-slate-600">
                In compliance with General Financial Rules (GFR) Rule 149 and GovTech fast-track procurement directives, milestone disbursements require explicit cryptographic approval from the designated department official. Automated AI approval is strictly prohibited.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ESCROW AUDIT TRAIL */}
      {activeTab === 'escrow' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold font-serif text-slate-900">
              Escrow Disbursement Ledger & Payment Audit
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Immutable ledger of public funds allocated, escrowed, and released upon deliverable verification.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Milestone Sprint</th>
                  <th className="px-6 py-3">Payout Amount</th>
                  <th className="px-6 py-3">Escrow Status</th>
                  <th className="px-6 py-3">Clearing Authority</th>
                  <th className="px-6 py-3">Deliverable Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {milestones.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">Sprint {m.milestone_number}</div>
                      <div className="text-slate-500 line-clamp-1">{m.title}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      ₹{m.payment_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                          m.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.payment_status === 'paid' ? '✓ Disbursed' : 'In Escrow'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {m.payment_status === 'paid' ? 'Ministry Procurement Committee' : 'Escrow Secured (Hold)'}
                    </td>
                    <td className="px-6 py-4">
                      {m.deliverable_filename ? (
                        <span className="text-indigo-600 font-mono text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {m.deliverable_filename.slice(0, 20)}...
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending upload</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getProblemStatementById } from '@/lib/problem-statements-store';
import { getStartupById } from '@/lib/startups-store';
import {
  createPilot,
  generatePilotId,
  getFutureDateFormatted,
  getInitialMilestonesDraft,
  type MilestoneDraft,
} from '@/lib/pilots-store';
import type { Pilot, Milestone } from '@/types/database';
import {
  FileCheck2,
  Building2,
  Rocket,
  ArrowLeft,
  ArrowRight,
  Coins,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

function NewPilotForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const problemId = searchParams.get('problem_id') || 'ps-201';
  const startupId = searchParams.get('startup_id') || 'startup-102';

  const [problem] = useState(() => getProblemStatementById(problemId));
  const [startup] = useState(() => getStartupById(startupId));

  const [scope, setScope] = useState(
    problem
      ? `Pilot deployment to validate: ${problem.title}. Startup will deploy technology across selected ward infrastructure to satisfy target benchmarks: ${problem.metrics.slice(0, 2).join('; ')}.`
      : 'Deployment of innovative technology solution to validate operational performance benchmarks under real-world municipal conditions.'
  );

  const [timeline, setTimeline] = useState(problem?.target_timeline || '90 Days (3 Milestone Sprints)');
  const [totalBudget, setTotalBudget] = useState(1500000);

  // Default 3 Milestone drafts
  const [milestones, setMilestones] = useState<MilestoneDraft[]>(() => getInitialMilestonesDraft());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalAllocated = milestones.reduce((sum, m) => sum + (Number(m.payment_amount) || 0), 0);
  const budgetBalanced = totalAllocated === totalBudget;

  const handleAddMilestone = () => {
    const nextNum = milestones.length + 1;
    setMilestones([
      ...milestones,
      {
        milestone_number: nextNum,
        title: `Milestone ${nextNum}: Deliverable Phase`,
        description: 'Specific technical deliverables and benchmark verification.',
        due_date: getFutureDateFormatted(nextNum * 30),
        payment_amount: 300000,
      },
    ]);
  };

  const handleRemoveMilestone = (idx: number) => {
    if (milestones.length <= 1) return;
    const updated = milestones
      .filter((_, i) => i !== idx)
      .map((m, i) => ({ ...m, milestone_number: i + 1 }));
    setMilestones(updated);
  };

  const handleMilestoneChange = (
    index: number,
    field: keyof MilestoneDraft,
    val: string | number
  ) => {
    setMilestones(prev =>
      prev.map((m, i) => (i === index ? { ...m, [field]: val } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!budgetBalanced) {
      setErrorMessage(
        `Milestone payments (₹${totalAllocated.toLocaleString()}) must match the total contract budget (₹${totalBudget.toLocaleString()}).`
      );
      return;
    }

    setIsSubmitting(true);
    const pilotId = generatePilotId();

    const pilotMilestones: Milestone[] = milestones.map((m, idx) => ({
      id: `ms-${pilotId}-${idx + 1}`,
      pilot_id: pilotId,
      milestone_number: m.milestone_number,
      title: m.title,
      description: m.description,
      due_date: m.due_date,
      status: idx === 0 ? 'in_progress' : 'pending',
      payment_amount: m.payment_amount,
      payment_status: 'escrowed',
      created_at: new Date().toISOString(),
    }));

    const newPilot: Pilot = {
      id: pilotId,
      problem_statement_id: problemId,
      startup_id: startupId,
      department_id: user?.id || 'dept-101-verified',
      scope,
      timeline,
      budget: totalBudget,
      status: 'active',
      created_at: new Date().toISOString(),
      problem_statement: problem || undefined,
      startup: startup || undefined,
      milestones: pilotMilestones,
    };

    const res = await createPilot(newPilot);
    setIsSubmitting(false);

    if (res.success) {
      router.push(`/pilots/${pilotId}`);
    } else {
      setErrorMessage(res.error || 'Failed to create pilot contract.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Milestone Escrow Contract Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            Initiate Fast-Track Pilot Contract
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Define the pilot scope, milestone payment stages, and deliverable review criteria for mutual execution.
          </p>
        </div>

        <Link
          href={`/problem-statements/${problemId}/matches`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Matches
        </Link>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Contract Parties Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>Buyer / Procuring Department</span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {problem?.department_name || user?.org_or_department || 'Government Department'}
          </div>
          <div className="text-xs text-slate-600 line-clamp-1">
            Challenge: {problem?.title || 'Municipal Innovation Challenge'}
          </div>
        </div>

        {/* Shortlisted Startup Info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
            <Rocket className="w-4 h-4 text-indigo-600" />
            <span>Shortlisted Technology Partner</span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {startup?.name || 'AeroVision Autonomous Systems'}
          </div>
          <div className="text-xs text-slate-600 line-clamp-1">
            {startup?.sector} &bull; TRL {startup?.product_maturity?.toUpperCase()} &bull; Score: {startup?.eligibility_score}/100
          </div>
        </div>
      </div>

      {/* Main Contract Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <h3 className="text-sm font-bold font-serif text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          1. Pilot Scope & Governance Parameters
        </h3>

        {/* Scope */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Contract Scope & Deliverable Objectives *
          </label>
          <textarea
            rows={4}
            required
            value={scope}
            onChange={e => setScope(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 leading-relaxed"
          />
        </div>

        {/* Timeline and Total Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Pilot Timeline & Target Milestones *
            </label>
            <input
              type="text"
              required
              value={timeline}
              onChange={e => setTimeline(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              Total Pilot Contract Budget (₹) *
            </label>
            <input
              type="number"
              required
              step={50000}
              min={100000}
              value={totalBudget}
              onChange={e => setTotalBudget(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-bold focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Milestone Builder */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold font-serif text-slate-900 flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                2. Milestone Payment Stages & Deliverable Criteria ({milestones.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Funds are escrowed and disbursed incrementally upon mutual verification of deliverables.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMilestone}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold self-start sm:self-auto transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone
            </button>
          </div>

          {/* Budget Balance Progress Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>
                Allocated to Milestones:{' '}
                <strong className={budgetBalanced ? 'text-emerald-700' : 'text-amber-700'}>
                  ₹{totalAllocated.toLocaleString()}
                </strong>{' '}
                of ₹{totalBudget.toLocaleString()}
              </span>
              <span className={`text-[11px] font-bold ${budgetBalanced ? 'text-emerald-700' : 'text-amber-700'}`}>
                {budgetBalanced ? '100% Balanced' : `Discrepancy: ₹${(totalBudget - totalAllocated).toLocaleString()}`}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetBalanced ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (totalAllocated / totalBudget) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Milestone Cards List */}
          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 p-5 rounded-xl border border-slate-200 space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {m.milestone_number}
                    </span>
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Milestone Phase {m.milestone_number}
                    </span>
                  </div>

                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 text-xs transition-colors"
                      title="Remove milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Milestone Title
                    </label>
                    <input
                      type="text"
                      required
                      value={m.title}
                      onChange={e => handleMilestoneChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Target Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={m.due_date}
                      onChange={e => handleMilestoneChange(idx, 'due_date', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Deliverable & Acceptance Criteria
                    </label>
                    <input
                      type="text"
                      required
                      value={m.description}
                      onChange={e => handleMilestoneChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Escrow Payout (₹)
                    </label>
                    <input
                      type="number"
                      required
                      step={25000}
                      value={m.payment_amount}
                      onChange={e => handleMilestoneChange(idx, 'payment_amount', Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 font-bold focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href={`/problem-statements/${problemId}/matches`}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold text-center hover:bg-slate-50 transition-colors"
          >
            Cancel & Return
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || !budgetBalanced}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              'Activating Contract...'
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Execute & Activate Pilot Contract</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewPilotPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading contract builder...</div>}>
      <NewPilotForm />
    </Suspense>
  );
}

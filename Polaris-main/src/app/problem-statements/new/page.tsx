'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { saveProblemStatement } from '@/lib/problem-statements-store';
import type { ProblemStatement, ProblemStatementStatus } from '@/types/database';
import {
  Sparkles,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Coins,
  Tag,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const SAMPLE_TEMPLATES = [
  {
    title: 'Traffic Corridors & Congestion',
    label: '🚗 Urban Traffic Signal Optimization',
    raw: 'Major intersections on the arterial corridors have huge traffic snarls during peak office hours. The signals are set on static 90 second timers regardless of whether 100 cars or 5 cars are queued up. We have existing HD surveillance cameras installed at all these junctions, but nobody is using the live video to automatically adjust the green lights. Also ambulances frequently get stuck in the gridlock.',
  },
  {
    title: 'Water Supply & Leak Detection',
    label: '💧 Pipeline Leakage & Water Loss',
    raw: 'Our city water distribution network is losing huge volumes of potable water every day. We estimate almost 40% never reaches households because of underground pipe cracks and leaks. Currently our engineers only find leaks when water literally floods up through the tarmac or citizens lodge complaints. We need acoustic sensors or AI sound analysis on pipes that can catch leaks within hours instead of weeks, without digging up the whole road.',
  },
  {
    title: 'Public Hospital OPD Overcrowding',
    label: '🏥 Hospital OPD Queue Virtualization',
    raw: 'Our district hospital outpatient department has extreme crowding every morning. Patients and their families wait in queue for 4 to 5 hours just to get a token and see a doctor. Many are senior citizens from rural areas. The paperwork is totally manual. We want a digital token kiosk or WhatsApp system with automated triage so patients know exactly when to arrive and minor cases are routed quickly.',
  },
  {
    title: 'Land Records Archival Digitization',
    label: '📜 Land Deeds Multilingual OCR',
    raw: 'We have over a million old physical land revenue deed folios written in Urdu, Modi script and old regional cursive that are disintegrating in archives. Citizens need certified land ownership extracts and resolving title disputes takes months because clerks have to manually search through crumbling paper books. Standard OCR tools fail completely on cursive and degraded paper.',
  },
];

export default function NewProblemStatementPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Workflow steps: 1 = Raw Input, 2 = AI Draft Review & Edit
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form states
  const [rawInput, setRawInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Structured Draft State (Editable)
  const [structuredTitle, setStructuredTitle] = useState('');
  const [structuredBackground, setStructuredBackground] = useState('');
  const [structuredOutcome, setStructuredOutcome] = useState('');
  const [metricsList, setMetricsList] = useState<string[]>([]);
  const [newMetricInput, setNewMetricInput] = useState('');
  const [categoryTags, setCategoryTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [budgetEstimate, setBudgetEstimate] = useState('₹15,00,000 - ₹25,00,000');
  const [targetTimeline, setTargetTimeline] = useState('90 Days (3 Milestone Sprints)');
  const [showRawComparison, setShowRawComparison] = useState(false);

  // Submission State
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatementId, setSavedStatementId] = useState<string | null>(null);

  // Guard: Restrict to Department Officials and Admins
  if (!user || user.role === 'startup') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif text-slate-900">
            Department Official Access Only
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Problem statements can only be drafted and published by verified Government Department Officials. Startups can review published challenges and submit pilot proposals from the Startup Portal.
          </p>
          <div className="pt-2">
            <Link
              href="/startups/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              Go to Startup Dashboard &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.verification_status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border border-amber-300 p-8 rounded-2xl shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif text-slate-900">
            Account Pending Administrative Verification
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your official government account is awaiting admin approval. You cannot draft or publish problem statements until verified.
          </p>
          <Link
            href="/verification-pending"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold"
          >
            Check Verification Status &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Trigger AI Structuring
  const handleGenerateAI = async () => {
    if (rawInput.trim().length < 15) {
      setErrorMessage('Please provide a descriptive problem bottleneck (at least 15 characters).');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      setGenerationPhase('Analyzing raw operational description & extracting context...');
      await new Promise(r => setTimeout(r, 400));

      setGenerationPhase('Formulating background, baseline constraints, and desired outcome...');
      await new Promise(r => setTimeout(r, 400));

      setGenerationPhase('Synthesizing quantitative success metrics & auditable KPIs...');

      const response = await fetch('/api/ai/structure-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput,
          departmentName: user.org_or_department,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI generation failed');
      }

      const { structured } = data;
      setStructuredTitle(structured.title);
      setStructuredBackground(structured.background);
      setStructuredOutcome(structured.outcome);
      setMetricsList(structured.metrics || []);
      setCategoryTags(structured.category_tags || []);
      setBudgetEstimate(structured.budget_estimate || '₹15,00,000 - ₹25,00,000');
      setTargetTimeline(structured.target_timeline || '90 Days (3 Milestone Sprints)');

      setCurrentStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate AI structure';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
      setGenerationPhase('');
    }
  };

  // Add / Remove Metrics
  const handleAddMetric = () => {
    if (newMetricInput.trim()) {
      setMetricsList([...metricsList, newMetricInput.trim()]);
      setNewMetricInput('');
    }
  };

  const handleRemoveMetric = (index: number) => {
    setMetricsList(metricsList.filter((_, i) => i !== index));
  };

  // Add / Remove Category Tags
  const handleAddTag = () => {
    if (newTagInput.trim() && !categoryTags.includes(newTagInput.trim())) {
      setCategoryTags([...categoryTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCategoryTags(categoryTags.filter(t => t !== tagToRemove));
  };

  // Save / Publish Problem Statement
  const handleSaveStatement = async (status: ProblemStatementStatus) => {
    setIsSaving(true);
    setErrorMessage(null);

    const statementId = `ps-${Date.now()}`;
    const newRecord: ProblemStatement = {
      id: statementId,
      department_id: user.id,
      department_name: user.org_or_department,
      raw_input: rawInput,
      title: structuredTitle,
      background: structuredBackground,
      outcome: structuredOutcome,
      metrics: metricsList,
      category_tags: categoryTags,
      budget_estimate: budgetEstimate,
      target_timeline: targetTimeline,
      status,
      created_at: new Date().toISOString(),
    };

    const res = await saveProblemStatement(newRecord);
    setIsSaving(false);

    if (res.success) {
      setSavedStatementId(statementId);
    } else {
      setErrorMessage(res.error || 'Failed to save problem statement.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>{user.org_or_department}</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">
            AI Problem-Statement Generator & Procurement Structuring
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Transform raw, informal operational bottlenecks into structured, milestone-ready innovation challenges.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
        <div
          onClick={() => {
            if (currentStep === 2) setCurrentStep(1);
          }}
          className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
            currentStep === 1
              ? 'bg-sky-50 border-sky-300 text-sky-900 ring-1 ring-sky-400'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              currentStep === 1 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            1
          </div>
          <div>
            <div className="font-bold">Step 1: Raw Informal Problem</div>
            <div className="text-[11px] text-slate-500 font-normal">
              Type or paste raw departmental challenge
            </div>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
            currentStep === 2
              ? 'bg-sky-50 border-sky-300 text-sky-900 ring-1 ring-sky-400'
              : 'bg-white border-slate-200 text-slate-400'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              currentStep === 2 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}
          >
            2
          </div>
          <div>
            <div className="font-bold">Step 2: AI-Structured Draft & Edit</div>
            <div className="text-[11px] text-slate-500 font-normal">
              Refine KPIs, background, tags & publish
            </div>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: RAW INFORMAL PROBLEM INPUT */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Quick-Load Template Presets */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Quick-Test Templates (1-Click Fill):
              </span>
              <span className="text-slate-500 text-[11px]">Click to auto-populate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {SAMPLE_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRawInput(tmpl.raw);
                    setErrorMessage(null);
                  }}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-left text-xs transition-all flex flex-col gap-1"
                >
                  <span className="font-semibold text-slate-900 text-[11px] truncate">
                    {tmpl.label}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {tmpl.raw}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Raw Input Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-slate-900">
                  Raw Informal Bottleneck Description
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Write freely without bureaucratic formatting. Describe the real-world operational problem, who is impacted, and what you wish existed.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {rawInput.length} characters
              </span>
            </div>

            <textarea
              rows={6}
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              placeholder="e.g. We have high rates of pipeline leakage in ward 4. Field engineers currently spend 3 weeks locating cracks manually after streets get flooded. We want an acoustic or IoT sensor solution to detect micro-cracks before pipes burst..."
              className="w-full p-3.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed font-sans"
            />

            {/* AI Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>AI will extract Title, Background, KPIs, Metrics, and Category Tags.</span>
              </div>

              <button
                type="button"
                disabled={isGenerating || rawInput.trim().length < 15}
                onClick={handleGenerateAI}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>Synthesizing Statement...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-200" />
                    <span>Generate Structured Statement with AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Live Progress feedback while generating */}
            {isGenerating && generationPhase && (
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-800 flex items-center gap-2.5 animate-pulse">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-medium">{generationPhase}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: AI-STRUCTURED DRAFT & INTERACTIVE EDITOR */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Collapsible Original Raw Input Box */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRawComparison(!showRawComparison)}
              className="w-full px-5 py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Original Raw Department Input (Reference)</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <span>{showRawComparison ? 'Hide' : 'View'}</span>
                {showRawComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showRawComparison && (
              <div className="p-5 border-t border-slate-200 bg-white text-xs text-slate-700 leading-relaxed italic">
                &ldquo;{rawInput}&rdquo;
              </div>
            )}
          </div>

          {/* Main Structured Form Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  AI Structured RFP Draft
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Edit fields freely before publishing
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-slate-600 hover:text-sky-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Change Raw Input
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Challenge Title (Formal Procurement Statement)
              </label>
              <input
                type="text"
                required
                value={structuredTitle}
                onChange={e => setStructuredTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Background */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Background & Operational Context
              </label>
              <textarea
                rows={5}
                value={structuredBackground}
                onChange={e => setStructuredBackground(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Desired Outcome */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Desired Technical Outcome & Solution Scope
              </label>
              <textarea
                rows={4}
                value={structuredOutcome}
                onChange={e => setStructuredOutcome(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Measurable Success Metrics (KPIs) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Auditable Success Metrics & SLA Targets ({metricsList.length})
                </label>
                <span className="text-[11px] text-slate-500">
                  Used by Validators during scale-up audit
                </span>
              </div>

              <div className="space-y-2">
                {metricsList.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{m}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMetric(idx)}
                      title="Remove metric"
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add metric input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMetricInput}
                  onChange={e => setNewMetricInput(e.target.value)}
                  placeholder="e.g. Processing latency <= 500ms with >= 99% accuracy"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMetric();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddMetric}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add KPI
                </button>
              </div>
            </div>

            {/* Category Tags */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Category & Technology Domain Tags
              </label>

              <div className="flex flex-wrap gap-2">
                {categoryTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium"
                  >
                    <Tag className="w-3 h-3 text-indigo-600" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-600 ml-0.5 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  placeholder="Add technology tag..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Pilot Parameters: Budget & Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  Estimated Pilot Budget Range
                </label>
                <input
                  type="text"
                  value={budgetEstimate}
                  onChange={e => setBudgetEstimate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Target Pilot Duration & Sprints
                </label>
                <input
                  type="text"
                  value={targetTimeline}
                  onChange={e => setTargetTimeline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Publishing & Action Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                &larr; Back to Raw Input
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveStatement('draft')}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  disabled={isSaving || !structuredTitle.trim()}
                  onClick={() => handleSaveStatement('published')}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    'Publishing...'
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Publish & Match Startups</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal when Saved / Published */}
      {savedStatementId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold font-serif text-slate-900">
                Problem Statement Published Successfully
              </h3>
              <p className="text-xs text-slate-600">
                Your problem statement is now live in the Polaris Procurement Sandbox. The AI startup-matching engine has automatically initiated candidate scanning.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900">{structuredTitle}</div>
              <div className="text-slate-500 flex items-center justify-between">
                <span>Department: {user.org_or_department}</span>
                <span className="text-emerald-700 font-semibold uppercase text-[10px]">
                  Status: Published & Matching
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => router.push(`/problem-statements/${savedStatementId}/matches`)}
                className="flex-1 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Matched Startups</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

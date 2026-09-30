'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getStartupByProfileId, saveStartup, calculateStartupEligibility } from '@/lib/startups-store';
import type { Startup } from '@/types/database';
import {
  Rocket,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Tag,
  Trash2,
  Award,
  Globe,
  Users,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

export default function StartupOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Look up existing startup profile for this user if any
  const existing = user ? getStartupByProfileId(user.id) : null;

  // Form states
  const [name, setName] = useState(existing?.name || user?.org_or_department || '');
  const [sector, setSector] = useState(existing?.sector || 'Computer Vision & Smart Mobility');
  const [description, setDescription] = useState(existing?.description || '');
  const [productMaturity, setProductMaturity] = useState<Startup['product_maturity']>(
    existing?.product_maturity || 'prototype'
  );
  const [website, setWebsite] = useState(existing?.website || 'https://');
  const [teamInfo, setTeamInfo] = useState(existing?.team_info || '');
  const [tags, setTags] = useState<string[]>(
    existing?.tags || ['Computer Vision', 'Smart Mobility', 'Edge AI', 'GovTech IoT']
  );
  const [newTag, setNewTag] = useState('');
  const [references, setReferences] = useState<string[]>(
    existing?.references || [
      'Smart Cities India Innovation Sandbox Pilot (Phase 1)',
      'Municipal Transportation Department Sensor Trial'
    ]
  );
  const [newRef, setNewRef] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live real-time eligibility calculation
  const liveEligibility = calculateStartupEligibility({
    product_maturity: productMaturity,
    description,
    team_info: teamInfo,
    website,
    references,
    tags,
  });

  // Tag helpers
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Reference helpers
  const handleAddReference = () => {
    if (newRef.trim()) {
      setReferences([...references, newRef.trim()]);
      setNewRef('');
    }
  };

  const handleRemoveReference = (idx: number) => {
    setReferences(references.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !description.trim() || !teamInfo.trim()) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    setIsSaving(true);

    const startupRecord: Startup = {
      id: existing?.id || `startup-${Date.now()}`,
      profile_id: user?.id,
      name,
      sector,
      description,
      product_maturity: productMaturity,
      website,
      team_info: teamInfo,
      references,
      tags,
      eligibility_score: liveEligibility.totalScore,
      created_at: existing?.created_at || new Date().toISOString(),
    };

    const res = await saveStartup(startupRecord);
    setIsSaving(false);

    if (res.success) {
      router.push('/startups/dashboard?onboarding=complete');
    } else {
      setErrorMessage(res.error || 'Failed to save startup profile.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
            <Rocket className="w-4 h-4" />
            <span>GovTech Innovation Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            Startup Profile & Procurement Onboarding
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Register your startup&apos;s technical competencies, readiness maturity, and past track record to qualify for government pilots.
          </p>
        </div>

        <Link
          href="/startups/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Startup Workspace
        </Link>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Form (2 cols) vs Real-Time Eligibility Score Preview (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold font-serif text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              1. Organization & Core Solution
            </h3>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Company Legal Name / Startup Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. AeroVision Autonomous Systems Pvt Ltd"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Primary Sector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Primary Innovation Sector *
              </label>
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Computer Vision & Smart Mobility">Computer Vision & Smart Mobility</option>
                <option value="Smart Water & Infrastructure IoT">Smart Water & Infrastructure IoT</option>
                <option value="Document AI & GovTech Data">Document AI & GovTech Data</option>
                <option value="Digital Health & Public Systems">Digital Health & Public Systems</option>
                <option value="Transport & Road Infrastructure">Transport & Road Infrastructure</option>
                <option value="Clean Energy & Public Utilities">Clean Energy & Public Utilities</option>
                <option value="Cybersecurity & Citizen Privacy">Cybersecurity & Citizen Privacy</option>
                <option value="Agritech & Rural Automation">Agritech & Rural Automation</option>
              </select>
            </div>

            {/* Solution Pitch */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Technical Solution Overview & Value Proposition *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your core product or platform, how it interfaces with public infrastructure, and the specific operational benefits for government departments..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Used by the AI Matching Engine to calculate keyword and vector alignment against departmental problem statements.
              </p>
            </div>

            {/* Technology Tags */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Technology Capabilities & Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium"
                  >
                    <Tag className="w-3 h-3 text-indigo-500" />
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600 font-bold ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="e.g. Edge AI, LiDAR, Drone..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Maturity & Technical Readiness */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold font-serif text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              2. Product Maturity & Technical Readiness Level (TRL)
            </h3>

            {/* Maturity Radio Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  value: 'concept',
                  label: 'Concept / Lab Prototype',
                  trl: 'TRL 3-4',
                  desc: 'Early architecture, initial benchmarks established',
                },
                {
                  value: 'prototype',
                  label: 'Field Prototype',
                  trl: 'TRL 5-6',
                  desc: 'Working system tested in simulated environment',
                },
                {
                  value: 'deployed',
                  label: 'Commercial Deployment',
                  trl: 'TRL 7-8',
                  desc: 'Proven in live municipal or enterprise setting',
                },
                {
                  value: 'scaling',
                  label: 'Mature & Scaling',
                  trl: 'TRL 9',
                  desc: 'Production-grade with standard SLA compliance',
                },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    productMaturity === opt.value
                      ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400 text-indigo-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{opt.label}</span>
                    <input
                      type="radio"
                      name="product_maturity"
                      value={opt.value}
                      checked={productMaturity === opt.value}
                      onChange={() => setProductMaturity(opt.value as Startup['product_maturity'])}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-[10px] font-mono bg-white/70 px-1.5 py-0.5 rounded border border-slate-200 self-start font-semibold text-slate-600 mb-1">
                    {opt.trl}
                  </span>
                  <span className="text-[11px] text-slate-500 leading-snug">{opt.desc}</span>
                </label>
              ))}
            </div>

            {/* Website / Demo Link */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                Website or Product Demo Link
              </label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourstartup.io"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Team & Track Record */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold font-serif text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              3. Team Credentials & Prior Public Pilots
            </h3>

            {/* Team Info */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Core Engineering Team & Leadership Credentials *
              </label>
              <textarea
                rows={3}
                required
                value={teamInfo}
                onChange={e => setTeamInfo(e.target.value)}
                placeholder="e.g. Founded by ex-ISRO robotics engineer Priya Sharma with 12 AI and embedded systems engineers holding patents in edge video processing..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* References */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Prior Pilots, Trials, & Customer References ({references.length})
                </label>
                <span className="text-[11px] text-slate-500">Boosts eligibility rating</span>
              </div>

              <div className="space-y-2">
                {references.map((ref, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{ref}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveReference(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Reference Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newRef}
                  onChange={e => setNewRef(e.target.value)}
                  placeholder="e.g. Pune Municipal Corporation pilot (Ward 7)"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddReference();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddReference}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Add Reference
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/startups/dashboard"
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all flex items-center gap-2"
            >
              {isSaving ? (
                'Saving Profile...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Onboarding & Save Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right 1 Col: Sticky Live Eligibility Rating Breakdown Preview */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Live Eligibility Preview
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                Auto Calculated
              </span>
            </div>

            {/* Score Display */}
            <div className="text-center py-2 space-y-1">
              <div className="text-5xl font-extrabold font-serif text-slate-900">
                {liveEligibility.totalScore}
                <span className="text-slate-400 text-lg font-normal"> / 100</span>
              </div>
              <div className="text-xs font-semibold text-emerald-700">
                {liveEligibility.totalScore >= 80
                  ? 'High Procurement Readiness'
                  : liveEligibility.totalScore >= 65
                  ? 'Eligible for Fast-Track Pilots'
                  : 'Early-Stage Assessment'}
              </div>
            </div>

            {/* 4 Pillars Breakdown */}
            <div className="space-y-3 pt-2 text-xs border-t border-slate-100">
              {/* Product Maturity */}
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Product Maturity</span>
                  <span className="font-semibold text-slate-900">
                    {liveEligibility.breakdown.product_maturity_score} / 25
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${(liveEligibility.breakdown.product_maturity_score / 25) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Technical Fit */}
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Technical Fit & Description</span>
                  <span className="font-semibold text-slate-900">
                    {liveEligibility.breakdown.technical_fit_score} / 35
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${(liveEligibility.breakdown.technical_fit_score / 35) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Past Pilot Performance */}
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Past Pilot Performance</span>
                  <span className="font-semibold text-slate-900">
                    {liveEligibility.breakdown.past_pilot_score} / 25
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-300"
                    style={{ width: `${(liveEligibility.breakdown.past_pilot_score / 25) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Verified References */}
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>References & Leadership</span>
                  <span className="font-semibold text-slate-900">
                    {liveEligibility.breakdown.references_score} / 15
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${(liveEligibility.breakdown.references_score / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Transparent Algorithm Note */}
            <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-600 space-y-1.5 border border-slate-200/80">
              <div className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Transparent Scoring Standard
              </div>
              <p className="leading-relaxed">
                Department buyers and independent validators review this objective breakdown. Higher TRL and public references unlock immediate eligibility for matching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

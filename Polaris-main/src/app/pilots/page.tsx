'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { getAllPilots } from '@/lib/pilots-store';
import type { Pilot, PilotStatus } from '@/types/database';
import {
  ShieldCheck,
  Building2,
  Rocket,
  Coins,
  Clock,
  CheckCircle2,
  Search,
  PlusCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function PilotsDirectoryPage() {
  const [pilots] = useState<Pilot[]>(() => getAllPilots());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PilotStatus | 'under_review'>('all');

  // Compute platform metrics
  const metrics = useMemo(() => {
    let totalCap = 0;
    let totalDisbursed = 0;
    let totalMilestones = 0;
    let clearedMilestones = 0;
    let activeCount = 0;
    let completedCount = 0;

    pilots.forEach(p => {
      totalCap += p.budget || 0;
      if (p.status === 'active') activeCount++;
      if (p.status === 'completed') completedCount++;

      (p.milestones || []).forEach(m => {
        totalMilestones++;
        if (m.payment_status === 'paid' || m.status === 'approved') {
          totalDisbursed += m.payment_amount || 0;
          clearedMilestones++;
        }
      });
    });

    return {
      totalPilots: pilots.length,
      activeCount,
      completedCount,
      totalCap,
      totalDisbursed,
      escrowHold: totalCap - totalDisbursed,
      clearedMilestones,
      totalMilestones,
    };
  }, [pilots]);

  // Filtered pilots list
  const filteredPilots = useMemo(() => {
    return pilots.filter(p => {
      // Status filter
      if (statusFilter === 'active' && p.status !== 'active') return false;
      if (statusFilter === 'completed' && p.status !== 'completed') return false;
      if (statusFilter === 'under_review') {
        const hasSubmittedMilestone = (p.milestones || []).some(m => m.status === 'submitted');
        if (!hasSubmittedMilestone) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.problem_statement?.title.toLowerCase().includes(q);
        const matchesStartup = p.startup?.name.toLowerCase().includes(q);
        const matchesDept = p.problem_statement?.department_name?.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesScope = p.scope.toLowerCase().includes(q);
        return matchesTitle || matchesStartup || matchesDept || matchesId || matchesScope;
      }

      return true;
    });
  }, [pilots, searchQuery, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Public Innovation Procurement Sandbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            GovTech Pilot Registry & Milestone Escrow Tracker
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Central repository of active municipal and ministry innovation pilots. Funds are secured via automated public escrow and released strictly upon verifiable deliverable sign-off.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/pilots/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Initiate Pilot Contract
          </Link>
        </div>
      </div>

      {/* Financial & Operational KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Pilots</span>
            <Rocket className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {metrics.activeCount}
          </div>
          <p className="text-[11px] text-indigo-600 font-medium">
            {metrics.totalPilots} registered across departments
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Contract Escrow</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            ₹{metrics.totalCap.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">
            Secured via procurement escrow
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Disbursed to Startups</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-700">
            ₹{metrics.totalDisbursed.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            Released upon verified milestones
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Milestones Cleared</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {metrics.clearedMilestones} / {metrics.totalMilestones}
          </div>
          <p className="text-[11px] text-slate-500">
            {metrics.completedCount} pilots 100% completed
          </p>
        </div>
      </div>

      {/* Search and Filtering Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by pilot, startup, challenge, or department..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Pilots ({pilots.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'active'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active ({metrics.activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('under_review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'under_review'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Deliverable Under Review
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed ({metrics.completedCount})
          </button>
        </div>
      </div>

      {/* Pilots Directory List */}
      <div className="space-y-4">
        {filteredPilots.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Pilots Match Current Filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords or switching to the &quot;All Pilots&quot; view.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 pt-1"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredPilots.map((pilot) => {
            const milestones = pilot.milestones || [];
            const clearedCount = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length;
            const hasReviewPending = milestones.some(m => m.status === 'submitted');
            const totalPilotBudget = pilot.budget || 0;
            const releasedFunds = milestones
              .filter(m => m.payment_status === 'paid')
              .reduce((sum, m) => sum + (m.payment_amount || 0), 0);
            const isCompleted = pilot.status === 'completed' || (milestones.length > 0 && clearedCount === milestones.length);

            return (
              <div
                key={pilot.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all p-6 space-y-4"
              >
                {/* Card Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                      {pilot.id.toUpperCase()}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : hasReviewPending
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1'
                          : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {hasReviewPending && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      {isCompleted ? 'Completed & Scalable' : hasReviewPending ? 'Deliverable Submitted' : pilot.status}
                    </span>

                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {pilot.timeline}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Escrow Contract</span>
                    <span className="text-base font-bold text-slate-900">
                      ₹{totalPilotBudget.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold block">
                      ₹{releasedFunds.toLocaleString('en-IN')} released
                    </span>
                  </div>
                </div>

                {/* Challenge Title & Scope */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                    {pilot.problem_statement?.title || 'GovTech Innovation Pilot'}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {pilot.scope}
                  </p>
                </div>

                {/* Parties Involved Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Department</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {pilot.problem_statement?.department_name || 'Ministry of Electronics & IT'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Startup Partner</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {pilot.startup?.name || 'Vetted Technology Partner'} &bull; {pilot.startup?.sector}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Milestone Progress Bar & Workspace Link */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 max-w-md">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-600">
                        Milestone Progress: {clearedCount} of {milestones.length} Cleared
                      </span>
                      <span className="text-emerald-700 font-bold">
                        {milestones.length > 0 ? Math.round((clearedCount / milestones.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      {milestones.map((m, idx) => (
                        <div
                          key={idx}
                          className={`h-full border-r border-white/50 last:border-0 ${
                            m.status === 'approved' || m.status === 'paid'
                              ? 'bg-emerald-500'
                              : m.status === 'submitted'
                              ? 'bg-amber-400'
                              : m.status === 'in_progress'
                              ? 'bg-sky-400'
                              : 'bg-slate-200'
                          }`}
                          style={{ width: `${100 / milestones.length}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/pilots/${pilot.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
                    >
                      <span>Open Pilot Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getAllStartups } from '@/lib/startups-store';
import type { Startup } from '@/types/database';
import {
  Rocket,
  Search,
  Globe,
  FileCheck2,
  Filter,
} from 'lucide-react';

export default function StartupsDirectoryPage() {
  const [startups] = useState<Startup[]>(() => getAllStartups());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedMaturity, setSelectedMaturity] = useState<string>('all');

  const sectors = [
    'all',
    'Computer Vision & Smart Mobility',
    'Smart Water & Infrastructure IoT',
    'Document AI & GovTech Data',
    'Digital Health & Public Systems',
    'Transport & Road Infrastructure',
    'Clean Energy & Public Utilities',
  ];

  const filteredStartups = startups.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSector = selectedSector === 'all' || s.sector === selectedSector;
    const matchesMaturity = selectedMaturity === 'all' || s.product_maturity === selectedMaturity;

    return matchesSearch && matchesSector && matchesMaturity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
            <Rocket className="w-4 h-4" />
            <span>National GovTech Supplier Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            Verified Technology Startups ({startups.length})
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Browse accredited startups vetted for government problem statements, pilot trials, and milestone procurement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/startups/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Register New Startup</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by startup name, technology capability (e.g. Edge AI, acoustic, OCR)..."
              className="w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Maturity Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMaturity}
              onChange={e => setSelectedMaturity(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Maturity Stages</option>
              <option value="scaling">TRL 9 (Scaling)</option>
              <option value="deployed">TRL 7-8 (Deployed)</option>
              <option value="prototype">TRL 5-6 (Prototype)</option>
              <option value="concept">TRL 3-4 (Concept)</option>
            </select>
          </div>
        </div>

        {/* Sector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {sectors.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedSector === sec
                  ? 'bg-indigo-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec === 'all' ? 'All Sectors' : sec}
            </button>
          ))}
        </div>
      </div>

      {/* Startups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStartups.map(startup => (
          <div
            key={startup.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold font-serif text-slate-900 leading-snug">
                    {startup.name}
                  </h3>
                  <span className="text-[11px] font-medium text-indigo-700 block mt-0.5">
                    {startup.sector}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-extrabold font-serif text-slate-900">
                    {startup.eligibility_score}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded capitalize">
                    {startup.product_maturity}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {startup.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {(startup.tags || []).slice(0, 4).map(t => (
                  <span
                    key={t}
                    className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium"
                  >
                    {t}
                  </span>
                ))}
                {(startup.tags || []).length > 4 && (
                  <span className="text-[10px] text-slate-400 self-center">
                    +{(startup.tags || []).length - 4}
                  </span>
                )}
              </div>

              {/* References */}
              {startup.references.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <FileCheck2 className="w-3 h-3 text-indigo-600" />
                    Verified Public Pilot:
                  </span>
                  <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                    &ldquo;{startup.references[0]}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {startup.website ? (
                <a
                  href={startup.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                </a>
              ) : (
                <span className="text-slate-400">GovTech Verified</span>
              )}

              <Link
                href="/dashboard"
                className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
              >
                Match to RFP &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredStartups.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Rocket className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No startups match your search</h3>
          <p className="text-xs text-slate-500">Try clearing filters or adjusting your keyword search.</p>
        </div>
      )}
    </div>
  );
}

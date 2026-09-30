import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock } from 'lucide-react';
import { ALLOWED_GOVERNMENT_DOMAINS } from '@/config/government-domains';

export function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              POLARIS PLATFORM
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              National Innovation Procurement Platform facilitating agile, template-driven milestone pilots between public agencies and verified technology startups.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Secure RLS Data Protection Active
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase">
              Role Access & Security
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <span className="text-slate-300 font-medium">Startups:</span> Open self-registration
              </li>
              <li>
                <span className="text-slate-300 font-medium">Departments:</span> Restricted Gov domain
              </li>
              <li>
                <span className="text-slate-300 font-medium">Validators:</span> Accredited agencies only
              </li>
              <li>
                <span className="text-slate-300 font-medium">Admin:</span> Central procurement cell
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase">
              Authorized Email Domains
            </h4>
            <p className="text-slate-400 text-[11px]">
              Official department onboarding strictly requires verified domain registration:
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {ALLOWED_GOVERNMENT_DOMAINS.slice(0, 8).map(d => (
                <span
                  key={d}
                  className="bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono"
                >
                  @{d}
                </span>
              ))}
              <span className="text-[10px] text-slate-500 self-center">+ more</span>
            </div>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  AI Problem Statement Generator
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Startup Matching & Scoring Engine
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Milestone Escrow & Pilot Tracker
                </Link>
              </li>
              <li>
                <Link href="/validation" className="hover:text-white transition-colors">
                  Independent Validation Authority
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted with Supabase Row Level Security (RLS) & GovSec compliance standards.</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Polaris GovTech Innovation Framework. Built for public procurement excellence.
          </div>
        </div>
      </div>
    </footer>
  );
}

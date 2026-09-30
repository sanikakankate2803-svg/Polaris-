'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  AlertCircle,
  LogOut,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, switchDemoRole, allUsersList } = useAuth();

  const pendingCount = allUsersList.filter(u => u.verification_status === 'pending').length;

  const roleLabelMap: Record<string, { title: string; color: string; bg: string }> = {
    department_official: {
      title: 'Department Official',
      color: 'text-sky-700 border-sky-300',
      bg: 'bg-sky-50',
    },
    startup: {
      title: 'Startup Partner',
      color: 'text-indigo-700 border-indigo-300',
      bg: 'bg-indigo-50',
    },
    validator: {
      title: 'Validation Authority',
      color: 'text-purple-700 border-purple-300',
      bg: 'bg-purple-50',
    },
    admin: {
      title: 'System Administrator',
      color: 'text-amber-700 border-amber-300',
      bg: 'bg-amber-50',
    },
  };

  const currentRoleConfig = user ? roleLabelMap[user.role] : null;

  return (
    <header className="w-full bg-slate-900 text-slate-100 sticky top-0 z-50 border-b border-slate-800 shadow-md">
      {/* Top Bar: Official Seal & Quick Role Switcher Banner */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            GovTech Procurement Sandbox
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400">Restricted Government & Startup Portal</span>
        </div>

        {/* Interactive Demo Role Switcher for instant evaluation */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mr-1 hidden md:inline">
            Role Preview:
          </span>
          <button
            onClick={() => switchDemoRole('department')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              user?.role === 'department_official' && user?.verification_status === 'verified'
                ? 'bg-sky-600 text-white font-semibold ring-1 ring-sky-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Dept Official
          </button>
          <button
            onClick={() => switchDemoRole('startup')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              user?.role === 'startup'
                ? 'bg-indigo-600 text-white font-semibold ring-1 ring-indigo-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Startup
          </button>
          <button
            onClick={() => switchDemoRole('validator')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              user?.role === 'validator'
                ? 'bg-purple-600 text-white font-semibold ring-1 ring-purple-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Validator
          </button>
          <button
            onClick={() => switchDemoRole('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all relative ${
              user?.role === 'admin'
                ? 'bg-amber-600 text-white font-semibold ring-1 ring-amber-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Admin
            {pendingCount > 0 && (
              <span className="ml-1 px-1 bg-amber-400 text-slate-950 rounded-full text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => switchDemoRole('pending_official')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              user?.verification_status === 'pending'
                ? 'bg-yellow-600 text-white font-semibold ring-1 ring-yellow-400'
                : 'bg-slate-800/80 text-yellow-300 hover:bg-slate-700'
            }`}
          >
            Pending Official ⚠️
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Emblem */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-950 ring-1 ring-white/10 group-hover:ring-sky-400 transition-all">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white font-serif">
                    POLARIS
                  </span>
                  <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 font-mono px-1.5 py-0.5 rounded tracking-wider uppercase font-semibold">
                    GovTech AI
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 tracking-normal">
                  Public Innovation & Procurement Platform
                </span>
              </div>
            </Link>

            {/* Main Links */}
            <nav className="hidden md:flex items-center gap-1 ml-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Dashboard
              </Link>
              
              {user?.role === 'department_official' && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    pathname.startsWith('/problem-statements')
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Problem Statements
                </Link>
              )}

              <Link
                href="/startups/dashboard"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname.startsWith('/startups')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Startups Portal
              </Link>

              <Link
                href="/pilots"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname.startsWith('/pilots')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Pilots & Escrow
              </Link>

              <Link
                href="/validation"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname.startsWith('/validation')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Validator Portal
              </Link>

              <Link
                href="/solutions"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname.startsWith('/solutions')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Solutions Library
              </Link>

              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith('/admin')
                      ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
                      : 'text-amber-400 hover:bg-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Admin Console
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-xs font-bold">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )}
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* User Identity Info */}
                <div className="hidden lg:flex flex-col items-end text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{user.name}</span>
                    {user.verification_status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                        <UserCheck className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <Link
                        href="/verification-pending"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full hover:bg-amber-900/50 transition-colors"
                      >
                        <AlertCircle className="w-3 h-3" />
                        Pending Approval
                      </Link>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 truncate max-w-[220px]">
                    {user.org_or_department}
                  </span>
                </div>

                {/* Role Pill */}
                {currentRoleConfig && (
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium ${currentRoleConfig.color} ${currentRoleConfig.bg}`}
                  >
                    {currentRoleConfig.title}
                  </span>
                )}

                {/* Logout Action */}
                <button
                  onClick={() => logout()}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-md shadow transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

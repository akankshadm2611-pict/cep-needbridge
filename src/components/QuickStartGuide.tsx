/**
 * src/components/QuickStartGuide.tsx — Interactive, dismissible Walkthrough & Guide for users.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Package,
  Building2,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  BookOpen,
  UserCheck,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function QuickStartGuide() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'volunteer' | 'donor' | 'ngo'>(
    user?.role === 'ngo' ? 'ngo' : 'volunteer'
  );

  if (!isOpen) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-12">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 transition-colors shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Need help getting started? Open Quick Guide</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-teal-800/40">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-teal-800/40 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Interactive Getting Started Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              How to Use NeedBridge in 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Select your goal below to see how to find drives, donate supplies, or publish verified NGO needs.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close guide"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-6 relative z-10">
          <button
            onClick={() => setSelectedRole('volunteer')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedRole === 'volunteer'
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>I Want to Volunteer Time</span>
          </button>
          <button
            onClick={() => setSelectedRole('donor')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedRole === 'donor'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>I Want to Donate Goods</span>
          </button>
          <button
            onClick={() => setSelectedRole('ngo')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedRole === 'ngo'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>I am an NGO Leader</span>
          </button>
        </div>

        {/* Step Cards based on role */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 relative z-10">
          {selectedRole === 'volunteer' && (
            <>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-teal-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs">1</span>
                  <span>Explore Open Drives</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Head to the <Link to="/opportunities" className="text-teal-300 underline font-semibold">Opportunities Tab</Link> and filter by causes like Education, Health, or SDGs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-teal-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs">2</span>
                  <span>Click "I Want to Help"</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Select any active drive to send your application with your skills and availability to the NGO in 1 click.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-teal-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs">3</span>
                  <span>Track in Dashboard</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  View acceptance notifications, coordinator contact info, and track hours contributed in your personal dashboard.
                </p>
              </div>
            </>
          )}

          {selectedRole === 'donor' && (
            <>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">1</span>
                  <span>Find Specific Needs</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Visit <Link to="/opportunities?type=goods" className="text-emerald-300 underline font-semibold">Goods Opportunities</Link> to see items like ration kits, books, or medicines with exact counts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">2</span>
                  <span>Pledge Exact Quantity</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click <strong>"Pledge Goods"</strong>. The anti-surplus engine locks your quantity so excess items aren't wasted.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
                  <span>Drop-Off & Confirm</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Deliver or ship items directly to the verified NGO address and monitor verified delivery confirmation.
                </p>
              </div>
            </>
          )}

          {selectedRole === 'ngo' && (
            <>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">1</span>
                  <span>Get NGO Verified</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Log in or register with your NGO registration certificate. Admins verify credentials within 24 hours.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">2</span>
                  <span>Post Requirements</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Post requirements for volunteer manpower or physical goods. Use the AI helper to format your needs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">3</span>
                  <span>1-Click Accept Applicants</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Review applicant profiles, approve pledges, and automatically cap quotas once goals are met.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-6 flex items-center justify-between flex-wrap gap-4 border-t border-teal-800/40 mt-6 relative z-10">
          <div className="flex items-center gap-2 text-xs text-teal-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Free platform for verified grassroots action & zero donation surplus.</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-teal-50 transition-all shadow-md"
            >
              <span>Explore Opportunities Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-all shadow-md"
              >
                <span>Demo 1-Click Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

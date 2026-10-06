/**
 * src/components/QuickStartGuide.tsx — Interactive, user-friendly Getting Started Walkthrough for new users.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Package,
  Building2,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  BookOpen,
  Search,
  HandHeart,
  Send,
  Award,
  Layers,
  FileCheck2,
  SlidersHorizontal
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
      <div id="guide" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 dark:hover:bg-slate-700 transition-all shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>New here? Open the Getting Started Guide</span>
        </button>
      </div>
    );
  }

  return (
    <section id="guide" aria-label="Getting Started Guide" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-teal-800/40">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-teal-800/50 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>New User Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Getting Started with NeedBridge
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Follow this quick 3-step guide to get started right away based on what you'd like to do.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Dismiss guide"
            title="Minimize guide"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-6 relative z-10">
          <button
            onClick={() => setSelectedRole('volunteer')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedRole === 'volunteer'
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25 ring-2 ring-teal-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Volunteer My Time</span>
          </button>
          <button
            onClick={() => setSelectedRole('donor')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedRole === 'donor'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Donate Physical Supplies</span>
          </button>
          <button
            onClick={() => setSelectedRole('ngo')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedRole === 'ngo'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>I'm an NGO</span>
          </button>
        </div>

        {/* 3 Step Cards based on role */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 relative z-10">
          {selectedRole === 'volunteer' && (
            <>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/40 transition-colors space-y-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Search className="w-4 h-4 text-teal-400" />
                  Find Drives You Love
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Browse open requirements and filter by cause (Education, Healthcare, Relief, Environment) or location nearest to you.
                </p>
                <div className="pt-2">
                  <Link
                    to="/opportunities"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300 hover:text-teal-200 hover:underline"
                  >
                    <span>Browse Drives</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/40 transition-colors space-y-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Send className="w-4 h-4 text-teal-400" />
                  Apply in 1 Click
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click <strong>"I Want to Help"</strong> on any drive. Your profile and skills are instantly sent to the NGO coordinator for review.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/40 transition-colors space-y-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-400" />
                  Track & Build Impact
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Once accepted, get schedule details in your Volunteer Dashboard. Your hours automatically count toward verified UN SDG impact!
                </p>
              </div>
            </>
          )}

          {selectedRole === 'donor' && (
            <>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  See What's Needed
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Look through verified supply requests with clear target quantities: food rations, books, warm clothes, medical supplies.
                </p>
                <div className="pt-2">
                  <Link
                    to="/opportunities?type=goods"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 hover:underline"
                  >
                    <span>View Goods Needed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  Pledge Exact Quantity
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Choose how much you can provide. Our zero-wastage system locks your quantity so the drive is never over-donated.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <HandHeart className="w-4 h-4 text-emerald-400" />
                  Handover & Verification
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Drop off or ship items to the NGO address. When received, the NGO marks delivery complete on your dashboard.
                </p>
              </div>
            </>
          )}

          {selectedRole === 'ngo' && (
            <>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-colors space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-blue-400" />
                  Register & Verify
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Create your NGO account and submit your registration details to receive your verified trust badge.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-colors space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Post Requirements
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Publish volunteer drives or physical resource needs in simple steps. Our offline AI assistant helps format categories & SDGs.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-colors space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Accept Applications
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Review applicant profiles (skills, reliability score, contact info) and accept with 1 click from your NGO dashboard.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer info bar */}
        <div className="pt-6 flex items-center justify-between flex-wrap gap-4 border-t border-teal-800/40 mt-6 relative z-10">
          <div className="flex items-center gap-2 text-xs text-teal-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% free platform connecting grassroots action with zero wastage.</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-teal-50 transition-all shadow-md"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-all shadow-md"
              >
                <span>Get Started (Sign Up / Login)</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


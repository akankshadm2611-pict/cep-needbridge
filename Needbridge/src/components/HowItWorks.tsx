import React from 'react';
import { 
  Building2, 
  UserCheck, 
  HeartHandshake, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Users, 
  ArrowRight,
  Clock,
  Award,
  Layers
} from 'lucide-react';
import { UserRole } from '../types';

interface HowItWorksProps {
  onSelectRoleAction: (mode: 'login' | 'signup', role: UserRole) => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onSelectRoleAction }) => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white dark:bg-slate-950 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* BIG CENTER-ALIGNED FEATURE CARD */}
        <div 
          id="how-it-works-banner"
          className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 text-white p-8 sm:p-12 lg:p-14 shadow-xl overflow-hidden mb-16 text-center max-w-5xl mx-auto border border-slate-800"
        >
          {/* Subtle glowing orbs */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-4">
              <Layers className="w-3.5 h-3.5" />
              Unified Ecosystem
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white leading-tight mb-4">
              One platform, three impacts
            </h2>

            <p className="text-slate-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed">
              Whether you are an organization with a mission, a person with time to give, or someone who needs help, NeedBridge has a path for you.
            </p>
          </div>
        </div>

        {/* 3 WORKFLOW PATHWAYS */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Simple & Transparent Workflows</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display mt-1">
            How It Works for Every Role
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Get started in under 3 minutes with zero bureaucratic delay.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. NGO / Organization Workflow */}
          <div 
            id="workflow-ngo"
            className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 sm:p-7 relative flex flex-col justify-between hover:shadow-lg transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                  1
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 px-2.5 py-1 rounded-full">
                  For Organizations
                </span>
              </div>

              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-display">
                NGOs & Foundations
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Mobilize support for your grassroots mission.
              </p>

              {/* 3 Step Process */}
              <div className="space-y-5 relative">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">1. Register and Verify</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Submit registration documents or local authority proof for instant trusted verification.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">2. Post Needs & Drives</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Create specific volunteer slots (teaching, medical camps) or post targeted campaign funding needs.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">3. Connect and Manage</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Review applicant requests in 1-click, coordinate with volunteers, and track beneficiary reach.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectRoleAction('signup', 'ngo')}
              className="mt-8 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Get Verified as NGO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Volunteers Workflow */}
          <div 
            id="workflow-volunteer"
            className="rounded-2xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/40 dark:bg-teal-950/20 p-6 sm:p-7 relative flex flex-col justify-between hover:shadow-lg transition-all ring-1 ring-teal-500/20"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <span className="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2.5 py-1 rounded-full">
                  For Volunteers
                </span>
              </div>

              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-display">
                Individual Changemakers
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Turn your free hours into tangible community impact.
              </p>

              {/* 4 Step Process */}
              <div className="space-y-4 relative">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Build Your Profile</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Highlight your interests (Education, Environment, Health) and available hours.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Find Opportunities</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Explore nearby localized drives matching your exact skills and neighborhood.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Apply & Connect</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      1-click application and instant confirmation from verified field leads.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Contribute & Earn Certificates</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Show up, create change, log verified hours, and download recognition credentials.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectRoleAction('signup', 'volunteer')}
              className="mt-8 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-teal-700/20"
            >
              <span>Create Volunteer Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. Seekers & Community Workflow */}
          <div 
            id="workflow-seeker"
            className="rounded-2xl border border-purple-100 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/20 p-6 sm:p-7 relative flex flex-col justify-between hover:shadow-lg transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-900/50 px-2.5 py-1 rounded-full">
                  For Seekers & Donors
                </span>
              </div>

              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-display">
                Communities & Donors
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Receive prompt relief aid or fuel certified campaigns.
              </p>

              {/* 3 Step Process */}
              <div className="space-y-5 relative">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">1. Post Needs or Search Aid</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Submit community requirements for food, school essentials, or emergency healthcare relief.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">2. Match with Nearby NGOs</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Our platform routes requests directly to active organizations operating in your area.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">3. Receive Support & Track</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Get direct resource deliveries with transparent verification and zero hidden overheads.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectRoleAction('signup', 'donor_seeker')}
              className="mt-8 w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Connect with Resources</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

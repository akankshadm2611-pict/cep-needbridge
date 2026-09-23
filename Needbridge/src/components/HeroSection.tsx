import React from 'react';
import { 
  Building2, 
  UserCheck, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle, 
  Users, 
  Heart, 
  Award,
  Info
} from 'lucide-react';
import { HelpingHandsGraphicBackdrop } from './HelpingHandsLogo';
import { UserRole } from '../types';

interface HeroSectionProps {
  ngosCount?: number;
  volunteersCount?: number;
  campaignsCount?: number;
  peopleImpactedCount?: number;
  onSelectRoleAction?: (mode: 'login' | 'signup', role?: UserRole) => void;
  onExploreCampaigns?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  ngosCount = 0,
  volunteersCount = 0,
  campaignsCount = 0,
  peopleImpactedCount = 0,
  onSelectRoleAction,
  onExploreCampaigns,
}) => {
  const hasLiveActivity = ngosCount > 0 || volunteersCount > 0 || campaignsCount > 0 || peopleImpactedCount > 0;

  return (
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-helping-hands">
      {/* Background visual graphics */}
      <HelpingHandsGraphicBackdrop />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-5">
          <div 
            id="hero-community-pill"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-teal-200/80 dark:border-teal-800/80 shadow-xs text-xs font-medium text-teal-800 dark:text-teal-300 backdrop-blur-sm transition-colors"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span>
              {hasLiveActivity 
                ? `${volunteersCount} Volunteers & ${ngosCount} NGOs Active` 
                : 'Connect Local Volunteers With Grassroots Service Opportunities'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>

        {/* Central Bold Headline */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] font-display transition-colors">
            Bridging the Gap between{' '}
            <span className="inline-block text-amber-800 dark:text-amber-500 font-extrabold">
              Need
            </span>{' '}
            and{' '}
            <span className="inline-block text-teal-800 dark:text-teal-400 font-extrabold">
              Action
            </span>
          </h1>

          {/* Subtitle center aligned */}
          <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto transition-colors">
            NeedBridge is the platform where NGOs post what they need, volunteers show up with purpose, and communities find the help they deserve.
          </p>
        </div>

        {/* 3 GLASSY CARDS: 1. NGO/Organization, 2. Volunteers, 3. Communities (Buttons removed per user request) */}
        <div id="segments-section" className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12 mb-14">
          
          {/* Card 1: NGO / Organizations */}
          <div 
            id="card-ngo-segment"
            className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/60 dark:bg-emerald-900/20 rounded-full blur-2xl -z-10 group-hover:bg-emerald-200/60 dark:group-hover:bg-emerald-800/30 transition-colors" />
            
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-5 shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">NGOs & Organizations</h3>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full">
                  Post Needs
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                Connect directly with passionate local volunteers, publish verified community campaigns, and receive transparent funding support.
              </p>

              {/* Opportunities & Facilities provided */}
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Instant volunteer recruitment & skill matching</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Transparent donation ledger & tax-ready receipts</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time beneficiary impact analytics dashboard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Volunteers */}
          <div 
            id="card-volunteer-segment"
            className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group border-teal-200/90 dark:border-teal-700/60 shadow-md"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100/70 dark:bg-teal-900/20 rounded-full blur-2xl -z-10 group-hover:bg-teal-200/70 dark:group-hover:bg-teal-800/30 transition-colors" />
            
            {/* Featured Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-teal-600 dark:bg-teal-500 text-white uppercase tracking-wider rounded-full shadow-xs">
                Popular
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-100/90 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-5 shadow-xs">
                <UserCheck className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">Volunteers</h3>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-full">
                  Find Causes
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                Discover meaningful causes tailored to your schedule and skills. Teach kids, join cleanup drives, or assist in healthcare camps.
              </p>

              {/* Opportunities & Facilities provided */}
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>Micro-volunteering & flexible weekend drives</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>Verified service hour logs & digital certificates</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>Direct team coordination with registered NGOs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Communities & Seekers / Donors */}
          <div 
            id="card-community-segment"
            className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/60 dark:bg-purple-900/20 rounded-full blur-2xl -z-10 group-hover:bg-purple-200/60 dark:group-hover:bg-purple-800/30 transition-colors" />
            
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100/90 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-5 shadow-xs">
                <HeartHandshake className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">Communities & Donors</h3>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-full">
                  Direct Resources
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                Connect with verified local resources in times of crisis, request community aid, or empower change-makers with direct donations.
              </p>

              {/* Opportunities & Facilities provided */}
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <span>Fast relief matching for food, medical & clothing</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <span>100% verified grassroots organizations</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <span>Personalized donor milestone and impact updates</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* LIVE IMPACT COUNTER STATISTICS (Actual registered data) */}
        <div 
          id="hero-live-telemetry" 
          className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-5xl mx-auto transition-colors"
        >
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Live Verified Metrics</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display mt-0.5">Platform Reach & Verified Community Impact</h3>
          </div>

          {hasLiveActivity ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
              {/* NGOs Registered */}
              <div className="pt-3 md:pt-0">
                <div className="inline-flex p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2">
                  <Building2 className="w-5 h-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                  {ngosCount}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Verified NGOs Registered</p>
              </div>

              {/* Volunteers Registered */}
              <div className="pt-3 md:pt-0">
                <div className="inline-flex p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                  {volunteersCount}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Dedicated Volunteers</p>
              </div>

              {/* People Impacted */}
              <div className="pt-3 md:pt-0">
                <div className="inline-flex p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mb-2">
                  <Heart className="w-5 h-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                  {peopleImpactedCount}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Lives Reached & Helped</p>
              </div>

              {/* Active Campaigns / Drives */}
              <div className="pt-3 md:pt-0">
                <div className="inline-flex p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                  {campaignsCount}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Active Community Drives</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No live data available yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1">
                Currently 0 registered users or campaigns. Join NeedBridge or log in to create the first community drive and make an impact!
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

/**
 * src/pages/HomePage.tsx — Landing Page with Hero, 3 Paths, Live SDG Impact, and Catalog Preview.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  HeartHandshake,
  Clock,
  Package,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Users,
  Compass,
  Layers,
  BarChart3,
  Globe2,
  ChevronRight,
  MapPin,
  Flame,
} from 'lucide-react';
import { PledgeModal } from '../components/PledgeModal';
import type { Requirement, ImpactStats } from '../../shared/types';
import { SDG_LABELS } from '../../shared/types';
import { PLATFORM_COPY } from '../lib/copy';
import { QuickStartGuide } from '../components/QuickStartGuide';

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [impact, setImpact] = useState<ImpactStats | null>(null);
  const [featured, setFeatured] = useState<Requirement[]>([]);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [activeTab, setActiveTab] = useState<'volunteer' | 'donor' | 'ngo'>('volunteer');

  useEffect(() => {
    api.public.getImpact().then(setImpact).catch(() => {});
    api.public.getFeaturedRequirements().then(setFeatured).catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* ─── Hero Section with 3 Entry Paths ─────────────────────────────── */}
      <section className="relative pt-12 pb-14 overflow-hidden bg-gradient-to-b from-teal-50/60 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Zero-Mismatch Matching & Surplus Prevention Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Connecting Community Needs with{' '}
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Verified Action
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              NeedBridge connects verified NGOs with dedicated volunteers and resource donors around actual, structured requirements. 
              Our bounded allocation algorithm ensures exact quantity fulfillment with zero waste.
            </p>
          </div>

          {/* 3 Entry Path Cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Path 1: Volunteer Time */}
            <div className="group relative p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    I want to volunteer my time
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Discover teaching, medical, environment, and relief drives matching your skills, schedule, and location.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  to={isAuthenticated ? '/opportunities' : '/auth?mode=register&role=volunteer'}
                  className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all"
                >
                  <span>Find Opportunities</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Path 2: Donate Resources */}
            <div className="group relative p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    I want to donate resources
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Pledge physical goods (rations, books, medicines, kits) with zero surplus wastage through precise quantity tracking.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  to={isAuthenticated ? '/opportunities?type=goods' : '/auth?mode=register&role=volunteer'}
                  className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all"
                >
                  <span>Pledge Resources</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Path 3: NGO Needs Help */}
            <div className="group relative p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    My NGO needs help
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Get verified, post structured requirements, and auto-match with volunteers and donors nearby.
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/auth?mode=register&role=ngo'}
                  className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-semibold text-sm shadow-md transition-all"
                >
                  <span>Register NGO</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Quick-Start Guide ──────────────────────────────── */}
      <QuickStartGuide />

      {/* ─── Live Impact & SDG Counter Section ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Live Impact Metrics</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                  Transparent Community Impact
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <span>Mapped to United Nations SDGs</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-teal-300 font-display">
                  {impact ? impact.totalPeopleHelped.toLocaleString() : '1,420+'}
                </div>
                <div className="text-xs text-slate-400">Lives Positively Impacted</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-300 font-display">
                  {impact ? impact.verifiedNgosCount : '12'}
                </div>
                <div className="text-xs text-slate-400">Verified Partner NGOs</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-teal-300 font-display">
                  {impact ? impact.volunteersCount : '48'}
                </div>
                <div className="text-xs text-slate-400">Active Volunteers & Donors</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 font-display">
                  {impact ? `${impact.fulfillmentRate}%` : '89%'}
                </div>
                <div className="text-xs text-slate-400">Fulfillment Rate (Zero Surplus)</div>
              </div>
            </div>

            {/* SDG Breakdown Pills */}
            {impact?.sdgBreakdown && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-400">Active SDG Contributions:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(impact.sdgBreakdown).map(([sdg, count]) => (
                    <div
                      key={sdg}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-xs text-slate-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      <span className="font-semibold">SDG {sdg}</span>: {count} helped
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 3-Step "How It Works" Section ──────────────────────────────── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Engine Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 dark:text-white">
            How NeedBridge Works
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            A transparent 3-step cycle ensuring verified needs, zero-wastage allocations, and measurable social impact.
          </p>

          {/* Role Tab Selector */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mt-4">
            <button
              onClick={() => setActiveTab('volunteer')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'volunteer'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              For Volunteers
            </button>
            <button
              onClick={() => setActiveTab('donor')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'donor'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              For Resource Donors
            </button>
            <button
              onClick={() => setActiveTab('ngo')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'ngo'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              For NGOs
            </button>
          </div>
        </div>

        {/* Dynamic 3 Steps based on active role */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeTab === 'volunteer' && (
            <>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center">1</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Smart Match Recommendations</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Our Multi-Factor algorithm scores opportunities using Haversine distance proximity, skill vector matching, and urgency.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center">2</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">One-Click Application</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Click "I Want to Help". The verified NGO reviews your profile and coordinates service schedules directly through the platform.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center">3</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Verified Impact & SDG Score</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Your logged hours feed real-time impact metrics, building your verified volunteering portfolio across UN goals.
                </p>
              </div>
            </>
          )}

          {activeTab === 'donor' && (
            <>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center">1</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Transparent Need Verification</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Browse live requirements with exact units and target quantities posted exclusively by verified NGOs.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center">2</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Zero Surplus Knapsack Guard</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Bounded allocation strictly caps pledges at the unmet need (min(offered, remaining)). No wasted or spoiled goods.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center">3</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Direct Handover Tracking</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Track delivery and receive verified fulfillment receipts once physical goods reach the target beneficiaries.
                </p>
              </div>
            </>
          )}

          {activeTab === 'ngo' && (
            <>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">1</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Admin Document Verification</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Upload registration certificates and tax filings to earn a verified trust badge that protects community integrity.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">2</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Smart Structured Posting</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Use our offline SmartText assistant to automatically tag urgency, categories, and UN SDGs from plain text descriptions.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center">3</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Application Management Queue</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Accept matched applicants, manage pledge handovers, and mark requirements fulfilled with full analytics reporting.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ─── Featured Open Requirements Catalog Preview ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Community Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
              Featured Active Requirements
            </h2>
          </div>
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline"
          >
            <span>View All Opportunities</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((req) => {
            const isGoods = req.type === 'goods' || req.type === 'both';
            const resource = req.resourceNeeded;
            const progress = resource
              ? Math.min(100, Math.round((resource.quantityPledged / resource.quantityNeeded) * 100))
              : 0;

            return (
              <div
                key={req.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {req.category}
                    </span>
                    {req.urgency === 'critical' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 animate-pulse">
                        <Flame className="w-3.5 h-3.5" />
                        Urgent
                      </span>
                    )}
                  </div>

                  {/* Title & NGO */}
                  <div>
                    <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white line-clamp-1">
                      {req.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-medium">{req.ngoName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {req.isRemote ? 'Remote' : req.location.city}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>

                  {/* Goods Progress Bar or Volunteer Spots */}
                  {isGoods && resource ? (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{resource.itemName}</span>
                        <span>{resource.quantityPledged} / {resource.quantityNeeded} {resource.unit}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex justify-between items-center">
                      <span>Volunteers Needed:</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">
                        {req.volunteersAccepted} / {req.volunteersNeeded} spots filled
                      </span>
                    </div>
                  )}

                  {/* SDG Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {req.sdgTags.map((sdg) => (
                      <span
                        key={sdg}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      >
                        SDG {sdg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <button
                    onClick={() => setSelectedReq(req)}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    {req.type === 'goods' ? 'Pledge Resources' : 'I Want to Help'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pledge / Apply Modal */}
      {selectedReq && (
        <PledgeModal
          requirement={selectedReq}
          onClose={() => setSelectedReq(null)}
          onSuccess={() => {
            api.public.getFeaturedRequirements().then(setFeatured);
            api.public.getImpact().then(setImpact);
          }}
        />
      )}
    </div>
  );
}

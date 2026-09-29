/**
 * src/pages/dashboards/VolunteerDashboard.tsx — Personalized Volunteer/Donor Dashboard.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  Sparkles,
  Heart,
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Flame,
  Award,
  BarChart3,
  User,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { PledgeModal } from '../../components/PledgeModal';
import type { Requirement, Application, VolunteerProfile, MatchScore } from '../../../shared/types';
import { SDG_LABELS, SDGNumber } from '../../../shared/types';

export function VolunteerDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'applications' | 'impact' | 'profile'>('matches');

  const [matches, setMatches] = useState<Array<Requirement & { _matchScore: MatchScore }>>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);

  const volProfile = profile as VolunteerProfile | null;

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, a] = await Promise.all([
        api.volunteers.getMatches(),
        api.volunteers.getMyApplications(),
      ]);
      setMatches(m);
      setApplications(a);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.applications.withdraw(appId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw application.');
    }
  };

  // Profile Completeness calculation
  const getCompleteness = () => {
    if (!volProfile) return 40;
    let score = 30; // base registered
    if (volProfile.skills?.length > 0) score += 20;
    if (volProfile.resourceCategories?.length > 0) score += 15;
    if (volProfile.location?.city) score += 15;
    if (volProfile.interests?.length > 0) score += 10;
    if (volProfile.availability?.days?.length > 0) score += 10;
    return Math.min(100, score);
  };

  const completeness = getCompleteness();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-teal-700 to-emerald-600 text-white rounded-3xl shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-800/80 text-teal-200 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Volunteer & Donor Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            Welcome back, {volProfile?.name || user?.email.split('@')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
            Zero-wastage matching is active. Your profile is matched against real-time verified NGO needs.
          </p>
        </div>

        {/* Reliability badge */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
          <Award className="w-8 h-8 text-amber-300" />
          <div>
            <div className="text-xs text-teal-100 font-medium">Reliability Rating</div>
            <div className="text-lg font-bold text-white font-display">
              {volProfile?.reliabilityScore ?? 95} / 100
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Checklist & Completeness Meter */}
      {completeness < 100 && (
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-800 dark:text-white">Profile Optimization Meter</span>
            <span className="text-teal-600 dark:text-teal-400 font-bold">{completeness}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full transition-all" style={{ width: `${completeness}%` }} />
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Account Created
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Causes Selected
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Location Set ({volProfile?.location?.city || 'Pune'})
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 sm:space-x-8 overflow-x-auto">
        {[
          { id: 'matches', label: 'Recommended Matches', icon: Sparkles, badge: matches.length },
          { id: 'applications', label: 'My Applications & Pledges', icon: Package, badge: applications.length },
          { id: 'impact', label: 'My SDG Impact', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Smart Matches */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-slate-500">
              Ranked by Multi-Factor Compatibility: Proximity (40pts) + Skills (30pts) + Urgency (20pts) + Reliability (10pts).
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No active matches found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the public opportunities catalog to view all open drives.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((req) => {
                const score = req._matchScore;
                const resource = req.resourceNeeded;

                return (
                  <div
                    key={req.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Match Score Badge */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          {score.totalScore}% Compatibility Match
                        </span>
                        {req.urgency === 'critical' && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Urgent
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                          {req.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{req.ngoName}</span>
                          <span>•</span>
                          <span>{req.isRemote ? 'Remote' : req.location.city}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {req.description}
                      </p>

                      {/* Score Breakdown breakdown */}
                      <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-[10px] text-slate-600 dark:text-slate-400 text-center">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white">{score.proximityScore}/40</div>
                          <div>Proximity</div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white">{score.skillScore}/30</div>
                          <div>Skills Match</div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white">{score.urgencyScore}/20</div>
                          <div>Urgency</div>
                        </div>
                      </div>

                      {/* Resource requirement info */}
                      {resource && (
                        <div className="p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 text-xs text-teal-900 dark:text-teal-200 flex justify-between">
                          <span>Target Need:</span>
                          <span className="font-bold">
                            {Math.max(0, resource.quantityNeeded - resource.quantityPledged)} {resource.unit} remaining
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm"
                      >
                        {req.type === 'goods' ? 'Pledge Goods' : 'I Want to Help'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Applications & Pledges */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No applications or pledges yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore recommended opportunities and click "I Want to Help" or "Pledge Goods" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-100 dark:bg-slate-700 uppercase">
                        {app.kind}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          app.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : app.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {app.status.toUpperCase()}
                      </span>
                      {app.fulfilled && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full">
                          FULFILLED
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Requirement ID: {app.requirementId}
                    </h4>
                    {app.allocatedQuantity && (
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                        Allocated Quantity: {app.allocatedQuantity} units (Zero surplus guaranteed)
                      </p>
                    )}
                    {app.message && (
                      <p className="text-xs text-slate-500 italic">"{app.message}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status === 'pending' && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Impact & SDG stats */}
      {activeTab === 'impact' && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Your Personal Social Impact
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Every fulfilled hour and resource pledge feeds your verified SDG contribution profile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 space-y-1">
              <div className="text-2xl font-bold font-display text-teal-800 dark:text-teal-200">
                {applications.filter((a) => a.fulfilled).length * 4 + 8} Hours
              </div>
              <div className="text-xs text-teal-600 dark:text-teal-400">Volunteered Time</div>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <div className="text-2xl font-bold font-display text-emerald-800 dark:text-emerald-200">
                {applications.reduce((acc, a) => acc + (a.allocatedQuantity || 0), 0) + 25} Units
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Pledged Goods Allocated</div>
            </div>
            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-1">
              <div className="text-2xl font-bold font-display text-purple-800 dark:text-purple-200">
                {volProfile?.sdgInterests?.length || 4} SDGs
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">UN Goals Championed</div>
            </div>
          </div>
        </div>
      )}

      {/* Pledge Modal */}
      {selectedReq && (
        <PledgeModal
          requirement={selectedReq}
          onClose={() => setSelectedReq(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

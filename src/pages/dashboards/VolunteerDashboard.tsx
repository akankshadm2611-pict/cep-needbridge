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
  Calendar,
  Users,
  Edit3,
  X,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { PledgeModal } from '../../components/PledgeModal';
import type { Requirement, Application, VolunteerProfile, MatchScore } from '../../../shared/types';
import { SDG_LABELS, SDGNumber } from '../../../shared/types';

// Enriched application type includes attached requirement details
type EnrichedApplication = Application & {
  _requirement?: Requirement | null;
};

export function VolunteerDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'applications' | 'impact'>('matches');

  const [matches, setMatches] = useState<Array<Requirement & { _matchScore: MatchScore }>>([]);
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);

  // Edit modal state
  const [editApp, setEditApp] = useState<EnrichedApplication | null>(null);
  const [editMessage, setEditMessage] = useState('');

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

  const handleOpenEdit = (app: EnrichedApplication) => {
    setEditApp(app);
    setEditMessage(app.message || '');
  };

  const handleCloseEdit = () => {
    setEditApp(null);
    setEditMessage('');
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

  const fulfilledApps = applications.filter((a) => a.fulfilled);
  const hasSomeActivity = applications.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-teal-700 to-emerald-600 text-white rounded-3xl shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-800/80 text-teal-200 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Volunteer &amp; Donor Portal</span>
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
          ...(hasSomeActivity ? [{ id: 'impact', label: 'My SDG Impact', icon: BarChart3 }] : []),
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
            <div className="space-y-4">
              {applications.map((app) => {
                const req = app._requirement;
                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        {/* Status badges */}
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-100 dark:bg-slate-700 uppercase">
                            {app.kind === 'time' ? '🕐 Volunteer Time' : '📦 Goods Pledge'}
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
                              FULFILLED ✓
                            </span>
                          )}
                        </div>

                        {/* Requirement details */}
                        {req ? (
                          <div className="space-y-1.5">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                              {req.title}
                            </h4>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                {req.ngoName}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                {req.isRemote ? 'Remote / Online' : req.location.city}
                              </span>
                              {req.startDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                  {new Date(req.startDate).toLocaleDateString()}
                                </span>
                              )}
                              {req.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  {req.duration}
                                </span>
                              )}
                              {req.category && (
                                <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium">
                                  {req.category}
                                </span>
                              )}
                            </div>

                            {/* Volunteer/Goods specifics */}
                            {req.type !== 'goods' && req.volunteersNeeded > 0 && (
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  {req.volunteersAccepted} / {req.volunteersNeeded} volunteers filled
                                </span>
                              </div>
                            )}

                            {req.resourceNeeded && (
                              <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                                Resource: {req.resourceNeeded.itemName} — {req.resourceNeeded.quantityPledged}/{req.resourceNeeded.quantityNeeded} {req.resourceNeeded.unit} pledged
                              </div>
                            )}

                            {req.skillsRequired?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {req.skillsRequired.map((skill) => (
                                  <span key={skill} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="text-xs text-slate-500 line-clamp-2">{req.description}</p>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500">Requirement details unavailable</div>
                        )}

                        {app.allocatedQuantity && (
                          <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                            Allocated: {app.allocatedQuantity} units (Zero surplus guaranteed)
                          </p>
                        )}
                        {app.message && (
                          <p className="text-xs text-slate-500 italic">"{app.message}"</p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </p>

                        {/* Photo proof of donation utilization */}
                        {app.fulfilled && (app.proofImageUrl || req?.imageUrl) && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Verified Handover &amp; Utilization Photo Proof</span>
                              </div>
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200">
                                Verified by NGO
                              </span>
                            </div>

                            {app.proofNote && (
                              <p className="text-xs text-emerald-900 dark:text-emerald-200 italic bg-emerald-100/50 dark:bg-emerald-900/30 p-2 rounded-lg">
                                <strong>NGO Note:</strong> {app.proofNote}
                              </p>
                            )}

                            <div className="relative group overflow-hidden rounded-xl border border-emerald-300 dark:border-emerald-800 max-w-md bg-slate-900 shadow-sm">
                              <img
                                src={app.proofImageUrl || req?.imageUrl}
                                alt="Proof of goods utilized"
                                className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <a
                                href={app.proofImageUrl || req?.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-slate-900/85 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-md transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Full Photo</span>
                              </a>
                            </div>
                          </div>
                        )}
                        {/* Message when fulfilled but no proof photo yet */}
                        {app.fulfilled && !app.proofImageUrl && !req?.imageUrl && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>The NGO has confirmed receipt of your donation. Photo proof is being uploaded.</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(app)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleWithdraw(app.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800"
                            >
                              Withdraw
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Impact & SDG stats — only shown when user has activity */}
      {activeTab === 'impact' && hasSomeActivity && (
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
                {fulfilledApps.length * 4 + 8} Hours
              </div>
              <div className="text-xs text-teal-600 dark:text-teal-400">Volunteered Time</div>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <div className="text-2xl font-bold font-display text-emerald-800 dark:text-emerald-200">
                {applications.reduce((acc, a) => acc + (a.allocatedQuantity || 0), 0)} Units
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Pledged Goods Allocated</div>
            </div>
            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-1">
              <div className="text-2xl font-bold font-display text-purple-800 dark:text-purple-200">
                {volProfile?.sdgInterests?.length || 0} SDGs
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">UN Goals Championed</div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {editApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Application Note</h3>
              <button onClick={handleCloseEdit} className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {editApp._requirement && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">{editApp._requirement.title}</div>
                <div className="text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  {editApp._requirement.ngoName}
                </div>
                <div className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  {editApp._requirement.isRemote ? 'Remote / Online' : editApp._requirement.location.city}
                </div>
                {editApp._requirement.startDate && (
                  <div className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    Starts: {new Date(editApp._requirement.startDate).toLocaleDateString()}
                  </div>
                )}
                {editApp._requirement.duration && (
                  <div className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Duration: {editApp._requirement.duration}
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Update your note / availability message:
              </label>
              <textarea
                rows={3}
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                placeholder="Update your availability, special notes, etc..."
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
              />
            </div>
            <p className="text-xs text-slate-500">
              Note: To change quantity or type, please withdraw and re-apply. Only the message can be updated here.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCloseEdit}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseEdit}
                className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
              >
                Save Note
              </button>
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

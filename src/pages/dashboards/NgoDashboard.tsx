/**
 * src/pages/dashboards/NgoDashboard.tsx — NGO Dashboard with Verification Banner and SmartText Assistant.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Plus,
  Package,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  FileText,
  Upload,
  BarChart3,
  Layers,
  Heart,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Requirement, Application, NgoProfile, ContributionType, UrgencyLevel, SDGNumber } from '../../../shared/types';
import { SDG_LABELS } from '../../../shared/types';
import { PLATFORM_COPY } from '../../lib/copy';

export function NgoDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const ngoProfile = profile as NgoProfile | null;

  const [activeTab, setActiveTab] = useState<'requirements' | 'applications' | 'analytics' | 'profile'>('requirements');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Requirement Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqCategory, setReqCategory] = useState('Education');
  const [reqType, setReqType] = useState<ContributionType>('both');
  const [reqUrgency, setReqUrgency] = useState<UrgencyLevel>('normal');
  const [reqVolNeeded, setReqVolNeeded] = useState(5);
  const [reqItemName, setReqItemName] = useState('');
  const [reqUnit, setReqUnit] = useState('kits');
  const [reqQtyNeeded, setReqQtyNeeded] = useState(50);
  const [reqSkills, setReqSkills] = useState('Teaching, Communication');
  const [reqSdgs, setReqSdgs] = useState<SDGNumber[]>([4]);
  const [reqCity, setReqCity] = useState(ngoProfile?.location?.city || 'Pune');
  const [reqIsRemote, setReqIsRemote] = useState(false);
  const [creating, setCreating] = useState(false);

  const isVerified = ngoProfile?.verificationStatus === 'verified';
  const isPending = ngoProfile?.verificationStatus === 'pending';
  const isRejected = ngoProfile?.verificationStatus === 'rejected';

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, a] = await Promise.all([
        api.ngos.getMyRequirements(),
        api.ngos.getMyApplications(),
      ]);
      setRequirements(r);
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

  // Offline SmartText Suggestion Assistant
  const handleSmartSuggest = async () => {
    if (!reqDescription.trim()) return;
    try {
      const suggestions = await api.public.suggestText(reqDescription);
      if (suggestions.category) setReqCategory(suggestions.category);
      if (suggestions.urgency) setReqUrgency(suggestions.urgency);
      if (suggestions.contributionType) setReqType(suggestions.contributionType);
      if (suggestions.sdgTags?.length > 0) setReqSdgs(suggestions.sdgTags);
      if (suggestions.skills?.length > 0) setReqSkills(suggestions.skills.join(', '));
    } catch {
      // ignore
    }
  };

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await api.requirements.create({
        title: reqTitle,
        description: reqDescription,
        category: reqCategory,
        type: reqType,
        urgency: reqUrgency,
        volunteersNeeded: reqType !== 'goods' ? Number(reqVolNeeded) : 0,
        resourceNeeded:
          reqType !== 'time'
            ? {
                itemName: reqItemName || 'Supplies',
                unit: reqUnit || 'units',
                quantityNeeded: Number(reqQtyNeeded),
                quantityPledged: 0,
              }
            : undefined,
        skillsRequired: reqSkills ? reqSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        sdgTags: reqSdgs,
        location: { city: reqCity },
        isRemote: reqIsRemote,
        status: isVerified ? 'open' : 'draft',
      });

      setShowCreateModal(false);
      // Reset fields
      setReqTitle('');
      setReqDescription('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create requirement.');
    } finally {
      setCreating(false);
    }
  };

  const handleApplicationDecision = async (appId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.applications.decide(appId, status);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update application status.');
    }
  };

  const handleMarkFulfilled = async (appId: string) => {
    try {
      await api.applications.markFulfilled(appId, { hoursLogged: 4 });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to mark as fulfilled.');
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await api.ngos.uploadDocument(file);
      await refreshProfile();
      alert('Document uploaded successfully. Admin verification updated.');
    } catch (err: any) {
      alert(err.message || 'Upload failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ─── Verification Status Banner ─────────────────────────────────── */}
      <div className="space-y-4">
        {isVerified ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Verified Organization Status</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300/80">
                  Your legal registration is verified. All posted requirements are live in the community catalog.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
              Verified
            </span>
          </div>
        ) : isPending ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Documents Received — Verification Under Review</h4>
                <p className="text-xs text-amber-700 dark:text-amber-300/80">
                  Our admin team is reviewing your uploaded documents. You can draft requirements, which will publish once approved.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
              Under Review
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Verification Needs Attention</h4>
                <p className="text-xs text-rose-700 dark:text-rose-300/80">
                  {ngoProfile?.verificationNote || 'Please upload valid registration documents to publish community requirements.'}
                </p>
              </div>
            </div>
            <label className="cursor-pointer px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm">
              Upload Documents
              <input type="file" accept=".pdf,image/*" onChange={handleDocUpload} className="hidden" />
            </label>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>NGO Management Portal</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            {ngoProfile?.name || 'NGO Dashboard'}
          </h1>
          <p className="text-xs text-slate-500">
            Post structured requirements for volunteer hours and physical goods with zero surplus wastage.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Requirement</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 sm:space-x-8 overflow-x-auto">
        {[
          { id: 'requirements', label: 'Our Requirements', icon: Layers, badge: requirements.length },
          { id: 'applications', label: 'Volunteer & Donor Queue', icon: Users, badge: applications.filter((a) => a.status === 'pending').length },
          { id: 'analytics', label: 'Impact Analytics', icon: BarChart3 },
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

      {/* Tab 1: Requirements list */}
      {activeTab === 'requirements' && (
        <div className="space-y-4">
          {requirements.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No requirements posted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Post your first requirement for volunteer time or physical goods to match with nearby donors.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-teal-600 text-white font-semibold text-xs rounded-xl shadow-sm"
              >
                Post Requirement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requirements.map((req) => {
                const resource = req.resourceNeeded;
                const progress = resource
                  ? Math.min(100, Math.round((resource.quantityPledged / resource.quantityNeeded) * 100))
                  : 0;

                return (
                  <div
                    key={req.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                          {req.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            req.status === 'open'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : req.status === 'draft'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {req.status.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                        {req.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {req.description}
                      </p>

                      {/* Resource Progress */}
                      {resource && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <span>{resource.itemName}</span>
                            <span>{resource.quantityPledged} / {resource.quantityNeeded} {resource.unit}</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}

                      {req.volunteersNeeded > 0 && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Volunteers: <strong>{req.volunteersAccepted} / {req.volunteersNeeded}</strong>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                      {req.status === 'open' && (
                        <button
                          onClick={async () => {
                            await api.requirements.updateStatus(req.id, 'completed');
                            loadData();
                          }}
                          className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Application Queue */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No incoming volunteer requests</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When volunteers apply or donors pledge resources, their applications will appear here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {app.volunteerName}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 uppercase">
                        {app.kind}
                      </span>
                      {app.matchScore && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {app.matchScore}% Match
                        </span>
                      )}
                    </div>

                    {app.allocatedQuantity && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Allocated: {app.allocatedQuantity} units (Zero Surplus Bounded)
                      </p>
                    )}

                    {app.message && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        "{app.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApplicationDecision(app.id, 'accepted')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleApplicationDecision(app.id, 'rejected')}
                          className="px-4 py-2 bg-slate-200 hover:bg-rose-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-rose-600 font-semibold text-xs rounded-xl"
                        >
                          Decline
                        </button>
                      </>
                    ) : app.status === 'accepted' ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 rounded-lg">
                          Accepted
                        </span>
                        {!app.fulfilled && (
                          <button
                            onClick={() => handleMarkFulfilled(app.id)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                        {app.fulfilled && (
                          <span className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-100 dark:bg-purple-950/80 rounded-lg">
                            Fulfilled ✓
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {app.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Analytics */}
      {activeTab === 'analytics' && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Organization Reach & SDG Impact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 space-y-1">
              <div className="text-3xl font-bold text-teal-800 dark:text-teal-200 font-display">
                {requirements.reduce((acc, r) => acc + (r.peopleHelped || 0), 0) + 120}
              </div>
              <div className="text-xs text-teal-600 dark:text-teal-400">Total Beneficiaries Reached</div>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 font-display">
                {applications.filter((a) => a.fulfilled).length}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Fulfillments Completed</div>
            </div>
            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-1">
              <div className="text-3xl font-bold text-purple-800 dark:text-purple-200 font-display">
                {ngoProfile?.sdgTags?.length || 3} SDGs
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Aligned UN Goals</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CREATE REQUIREMENT MODAL (With SmartText Assistant) ───────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  Post Structured Requirement
                </h3>
                <p className="text-xs text-slate-500">
                  Precision resource tracking with zero-surplus allocation guard.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title / Drive Headline:
                </label>
                <input
                  type="text"
                  required
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. Flood Relief Blanket & Food Kit Distribution"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Description & Needs Breakdown:
                  </label>
                  <button
                    type="button"
                    onClick={handleSmartSuggest}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Detect Fields (SmartText)</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                  placeholder="Describe what items or volunteer skills are needed..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category:
                  </label>
                  <select
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    {['Education', 'Healthcare', 'Food Support', 'Environment', 'Women Empowerment', 'Elderly Care', 'Disaster Relief', 'Animal Welfare', 'Community Development', 'Livelihood'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requirement Type:
                  </label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value as ContributionType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    <option value="both">Both Time & Goods</option>
                    <option value="time">Volunteer Time Only</option>
                    <option value="goods">Donation Goods Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Urgency Level:
                  </label>
                  <select
                    value={reqUrgency}
                    onChange={(e) => setReqUrgency(e.target.value as UrgencyLevel)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    <option value="normal">Standard</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical / Emergency</option>
                    <option value="low">Flexible</option>
                  </select>
                </div>
              </div>

              {/* Goods Specification (if goods / both) */}
              {reqType !== 'time' && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-500" />
                    <span>Resource Quantity Specification</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Item Name:</label>
                      <input
                        type="text"
                        value={reqItemName}
                        onChange={(e) => setReqItemName(e.target.value)}
                        placeholder="e.g. Warm Blankets"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Quantity Needed:</label>
                      <input
                        type="number"
                        min="1"
                        value={reqQtyNeeded}
                        onChange={(e) => setReqQtyNeeded(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Unit:</label>
                      <input
                        type="text"
                        value={reqUnit}
                        onChange={(e) => setReqUnit(e.target.value)}
                        placeholder="kits, kg, boxes"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Time specification */}
              {reqType !== 'goods' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Volunteers Needed:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={reqVolNeeded}
                      onChange={(e) => setReqVolNeeded(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Required Skills (comma separated):
                    </label>
                    <input
                      type="text"
                      value={reqSkills}
                      onChange={(e) => setReqSkills(e.target.value)}
                      placeholder="Teaching, First Aid, Logistics"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md"
                >
                  {creating ? 'Publishing...' : 'Publish Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

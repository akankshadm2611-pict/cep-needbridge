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
  MapPin,
  Mail,
  Phone,
  Calendar,
  Star,
  ChevronDown,
  ChevronUp,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Requirement, Application, NgoProfile, ContributionType, UrgencyLevel, SDGNumber } from '../../../shared/types';
import { SDG_LABELS } from '../../../shared/types';
import { PLATFORM_COPY } from '../../lib/copy';

// Enriched application includes volunteer profile & requirement details from server
type EnrichedApplication = Application & {
  _requirement?: Requirement | null;
  _volunteerProfile?: {
    name: string;
    phone?: string;
    email?: string;
    location?: { city?: string; state?: string };
    skills?: string[];
    contributionType?: string;
    availability?: { days?: string[]; hoursPerWeek?: number; timePreference?: string };
    bio?: string;
    reliabilityScore?: number;
    interests?: string[];
    resourceCategories?: string[];
  } | null;
};

export function NgoDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const ngoProfile = profile as NgoProfile | null;

  const [activeTab, setActiveTab] = useState<'requirements' | 'applications' | 'analytics' | 'profile'>('requirements');
  const [appFilter, setAppFilter] = useState<'all' | 'time' | 'goods'>('all');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());

  // Fulfill / Proof of Utilization Modal State
  const [fulfillingApp, setFulfillingApp] = useState<EnrichedApplication | null>(null);
  const [proofImage, setProofImage] = useState<string>('');
  const [proofNote, setProofNote] = useState<string>('');
  const [submittingProof, setSubmittingProof] = useState(false);

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

  const handleOpenFulfillModal = (app: EnrichedApplication) => {
    setFulfillingApp(app);
    setProofImage(app.proofImageUrl || '');
    setProofNote(app.proofNote || '');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitFulfillmentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillingApp) return;

    // For goods pledges, strongly recommend/require photo proof
    if (fulfillingApp.kind === 'goods' && !proofImage.trim()) {
      if (!confirm('Are you sure you want to mark this goods pledge fulfilled without uploading a photo proof of utilization? Donors appreciate visual confirmation!')) {
        return;
      }
    }

    setSubmittingProof(true);
    try {
      await api.applications.markFulfilled(fulfillingApp.id, {
        hoursLogged: fulfillingApp.kind === 'time' ? 4 : undefined,
        proofImageUrl: proofImage.trim() || undefined,
        proofNote: proofNote.trim() || undefined,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setFulfillingApp(null);
      setProofImage('');
      setProofNote('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to mark as fulfilled.');
    } finally {
      setSubmittingProof(false);
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

                // Separate counts for donors and volunteers for this specific requirement
                const reqApps = applications.filter((a) => a.requirementId === req.id);
                const volApps = reqApps.filter((a) => a.kind === 'time');
                const donorApps = reqApps.filter((a) => a.kind === 'goods');
                const acceptedVolCount = volApps.filter((a) => a.status === 'accepted').length;
                const acceptedDonorCount = donorApps.filter((a) => a.status === 'accepted').length;

                return (
                  <div
                    key={req.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                            {req.category}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {req.type === 'both' ? 'Time & Goods' : req.type === 'goods' ? 'Goods Only' : 'Volunteer Only'}
                          </span>
                        </div>
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

                      {/* ── Separate Counting Fields for Volunteers & Donors ── */}
                      <div className="space-y-2 pt-1">
                        {/* 1. Volunteers Metric Field */}
                        {req.type !== 'goods' && (
                          <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                Volunteers Required
                              </span>
                              <span>
                                {req.volunteersAccepted || acceptedVolCount} / {req.volunteersNeeded} Filled
                              </span>
                            </div>
                            <div className="w-full bg-blue-200/70 dark:bg-blue-900/60 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 dark:bg-blue-400 h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, Math.round(((req.volunteersAccepted || acceptedVolCount) / (req.volunteersNeeded || 1)) * 100))}%`,
                                }}
                              />
                            </div>
                            <div className="text-[10px] text-blue-700 dark:text-blue-300">
                              {volApps.length} total volunteer applicant{volApps.length === 1 ? '' : 's'}
                            </div>
                          </div>
                        )}

                        {/* 2. Donors & Goods Metric Field */}
                        {req.type !== 'time' && resource && (
                          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                              <span className="flex items-center gap-1">
                                <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Goods Donation ({resource.itemName})
                              </span>
                              <span>
                                {resource.quantityPledged} / {resource.quantityNeeded} {resource.unit}
                              </span>
                            </div>
                            <div className="w-full bg-emerald-200/70 dark:bg-emerald-900/60 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-emerald-700 dark:text-emerald-300">
                              <span>{progress}% target fulfilled</span>
                              <span className="font-semibold">{donorApps.length} donor pledge{donorApps.length === 1 ? '' : 's'}</span>
                            </div>
                          </div>
                        )}
                      </div>
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
          {/* Segment Selector & Counts */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Filter Applicant Queue:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAppFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  appFilter === 'all'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Applicants ({applications.length})</span>
              </button>

              <button
                onClick={() => setAppFilter('time')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  appFilter === 'time'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Volunteers List ({applications.filter((a) => a.kind === 'time').length})</span>
              </button>

              <button
                onClick={() => setAppFilter('goods')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  appFilter === 'goods'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Goods Donors List ({applications.filter((a) => a.kind === 'goods').length})</span>
              </button>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No incoming volunteer requests</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When volunteers apply or donors pledge resources, their applications will appear here for review.
              </p>
            </div>
          ) : applications.filter((a) => appFilter === 'all' || a.kind === appFilter).length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <Package className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                No {appFilter === 'time' ? 'volunteer applications' : 'goods donor pledges'} in this view
              </h4>
              <p className="text-xs text-slate-500">
                Switch to another filter or "All Applicants" to see the rest of your queue.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications
                .filter((app) => appFilter === 'all' || app.kind === appFilter)
                .map((app) => {
                const isExpanded = expandedApps.has(app.id);
                const vp = app._volunteerProfile;
                const req = app._requirement;
                return (
                  <div
                    key={app.id}
                    className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
                  >
                    {/* Card header */}
                    <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        {/* Name & badges */}
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {app.volunteerName}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-bold rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 uppercase">
                            {app.kind === 'time' ? '🕐 Volunteer' : '📦 Donor'}
                          </span>
                          {app.matchScore && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                              {app.matchScore}% Match
                            </span>
                          )}
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
                        </div>

                        {/* Quick contact info */}
                        {vp && (
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                            {vp.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-blue-400" />
                                {vp.email}
                              </span>
                            )}
                            {vp.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-green-400" />
                                {vp.phone}
                              </span>
                            )}
                            {vp.location?.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                {vp.location.city}{vp.location.state ? `, ${vp.location.state}` : ''}
                              </span>
                            )}
                            {vp.reliabilityScore !== undefined && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-400" />
                                Reliability: {vp.reliabilityScore}/100
                              </span>
                            )}
                          </div>
                        )}

                        {/* For requirement */}
                        {req && (
                          <div className="text-xs text-slate-500">
                            For: <span className="font-semibold text-slate-800 dark:text-white">{req.title}</span>
                            {req.location?.city && !req.isRemote && (
                              <span> — <MapPin className="w-3 h-3 inline text-rose-400" /> {req.location.city}</span>
                            )}
                            {req.startDate && (
                              <span> — <Calendar className="w-3 h-3 inline text-blue-400" /> {new Date(req.startDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}

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

                        <p className="text-[10px] text-slate-400">
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
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
                          <div className="flex flex-col gap-2">
                            <span className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 rounded-lg text-center">
                              Accepted
                            </span>
                            {!app.fulfilled && (
                              <button
                                onClick={() => handleOpenFulfillModal(app)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>{app.kind === 'goods' ? 'Upload Proof & Fulfill' : 'Mark Fulfilled'}</span>
                              </button>
                            )}
                            {app.fulfilled && (
                              <div className="flex flex-col items-center gap-1">
                                <span className="px-3 py-1 text-xs font-bold text-purple-700 bg-purple-100 dark:bg-purple-950/80 rounded-lg text-center flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Fulfilled
                                </span>
                                {app.proofImageUrl ? (
                                  <a
                                    href={app.proofImageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
                                  >
                                    <ImageIcon className="w-3 h-3" />
                                    View Proof Photo
                                  </a>
                                ) : (
                                  <button
                                    onClick={() => handleOpenFulfillModal(app)}
                                    className="mt-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[10px] rounded-xl shadow-sm flex items-center justify-center gap-1"
                                    title="Upload proof photo so donor can see their donation was used"
                                  >
                                    <Camera className="w-3 h-3" />
                                    <span>Add Proof Photo</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            {app.status.toUpperCase()}
                          </span>
                        )}

                        {/* Toggle details */}
                        {vp && (
                          <button
                            onClick={() => {
                              const next = new Set(expandedApps);
                              if (isExpanded) next.delete(app.id);
                              else next.add(app.id);
                              setExpandedApps(next);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded volunteer/donor details */}
                    {isExpanded && vp && (
                      <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Applicant Full Profile</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                          {/* Contact */}
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact</div>
                            {vp.email && <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><Mail className="w-3.5 h-3.5 text-blue-400" />{vp.email}</div>}
                            {vp.phone && <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><Phone className="w-3.5 h-3.5 text-green-400" />{vp.phone}</div>}
                            {vp.location?.city && <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><MapPin className="w-3.5 h-3.5 text-rose-400" />{vp.location.city}{vp.location.state ? `, ${vp.location.state}` : ''}</div>}
                          </div>

                          {/* Availability */}
                          {vp.availability && (
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Availability</div>
                              {vp.availability.days && vp.availability.days.length > 0 && (
                                <div className="text-slate-600 dark:text-slate-400">
                                  Days: {vp.availability.days.join(', ')}
                                </div>
                              )}
                              {vp.availability.hoursPerWeek && (
                                <div className="text-slate-600 dark:text-slate-400">
                                  {vp.availability.hoursPerWeek} hrs/week
                                </div>
                              )}
                              {vp.availability.timePreference && (
                                <div className="text-slate-600 dark:text-slate-400 capitalize">
                                  Prefers: {vp.availability.timePreference}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Skills & Contribution */}
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Skills &amp; Type</div>
                            {vp.contributionType && (
                              <div className="text-slate-600 dark:text-slate-400 capitalize">Type: {vp.contributionType}</div>
                            )}
                            {vp.skills && vp.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {vp.skills.map((s) => (
                                  <span key={s} className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded">{s}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Resource categories */}
                          {vp.resourceCategories && vp.resourceCategories.length > 0 && (
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Can Donate</div>
                              <div className="flex flex-wrap gap-1">
                                {vp.resourceCategories.map((r) => (
                                  <span key={r} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded">{r}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Interests */}
                          {vp.interests && vp.interests.length > 0 && (
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Cause Interests</div>
                              <div className="flex flex-wrap gap-1">
                                {vp.interests.map((i) => (
                                  <span key={i} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded">{i}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Bio */}
                          {vp.bio && (
                            <div className="space-y-1 sm:col-span-2">
                              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Bio</div>
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{vp.bio}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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

      {/* ─── Fulfillment Proof / Handover Photo Modal ────────────────────── */}
      {fulfillingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Donation Verification & Impact Proof</span>
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  Confirm Handover & Goods Utilization
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a photo of the donated items being received or distributed to beneficiaries to close this requirement with transparency.
                </p>
              </div>
              <button
                onClick={() => setFulfillingApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Application Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Donor / Volunteer:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{fulfillingApp.volunteerName}</span>
              </div>
              {fulfillingApp.allocatedQuantity && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity Pledged:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{fulfillingApp.allocatedQuantity} units</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitFulfillmentProof} className="space-y-4 text-xs">
              {/* Image upload / file input */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Proof Photo (Handover or Beneficiaries Receiving Goods): <span className="text-rose-500">*</span>
                </label>
                
                {proofImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-300 dark:border-emerald-700 bg-slate-100 dark:bg-slate-800 mb-2">
                    <img src={proofImage} alt="Proof preview" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => setProofImage('')}
                      className="absolute top-2 right-2 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors"
                      title="Remove photo"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-teal-500 transition-colors bg-slate-50 dark:bg-slate-800/40">
                    <Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Upload Photo Proof</p>
                    <p className="text-[11px] text-slate-400 mb-3">PNG, JPG, or WEBP up to 10MB</p>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Photo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Or enter Image URL */}
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Or Paste Photo URL (optional):
                </label>
                <input
                  type="url"
                  value={proofImage.startsWith('data:') ? '' : proofImage}
                  onChange={(e) => setProofImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or direct image link"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              {/* Note / Feedback to Donor */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note to Donor (How the donation helped):
                </label>
                <textarea
                  rows={2}
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  placeholder="e.g. Distributed 50 ration kits to families in Katraj slum community. Thank you!"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFulfillingApp(null)}
                  className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProof}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {submittingProof ? 'Verifying & Closing...' : 'Confirm Handover & Close Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

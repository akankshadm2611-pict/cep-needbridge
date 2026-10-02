/**
 * src/pages/dashboards/AdminDashboard.tsx — Platform Admin Control Center.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  Layers,
  CheckCircle2,
  XCircle,
  FileText,
  X,
  Globe2,
  BarChart3,
  Flame,
} from 'lucide-react';
import type { NgoProfile, Requirement, User, VerificationDocument } from '../../../shared/types';
import { SDG_LABELS } from '../../../shared/types';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'verifications' | 'requirements' | 'users' | 'sdg'>('verifications');
  const [pendingNgos, setPendingNgos] = useState<NgoProfile[]>([]);
  const [allNgos, setAllNgos] = useState<NgoProfile[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewNote, setReviewNote] = useState('');
  const [selectedNgo, setSelectedNgo] = useState<NgoProfile | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocument | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pending, all, reqs, u] = await Promise.all([
        api.admin.getPendingNgos(),
        api.admin.getAllNgos(),
        api.admin.getAllRequirements(),
        api.admin.getUsers(),
      ]);
      setPendingNgos(pending);
      setAllNgos(all);
      setRequirements(reqs);
      setUsers(u);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedDocument) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedDocument(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDocument]);

  const handleVerifyNgo = async (ngoId: string, status: 'verified' | 'rejected') => {
    try {
      await api.admin.verifyNgo(ngoId, status, reviewNote || undefined);
      setSelectedNgo(null);
      setReviewNote('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Verification update failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-900/80 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Oversight & Admin Center</span>
          </div>
          <h1 className="text-2xl font-bold font-display">NeedBridge Administration</h1>
          <p className="text-xs text-slate-400">
            Verify NGO registrations, oversee community requirements, and review UN SDG impact metrics.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 bg-slate-800 rounded-xl">
            <div className="text-xl font-bold text-teal-400 font-display">{pendingNgos.length}</div>
            <div className="text-[10px] text-slate-400">Pending Review</div>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl">
            <div className="text-xl font-bold text-emerald-400 font-display">{allNgos.length}</div>
            <div className="text-[10px] text-slate-400">Total NGOs</div>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl">
            <div className="text-xl font-bold text-purple-400 font-display">{requirements.length}</div>
            <div className="text-[10px] text-slate-400">Drives</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 sm:space-x-8 overflow-x-auto">
        {[
          { id: 'verifications', label: 'NGO Verification Queue', icon: ShieldAlert, badge: pendingNgos.length },
          { id: 'requirements', label: 'Requirements Oversight', icon: Layers, badge: requirements.length },
          { id: 'users', label: 'User Directory', icon: Users, badge: users.length },
          { id: 'sdg', label: 'UN SDG Impact Matrix', icon: Globe2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
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

      {/* Tab 1: Verification Queue */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {pendingNgos.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">All NGO verification reviews are caught up!</h3>
              <p className="text-xs text-slate-500">No new registration documents currently waiting for review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingNgos.map((ngo) => (
                <div
                  key={ngo.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                        {ngo.name}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Registration No: <span className="font-semibold text-slate-700 dark:text-slate-300">{ngo.registrationNumber || 'Pending'}</span> • {ngo.location?.city}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Pending Admin Review
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {ngo.description || 'No description provided.'}
                  </p>

                  {/* Documents */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>Uploaded Verification Files ({ngo.verificationDocuments?.length || 0}):</span>
                    </div>
                    {ngo.verificationDocuments?.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pl-5">
                        <span>{doc.originalName || doc.filename}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-400">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedDocument(doc)}
                            aria-label={`View ${doc.originalName || doc.filename}`}
                            className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Review Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Optional admin review note..."
                      value={selectedNgo?.id === ngo.id ? reviewNote : ''}
                      onChange={(e) => {
                        setSelectedNgo(ngo);
                        setReviewNote(e.target.value);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                    />
                    <button
                      onClick={() => handleVerifyNgo(ngo.id, 'verified')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm"
                    >
                      Approve & Verify
                    </button>
                    <button
                      onClick={() => handleVerifyNgo(ngo.id, 'rejected')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm"
                    >
                      Request Changes / Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Requirements Oversight */}
      {activeTab === 'requirements' && (
        <div className="space-y-3">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{req.title}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    {req.category}
                  </span>
                  <span className="text-xs text-slate-500">• {req.ngoName}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Status: <strong>{req.status}</strong> | Urgency: {req.urgency} | People helped: {req.peopleHelped}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4 text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{u.email}</span>
                <div className="text-slate-500">ID: {u.id}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 font-bold rounded-full bg-slate-100 dark:bg-slate-700 uppercase">
                  {u.role}
                </span>
                <span className="px-2.5 py-1 font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {u.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: UN SDG Impact Matrix */}
      {activeTab === 'sdg' && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              UN Sustainable Development Goals (SDGs) Real-time Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Live aggregation of verified community fulfillment outcomes across the 17 UN global goals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((sdg) => {
              const count = requirements
                .filter((r) => r.sdgTags?.includes(sdg as any))
                .reduce((acc, r) => acc + (r.peopleHelped || 50), 0);

              return (
                <div
                  key={sdg}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                      {sdg}
                    </span>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                      {count} Reached
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {SDG_LABELS[sdg as keyof typeof SDG_LABELS]}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedDocument && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-6"
          onClick={() => setSelectedDocument(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`Document preview: ${selectedDocument.originalName || selectedDocument.filename}`}
            className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-teal-600" />
                <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedDocument.originalName || selectedDocument.filename}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                aria-label="Close document preview and return to verification queue"
                className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </header>
            <div className="min-h-0 flex-1 bg-slate-100 dark:bg-slate-950">
              {selectedDocument.mimeType.startsWith('image/') ? (
                <img
                  src={`/api/uploads/${encodeURIComponent(selectedDocument.filename)}`}
                  alt={selectedDocument.originalName || 'NGO verification document'}
                  className="h-full w-full object-contain"
                />
              ) : (
                <iframe
                  src={`/api/uploads/${encodeURIComponent(selectedDocument.filename)}`}
                  title={selectedDocument.originalName || 'NGO verification document'}
                  className="h-full w-full border-0 bg-white"
                />
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

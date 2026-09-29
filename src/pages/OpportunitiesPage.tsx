/**
 * src/pages/OpportunitiesPage.tsx — Full Requirements & Opportunities Catalog.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import {
  Compass,
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Flame,
  Clock,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PledgeModal } from '../components/PledgeModal';
import type { Requirement, ContributionType, UrgencyLevel, SDGNumber } from '../../shared/types';
import { SDG_LABELS } from '../../shared/types';

export function OpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);

  // Filters state from URL or default
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [type, setType] = useState<ContributionType | ''>(
    (searchParams.get('type') as ContributionType) || ''
  );
  const [urgency, setUrgency] = useState<UrgencyLevel | ''>(
    (searchParams.get('urgency') as UrgencyLevel) || ''
  );
  const [sdgTag, setSdgTag] = useState<number | ''>(
    searchParams.get('sdgTag') ? Number(searchParams.get('sdgTag')) : ''
  );

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const items = await api.requirements.list({
        search: search || undefined,
        category: category || undefined,
        type: (type as ContributionType) || undefined,
        urgency: (urgency as UrgencyLevel) || undefined,
        sdgTag: sdgTag ? Number(sdgTag) : undefined,
        status: 'open',
      });
      setRequirements(items);
    } catch {
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [category, type, urgency, sdgTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequirements();
  };

  const categories = [
    'Education',
    'Healthcare',
    'Food Support',
    'Environment',
    'Women Empowerment',
    'Elderly Care',
    'Disaster Relief',
    'Animal Welfare',
    'Community Development',
    'Livelihood',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          <Compass className="w-4 h-4" />
          <span>Active Requirements Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 dark:text-white">
          Community Opportunities & Needs
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
          Browse verified NGO drives for volunteer time and physical goods. All resource requirements are bounded to guarantee zero wastage.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, role, items needed, or NGO name..."
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ContributionType | '')}
            className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="">All Types (Time & Goods)</option>
            <option value="time">Volunteer Time Only</option>
            <option value="goods">Donation Goods Only</option>
            <option value="both">Both Time & Goods</option>
          </select>

          {/* Urgency */}
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as UrgencyLevel | '')}
            className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="">All Urgency Levels</option>
            <option value="critical">Critical / Emergency</option>
            <option value="high">High Priority</option>
            <option value="normal">Standard</option>
            <option value="low">Flexible</option>
          </select>

          {/* SDG Tag */}
          <select
            value={sdgTag}
            onChange={(e) => setSdgTag(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="">All UN SDGs (1–17)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((num) => (
              <option key={num} value={num}>
                SDG {num}: {SDG_LABELS[num as SDGNumber]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : requirements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
          <Compass className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No requirements match your filters</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try resetting your search query or selecting "All Categories" to view all active community drives.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('');
              setType('');
              setUrgency('');
              setSdgTag('');
            }}
            className="px-4 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map((req) => {
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
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {req.category}
                    </span>
                    {req.urgency === 'critical' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
                        <Flame className="w-3.5 h-3.5" />
                        Critical
                      </span>
                    ) : req.urgency === 'high' ? (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                        High Priority
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                      {req.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{req.ngoName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {req.isRemote ? 'Remote' : req.location.city}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {req.description}
                  </p>

                  {/* Resource or Spots status */}
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
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>{progress}% fulfilled</span>
                        <span className="text-teal-600 dark:text-teal-400 font-medium">
                          {Math.max(0, resource.quantityNeeded - resource.quantityPledged)} {resource.unit} needed
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex justify-between items-center">
                      <span>Volunteers:</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">
                        {req.volunteersAccepted} / {req.volunteersNeeded} spots filled
                      </span>
                    </div>
                  )}

                  {/* SDG Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {req.sdgTags.map((sdg: SDGNumber) => (
                      <span
                        key={sdg}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        title={`SDG ${sdg}: ${SDG_LABELS[sdg as SDGNumber]}`}
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
      )}

      {/* Modal */}
      {selectedReq && (
        <PledgeModal
          requirement={selectedReq}
          onClose={() => setSelectedReq(null)}
          onSuccess={fetchRequirements}
        />
      )}
    </div>
  );
}

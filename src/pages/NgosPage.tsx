/**
 * src/pages/NgosPage.tsx — Verified NGO Directory.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Building2, ShieldCheck, MapPin, Globe, Mail, Phone, ExternalLink } from 'lucide-react';
import type { NgoProfile } from '../../shared/types';
import { SDG_LABELS } from '../../shared/types';

export function NgosPage() {
  const [ngos, setNgos] = useState<NgoProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.ngos.list({ verifiedOnly: true })
      .then(setNgos)
      .catch(() => setNgos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          <Building2 className="w-4 h-4" />
          <span>Verified Non-Profit Organizations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 dark:text-white mt-1">
          Partner NGOs Directory
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-1">
          All registered organizations undergo manual admin verification of legal certificates and tax IDs before requirements can be published.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-60 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : ngos.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No verified NGOs listed yet</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ngos.map((ngo) => (
            <div
              key={ngo.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 font-bold text-xl flex items-center justify-center border border-teal-200 dark:border-teal-800">
                    {ngo.name.charAt(0)}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    {ngo.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{ngo.location?.city || 'Pune'}</span>
                    {ngo.registrationNumber && (
                      <span>• Reg: {ngo.registrationNumber}</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {ngo.description || 'Dedicated non-profit working for community development, education, and social empowerment.'}
                </p>

                {/* Causes & SDGs */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1">
                    {ngo.causeAreas?.map((cause) => (
                      <span
                        key={cause}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                      >
                        {cause}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {ngo.sdgTags?.map((sdg) => (
                      <span
                        key={sdg}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        title={`SDG ${sdg}: ${SDG_LABELS[sdg]}`}
                      >
                        SDG {sdg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{ngo.contact?.email || 'Contact verified'}</span>
                {ngo.website && (
                  <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

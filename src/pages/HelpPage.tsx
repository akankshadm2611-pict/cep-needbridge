/**
 * src/pages/HelpPage.tsx — Documentation, FAQs per role, and Zero-Wastage Algorithm explainer.
 */

import React, { useState } from 'react';
import { HelpCircle, Sparkles, ShieldCheck, Heart, Building2, Package, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { PLATFORM_COPY } from '../lib/copy';
import { QuickStartGuide } from '../components/QuickStartGuide';

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the Zero-Mismatch Resource Matching & Surplus Prevention Engine work?',
      a: 'The engine works in 3 deterministic offline phases: (1) Hard filtering via radial geofencing and open status, (2) Multi-factor compatibility scoring combining Haversine location proximity, Jaccard skill/resource vector similarity, urgency multipliers, and past reliability ratings, and (3) Bounded quantity allocation strictly enforcing Allocated Qty = min(Donor Available Qty, Need Remaining) to prevent hoardings and spoilage.',
    },
    {
      q: 'How do NGOs get verified on NeedBridge?',
      a: 'NGOs submit their official registration number, society/trust certificate, and contact details during onboarding. NeedBridge platform administrators review these documents in the verification center. Only verified NGOs can publish active requirements to the public community catalog.',
    },
    {
      q: 'Can a single account both volunteer time and donate physical resources?',
      a: 'Yes! Volunteers and resource donors share one unified account. You can choose to contribute volunteer hours, donate physical goods (such as dry rations, stationery kits, blankets, medical supplies), or both.',
    },
    {
      q: 'How are UN Sustainable Development Goals (SDGs) tracked?',
      a: 'Every requirement posted by an NGO is tagged with relevant SDGs (1–17). When an application or pledge is fulfilled and verified, the impact metrics automatically increment the beneficiary and fulfillment counters for those specific global goals.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base & Guidance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 dark:text-white">
          Help Center & Getting Started Guide
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Everything you need to know about volunteering, pledging resources, and publishing verified NGO drives.
        </p>
      </div>

      {/* Interactive Getting Started Guide */}
      <QuickStartGuide />

      {/* Zero Wastage USP Explainer Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-teal-300">
          <Sparkles className="w-4 h-4" />
          <span>{PLATFORM_COPY.zeroWasteUSP.title}</span>
        </div>
        <h3 className="text-2xl font-bold font-display text-white">
          {PLATFORM_COPY.zeroWasteUSP.tagline}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {PLATFORM_COPY.zeroWasteUSP.description}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-teal-800/80 text-xs">
          <div className="p-3 bg-teal-950/60 rounded-xl border border-teal-800">
            <strong>Phase 1: Hard Filter</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">Radial geofence & open status check</p>
          </div>
          <div className="p-3 bg-teal-950/60 rounded-xl border border-teal-800">
            <strong>Phase 2: Compatibility</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">Haversine + Skill Vector + Urgency</p>
          </div>
          <div className="p-3 bg-teal-950/60 rounded-xl border border-teal-800">
            <strong>Phase 3: Bounded Cap</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">min(Offered, Needed - Pledged)</p>
          </div>
        </div>
      </div>

      {/* Role-specific Quick Guides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <Heart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">For Volunteers & Donors</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Browse opportunities, apply for volunteer drives, or pledge exact quantities of physical supplies.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">For NGOs & Charities</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload verification documents, draft structured requirements with SmartText, and manage volunteer applications.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">For Administrators</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review registration certificates, approve/reject NGO profiles, and monitor real-time SDG impact matrices.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-semibold text-sm text-slate-900 dark:text-white"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

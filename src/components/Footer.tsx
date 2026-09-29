/**
 * src/components/Footer.tsx — Site-wide footer with UN SDG impact statement and offline note.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Globe, ShieldCheck, Cpu } from 'lucide-react';
import { SDG_LABELS } from '../../shared/types';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-900 shadow-md">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-display text-white">NeedBridge</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Empowering NGOs, volunteers, and donors through precision resource matching. 
              Our bounded allocation algorithm ensures exact quantity fulfillment with zero waste, 
              directly tracking every action against the United Nations Sustainable Development Goals.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 bg-teal-950/60 border border-teal-800/60 px-3 py-1.5 rounded-lg w-fit">
              <Cpu className="w-4 h-4" />
              <span>100% Offline Capable — Zero External Cloud API Dependencies</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/opportunities" className="hover:text-teal-400 transition-colors">
                  Volunteer & Donor Catalog
                </Link>
              </li>
              <li>
                <Link to="/ngos" className="hover:text-teal-400 transition-colors">
                  Verified NGOs Directory
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-teal-400 transition-colors">
                  Zero-Wastage Matching Engine
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-teal-400 transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* UN SDG Alignment */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">UN SDG Alignment</h4>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 8, 10, 11, 13, 17].map((sdg) => (
                <span
                  key={sdg}
                  className="px-2 py-0.5 text-[11px] font-medium bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white transition-colors cursor-default"
                  title={`SDG ${sdg}: ${SDG_LABELS[sdg as keyof typeof SDG_LABELS]}`}
                >
                  SDG {sdg}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Impact metrics updated live with every fulfilled community requirement.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NeedBridge. Built for community resilience & verified social impact.</p>
          <div className="flex items-center gap-6">
            <Link to="/help" className="hover:text-slate-400">Documentation</Link>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Admin Verified Workflow
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

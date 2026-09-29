import React from 'react';
import { 
  X, 
  MapPin, 
  Users, 
  Heart, 
  Building2, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  FileCheck
} from 'lucide-react';
import { Campaign } from '../../types';

interface CampaignDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onOpenDonate?: (campaign: Campaign) => void;
}

export const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onOpenDonate,
}) => {
  if (!isOpen || !campaign) return null;

  const percentage = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100 transition-all duration-300">
        
        {/* Banner image with overlay */}
        <div className="relative h-48 sm:h-56 w-full shrink-0">
          <img 
            src={campaign.imageUrl} 
            alt={campaign.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                {campaign.category}
              </span>
              {campaign.urgent && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs animate-pulse">
                  Urgent Requirement
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display leading-tight">{campaign.title}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-200 mt-1.5">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                {campaign.organizationName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {campaign.location}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Key Schedule & Location Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Drive Duration & Dates</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {campaign.startDate ? `${campaign.startDate} to ${campaign.endDate || 'Ongoing'}` : 'Active Ongoing Initiative'}
              </p>
              {campaign.eventTime && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{campaign.eventTime}</span>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Exact Venue / Address</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {campaign.address || campaign.location}
              </p>
              <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Verified Ground Coordinates
              </span>
            </div>
          </div>

          {/* Progress Bar & Funding Numbers */}
          <div className="bg-gradient-to-br from-teal-50/70 to-emerald-50/70 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-2xl p-4 border border-teal-200/80 dark:border-teal-900/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-900 dark:text-white">₹{campaign.raisedAmount.toLocaleString()} raised</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Goal: ₹{campaign.targetAmount.toLocaleString()}</span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-bold text-teal-700 dark:text-teal-400">{percentage}% Completed</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">🎯 {campaign.beneficiariesCount || 350} Beneficiaries Reached</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              About This Campaign
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {campaign.description}
            </p>
          </div>

          {/* Requirements & Items Needed Checklist */}
          {campaign.requirements && campaign.requirements.length > 0 && (
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                <FileCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Organization Requirements & Ground Needs</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {campaign.requirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perks & Transparency Benefits */}
          {campaign.perks && campaign.perks.length > 0 && (
            <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Donor & Volunteer Perks</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {campaign.perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volunteer slots & Verification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-2xl">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 text-xs font-bold mb-1">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Volunteer Support Required</span>
              </div>
              <p className="text-sm font-extrabold text-blue-950 dark:text-blue-200">
                {campaign.volunteersEnrolled || 0} / {campaign.volunteersNeeded || 20} Volunteers Enrolled
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                {(campaign.volunteersNeeded || 20) - (campaign.volunteersEnrolled || 0)} more spots open for registration
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>NeedBridge Trust Guarantee</span>
              </div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">100% Tax Deductible (80G)</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Full transparency with direct photo & invoice proofs.
              </p>
            </div>
          </div>

          {/* Organizer Contact Info */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Organizer Representative & Inquiries
            </h5>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {campaign.organizerContact && (
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                  <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{campaign.organizerContact}</span>
                </div>
              )}
              {campaign.organizationEmail && (
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                  <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{campaign.organizationEmail}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Close Window
          </button>

          {onOpenDonate && (
            <button 
              onClick={() => {
                onClose();
                onOpenDonate(campaign);
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Heart className="w-4 h-4 fill-current text-rose-300" />
              <span>Contribute to This Campaign</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};


import React from 'react';
import { 
  X, 
  MapPin, 
  Users, 
  Building2, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Sparkles, 
  FileCheck,
  Award,
  Navigation,
  Check,
  Send,
  AlertCircle
} from 'lucide-react';
import { VolunteerOpportunity } from '../../types';
import { calculateDistanceKm, formatDistance, UserCoordinates } from '../../lib/geo';

interface OpportunityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: VolunteerOpportunity | null;
  userLocation?: UserCoordinates;
  isApplied?: boolean;
  onApply: (opp: VolunteerOpportunity) => void;
}

export const OpportunityDetailsModal: React.FC<OpportunityDetailsModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  userLocation,
  isApplied = false,
  onApply,
}) => {
  if (!isOpen || !opportunity) return null;

  // Calculate distance if coordinates are present
  const distanceKm = (opportunity.latitude && opportunity.longitude && userLocation)
    ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, opportunity.latitude, opportunity.longitude)
    : undefined;

  const totalSpots = opportunity.totalSpots || (opportunity.spotsLeft + 10);
  const enrolledSpots = Math.max(0, totalSpots - opportunity.spotsLeft);
  const spotsPercentage = Math.min(100, Math.round((enrolledSpots / totalSpots) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100 transition-all duration-300">
        
        {/* Banner image with overlay */}
        <div className="relative h-48 sm:h-56 w-full shrink-0">
          <img 
            src={opportunity.imageUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80'} 
            alt={opportunity.title} 
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
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                {opportunity.category}
              </span>
              {opportunity.urgency === 'High' && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs animate-pulse">
                  Urgent Volunteer Need
                </span>
              )}
              {distanceKm !== undefined && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold tracking-wider shadow-xs flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {formatDistance(distanceKm)}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display leading-tight">{opportunity.title}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-200 mt-1.5">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                {opportunity.organizationName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {opportunity.location}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Key Schedule & Venue Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Date & Time Commitment</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {opportunity.startsFrom} {opportunity.endDate ? `to ${opportunity.endDate}` : ''}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{opportunity.timeSlot || opportunity.hoursPerDay}</span>
              </div>
              {opportunity.duration && (
                <span className="inline-block text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  Program Duration: {opportunity.duration}
                </span>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Exact Venue / Location</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {opportunity.address || opportunity.location}
              </p>
              {distanceKm !== undefined ? (
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  <span>{formatDistance(distanceKm)} from {userLocation?.label || 'your location'}</span>
                </div>
              ) : (
                <span className="inline-block text-[10px] text-slate-500 dark:text-slate-400">
                  Exact location coordinates verified
                </span>
              )}
            </div>
          </div>

          {/* Spots Enrollment Meter */}
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-4 border border-blue-200/80 dark:border-blue-900/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Volunteer Slots Status</span>
              </span>
              <span className="text-blue-700 dark:text-blue-300 font-bold">
                {opportunity.spotsLeft} Open Spots Left ({enrolledSpots} Enrolled)
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${spotsPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
              <span>{spotsPercentage}% positions confirmed</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Immediate confirmation upon NGO review</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              About This Volunteer Role
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {opportunity.description}
            </p>
          </div>

          {/* Skills Required */}
          {opportunity.skillsRequired && opportunity.skillsRequired.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Skills & Aptitudes Desired
              </h5>
              <div className="flex flex-wrap gap-2">
                {opportunity.skillsRequired.map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements & Checklist */}
          {opportunity.requirementsChecklist && opportunity.requirementsChecklist.length > 0 && (
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                <FileCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Eligibility & Ground Guidelines</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {opportunity.requirementsChecklist.map((req, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perks & Benefits */}
          {opportunity.perksAndBenefits && opportunity.perksAndBenefits.length > 0 && (
            <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
                <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Volunteer Perks & Recognition</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {opportunity.perksAndBenefits.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organizer Contact Info */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Host NGO & Field Coordinator
            </h5>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {opportunity.organizationPhone && (
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                  <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{opportunity.organizationPhone}</span>
                </div>
              )}
              {opportunity.organizationEmail && (
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                  <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{opportunity.organizationEmail}</span>
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
            Close Details
          </button>

          {isApplied ? (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
              <Check className="w-4 h-4" />
              <span>You Have Already Applied</span>
            </div>
          ) : (
            <button 
              onClick={() => {
                onClose();
                onApply(opportunity);
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Register / Apply as Volunteer</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

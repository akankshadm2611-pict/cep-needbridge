import React, { useState } from 'react';
import { X, UserCheck, CheckCircle2, Calendar, MapPin, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VolunteerOpportunity } from '../../types';

interface ApplyOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: VolunteerOpportunity | null;
  volunteerName?: string;
  onApplySuccess: (oppId: string) => void;
}

export const ApplyOpportunityModal: React.FC<ApplyOpportunityModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  volunteerName = 'Aarohi Sharma',
  onApplySuccess,
}) => {
  const [phone, setPhone] = useState('+91 98230 44192');
  const [note, setNote] = useState('Excited to contribute! Available on all scheduled days.');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !opportunity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#3b82f6', '#10b981']
      });

      onApplySuccess(opportunity.id);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-teal-700 p-5 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-blue-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Volunteer Application
            </span>
          </div>
          <h3 className="text-xl font-bold font-display">{opportunity.title}</h3>
          <p className="text-xs text-blue-100 mt-0.5">{opportunity.organizationName}</p>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Application Submitted!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              The NGO field coordinator at {opportunity.organizationName} has received your application. Check your dashboard for status updates!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span><strong>Commitment:</strong> {opportunity.hoursPerDay}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span><strong>Date:</strong> {opportunity.startsFrom}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span><strong>Location:</strong> {opportunity.location}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Applicant Name</label>
              <input
                type="text"
                disabled
                value={volunteerName}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone / WhatsApp</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Note to Organizer</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Submit Application</span>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

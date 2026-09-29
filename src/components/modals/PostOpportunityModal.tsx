import React, { useState } from 'react';
import { X, UserCheck, Calendar, Clock, MapPin } from 'lucide-react';
import { VolunteerOpportunity } from '../../types';

interface PostOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName?: string;
  onSaveOpportunity: (opp: VolunteerOpportunity) => void;
}

export const PostOpportunityModal: React.FC<PostOpportunityModalProps> = ({
  isOpen,
  onClose,
  orgName = 'Helping Hands NGO',
  onSaveOpportunity,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VolunteerOpportunity['category']>('Teaching');
  const [hoursPerDay, setHoursPerDay] = useState('2 hrs / day');
  const [location, setLocation] = useState('Pune, Maharashtra');
  const [startsFrom, setStartsFrom] = useState('Starts from 1 June');
  const [duration, setDuration] = useState('3 Weeks');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('Communication, Empathy');
  const [spotsLeft, setSpotsLeft] = useState<number>(8);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newOpp: VolunteerOpportunity = {
      id: `opp-${Date.now()}`,
      title: title.trim(),
      organizationName: orgName,
      category: category,
      hoursPerDay: hoursPerDay.trim(),
      location: location.trim(),
      startsFrom: startsFrom.trim(),
      duration: duration.trim(),
      description: description.trim(),
      skillsRequired: skills.split(',').map((s) => s.trim()).filter(Boolean),
      spotsLeft: Number(spotsLeft),
      applied: false,
      imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=80'
    };

    onSaveOpportunity(newOpp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col text-slate-800 dark:text-slate-100">
        
        <div className="bg-gradient-to-r from-teal-700 to-emerald-700 p-5 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-teal-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
              Recruit Volunteers
            </span>
          </div>
          <h3 className="text-xl font-bold font-display">Post Volunteer Opportunity</h3>
          <p className="text-xs text-teal-100 mt-0.5">List community service slots for local changemakers.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Opportunity Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Math & Science Mentorship"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="Teaching">Teaching</option>
                <option value="Environment">Environment</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Food Distribution">Food Distribution</option>
                <option value="Elderly Care">Elderly Care</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Daily Commitment</label>
              <input
                type="text"
                required
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                placeholder="e.g. 2 hrs / day"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Pune, Maharashtra"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
              <input
                type="text"
                required
                value={startsFrom}
                onChange={(e) => setStartsFrom(e.target.value)}
                placeholder="Starts from 25 May"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Skills (Comma-sep)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Teaching, Empathy"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Open Volunteer Spots</label>
              <input
                type="number"
                min={1}
                value={spotsLeft}
                onChange={(e) => setSpotsLeft(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the responsibilities, schedule, and volunteer perks..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Post Opportunity
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

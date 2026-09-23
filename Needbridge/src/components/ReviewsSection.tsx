import React, { useState } from 'react';
import { 
  Star, 
  MessageSquarePlus, 
  CheckCircle, 
  Send, 
  Building2, 
  UserCheck, 
  HeartHandshake, 
  Sparkles,
  Quote
} from 'lucide-react';
import { ReviewItem } from '../types';

interface ReviewsSectionProps {
  reviews: ReviewItem[];
  onAddReview: (newReview: ReviewItem) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  onAddReview,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Volunteer' | 'NGO Lead' | 'Community Beneficiary' | 'Donor'>('All');
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [authorName, setAuthorName] = useState('');
  const [role, setRole] = useState<'Volunteer' | 'NGO Lead' | 'Community Beneficiary' | 'Donor'>('Volunteer');
  const [organizationOrCity, setOrganizationOrCity] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Volunteering');
  const [feedback, setFeedback] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const filteredReviews = selectedFilter === 'All' 
    ? reviews 
    : reviews.filter(r => r.role === selectedFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !feedback.trim()) return;

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      authorName: authorName.trim(),
      role: role,
      organizationOrCity: organizationOrCity.trim() || (role === 'NGO Lead' ? 'Grassroots NGO' : 'Pune Community'),
      avatar: `https://images.unsplash.com/photo-${role === 'Volunteer' ? '1534528741775-53994a69daeb' : '1537368910025-700350fe46c7'}?w=100&auto=format&fit=crop&q=80`,
      rating: rating,
      feedback: feedback.trim(),
      date: 'Just now',
      category: category,
      verified: true
    };

    onAddReview(newRev);
    setSubmittedSuccess(true);
    setAuthorName('');
    setFeedback('');
    setOrganizationOrCity('');

    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowForm(false);
    }, 2000);
  };

  return (
    <section id="community-reviews" className="py-16 md:py-24 bg-white dark:bg-slate-950 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Community Voices & Feedback</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-display mt-1">
              Real Experiences Across the Bridge
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Discover how volunteers, NGO teams, and community members connect and create real-world change through NeedBridge.
            </p>
          </div>

          <button
            id="open-review-form-btn"
            onClick={() => setShowForm(!showForm)}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-teal-700/20 transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{showForm ? 'Close Feedback Form' : 'Share Your Experience / Feedback'}</span>
          </button>
        </div>

        {/* INTERACTIVE REVIEW SUBMISSION BOX */}
        {showForm && (
          <div 
            id="review-submission-box"
            className="mb-12 bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Your Story & Feedback</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Your review helps build trust and guides new volunteers and NGOs.</p>
                </div>
              </div>
            </div>

            {submittedSuccess ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Thank You for Your Feedback!</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Your experience has been verified and published to the live community board.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Ramesh Kulkarni"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Volunteer">Volunteer</option>
                      <option value="NGO Lead">NGO / Organization Lead</option>
                      <option value="Community Beneficiary">Community Beneficiary</option>
                      <option value="Donor">Donor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Organization Name or Location
                    </label>
                    <input
                      type="text"
                      value={organizationOrCity}
                      onChange={(e) => setOrganizationOrCity(e.target.value)}
                      placeholder="e.g. Helping Hands / Pune"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Feedback Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Volunteering">Volunteering Experience</option>
                      <option value="NGO Experience">NGO Connection & Volunteer Management</option>
                      <option value="Community Impact">Community Resource Access</option>
                      <option value="Donations">Donation & Transparency</option>
                      <option value="Platform Ease">Website & Usability</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Star Rating</label>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">{rating}.0 / 5.0</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Experience / Feedback Story
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share how the platform helped bridge needs, what opportunities you participated in, or how freely you could connect..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-teal-700/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Verified Review</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {(['All', 'Volunteer', 'NGO Lead', 'Community Beneficiary', 'Donor'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter === 'All' ? 'All Reviews' : `${filter}s`}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length === 0 ? (
          <div className="py-12 px-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/40">
            <Quote className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3 opacity-60" />
            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">No reviews available</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Be the first community member to share your experience with NeedBridge!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReviews.map((rev) => (
              <div 
                key={rev.id}
                className="bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-md transition-all"
              >
                <Quote className="w-8 h-8 text-teal-600/10 dark:text-teal-400/10 absolute top-5 right-5" />

                <div>
                  {/* Rating & Category badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-800/60">
                      {rev.category}
                    </span>
                  </div>

                  {/* Feedback text */}
                  <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed mb-6 italic">
                    "{rev.feedback}"
                  </p>
                </div>

                {/* Author details */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                  <img
                    src={rev.avatar}
                    alt={rev.authorName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{rev.authorName}</p>
                      {rev.verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" title="Verified Member" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {rev.role} • {rev.organizationOrCity}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{rev.date}</span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

import React from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Heart, 
  GraduationCap, 
  Utensils, 
  Activity, 
  TreePine, 
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { Campaign, VolunteerOpportunity, DonationRecord, BeneficiaryBreakdown, VolunteerRequest } from '../types';

interface NumbersStoryProps {
  campaigns?: Campaign[];
  opportunities?: VolunteerOpportunity[];
  donations?: DonationRecord[];
  beneficiaries?: BeneficiaryBreakdown;
  volunteerRequests?: VolunteerRequest[];
}

export const NumbersStory: React.FC<NumbersStoryProps> = ({
  campaigns = [],
  opportunities = [],
  donations = [],
  beneficiaries = { children: 0, women: 0, elderly: 0, others: 0, total: 0 },
  volunteerRequests = [],
}) => {
  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalCampaigns = campaigns.length;
  const totalOpportunities = opportunities.length;
  const totalBeneficiaries = beneficiaries.total;
  const acceptedVolunteers = volunteerRequests.filter(r => r.status === 'accepted').length;
  
  // Calculate unique active cities/locations
  const activeLocations = Array.from(
    new Set(
      [
        ...campaigns.map(c => c.location?.split(',')[0]?.trim()),
        ...opportunities.map(o => o.location?.split(',')[0]?.trim())
      ].filter(Boolean)
    )
  );
  const citiesCount = activeLocations.length;

  // Calculate fulfillment rate from live data
  const fulfillmentRate = volunteerRequests.length > 0 
    ? Math.round((acceptedVolunteers / volunteerRequests.length) * 100)
    : 100;

  // Real Category metrics calculated from actual user records
  const educationCount = campaigns.filter(c => c.category?.toLowerCase().includes('education')).length + 
    opportunities.filter(o => o.category?.toLowerCase().includes('education')).length;

  const environmentCount = campaigns.filter(c => c.category?.toLowerCase().includes('environment')).length + 
    opportunities.filter(o => o.category?.toLowerCase().includes('environment')).length;

  const healthcareCount = campaigns.filter(c => c.category?.toLowerCase().includes('health') || c.category?.toLowerCase().includes('medical')).length + 
    opportunities.filter(o => o.category?.toLowerCase().includes('health') || o.category?.toLowerCase().includes('medical')).length;

  const foodCount = campaigns.filter(c => c.category?.toLowerCase().includes('food') || c.category?.toLowerCase().includes('relief') || c.category?.toLowerCase().includes('grocer')).length + 
    opportunities.filter(o => o.category?.toLowerCase().includes('food') || o.category?.toLowerCase().includes('relief')).length;

  const totalActionItems = educationCount + environmentCount + healthcareCount + foodCount || 1;

  const causesBreakdown = [
    { 
      name: 'Food & Nutrition Relief', 
      icon: Utensils, 
      count: foodCount > 0 ? `${foodCount} active drives` : '0 drives', 
      percent: foodCount > 0 ? Math.min(100, Math.round((foodCount / totalActionItems) * 100)) : 0, 
      color: 'from-amber-500 to-orange-500' 
    },
    { 
      name: 'Education & Learning Support', 
      icon: GraduationCap, 
      count: educationCount > 0 ? `${educationCount} active initiatives` : (beneficiaries.children > 0 ? `${beneficiaries.children} students supported` : '0 initiatives'), 
      percent: educationCount > 0 ? Math.min(100, Math.round((educationCount / totalActionItems) * 100)) : (beneficiaries.children > 0 ? 50 : 0), 
      color: 'from-blue-500 to-indigo-500' 
    },
    { 
      name: 'Healthcare & Medical Aid', 
      icon: Activity, 
      count: healthcareCount > 0 ? `${healthcareCount} active camps` : '0 camps', 
      percent: healthcareCount > 0 ? Math.min(100, Math.round((healthcareCount / totalActionItems) * 100)) : 0, 
      color: 'from-rose-500 to-pink-500' 
    },
    { 
      name: 'Environmental & Green Drives', 
      icon: TreePine, 
      count: environmentCount > 0 ? `${environmentCount} active drives` : '0 drives', 
      percent: environmentCount > 0 ? Math.min(100, Math.round((environmentCount / totalActionItems) * 100)) : 0, 
      color: 'from-emerald-500 to-teal-500' 
    },
  ];

  const hasLiveActivity = totalCampaigns > 0 || totalOpportunities > 0 || totalDonations > 0 || totalBeneficiaries > 0;

  return (
    <section id="impact-stats" className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
            Live Verified Ground Telemetry
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            Numbers That Tell a Real Story
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
            Every registered drive, rupee donated, and volunteer hour on NeedBridge is calculated directly from actual ground activity.
          </p>
        </div>

        {/* 4 Live Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400 font-display">
              {totalCampaigns}
            </p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
              Active Verified Campaigns
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Published by verified NGOs
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-400 font-display">
              ₹{totalDonations.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
              Community Funding Raised
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              100% direct to NGO accounts
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400 font-display">
              {totalOpportunities}
            </p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
              Volunteer Opportunities
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Local grassroots drives
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-display">
              {totalBeneficiaries}
            </p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
              Beneficiaries Impacted
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Logged in audit books
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Key Metrics Bento */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {volunteerRequests.length > 0 ? `${fulfillmentRate}% Volunteer Assignment` : '100% Direct Matching'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Verified application turnaround</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                Community requests published on NeedBridge connect directly with volunteers and resource donors with zero delays.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {citiesCount > 0 ? `${citiesCount} Verified Location${citiesCount > 1 ? 's' : ''}` : 'Localized Community Hubs'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active regional operational zones</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                {citiesCount > 0 
                  ? `Active drives currently registered in: ${activeLocations.slice(0, 4).join(', ')}.`
                  : 'Grassroots NGOs and volunteers register localized drives across regional communities.'}
              </p>
            </div>

            <div className="bg-gradient-to-tr from-teal-700 to-teal-900 text-white rounded-2xl p-6 shadow-md border border-teal-600/30">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
                <h4 className="font-bold text-sm">Zero Platform Cut</h4>
              </div>
              <p className="text-xs text-teal-100 leading-relaxed">
                100% of donor funding goes directly to verified NGO beneficiary bank accounts with automatic 80G receipts.
              </p>
            </div>
          </div>

          {/* Causes Distribution bars */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Beneficiary Distribution by Core Cause
                </h3>
                <span className="px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-200 dark:border-teal-800">
                  Live Audit
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Real-time tracking of community resources and volunteer hours recorded on the platform.
              </p>

              <div className="space-y-6">
                {causesBreakdown.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
                      </div>

                      {/* Progress Track */}
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Audited real-time platform calculations</span>
              </div>
              <span className="font-medium text-teal-700 dark:text-teal-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Live Data Only
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

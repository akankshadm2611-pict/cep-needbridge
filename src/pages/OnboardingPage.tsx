/**
 * src/pages/OnboardingPage.tsx — Role-specific multi-step onboarding wizard.
 * 5 steps for Volunteer/Donor, 4 steps for NGO with progress indicators.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Clock,
  Package,
  Heart,
  ShieldCheck,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  FileText,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SDG_LABELS, SDGNumber, ContributionType } from '../../shared/types';

export function OnboardingPage() {
  const { user, profile, refreshProfile, setOnboardingDone } = useAuth();
  const navigate = useNavigate();

  const isNgo = user?.role === 'ngo';
  const totalSteps = isNgo ? 4 : 5;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Volunteer Wizard State ───────────────────────────────────────────
  const [volContributionType, setVolContributionType] = useState<ContributionType>('both');
  const [volCauses, setVolCauses] = useState<string[]>(['Education', 'Food Support']);
  const [volSdgs, setVolSdgs] = useState<SDGNumber[]>([2, 4]);
  const [volSkills, setVolSkills] = useState<string[]>(['Teaching', 'Communication']);
  const [volResourceCategories, setVolResourceCategories] = useState<string[]>(['Books', 'Stationery']);
  const [volCity, setVolCity] = useState('Pune');
  const [volRemoteOk, setVolRemoteOk] = useState(true);
  const [volDays, setVolDays] = useState<string[]>(['Saturday', 'Sunday']);

  // ─── NGO Wizard State ────────────────────────────────────────────────
  const [ngoName, setNgoName] = useState((profile as any)?.name || '');
  const [ngoDescription, setNgoDescription] = useState('');
  const [ngoRegNo, setNgoRegNo] = useState('');
  const [ngoCauses, setNgoCauses] = useState<string[]>([]);
  const [ngoSdgs, setNgoSdgs] = useState<SDGNumber[]>([]);
  const [ngoCity, setNgoCity] = useState('');
  const [ngoPhone, setNgoPhone] = useState('');
  const [ngoWebsite, setNgoWebsite] = useState('');
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);

  const availableCauses = [
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

  const skillOptions = [
    'Teaching',
    'Communication',
    'Logistics',
    'Basic First Aid',
    'Driving',
    'Cooking',
    'Mentorship',
    'Event Coordination',
    'Counseling',
    'Tech Support',
  ];

  const resourceOptions = [
    'Rations & Dry Food',
    'Books & Stationery',
    'Clothing & Blankets',
    'Medical Supplies',
    'Hygiene Kits',
    'School Bags',
    'Digital Devices',
  ];

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      await api.ngos.uploadDocument(file);
      setUploadedDocName(file.name);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document. Please upload a valid PDF or image file (max 10MB).');
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isNgo) {
        // Enforce that NGOs must upload a certificate
        if (!uploadedDocName) {
          setError('You must upload your NGO registration certificate or 80G document before completing setup.');
          setLoading(false);
          return;
        }
        if (!ngoName.trim() || !ngoCity.trim()) {
          setError('Please fill in your organization name and city.');
          setLoading(false);
          return;
        }
        await api.ngos.updateMe({
          name: ngoName,
          description: ngoDescription,
          registrationNumber: ngoRegNo,
          causeAreas: ngoCauses,
          sdgTags: ngoSdgs,
          location: { city: ngoCity },
          contact: { phone: ngoPhone, email: user?.email },
          website: ngoWebsite,
        });
      } else {
        await api.volunteers.updateMe({
          contributionType: volContributionType,
          interests: volCauses,
          sdgInterests: volSdgs,
          skills: volSkills,
          resourceCategories: volResourceCategories,
          location: { city: volCity },
          remoteOk: volRemoteOk,
          availability: { days: volDays },
        });
      }

      await refreshProfile();
      setOnboardingDone();

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile setup.');
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = Math.round((step / totalSteps) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Header & Progress Meter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{isNgo ? 'NGO Organization Setup' : 'Volunteer & Donor Onboarding'}</span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Step {step} of {totalSteps} ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── VOLUNTEER WIZARD STEPS ───────────────────────────────────────── */}
      {!isNgo && (
        <div className="p-8 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
          {/* Step 1: Contribution Type */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  How would you like to contribute?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  You can offer hands-on volunteer hours, donate physical goods, or both.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'time', label: 'Volunteer Time', icon: Clock, desc: 'Teaching, logistics, relief drives' },
                  { id: 'goods', label: 'Donate Resources', icon: Package, desc: 'Books, food, medicine, clothes' },
                  { id: 'both', label: 'Both Time & Goods', icon: Heart, desc: 'Maximum community support' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setVolContributionType(item.id as ContributionType)}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                      volContributionType === item.id
                        ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Causes & SDGs */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  What causes do you care about?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select key areas to personalize your smart match recommendations.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableCauses.map((cause) => {
                  const selected = volCauses.includes(cause);
                  return (
                    <button
                      key={cause}
                      type="button"
                      onClick={() => {
                        if (selected) setVolCauses(volCauses.filter((c) => c !== cause));
                        else setVolCauses([...volCauses, cause]);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {cause}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  UN Sustainable Development Goals (SDGs):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 8, 10, 11, 13, 17].map((num) => {
                    const selected = volSdgs.includes(num as SDGNumber);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          if (selected) setVolSdgs(volSdgs.filter((s) => s !== num));
                          else setVolSdgs([...volSdgs, num as SDGNumber]);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          selected
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        SDG {num}: {SDG_LABELS[num as SDGNumber]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Skills & Resource Categories */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  Your Skills & Donatable Resources
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Used by our matching engine to connect you with suitable drives.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Skills you can offer:
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => {
                    const selected = volSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          if (selected) setVolSkills(volSkills.filter((s) => s !== skill));
                          else setVolSkills([...volSkills, skill]);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selected
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Resource categories you can supply:
                </label>
                <div className="flex flex-wrap gap-2">
                  {resourceOptions.map((res) => {
                    const selected = volResourceCategories.includes(res);
                    return (
                      <button
                        key={res}
                        type="button"
                        onClick={() => {
                          if (selected) setVolResourceCategories(volResourceCategories.filter((r) => r !== res));
                          else setVolResourceCategories([...volResourceCategories, res]);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {res}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Location & Availability */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  Location & Availability
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Helps calculate Haversine proximity for local community drives.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your City / District:
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={volCity}
                    onChange={(e) => setVolCity(e.target.value)}
                    placeholder="e.g. Pune, Mumbai, Bengaluru"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="remoteOk"
                  checked={volRemoteOk}
                  onChange={(e) => setVolRemoteOk(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <label htmlFor="remoteOk" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  I am also open to remote / online volunteering opportunities
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Available Days:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const selected = volDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (selected) setVolDays(volDays.filter((d) => d !== day));
                          else setVolDays([...volDays, day]);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selected
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Complete */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  You're Ready to Make an Impact!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your profile has been tuned for precision matching. Let's head to your personalized dashboard.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Contribution Preference:</span>
                  <span className="font-semibold text-slate-900 dark:text-white uppercase">{volContributionType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Causes:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{volCauses.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{volCity} (Remote: {volRemoteOk ? 'Yes' : 'No'})</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Skip for now
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <span>{loading ? 'Finalizing...' : 'Enter Dashboard'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── NGO WIZARD STEPS ─────────────────────────────────────────────── */}
      {isNgo && (
        <div className="p-8 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
          {/* Step 1: Org Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  Organization Basics
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tell us about your non-profit and community cause focus.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NGO Official Name:
                </label>
                <input
                  type="text"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mission & Description:
                </label>
                <textarea
                  rows={3}
                  value={ngoDescription}
                  onChange={(e) => setNgoDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Cause Areas:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableCauses.map((cause) => {
                    const selected = ngoCauses.includes(cause);
                    return (
                      <button
                        key={cause}
                        type="button"
                        onClick={() => {
                          if (selected) setNgoCauses(ngoCauses.filter((c) => c !== cause));
                          else setNgoCauses([...ngoCauses, cause]);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selected
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cause}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Verification Documents */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  Verification & Trust Badge
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  To ensure donor and volunteer safety, all NGOs must provide registration verification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NGO Registration / Tax Certificate Number:
                </label>
                <input
                  type="text"
                  value={ngoRegNo}
                  onChange={(e) => setNgoRegNo(e.target.value)}
                  placeholder="e.g. REG-MH-2026-9999"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                <Upload className="w-8 h-8 text-teal-600 mx-auto" />
                <div>
                  <label
                    htmlFor="doc-upload"
                    className="cursor-pointer text-xs font-bold text-teal-600 hover:text-teal-700 underline"
                  >
                    Upload Registration Certificate / 80G Certificate (PDF or Image)
                  </label>
                  <input
                    id="doc-upload"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleDocUpload}
                    className="hidden"
                  />
                </div>
                {uploadedDocName && (
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Uploaded: {uploadedDocName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Location & Contact */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  Contact & Location
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  How volunteers and donors can coordinate physical pickups and visits.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Operating City:
                </label>
                <input
                  type="text"
                  value={ngoCity}
                  onChange={(e) => setNgoCity(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone Number:
                </label>
                <input
                  type="text"
                  value={ngoPhone}
                  onChange={(e) => setNgoPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Website (Optional):
                </label>
                <input
                  type="url"
                  value={ngoWebsite}
                  onChange={(e) => setNgoWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Step 4: Finish */}
          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                NGO Profile Ready for Review!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Our verification team will inspect your documentation. You can now access your NGO dashboard and draft structured requirements.
              </p>
            </div>
          )}

          {/* Navigation controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <span />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 2 && !uploadedDocName && !ngoRegNo.trim()) {
                    setError('Please enter your registration number and upload your certificate before continuing.');
                    return;
                  }
                  if (step === 2 && !uploadedDocName) {
                    setError('Please upload your official NGO registration certificate / 80G document.');
                    return;
                  }
                  setError(null);
                  setStep(step + 1);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <span>{loading ? 'Saving Profile...' : 'Enter NGO Dashboard'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

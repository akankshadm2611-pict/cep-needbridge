import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  UserProfile, 
  Campaign, 
  VolunteerOpportunity, 
  VolunteerRequest, 
  DonationRecord, 
  BeneficiaryBreakdown, 
  ReviewItem 
} from './types';
import { StorageService } from './lib/storage';

// Landing Page Components
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { NumbersStory } from './components/NumbersStory';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';

// Dashboard Components
import { VolunteerDashboard } from './components/dashboards/VolunteerDashboard';
import { NgoDashboard } from './components/dashboards/NgoDashboard';
import { DonorDashboard } from './components/dashboards/DonorDashboard';

// Modals
import { AuthModal } from './components/AuthModal';
import { DonateModal } from './components/modals/DonateModal';
import { CampaignDetailsModal } from './components/modals/CampaignDetailsModal';
import { CreateCampaignModal } from './components/modals/CreateCampaignModal';
import { PostOpportunityModal } from './components/modals/PostOpportunityModal';
import { ApplyOpportunityModal } from './components/modals/ApplyOpportunityModal';

import { 
  Sparkles, 
  Eye, 
  UserCheck, 
  Building2, 
  HeartHandshake, 
  Home, 
  Sun, 
  Moon 
} from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => StorageService.getTheme());

  useEffect(() => {
    StorageService.setTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    StorageService.setTheme(nextTheme);
  };

  // Global View & Auth State - Persisted via StorageService
  const [activeView, setActiveView] = useState<'landing' | 'volunteer_dashboard' | 'ngo_dashboard' | 'donor_dashboard'>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => StorageService.getCurrentUser());

  // Real App Data State - Persisted via StorageService (No mock data defaults)
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => StorageService.getCampaigns());
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>(() => StorageService.getOpportunities());
  const [volunteerRequests, setVolunteerRequests] = useState<VolunteerRequest[]>(() => StorageService.getVolunteerRequests());
  const [donations, setDonations] = useState<DonationRecord[]>(() => StorageService.getDonations());
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryBreakdown>(() => StorageService.getBeneficiaries());
  const [reviews, setReviews] = useState<ReviewItem[]>(() => StorageService.getReviews());

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authRole, setAuthRole] = useState<UserRole>('volunteer');

  const [selectedCampaignForDonate, setSelectedCampaignForDonate] = useState<Campaign | null>(null);
  const [selectedCampaignForDetails, setSelectedCampaignForDetails] = useState<Campaign | null>(null);
  const [selectedOppForApply, setSelectedOppForApply] = useState<VolunteerOpportunity | null>(null);
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [postOppOpen, setPostOppOpen] = useState(false);

  // Handlers for Auth
  const handleOpenAuth = (mode: 'login' | 'signup', role?: UserRole) => {
    setAuthMode(mode);
    if (role) setAuthRole(role);
    setAuthModalOpen(true);
  };

  const handleSuccessAuth = (user: UserProfile) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
    // Route to appropriate dashboard
    if (user.role === 'volunteer') {
      setActiveView('volunteer_dashboard');
    } else if (user.role === 'ngo') {
      setActiveView('ngo_dashboard');
    } else {
      setActiveView('donor_dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    StorageService.setCurrentUser(null);
    setActiveView('landing');
  };

  const handleDeleteAccount = () => {
    if (currentUser) {
      StorageService.deleteUser(currentUser.id);
    }
    setCurrentUser(null);
    StorageService.setCurrentUser(null);
    setActiveView('landing');
  };

  // Handlers for NGO actions
  const handleAcceptVolunteerRequest = (reqId: string) => {
    const updated = StorageService.updateVolunteerRequestStatus(reqId, 'accepted');
    setVolunteerRequests(updated);
  };

  const handleRejectVolunteerRequest = (reqId: string) => {
    const updated = StorageService.updateVolunteerRequestStatus(reqId, 'rejected');
    setVolunteerRequests(updated);
  };

  const handleAddBeneficiaries = (count: number, category: string) => {
    const updated = StorageService.addBeneficiaries(count, category as any);
    setBeneficiaries(updated);
  };

  // Handlers for campaigns & opportunities
  const handleSaveCampaign = (newCamp: Campaign) => {
    const updated = StorageService.saveCampaign(newCamp);
    setCampaigns(updated);
  };

  const handleSaveOpportunity = (newOpp: VolunteerOpportunity) => {
    const updated = StorageService.saveOpportunity(newOpp);
    setOpportunities(updated);
  };

  // Handlers for donations & reviews
  const handleDonateSuccess = (donation: DonationRecord) => {
    const updatedDonations = StorageService.saveDonation(donation);
    setDonations(updatedDonations);

    // update campaign raised amount if matching
    if (selectedCampaignForDonate) {
      const updatedCampaigns = StorageService.updateCampaign(selectedCampaignForDonate.id, {
        raisedAmount: (selectedCampaignForDonate.raisedAmount || 0) + donation.amount
      });
      setCampaigns(updatedCampaigns);
    }
  };

  const handleAddReview = (newReview: ReviewItem) => {
    const updatedReviews = StorageService.saveReview(newReview);
    setReviews(updatedReviews);
  };

  const handleApplySuccess = (oppId: string) => {
    // update spots left
    const opp = opportunities.find(o => o.id === oppId);
    if (opp) {
      const updatedOpps = opportunities.map(o => o.id === oppId ? { ...o, spotsLeft: Math.max(0, o.spotsLeft - 1), applied: true } : o);
      setOpportunities(updatedOpps);
      
      const newReq: VolunteerRequest = {
        id: `req-${Date.now()}`,
        volunteerName: currentUser?.name || 'Registered Volunteer',
        volunteerEmail: currentUser?.email || 'volunteer@needbridge.org',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        opportunityTitle: opp.title,
        appliedDate: 'Just now',
        status: 'pending',
        note: 'Applied via NeedBridge volunteer portal'
      };
      const updatedReqs = StorageService.saveVolunteerRequest(newReq);
      setVolunteerRequests(updatedReqs);
    }
  };

  // Switch demo or registered profile
  const handleSelectRoleDashboard = (role: UserRole) => {
    // Check if a registered user exists for this role, otherwise create a session profile
    let roleUser = StorageService.getUsers().find(u => u.role === role);
    if (!roleUser) {
      roleUser = {
        id: `user-${role}-${Date.now()}`,
        name: role === 'volunteer' ? 'Registered Volunteer' : role === 'ngo' ? 'Registered Community NGO' : 'Registered Supporter',
        email: `${role}@needbridge.org`,
        role: role,
        organizationName: role === 'ngo' ? 'NeedBridge Community Foundation' : undefined,
        verified: true,
        joinedDate: 'May 2026',
        city: 'Pune'
      };
      StorageService.saveUser(roleUser);
    }
    setCurrentUser(roleUser);
    StorageService.setCurrentUser(roleUser);
    
    if (role === 'volunteer') setActiveView('volunteer_dashboard');
    else if (role === 'ngo') setActiveView('ngo_dashboard');
    else setActiveView('donor_dashboard');
  };

  const allRegisteredUsers = StorageService.getUsers();
  const registeredNgosCount = allRegisteredUsers.filter(u => u.role === 'ngo').length;
  const registeredVolunteersCount = allRegisteredUsers.filter(u => u.role === 'volunteer').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white transition-colors">
      
      {/* QUICK ROLE SWITCHER TOP BAR */}
      <div 
        id="demo-mode-bar"
        className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white px-3 py-1.5 text-xs border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 z-50 select-none transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            NeedBridge Portal:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="quick-view-landing"
            onClick={() => setActiveView('landing')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeView === 'landing' 
                ? 'bg-teal-600 text-white font-bold' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Home className="w-3 h-3" />
            <span>Landing Page</span>
          </button>

          <button
            id="quick-view-volunteer"
            onClick={() => handleSelectRoleDashboard('volunteer')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeView === 'volunteer_dashboard' 
                ? 'bg-blue-600 text-white font-bold' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Volunteer Dashboard</span>
          </button>

          <button
            id="quick-view-ngo"
            onClick={() => handleSelectRoleDashboard('ngo')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeView === 'ngo_dashboard' 
                ? 'bg-emerald-600 text-white font-bold' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>NGO Dashboard</span>
          </button>

          <button
            id="quick-view-donor"
            onClick={() => handleSelectRoleDashboard('donor_seeker')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeView === 'donor_dashboard' 
                ? 'bg-purple-600 text-white font-bold' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <HeartHandshake className="w-3 h-3" />
            <span>Donor Dashboard</span>
          </button>

          {/* Top Bar Theme Toggle */}
          <button
            id="quick-toggle-theme"
            onClick={handleToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1 px-2.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-slate-700" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* VIEW ROUTER */}
      {activeView === 'landing' && (
        <>
          <Navbar 
            activeView={activeView}
            setActiveView={setActiveView}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
            isDark={theme === 'dark'}
            onToggleDark={handleToggleTheme}
          />
          
          <main className="flex-1">
            <HeroSection 
              ngosCount={registeredNgosCount}
              volunteersCount={registeredVolunteersCount}
              campaignsCount={campaigns.length}
              peopleImpactedCount={beneficiaries.total}
              onSelectRoleAction={handleOpenAuth}
              onExploreCampaigns={() => {
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <HowItWorks 
              onSelectRoleAction={handleOpenAuth}
            />

            <NumbersStory 
              campaigns={campaigns}
              opportunities={opportunities}
              donations={donations}
              beneficiaries={beneficiaries}
              volunteerRequests={volunteerRequests}
            />

            <ReviewsSection 
              reviews={reviews}
              onAddReview={handleAddReview}
            />
          </main>

          <Footer onOpenAuth={handleOpenAuth} />
        </>
      )}

      {activeView === 'volunteer_dashboard' && (
        <VolunteerDashboard 
          currentUser={currentUser || {
            id: 'temp-vol',
            name: 'Registered Volunteer',
            email: 'volunteer@needbridge.org',
            role: 'volunteer',
            verified: true,
            joinedDate: 'May 2026'
          }}
          campaigns={campaigns}
          opportunities={opportunities}
          onOpenCampaignDetails={(camp) => setSelectedCampaignForDetails(camp)}
          onOpenApplyModal={(opp) => setSelectedOppForApply(opp)}
          onLogout={handleLogout}
          onBackToLanding={() => setActiveView('landing')}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {activeView === 'ngo_dashboard' && (
        <NgoDashboard 
          currentUser={currentUser || {
            id: 'temp-ngo',
            name: 'Registered NGO',
            organizationName: 'NeedBridge NGO Partner',
            email: 'ngo@needbridge.org',
            role: 'ngo',
            verified: true,
            joinedDate: 'May 2026'
          }}
          campaigns={campaigns}
          volunteerRequests={volunteerRequests}
          donations={donations}
          beneficiaries={beneficiaries}
          onOpenCreateCampaign={() => setCreateCampaignOpen(true)}
          onOpenPostOpportunity={() => setPostOppOpen(true)}
          onLogout={handleLogout}
          onBackToLanding={() => setActiveView('landing')}
          onAcceptRequest={handleAcceptVolunteerRequest}
          onRejectRequest={handleRejectVolunteerRequest}
          onAddBeneficiaries={handleAddBeneficiaries}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {activeView === 'donor_dashboard' && (
        <DonorDashboard 
          currentUser={currentUser || {
            id: 'temp-donor',
            name: 'Registered Supporter',
            email: 'supporter@needbridge.org',
            role: 'donor_seeker',
            verified: true,
            joinedDate: 'May 2026'
          }}
          campaigns={campaigns}
          donations={donations}
          onOpenDonateModal={(camp) => setSelectedCampaignForDonate(camp)}
          onOpenCampaignDetails={(camp) => setSelectedCampaignForDetails(camp)}
          onLogout={handleLogout}
          onBackToLanding={() => setActiveView('landing')}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {/* MODALS */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        initialRole={authRole}
        onSuccessAuth={handleSuccessAuth}
      />

      <DonateModal 
        isOpen={!!selectedCampaignForDonate}
        onClose={() => setSelectedCampaignForDonate(null)}
        campaign={selectedCampaignForDonate}
        onDonateSuccess={handleDonateSuccess}
      />

      <CampaignDetailsModal 
        isOpen={!!selectedCampaignForDetails}
        onClose={() => setSelectedCampaignForDetails(null)}
        campaign={selectedCampaignForDetails}
        onOpenDonate={(camp) => setSelectedCampaignForDonate(camp)}
      />

      <CreateCampaignModal 
        isOpen={createCampaignOpen}
        onClose={() => setCreateCampaignOpen(false)}
        orgName={currentUser?.organizationName || 'Verified NGO'}
        onSaveCampaign={handleSaveCampaign}
      />

      <PostOpportunityModal 
        isOpen={postOppOpen}
        onClose={() => setPostOppOpen(false)}
        orgName={currentUser?.organizationName || 'Verified NGO'}
        onSaveOpportunity={handleSaveOpportunity}
      />

      <ApplyOpportunityModal 
        isOpen={!!selectedOppForApply}
        onClose={() => setSelectedOppForApply(null)}
        opportunity={selectedOppForApply}
        volunteerName={currentUser?.name || 'Registered Volunteer'}
        onApplySuccess={handleApplySuccess}
      />

    </div>
  );
}

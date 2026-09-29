import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Flag, 
  HeartHandshake, 
  Award, 
  Heart, 
  FilePlus2, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  ChevronDown, 
  MapPin, 
  Sparkles,
  Download,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Send,
  AlertTriangle,
  Trash2,
  Save,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  Clock,
  Check,
  Share2,
  X,
  Lock,
  Phone,
  Sun,
  Moon
} from 'lucide-react';
import { HelpingHandsLogo } from '../HelpingHandsLogo';
import { Campaign, DonationRecord, UserProfile, ChatMessage } from '../../types';
import { StorageService } from '../../lib/storage';

interface DonorDashboardProps {
  currentUser: UserProfile;
  campaigns: Campaign[];
  donations: DonationRecord[];
  onOpenDonateModal: (campaign: Campaign) => void;
  onOpenCampaignDetails: (campaign: Campaign) => void;
  onLogout: () => void;
  onBackToLanding: () => void;
  onDeleteAccount: () => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  currentUser,
  campaigns,
  donations,
  onOpenDonateModal,
  onOpenCampaignDetails,
  onLogout,
  onBackToLanding,
  onDeleteAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'donations' | 'impact' | 'favorites' | 'request_aid' | 'messages' | 'profile' | 'settings'>('dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [favoriteList, setFavoriteList] = useState<string[]>(['camp-1']);
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Search in campaigns
  const [searchCampaignQuery, setSearchCampaignQuery] = useState('');
  const [campaignCategoryFilter, setCampaignCategoryFilter] = useState('all');

  // Aid request form (Seeker mode)
  const [aidType, setAidType] = useState('Food Ration Kit');
  const [aidLocation, setAidLocation] = useState('Pune, Maharashtra');
  const [aidUrgency, setAidUrgency] = useState('Urgent');
  const [aidDescription, setAidDescription] = useState('');
  const [aidSubmitted, setAidSubmitted] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileUsername, setProfileUsername] = useState(currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, '_'));
  const [profileLocation, setProfileLocation] = useState(currentUser.location || 'Pune, Maharashtra');
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '+91 98450 12345');
  const [profileSkills, setProfileSkills] = useState(currentUser.skills || 'Education Sponsorship, Food Relief, Medical Aid');
  const [profileBio, setProfileBio] = useState(currentUser.bio || 'Regular supporter committed to transparent grassroots philanthropy.');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Messages state
  // Determine NGOs where donor has made a contribution
  const donatedNgoNames: string[] = Array.from(new Set(donations.map(d => d.organizationName)));
  const [activeChatNgo, setActiveChatNgo] = useState<string>(donatedNgoNames[0] || 'NeedBridge Foundation');
  const [messageInput, setMessageInput] = useState('');
  
  // Real messages loaded from StorageService
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return StorageService.getConversation(currentUser.id, activeChatNgo);
  });

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return StorageService.getTheme() || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    StorageService.setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Re-sync messages when active NGO changes
  useEffect(() => {
    if (activeChatNgo) {
      setChatMessages(StorageService.getConversation(currentUser.id, activeChatNgo));
    }
  }, [activeChatNgo, currentUser.id]);

  // Settings & Delete Account State
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [monthlyDigest, setMonthlyDigest] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const totalDonated = donations.reduce((acc, d) => acc + d.amount, 0);
  const featuredCampaigns = campaigns.slice(0, 3);

  const toggleFavorite = (id: string) => {
    if (favoriteList.includes(id)) {
      setFavoriteList(favoriteList.filter(i => i !== id));
    } else {
      setFavoriteList([...favoriteList, id]);
    }
  };

  const handleAidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aidDescription.trim()) return;
    setAidSubmitted(true);
    setTimeout(() => {
      setAidSubmitted(false);
      setAidDescription('');
      alert('Your Aid Support Request has been routed to verified local NGOs.');
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatNgo) return;
    
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId: activeChatNgo,
      recipientName: activeChatNgo,
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    StorageService.saveMessage(newMsg);
    setChatMessages(prev => [...prev, newMsg]);
    setMessageInput('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateUser(currentUser.id, {
      name: profileName,
      username: profileUsername,
      location: profileLocation,
      phone: profilePhone,
      skills: profileSkills,
      bio: profileBio
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleDeleteAccountConfirm = () => {
    if (deleteConfirmText.toLowerCase() === 'delete') {
      setShowDeleteModal(false);
      onDeleteAccount();
    }
  };

  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  type DonorTab = 'dashboard' | 'campaigns' | 'donations' | 'impact' | 'favorites' | 'request_aid' | 'messages' | 'profile' | 'settings';

  interface NavItem {
    id: DonorTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Flag, badge: campaigns.length },
    { id: 'donations', label: 'My Donations', icon: HeartHandshake, badge: donations.length },
    { id: 'impact', label: 'My Impact', icon: Award },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: favoriteList.length },
    { id: 'request_aid', label: 'Request Support', icon: FilePlus2 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* APP HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
        
        {/* Left Side: Three Dash Menu Button + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="donor-sidebar-toggle-btn"
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              setIsMobileDrawerOpen(!isMobileDrawerOpen);
            }}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            title="Toggle Sidebar Navigation"
            aria-label="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => handleTabClick('dashboard')}
            title="NeedBridge Supporter Portal - Go to Dashboard"
          >
            <HelpingHandsLogo size="sm" />
            <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Supporter Portal
            </span>
          </div>
        </div>

        {/* Right Side: Theme Toggle, Notification, Profile, Exit */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Theme Toggle Button */}
          <button
            onClick={handleToggleTheme}
            id="donor-theme-toggle-btn"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative cursor-pointer"
              title="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in">
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">Notifications</p>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/50 text-purple-900 dark:text-purple-200">
                    <p className="font-semibold">80G Tax Receipt Ready</p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-400">Download your tax deduction receipt under My Donations.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User profile capsule */}
          <button 
            onClick={() => handleTabClick('profile')}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 text-left hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img 
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
              alt={currentUser.name} 
              className="w-8 h-8 rounded-full object-cover border border-purple-400 shadow-xs" 
            />
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                {currentUser.name} <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold block -mt-0.5">
                {currentUser.username ? `@${currentUser.username}` : 'Community Supporter'}
              </span>
            </div>
          </button>

          <button
            onClick={onBackToLanding}
            className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Exit to Home
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col justify-between z-50 border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <HelpingHandsLogo size="sm" />
                <button 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-700 text-white shadow-sm shadow-purple-700/30'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD BODY */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        
        {/* DESKTOP COLLAPSIBLE SIDEBAR */}
        {isSidebarOpen && (
          <aside className="hidden lg:flex w-64 shrink-0 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex-col justify-between h-fit sticky top-20 space-y-6 transition-all">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Navigation</span>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>

              {navItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`donor-nav-${item.id}`}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-700 text-white shadow-sm shadow-purple-700/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComp className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        )}

        {!isSidebarOpen && (
          <aside className="hidden lg:flex w-16 shrink-0 bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex-col items-center justify-between h-fit sticky top-20 space-y-4 transition-all animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-2 w-full">
              {/* Collapsed Header with Logo */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group flex flex-col items-center cursor-pointer"
                title="Expand Full Sidebar"
              >
                <HelpingHandsLogo size="sm" showText={false} />
                <span className="text-[8px] font-bold text-purple-600 dark:text-purple-400 mt-1 opacity-80 group-hover:opacity-100 flex items-center gap-0.5">
                  <PanelLeftOpen className="w-2.5 h-2.5" />
                </span>
              </button>

              <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 my-1" />

              {/* Icon quick links */}
              <div className="flex flex-col items-center gap-1.5 w-full">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`relative p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                        isActive
                          ? 'bg-purple-700 text-white shadow-sm shadow-purple-700/30'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-4 h-4" />
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 w-full flex justify-center">
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}

        {/* MAIN VIEWPORT (Renders activeTab) */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD (OVERVIEW) */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* WELCOME BANNER */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
                    Welcome, {currentUser.name.split(' ')[0]}! 💜
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {currentUser.username ? `@${currentUser.username} • ` : ''}Thank you for powering community relief and grassroots causes.
                  </p>
                </div>

                <button
                  onClick={() => handleTabClick('campaigns')}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Support a Cause</span>
                </button>
              </div>

              {/* 3 STAT SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-400 font-display">
                    ₹{totalDonated.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Total Contributions</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400 font-display">
                    {donations.length}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Drives Funded</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400 font-display">
                    {donations.length * 15 + 20}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">People Assisted</p>
                </div>
              </div>

              {/* FEATURED CAUSES */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Verified Grassroots Drives</h3>
                    <p className="text-xs text-slate-500">Transparent initiatives requiring direct funding</p>
                  </div>
                  <button 
                    onClick={() => handleTabClick('campaigns')}
                    className="text-xs font-bold text-purple-600 hover:underline cursor-pointer"
                  >
                    View All ({campaigns.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {featuredCampaigns.map((camp) => {
                    const percent = camp.targetAmount > 0 ? Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100)) : 0;
                    return (
                      <div key={camp.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group bg-white dark:bg-slate-850">
                        <div className="relative h-28 w-full overflow-hidden">
                          <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold">
                            {camp.category}
                          </div>
                        </div>

                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{camp.title}</h4>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" /> {camp.location}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-500">Raised ₹{camp.raisedAmount.toLocaleString()}</span>
                              <span className="font-bold text-purple-700 dark:text-purple-400">{percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                              <div className="h-full bg-purple-600 rounded-full" style={{ width: `${percent}%` }} />
                            </div>

                            <button
                              onClick={() => onOpenDonateModal(camp)}
                              className="w-full py-1.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-800 dark:text-purple-300 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                            >
                              Donate Now
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CAMPAIGNS (EXPLORE & DONATE) */}
          {/* ========================================================================= */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    Explore Verified Campaigns
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Support transparent social initiatives with instant 80G tax receipts and escrow safety.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchCampaignQuery}
                    onChange={(e) => setSearchCampaignQuery(e.target.value)}
                    placeholder="Search causes, cities..."
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {['all', 'Education', 'Environment', 'Healthcare', 'Women Support', 'Animal Welfare'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCampaignCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-colors ${
                      campaignCategoryFilter === cat
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns
                  .filter(c => {
                    const matchCat = campaignCategoryFilter === 'all' || c.category.toLowerCase() === campaignCategoryFilter.toLowerCase();
                    const matchSearch = c.title.toLowerCase().includes(searchCampaignQuery.toLowerCase()) || c.location.toLowerCase().includes(searchCampaignQuery.toLowerCase());
                    return matchCat && matchSearch;
                  })
                  .map((camp) => {
                    const percent = camp.targetAmount > 0 ? Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100)) : 0;
                    return (
                      <div key={camp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs">
                        <div className="relative h-36 w-full">
                          <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover" />
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-bold">
                            {camp.category}
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{camp.title}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {camp.location}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{camp.description}</p>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500">₹{camp.raisedAmount.toLocaleString()} of ₹{camp.targetAmount.toLocaleString()}</span>
                              <span className="font-bold text-purple-600">{percent}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                              <div className="h-full bg-purple-600 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => onOpenCampaignDetails(camp)}
                                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => onOpenDonateModal(camp)}
                                className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                              >
                                Donate
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: MY DONATIONS (RECEIPTS & 80G DOWNLOAD) */}
          {/* ========================================================================= */}
          {activeTab === 'donations' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    My Donation Ledger & Tax Receipts
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Download verified 80G tax exemption certificates and review payment receipts.
                  </p>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-2xl text-right">
                  <span className="text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300">Total Donated</span>
                  <p className="text-xl font-black text-purple-700 dark:text-purple-400 font-display">₹{totalDonated.toLocaleString()}</p>
                </div>
              </div>

              {donations.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                  <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No donations yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Start making an impact by supporting an education, animal welfare, or medical relief campaign today.
                  </p>
                  <button
                    onClick={() => handleTabClick('campaigns')}
                    className="px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Browse Causes
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                  {donations.map((don) => (
                    <div key={don.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                          ₹
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{don.campaignTitle || 'General Community Support Fund'}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Recipient NGO: Verified NeedBridge Partner</p>
                          <span className="text-[10px] text-slate-400 font-mono">Date: {don.date} • Txn Ref: #{don.id.slice(-8)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-base font-black text-purple-700 dark:text-purple-400 font-display">₹{don.amount.toLocaleString()}</span>
                          <span className="block text-[10px] text-emerald-600 font-semibold">Payment Settled</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Official 80G Tax Exemption Receipt for ₹${don.amount} has been downloaded to your device.`)}
                          className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>80G Receipt</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: IMPACT */}
          {/* ========================================================================= */}
          {activeTab === 'impact' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  My Community Impact Breakdown
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tangible grassroots transformation enabled by your direct contributions.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-3xl font-black text-purple-600 font-display">{Math.max(1, donations.length * 8)}</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Meals Sponsored</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-3xl font-black text-blue-600 font-display">{Math.max(1, donations.length * 4)}</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Students Tutored</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-3xl font-black text-emerald-600 font-display">{Math.max(1, donations.length * 10)}</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Trees Planted</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-3xl font-black text-amber-600 font-display">100%</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Escrow Transparency</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: FAVORITES */}
          {/* ========================================================================= */}
          {activeTab === 'favorites' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Saved Campaigns & Causes
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Causes you bookmarked to support in future donation cycles.
                </p>
              </div>

              {favoriteList.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No saved causes</h3>
                  <p className="text-xs text-slate-500">Bookmark causes by clicking the heart icon on any campaign card.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteList.map(favId => {
                    const camp = campaigns.find(c => c.id === favId) || campaigns[0];
                    return (
                      <div key={favId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={camp.imageUrl} alt={camp.title} className="w-14 h-14 rounded-xl object-cover" />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{camp.title}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {camp.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavorite(favId)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenDonateModal(camp)}
                            className="px-3 py-1.5 bg-purple-700 text-white text-xs font-bold rounded-xl"
                          >
                            Donate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: REQUEST SUPPORT (FOR SEEKERS) */}
          {/* ========================================================================= */}
          {activeTab === 'request_aid' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Community Aid & Emergency Assistance Portal
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Need direct assistance for food rations, student school kits, medical aid, or emergency supplies? Submit your request below.
                </p>
              </div>

              <form onSubmit={handleAidSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Aid Type Required</label>
                    <select
                      value={aidType}
                      onChange={(e) => setAidType(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Food Ration Kit">Food Ration & Nutrition Kit</option>
                      <option value="School Books / Education">School Literacy & Books Kit</option>
                      <option value="Medical / Medicines">Emergency Medical Assistance</option>
                      <option value="Disaster Relief">Disaster Relief / Shelter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Area / Location</label>
                    <input
                      type="text"
                      required
                      value={aidLocation}
                      onChange={(e) => setAidLocation(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Urgency Level</label>
                    <select
                      value={aidUrgency}
                      onChange={(e) => setAidUrgency(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Normal">Normal (Within 1 week)</option>
                      <option value="Urgent">Urgent (Within 48 hours)</option>
                      <option value="Critical">Critical Emergency (Immediate)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Description of Requirement</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe how many families or individuals need aid, contact numbers, and specific needs..."
                    value={aidDescription}
                    onChange={(e) => setAidDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    {aidSubmitted ? 'Submitting to Local NGOs...' : 'Submit Aid Request'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: MESSAGES */}
          {/* ========================================================================= */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Direct Messages with NGOs
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Connect with grassroots foundations you have supported regarding drive updates and tax verification.
                </p>
              </div>

              {/* Requirement: Only donors who have contributed can message NGOs */}
              {donations.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 sm:p-14 text-center border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Direct Messaging is Locked
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Supporter messaging unlocks once you have contributed to or supported at least one verified NGO campaign. This ensures foundations prioritize inquiries from active contributors.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('campaigns')}
                    className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors inline-flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Explore Campaigns & Donate</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
                  <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                      Supported Organizations ({donatedNgoNames.length})
                    </span>
                    {donatedNgoNames.map((org) => {
                      const isSel = activeChatNgo === org;
                      return (
                        <button
                          key={org}
                          type="button"
                          onClick={() => setActiveChatNgo(org)}
                          className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {org.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{org}</p>
                            <p className="text-[10px] text-slate-500 truncate">Verified Partner NGO</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="md:col-span-8 flex flex-col justify-between p-4 bg-slate-50/50 dark:bg-slate-950/40 min-h-[420px]">
                    <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{activeChatNgo}</h4>
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Verified Partner NGO</p>
                    </div>

                    <div className="py-4 space-y-3 overflow-y-auto max-h-[300px] flex-1 flex flex-col justify-center">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-8 space-y-2">
                          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            No chat history yet
                          </p>
                          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                            Send your first message to {activeChatNgo} regarding tax certificates, utilization reports, or field updates.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 w-full">
                          {chatMessages.map(msg => {
                            const isMe = msg.senderId === currentUser.id || msg.senderName === currentUser.name;
                            return (
                              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs sm:max-w-md p-3 rounded-2xl text-xs ${
                                  isMe
                                    ? 'bg-purple-700 text-white rounded-br-xs'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-bl-xs'
                                }`}>
                                  <p>{msg.text}</p>
                                  <span className={`text-[9px] mt-1 block text-right ${isMe ? 'text-purple-200' : 'text-slate-400'}`}>
                                    {msg.timestamp}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder={`Type a message to ${activeChatNgo}...`}
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: PROFILE */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Supporter / Seeker Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage your personal details, custom username, contact info, and giving preferences.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                {profileSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Profile saved successfully!</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-500 shadow-sm"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{profileName}</h3>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">@{profileUsername} • Verified Supporter</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Member since {currentUser.joinedDate || 'Aug 2026'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">@</span>
                      <input
                        type="text"
                        required
                        value={profileUsername}
                        onChange={(e) => setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full pl-7 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Causes</label>
                    <input
                      type="text"
                      value={profileSkills}
                      onChange={(e) => setProfileSkills(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Short Bio</label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: SETTINGS (SETTINGS + DELETE ACCOUNT) */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Supporter Settings & Preferences
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage notification preferences, 80G tax receipt emails, and account security.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Receipts & Alerts</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Instant 80G Tax Receipt by Email</p>
                      <p className="text-[11px] text-slate-500">Automatically receive PDF tax receipts immediately after every donation.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailReceipts}
                      onChange={(e) => setEmailReceipts(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Monthly Impact Newsletter</p>
                      <p className="text-[11px] text-slate-500">Receive progress updates on the projects you have contributed to.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={monthlyDigest}
                      onChange={(e) => setMonthlyDigest(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* DANGER ZONE - DELETE ACCOUNT */}
              <div className="bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl p-6 border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm font-bold font-display">Danger Zone</h3>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Delete Your Supporter Account</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-lg mt-0.5">
                      Permanently delete your profile (@{currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, '_')}), donation records, and aid requests. This action cannot be undone.
                    </p>
                  </div>

                  <button
                    type="button"
                    id="delete-donor-account-btn"
                    onClick={() => {
                      setDeleteConfirmText('');
                      setShowDeleteModal(true);
                    }}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-colors self-start sm:self-auto shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="text-base font-bold font-display">Delete Account Permanently?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete your account for <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong> ({currentUser.email})?
              </p>
              <div className="p-3 my-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-[11px] text-rose-800 dark:text-rose-300 text-left">
                ⚠️ All your donation history, tax receipts, and saved causes will be deleted immediately.
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center">
                Type <span className="font-mono text-rose-600 dark:text-rose-400">delete</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete"
                className="w-full px-3.5 py-2 text-center text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                onClick={handleDeleteAccountConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

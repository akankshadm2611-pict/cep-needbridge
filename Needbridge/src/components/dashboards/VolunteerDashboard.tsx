import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Flag, 
  Briefcase, 
  FileCheck, 
  Award, 
  Heart, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  ChevronDown, 
  MapPin, 
  GraduationCap, 
  TreePine, 
  Activity, 
  Users, 
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Check,
  Info,
  Menu,
  X,
  Trash2,
  AlertTriangle,
  Send,
  Download,
  Share2,
  ShieldCheck,
  Eye,
  Edit3,
  Save,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  Phone,
  Mail,
  Lock,
  AtSign,
  Bookmark,
  Navigation,
  Compass,
  SlidersHorizontal,
  Sun,
  Moon,
  Crosshair
} from 'lucide-react';
import { HelpingHandsLogo } from '../HelpingHandsLogo';
import { Campaign, VolunteerOpportunity, UserProfile, ChatMessage } from '../../types';
import { StorageService } from '../../lib/storage';
import { 
  POPULAR_LOCATIONS, 
  DEFAULT_USER_LOCATION, 
  calculateDistanceKm, 
  formatDistance, 
  getUserBrowserCoordinates, 
  UserCoordinates 
} from '../../lib/geo';
import { OpportunityDetailsModal } from '../modals/OpportunityDetailsModal';

interface VolunteerDashboardProps {
  currentUser: UserProfile;
  campaigns: Campaign[];
  opportunities: VolunteerOpportunity[];
  onOpenCampaignDetails: (campaign: Campaign) => void;
  onOpenApplyModal: (opp: VolunteerOpportunity) => void;
  onLogout: () => void;
  onBackToLanding: () => void;
  onDeleteAccount: () => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  currentUser,
  campaigns,
  opportunities,
  onOpenCampaignDetails,
  onOpenApplyModal,
  onLogout,
  onBackToLanding,
  onDeleteAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'opportunities' | 'applications' | 'impact' | 'favorites' | 'messages' | 'profile' | 'settings'>('dashboard');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [appliedList, setAppliedList] = useState<string[]>(['opp-1']);
  const [favoriteList, setFavoriteList] = useState<string[]>(['camp-1', 'opp-2']);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => StorageService.getTheme());
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    StorageService.setTheme(nextTheme);
  };

  // Location & Radius Filtering State
  const [userLocation, setUserLocation] = useState<UserCoordinates>(DEFAULT_USER_LOCATION);
  const [radiusFilterKm, setRadiusFilterKm] = useState<number | 'all'>(100); // Default to 100km radius as requested by user
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [selectedOppForDetails, setSelectedOppForDetails] = useState<VolunteerOpportunity | null>(null);

  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    try {
      const coords = await getUserBrowserCoordinates();
      setUserLocation(coords);
    } catch {
      setUserLocation(DEFAULT_USER_LOCATION);
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Sidebar Slide/Collapse State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Search queries for tabs
  const [searchCampaignQuery, setSearchCampaignQuery] = useState('');
  const [campaignCatFilter, setCampaignCatFilter] = useState('all');
  const [searchOppQuery, setSearchOppQuery] = useState('');
  const [oppCatFilter, setOppCatFilter] = useState('all');

  // Messages state
  // Determine NGOs where volunteer has applied
  const appliedOpportunities = opportunities.filter(o => appliedList.includes(o.id));
  const appliedNgoNames: string[] = Array.from(new Set(appliedOpportunities.map(o => o.organizationName)));
  
  const [activeChatNgo, setActiveChatNgo] = useState<string>(appliedNgoNames[0] || 'Helping Hands Foundation NGO');
  const [messageInput, setMessageInput] = useState('');
  
  // Real messages loaded from StorageService
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return StorageService.getConversation(currentUser.id, activeChatNgo);
  });

  // Re-sync messages when active NGO changes
  useEffect(() => {
    if (activeChatNgo) {
      setChatMessages(StorageService.getConversation(currentUser.id, activeChatNgo));
    }
  }, [activeChatNgo, currentUser.id]);

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileUsername, setProfileUsername] = useState(currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, '_'));
  const [profileBio, setProfileBio] = useState(currentUser.bio || 'Passionate community volunteer enthusiastic about weekend child education, tree plantation, and disaster food relief.');
  const [profileLocation, setProfileLocation] = useState(currentUser.location || 'Pune, Maharashtra');
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '+91 98234 56789');
  const [profileSkills, setProfileSkills] = useState(currentUser.skills || 'Teaching, First Aid, Event Coordination, Logistics');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Settings & Delete Account State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const causesCategories = [
    { id: 'Education', label: 'Education', icon: GraduationCap, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
    { id: 'Environment', label: 'Environment', icon: TreePine, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
    { id: 'Healthcare', label: 'Healthcare', icon: Activity, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' },
    { id: 'Women Support', label: 'Women Support', icon: Users, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' },
    { id: 'Animal Welfare', label: 'Animal Welfare', icon: Heart, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
    { id: 'Others', label: 'Others', icon: Sparkles, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
  ];

  const featuredCampaigns = campaigns.slice(0, 3);
  const displayOpportunities = selectedCategoryFilter 
    ? opportunities.filter(o => o.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase()) || o.title.toLowerCase().includes(selectedCategoryFilter.toLowerCase()))
    : opportunities.slice(0, 4);

  const toggleFavorite = (id: string) => {
    if (favoriteList.includes(id)) {
      setFavoriteList(favoriteList.filter(item => item !== id));
    } else {
      setFavoriteList([...favoriteList, id]);
    }
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
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const handleDeleteAccountConfirm = () => {
    if (deleteConfirmText.toLowerCase() === 'delete') {
      setShowDeleteModal(false);
      onDeleteAccount();
    }
  };

  // Helper to switch tab and close mobile drawer
  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  type VolunteerTab = 'dashboard' | 'campaigns' | 'opportunities' | 'applications' | 'impact' | 'favorites' | 'messages' | 'profile' | 'settings';

  interface NavItem {
    id: VolunteerTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  // Nav Items definition
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Flag },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'applications', label: 'My Applications', icon: FileCheck, badge: appliedList.length },
    { id: 'impact', label: 'My Impact', icon: Award },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: favoriteList.length },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* TOP APP HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs transition-colors duration-200">
        
        {/* Left Side: Three Dash / Hamburger Button + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="volunteer-sidebar-toggle-btn"
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              setIsMobileDrawerOpen(!isMobileDrawerOpen);
            }}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            title="Toggle Sidebar Navigation"
            aria-label="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => handleTabClick('dashboard')}
            title="NeedBridge Volunteer Portal - Go to Dashboard"
          >
            <HelpingHandsLogo size="sm" />
            <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Volunteer Hub
            </span>
          </div>
        </div>

        {/* Center / Location Selector Capsule */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 font-medium">Location:</span>
          <select
            value={userLocation.label}
            onChange={(e) => {
              const matched = POPULAR_LOCATIONS.find(loc => loc.label === e.target.value);
              if (matched) setUserLocation(matched);
            }}
            aria-label="Select location"
            className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={loc.label} value={loc.label} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {loc.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleDetectGps}
            disabled={isDetectingGps}
            className="ml-1 p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            title="Detect My Live GPS Location"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Right Side: Theme Toggle, Notifications, Profile Capsule, Exit */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            id="volunteer-theme-toggle-btn"
            onClick={handleToggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180 duration-200" />
            )}
            <span className="hidden xl:inline text-xs font-semibold">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative cursor-pointer"
              title="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in">
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">Notifications</p>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 text-blue-900 dark:text-blue-200">
                    <p className="font-semibold">Application Accepted! 🎉</p>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400">Helping Hands accepted your application for Weekend Food Drive.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200">
                    <p className="font-semibold">New Drive in {userLocation.city}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Tree plantation drive added within your active radius.</p>
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
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
              alt={currentUser.name} 
              className="w-8 h-8 rounded-full object-cover border border-blue-400 shadow-xs" 
            />
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                {currentUser.name.split(' ')[0]} <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block -mt-0.5">
                {currentUser.username ? `@${currentUser.username}` : 'Volunteer'}
              </span>
            </div>
          </button>

          <button
            onClick={onBackToLanding}
            className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Exit
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer content */}
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
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'}`}>
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

      {/* DASHBOARD LAYOUT */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        
        {/* DESKTOP COLLAPSIBLE SIDEBAR */}
        {isSidebarOpen && (
          <aside className="hidden lg:flex w-64 shrink-0 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex-col justify-between h-fit sticky top-20 space-y-6 transition-all duration-300">
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
                    id={`vol-nav-${item.id}`}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComp className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'}`}>
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

        {/* Collapsed Sidebar with WEBSITE LOGO & Quick Icons */}
        {!isSidebarOpen && (
          <aside className="hidden lg:flex w-16 shrink-0 bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/90 dark:border-slate-800 shadow-xs flex-col items-center justify-between h-fit sticky top-20 space-y-4 transition-all duration-300">
            <div className="flex flex-col items-center space-y-3 w-full">
              {/* Logo button to re-expand */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-all hover:scale-105 cursor-pointer flex flex-col items-center group"
                title="Expand Navigation Menu"
                aria-label="Expand Navigation Menu"
              >
                <HelpingHandsLogo size="sm" showText={false} />
                <span className="text-[7.5px] font-bold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-tighter">Expand</span>
              </button>

              <div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800" />

              {/* Quick icons */}
              <div className="flex flex-col items-center space-y-1.5 w-full">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`p-2.5 rounded-xl transition-all relative group cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-4 h-4" />
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 w-full flex justify-center">
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}

        {/* MAIN VIEWPORT CONTENT (Dynamically renders activeTab) */}
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
                    Welcome back, {currentUser.name.split(' ')[0]}! 👋
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {currentUser.username ? `@${currentUser.username} • ` : ''}Ready to make a verified community difference this week?
                  </p>
                </div>

                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/80 rounded-xl flex items-center gap-2.5 self-start sm:self-auto">
                  <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-blue-900 dark:text-blue-200">Active Volunteer</p>
                    <p className="text-[10px] text-blue-700 dark:text-blue-300">Level 2 Verified Contributor</p>
                  </div>
                </div>
              </div>

              {/* LOCATION & RADIUS FILTER CONTROL BAR */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/10 text-blue-200">
                      <Compass className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Nearby Drives & Campaigns</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold">
                          Live Radius Filter Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-0.5">
                        Current Base: <strong>{userLocation.city}, {userLocation.state}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-blue-200 font-semibold flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Max Radius:
                    </span>
                    {[10, 25, 50, 100, 'all'].map((r) => (
                      <button
                        key={String(r)}
                        onClick={() => setRadiusFilterKm(r as number | 'all')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          radiusFilterKm === r
                            ? 'bg-white text-blue-900 shadow-md scale-105'
                            : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                        }`}
                      >
                        {r === 'all' ? 'All India' : `Within ${r} km`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-200">
                  <span>
                    Showing verified opportunities and NGO campaigns matching your radius ({radiusFilterKm === 'all' ? 'All regions' : `Within ${radiusFilterKm} km of ${userLocation.city}`}).
                  </span>
                  <button
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors cursor-pointer"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    <span>{isDetectingGps ? 'Detecting GPS...' : 'Update My Live Location'}</span>
                  </button>
                </div>
              </div>

              {/* IMPACT SUMMARY STATS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400 font-display">
                    {appliedList.length}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Drives Applied</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400 font-display">
                    {appliedList.length * 4 + 8}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Hours Logged</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-400 font-display">
                    {appliedList.length * 25 + 40}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">People Supported</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display">
                    2
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Badges Earned</p>
                </div>
              </div>

              {/* FEATURED CAMPAIGNS (Within Radius) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Featured Community Campaigns</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Verified grassroots drives near {userLocation.city}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleTabClick('campaigns')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    View All ({campaigns.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {campaigns
                    .filter(c => {
                      if (radiusFilterKm === 'all') return true;
                      if (!c.latitude || !c.longitude) return true;
                      const dist = calculateDistanceKm(userLocation.latitude, userLocation.longitude, c.latitude, c.longitude);
                      return dist <= radiusFilterKm;
                    })
                    .slice(0, 3)
                    .map((camp) => {
                      const percent = camp.targetAmount > 0 ? Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100)) : 0;
                      const dist = (camp.latitude && camp.longitude) 
                        ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, camp.latitude, camp.longitude)
                        : undefined;

                      return (
                        <div 
                          key={camp.id} 
                          className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group bg-white dark:bg-slate-850"
                        >
                          <div className="relative h-32 w-full overflow-hidden">
                            <img 
                              src={camp.imageUrl} 
                              alt={camp.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold">
                              {camp.category}
                            </div>
                            {dist !== undefined && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                                <Navigation className="w-2.5 h-2.5" />
                                {formatDistance(dist)}
                              </div>
                            )}
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {camp.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="line-clamp-1">{camp.location}</span>
                              </p>
                              {camp.timeSlot && (
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {camp.timeSlot}
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="text-slate-500 dark:text-slate-400">Progress</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{percent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2.5">
                                <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                              </div>

                              <button
                                onClick={() => onOpenCampaignDetails(camp)}
                                className="w-full py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                              >
                                View Full Requirements
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* OPPORTUNITIES FOR YOU (Filtered within Radius) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Opportunities For You</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Volunteer roles within {radiusFilterKm === 'all' ? 'All India' : `${radiusFilterKm} km of ${userLocation.city}`}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleTabClick('opportunities')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    View All ({opportunities.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {opportunities
                    .filter(o => {
                      if (radiusFilterKm === 'all') return true;
                      if (!o.latitude || !o.longitude) return true;
                      const dist = calculateDistanceKm(userLocation.latitude, userLocation.longitude, o.latitude, o.longitude);
                      return dist <= radiusFilterKm;
                    })
                    .slice(0, 4)
                    .map((opp) => {
                      const isApplied = appliedList.includes(opp.id);
                      const dist = (opp.latitude && opp.longitude)
                        ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, opp.latitude, opp.longitude)
                        : undefined;

                      return (
                        <div 
                          key={opp.id} 
                          className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-all bg-white dark:bg-slate-900 shadow-xs"
                        >
                          <div className="flex items-start sm:items-center gap-3.5">
                            <img 
                              src={opp.imageUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=100&auto=format&fit=crop&q=80'} 
                              alt={opp.title} 
                              className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-800" 
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{opp.title}</h4>
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-semibold border border-blue-200 dark:border-blue-800">
                                  {opp.category}
                                </span>
                                {dist !== undefined && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                    <Navigation className="w-2.5 h-2.5" />
                                    {formatDistance(dist)}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {opp.timeSlot || opp.hoursPerDay}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {opp.location}
                                </span>
                                <span>•</span>
                                <span className="text-blue-700 dark:text-blue-400 font-semibold">{opp.startsFrom}</span>
                              </div>

                              {opp.skillsRequired && opp.skillsRequired.length > 0 && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                  <strong className="text-slate-700 dark:text-slate-300">Skills:</strong> {opp.skillsRequired.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedOppForDetails(opp)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                            >
                              View Details
                            </button>

                            <button
                              onClick={() => toggleFavorite(opp.id)}
                              className={`p-2 rounded-xl border transition-colors ${
                                favoriteList.includes(opp.id) 
                                  ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-400' 
                                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                              }`}
                              title="Bookmark drive"
                            >
                              <Heart className={`w-3.5 h-3.5 ${favoriteList.includes(opp.id) ? 'fill-current' : ''}`} />
                            </button>

                            {isApplied ? (
                              <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                <Check className="w-3.5 h-3.5" />
                                Applied
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  onOpenApplyModal(opp);
                                  if (!appliedList.includes(opp.id)) {
                                    setAppliedList([...appliedList, opp.id]);
                                  }
                                }}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                              >
                                Apply Now
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CAMPAIGNS (EXPLORE ALL CAMPAIGNS WITH RADIUS FILTER) */}
          {/* ========================================================================= */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    Community Campaigns
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Explore verified campaigns requiring volunteers, material supplies, and donations in your radius.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchCampaignQuery}
                      onChange={(e) => setSearchCampaignQuery(e.target.value)}
                      placeholder="Search campaigns, cities..."
                      className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Radius and Category Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category:</span>
                  {['all', 'Education', 'Environment', 'Healthcare', 'Women Support', 'Animal Welfare'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCampaignCatFilter(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        campaignCatFilter === cat
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Radius:
                  </span>
                  {[10, 25, 50, 100, 'all'].map((r) => (
                    <button
                      key={String(r)}
                      onClick={() => setRadiusFilterKm(r as number | 'all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        radiusFilterKm === r
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {r === 'all' ? 'All' : `${r}km`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaigns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns
                  .filter(c => {
                    const matchCat = campaignCatFilter === 'all' || c.category.toLowerCase() === campaignCatFilter.toLowerCase();
                    const matchSearch = c.title.toLowerCase().includes(searchCampaignQuery.toLowerCase()) || c.location.toLowerCase().includes(searchCampaignQuery.toLowerCase());
                    let matchRadius = true;
                    if (radiusFilterKm !== 'all' && c.latitude && c.longitude) {
                      const dist = calculateDistanceKm(userLocation.latitude, userLocation.longitude, c.latitude, c.longitude);
                      matchRadius = dist <= radiusFilterKm;
                    }
                    return matchCat && matchSearch && matchRadius;
                  })
                  .map((camp) => {
                    const percent = camp.targetAmount > 0 ? Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100)) : 0;
                    const dist = (camp.latitude && camp.longitude)
                      ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, camp.latitude, camp.longitude)
                      : undefined;

                    return (
                      <div key={camp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                        <div className="relative h-40 w-full">
                          <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover" />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                            {camp.category}
                          </span>
                          {dist !== undefined && (
                            <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                              <Navigation className="w-2.5 h-2.5" />
                              {formatDistance(dist)}
                            </span>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{camp.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {camp.location}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{camp.description}</p>
                            
                            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                              {camp.startDate && (
                                <p className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-blue-500" />
                                  <span>{camp.startDate} {camp.endDate ? `to ${camp.endDate}` : ''}</span>
                                </p>
                              )}
                              {camp.timeSlot && (
                                <p className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span>{camp.timeSlot}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500">Raised: ₹{camp.raisedAmount.toLocaleString()}</span>
                              <span className="font-bold text-blue-600">{percent}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <button
                              onClick={() => onOpenCampaignDetails(camp)}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              View Full Campaign Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: OPPORTUNITIES (EXPLORE ALL OPPORTUNITIES WITH DISTANCE FILTER) */}
          {/* ========================================================================= */}
          {activeTab === 'opportunities' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    Volunteer Opportunities & Field Drives
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Find drives matching your location, schedule, and category interests.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchOppQuery}
                    onChange={(e) => setSearchOppQuery(e.target.value)}
                    placeholder="Search drives, skills, locations..."
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Radius & Category Filter Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category:</span>
                  {['all', 'Education', 'Environment', 'Healthcare', 'Women Support', 'Animal Welfare'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setOppCatFilter(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        oppCatFilter === cat
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" /> Distance Radius:
                  </span>
                  {[10, 25, 50, 100, 'all'].map((r) => (
                    <button
                      key={String(r)}
                      onClick={() => setRadiusFilterKm(r as number | 'all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        radiusFilterKm === r
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {r === 'all' ? 'All' : `${r}km`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities
                  .filter(o => {
                    const matchCat = oppCatFilter === 'all' || o.category.toLowerCase() === oppCatFilter.toLowerCase();
                    const matchSearch = o.title.toLowerCase().includes(searchOppQuery.toLowerCase()) || o.category.toLowerCase().includes(searchOppQuery.toLowerCase()) || o.location.toLowerCase().includes(searchOppQuery.toLowerCase());
                    let matchRadius = true;
                    if (radiusFilterKm !== 'all' && o.latitude && o.longitude) {
                      const dist = calculateDistanceKm(userLocation.latitude, userLocation.longitude, o.latitude, o.longitude);
                      matchRadius = dist <= radiusFilterKm;
                    }
                    return matchCat && matchSearch && matchRadius;
                  })
                  .map((opp) => {
                    const isApplied = appliedList.includes(opp.id);
                    const dist = (opp.latitude && opp.longitude)
                      ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, opp.latitude, opp.longitude)
                      : undefined;

                    return (
                      <div key={opp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-800 transition-all">
                        <div className="flex gap-4">
                          <img src={opp.imageUrl} alt={opp.title} className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-800" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                                {opp.category}
                              </span>
                              {dist !== undefined && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                  <Navigation className="w-2.5 h-2.5" />
                                  {formatDistance(dist)}
                                </span>
                              )}
                              {opp.urgency === 'High' && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-800">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{opp.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="line-clamp-1">{opp.address || opp.location}</span>
                            </p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{opp.description}</p>
                          </div>
                        </div>

                        {/* Requirements preview badge list */}
                        {opp.requirementsChecklist && opp.requirementsChecklist.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="line-clamp-1">Requirements: {opp.requirementsChecklist.join(' • ')}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div className="text-slate-500 space-y-0.5">
                            <p className="flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" /> {opp.timeSlot || opp.hoursPerDay}
                            </p>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{opp.spotsLeft} slots left</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOppForDetails(opp)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                            >
                              Details
                            </button>

                            <button
                              onClick={() => toggleFavorite(opp.id)}
                              className={`p-2 rounded-xl border ${
                                favoriteList.includes(opp.id) ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950 dark:border-rose-800' : 'border-slate-200 dark:border-slate-700 text-slate-400'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${favoriteList.includes(opp.id) ? 'fill-current' : ''}`} />
                            </button>

                            {isApplied ? (
                              <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Enrolled
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  onOpenApplyModal(opp);
                                  if (!appliedList.includes(opp.id)) setAppliedList([...appliedList, opp.id]);
                                }}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                              >
                                Apply Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MY APPLICATIONS & ENROLLED DRIVES */}
          {/* ========================================================================= */}
          {activeTab === 'applications' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    My Volunteer Applications
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Track the status of drives you have signed up for.
                  </p>
                </div>

                <button
                  onClick={() => handleTabClick('opportunities')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  Explore More Drives
                </button>
              </div>

              {appliedList.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                  <FileCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No applications yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You haven't signed up for any volunteer opportunities yet. Join a weekend cause to get started!
                  </p>
                  <button
                    onClick={() => handleTabClick('opportunities')}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Browse Opportunities
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {appliedList.map((oppId, idx) => {
                    const opp = opportunities.find(o => o.id === oppId) || opportunities[0];
                    return (
                      <div key={oppId + idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img src={opp.imageUrl} alt={opp.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                Enrolled & Confirmed
                              </span>
                              <span className="text-xs text-slate-400">• Applied Aug 2026</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{opp.title}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>📍 {opp.location}</span>
                              <span>•</span>
                              <span>⏰ {opp.hoursPerDay}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => handleTabClick('messages')}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                            <span>Contact NGO</span>
                          </button>
                          <button
                            onClick={() => handleTabClick('impact')}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 cursor-pointer"
                          >
                            View Certificate
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
          {/* TAB 5: MY IMPACT & CERTIFICATES */}
          {/* ========================================================================= */}
          {activeTab === 'impact' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  My Verified Impact & Certificates
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Download digital credentials and verified volunteer hours certificates issued by NeedBridge.
                </p>
              </div>

              {/* Digital Certificate Card */}
              <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Award className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-blue-300 font-bold">Certificate of Appreciation</span>
                      <h3 className="text-lg sm:text-xl font-bold font-display">NeedBridge Community Volunteer</h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified On-Chain
                  </span>
                </div>

                <div className="relative z-10 my-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[11px] text-blue-200">Recipient Name</span>
                    <p className="text-base font-bold text-white mt-0.5">{currentUser.name}</p>
                    <p className="text-[11px] text-blue-300">{currentUser.username ? `@${currentUser.username}` : currentUser.email}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[11px] text-blue-200">Verified Service</span>
                    <p className="text-base font-bold text-white mt-0.5">{appliedList.length * 4 + 8} Hours</p>
                    <p className="text-[11px] text-blue-300">Community Drives</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[11px] text-blue-200">Certificate ID</span>
                    <p className="text-base font-mono font-bold text-amber-300 mt-0.5">NB-VOL-2026-{currentUser.id.slice(-4) || '8821'}</p>
                    <p className="text-[11px] text-blue-300">Issued: Aug 2026</p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-2">
                  <p className="text-xs text-blue-200/80 max-w-md">
                    Awarded for dedicated grassroots service in food distribution, child literacy, and environmental care.
                  </p>
                  <button
                    type="button"
                    onClick={() => alert(`Certificate NB-VOL-2026 for ${currentUser.name} is ready for download!`)}
                    className="px-4 py-2 bg-white text-blue-950 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Certificate</span>
                  </button>
                </div>
              </div>

              {/* Badges Earned Showcase */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-4">Badges & Honors</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center mx-auto text-lg">
                      🌟
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Early Contributor</p>
                    <p className="text-[10px] text-slate-500">Joined initial 1,000 volunteers</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto text-lg">
                      🌱
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Eco Guardian</p>
                    <p className="text-[10px] text-slate-500">Completed tree plantation drive</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto text-lg">
                      📚
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Literacy Star</p>
                    <p className="text-[10px] text-slate-500">Weekend tutoring mentor</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto text-lg">
                      🏆
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">10+ Hours Club</p>
                    <p className="text-[10px] text-slate-500">Active monthly impact</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: FAVORITES (SAVED CAUSES) */}
          {/* ========================================================================= */}
          {activeTab === 'favorites' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Saved & Bookmarked Causes
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Keep track of community campaigns and opportunities you plan to support later.
                </p>
              </div>

              {favoriteList.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                  <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No favorites yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click the heart icon on any campaign or opportunity to bookmark it here for quick access.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteList.map(favId => {
                    const opp = opportunities.find(o => o.id === favId);
                    const camp = campaigns.find(c => c.id === favId);
                    const item = opp || camp || opportunities[0];

                    return (
                      <div key={favId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{item.category}</span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" /> {item.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavorite(favId)}
                            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl"
                            title="Remove from favorites"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if ('spotsLeft' in item) onOpenApplyModal(item as any);
                              else onOpenCampaignDetails(item as any);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                          >
                            View
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
          {/* TAB 7: MESSAGES (COMMUNICATION WITH NGOS) */}
          {/* ========================================================================= */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Volunteer Messages & Drive Updates
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Direct communication channel with verified NGO coordinators for drives you have enrolled in.
                </p>
              </div>

              {/* Requirement: Only volunteers who applied for programs can message NGOs */}
              {appliedList.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 sm:p-14 text-center border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Direct Messaging is Locked
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      To prevent coordinator spam, volunteer messaging unlocks once you have applied for at least one volunteer drive or community service program.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('opportunities')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors inline-flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Browse Opportunities & Apply</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
                  {/* Chat list sidebar */}
                  <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                      Enrolled NGO Channels ({appliedNgoNames.length})
                    </span>
                    {appliedNgoNames.map((org) => {
                      const isSel = activeChatNgo === org;
                      return (
                        <button
                          key={org}
                          type="button"
                          onClick={() => setActiveChatNgo(org)}
                          className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {org.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{org}</p>
                            <p className="text-[10px] text-slate-500 truncate">Verified Coordinator Channel</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Chat window */}
                  <div className="md:col-span-8 flex flex-col justify-between p-4 bg-slate-50/50 dark:bg-slate-950/40 min-h-[420px]">
                    <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{activeChatNgo}</h4>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Coordinator Line
                        </p>
                      </div>
                    </div>

                    {/* Chat Messages List or Empty State */}
                    <div className="py-4 space-y-3 overflow-y-auto max-h-[300px] flex-1 flex flex-col justify-center">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-8 space-y-2">
                          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            No chat history yet
                          </p>
                          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                            Send your first message to {activeChatNgo} regarding arrival timings, reporting location, or drive essentials.
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
                                    ? 'bg-blue-600 text-white rounded-br-xs'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-bl-xs'
                                }`}>
                                  <p>{msg.text}</p>
                                  <span className={`text-[9px] mt-1 block text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
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
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
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
          {/* TAB 8: PROFILE (EDIT VOLUNTEER PROFILE) */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Volunteer Public Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage your personal details, custom username, contact info, and volunteer skills.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                {profileSaveSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Profile saved and updated successfully!</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{profileName}</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">@{profileUsername} • Verified Volunteer</p>
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
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location / City</label>
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
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Skills & Interests</label>
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
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: SETTINGS (PREFERENCES + DELETE ACCOUNT) */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Account Settings & Preferences
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage notification alerts, privacy preferences, and account security.
                </p>
              </div>

              {/* Notification Toggles */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Notifications & Privacy</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Email Notifications for New Drives</p>
                      <p className="text-[11px] text-slate-500">Receive weekly digests of volunteer opportunities in your city.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">SMS & WhatsApp Alerts</p>
                      <p className="text-[11px] text-slate-500">Receive instant venue and timing updates for enrolled drives.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Public Volunteer Badges</p>
                      <p className="text-[11px] text-slate-500">Show your verified volunteer hours on community leaderboards.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={publicProfile}
                      onChange={(e) => setPublicProfile(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
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
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Delete Your NeedBridge Account</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-lg mt-0.5">
                      Permanently delete your user profile, username (@{currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, '_')}), volunteer applications history, and certificates. This action cannot be undone.
                    </p>
                  </div>

                  <button
                    type="button"
                    id="delete-account-btn"
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
                ⚠️ All your volunteer drive history, digital certificate, and reserved username will be wiped immediately.
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

      {/* OPPORTUNITY DETAILS & REQUIREMENTS MODAL */}
      {selectedOppForDetails && (
        <OpportunityDetailsModal
          opportunity={selectedOppForDetails}
          userCoords={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            city: userLocation.city,
            state: userLocation.state,
          }}
          isApplied={appliedList.includes(selectedOppForDetails.id)}
          isFavorite={favoriteList.includes(selectedOppForDetails.id)}
          onClose={() => setSelectedOppForDetails(null)}
          onApply={(opp) => {
            onOpenApplyModal(opp);
            if (!appliedList.includes(opp.id)) {
              setAppliedList([...appliedList, opp.id]);
            }
          }}
          onToggleFavorite={(oppId) => toggleFavorite(oppId)}
        />
      )}

    </div>
  );
};

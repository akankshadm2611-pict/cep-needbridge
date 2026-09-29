import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Flag, 
  Users, 
  HeartHandshake, 
  UserCheck, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  ChevronDown, 
  PlusCircle, 
  Download, 
  ArrowUpRight, 
  Check, 
  X,
  MapPin,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Save,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Building,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  Sparkles,
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import { HelpingHandsLogo } from '../HelpingHandsLogo';
import { Campaign, VolunteerRequest, DonationRecord, BeneficiaryBreakdown, UserProfile, ChatMessage } from '../../types';
import { StorageService } from '../../lib/storage';

interface NgoDashboardProps {
  currentUser: UserProfile;
  campaigns: Campaign[];
  volunteerRequests: VolunteerRequest[];
  donations: DonationRecord[];
  beneficiaries: BeneficiaryBreakdown;
  onOpenCreateCampaign: () => void;
  onOpenPostOpportunity: () => void;
  onLogout: () => void;
  onBackToLanding: () => void;
  onAcceptRequest: (reqId: string) => void;
  onRejectRequest: (reqId: string) => void;
  onAddBeneficiaries: (count: number, category: string) => void;
  onDeleteAccount: () => void;
}

export const NgoDashboard: React.FC<NgoDashboardProps> = ({
  currentUser,
  campaigns,
  volunteerRequests,
  donations,
  beneficiaries,
  onOpenCreateCampaign,
  onOpenPostOpportunity,
  onLogout,
  onBackToLanding,
  onAcceptRequest,
  onRejectRequest,
  onAddBeneficiaries,
  onDeleteAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'volunteers' | 'donors' | 'beneficiaries' | 'requests' | 'reports' | 'messages' | 'profile' | 'settings'>('dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Beneficiary quick modal
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [benCategory, setBenCategory] = useState<'children' | 'women' | 'elderly' | 'others'>('children');
  const [benCount, setBenCount] = useState<number>(10);

  // Report generation state
  const [reportGenerated, setReportGenerated] = useState(false);

  // Profile Edit State
  const [orgName, setOrgName] = useState(currentUser.organizationName || currentUser.name);
  const [ngoRegNo, setNgoRegNo] = useState('MH/2021/0298412');
  const [ngoCity, setNgoCity] = useState(currentUser.location || 'Pune, Maharashtra');
  const [ngoPhone, setNgoPhone] = useState('+91 20 2567 8900');
  const [ngoMission, setNgoMission] = useState('Committed to eliminating child hunger and enabling grassroots community education across rural and peri-urban Maharashtra.');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Messages state
  const volunteerNames = volunteerRequests.map(r => r.volunteerName);
  const donorNames = donations.map(d => d.donorName);
  const connectedUsers = Array.from(new Set([...volunteerNames, ...donorNames]));
  
  const [activeChatUser, setActiveChatUser] = useState(connectedUsers[0] || 'Rahul Sharma (Volunteer)');
  const [messageInput, setMessageInput] = useState('');
  
  // Real messages loaded from StorageService
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return StorageService.getConversation(currentUser.id, activeChatUser);
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

  // Re-sync messages when active user changes
  useEffect(() => {
    if (activeChatUser) {
      setChatMessages(StorageService.getConversation(currentUser.id, activeChatUser));
    }
  }, [activeChatUser, currentUser.id]);

  // Settings & Delete Account
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [publicDonorList, setPublicDonorList] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const totalDonationSum = donations.reduce((sum, d) => sum + d.amount, 0);
  const pendingRequestsCount = volunteerRequests.filter(r => r.status === 'pending').length;
  const acceptedVolunteersCount = volunteerRequests.filter(r => r.status === 'accepted').length;

  const handleBeneficiarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (benCount > 0) {
      onAddBeneficiaries(benCount, benCategory);
      setShowBeneficiaryModal(false);
      setBenCount(10);
    }
  };

  const handleGenerateReport = () => {
    setReportGenerated(true);
    setTimeout(() => {
      setReportGenerated(false);
      alert('Verified NGO Transparency Audit Report (PDF) downloaded successfully!');
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatUser) return;
    
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: orgName,
      recipientId: activeChatUser,
      recipientName: activeChatUser,
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
      organizationName: orgName,
      location: ngoCity,
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

  type NgoTab = 'dashboard' | 'campaigns' | 'volunteers' | 'donors' | 'beneficiaries' | 'requests' | 'reports' | 'messages' | 'profile' | 'settings';

  interface NavItem {
    id: NgoTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Flag, badge: campaigns.length },
    { id: 'volunteers', label: 'Volunteers', icon: Users, badge: pendingRequestsCount },
    { id: 'donors', label: 'Donors', icon: HeartHandshake, badge: donations.length },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: UserCheck },
    { id: 'requests', label: 'Requests', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* TOP APP HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
        
        {/* Left Side: Three Dash Menu Button + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="ngo-sidebar-toggle-btn"
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              setIsMobileDrawerOpen(!isMobileDrawerOpen);
            }}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            title="Toggle Sidebar Navigation"
            aria-label="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => handleTabClick('dashboard')}
            title="NeedBridge NGO Portal - Go to Dashboard"
          >
            <HelpingHandsLogo size="sm" />
            <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              NGO Partner Portal
            </span>
          </div>
        </div>

        {/* Right Side: Theme Toggle, Quick Action, Notifications, Profile Capsule, Exit */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Theme Toggle Button */}
          <button
            onClick={handleToggleTheme}
            id="ngo-theme-toggle-btn"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={onOpenCreateCampaign}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative cursor-pointer"
              title="View notifications"
            >
              <Bell className="w-4 h-4" />
              {pendingRequestsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in">
                <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">NGO Alerts</p>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200">
                    <p className="font-semibold">{pendingRequestsCount} Volunteer Applications</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Review pending volunteer applications for your drives.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 text-blue-900 dark:text-blue-200">
                    <p className="font-semibold">₹{totalDonationSum.toLocaleString()} Funds Received</p>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400">Total verified direct donations processed.</p>
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
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {(currentUser.organizationName || currentUser.name).slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                {(currentUser.organizationName || currentUser.name).split(' ')[0]} <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block -mt-0.5">
                Verified NGO
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
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'}`}>
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">NGO Menu</span>
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
                    id={`ngo-nav-${item.id}`}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComp className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'}`}>
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
                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 opacity-80 group-hover:opacity-100 flex items-center gap-0.5">
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
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-4 h-4" />
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
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
                    Welcome, {currentUser.organizationName || currentUser.name}! 👋
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage grassroots campaigns, track volunteer drives, and report verified community reach.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={onOpenPostOpportunity}
                    className="px-3.5 py-2 bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 text-xs font-bold rounded-xl border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                  >
                    Post Drive
                  </button>
                  <button
                    onClick={onOpenCreateCampaign}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>New Campaign</span>
                  </button>
                </div>
              </div>

              {/* 4 KEY STAT CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-display">
                    {campaigns.length}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Active Campaigns</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400 font-display">
                    {acceptedVolunteersCount}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Total Volunteers</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display">
                    ₹{totalDonationSum.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Donations Received</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-400 font-display">
                    {beneficiaries.total}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Beneficiaries Reached</p>
                </div>
              </div>

              {/* TWO COLUMN GRID: Campaign Overview & Volunteer Requests */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. CAMPAIGN OVERVIEW */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Campaign Overview</h3>
                      <button onClick={() => handleTabClick('campaigns')} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                        View all ({campaigns.length})
                      </button>
                    </div>

                    <div className="space-y-3">
                      {campaigns.slice(0, 3).map((c) => {
                        const percent = c.targetAmount > 0 ? Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100)) : 0;
                        return (
                          <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{c.title}</span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>Raised: ₹{c.raisedAmount.toLocaleString()}</span>
                              <span>Target: ₹{c.targetAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={onOpenCreateCampaign}
                    className="w-full mt-4 py-2 border border-dashed border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 transition-colors cursor-pointer"
                  >
                    + Launch New Cause
                  </button>
                </div>

                {/* 2. RECENT VOLUNTEER REQUESTS */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Recent Volunteer Applications</h3>
                      <button onClick={() => handleTabClick('volunteers')} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                        Manage All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {volunteerRequests.slice(0, 3).map((req) => (
                        <div key={req.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img src={req.avatar} alt={req.volunteerName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{req.volunteerName}</p>
                              <p className="text-[11px] text-slate-500">{req.opportunityTitle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {req.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => onAcceptRequest(req.id)}
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                  title="Accept application"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onRejectRequest(req.id)}
                                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 cursor-pointer"
                                  title="Decline application"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                req.status === 'accepted' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {req.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={onOpenPostOpportunity}
                    className="w-full mt-4 py-2 border border-dashed border-teal-300 dark:border-teal-800 hover:border-teal-500 text-teal-700 dark:text-teal-400 text-xs font-semibold rounded-xl bg-teal-50/50 dark:bg-teal-950/20 transition-colors cursor-pointer"
                  >
                    + Post Volunteer Need
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CAMPAIGNS (MANAGE NGO CAMPAIGNS) */}
          {/* ========================================================================= */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    Managed NGO Campaigns
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Live fundraising and material donation campaigns organized by {currentUser.organizationName || currentUser.name}.
                  </p>
                </div>

                <button
                  onClick={onOpenCreateCampaign}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Campaign</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((camp) => {
                  const percent = camp.targetAmount > 0 ? Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100)) : 0;
                  return (
                    <div key={camp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs">
                      <div className="relative h-36 w-full">
                        <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
                          Active Drive
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
                            <span className="text-slate-500">Raised: ₹{camp.raisedAmount.toLocaleString()}</span>
                            <span className="font-bold text-emerald-600">{percent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => alert(`Campaign "${camp.title}" is currently active and accepting donations.`)}
                              className="flex-1 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800"
                            >
                              Live Status
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
          {/* TAB 3: VOLUNTEERS (APPLICATIONS MANAGEMENT) */}
          {/* ========================================================================= */}
          {activeTab === 'volunteers' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    Volunteer Applications Roster
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Review and verify applicants registered for your upcoming weekend drives.
                  </p>
                </div>

                <button
                  onClick={onOpenPostOpportunity}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  + Post New Drive
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {volunteerRequests.map((req) => (
                    <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={req.avatar} alt={req.volunteerName} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.volunteerName}</h4>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              req.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {req.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Applied for: <strong className="text-slate-800 dark:text-slate-200">{req.opportunityTitle}</strong></p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Email: {req.volunteerEmail} • {req.appliedDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => {
                            setActiveChatUser(`${req.volunteerName} (Volunteer)`);
                            handleTabClick('messages');
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Message
                        </button>
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onAcceptRequest(req.id)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => onRejectRequest(req.id)}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-50 cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: DONORS (DONATION LEDGER & RECEIPTS) */}
          {/* ========================================================================= */}
          {activeTab === 'donors' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    Donors & Verified Contributions
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Direct donations received through NeedBridge payment escrow and 80G tax receipt dispatch.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-right">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">Total Funds</span>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-display">₹{totalDonationSum.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Transaction Records
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {donations.map((don) => (
                    <div key={don.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                          ₹
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{don.donorName}</h4>
                          <p className="text-[11px] text-slate-500">{don.campaignTitle || 'General Community Support Fund'}</p>
                          <span className="text-[10px] text-slate-400">{don.date} • Txn: #{don.id.slice(-6)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-display">+₹{don.amount.toLocaleString()}</span>
                          <span className="block text-[10px] text-emerald-600 font-semibold">Verified</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`80G Tax Exemption Receipt for ₹${don.amount} from ${don.donorName} downloaded.`)}
                          className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="Download 80G Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: BENEFICIARIES */}
          {/* ========================================================================= */}
          {activeTab === 'beneficiaries' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    Beneficiary Demographics & Verified Impact
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Log and track total people assisted across your grassroots welfare operations.
                  </p>
                </div>

                <button
                  onClick={() => setShowBeneficiaryModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Users className="w-4 h-4" />
                  <span>Log Beneficiary Data</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-3xl font-black text-blue-600 font-display">{beneficiaries.children}</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Children Educated/Fed</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-3xl font-black text-purple-600 font-display">{beneficiaries.women}</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Women Empowered</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-3xl font-black text-amber-600 font-display">{beneficiaries.elderly}</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Elderly Supported</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-3xl font-black text-emerald-600 font-display">{beneficiaries.total}</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Total Lives Touched</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: REQUESTS (COMMUNITY AID REQUESTS) */}
          {/* ========================================================================= */}
          {activeTab === 'requests' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Community Aid & Resource Requests
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Urgent help requests submitted by community seekers for food, school kits, and emergency support.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'req-1', title: '50 School Kits for Slum Literacy Program', location: 'Katraj, Pune', urgency: 'High', date: 'Yesterday', status: 'In Review' },
                  { id: 'req-2', title: 'Food Rations for Flood Affected Families (25 units)', location: 'Sinhagad Road', urgency: 'Urgent', date: '2 days ago', status: 'Assigned' }
                ].map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.urgency === 'Urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {item.urgency}
                        </span>
                        <span className="text-xs text-slate-400">• {item.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => alert(`Fulfillment dispatched for: ${item.title}`)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                      >
                        Fulfill Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: REPORTS (TRANSPARENCY & AUDIT GENERATOR) */}
          {/* ========================================================================= */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Transparency & Audit Reports
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Generate verified audit summaries compliant with standard regulatory norms and 80G documentation.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Q3 2026 Impact & Financial Statement</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Covers all donations, volunteer man-hours, and beneficiary metrics.</p>
                  </div>
                  <button
                    onClick={handleGenerateReport}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{reportGenerated ? 'Generating PDF...' : 'Download Verified PDF'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block">Audit Score</span>
                    <p className="text-emerald-600 font-bold text-lg mt-0.5">99.4% Verified</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block">Tax Exemption</span>
                    <p className="text-blue-600 font-bold text-lg mt-0.5">80G / 12A Valid</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block">Fund Utilization</span>
                    <p className="text-purple-600 font-bold text-lg mt-0.5">94% Direct Field Aid</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: MESSAGES */}
          {/* ========================================================================= */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  NGO Inbox & Volunteer Inquiries
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Communicate with enrolled volunteers and supporters who have contributed to your drives.
                </p>
              </div>

              {connectedUsers.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 sm:p-14 text-center border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      No Inquiries or Messages Yet
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      When volunteers apply for your drives or supporters donate to your campaigns, direct communication channels will open here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
                  <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                      Active Inquiries ({connectedUsers.length})
                    </span>
                    {connectedUsers.map((u) => {
                      const isSel = activeChatUser === u;
                      return (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setActiveChatUser(u)}
                          className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {u.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{u}</p>
                            <p className="text-[10px] text-slate-500 truncate">Connected Member</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="md:col-span-8 flex flex-col justify-between p-4 bg-slate-50/50 dark:bg-slate-950/40 min-h-[420px]">
                    <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{activeChatUser}</h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active NeedBridge Member</p>
                    </div>

                    <div className="py-4 space-y-3 overflow-y-auto max-h-[300px] flex-1 flex flex-col justify-center">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-8 space-y-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            No chat history yet
                          </p>
                          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                            Send an official response or drive briefing to {activeChatUser} below.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 w-full">
                          {chatMessages.map(msg => {
                            const isMe = msg.senderId === currentUser.id || msg.senderName === orgName;
                            return (
                              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs sm:max-w-md p-3 rounded-2xl text-xs ${
                                  isMe
                                    ? 'bg-emerald-600 text-white rounded-br-xs'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-bl-xs'
                                }`}>
                                  <p>{msg.text}</p>
                                  <span className={`text-[9px] mt-1 block text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
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
                        placeholder={`Type official reply to ${activeChatUser}...`}
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
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
          {/* TAB 9: PROFILE (NGO OFFICIAL PROFILE) */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Official NGO Profile & Verification
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage trust registry number, verified compliance credentials, and public contact information.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                {profileSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Organization details updated successfully!</span>
                  </div>
                )}

                <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                    {orgName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{orgName}</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> 80G & 12A Certified NGO Partner
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Organization Name</label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Registration / Darpan ID</label>
                    <input
                      type="text"
                      value={ngoRegNo}
                      onChange={(e) => setNgoRegNo(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Headquarters Location</label>
                    <input
                      type="text"
                      value={ngoCity}
                      onChange={(e) => setNgoCity(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official Contact Phone</label>
                    <input
                      type="tel"
                      value={ngoPhone}
                      onChange={(e) => setNgoPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mission Statement</label>
                  <textarea
                    rows={3}
                    value={ngoMission}
                    onChange={(e) => setNgoMission(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save NGO Profile</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 10: SETTINGS (SETTINGS & DELETE ACCOUNT) */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Organization Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage organization alerts, donor privacy, and account security.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Preferences</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Instant Donation Notifications</p>
                      <p className="text-[11px] text-slate-500">Send email notification as soon as a donor completes a contribution.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Public Donor Acknowledgement</p>
                      <p className="text-[11px] text-slate-500">Display verified supporter names in campaign progress lists.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={publicDonorList}
                      onChange={(e) => setPublicDonorList(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
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
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Delete Organization Account</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-lg mt-0.5">
                      Permanently delete this organization account ({currentUser.organizationName || currentUser.name}), all active fundraising campaigns, volunteer listings, and donor records. This action cannot be reversed.
                    </p>
                  </div>

                  <button
                    type="button"
                    id="delete-ngo-account-btn"
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

      {/* QUICK ADD BENEFICIARY MODAL */}
      {showBeneficiaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold font-display">Log Beneficiary Outreach</h4>
              <button onClick={() => setShowBeneficiaryModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBeneficiarySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Group Category</label>
                <select
                  value={benCategory}
                  onChange={(e) => setBenCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="children">Children (Education / Meals)</option>
                  <option value="women">Women (Skills / Relief)</option>
                  <option value="elderly">Elderly (Healthcare / Food)</option>
                  <option value="others">Others (Disaster Assistance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Number of People Assisted</label>
                <input
                  type="number"
                  min={1}
                  value={benCount}
                  onChange={(e) => setBenCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBeneficiaryModal(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Outreach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="text-base font-bold font-display">Delete Organization Account?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{currentUser.organizationName || currentUser.name}</strong> ({currentUser.email})?
              </p>
              <div className="p-3 my-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-[11px] text-rose-800 dark:text-rose-300 text-left">
                ⚠️ All active fundraising campaigns, volunteer listings, and donor records will be deleted immediately.
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

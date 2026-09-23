import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ChevronDown, 
  UserCheck, 
  Building2, 
  HeartHandshake, 
  LogIn, 
  UserPlus, 
  LayoutDashboard,
  LogOut,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { HelpingHandsLogo } from './HelpingHandsLogo';
import { UserRole, UserProfile } from '../types';

interface NavbarProps {
  activeView: 'landing' | 'volunteer_dashboard' | 'ngo_dashboard' | 'donor_dashboard';
  setActiveView: (view: 'landing' | 'volunteer_dashboard' | 'ngo_dashboard' | 'donor_dashboard') => void;
  currentUser: UserProfile | null;
  onOpenAuth: (initialMode: 'login' | 'signup', role?: UserRole) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  currentUser,
  onOpenAuth,
  onLogout,
  isDark,
  onToggleDark,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [joinDropdownOpen, setJoinDropdownOpen] = useState(false);

  // Monitor scroll for subtle shadow & sticky blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (activeView !== 'landing') {
      setActiveView('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header 
      id="main-header"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 dark:border-slate-800 py-3' 
          : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border-b border-slate-100 dark:border-slate-800/80 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div 
            id="brand-logo-btn"
            onClick={() => setActiveView('landing')}
            className="cursor-pointer group flex items-center gap-2"
          >
            <HelpingHandsLogo size="md" />
          </div>

          {/* Desktop Navigation Links - Swapped order: Home -> Volunteer -> How It Works -> Impact -> Stories */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <button 
              id="nav-link-landing"
              onClick={() => setActiveView('landing')} 
              className={`text-sm font-medium transition-colors cursor-pointer ${
                activeView === 'landing' 
                  ? 'text-teal-700 dark:text-teal-400 font-semibold' 
                  : 'text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400'
              }`}
            >
              Home
            </button>
            
            {/* Position swapped: Volunteer first, then How It Works */}
            <button 
              id="nav-link-volunteer"
              onClick={() => scrollToSection('segments-section')} 
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              Volunteer
            </button>

            <button 
              id="nav-link-how-it-works"
              onClick={() => scrollToSection('how-it-works')} 
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              How It Works
            </button>

            <button 
              id="nav-link-impact"
              onClick={() => scrollToSection('impact-stats')} 
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              Impact
            </button>

            <button 
              id="nav-link-reviews"
              onClick={() => scrollToSection('community-reviews')} 
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              Stories
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Dark Mode Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Active user status badge */}
                <div 
                  id="user-profile-badge"
                  onClick={() => {
                    if (currentUser.role === 'volunteer') setActiveView('volunteer_dashboard');
                    else if (currentUser.role === 'ngo') setActiveView('ngo_dashboard');
                    else setActiveView('donor_dashboard');
                  }}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/80 cursor-pointer hover:bg-teal-100/70 dark:hover:bg-teal-900/60 transition-all"
                >
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-7 h-7 rounded-full object-cover border border-teal-400" 
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{currentUser.name}</p>
                    <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium capitalize">
                      {currentUser.role === 'donor_seeker' ? 'Donor / Seeker' : currentUser.role}
                    </span>
                  </div>
                </div>

                <button
                  id="dashboard-switch-btn"
                  onClick={() => {
                    if (currentUser.role === 'volunteer') setActiveView('volunteer_dashboard');
                    else if (currentUser.role === 'ngo') setActiveView('ngo_dashboard');
                    else setActiveView('donor_dashboard');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>My Dashboard</span>
                </button>

                <button
                  id="logout-btn"
                  onClick={onLogout}
                  title="Log out"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* Login Dropdown (Choose Role) */}
                <div className="relative">
                  <button
                    id="nav-login-btn"
                    onClick={() => {
                      setLoginDropdownOpen(!loginDropdownOpen);
                      setJoinDropdownOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 transition-colors rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {loginDropdownOpen && (
                    <div 
                      id="login-role-dropdown"
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setLoginDropdownOpen(false)}
                    >
                      <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Login as
                      </p>
                      <button
                        onClick={() => {
                          setLoginDropdownOpen(false);
                          onOpenAuth('login', 'volunteer');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl transition-colors text-left"
                      >
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Volunteer</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Find causes & contribute</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setLoginDropdownOpen(false);
                          onOpenAuth('login', 'ngo');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl transition-colors text-left"
                      >
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">NGO / Organization</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Post needs & manage drives</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setLoginDropdownOpen(false);
                          onOpenAuth('login', 'donor_seeker');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl transition-colors text-left"
                      >
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-lg">
                          <HeartHandshake className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Donor / Community</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Donate & request aid</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Sign Up / Join Now Dropdown */}
                <div className="relative">
                  <button
                    id="nav-join-now-btn"
                    onClick={() => {
                      setJoinDropdownOpen(!joinDropdownOpen);
                      setLoginDropdownOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-xl shadow-xs shadow-teal-700/20 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Join Now</span>
                    <ChevronDown className="w-3.5 h-3.5 text-teal-200" />
                  </button>

                  {joinDropdownOpen && (
                    <div 
                      id="join-role-dropdown"
                      className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setJoinDropdownOpen(false)}
                    >
                      <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        New Registration for
                      </p>
                      <button
                        onClick={() => {
                          setJoinDropdownOpen(false);
                          onOpenAuth('signup', 'volunteer');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl transition-colors text-left"
                      >
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Join as Volunteer</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Free volunteer profile</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setJoinDropdownOpen(false);
                          onOpenAuth('signup', 'ngo');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl transition-colors text-left"
                      >
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Register NGO / Org</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Post verified needs</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setJoinDropdownOpen(false);
                          onOpenAuth('signup', 'donor_seeker');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl transition-colors text-left"
                      >
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-lg">
                          <HeartHandshake className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Join as Community / Donor</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Seek support or donate</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onToggleDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-navigation-drawer" className="lg:hidden mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 pb-4 space-y-3">
            <div className="flex flex-col space-y-1">
              <button 
                onClick={() => {
                  setActiveView('landing');
                  setMobileMenuOpen(false);
                }} 
                className="px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl"
              >
                Home
              </button>
              {/* Swapped order in mobile menu as well */}
              <button 
                onClick={() => scrollToSection('segments-section')} 
                className="px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl"
              >
                Volunteer Causes
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')} 
                className="px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('impact-stats')} 
                className="px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl"
              >
                Impact Stats
              </button>
              <button 
                onClick={() => scrollToSection('community-reviews')} 
                className="px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 rounded-xl"
              >
                Community Stories
              </button>
            </div>

            {/* Mobile Auth options */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
              <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Access Portals</p>
              
              <div className="grid grid-cols-3 gap-2 px-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login', 'volunteer');
                  }}
                  className="p-2 text-center bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 rounded-xl text-blue-800 dark:text-blue-300 text-xs font-semibold"
                >
                  <UserCheck className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                  Volunteer
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login', 'ngo');
                  }}
                  className="p-2 text-center bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/60 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold"
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                  NGO / Org
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login', 'donor_seeker');
                  }}
                  className="p-2 text-center bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/60 rounded-xl text-purple-800 dark:text-purple-300 text-xs font-semibold"
                >
                  <HeartHandshake className="w-4 h-4 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                  Donor/Seeker
                </button>
              </div>

              <div className="pt-2 px-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Join NeedBridge Today
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

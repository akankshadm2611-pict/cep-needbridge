/**
 * src/components/Navbar.tsx — Role-aware, accessible Navigation Bar.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  HeartHandshake,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Compass,
  Building2,
  HelpCircle,
  User as UserIcon,
} from 'lucide-react';
import type { Notification } from '../../shared/types';

export function Navbar() {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      api.notifications.list()
        .then((notifs) => {
          const unread = notifs.filter((n: Notification) => !n.readAt).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Opportunities', path: '/opportunities', icon: Compass },
    { name: 'NGOs', path: '/ngos', icon: Building2 },
    { name: 'How It Works', path: '/#how-it-works', icon: HeartHandshake },
    { name: 'Help & FAQ', path: '/help', icon: HelpCircle },
  ];

  const getDisplayName = () => {
    if (profile && 'name' in profile) return profile.name;
    return user?.email.split('@')[0] || 'My Account';
  };

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'admin') {
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">Admin</span>;
    }
    if (user.role === 'ngo') {
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">NGO</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300">Volunteer</span>;
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg p-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-slate-900 via-teal-950 to-teal-700 dark:from-white dark:via-teal-200 dark:to-teal-400 bg-clip-text text-transparent">
                NeedBridge
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-teal-600 dark:text-teal-400 -mt-1">
                Zero Wastage
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items (Max 5 items) */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Dashboard Button */}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20 transition-all hover:shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                  {getRoleBadge()}
                </Link>

                {/* Sign Out */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth?mode=login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm shadow-teal-600/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <link.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard ({getDisplayName()})
                  </span>
                  {getRoleBadge()}
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-rose-500 text-white rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/auth?mode=login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-lg bg-teal-600 text-white font-medium shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

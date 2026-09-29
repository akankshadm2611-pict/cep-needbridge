/**
 * src/components/DemoSwitcher.tsx — Global 1-Click Role Switcher banner for seamless testing & evaluating.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Building2, Shield, LogOut, ChevronDown, Check } from 'lucide-react';

export function DemoSwitcher() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const demoAccounts = [
    {
      role: 'volunteer' as const,
      label: 'Volunteer / Donor',
      name: 'Aarohi Sharma',
      email: 'aarohi.sharma@example.org',
      pass: 'Vol@1234',
      icon: User,
      color: 'teal',
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      desc: 'View AI matched drives & pledge supplies',
    },
    {
      role: 'ngo' as const,
      label: 'Verified NGO',
      name: 'Helping Hands NGO',
      email: 'helpinghandsngopune@gmail.com',
      pass: 'Ngo@1234',
      icon: Building2,
      color: 'blue',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      desc: 'Post new drives & accept applicants',
    },
    {
      role: 'admin' as const,
      label: 'Super Admin',
      name: 'System Admin',
      email: 'admin@needbridge.org',
      pass: 'Admin@123',
      icon: Shield,
      color: 'purple',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      desc: 'Approve NGOs & review audit stats',
    },
  ];

  const handleSwitch = async (acc: typeof demoAccounts[0]) => {
    setSwitching(true);
    try {
      await login({ email: acc.email, password: acc.pass });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to switch demo account', err);
    } finally {
      setSwitching(false);
      setExpanded(false);
    }
  };

  const currentRole = user?.role;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border-b border-slate-800 text-xs py-2 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold tracking-wide flex items-center gap-1.5 text-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Demo Mode:</span>
          </span>
          <span className="hidden sm:inline text-slate-400">
            Switch roles anytime with 1 click to test full features
          </span>
        </div>

        {/* Right: Quick Role Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {demoAccounts.map((acc) => {
            const isCurrent = isAuthenticated && currentRole === acc.role;
            const Icon = acc.icon;
            return (
              <button
                key={acc.role}
                onClick={() => handleSwitch(acc)}
                disabled={switching || isCurrent}
                title={acc.desc}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all text-xs border ${
                  isCurrent
                    ? 'bg-teal-600 text-white border-teal-400 shadow-sm font-semibold cursor-default'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{acc.label}</span>
                {isCurrent && <Check className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            );
          })}

          {isAuthenticated && (
            <button
              onClick={() => logout().then(() => navigate('/'))}
              title="Sign out to test public visitor view"
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors ml-1"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

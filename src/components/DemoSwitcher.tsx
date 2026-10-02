/**
 * src/components/DemoSwitcher.tsx — Role & Quick Navigation Bar.
 * Links directly to the corresponding login pages without hardcoding passwords.
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Building2, LogOut } from 'lucide-react';

export function DemoSwitcher() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-semibold text-slate-300">
            {isAuthenticated && user
              ? `Active Session: ${user.email} (${user.role.toUpperCase()})`
              : 'Visitor Mode — Please Sign In or Register'}
          </span>
        </div>

        {/* Right: Quick Login Portal Links */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isAuthenticated ? (
            <>
              <Link
                to="/auth?mode=login"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Volunteer / NGO Login</span>
              </Link>
              <Link
                to="/auth?mode=admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-semibold transition-colors border border-purple-500/50 shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Super Admin Portal</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-semibold transition-colors"
              >
                Open Dashboard
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/auth');
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/60 transition-colors font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

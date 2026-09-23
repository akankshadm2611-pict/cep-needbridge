import React, { useState } from 'react';
import { Send, CheckCircle2, Heart, Shield, Sparkles } from 'lucide-react';
import { HelpingHandsLogo } from './HelpingHandsLogo';

interface FooterProps {
  onOpenAuth: (mode: 'login' | 'signup', role?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Motto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-amber-400 p-0.5 w-10 h-10">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center p-1.5">
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-teal-400">
                    <path d="M3 18C7 11 17 11 21 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M6 18V15M12 18V13M18 18V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M8 8.5C8 8.5 9.5 7 12 7C14.5 7 16 8.5 16 8.5" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white">
                Need<span className="text-teal-400">Bridge</span>
              </span>
            </div>

            {/* Short Motto of the website */}
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Empowering grassroots change by bridging the vital gap between local community needs and compassionate volunteer action.
            </p>
          </div>

          {/* Quick Links for Volunteers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">For Volunteers</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onOpenAuth('signup', 'volunteer')} className="hover:text-teal-400 transition-colors">
                  Find Volunteer Drives
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('signup', 'volunteer')} className="hover:text-teal-400 transition-colors">
                  Teaching & Education
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('signup', 'volunteer')} className="hover:text-teal-400 transition-colors">
                  Health & Medical Camps
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('signup', 'volunteer')} className="hover:text-teal-400 transition-colors">
                  Environmental Drives
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links for NGOs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">For Organizations</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onOpenAuth('signup', 'ngo')} className="hover:text-teal-400 transition-colors">
                  Register Your NGO
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('signup', 'ngo')} className="hover:text-teal-400 transition-colors">
                  Post Volunteer Needs
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('signup', 'ngo')} className="hover:text-teal-400 transition-colors">
                  Fundraising Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('signup', 'ngo')} className="hover:text-teal-400 transition-colors">
                  Impact Reporting Tool
                </button>
              </li>
            </ul>
          </div>

          {/* Stay In The Loop Option */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Stay In The Loop</h4>
            <p className="text-xs text-slate-400">
              Subscribe to weekly verified opportunity alerts in your area.
            </p>

            {subscribed ? (
              <div className="p-3 bg-teal-900/60 border border-teal-600/40 rounded-xl text-teal-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-400" />
                <span>You're subscribed! Welcome to the loop.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors cursor-pointer"
                    title="Subscribe"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">No spam ever. Unsubscribe anytime with 1 click.</p>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 NeedBridge. All rights reserved.</p>
          <p className="text-slate-500 text-xs">Connecting volunteers with community service opportunities.</p>
        </div>

      </div>
    </footer>
  );
};

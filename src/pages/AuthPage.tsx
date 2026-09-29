/**
 * src/pages/AuthPage.tsx — Sign in & Registration with role-aware onboarding routing.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, Mail, Lock, User, Building2, Shield, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, user } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [role, setRole] = useState<'volunteer' | 'ngo' | 'admin'>(
    (searchParams.get('role') as any) || 'volunteer'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (user && !user.onboardingComplete) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password, role, name });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Direct 1-Click Instant Demo Login
  const handleQuickLogin = async (roleType: 'volunteer' | 'ngo' | 'admin') => {
    setError(null);
    setLoading(true);
    let targetEmail = 'aarohi.sharma@example.org';
    let targetPassword = 'Vol@1234';
    if (roleType === 'ngo') {
      targetEmail = 'helpinghandsngopune@gmail.com';
      targetPassword = 'Ngo@1234';
    } else if (roleType === 'admin') {
      targetEmail = 'admin@needbridge.org';
      targetPassword = 'Admin@123';
    }

    try {
      await login({ email: targetEmail, password: targetPassword });
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-800/95 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md mx-auto">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            {mode === 'login' ? 'Welcome to NeedBridge' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login'
              ? 'Enter your credentials to access your dashboard'
              : 'Join the network connecting volunteers, donors, and verified NGOs'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('volunteer')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      role === 'volunteer'
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-xs font-bold">Volunteer / Donor</span>
                    <span className="text-[10px] text-slate-500">Give time or goods</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ngo')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      role === 'ngo'
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs font-bold">NGO / Org</span>
                    <span className="text-[10px] text-slate-500">Post community needs</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {role === 'ngo' ? 'Organization Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'ngo' ? 'e.g. Pune Hope Foundation' : 'e.g. Priya Deshmukh'}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.org"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              {mode === 'register' && (
                <span className="text-[10px] text-slate-400">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Continue to Onboarding'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo 1-Click Instant Logins */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>1-Click Test Demo Logins:</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Instant sign-in</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('volunteer')}
              className="px-2.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 font-semibold text-xs transition-all text-center flex flex-col items-center gap-0.5 shadow-sm"
            >
              <span>Volunteer</span>
              <span className="text-[9px] opacity-75 font-normal">Explore & Pledge</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('ngo')}
              className="px-2.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 font-semibold text-xs transition-all text-center flex flex-col items-center gap-0.5 shadow-sm"
            >
              <span>NGO Admin</span>
              <span className="text-[9px] opacity-75 font-normal">Post Drives</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin')}
              className="px-2.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 font-semibold text-xs transition-all text-center flex flex-col items-center gap-0.5 shadow-sm"
            >
              <span>Super Admin</span>
              <span className="text-[9px] opacity-75 font-normal">Verify NGOs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

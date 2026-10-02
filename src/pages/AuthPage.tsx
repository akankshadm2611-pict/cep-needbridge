/**
 * src/pages/AuthPage.tsx — Sign in, Registration & Super Admin login.
 * Admin registration is blocked. Admins must enter credentials to authenticate.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HeartHandshake, Mail, Lock, User, Building2, Shield,
  ArrowRight, AlertCircle, EyeOff, Eye, LogOut
} from 'lucide-react';

export function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, adminLogin, register, isAuthenticated, user, logout } = useAuth();

  const urlMode = searchParams.get('mode');
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(
    urlMode === 'register' ? 'register' : urlMode === 'admin' ? 'admin' : 'login'
  );

  useEffect(() => {
    if (urlMode === 'admin') setMode('admin');
    else if (urlMode === 'register') setMode('register');
    else if (urlMode === 'login') setMode('login');
  }, [urlMode]);

  const [role, setRole] = useState<'volunteer' | 'ngo'>('volunteer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (newMode: 'login' | 'register' | 'admin') => {
    setMode(newMode);
    setError(null);
    setEmail('');
    setPassword('');
    setSearchParams({ mode: newMode });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'admin') {
        await adminLogin({ email: email.trim(), password });
      } else if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({ email: email.trim(), password, role, name: name.trim() });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const isAdminMode = mode === 'admin';

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-4">

        {/* Already logged in alert */}
        {isAuthenticated && user && (
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-900 dark:text-teal-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span>Signed in as <strong>{user.email}</strong> ({user.role})</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="px-2.5 py-1 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  setEmail('');
                  setPassword('');
                }}
                className="px-2.5 py-1 text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-1 font-semibold"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Auth Card */}
        <div className={`rounded-3xl shadow-xl border p-8 space-y-6 transition-colors ${
          isAdminMode
            ? 'bg-slate-900 dark:bg-slate-950 border-purple-800/60 shadow-purple-950/40'
            : 'bg-white dark:bg-slate-800/95 border-slate-200 dark:border-slate-700'
        }`}>

          {/* Top 3-Way Mode Switcher Tabs */}
          <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl text-xs font-bold ${
            isAdminMode ? 'bg-slate-800/80 border border-purple-900/40' : 'bg-slate-100 dark:bg-slate-900'
          }`}>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 rounded-lg transition-all text-center ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : isAdminMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2 rounded-lg transition-all text-center ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : isAdminMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => switchMode('admin')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                isAdminMode
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md mx-auto ${
              isAdminMode
                ? 'bg-gradient-to-tr from-purple-700 to-purple-500 shadow-purple-900/40'
                : 'bg-gradient-to-tr from-teal-600 to-emerald-400 shadow-teal-500/20'
            }`}>
              {isAdminMode ? <Shield className="w-7 h-7" /> : <HeartHandshake className="w-7 h-7" />}
            </div>
            <h2 className={`text-2xl font-bold font-display ${isAdminMode ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {isAdminMode
                ? 'Super Admin Portal'
                : mode === 'login'
                  ? 'Sign in to NeedBridge'
                  : 'Create Your Account'}
            </h2>
            <p className={`text-xs ${isAdminMode ? 'text-purple-300' : 'text-slate-500 dark:text-slate-400'}`}>
              {isAdminMode
                ? 'Authorized admins: enter your registered email and secret password'
                : mode === 'login'
                  ? 'Enter your credentials to access your dashboard'
                  : 'Join the verified network connecting volunteers, donors & NGOs'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector — register only */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'volunteer', label: 'Volunteer / Donor', icon: User, desc: 'Give time or goods' },
                    { id: 'ngo', label: 'NGO / Org', icon: Building2, desc: 'Post community needs' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as 'volunteer' | 'ngo')}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        role === r.id
                          ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/20'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <r.icon className="w-4 h-4" />
                      <span className="text-xs font-bold">{r.label}</span>
                      <span className="text-[10px] text-slate-500">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name — register only */}
            {mode === 'register' && (
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
            )}

            {/* Email Field */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isAdminMode ? 'text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>
                {isAdminMode ? 'Super Admin Email Address' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isAdminMode ? 'text-purple-400' : 'text-slate-400'}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdminMode ? 'admin@needbridge.org' : 'name@example.com'}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:outline-none ${
                    isAdminMode
                      ? 'bg-slate-800 border border-purple-800/50 text-white placeholder-slate-500 focus:ring-purple-500'
                      : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-teal-500'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-semibold ${isAdminMode ? 'text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  {isAdminMode ? 'Super Admin Password' : 'Password'}
                </label>
                {mode === 'register' && (
                  <span className="text-[10px] text-slate-400">Min 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isAdminMode ? 'text-purple-400' : 'text-slate-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'register' ? 6 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isAdminMode ? 'Enter Admin Password' : '••••••••'}
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl focus:ring-2 focus:outline-none ${
                    isAdminMode
                      ? 'bg-slate-800 border border-purple-800/50 text-white placeholder-slate-500 focus:ring-purple-500'
                      : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-teal-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                isAdminMode
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
              }`}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>
                    {isAdminMode
                      ? 'Log In as Super Admin'
                      : mode === 'login'
                        ? 'Sign In to Dashboard'
                        : 'Create Account & Continue'}
                  </span>
                  {isAdminMode ? <Shield className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

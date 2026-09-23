import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  Building2, 
  HeartHandshake, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  AtSign,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  FileText,
  KeyRound,
  RefreshCw,
  Check
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { StorageService } from '../lib/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  initialRole?: UserRole;
  onSuccessAuth: (user: UserProfile) => void;
}

const DEFAULT_DEMO_USERS: Record<UserRole, UserProfile> = {
  volunteer: {
    id: 'user-vol-1',
    name: 'Aarohi Sharma',
    username: 'aarohi_volunteer',
    email: 'aarohi.sharma@example.org',
    phone: '+91 98234 56789',
    location: 'Pune, Maharashtra',
    skills: 'Teaching, First Aid, Event Coordination, Logistics',
    bio: 'Passionate about child literacy and weekend community food distribution.',
    role: 'volunteer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    joinedDate: 'January 2026',
    verified: true,
    phoneVerified: true,
    emailVerified: true,
  },
  ngo: {
    id: 'user-ngo-1',
    name: 'Dr. Vivek Ranade',
    username: 'helpinghands_ngo',
    organizationName: 'Helping Hands Foundation NGO',
    email: 'vivek@helpinghands.ngo',
    phone: '+91 20 2567 8900',
    location: 'Pune, Maharashtra',
    skills: 'Grassroots Operations, 80G Certified, Disaster Relief',
    bio: 'Bridging resources for rural development and nutrition.',
    role: 'ngo',
    avatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100&auto=format&fit=crop&q=80',
    joinedDate: 'December 2025',
    verified: true,
    phoneVerified: true,
    emailVerified: true,
  },
  donor_seeker: {
    id: 'user-donor-1',
    name: 'Meera Iyer',
    username: 'meera_supporter',
    email: 'meera.iyer@example.org',
    phone: '+91 98450 12345',
    location: 'Mumbai, Maharashtra',
    skills: 'Education Sponsorship, Animal Welfare, Food Aid',
    bio: 'Regular contributor to transparent grassroots education initiatives.',
    role: 'donor_seeker',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    joinedDate: 'February 2026',
    verified: true,
    phoneVerified: true,
    emailVerified: true,
  }
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'volunteer',
  onSuccessAuth,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  
  // Profile & Form fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Pune, Maharashtra');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification Step for manual registration
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('482910');
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Google OAuth Flow State
  const [isGoogleStep, setIsGoogleStep] = useState(false);
  const [googleStepStage, setGoogleStepStage] = useState<'pick_account' | 'customize_profile'>('pick_account');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Timer countdown for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpStep && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, otpTimer]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedRole(initialRole);
      setErrorMessage(null);
      setEmail('');
      setUsername('');
      setName('');
      setPhone('');
      setLocation('Pune, Maharashtra');
      setSkills(
        initialRole === 'volunteer' 
          ? 'Teaching, First Aid, Logistics, Event Coordination' 
          : 'Education Sponsorship, Food Relief, Medical Aid'
      );
      setBio('');
      setOrgName('');
      setPassword('');
      setConfirmPassword('');
      setIsOtpStep(false);
      setOtpCode('');
      setOtpError(null);
      setIsGoogleStep(false);
      setGoogleStepStage('pick_account');
      setSelectedGoogleAccount(null);
      setUsernameAvailable(null);
    }
  }, [initialMode, initialRole, isOpen]);

  // Real-time username check
  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(clean);
    if (clean.length >= 3) {
      const isTaken = StorageService.isUsernameTaken(clean, email);
      setUsernameAvailable(!isTaken);
    } else {
      setUsernameAvailable(null);
    }
  };

  if (!isOpen) return null;

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'volunteer') {
      setSkills('Teaching, First Aid, Logistics, Event Coordination');
    } else if (role === 'donor_seeker') {
      setSkills('Monthly Ration Kits, Education Sponsorship, Medical Aid');
    }
  };

  // Google Single Sign-On handler
  const handleStartGoogleAuth = () => {
    setIsGoogleStep(true);
    setGoogleStepStage('pick_account');
    setErrorMessage(null);
  };

  const handleSelectGoogleUser = (account: { name: string; email: string; avatar: string }) => {
    setSelectedGoogleAccount(account);
    setName(account.name);
    setEmail(account.email);
    setPhone('+91 98234 56789');
    setLocation('Pune, Maharashtra');
    if (selectedRole === 'volunteer') {
      setSkills('Teaching, First Aid, Event Coordination, Logistics');
    } else if (selectedRole === 'donor_seeker') {
      setSkills('Education Sponsorship, Food Relief, Animal Welfare');
    }
    
    // Auto-generate a clean username
    const suggestedUsername = (account.email.split('@')[0] || account.name.toLowerCase().replace(/\s+/g, '_')).replace(/[^a-z0-9_]/g, '');
    setUsername(suggestedUsername);
    const isTaken = StorageService.isUsernameTaken(suggestedUsername, account.email);
    setUsernameAvailable(!isTaken);
    setGoogleStepStage('customize_profile');
  };

  const handleCustomGoogleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    const cleanEmail = customGoogleEmail.trim().toLowerCase();
    const generatedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    handleSelectGoogleUser({
      name: generatedName,
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${cleanEmail}`
    });
  };

  // Google Profile Completion & Direct Entry (Google account is pre-verified, no OTP needed)
  const handleCompleteGoogleProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Please provide a valid username of at least 3 characters.');
      return;
    }

    if (StorageService.isUsernameTaken(cleanUsername, selectedGoogleAccount?.email)) {
      setErrorMessage(`The username @${cleanUsername} is already in use. Please select a different one.`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newUser: UserProfile = {
        id: `user-google-${Date.now()}`,
        name: name.trim() || selectedGoogleAccount?.name || 'Google User',
        username: cleanUsername,
        email: selectedGoogleAccount?.email || email.trim().toLowerCase(),
        phone: phone.trim() || '+91 98234 56789',
        location: location.trim() || 'Pune, Maharashtra',
        skills: skills.trim(),
        bio: bio.trim(),
        role: selectedRole,
        organizationName: selectedRole === 'ngo' ? (orgName.trim() || 'Helping Hands Partner') : undefined,
        authProvider: 'google',
        avatar: selectedGoogleAccount?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${cleanUsername}`,
        joinedDate: 'August 2026',
        verified: true,
        phoneVerified: true,
        emailVerified: true
      };

      StorageService.saveUser(newUser);
      StorageService.setCurrentUser(newUser);
      setLoading(false);
      onSuccessAuth(newUser);
      onClose();
    }, 600);
  };

  // Trigger OTP Dispatch for Manual Registration
  const handleInitiateManualSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    const cleanPhone = phone.trim();

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Please enter a valid mobile number for authentication.');
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }

    if (StorageService.isUsernameTaken(cleanUsername, normalizedEmail)) {
      setErrorMessage(`Username @${cleanUsername} is taken. Please pick another username.`);
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // Generate random 6-digit OTP and switch to OTP view
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpTimer(30);
    setOtpCode('');
    setOtpError(null);
    setIsOtpStep(true);
  };

  // Verify OTP and Complete Manual Account Creation
  const handleVerifyOtpAndCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '482910') {
      setOtpError('Invalid OTP code. Please enter the correct 6-digit verification code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

      const newUser: UserProfile = {
        id: `user-registered-${Date.now()}`,
        name: name.trim(),
        username: cleanUsername,
        email: normalizedEmail,
        phone: phone.trim(),
        location: location.trim() || 'Pune, Maharashtra',
        skills: skills.trim(),
        bio: bio.trim(),
        password: password,
        role: selectedRole,
        organizationName: selectedRole === 'ngo' ? orgName.trim() : undefined,
        authProvider: 'email',
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
        joinedDate: 'August 2026',
        verified: true,
        phoneVerified: true,
        emailVerified: true
      };

      StorageService.saveUser(newUser);
      StorageService.setCurrentUser(newUser);
      setLoading(false);
      onSuccessAuth(newUser);
      onClose();
    }, 600);
  };

  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpTimer(30);
    setOtpError(null);
  };

  // Manual Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const loginId = email.trim().toLowerCase();
    if (!loginId) {
      setErrorMessage('Please enter your email, username, or phone number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const foundUser = StorageService.findUser(loginId, selectedRole);

      if (foundUser) {
        if (foundUser.password && foundUser.password !== password) {
          setErrorMessage('Incorrect password. Please try again.');
          setLoading(false);
          return;
        }

        StorageService.setCurrentUser(foundUser);
        setLoading(false);
        onSuccessAuth(foundUser);
        onClose();
        return;
      }

      // Check default demo user
      const defaultUser = DEFAULT_DEMO_USERS[selectedRole];
      if (
        loginId === defaultUser.email.toLowerCase() || 
        loginId === defaultUser.username?.toLowerCase() ||
        loginId.includes('demo') ||
        loginId.includes('test')
      ) {
        StorageService.saveUser(defaultUser);
        StorageService.setCurrentUser(defaultUser);
        setLoading(false);
        onSuccessAuth(defaultUser);
        onClose();
        return;
      }

      // If user doesn't exist, create authenticated session
      const autoUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: loginId.includes('@') ? loginId.split('@')[0].replace(/[._]/g, ' ') : loginId,
        username: loginId.includes('@') ? loginId.split('@')[0] : loginId,
        email: loginId.includes('@') ? loginId : `${loginId}@needbridge.org`,
        phone: '+91 98234 56789',
        location: 'Pune, Maharashtra',
        skills: selectedRole === 'volunteer' ? 'Teaching, First Aid, Logistics' : 'Education Sponsorship, Food Relief',
        role: selectedRole,
        organizationName: selectedRole === 'ngo' ? 'NeedBridge Partner NGO' : undefined,
        authProvider: 'email',
        avatar: DEFAULT_DEMO_USERS[selectedRole].avatar,
        joinedDate: 'August 2026',
        verified: true,
        phoneVerified: true,
        emailVerified: true
      };

      StorageService.saveUser(autoUser);
      StorageService.setCurrentUser(autoUser);
      setLoading(false);
      onSuccessAuth(autoUser);
      onClose();
    }, 600);
  };

  // Quick Demo Account Auto-Fill
  const handleQuickDemoFill = (role: UserRole) => {
    const demo = DEFAULT_DEMO_USERS[role];
    setSelectedRole(role);
    setEmail(demo.email);
    setUsername(demo.username || '');
    setName(demo.name);
    setPhone(demo.phone || '+91 98234 56789');
    setLocation(demo.location || 'Pune, Maharashtra');
    setSkills(demo.skills || 'Teaching, First Aid, Event Logistics');
    setBio(demo.bio || '');
    setPassword('DemoPass123!');
    setConfirmPassword('DemoPass123!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              {isGoogleStep 
                ? (googleStepStage === 'pick_account' ? 'Continue with Google' : 'Complete Verified Profile')
                : isOtpStep
                ? 'Mobile & Email OTP Verification'
                : mode === 'signup' 
                ? 'Create Your NeedBridge Profile' 
                : 'Welcome Back to NeedBridge'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isGoogleStep
                ? 'Google-authenticated instant profile synchronization'
                : isOtpStep
                ? `Enter the 6-digit code sent to ${phone || email}`
                : mode === 'signup'
                ? 'Fill in your details and verify mobile/email authentication'
                : 'Select your role and sign in to your dashboard'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* ========================================================================= */}
          {/* VIEW A: OTP VERIFICATION STEP FOR MANUAL SIGNUP */}
          {/* ========================================================================= */}
          {isOtpStep && (
            <form onSubmit={handleVerifyOtpAndCreate} className="space-y-4 animate-in fade-in">
              {/* Simulated SMS Badge */}
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200">
                  <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Authentication SMS / Email Dispatched</span>
                </div>
                <p className="text-blue-800 dark:text-blue-300 text-[11px]">
                  Your 6-digit security code is: <strong className="font-mono text-sm bg-blue-200/60 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">{generatedOtp}</strong>
                </p>
              </div>

              {otpError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="e.g. 482910"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-xl font-mono px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Did not receive code?'}
                </span>
                <button
                  type="button"
                  disabled={otpTimer > 0}
                  onClick={handleResendOtp}
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-40 disabled:hover:no-underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Resend Code
                </button>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : 'Verify & Enter Dashboard'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* VIEW B: GOOGLE ACCOUNT PICKER & PROFILE CUSTOMIZATION */}
          {/* ========================================================================= */}
          {isGoogleStep && !isOtpStep && (
            <div className="space-y-4 animate-in fade-in">
              {googleStepStage === 'pick_account' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Select a verified Google account to authenticate instantly:
                  </p>

                  <div className="space-y-2">
                    {/* Logged in Google User Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectGoogleUser({
                        name: 'Akanksha Deshmukh',
                        email: 'akankshadm2611@gmail.com',
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      })}
                      className="w-full p-3 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 hover:bg-teal-100/50 transition-colors flex items-center gap-3 text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        AD
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Akanksha Deshmukh</p>
                          <span className="px-1.5 py-0.2 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px] font-bold rounded-md">Primary</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">akankshadm2611@gmail.com</p>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectGoogleUser({
                        name: 'Aarohi Sharma',
                        email: 'aarohi.sharma@example.org',
                        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                      })}
                      className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-sm">
                        AS
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Aarohi Sharma</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">aarohi.sharma@example.org</p>
                      </div>
                      <Check className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  {/* Or Enter Custom Google Email */}
                  <form onSubmit={handleCustomGoogleEmailSubmit} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Or use another Google account:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="youremail@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Continue
                      </button>
                    </div>
                  </form>

                  <button
                    type="button"
                    onClick={() => setIsGoogleStep(false)}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pt-2 cursor-pointer"
                  >
                    ← Back to standard login
                  </button>
                </div>
              ) : (
                /* Google Profile Completion - As requested, taking all necessary fields */
                <form onSubmit={handleCompleteGoogleProfile} className="space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
                    <img 
                      src={selectedGoogleAccount?.avatar} 
                      alt="Google user" 
                      className="w-10 h-10 rounded-full object-cover border border-emerald-500" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Google Identity Authenticated</span>
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">{selectedGoogleAccount?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                          value={username}
                          onChange={(e) => handleUsernameChange(e.target.value)}
                          className="w-full pl-7 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      {usernameAvailable === true && (
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">✓ Username available</span>
                      )}
                      {usernameAvailable === false && (
                        <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">✗ Username already taken</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile / Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98234 56789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location / City</label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {selectedRole === 'volunteer' ? 'Skills & Interests' : 'Preferred Support Causes'}
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. Teaching, First Aid, Food Relief"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGoogleStepStage('pick_account')}
                      className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Change Account
                    </button>
                    <button
                      type="submit"
                      disabled={loading || usernameAvailable === false}
                      className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                    >
                      {loading ? 'Creating Profile...' : 'Save & Enter Dashboard'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW C: STANDARD LOGIN & MANUAL SIGNUP (WITH OTP DISPATCH) */}
          {/* ========================================================================= */}
          {!isGoogleStep && !isOtpStep && (
            <div className="space-y-4">
              
              {/* ROLE SELECTION TABS */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'volunteer', label: 'Volunteer', icon: UserCheck, color: 'text-blue-600' },
                    { id: 'ngo', label: 'NGO Lead', icon: Building2, color: 'text-emerald-600' },
                    { id: 'donor_seeker', label: 'Supporter', icon: HeartHandshake, color: 'text-purple-600' },
                  ].map((r) => {
                    const IconComp = r.icon;
                    const isSel = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleChange(r.id as UserRole)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          isSel
                            ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <IconComp className={`w-5 h-5 ${isSel ? 'text-teal-600 dark:text-teal-400' : r.color}`} />
                        <span className="text-xs font-bold">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* GOOGLE CONTINUATION BUTTON */}
              <button
                type="button"
                onClick={handleStartGoogleAuth}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">or use email / password</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={mode === 'signup' ? handleInitiateManualSignup : handleLoginSubmit} className="space-y-3.5">
                
                {mode === 'signup' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aarohi Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                          placeholder="aarohi_volunteer"
                          value={username}
                          onChange={(e) => handleUsernameChange(e.target.value)}
                          className="w-full pl-7 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      {usernameAvailable === true && (
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">✓ Username available</span>
                      )}
                      {usernameAvailable === false && (
                        <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">✗ Username taken</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {mode === 'signup' ? 'Email Address' : 'Email, Username or Phone'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="youremail@example.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  {mode === 'signup' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile Number (Required for OTP)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98234 56789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {mode === 'signup' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location / City</label>
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {selectedRole === 'volunteer' ? 'Skills & Interests' : 'Preferred Support Area'}
                        </label>
                        <input
                          type="text"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Create Password</label>
                        <input
                          type="password"
                          required
                          placeholder="At least 6 chars"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          required
                          placeholder="Re-type password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : mode === 'signup' ? (
                    <>
                      <span>Proceed to OTP Authentication</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <span>Sign In to Dashboard</span>
                  )}
                </button>
              </form>

              {/* FOOTER SWITCHER & QUICK DEMO FILL */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <p className="text-slate-500">
                  {mode === 'signup' ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'signup' ? 'login' : 'signup');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    {mode === 'signup' ? 'Sign In' : 'Create Profile'}
                  </button>
                </p>

                <button
                  type="button"
                  onClick={() => handleQuickDemoFill(selectedRole)}
                  className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-teal-500" />
                  <span>Auto-fill Demo Profile</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

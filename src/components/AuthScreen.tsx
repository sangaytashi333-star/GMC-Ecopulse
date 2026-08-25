import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  User, 
  MapPin, 
  Leaf, 
  Compass,
  AlertCircle,
  KeyRound,
  Fingerprint
} from 'lucide-react';
import { UserProfile } from '../types';
import { INITIAL_USER, INITIAL_USER_PROFILE } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';

interface AuthScreenProps {
  currentUser?: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentUser,
  onLoginSuccess,
  onCancel,
  isModal = false,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredSector, setPreferredSector] = useState('Sector 2: Mao River Watershed & Riparian Buffer');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  // Quick Switch Preset Profiles
  const presetProfiles: Array<{
    name: string;
    email: string;
    role: 'citizen' | 'admin';
    levelTitle: string;
    levelNumber: number;
    karma: number;
    avatarEmoji: string;
    specialty: string;
  }> = [
    {
      name: 'Sangay Tashi',
      email: 'sangaytashi.333@gmail.com',
      role: 'citizen',
      levelTitle: 'Senior Forest Steward',
      levelNumber: 4,
      karma: 420,
      avatarEmoji: '🌲',
      specialty: 'Golden Langur Habitat Monitor'
    },
    {
      name: 'Dr. Karma Wangchuk',
      email: 'k.wangchuk@gmc.bt',
      role: 'admin',
      levelTitle: 'HQ Biosphere Warden',
      levelNumber: 7,
      karma: 1250,
      avatarEmoji: '🦅',
      specialty: 'Mao River Hydrology & AI Telemetry'
    },
    {
      name: 'Tenzin Pelden',
      email: 'tenzin.pelden@gmc.bt',
      role: 'citizen',
      levelTitle: 'Eco-Youth Pioneer',
      levelNumber: 2,
      karma: 180,
      avatarEmoji: '🌸',
      specialty: 'Urban Sapling & Seed Bomb Specialist'
    },
    {
      name: 'Dechen Zangmo',
      email: 'dechen.zangmo@gmc.bt',
      role: 'citizen',
      levelTitle: 'Zero-Waste Circular Guardian',
      levelNumber: 5,
      karma: 640,
      avatarEmoji: '♻️',
      specialty: 'Biodegradable Compost & Soil Restoration'
    }
  ];

  // Handle standard Email + Password submission
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      playMindfulChime('bell');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      playMindfulChime('bell');
      return;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please provide your citizen name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      playMindfulChime('karma');

      if (authMode === 'signup') {
        const newUser: UserProfile = {
          ...INITIAL_USER_PROFILE,
          name: name.trim(),
          email: email.trim(),
          levelTitle: 'Apprentice Forest Steward',
          levelNumber: 1,
          totalKarmaPoints: 100, // Welcome bonus karma
          spendablePoints: 100,
          joinedDate: 'August 2026'
        };
        setSuccessMessage(`Tashi Delek, ${newUser.name}! +100 Welcome Karma credited.`);
        onLoginSuccess(newUser);
      } else {
        // Sign in
        const existing = presetProfiles.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
        const userToLogin: UserProfile = existing ? {
          ...INITIAL_USER_PROFILE,
          name: existing.name,
          email: existing.email,
          role: existing.role,
          levelTitle: existing.levelTitle,
          levelNumber: existing.levelNumber,
          spendablePoints: existing.karma,
          totalKarmaPoints: existing.karma + 120,
        } : {
          ...INITIAL_USER_PROFILE,
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: email.trim(),
          spendablePoints: 350,
          totalKarmaPoints: 470,
        };

        setSuccessMessage(`Welcome back, ${userToLogin.name}!`);
        onLoginSuccess(userToLogin);
      }
    }, 600);
  };

  // Handle Google Sign In
  const handleGoogleLogin = () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    playMindfulChime('bell');

    setTimeout(() => {
      setGoogleLoading(false);
      playMindfulChime('karma');

      // Use user's authenticated Google profile details
      const googleUser: UserProfile = {
        ...INITIAL_USER_PROFILE,
        name: 'Sangay Tashi',
        email: 'sangaytashi.333@gmail.com',
        levelTitle: 'Senior Forest Steward',
        levelNumber: 4,
        spendablePoints: 420,
        totalKarmaPoints: 560,
        role: 'citizen',
        joinedDate: 'July 2026'
      };

      setSuccessMessage('Successfully connected via Google Workspace.');
      onLoginSuccess(googleUser);
    }, 700);
  };

  // Handle one-click demo login
  const handlePresetLogin = (preset: typeof presetProfiles[0]) => {
    playMindfulChime('karma');
    const userToLogin: UserProfile = {
      ...INITIAL_USER_PROFILE,
      name: preset.name,
      email: preset.email,
      role: preset.role,
      levelTitle: preset.levelTitle,
      levelNumber: preset.levelNumber,
      spendablePoints: preset.karma,
      totalKarmaPoints: preset.karma + 150,
    };
    onLoginSuccess(userToLogin);
  };

  // Handle Password Reset
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotSent(true);
      playMindfulChime('bell');
    }, 500);
  };

  return (
    <div className={`w-full ${isModal ? '' : 'min-h-[85vh] flex items-center justify-center py-6 sm:py-10'}`}>
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden">
        
        {/* Left Side: Mindfulness & City Identity Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#081c15] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Ambient Background Ring */}
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#52b788]/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-[#74c69d]/10 blur-2xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md p-0.5 border border-[#52b788]/40 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🌿</span>
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                  Gelephu Ecopulse
                  <span className="text-[10px] bg-[#52b788] text-[#081c15] font-bold px-1.5 py-0.5 rounded">GMC</span>
                </h1>
                <p className="text-xs text-[#d8f3dc]/80 font-medium">Mindfulness City Biosphere ID</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#52b788]/30 text-xs font-semibold text-[#d8f3dc]">
                <Sparkles className="w-3.5 h-3.5 text-[#f4a261]" />
                <span>Gross National Happiness Telemetry</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Empowering mindful citizen stewardship.
              </h2>
              
              <p className="text-sm text-[#d8f3dc]/85 leading-relaxed">
                Connect your citizen credentials to log wildlife migrations, monitor the Mao River watershed, earn karma credits, and redeem passes across Gelephu.
              </p>
            </div>
          </div>

          {/* Bottom Mindfulness Axiom */}
          <div className="relative z-10 pt-6 border-t border-white/10 space-y-3">
            <div className="flex items-start space-x-2.5 text-xs text-[#d8f3dc]/90">
              <span className="text-base">☸️</span>
              <p className="italic">
                "Mindful presence begins with intentional awareness of the surrounding Himalayan forest and living watershed."
              </p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#d8f3dc]/60">
              <span>Himalayan Eco-Ledger v3.2</span>
              <span>Encrypted • 432 Hz</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#fafaf7]">
          
          {/* Header & Tabs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#1b4332] tracking-tight">
                {authMode === 'signin' && 'Sign in to Gelephu Ecopulse'}
                {authMode === 'signup' && 'Create Citizen Stewardship Profile'}
                {authMode === 'forgot' && 'Reset Citizen Credentials'}
              </h3>
              {onCancel && (
                <button 
                  onClick={onCancel}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition"
                >
                  ✕ Close
                </button>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              {authMode === 'signin' && 'Enter your email & password or sign in instantly with Google.'}
              {authMode === 'signup' && 'Join the community of mindful guardians in Gelephu.'}
              {authMode === 'forgot' && 'We will send a credential restoration link to your inbox.'}
            </p>

            {/* Mode Switcher Pills */}
            <div className="flex bg-gray-200/70 p-1 rounded-xl mt-4 max-w-xs">
              <button
                type="button"
                id="tab-signin"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'signin' 
                    ? 'bg-white text-[#1b4332] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-signup"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'signup' 
                    ? 'bg-white text-[#1b4332] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-start space-x-2.5 text-xs text-green-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Google One-Tap Auth Button */}
          {authMode !== 'forgot' && (
            <div className="space-y-4 mb-5">
              <button
                type="button"
                id="btn-google-login"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm border border-gray-300 shadow-sm hover:shadow transition flex items-center justify-center space-x-3 group relative overflow-hidden"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-[#1b4332] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>
                      {authMode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
                    </span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-300 w-full" />
                <span className="bg-[#fafaf7] px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  or with email & password
                </span>
                <div className="border-t border-gray-300 w-full" />
              </div>
            </div>
          )}

          {/* 2. Main Form (Sign In / Sign Up) */}
          {authMode !== 'forgot' && (
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              
              {/* Full Name for Sign Up */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-[#1b4332] mb-1">Citizen Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sangay Tashi"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#1b4332] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="input-email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sangaytashi@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1b4332]">Password</label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setErrorMessage(null);
                        setForgotSent(false);
                      }}
                      className="text-[11px] font-semibold text-[#2d6a4f] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="input-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password & District for Sign Up */}
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#1b4332] mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b4332] mb-1">Primary Stewardship Sector</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={preferredSector}
                        onChange={(e) => setPreferredSector(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
                      >
                        <option value="Sector 2: Mao River Watershed & Riparian Buffer">Sector 2: Mao River Watershed</option>
                        <option value="Sector 1: Mindfulness Spine & Bridge Canopy">Sector 1: Mindfulness Spine</option>
                        <option value="Sector 3: Golden Langur Canopy Corridor">Sector 3: Golden Langur Canopy Corridor</option>
                        <option value="Sector 4: Wildlife Migration Buffer Zone">Sector 4: Wildlife Migration Buffer Zone</option>
                        <option value="Sector 5: Circular Bio-Resource Hub">Sector 5: Circular Bio-Resource Hub</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Remember Me / Terms Checkbox */}
              <div className="flex items-center justify-between text-xs py-1">
                <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f]"
                  />
                  <span>Remember my credentials on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-auth-submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{authMode === 'signin' ? 'Sign In' : 'Complete Registration (+100 Karma)'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. Forgot Password Screen */}
          {authMode === 'forgot' && (
            <div className="space-y-4">
              {forgotSent ? (
                <div className="p-6 rounded-2xl bg-green-50 border border-green-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto text-xl">
                    ✓
                  </div>
                  <h4 className="font-bold text-sm text-green-900">Recovery Instructions Sent</h4>
                  <p className="text-xs text-green-800">
                    We sent a secure password reset link to <strong>{email}</strong>. Check your inbox and follow the steps.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setForgotSent(false);
                    }}
                    className="mt-2 text-xs font-bold text-[#2d6a4f] hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1b4332] mb-1">Your Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sangaytashi@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send Password Reset Email</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 4. One-Click Demo Profiles for Quick Testing */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-[#2d6a4f]" />
                Demo Citizen Quick Switch
              </span>
              <span className="text-[10px] text-gray-400">One-click login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetProfiles.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handlePresetLogin(p)}
                  className="p-2.5 rounded-xl bg-white hover:bg-[#edf7f1] border border-gray-200 hover:border-[#52b788] text-left transition-all flex items-center space-x-2.5 group"
                >
                  <span className="text-lg p-1 rounded-lg bg-gray-100 group-hover:bg-white">{p.avatarEmoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                      {p.role === 'admin' ? (
                        <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">ADMIN</span>
                      ) : (
                        <span className="text-[9px] font-semibold text-[#2d6a4f]">Lvl {p.levelNumber}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{p.specialty}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

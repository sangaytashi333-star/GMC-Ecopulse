import React, { useState } from 'react';
import { 
  Activity, 
  MapPin, 
  PlusCircle, 
  User, 
  ShoppingBag, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Compass, 
  Layers, 
  Menu, 
  X, 
  Bell, 
  Heart,
  CheckCircle2,
  LogIn,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { UserProfile, CityMetrics } from '../types';
import { INITIAL_CITY_METRICS, INITIAL_USER_PROFILE } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';

export type NavTabId = 'dashboard' | 'map' | 'missions' | 'marketplace' | 'profile' | 'admin' | 'auth';

interface NavbarProps {
  currentTab?: NavTabId;
  currentView?: NavTabId;
  setCurrentTab?: (tab: NavTabId) => void;
  onNavigate?: (tab: NavTabId) => void;
  user?: UserProfile;
  userPoints?: number;
  metrics?: CityMetrics;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  notifications?: Array<{ id: string; title: string; message: string; time: string; read: boolean }>;
  onOpenReportModal: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  currentView,
  setCurrentTab,
  onNavigate,
  user,
  userPoints,
  metrics = INITIAL_CITY_METRICS,
  soundEnabled = true,
  onToggleSound,
  notifications = [],
  onOpenReportModal,
  onOpenAuthModal,
  onLogout,
}) => {
  const activeView = currentView || currentTab || 'dashboard';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const effectivePoints = userPoints !== undefined ? userPoints : user?.spendablePoints ?? INITIAL_USER_PROFILE.spendablePoints;
  const userRank = user?.levelNumber ?? INITIAL_USER_PROFILE.levelNumber;
  const harmony = metrics?.harmonyScore ?? INITIAL_CITY_METRICS.harmonyScore;

  const handleNavClick = (tab: NavTabId) => {
    if (soundEnabled) {
      playMindfulChime('bell');
    }
    if (onNavigate) {
      onNavigate(tab);
    } else if (setCurrentTab) {
      setCurrentTab(tab);
    }
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const navItems = [
    { id: 'dashboard' as NavTabId, label: 'City Pulse', icon: Activity, badge: `${harmony}%` },
    { id: 'map' as NavTabId, label: 'Eco-Atlas Map', icon: MapPin },
    { id: 'missions' as NavTabId, label: 'Missions', icon: Compass, count: '4 Active' },
    { id: 'marketplace' as NavTabId, label: 'Rewards Market', icon: ShoppingBag },
    { id: 'profile' as NavTabId, label: 'My Impact', icon: User, rank: `Lvl ${userRank}` },
    { id: 'admin' as NavTabId, label: 'HQ Command', icon: ShieldCheck, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1b4332]/95 backdrop-blur-md text-white border-b border-[#2d6a4f]/40 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & City Identity */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => handleNavClick('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#40916c] to-[#1b4332] p-0.5 shadow-md flex items-center justify-center border border-[#52b788]/40">
              <div className="w-full h-full rounded-[10px] bg-[#1b4332] flex items-center justify-center relative overflow-hidden">
                <span className="text-xl">🌿</span>
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#52b788] rounded-full animate-ping opacity-75" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold tracking-tight text-lg sm:text-xl text-white">Gelephu Ecopulse</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-[#2d6a4f] text-[#d8f3dc] rounded tracking-wide uppercase">GMC</span>
              </div>
              <p className="text-[11px] text-[#d8f3dc]/70 font-medium tracking-wide">Mindfulness City Stewardship</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-[#2d6a4f] text-white shadow-inner border border-[#52b788]/30'
                      : 'text-[#d8f3dc]/85 hover:text-white hover:bg-[#2d6a4f]/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#74c69d]' : 'text-[#95d5b2]'}`} />
                  <span>{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-[#52b788]/20 text-[#74c69d] font-bold rounded-full border border-[#52b788]/40">
                      {item.badge}
                    </span>
                  )}
                  {'count' in item && item.count && (
                    <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-[#e07a5f]/20 text-[#f4a261] font-semibold rounded-full">
                      {item.count}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#52b788] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5">
            
            {/* Mindful Audio Toggle */}
            <button
              onClick={() => {
                if (onToggleSound) onToggleSound();
              }}
              title={soundEnabled ? 'Mindful Chimes Active' : 'Sound Muted'}
              className="p-2 rounded-lg bg-[#2d6a4f]/40 hover:bg-[#2d6a4f] text-[#d8f3dc] transition border border-[#52b788]/20"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#74c69d]" /> : <VolumeX className="w-4 h-4 text-[#d8f3dc]/50" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-lg bg-[#2d6a4f]/40 hover:bg-[#2d6a4f] text-[#d8f3dc] transition border border-[#52b788]/20"
              >
                <Bell className="w-4 h-4 text-[#d8f3dc]" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e07a5f] rounded-full animate-pulse" />
                )}
              </button>

              {/* Notification Popup */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-[#1c2826] rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#1b4332]">City Pulse Notifications</span>
                    <span className="text-[10px] text-gray-500">Live Telemetry</span>
                  </div>
                  <div className="space-y-2.5 mt-3 text-xs max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif, index) => (
                        <div key={`${notif.id || 'notif'}-${index}`} className="p-2.5 rounded-lg bg-[#f8f9f6] border border-[#d8f3dc] flex items-start space-x-2.5">
                          <span className="text-sm">🌸</span>
                          <div>
                            <p className="font-semibold text-[#1b4332]">{notif.title}</p>
                            <p className="text-[11px] text-gray-600">{notif.message}</p>
                            <span className="text-[9px] text-gray-400 mt-0.5 block">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 py-2 text-center">No new notifications</p>
                    )}
                  </div>
                  <button 
                    onClick={() => setNotificationOpen(false)}
                    className="w-full mt-3 py-1.5 text-center text-xs font-semibold text-[#2d6a4f] hover:underline"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* Spendable Karma Points Balance */}
            <div 
              onClick={() => handleNavClick('marketplace')}
              title="Click to visit Rewards Marketplace"
              className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2d6a4f] to-[#1b4332] border border-[#52b788]/40 hover:border-[#52b788] shadow-sm transition-all group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f4a261] group-hover:rotate-12 transition-transform" />
              <div className="text-left">
                <span className="block text-[9px] uppercase font-bold tracking-wider text-[#d8f3dc]/70 leading-none">Karma</span>
                <span className="text-xs font-extrabold text-[#d8f3dc] leading-tight group-hover:text-white">{effectivePoints} <span className="text-[10px] font-normal opacity-80">pts</span></span>
              </div>
            </div>

            {/* Citizen Auth Dropdown / Login Button */}
            <div className="relative">
              {user ? (
                <button
                  id="btn-user-menu"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#2d6a4f]/60 hover:bg-[#2d6a4f] border border-[#52b788]/30 transition text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-[#52b788] text-[#081c15] flex items-center justify-center font-extrabold text-[11px]">
                    {user.name ? user.name[0].toUpperCase() : 'S'}
                  </div>
                  <div className="hidden lg:block text-left leading-none pr-1">
                    <span className="block text-xs font-bold text-white truncate max-w-[90px]">{user.name}</span>
                    <span className="text-[9px] text-[#95d5b2]">Lvl {user.levelNumber}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#d8f3dc]/70" />
                </button>
              ) : (
                <button
                  id="btn-login-header"
                  onClick={() => handleNavClick('auth')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#52b788]/20 hover:bg-[#52b788]/30 text-[#d8f3dc] border border-[#52b788]/40 text-xs font-bold transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#74c69d]" />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-[#1c2826] rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2.5 rounded-xl bg-[#f4f9f5] border border-[#d8f3dc] mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-sm">
                        {user.name ? user.name[0].toUpperCase() : 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-[#1b4332] truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email || 'sangaytashi.333@gmail.com'}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-gray-600">{user.levelTitle}</span>
                      <span className="font-bold text-[#2d6a4f]">Lvl {user.levelNumber}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full px-3 py-2 rounded-lg text-left hover:bg-gray-100 flex items-center space-x-2 text-gray-700 font-semibold transition"
                    >
                      <User className="w-4 h-4 text-[#2d6a4f]" />
                      <span>My Stewardship Impact</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('auth')}
                      className="w-full px-3 py-2 rounded-lg text-left hover:bg-gray-100 flex items-center space-x-2 text-gray-700 font-semibold transition"
                    >
                      <LogIn className="w-4 h-4 text-[#2d6a4f]" />
                      <span>Switch / Sign In Account</span>
                    </button>
                    {onLogout && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left hover:bg-red-50 text-red-600 flex items-center space-x-2 font-semibold transition"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Report CTA Button */}
            <button
              id="btn-report-observation"
              onClick={() => {
                if (soundEnabled) playMindfulChime('karma');
                onOpenReportModal();
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#52b788] hover:bg-[#74c69d] active:bg-[#40916c] text-[#081c15] font-bold text-xs shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 text-[#081c15]" />
              <span className="hidden sm:inline">Report</span>
              <span className="sm:hidden">+</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[#2d6a4f] text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-[#2d6a4f]/50 space-y-1 bg-[#1b4332]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#2d6a4f] text-white'
                      : 'text-[#d8f3dc] hover:bg-[#2d6a4f]/50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-[#74c69d]" />
                    <span>{item.label}</span>
                  </div>
                  {'badge' in item && item.badge && (
                    <span className="text-xs bg-[#52b788]/30 px-2 py-0.5 rounded text-[#d8f3dc] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            
            {/* Mobile Auth Button */}
            <button
              onClick={() => handleNavClick('auth')}
              className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#d8f3dc] hover:bg-[#2d6a4f]/50 border-t border-[#2d6a4f]/30 mt-2"
            >
              <LogIn className="w-4 h-4 text-[#74c69d]" />
              <span>{user ? `Citizen: ${user.name} (Switch)` : 'Sign In / Register'}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};


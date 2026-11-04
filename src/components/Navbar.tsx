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
  ChevronDown,
  Trophy
} from 'lucide-react';
import { UserProfile, CityMetrics } from '../types';
import { INITIAL_CITY_METRICS, INITIAL_USER_PROFILE } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';

export type NavTabId = 'dashboard' | 'map' | 'missions' | 'marketplace' | 'profile' | 'rankings' | 'admin' | 'auth';

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
  onForceSync?: () => void;
  isSyncing?: boolean;
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
  onForceSync,
  isSyncing,
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

  const isOfficial = user?.role === 'admin' || user?.role === 'official';

  const navItems = [
    { id: 'dashboard' as NavTabId, label: 'City Pulse', icon: Activity, badge: `${harmony}%` },
    { id: 'map' as NavTabId, label: 'Eco-Atlas Map', icon: MapPin },
    { id: 'missions' as NavTabId, label: 'Missions', icon: Compass, count: '4 Active' },
    { id: 'rankings' as NavTabId, label: 'Rankings', icon: Trophy, badge: '🌟 Rising' },
    { id: 'marketplace' as NavTabId, label: 'Rewards Market', icon: ShoppingBag },
    { id: 'profile' as NavTabId, label: 'My Impact', icon: User, rank: `Lvl ${userRank}` },
    { id: 'admin' as NavTabId, label: 'HQ Command', icon: ShieldCheck, isOfficialRestricted: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#1b4332]/95 backdrop-blur-md text-white border-b border-[#2d6a4f]/40 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Logo & City Identity */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none group" onClick={() => handleNavClick('dashboard')}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 p-0.5 shadow-md flex items-center justify-center border border-[#52b788]/40 shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                <img 
                  src="/app-logo.png" 
                  alt="GMC Ecopulse Logo" 
                  className="w-full h-full object-contain rounded-lg drop-shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/aistudio/Screenshot_2026-11-03_181211_7b7d5d60.png';
                  }}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#52b788] rounded-full animate-ping opacity-75 pointer-events-none" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold tracking-tight text-base sm:text-xl text-white truncate">Gelephu Ecopulse</span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-[#2d6a4f] text-[#d8f3dc] rounded tracking-wide uppercase">GMC</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#d8f3dc]/70 font-medium tracking-wide truncate">Mindfulness City Stewardship</p>
              </div>
            </div>

              {/* Desktop Navigation (visible on md screens and up) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center space-x-1 lg:space-x-1.5 min-h-[40px] ${
                      isActive
                        ? 'bg-[#2d6a4f] text-white shadow-inner border border-[#52b788]/30'
                        : 'text-[#d8f3dc]/85 hover:text-white hover:bg-[#2d6a4f]/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${isActive ? 'text-[#74c69d]' : 'text-[#95d5b2]'}`} />
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="xl:hidden">
                      {item.id === 'dashboard' ? 'Pulse' : 
                       item.id === 'map' ? 'Atlas' :
                       item.id === 'missions' ? 'Missions' :
                       item.id === 'rankings' ? 'Ranks' :
                       item.id === 'marketplace' ? 'Market' :
                       item.id === 'profile' ? 'Impact' : 'HQ'}
                    </span>
                    {'badge' in item && item.badge && (
                      <span className="hidden xl:inline-block ml-1 px-1.5 py-0.2 text-[10px] bg-[#52b788]/20 text-[#74c69d] font-bold rounded-full border border-[#52b788]/40">
                        {item.badge}
                      </span>
                    )}
                    {'count' in item && item.count && (
                      <span className="hidden 2xl:inline-block ml-1 px-1.5 py-0.2 text-[9px] bg-[#e07a5f]/20 text-[#f4a261] font-semibold rounded-full">
                        {item.count}
                      </span>
                    )}
                    {item.isOfficialRestricted && !isOfficial && (
                      <span className="hidden xl:inline-block ml-1 px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 font-bold rounded-full border border-amber-500/30">
                        Official
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#52b788] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 lg:space-x-2.5">

              {/* Universal Web App Download / Install Action (Visible on all devices) */}
              <PWAInstallButton />

              {/* Desktop-only secondary controls: Offline, Sound, Bell (moved to mobile drawer on <lg) */}
              <div className="hidden lg:flex items-center space-x-2">
                <OfflineIndicator onForceSync={onForceSync} isSyncing={isSyncing} />

                {/* Mindful Audio Toggle */}
                <button
                  onClick={() => {
                    if (onToggleSound) onToggleSound();
                  }}
                  title={soundEnabled ? 'Mindful Chimes Active' : 'Sound Muted'}
                  className="p-2 rounded-lg bg-[#2d6a4f]/40 hover:bg-[#2d6a4f] text-[#d8f3dc] transition border border-[#52b788]/20 min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-[#74c69d]" /> : <VolumeX className="w-4 h-4 text-[#d8f3dc]/50" />}
                </button>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 rounded-lg bg-[#2d6a4f]/40 hover:bg-[#2d6a4f] text-[#d8f3dc] transition border border-[#52b788]/20 min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95"
                    title="City Pulse Notifications"
                  >
                    <Bell className="w-4 h-4 text-[#d8f3dc]" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e07a5f] rounded-full animate-pulse" />
                    )}
                  </button>

                  {/* Notification Popup */}
                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-[#1c2826] rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#1b4332]">City Pulse Notifications</span>
                        <span className="text-[10px] text-gray-500">Live Telemetry</span>
                      </div>
                      <div className="space-y-2 mt-3 text-xs max-h-60 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif, index) => (
                            <div key={`${notif.id || 'notif'}-${index}`} className="p-2.5 rounded-lg bg-[#f8f9f6] border border-[#d8f3dc] flex items-start space-x-2.5">
                              <span className="text-sm shrink-0">🌸</span>
                              <div className="min-w-0">
                                <p className="font-semibold text-[#1b4332] truncate">{notif.title}</p>
                                <p className="text-[11px] text-gray-600 leading-snug">{notif.message}</p>
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
                        className="w-full mt-3 py-1.5 text-center text-xs font-semibold text-[#2d6a4f] hover:underline min-h-[38px]"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Spendable Karma Points Balance (compact on mobile) */}
              <div 
                onClick={() => handleNavClick('marketplace')}
                title="Click to visit Rewards Marketplace"
                className="cursor-pointer flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2d6a4f] to-[#1b4332] border border-[#52b788]/40 hover:border-[#52b788] shadow-sm transition-all group min-h-[40px] shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#f4a261] group-hover:rotate-12 transition-transform shrink-0" />
                <div className="text-left">
                  <span className="hidden sm:block text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-[#d8f3dc]/70 leading-none">Karma</span>
                  <span className="text-xs font-extrabold text-[#d8f3dc] leading-tight group-hover:text-white whitespace-nowrap">
                    {effectivePoints} <span className="text-[9px] font-normal opacity-80">pts</span>
                  </span>
                </div>
              </div>

              {/* Citizen Auth Dropdown / Login Button */}
              <div className="relative">
                {user ? (
                  <button
                    id="btn-user-menu"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-1 sm:space-x-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-lg bg-[#2d6a4f]/60 hover:bg-[#2d6a4f] border border-[#52b788]/30 transition text-left min-h-[40px] active:scale-95"
                    title={`Citizen: ${user.name}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#52b788] text-[#081c15] flex items-center justify-center font-extrabold text-[11px] shrink-0 overflow-hidden">
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt={user.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name ? user.name[0].toUpperCase() : 'S'
                      )}
                    </div>
                    <div className="hidden xl:block text-left leading-none pr-1">
                      <span className="block text-xs font-bold text-white truncate max-w-[85px]">{user.name}</span>
                      <span className="text-[9px] text-[#95d5b2]">Lvl {user.levelNumber}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-[#d8f3dc]/70 shrink-0" />
                  </button>
                ) : (
                  <button
                    id="btn-login-header"
                    onClick={() => handleNavClick('auth')}
                    className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#52b788]/20 hover:bg-[#52b788]/30 text-[#d8f3dc] border border-[#52b788]/40 text-xs font-bold transition min-h-[40px]"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#74c69d]" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}

                {/* User Dropdown Menu */}
                {userDropdownOpen && user && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-[#1c2826] rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2.5 rounded-xl bg-[#f4f9f5] border border-[#d8f3dc] mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.name ? user.name[0].toUpperCase() : 'S'
                          )}
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
                        className="w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 flex items-center space-x-2 text-gray-700 font-semibold transition min-h-[40px]"
                      >
                        <User className="w-4 h-4 text-[#2d6a4f]" />
                        <span>My Stewardship Impact</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('rankings')}
                        className="w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 flex items-center space-x-2 text-gray-700 font-semibold transition min-h-[40px]"
                      >
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span>Community Rankings</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('auth')}
                        className="w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 flex items-center space-x-2 text-gray-700 font-semibold transition min-h-[40px]"
                      >
                        <LogIn className="w-4 h-4 text-[#2d6a4f]" />
                        <span>Switch Account</span>
                      </button>
                      {onLogout && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full px-3 py-2.5 rounded-lg text-left hover:bg-red-50 text-red-600 flex items-center space-x-2 font-semibold transition min-h-[40px]"
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
                className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg bg-[#52b788] hover:bg-[#74c69d] active:bg-[#40916c] text-[#081c15] font-bold text-xs shadow-md transition-all active:scale-95 min-h-[40px] shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-[#081c15]" />
                <span className="hidden sm:inline">Report</span>
                <span className="sm:hidden text-xs">Log</span>
              </button>

              {/* Mobile / Tablet Drawer Hamburger Toggle (<lg screens) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-[#2d6a4f]/60 hover:bg-[#2d6a4f] text-[#d8f3dc] transition border border-[#52b788]/30 min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95"
                aria-label="Open mobile navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile / Tablet Slide-Down Sheet Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0d2818]/98 backdrop-blur-xl border-b border-[#2d6a4f]/60 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
            
            {/* Prominent Download App Banner */}
            <PWAInstallButton variant="menu-item" />

            {/* Quick Status Bar: Offline & Sound Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#1b4332]/80 border border-[#52b788]/30">
              <div className="flex items-center space-x-2">
                <OfflineIndicator onForceSync={onForceSync} isSyncing={isSyncing} />
              </div>

              <div className="flex items-center space-x-2">
                {/* Audio chime toggle in drawer */}
                <button
                  onClick={() => {
                    if (onToggleSound) onToggleSound();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#2d6a4f]/60 text-xs font-semibold text-[#d8f3dc] flex items-center space-x-1.5 min-h-[36px]"
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#74c69d]" /> : <VolumeX className="w-3.5 h-3.5 text-gray-400" />}
                  <span>{soundEnabled ? 'Chimes On' : 'Chimes Muted'}</span>
                </button>

                {/* Notifications trigger */}
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 rounded-xl bg-[#2d6a4f]/60 text-[#d8f3dc] min-h-[36px] min-w-[36px] flex items-center justify-center relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#e07a5f] rounded-full animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* Notification Drawer Expanded */}
            {notificationOpen && (
              <div className="p-3 rounded-2xl bg-white text-gray-800 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-[#1b4332] border-b pb-1">
                  <span>City Pulse Notifications</span>
                  <button onClick={() => setNotificationOpen(false)} className="text-gray-400">✕</button>
                </div>
                {notifications.map((n, i) => (
                  <div key={i} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="font-bold text-[#1b4332]">{n.title}</p>
                    <p className="text-[11px] text-gray-600">{n.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* All Navigation Links in Drawer */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block px-2 mb-1">
                Gelephu Navigation
              </span>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between min-h-[44px] ${
                      isActive 
                        ? 'bg-[#52b788] text-[#081c15]' 
                        : 'text-[#d8f3dc] hover:bg-[#1b4332]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#081c15]' : 'text-[#74c69d]'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {'badge' in item && item.badge && (
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                          isActive ? 'bg-[#081c15]/20 text-[#081c15]' : 'bg-[#52b788]/20 text-[#74c69d]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.isOfficialRestricted && !isOfficial && (
                        <span className="px-2 py-0.5 text-[9px] bg-amber-500/20 text-amber-300 font-bold rounded-full">
                          Official
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* User Profile / Sign Out Action */}
            {user && (
              <div className="pt-2 border-t border-[#2d6a4f]/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[#52b788] text-[#081c15] flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name[0] : 'S'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-none">{user.name}</p>
                    <p className="text-[10px] text-[#95d5b2]">{user.levelTitle}</p>
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30 transition min-h-[36px]"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            )}

          </div>
        )}
      </header>

      {/* Android/iOS Mobile Bottom Navigation Bar (md:hidden) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#081c15]/95 backdrop-blur-lg border-t border-[#2d6a4f]/50 px-1 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl">
        {[
          { id: 'dashboard' as NavTabId, label: 'Pulse', icon: Activity },
          { id: 'map' as NavTabId, label: 'Atlas', icon: MapPin },
          { id: 'missions' as NavTabId, label: 'Missions', icon: Compass },
          { id: 'rankings' as NavTabId, label: 'Ranks', icon: Trophy },
          { id: 'marketplace' as NavTabId, label: 'Rewards', icon: ShoppingBag },
          { id: 'profile' as NavTabId, label: 'Profile', icon: User },
          ...(isOfficial ? [{ id: 'admin' as NavTabId, label: 'HQ', icon: ShieldCheck }] : [])
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition min-h-[48px] active:scale-95 ${
                isActive
                  ? 'bg-[#1b4332] text-[#52b788] font-extrabold shadow-inner'
                  : 'text-[#d8f3dc]/70 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#52b788]' : 'text-[#d8f3dc]/70'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[50px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};


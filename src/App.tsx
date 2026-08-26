import React, { useState, useEffect } from 'react';
import { Navbar, NavTabId } from './components/Navbar';
import { CityPulseDashboard } from './components/CityPulseDashboard';
import { InteractiveEcoMap } from './components/InteractiveEcoMap';
import { MissionsHub } from './components/MissionsHub';
import { StewardshipProfile } from './components/StewardshipProfile';
import { RewardsMarketplace } from './components/RewardsMarketplace';
import { AdminPortal } from './components/AdminPortal';
import { AuthScreen } from './components/AuthScreen';
import { ActiveReportingModal } from './components/ActiveReportingModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { FixResolutionModal } from './components/FixResolutionModal';
import { 
  INITIAL_CITY_METRICS, 
  INITIAL_REPORTS, 
  INITIAL_MISSIONS, 
  INITIAL_REWARDS, 
  INITIAL_USER, 
  INITIAL_FIELD_TEAMS,
  INITIAL_CITY_INSIGHT
} from './data/initialData';
import { 
  CitizenReport, 
  Mission, 
  RewardItem, 
  UserProfile, 
  CityMetrics, 
  FieldTeam, 
  RedeemedVoucher, 
  ReportStatus,
  CityInsight,
  Coordinates,
  ResolutionEvidence
} from './types';
import { playMindfulChime, toggleSoundMute, isSoundMuted } from './utils/audio';
import { useLiveLocation } from './hooks/useLiveLocation';

const STORAGE_AUTH_KEY = 'gmc_citizen_auth_user';
const SESSION_AUTH_KEY = 'gmc_citizen_session_authenticated';

export default function App() {
  // Enforce authentic login first when opening the application
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [currentView, setCurrentView] = useState<NavTabId>('dashboard');
  const [reports, setReports] = useState<CitizenReport[]>(INITIAL_REPORTS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  
  // Real-time Geolocation Hook with real-time GPS & simulation capabilities
  const {
    locationState: userLocation,
    startRealLocationTracking: recenterGPS,
    setSimulatedCoords: simulateGMCLocation,
    toggleLiveTracking: toggleTracking,
  } = useLiveLocation();

  // Persisted citizen profile
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return INITIAL_USER;
  });

  const [metrics, setMetrics] = useState<CityMetrics>(INITIAL_CITY_METRICS);
  const [cityInsight, setCityInsight] = useState<CityInsight>(INITIAL_CITY_INSIGHT);
  const [fieldTeams, setFieldTeams] = useState<FieldTeam[]>(INITIAL_FIELD_TEAMS);
  const [redeemedVouchers, setRedeemedVouchers] = useState<RedeemedVoucher[]>([
    {
      id: 'v-initial-1',
      rewardId: 'rew-1',
      title: 'Gelephu Geothermal Hot Springs (Tshachu) Day Pass',
      code: 'GMC-TSHACHU-8291',
      pointsPaid: 250,
      redeemedAt: 'Yesterday, 4:15 PM',
      status: 'active',
      location: 'Mao River Tshachu Thermal Complex',
      imageEmoji: '♨️'
    }
  ]);

  const [isReportingModalOpen, setIsReportingModalOpen] = useState(false);
  const [reportInitialCoords, setReportInitialCoords] = useState<Coordinates | undefined>(undefined);
  const [reportInitialSector, setReportInitialSector] = useState<string | undefined>(undefined);
  const [inspectingReport, setInspectingReport] = useState<CitizenReport | null>(null);
  const [fixingReport, setFixingReport] = useState<CitizenReport | null>(null);
  const [soundOn, setSoundOn] = useState(!isSoundMuted());
  const [mapSectorFilter, setMapSectorFilter] = useState<string | undefined>(undefined);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Corridor Cleared',
      message: 'Canopy Bridge 14 langur overpass inspection verified.',
      time: '12m ago',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Solar Surge Recorded',
      message: 'Mindfulness Spine achieved 100% clean hydro-solar offset.',
      time: '1h ago',
      read: false
    }
  ]);

  // Persist user changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }, [user]);

  const handleSoundToggle = () => {
    const nextState = toggleSoundMute();
    setSoundOn(nextState);
    if (nextState) playMindfulChime('bell');
  };

  const handleNavigate = (view: NavTabId) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playMindfulChime('bell');
  };

  const handleNavigateToMapWithSector = (sectorName?: string) => {
    setMapSectorFilter(sectorName);
    setCurrentView('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playMindfulChime('bell');
  };

  const handleOpenReportWithCoords = (coords: Coordinates, sectorName: string) => {
    setReportInitialCoords(coords);
    setReportInitialSector(sectorName);
    setIsReportingModalOpen(true);
    playMindfulChime('bell');
  };

  // Auth Handlers
  const handleLoginSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
    } catch (e) {
      console.warn('Session storage error:', e);
    }
    setCurrentView('dashboard');
    playMindfulChime('karma');

    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNotifications(prev => [
      {
        id: notifId,
        title: 'Authentic Citizen Session Active',
        message: `Tashi Delek, ${authenticatedUser.name}! Securely connected to GMC Telemetry.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const handleLogout = () => {
    playMindfulChime('bell');
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    } catch (e) {
      console.warn('Session storage clear error:', e);
    }
    setIsAuthenticated(false);
    setCurrentView('auth');
  };

  // Submit new report
  const handleSubmitReport = (newReport: CitizenReport) => {
    setReports(prev => [newReport, ...prev]);

    // Update user profile impact
    setUser(prev => ({
      ...prev,
      spendablePoints: prev.spendablePoints + newReport.pointsAwarded,
      totalKarmaPoints: prev.totalKarmaPoints + newReport.pointsAwarded,
      wildlifeObservedCount: newReport.category === 'wildlife' ? prev.wildlifeObservedCount + 1 : prev.wildlifeObservedCount,
      wasteRemovedKg: newReport.category === 'waste' ? prev.wasteRemovedKg + 12 : prev.wasteRemovedKg,
    }));

    // Add Notification
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNotifications(prev => [
      {
        id: notifId,
        title: 'Report Logged & Verified',
        message: `Earned +${newReport.pointsAwarded} Karma for ${newReport.title}`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  // Join or Leave mission
  const handleJoinMission = (missionId: string) => {
    setMissions(prev =>
      prev.map(m => {
        if (m.id === missionId) {
          const joined = !m.joined;
          const currentParticipants = joined ? m.currentParticipants + 1 : Math.max(0, m.currentParticipants - 1);
          
          if (joined) {
            // Give steward participation karma
            setUser(u => ({
              ...u,
              spendablePoints: u.spendablePoints + m.rewardPoints,
              totalKarmaPoints: u.totalKarmaPoints + m.rewardPoints,
              missionsCompleted: u.missionsCompleted + 1,
              treesPlanted: m.category === 'revegetation' ? u.treesPlanted + 5 : u.treesPlanted
            }));

            const joinNotifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setNotifications(n => [
              {
                id: joinNotifId,
                title: 'Enrolled in Mission',
                message: `Joined "${m.title}". +${m.rewardPoints} Karma reserved.`,
                time: 'Just now',
                read: false
              },
              ...n
            ]);
          }

          return { ...m, joined, currentParticipants };
        }
        return m;
      })
    );
  };

  // Propose mission
  const handleCreateMission = (newMission: Mission) => {
    setMissions(prev => [newMission, ...prev]);
    setUser(u => ({
      ...u,
      spendablePoints: u.spendablePoints + 50,
      totalKarmaPoints: u.totalKarmaPoints + 50,
    }));
  };

  // Redeem Reward
  const handleRedeemReward = (reward: RewardItem): boolean => {
    if (user.spendablePoints < reward.pointsCost) return false;

    // Deduct points
    setUser(prev => ({
      ...prev,
      spendablePoints: prev.spendablePoints - reward.pointsCost
    }));

    // Create unique voucher pass
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const prefix = reward.category === 'wellness' ? 'TSHACHU' : reward.category === 'transit' ? 'TRANSIT' : 'HARVEST';
    const newVoucher: RedeemedVoucher = {
      id: `vouch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      rewardId: reward.id,
      title: reward.title,
      code: `GMC-${prefix}-${randomHex}`,
      pointsPaid: reward.pointsCost,
      redeemedAt: 'Just now',
      status: 'active',
      location: reward.location,
      imageEmoji: reward.imageEmoji
    };

    setRedeemedVouchers(prev => [newVoucher, ...prev]);

    const redeemNotifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNotifications(prev => [
      {
        id: redeemNotifId,
        title: 'Pass Issued',
        message: `Redeemed ${reward.title}. Voucher ready in Wallet.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);

    return true;
  };

  // Upvote Report
  const handleUpvoteReport = (reportId: string) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          const upvoted = !r.userUpvoted;
          if (upvoted) playMindfulChime('bell');
          return {
            ...r,
            userUpvoted: upvoted,
            upvotes: upvoted ? r.upvotes + 1 : Math.max(0, r.upvotes - 1)
          };
        }
        return r;
      })
    );
  };

  // Open Citizen Fix / Remediation Modal
  const handleOpenFixResolution = (report: CitizenReport) => {
    setFixingReport(report);
  };

  // Citizen submits cleanup evidence
  const handleSubmitFixResolution = (reportId: string, evidence: ResolutionEvidence) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'pending_verification' as ReportStatus,
            resolutionEvidence: evidence
          };
        }
        return r;
      })
    );

    // Provide immediate feedback notification
    setNotifications(prev => [
      {
        id: `notif-fix-sub-${Date.now()}`,
        title: '🌱 Clean-up Evidence Forwarded to HQ',
        message: `Your remediation for "${fixingReport?.title || 'incident'}" has been submitted for official GMC verification. +${evidence.pointsAwarded || 200} Karma will disburse upon review.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);

    playMindfulChime('badge');
    setFixingReport(null);
    if (inspectingReport?.id === reportId) {
      setInspectingReport(null);
    }
  };

  // HQ Official approves citizen cleanup and distributes Karma bounty
  const handleApproveResolution = (reportId: string, bonusPoints: number, officialNotes?: string) => {
    let fixerName = '';
    let reportTitle = '';

    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          fixerName = r.resolutionEvidence?.fixerName || user.name;
          reportTitle = r.title;
          return {
            ...r,
            status: 'resolved' as ReportStatus,
            resolvedAt: 'Just now',
            resolutionNotes: officialNotes || 'Remediation verified & certified by GMC HQ Command.',
            resolutionEvidence: r.resolutionEvidence
              ? {
                  ...r.resolutionEvidence,
                  isVerifiedByHQ: true,
                  verifiedByOfficial: user.name,
                  pointsAwarded: bonusPoints
                }
              : undefined
          };
        }
        return r;
      })
    );

    // If current logged-in user is the fixer (or in local prototype session), award the Karma points
    setUser(u => ({
      ...u,
      spendablePoints: u.spendablePoints + bonusPoints,
      totalKarmaPoints: u.totalKarmaPoints + bonusPoints,
      stats: {
        ...u.stats,
        reportsResolved: (u.stats.reportsResolved || 0) + 1
      }
    }));

    // Update city telemetry metrics
    setMetrics(m => ({
      ...m,
      activeIncidentsCount: Math.max(0, m.activeIncidentsCount - 1),
      harmonyScore: Math.min(100, +(m.harmonyScore + 0.4).toFixed(1))
    }));

    setNotifications(prev => [
      {
        id: `notif-cert-${Date.now()}`,
        title: '✅ Clean-up Certified & Karma Awarded',
        message: `Remediation for "${reportTitle}" approved by HQ Command. +${bonusPoints} Karma Points awarded to ${fixerName || 'Steward'}!`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);

    playMindfulChime('karma');
  };

  // HQ Official requests more evidence / rejects cleanup
  const handleRejectResolution = (reportId: string, rejectionNotes: string) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'in-progress' as ReportStatus,
            resolutionNotes: rejectionNotes
          };
        }
        return r;
      })
    );

    setNotifications(prev => [
      {
        id: `notif-reject-${Date.now()}`,
        title: '⚠️ Additional Evidence Requested',
        message: `HQ Command requested more photo proof for report #${reportId}. Reason: ${rejectionNotes}`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);

    playMindfulChime('bell');
  };

  // HQ Official approves citizen proposed mission
  const handleApproveMission = (missionId: string) => {
    let approvedTitle = '';
    setMissions(prev =>
      prev.map(m => {
        if (m.id === missionId) {
          approvedTitle = m.title;
          return {
            ...m,
            status: 'active'
          };
        }
        return m;
      })
    );

    setNotifications(prev => [
      {
        id: `notif-mission-live-${Date.now()}`,
        title: '🎯 Mission Approved by HQ',
        message: `"${approvedTitle || 'Citizen Mission'}" is now live and published to the public stewardship hub!`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);

    playMindfulChime('badge');
  };

  // HQ Official rejects citizen proposed mission
  const handleRejectMission = (missionId: string, reason?: string) => {
    setMissions(prev =>
      prev.filter(m => m.id !== missionId)
    );

    setNotifications(prev => [
      {
        id: `notif-mission-dec-${Date.now()}`,
        title: 'Mission Proposal Declined',
        message: `Mission proposal #${missionId} was reviewed and archived by HQ Command.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);

    playMindfulChime('bell');
  };

  // Admin update report triage
  const handleUpdateReportStatus = (
    reportId: string, 
    newStatus: ReportStatus, 
    fieldTeamAssigned?: string, 
    notes?: string
  ) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: newStatus,
            fieldTeamAssigned: fieldTeamAssigned || r.fieldTeamAssigned,
            resolutionNotes: notes || r.resolutionNotes,
            resolvedAt: newStatus === 'resolved' ? 'Just now' : undefined
          };
        }
        return r;
      })
    );

    if (newStatus === 'resolved') {
      setMetrics(m => ({
        ...m,
        activeIncidentsCount: Math.max(0, m.activeIncidentsCount - 1),
        harmonyScore: Math.min(100, +(m.harmonyScore + 0.3).toFixed(1))
      }));
    }
  };

  // Admin modulation of metrics
  const handleUpdateMetrics = (newMetrics: Partial<CityMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  // Official Role Guard elevation
  const handlePromoteToOfficial = () => {
    setUser(prev => ({
      ...prev,
      role: 'official',
      levelTitle: 'HQ Biosphere Warden & Director',
      levelNumber: Math.max(prev.levelNumber, 7)
    }));
    setNotifications(prev => [
      {
        id: `notif-auth-${Date.now()}`,
        title: '🛡️ Official Clearance Authenticated',
        message: 'You have been elevated to GMC Municipal Official. HQ Command permissions active.',
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const handleDemoteToCitizen = () => {
    setUser(prev => ({
      ...prev,
      role: 'citizen',
      levelTitle: 'Senior Forest Steward'
    }));
  };

  // Official mission deployment
  const handleAddOfficialMission = (newMissionData: Omit<Mission, 'id' | 'joined' | 'currentParticipants'>) => {
    const newMission: Mission = {
      ...newMissionData,
      id: `m-official-${Date.now()}`,
      joined: false,
      currentParticipants: 1
    };
    setMissions(prev => [newMission, ...prev]);
    setNotifications(prev => [
      {
        id: `notif-mission-${Date.now()}`,
        title: `🎯 New Mission: ${newMission.title}`,
        message: `Deployed by HQ Command in ${newMission.sector}. Bounty: ${newMission.rewardPoints} Karma.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  // Official broadcast notice
  const handleBroadcastNotice = (title: string, message: string, severity: 'info' | 'warning' | 'alert') => {
    setNotifications(prev => [
      {
        id: `notif-bulletin-${Date.now()}`,
        title: `${severity === 'alert' ? '🚨' : severity === 'warning' ? '⚠️' : '📢'} ${title}`,
        message,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  // Profile update handler
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updated }));
  };

  // Refresh AI City Insight
  const handleRefreshInsight = async () => {
    try {
      const res = await fetch('/api/city-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.insight) {
          setCityInsight(data.insight);
          return;
        }
      }
    } catch (err) {
      console.warn('Using client-side insight fallback:', err);
    }
    // Fallback dynamic update if network error
    setCityInsight(prev => ({
      ...prev,
      headline: "Mao River Corridor & Forest Equilibrium at Peak Harmony",
      summary: "Gelephu's micro-hydro grids are operating at full capacity while dawn bird songs indicate flourishing riverbank regeneration.",
      dailyMindfulnessPrompt: "Take three mindful breaths before crossing the Mindfulness Bridge today; notice the harmony between current flow and forest canopies.",
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  };

  // If not authenticated, require authentic login first on app open
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafaf7] text-[#1c2826] flex flex-col font-sans selection:bg-[#52b788]/30">
        <AuthScreen
          currentUser={user}
          onLoginSuccess={handleLoginSuccess}
          isModal={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#1c2826] flex flex-col font-sans selection:bg-[#52b788]/30">
      
      {/* Top Universal Serene Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        user={user}
        userPoints={user.spendablePoints}
        metrics={metrics}
        soundEnabled={soundOn}
        onToggleSound={handleSoundToggle}
        notifications={notifications}
        onOpenReportModal={() => {
          setReportInitialCoords(undefined);
          setReportInitialSector(undefined);
          setIsReportingModalOpen(true);
        }}
        onOpenAuthModal={() => handleNavigate('auth')}
        onLogout={handleLogout}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-16 md:pb-8">
        
        {/* 1. City Pulse Dashboard */}
        {currentView === 'dashboard' && (
          <CityPulseDashboard
            metrics={metrics}
            reports={reports}
            missions={missions}
            cityInsight={cityInsight}
            onRefreshInsight={handleRefreshInsight}
            onOpenReportModal={() => {
              setReportInitialCoords(undefined);
              setReportInitialSector(undefined);
              setIsReportingModalOpen(true);
            }}
            onNavigateToMap={handleNavigateToMapWithSector}
            onNavigateToMissions={() => handleNavigate('missions')}
            onUpvoteReport={handleUpvoteReport}
            onSelectReport={(report) => setInspectingReport(report)}
          />
        )}

        {/* 2. Interactive Eco-Map with Real Leaflet Map & Live Location */}
        {currentView === 'map' && (
          <InteractiveEcoMap
            reports={reports}
            missions={missions}
            userLocation={userLocation}
            initialSectorFilter={mapSectorFilter}
            onSelectReport={(report) => setInspectingReport(report)}
            onJoinMission={handleJoinMission}
            onOpenReportModal={() => {
              setReportInitialCoords(undefined);
              setReportInitialSector(undefined);
              setIsReportingModalOpen(true);
            }}
            onOpenReportModalWithCoords={handleOpenReportWithCoords}
            onUpvoteReport={handleUpvoteReport}
            onOpenFixResolution={handleOpenFixResolution}
            onRecenterGPS={recenterGPS}
            onToggleTracking={toggleTracking}
            onSimulateGMCLocation={simulateGMCLocation}
          />
        )}

        {/* 3. Missions Hub with Real GPS Distance */}
        {currentView === 'missions' && (
          <MissionsHub
            missions={missions}
            onJoinMission={handleJoinMission}
            onNavigateToMap={handleNavigateToMapWithSector}
            onCreateMission={handleCreateMission}
            userCoords={userLocation.coords}
          />
        )}

        {/* 4. Rewards Marketplace */}
        {currentView === 'marketplace' && (
          <RewardsMarketplace
            rewards={rewards}
            spendablePoints={user.spendablePoints}
            redeemedVouchers={redeemedVouchers}
            onRedeemReward={handleRedeemReward}
            onOpenReportModal={() => {
              setReportInitialCoords(undefined);
              setReportInitialSector(undefined);
              setIsReportingModalOpen(true);
            }}
          />
        )}

        {/* 5. Personal Impact Profile */}
        {currentView === 'profile' && (
          <StewardshipProfile
            user={user}
            userReports={reports.filter(r => r.reporterName === user.name || r.reporterName === 'Anonymous Steward')}
            onUpdateProfile={handleUpdateProfile}
            onOpenReportModal={() => {
              setReportInitialCoords(undefined);
              setReportInitialSector(undefined);
              setIsReportingModalOpen(true);
            }}
          />
        )}

        {/* 6. Admin Portal (HQ Command) */}
        {currentView === 'admin' && (
          <AdminPortal
            user={user}
            reports={reports}
            fieldTeams={fieldTeams}
            metrics={metrics}
            missions={missions}
            onPromoteToOfficial={handlePromoteToOfficial}
            onDemoteToCitizen={handleDemoteToCitizen}
            onUpdateReportStatus={handleUpdateReportStatus}
            onApproveResolution={handleApproveResolution}
            onRejectResolution={handleRejectResolution}
            onApproveMission={handleApproveMission}
            onRejectMission={handleRejectMission}
            onUpdateMetrics={handleUpdateMetrics}
            onAddMission={handleAddOfficialMission}
            onBroadcastNotice={handleBroadcastNotice}
          />
        )}

        {/* 7. Dedicated Citizen Authentication Screen */}
        {currentView === 'auth' && (
          <AuthScreen
            currentUser={user}
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => handleNavigate('dashboard')}
          />
        )}

      </main>

      {/* Mindful Footer */}
      <footer className="mt-auto border-t border-gray-200/80 bg-white py-6 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#52b788]" />
            <span className="font-bold text-[#1b4332]">Gelephu Mindfulness City (GMC)</span>
            <span>• Department of Biosphere & Urban Resilience</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleNavigate('dashboard')}
              className="hover:text-[#1b4332] font-semibold transition"
            >
              City Pulse
            </button>
            <button
              onClick={() => handleNavigate('map')}
              className="hover:text-[#1b4332] font-semibold transition"
            >
              Living Atlas
            </button>
            <button
              onClick={() => handleNavigate('auth')}
              className="hover:text-[#1b4332] font-semibold transition text-[#2d6a4f]"
            >
              Citizen Account
            </button>
            <button
              onClick={() => handleNavigate('admin')}
              className="hover:text-[#1b4332] font-semibold transition text-[#2d6a4f]"
            >
              HQ Command
            </button>
            <span>Harmonic Frequency 432Hz</span>
          </div>
        </div>
      </footer>

      {/* Active Observation Modal (Citizen Camera / Upload Studio) */}
      <ActiveReportingModal
        isOpen={isReportingModalOpen}
        onClose={() => setIsReportingModalOpen(false)}
        onSubmitReport={handleSubmitReport}
        userName={user.name}
        initialCoordinates={reportInitialCoords}
        initialSector={reportInitialSector}
        userLocation={userLocation}
      />

      {/* Report Inspection Modal */}
      <ReportDetailModal
        report={inspectingReport}
        onClose={() => setInspectingReport(null)}
        onUpvote={handleUpvoteReport}
        onOpenFixResolution={handleOpenFixResolution}
      />

      {/* Citizen Cleanup & Resolution Evidence Studio Modal */}
      <FixResolutionModal
        isOpen={Boolean(fixingReport)}
        report={fixingReport}
        onClose={() => setFixingReport(null)}
        onSubmitEvidence={handleSubmitFixResolution}
        currentUserName={user.name}
        currentUserEmail={user.email}
      />

    </div>
  );
}

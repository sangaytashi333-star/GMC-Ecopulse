import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CityPulseDashboard } from './components/CityPulseDashboard';
import { InteractiveEcoMap } from './components/InteractiveEcoMap';
import { MissionsHub } from './components/MissionsHub';
import { StewardshipProfile } from './components/StewardshipProfile';
import { RewardsMarketplace } from './components/RewardsMarketplace';
import { AdminPortal } from './components/AdminPortal';
import { ActiveReportingModal } from './components/ActiveReportingModal';
import { ReportDetailModal } from './components/ReportDetailModal';
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
  CityInsight
} from './types';
import { playMindfulChime, toggleSoundMute, isSoundMuted } from './utils/audio';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'map' | 'missions' | 'marketplace' | 'profile' | 'admin'>('dashboard');
  const [reports, setReports] = useState<CitizenReport[]>(INITIAL_REPORTS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
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
  const [inspectingReport, setInspectingReport] = useState<CitizenReport | null>(null);
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

  const handleSoundToggle = () => {
    const nextState = toggleSoundMute();
    setSoundOn(nextState);
    if (nextState) playMindfulChime('bell');
  };

  const handleNavigate = (view: 'dashboard' | 'map' | 'missions' | 'marketplace' | 'profile' | 'admin') => {
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
        onOpenReportModal={() => setIsReportingModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* 1. City Pulse Dashboard */}
        {currentView === 'dashboard' && (
          <CityPulseDashboard
            metrics={metrics}
            reports={reports}
            missions={missions}
            cityInsight={cityInsight}
            onRefreshInsight={handleRefreshInsight}
            onOpenReportModal={() => setIsReportingModalOpen(true)}
            onNavigateToMap={handleNavigateToMapWithSector}
            onNavigateToMissions={() => handleNavigate('missions')}
            onUpvoteReport={handleUpvoteReport}
            onSelectReport={(report) => setInspectingReport(report)}
          />
        )}

        {/* 2. Interactive Eco-Map */}
        {currentView === 'map' && (
          <InteractiveEcoMap
            reports={reports}
            missions={missions}
            initialSectorFilter={mapSectorFilter}
            onSelectReport={(report) => setInspectingReport(report)}
            onJoinMission={handleJoinMission}
            onOpenReportModal={() => setIsReportingModalOpen(true)}
            onUpvoteReport={handleUpvoteReport}
          />
        )}

        {/* 3. Missions Hub */}
        {currentView === 'missions' && (
          <MissionsHub
            missions={missions}
            onJoinMission={handleJoinMission}
            onNavigateToMap={handleNavigateToMapWithSector}
            onCreateMission={handleCreateMission}
          />
        )}

        {/* 4. Rewards Marketplace */}
        {currentView === 'marketplace' && (
          <RewardsMarketplace
            rewards={rewards}
            spendablePoints={user.spendablePoints}
            redeemedVouchers={redeemedVouchers}
            onRedeemReward={handleRedeemReward}
            onOpenReportModal={() => setIsReportingModalOpen(true)}
          />
        )}

        {/* 5. Personal Impact Profile */}
        {currentView === 'profile' && (
          <StewardshipProfile
            user={user}
            userReports={reports.filter(r => r.reporterName === user.name || r.reporterName === 'Anonymous Steward')}
            onOpenReportModal={() => setIsReportingModalOpen(true)}
          />
        )}

        {/* 6. Admin Portal (HQ Command) */}
        {currentView === 'admin' && (
          <AdminPortal
            reports={reports}
            fieldTeams={fieldTeams}
            metrics={metrics}
            onUpdateReportStatus={handleUpdateReportStatus}
            onUpdateMetrics={handleUpdateMetrics}
          />
        )}

      </main>

      {/* Mindful Footer */}
      <footer className="mt-auto border-t border-gray-200/80 bg-white py-6">
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
      />

      {/* Report Inspection Modal */}
      <ReportDetailModal
        report={inspectingReport}
        onClose={() => setInspectingReport(null)}
        onUpvote={handleUpvoteReport}
      />

    </div>
  );
}

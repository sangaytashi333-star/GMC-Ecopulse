import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTabId } from './components/Navbar';
import { CityPulseDashboard } from './components/CityPulseDashboard';
import { InteractiveEcoMap } from './components/InteractiveEcoMap';
import { MissionsHub } from './components/MissionsHub';
import { StewardshipProfile } from './components/StewardshipProfile';
import { RewardsMarketplace } from './components/RewardsMarketplace';
import { CommunityRankings } from './components/CommunityRankings';
import { AdminPortal } from './components/AdminPortal';
import { AuthScreen } from './components/AuthScreen';
import { ActiveReportingModal } from './components/ActiveReportingModal';
import { FixResolutionModal } from './components/FixResolutionModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { 
  getCachedMetrics, 
  saveCachedMetrics, 
  getCachedMissions, 
  saveCachedMissions, 
  queueOfflineAction, 
  getQueuedActions, 
  clearQueuedActions,
  getLocalJoinedMissionIds,
  saveLocalJoinedMissionIds
} from './lib/offlineStorage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { 
  INITIAL_CITY_METRICS, 
  INITIAL_REPORTS, 
  INITIAL_MISSIONS, 
  INITIAL_REWARDS, 
  INITIAL_USER, 
  INITIAL_FIELD_TEAMS,
  INITIAL_CITY_INSIGHT,
  INITIAL_TOP_CONTRIBUTORS
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
import gmcMindfulMistBg from './assets/images/gmc_mindful_mist_bg_1787762128131.jpg';
import gmc108MandalaBg from './assets/images/gmc_108_mandala_bg_1787762140396.jpg';
import { 
  testConnection, 
  seedInitialFirestoreData, 
  subscribeToReports, 
  subscribeToMissions, 
  subscribeToVouchers, 
  subscribeToMetrics, 
  subscribeToUsers,
  saveReportToFirestore, 
  updateReportInFirestore, 
  updateMissionInFirestore, 
  saveVoucherToFirestore, 
  saveUserToFirestore,
  auth,
  db
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const STORAGE_AUTH_KEY = 'gmc_citizen_auth_user';
const SESSION_AUTH_KEY = 'gmc_citizen_session_authenticated';

export default function App() {
  // Require new users or new devices to sign in first.
  // When an authenticated session is established on this device, remember it so returning visits take them directly to the Citizen Dashboard.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      if (
        localStorage.getItem('gmc_citizen_logged_out') === 'true' ||
        sessionStorage.getItem('gmc_citizen_logged_out') === 'true'
      ) {
        return false;
      }
      const hasAuthSession = localStorage.getItem(SESSION_AUTH_KEY) === 'true';
      const savedUser = localStorage.getItem(STORAGE_AUTH_KEY);
      return Boolean(hasAuthSession && savedUser);
    } catch {
      return false;
    }
  });

  // Default initial view for authenticated citizens is Citizen Dashboard
  const [currentView, setCurrentView] = useState<NavTabId>('dashboard');
  const [reports, setReports] = useState<CitizenReport[]>(INITIAL_REPORTS);
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

  // Initialized from offline cache to support instant boot in remote forest sectors
  const [missions, setMissions] = useState<Mission[]>(() => {
    const cached = getCachedMissions();
    const userEmail = (INITIAL_USER.email || 'sangaytashi.333@gmail.com').toLowerCase();
    const localJoined = getLocalJoinedMissionIds(userEmail);
    return cached.map(m => {
      const isEnrolled = Boolean(
        (m.participantEmails && m.participantEmails.some(e => e.toLowerCase() === userEmail)) ||
        localJoined.includes(m.id)
      );
      return {
        ...m,
        joined: isEnrolled
      };
    });
  });
  const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  
  // Real-time Geolocation Hook with real-time GPS & simulation capabilities
  const {
    locationState: userLocation,
    startRealLocationTracking: recenterGPS,
    setSimulatedCoords: simulateGMCLocation,
    startPatrolSimulation,
    toggleLiveTracking: toggleTracking,
    setAutoFollow,
    toggleAutoFollow,
    clearTrail,
  } = useLiveLocation();

  // Critical City Metrics initialized from offline cache
  const [metrics, setMetrics] = useState<CityMetrics>(() => getCachedMetrics());
  const [cityInsight, setCityInsight] = useState<CityInsight>(INITIAL_CITY_INSIGHT);
  const [fieldTeams, setFieldTeams] = useState<FieldTeam[]>(INITIAL_FIELD_TEAMS);
  const [topContributors, setTopContributors] = useState(INITIAL_TOP_CONTRIBUTORS);
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

  // Online / Offline Connectivity & Remote Sector Sync State
  const { isOnline } = useOnlineStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  // Persist authenticated user changes locally & sync with Firestore
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }, [user, isAuthenticated]);

  // Keep Firebase Auth session in sync across device reloads
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        try {
          localStorage.setItem(SESSION_AUTH_KEY, 'true');
          localStorage.removeItem('gmc_citizen_logged_out');
          sessionStorage.removeItem('gmc_citizen_logged_out');
        } catch (e) {
          console.warn('Storage sync error:', e);
        }
        setIsAuthenticated(true);
      }
    });
    return () => unsub();
  }, []);

  // Synchronize critical city metrics to offline storage whenever updated
  useEffect(() => {
    if (metrics) {
      saveCachedMetrics(metrics);
    }
  }, [metrics]);

  // Synchronize active community missions to offline storage whenever updated
  useEffect(() => {
    if (missions && missions.length > 0) {
      saveCachedMissions(missions);
    }
  }, [missions]);

  // Flush queued offline actions to Firestore when network is available
  const handleSyncOfflineData = useCallback(async () => {
    const queuedActions = getQueuedActions();
    if (queuedActions.length === 0) return;

    setIsSyncing(true);
    try {
      for (const action of queuedActions) {
        if (action.type === 'join_mission') {
          const { missionId, currentParticipants } = action.payload;
          await updateMissionInFirestore(missionId, { currentParticipants });
        }
      }
      clearQueuedActions();
      playMindfulChime('karma');
      setNotifications(prev => [
        {
          id: `notif-sync-${Date.now()}`,
          title: '🌱 Remote Field Data Synchronized',
          message: `${queuedActions.length} field action(s) successfully synced with GMC Central Mesh.`,
          time: 'Just now',
          read: false
        },
        ...prev
      ]);
    } catch (err) {
      console.warn('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Automatically flush offline action queue when connectivity is restored
  useEffect(() => {
    if (isOnline) {
      handleSyncOfflineData();
    }
  }, [isOnline, handleSyncOfflineData]);

  // Firebase Real-time Multi-User Sync for Reports, Missions, Vouchers, Metrics, and Leaderboards
  useEffect(() => {
    // 1. Verify Firestore connectivity
    testConnection();

    // 2. Seed initial data if database collections are empty
    seedInitialFirestoreData();

    // 3. Register current user in Firestore
    saveUserToFirestore(user).catch(console.error);

    // 4. Real-time reports stream
    const unsubReports = subscribeToReports((liveReports) => {
      if (liveReports && liveReports.length > 0) {
        setReports(liveReports);
      }
    });

    // 5. Real-time missions stream with user-specific enrollment resolution
    const unsubMissions = subscribeToMissions((liveMissions) => {
      if (liveMissions && liveMissions.length > 0) {
        const currentUserEmail = (user.email || 'sangaytashi.333@gmail.com').toLowerCase();
        const localJoined = getLocalJoinedMissionIds(currentUserEmail);
        const resolved = liveMissions.map(m => {
          const isEnrolled = Boolean(
            (m.participantEmails && m.participantEmails.some(e => e.toLowerCase() === currentUserEmail)) ||
            (user.joinedMissionIds && user.joinedMissionIds.includes(m.id)) ||
            localJoined.includes(m.id)
          );
          return {
            ...m,
            joined: isEnrolled,
            currentParticipants: m.participantEmails && m.participantEmails.length > 0
              ? m.participantEmails.length
              : m.currentParticipants
          };
        });
        setMissions(resolved);
        saveCachedMissions(resolved);
      }
    });

    // 6. Real-time vouchers stream
    const unsubVouchers = subscribeToVouchers((liveVouchers) => {
      if (liveVouchers && liveVouchers.length > 0) {
        const myVouchers = liveVouchers.filter(v => !v.userId || v.userId === user.id || v.userId === user.email);
        if (myVouchers.length > 0) {
          setRedeemedVouchers(myVouchers);
        }
      }
    });

    // 7. Real-time biosphere metrics stream
    const unsubMetrics = subscribeToMetrics((liveMetrics) => {
      if (liveMetrics) {
        setMetrics(liveMetrics);
      }
    });

    // 8. Real-time user accounts & community rankings stream
    const unsubUsers = subscribeToUsers((liveUsers) => {
      if (liveUsers && liveUsers.length > 0) {
        const mapped = liveUsers
          .map((u, i) => ({
            id: u.id || `user-${i}`,
            rank: i + 1,
            previousRank24h: i + 1,
            rankChange24h: 0,
            isRisingStar: (u.totalKarmaPoints || 0) >= 300,
            name: u.name,
            avatarEmoji: u.avatarEmoji || '🌿',
            avatarUrl: u.avatarUrl,
            levelTitle: u.levelTitle || 'Forest Steward',
            levelNumber: u.levelNumber || 1,
            totalKarmaPoints: u.totalKarmaPoints || 0,
            karmaEarned24h: 120,
            primarySector: 'Sector 2: Mao River Riparian Corridor',
            specialty: u.badges?.[0]?.name || 'Sub-Himalayan Ecological Steward',
            treesPlanted: u.treesPlanted || 12,
            wasteRemovedKg: u.wasteRemovedKg || 8,
            wildlifeObservedCount: u.wildlifeObservedCount || 6,
            reportsSubmitted: u.totalReportsCount || 1,
            reportsResolved: u.reportsResolvedCount || 0,
            currentStreakDays: 9,
            recentHighlight: 'Verified community report in Gelephu',
            pinnedBadge: u.badges?.[0] || {
              id: 'badge-steward',
              name: 'Mindful Steward',
              tier: 'gold' as const,
              iconEmoji: '🌱',
              category: 'general'
            },
            badges: u.badges || []
          }))
          .sort((a, b) => b.totalKarmaPoints - a.totalKarmaPoints)
          .map((c, idx) => ({ ...c, rank: idx + 1 }));

        if (mapped.length >= 3) {
          setTopContributors(mapped);
        }
      }
    });

    return () => {
      unsubReports();
      unsubMissions();
      unsubVouchers();
      unsubMetrics();
      unsubUsers();
    };
  }, [user.id, user.email]);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

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
      localStorage.setItem(SESSION_AUTH_KEY, 'true');
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(authenticatedUser));
      localStorage.removeItem('gmc_citizen_logged_out');
      sessionStorage.removeItem('gmc_citizen_logged_out');
    } catch (e) {
      console.warn('Storage write error:', e);
    }
    // Take directly to citizen dashboard on successful login
    setCurrentView('dashboard');
    playMindfulChime('karma');

    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNotifications(prev => [
      {
        id: notifId,
        title: 'Authentic Citizen Session Active',
        message: `Tashi Delek, ${authenticatedUser.name}! Welcome to the GMC Citizen Dashboard.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const handleLogout = () => {
    playMindfulChime('bell');
    try {
      localStorage.removeItem(SESSION_AUTH_KEY);
      localStorage.removeItem(STORAGE_AUTH_KEY);
      localStorage.setItem('gmc_citizen_logged_out', 'true');
      sessionStorage.setItem('gmc_citizen_logged_out', 'true');
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
    auth.signOut().catch(() => {});
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  // Submit new report
  const handleSubmitReport = (newReport: CitizenReport) => {
    // Optimistic local update
    setReports(prev => [newReport, ...prev]);

    // Persist report to Firestore so all users see it in real-time
    saveReportToFirestore(newReport).catch(console.error);

    // Update user profile impact
    setUser(prev => {
      const currentStats = prev.stats || {};
      const currentReports = prev.totalReportsCount || 0;
      const updatedUser: UserProfile = {
        ...prev,
        spendablePoints: (prev.spendablePoints || 0) + newReport.pointsAwarded,
        totalKarmaPoints: (prev.totalKarmaPoints || 0) + newReport.pointsAwarded,
        totalReportsCount: currentReports + 1,
        wildlifeObservedCount: newReport.category === 'wildlife' ? (prev.wildlifeObservedCount || 0) + 1 : (prev.wildlifeObservedCount || 0),
        wasteRemovedKg: newReport.category === 'waste' ? (prev.wasteRemovedKg || 0) + 12 : (prev.wasteRemovedKg || 0),
        stats: {
          ...currentStats,
          reportsSubmitted: (currentStats.reportsSubmitted || currentReports) + 1,
          reportsResolved: currentStats.reportsResolved || prev.reportsResolvedCount || 0
        }
      };
      saveUserToFirestore(updatedUser).catch(console.error);
      return updatedUser;
    });

    // Add Notification
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNotifications(prev => [
      {
        id: notifId,
        title: 'Report Logged & Synced',
        message: `Earned +${newReport.pointsAwarded} Karma for ${newReport.title}. Shared to GMC Telemetry.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  // Join or Leave mission (Toggle with strict enrolled checking, participant list, and karma balance preservation)
  const handleJoinMission = (missionId: string) => {
    const targetMission = missions.find(m => m.id === missionId);
    if (!targetMission) return;

    const userEmail = (user.email || 'sangaytashi.333@gmail.com').toLowerCase();
    const currentJoinedMissions = user.joinedMissionIds || getLocalJoinedMissionIds(userEmail);
    const isCurrentlyJoined = Boolean(
      targetMission.joined ||
      (targetMission.participantEmails && targetMission.participantEmails.some(e => e.toLowerCase() === userEmail)) ||
      currentJoinedMissions.includes(missionId)
    );

    const willJoin = !isCurrentlyJoined;

    // 1. Calculate updated participant emails
    const existingEmails = targetMission.participantEmails || [];
    let nextEmails: string[];
    let nextParticipants: number;

    if (willJoin) {
      nextEmails = Array.from(new Set([...existingEmails, userEmail]));
      nextParticipants = nextEmails.length > 0 ? nextEmails.length : targetMission.currentParticipants + 1;
    } else {
      nextEmails = existingEmails.filter(e => e.toLowerCase() !== userEmail);
      nextParticipants = Math.max(0, nextEmails.length > 0 ? nextEmails.length : targetMission.currentParticipants - 1);
    }

    // 2. Calculate updated user joined mission IDs
    let nextJoinedMissions: string[];
    if (willJoin) {
      nextJoinedMissions = Array.from(new Set([...currentJoinedMissions, missionId]));
    } else {
      nextJoinedMissions = currentJoinedMissions.filter(id => id !== missionId);
    }
    saveLocalJoinedMissionIds(userEmail, nextJoinedMissions);

    // 3. Update local missions state immediately
    setMissions(prev =>
      prev.map(m => {
        if (m.id === missionId) {
          return {
            ...m,
            joined: willJoin,
            currentParticipants: nextParticipants,
            participantEmails: nextEmails
          };
        }
        return m;
      })
    );

    // 4. Optimistically record offline action for remote sector offline resilience
    queueOfflineAction({
      type: willJoin ? 'join_mission' : 'leave_mission',
      payload: { missionId, joined: willJoin, currentParticipants: nextParticipants, userEmail },
      sector: targetMission.sector
    });

    // 5. Persist mission state to Firestore
    updateMissionInFirestore(missionId, {
      currentParticipants: nextParticipants,
      participantEmails: nextEmails
    }).catch((err) => {
      console.warn('Mission action saved to remote offline cache:', err);
    });

    // 6. Update user profile and karma points safely (no multi-join exploit or lost leave option)
    setUser(u => {
      const currentMissions = u.totalMissionsCount || u.missionsCompleted || 0;
      let newKarma = u.totalKarmaPoints || 0;
      let newSpendable = u.spendablePoints || 0;
      let newMissionsCount = currentMissions;
      let newTrees = u.treesPlanted || 0;

      if (willJoin) {
        newKarma += targetMission.rewardPoints;
        newSpendable += targetMission.rewardPoints;
        newMissionsCount += 1;
        if (targetMission.category === 'revegetation') newTrees += 5;
      } else {
        newKarma = Math.max(0, newKarma - targetMission.rewardPoints);
        newSpendable = Math.max(0, newSpendable - targetMission.rewardPoints);
        newMissionsCount = Math.max(0, newMissionsCount - 1);
        if (targetMission.category === 'revegetation') newTrees = Math.max(0, newTrees - 5);
      }

      const updatedUser: UserProfile = {
        ...u,
        spendablePoints: newSpendable,
        totalKarmaPoints: newKarma,
        totalMissionsCount: newMissionsCount,
        missionsCompleted: newMissionsCount,
        treesPlanted: newTrees,
        joinedMissionIds: nextJoinedMissions
      };
      saveUserToFirestore(updatedUser).catch(console.error);
      return updatedUser;
    });

    // 7. Notification & audio feedback
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    if (willJoin) {
      setNotifications(n => [
        {
          id: notifId,
          title: '🌱 Enrolled in Mission',
          message: `Joined "${targetMission.title}". +${targetMission.rewardPoints} Karma reserved.`,
          time: 'Just now',
          read: false
        },
        ...n
      ]);
      playMindfulChime('karma');
    } else {
      setNotifications(n => [
        {
          id: notifId,
          title: 'Withdrawn from Mission',
          message: `You have left "${targetMission.title}". Seat freed for other stewards.`,
          time: 'Just now',
          read: false
        },
        ...n
      ]);
      playMindfulChime('bell');
    }
  };

  // Propose mission
  const handleCreateMission = (newMission: Mission) => {
    setMissions(prev => [newMission, ...prev]);
    setDoc(doc(db, 'missions', newMission.id), newMission).catch(console.error);
    setUser(u => {
      const updatedUser: UserProfile = {
        ...u,
        spendablePoints: u.spendablePoints + 50,
        totalKarmaPoints: u.totalKarmaPoints + 50,
      };
      saveUserToFirestore(updatedUser).catch(console.error);
      return updatedUser;
    });
  };

  // Redeem Reward
  const handleRedeemReward = (reward: RewardItem): boolean => {
    if (user.spendablePoints < reward.pointsCost) return false;

    // Deduct points
    setUser(prev => {
      const updatedUser: UserProfile = {
        ...prev,
        spendablePoints: prev.spendablePoints - reward.pointsCost
      };
      saveUserToFirestore(updatedUser).catch(console.error);
      return updatedUser;
    });

    // Create unique voucher pass
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const prefix = reward.category === 'wellness' ? 'TSHACHU' : reward.category === 'transit' ? 'TRANSIT' : 'GROCERY';
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
    saveVoucherToFirestore(newVoucher).catch(console.error);

    const redeemNotifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNotifications(prev => [
      {
        id: redeemNotifId,
        title: 'Pass Issued & Saved',
        message: `Redeemed ${reward.title}. Stored in your GMC Cloud Wallet.`,
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
          const newUpvotes = upvoted ? r.upvotes + 1 : Math.max(0, r.upvotes - 1);
          if (upvoted) playMindfulChime('bell');

          // Persist to Firestore
          updateReportInFirestore(reportId, {
            upvotes: newUpvotes
          }).catch(console.error);

          return {
            ...r,
            userUpvoted: upvoted,
            upvotes: newUpvotes
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
          // Persist to Firestore
          updateReportInFirestore(reportId, {
            status: 'pending_verification' as ReportStatus,
            resolutionEvidence: evidence
          }).catch(console.error);

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
    const targetReport = reports.find(r => r.id === reportId);
    if (!targetReport) return;

    // Security Gate: Prevent multiple karma allocations for the same incident
    if (targetReport.status === 'resolved' || targetReport.karmaAwarded || targetReport.resolutionEvidence?.isVerifiedByHQ) {
      console.warn(`[GMC HQ Security] Report #${reportId} is already resolved. Multiple Karma allocations prevented.`);
      setNotifications(prev => [
        {
          id: `notif-prevent-${Date.now()}`,
          title: 'Security Alert: Duplicate Karma Blocked',
          message: `Karma bounty for "${targetReport.title}" was already allocated. Duplicate award prevented.`,
          time: 'Just now',
          read: false
        },
        ...prev
      ]);
      playMindfulChime('bell');
      return;
    }

    const fixerName = targetReport.resolutionEvidence?.fixerName || user.name || 'Citizen Steward';
    const fixerEmail = targetReport.resolutionEvidence?.fixerEmail || user.email;
    const reporterName = targetReport.reporterName || 'Citizen Steward';
    const reportTitle = targetReport.title;

    const updatedEvidence: ResolutionEvidence | undefined = targetReport.resolutionEvidence
      ? {
          ...targetReport.resolutionEvidence,
          isVerifiedByHQ: true,
          verifiedByOfficial: user.name,
          pointsAwarded: bonusPoints,
          karmaAwarded: true,
          karmaAwardedTo: fixerEmail || fixerName
        }
      : undefined;

    // Persist to Firestore
    updateReportInFirestore(reportId, {
      status: 'resolved' as ReportStatus,
      resolvedAt: 'Just now',
      resolutionNotes: officialNotes || 'Remediation verified & certified by GMC HQ Command.',
      karmaAwarded: true,
      karmaAwardedAmount: bonusPoints,
      karmaAwardedTo: fixerEmail || fixerName,
      karmaAwardedAt: new Date().toISOString(),
      resolutionEvidence: updatedEvidence
    }).catch(console.error);

    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'resolved' as ReportStatus,
            resolvedAt: 'Just now',
            resolutionNotes: officialNotes || 'Remediation verified & certified by GMC HQ Command.',
            karmaAwarded: true,
            karmaAwardedAmount: bonusPoints,
            karmaAwardedTo: fixerEmail || fixerName,
            karmaAwardedAt: new Date().toISOString(),
            resolutionEvidence: updatedEvidence
          };
        }
        return r;
      })
    );

    // If current logged-in user is the fixer (or in local prototype session), award the Karma points
    setUser(u => {
      const prevStats = u.stats || {};
      const currentResolved = prevStats.reportsResolved ?? u.reportsResolvedCount ?? 0;
      const updatedUser: UserProfile = {
        ...u,
        spendablePoints: (u.spendablePoints || 0) + bonusPoints,
        totalKarmaPoints: (u.totalKarmaPoints || 0) + bonusPoints,
        reportsResolvedCount: currentResolved + 1,
        stats: {
          ...prevStats,
          reportsResolved: currentResolved + 1
        }
      };
      saveUserToFirestore(updatedUser).catch(console.error);
      return updatedUser;
    });

    // Update city telemetry metrics in Firestore
    setMetrics(m => {
      const nextMetrics = {
        ...m,
        activeIncidentsCount: Math.max(0, m.activeIncidentsCount - 1),
        harmonyScore: Math.min(100, +(m.harmonyScore + 0.4).toFixed(1))
      };
      setDoc(doc(db, 'metrics', 'current'), nextMetrics).catch(console.error);
      return nextMetrics;
    });

    // Notify BOTH the Cleaner / Fixer AND the Incident Owner / Reporter
    const cleanerNotif = {
      id: `notif-cleaner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '🌱 Karma Bounty Allocated!',
      message: `GMC HQ Command certified your cleanup for "${reportTitle}". +${bonusPoints} Karma Points credited to ${fixerName}!`,
      time: 'Just now',
      read: false
    };

    const ownerNotif = {
      id: `notif-owner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '✨ Incident Resolved & Certified',
      message: `Your observation "${reportTitle}" submitted by ${reporterName} has been remediated by ${fixerName} and certified resolved by HQ Command.`,
      time: 'Just now',
      read: false
    };

    setNotifications(prev => [cleanerNotif, ownerNotif, ...prev]);

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
    const target = reports.find(r => r.id === reportId);
    if (!target) return;

    // Prevent redundant status actions
    if (target.status === 'resolved' && newStatus === 'resolved') return;
    if (target.status === 'dispatched' && newStatus === 'dispatched') return;

    const wasAlreadyResolved = target.status === 'resolved';
    const resolvedTime = newStatus === 'resolved' ? (target.resolvedAt || 'Just now') : undefined;

    // Persist to Firestore
    updateReportInFirestore(reportId, {
      status: newStatus,
      fieldTeamAssigned: fieldTeamAssigned || target.fieldTeamAssigned,
      resolutionNotes: notes || target.resolutionNotes,
      resolvedAt: resolvedTime
    }).catch(console.error);

    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: newStatus,
            fieldTeamAssigned: fieldTeamAssigned || r.fieldTeamAssigned,
            resolutionNotes: notes || r.resolutionNotes,
            resolvedAt: resolvedTime
          };
        }
        return r;
      })
    );

    if (newStatus === 'resolved' && !wasAlreadyResolved) {
      setMetrics(m => {
        const nextM = {
          ...m,
          activeIncidentsCount: Math.max(0, m.activeIncidentsCount - 1),
          harmonyScore: Math.min(100, +(m.harmonyScore + 0.3).toFixed(1))
        };
        setDoc(doc(db, 'metrics', 'current'), nextM).catch(console.error);
        return nextM;
      });

      // Notify the observation owner
      setNotifications(prev => [
        {
          id: `notif-owner-res-${Date.now()}`,
          title: '✅ Observation Marked Resolved',
          message: `Your observation "${target.title}" in ${target.sector} has been inspected and marked resolved by HQ Command.`,
          time: 'Just now',
          read: false
        },
        ...prev
      ]);
      playMindfulChime('badge');
    } else if (newStatus === 'dispatched') {
      const teamName = fieldTeamAssigned || target.fieldTeamAssigned || 'Field Unit';
      setNotifications(prev => [
        {
          id: `notif-owner-disp-${Date.now()}`,
          title: '🚒 Ranger Unit Dispatched',
          message: `HQ Command deployed ${teamName} to coordinates for observation "${target.title}".`,
          time: 'Just now',
          read: false
        },
        ...prev
      ]);
      playMindfulChime('karma');
    }
  };

  // Admin modulation of metrics
  const handleUpdateMetrics = (newMetrics: Partial<CityMetrics>) => {
    setMetrics(prev => {
      const merged = { ...prev, ...newMetrics };
      setDoc(doc(db, 'metrics', 'current'), merged).catch(console.error);
      return merged;
    });
  };

  // Official Role Guard elevation
  const handlePromoteToOfficial = () => {
    setUser(prev => {
      const updatedUser: UserProfile = {
        ...prev,
        role: 'official',
        levelTitle: 'HQ Biosphere Warden & Director',
        levelNumber: Math.max(prev.levelNumber, 7)
      };
      saveUserToFirestore(updatedUser).catch(console.error);
      return updatedUser;
    });
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
    setUser(prev => {
      const updatedUser: UserProfile = {
        ...prev,
        role: 'citizen',
        levelTitle: 'Senior Forest Steward'
      };
      saveUserToFirestore(updatedUser).catch(console.error);
      return updatedUser;
    });
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
    setDoc(doc(db, 'missions', newMission.id), newMission).catch(console.error);
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
    setUser(prev => {
      const nextUser = { ...prev, ...updated };
      saveUserToFirestore(nextUser).catch(console.error);
      return nextUser;
    });
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
      <div className="min-h-screen bg-gmc-mindful-pattern text-[#192723] flex flex-col font-sans selection:bg-[#52b788]/30">
        <AuthScreen
          currentUser={user}
          onLoginSuccess={handleLoginSuccess}
          isModal={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gmc-mindful-pattern text-[#192723] flex flex-col font-sans selection:bg-[#2E7D58]/30 relative overflow-x-hidden">
      
      {/* Serene Ambient Background Landscape & Sacred 108 Geometry Watermarks */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Soft Misty Mountain Ridges */}
        <img 
          src={gmcMindfulMistBg} 
          alt="" 
          referrerPolicy="no-referrer"
          className="absolute -top-10 left-0 right-0 w-full h-96 sm:h-[480px] object-cover opacity-12 mix-blend-multiply mask-gradient-b"
        />
        {/* Sacred 108 Mandala Watermark at Top Right */}
        <img 
          src={gmc108MandalaBg} 
          alt="" 
          referrerPolicy="no-referrer"
          className="absolute -top-12 -right-12 w-80 sm:w-96 h-80 sm:h-96 object-contain opacity-15 mix-blend-multiply"
        />
        {/* Sacred 108 Mandala Watermark at Bottom Left */}
        <img 
          src={gmc108MandalaBg} 
          alt="" 
          referrerPolicy="no-referrer"
          className="absolute -bottom-16 -left-16 w-80 sm:w-96 h-80 sm:h-96 object-contain opacity-10 mix-blend-multiply rotate-45"
        />
      </div>

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
        onForceSync={handleSyncOfflineData}
        isSyncing={isSyncing}
      />

      {/* Main Viewport Container with mobile bottom safe space for bottom nav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-7 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-10 relative z-10">
        
        {/* 1. City Pulse Dashboard */}
        {currentView === 'dashboard' && (
          <CityPulseDashboard
            metrics={metrics}
            reports={reports}
            missions={missions}
            cityInsight={cityInsight}
            userLocation={userLocation}
            onRefreshInsight={handleRefreshInsight}
            onOpenReportModal={() => {
              setReportInitialCoords(undefined);
              setReportInitialSector(undefined);
              setIsReportingModalOpen(true);
            }}
            onNavigateToMap={handleNavigateToMapWithSector}
            onNavigateToMissions={() => handleNavigate('missions')}
            onNavigateToRankings={() => handleNavigate('rankings')}
            onUpvoteReport={handleUpvoteReport}
            onSelectReport={(report) => setInspectingReport(report)}
            onJoinMission={handleJoinMission}
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
            onStartPatrolSimulation={startPatrolSimulation}
            onSetAutoFollow={setAutoFollow}
            onToggleAutoFollow={toggleAutoFollow}
            onClearTrail={clearTrail}
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
            onNavigateToRankings={() => handleNavigate('rankings')}
          />
        )}

        {/* 6. Community Leaderboard & Rising Stars Rankings */}
        {currentView === 'rankings' && (
          <CommunityRankings
            currentUser={user}
            contributors={topContributors}
            onOpenReportModal={() => {
              setReportInitialCoords(undefined);
              setReportInitialSector(undefined);
              setIsReportingModalOpen(true);
            }}
            onNavigateToProfile={() => handleNavigate('profile')}
          />
        )}

        {/* 7. Admin Portal (HQ Command) */}
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

        {/* 8. Dedicated Citizen Authentication Screen */}
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
              onClick={() => handleNavigate('rankings')}
              className="hover:text-[#1b4332] font-semibold transition text-emerald-700 font-bold"
            >
              🌟 Community Rankings
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

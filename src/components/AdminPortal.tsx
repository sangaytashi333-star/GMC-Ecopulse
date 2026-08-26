import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Send, 
  Compass, 
  Sliders, 
  MapPin, 
  Eye, 
  Truck, 
  RefreshCw, 
  ChevronRight,
  Filter,
  Check,
  Lock,
  KeyRound,
  PlusCircle,
  Megaphone,
  Sparkles,
  Droplets,
  Wind,
  Sun,
  Shield,
  Layers,
  ArrowRight,
  CheckCheck,
  Award,
  Hourglass,
  ThumbsUp,
  Image,
  ArrowLeftRight,
  ShieldAlert
} from 'lucide-react';
import { CitizenReport, FieldTeam, CityMetrics, ReportStatus, Mission, UserProfile, Coordinates } from '../types';
import { GMC_SECTORS } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';

interface AdminPortalProps {
  user: UserProfile;
  reports: CitizenReport[];
  fieldTeams: FieldTeam[];
  metrics: CityMetrics;
  missions?: Mission[];
  onPromoteToOfficial?: () => void;
  onDemoteToCitizen?: () => void;
  onUpdateReportStatus: (reportId: string, newStatus: ReportStatus, fieldTeamAssigned?: string, notes?: string) => void;
  onApproveResolution?: (reportId: string, bonusPoints: number, officialNotes?: string) => void;
  onRejectResolution?: (reportId: string, rejectionNotes: string) => void;
  onApproveMission?: (missionId: string) => void;
  onRejectMission?: (missionId: string, reason?: string) => void;
  onUpdateMetrics: (newMetrics: Partial<CityMetrics>) => void;
  onAddMission?: (mission: Omit<Mission, 'id' | 'joined' | 'currentParticipants'>) => void;
  onBroadcastNotice?: (title: string, message: string, severity: 'info' | 'warning' | 'alert') => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  user,
  reports,
  fieldTeams,
  metrics,
  missions = [],
  onPromoteToOfficial,
  onDemoteToCitizen,
  onUpdateReportStatus,
  onApproveResolution,
  onRejectResolution,
  onApproveMission,
  onRejectMission,
  onUpdateMetrics,
  onAddMission,
  onBroadcastNotice,
}) => {
  // Official Authentication Gate State
  const isAuthorized = user.role === 'admin' || user.role === 'official';
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Active HQ Section Tab
  const [activeTab, setActiveTab] = useState<'triage' | 'missions' | 'telemetry' | 'broadcast' | 'rangers'>('triage');

  // Incident Triage State
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'pending' | 'pending_verification' | 'dispatched' | 'in-progress' | 'resolved'>('all');
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [assigningTeam, setAssigningTeam] = useState<string>(fieldTeams[0]?.name || 'Riparian Hydrology Unit');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [awardPointsInput, setAwardPointsInput] = useState<number>(200);

  // Telemetry Modulation State (Drafts before broadcasting)
  const [draftAqi, setDraftAqi] = useState(metrics.aqi);
  const [draftRenewable, setDraftRenewable] = useState(metrics.renewablePercent);
  const [draftBiodiversity, setDraftBiodiversity] = useState(metrics.biodiversityCorridorHealth);
  const [draftWaterPurity, setDraftWaterPurity] = useState(metrics.waterPurityIndex);
  const [draftHarmony, setDraftHarmony] = useState(metrics.harmonyScore);
  const [draftCo2, setDraftCo2] = useState(metrics.dailyCo2AvoidedTons);
  const [draftSolar, setDraftSolar] = useState(metrics.solarOutputMw);
  const [draftHydro, setDraftHydro] = useState(metrics.hydroOutputMw);
  const [draftStewards, setDraftStewards] = useState(metrics.activeStewardsCount);
  const [telemetrySavedFeedback, setTelemetrySavedFeedback] = useState(false);

  // New Mission Deployment State
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [missionCategory, setMissionCategory] = useState<Mission['category']>('revegetation');
  const [missionSector, setMissionSector] = useState(GMC_SECTORS[1].name);
  const [missionLocation, setMissionLocation] = useState('Mao River Embankment Zone B');
  const [missionReward, setMissionReward] = useState(180);
  const [missionTargetParticipants, setMissionTargetParticipants] = useState(25);
  const [missionUrgency, setMissionUrgency] = useState<Mission['urgency']>('priority');
  const [missionDuration, setMissionDuration] = useState('3 Hours');
  const [missionImpact, setMissionImpact] = useState('Stabilize 350m of riverbank & plant native bamboo saplings');
  const [missionCreatedToast, setMissionCreatedToast] = useState(false);

  // Broadcast Alert State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeSeverity, setNoticeSeverity] = useState<'info' | 'warning' | 'alert'>('info');
  const [noticeBroadcasted, setNoticeBroadcasted] = useState(false);

  // Verify Official Clearance Key
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const cleanKey = passcode.trim().toUpperCase();
      if (cleanKey === 'GMC-HQ-2026' || cleanKey === 'OFFICIAL' || cleanKey === 'ADMIN' || cleanKey === 'GMC-2026' || cleanKey === 'BHUTAN') {
        playMindfulChime('badge');
        if (onPromoteToOfficial) onPromoteToOfficial();
      } else {
        setAuthError('Invalid Clearance Key. Authorized GMC Wardens use passcode "GMC-HQ-2026"');
        playMindfulChime('bell');
      }
    }, 400);
  };

  const handleQuickAuthorize = () => {
    playMindfulChime('badge');
    if (onPromoteToOfficial) onPromoteToOfficial();
  };

  // Dispatch team
  const handleDispatchTeam = (report: CitizenReport) => {
    onUpdateReportStatus(report.id, 'dispatched', assigningTeam, `Dispatched ${assigningTeam} to coordinates.`);
    playMindfulChime('karma');
    setSelectedReport(null);
  };

  // Resolve incident
  const handleResolveIncident = (report: CitizenReport) => {
    onUpdateReportStatus(
      report.id, 
      'resolved', 
      report.fieldTeamAssigned || assigningTeam, 
      resolutionNotes || 'Ecological inspection complete. Harmonious balance restored.'
    );
    playMindfulChime('badge');
    setSelectedReport(null);
    setResolutionNotes('');
  };

  // Approve Citizen Fix Resolution Evidence
  const handleApproveFixEvidence = (report: CitizenReport) => {
    const points = awardPointsInput || report.resolutionEvidence?.pointsAwarded || 200;
    const notes = resolutionNotes || 'Clean-up verified and certified by GMC Command. Site remediation approved.';
    
    if (onApproveResolution) {
      onApproveResolution(report.id, points, notes);
    } else {
      onUpdateReportStatus(report.id, 'resolved', report.fieldTeamAssigned || assigningTeam, notes);
    }
    
    playMindfulChime('badge');
    setSelectedReport(null);
    setResolutionNotes('');
  };

  // Reject / Request More Evidence for Citizen Fix
  const handleRejectFixEvidence = (report: CitizenReport) => {
    const notes = resolutionNotes || 'Evidence does not sufficiently verify full site remediation. Additional photos requested.';
    
    if (onRejectResolution) {
      onRejectResolution(report.id, notes);
    } else {
      onUpdateReportStatus(report.id, 'in-progress', report.fieldTeamAssigned, notes);
    }
    
    playMindfulChime('bell');
    setSelectedReport(null);
    setResolutionNotes('');
  };

  // Broadcast Telemetry to City Dashboard
  const handleBroadcastTelemetry = () => {
    onUpdateMetrics({
      aqi: Number(draftAqi),
      renewablePercent: Number(draftRenewable),
      biodiversityCorridorHealth: Number(draftBiodiversity),
      waterPurityIndex: Number(draftWaterPurity),
      harmonyScore: Number(draftHarmony),
      dailyCo2AvoidedTons: Number(draftCo2),
      solarOutputMw: Number(draftSolar),
      hydroOutputMw: Number(draftHydro),
      activeStewardsCount: Number(draftStewards)
    });
    playMindfulChime('karma');
    setTelemetrySavedFeedback(true);
    setTimeout(() => setTelemetrySavedFeedback(false), 3000);
  };

  // Quick Preset Telemetry Scenarios
  const applyPresetScenario = (preset: 'optimal' | 'monsoon' | 'solar' | 'wildlife') => {
    if (preset === 'optimal') {
      setDraftAqi(12);
      setDraftRenewable(99.2);
      setDraftBiodiversity(98.5);
      setDraftWaterPurity(98.8);
      setDraftHarmony(95.4);
      setDraftCo2(142.5);
    } else if (preset === 'monsoon') {
      setDraftAqi(9);
      setDraftRenewable(99.6);
      setDraftWaterPurity(96.2);
      setDraftHydro(140.0);
      setDraftHarmony(93.8);
    } else if (preset === 'solar') {
      setDraftRenewable(99.8);
      setDraftSolar(95.0);
      setDraftHarmony(96.0);
    } else if (preset === 'wildlife') {
      setDraftBiodiversity(99.0);
      setDraftHarmony(94.8);
      setDraftStewards(280);
    }
    playMindfulChime('bell');
  };

  // Deploy New Mission
  const handleDeployMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionTitle.trim() || !missionDescription.trim()) return;

    // Find coordinates for sector
    const sectorObj = GMC_SECTORS.find(s => s.name === missionSector) || GMC_SECTORS[0];
    const coords: Coordinates = sectorObj.coordinates || { lat: 26.8785, lng: 90.4982 };

    if (onAddMission) {
      onAddMission({
        title: missionTitle.trim(),
        description: missionDescription.trim(),
        category: missionCategory,
        sector: missionSector,
        locationName: missionLocation.trim() || sectorObj.name,
        coordinates: coords,
        targetParticipants: Number(missionTargetParticipants),
        rewardPoints: Number(missionReward),
        urgency: missionUrgency,
        status: 'active',
        startDate: 'Starting Today',
        duration: missionDuration,
        organizer: `GMC Biosphere Division (${user.name})`,
        requiredSkills: ['Active Walking', 'Mindful Observation', 'Field Protocol'],
        impactEstimate: missionImpact.trim() || 'Verified urban ecosystem contribution'
      });
    }

    playMindfulChime('karma');
    setMissionCreatedToast(true);
    setMissionTitle('');
    setMissionDescription('');
    setTimeout(() => setMissionCreatedToast(false), 4000);
  };

  // Broadcast Notice
  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) return;

    if (onBroadcastNotice) {
      onBroadcastNotice(noticeTitle.trim(), noticeMessage.trim(), noticeSeverity);
    }
    playMindfulChime('badge');
    setNoticeBroadcasted(true);
    setNoticeTitle('');
    setNoticeMessage('');
    setTimeout(() => setNoticeBroadcasted(false), 4000);
  };

  // Filtered reports for Triage
  const filteredReports = reports.filter(r => {
    if (selectedStatusTab !== 'all' && r.status !== selectedStatusTab) return false;
    return true;
  });

  // -------------------------------------------------------------
  // 1. CLEARANCE GATE FOR CITIZENS
  // -------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 animate-in fade-in duration-500">
        <div className="p-6 sm:p-10 rounded-3xl bg-[#081c15] text-white shadow-2xl border border-[#2d6a4f]/50 relative overflow-hidden space-y-8">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#52b788]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-3 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-[#1b4332] border border-[#52b788]/40 flex items-center justify-center text-3xl shadow-lg">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-[#74c69d]" />
            </div>
            
            <span className="inline-block px-3 py-1 rounded-full bg-[#1b4332] border border-[#52b788]/30 text-[#74c69d] text-[11px] font-bold uppercase tracking-widest">
              Restricted Municipal Terminal
            </span>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              GMC HQ Command Center
            </h2>
            
            <p className="text-xs sm:text-sm text-[#d8f3dc]/80 leading-relaxed max-w-lg mx-auto">
              This terminal is strictly isolated for authorized GMC Municipal Officials, Department Wardens, and Hydrological Engineers to dispatch field teams, deploy community missions, and modulate city telemetry.
            </p>
          </div>

          {/* Citizen Notice Box */}
          <div className="p-4 rounded-2xl bg-[#1b4332]/60 border border-[#52b788]/20 space-y-2 text-xs text-[#d8f3dc]">
            <div className="flex items-center space-x-2 font-bold text-white">
              <Shield className="w-4 h-4 text-[#52b788]" />
              <span>Current Status: Local Citizen Steward ({user.name})</span>
            </div>
            <p className="text-[#d8f3dc]/70">
              As a citizen steward, you can view the public <strong>City Pulse</strong>, explore the <strong>Living Eco-Atlas</strong>, join active <strong>Missions</strong>, and submit <strong>Field Observations</strong> with camera verification.
            </p>
          </div>

          {/* Authorization Form */}
          <form onSubmit={handleVerifyPasscode} className="space-y-4 max-w-md mx-auto relative z-10">
            <div>
              <label className="block text-xs font-bold text-[#d8f3dc] mb-1.5 flex items-center justify-between">
                <span>Official Clearance Passcode</span>
                <span className="text-[10px] text-[#74c69d] font-normal">Authorized Key: GMC-HQ-2026</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-[#52b788]" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Official Clearance Passcode..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0d2818] border border-[#52b788]/40 text-white placeholder-gray-500 text-sm focus:border-[#74c69d] focus:outline-none"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-[#e07a5f] bg-[#e07a5f]/10 p-2.5 rounded-xl border border-[#e07a5f]/30">
                {authError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="flex-1 py-3 px-4 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-1.5 min-h-[48px]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isVerifying ? 'Verifying...' : 'Authenticate Clearance'}</span>
              </button>

              <button
                type="button"
                onClick={handleQuickAuthorize}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center justify-center space-x-1.5 min-h-[48px]"
              >
                <span>Authorize As GMC Official</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. AUTHORIZED OFFICIAL COMMAND CENTER
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-16 sm:pb-8">
      
      {/* Official Header Banner */}
      <div className="p-5 sm:p-8 rounded-3xl bg-[#081c15] text-white shadow-xl border border-[#2d6a4f]/50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#52b788]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1b4332] border border-[#52b788]/40 text-[#74c69d] text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#52b788]" />
            <span>GMC Official Terminal • Clearance Level 7 Verified ({user.name})</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Municipal HQ Command Portal</h2>
          <p className="text-xs sm:text-sm text-[#d8f3dc]/80 leading-relaxed max-w-xl">
            Triage incident reports, deploy new citizen stewardship missions, dispatch field ranger squads, and modulate live community telemetry across all 7 sectors.
          </p>
        </div>

        {/* Quick Official Role Action */}
        {onDemoteToCitizen && (
          <button
            onClick={() => {
              playMindfulChime('bell');
              onDemoteToCitizen();
            }}
            className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#d8f3dc] text-xs font-semibold border border-white/20 transition min-h-[44px]"
          >
            Switch to Citizen Mode
          </button>
        )}
      </div>

      {/* HQ Command Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'triage', label: 'Incident Triage & Dispatch', icon: Activity, count: reports.filter(r => r.status === 'pending').length },
          { id: 'missions', label: 'Announce & Deploy Missions', icon: Compass, count: missions.length },
          { id: 'telemetry', label: 'Community Dashboard Controls', icon: Sliders },
          { id: 'broadcast', label: 'Broadcast Official Bulletin', icon: Megaphone },
          { id: 'rangers', label: 'Field Ranger Units', icon: Truck, count: fieldTeams.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playMindfulChime('bell');
                setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 min-h-[44px] ${
                isActive
                  ? 'bg-[#1b4332] text-white shadow-md border border-[#52b788]/40'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#74c69d]' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-[#52b788]/30 text-[#d8f3dc]' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1: INCIDENT TRIAGE & DISPATCH */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'triage' && (
        <section className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#1b4332] tracking-tight">Citizen Observation Queue & Dispatch</h3>
              <p className="text-xs text-gray-500">Review verified reports, dispatch field units, and log resolution certifications</p>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending Triage' },
                { id: 'pending_verification', label: `✨ Cleanups to Verify (${reports.filter(r => r.status === 'pending_verification').length})` },
                { id: 'dispatched', label: 'Dispatched' },
                { id: 'in-progress', label: 'In Progress' },
                { id: 'resolved', label: 'Resolved' },
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatusTab(st.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition min-h-[38px] ${
                    selectedStatusTab === st.id
                      ? 'bg-[#1b4332] text-white shadow-xs'
                      : st.id === 'pending_verification' && reports.some(r => r.status === 'pending_verification')
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold animate-pulse'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Table / Kanban List */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredReports.length === 0 ? (
                <div className="p-10 text-center text-gray-500 text-xs">
                  No incident reports matching this status filter.
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 sm:p-5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      report.status === 'pending_verification'
                        ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500'
                        : 'hover:bg-[#f8f9f6]'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 sm:space-x-4">
                      {report.photoUrl && (
                        <img
                          src={report.photoUrl}
                          alt={report.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-gray-200 shrink-0"
                        />
                      )}

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#d8f3dc] text-[#1b4332]">
                            {report.category}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            report.status === 'resolved' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : report.status === 'pending_verification'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold flex items-center space-x-1'
                              : report.status === 'dispatched'
                              ? 'bg-sky-100 text-sky-800'
                              : report.status === 'in-progress'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {report.status === 'pending_verification' ? '✨ Fix Awaiting HQ Verification' : report.status}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">#{report.id}</span>
                          <span className="text-[11px] text-gray-500">{report.timestamp}</span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-[#1b4332] truncate">{report.title}</h4>
                        <p className="text-xs text-gray-600 max-w-2xl line-clamp-2">{report.description}</p>

                        {/* Citizen Fix Notification Strip */}
                        {report.status === 'pending_verification' && report.resolutionEvidence && (
                          <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2 mt-1">
                            <div className="flex items-center space-x-1.5 font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>Citizen Fixer: <strong>{report.resolutionEvidence.fixerName}</strong> ({report.resolutionEvidence.fixedAt})</span>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              Claiming +{report.resolutionEvidence.pointsAwarded || 200} Karma
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-1">
                          <span className="flex items-center space-x-1 truncate">
                            <MapPin className="w-3 h-3 text-[#52b788] shrink-0" />
                            <span className="truncate">{report.locationName}</span>
                          </span>
                          <span>Reporter: <strong>{report.reporterName}</strong></span>
                          {report.fieldTeamAssigned && (
                            <span className="font-semibold text-sky-700 truncate">Assigned: {report.fieldTeamAssigned}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dispatch & Action Column */}
                    <div className="flex items-center space-x-2 self-end lg:self-center shrink-0">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          if (report.resolutionEvidence?.pointsAwarded) {
                            setAwardPointsInput(report.resolutionEvidence.pointsAwarded);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 min-h-[44px] ${
                          report.status === 'pending_verification'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                            : 'bg-[#1b4332] hover:bg-[#2d6a4f] text-white'
                        }`}
                      >
                        <span>{report.status === 'pending_verification' ? 'Verify Cleanup & Points' : 'Manage & Dispatch'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: ANNOUNCE & DEPLOY MISSIONS */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'missions' && (
        <section className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#1b4332] tracking-tight">Mission Deployment & Approval Studio</h3>
              <p className="text-xs text-gray-500">Review citizen proposed missions and deploy official municipal initiatives</p>
            </div>
            <div className="flex items-center space-x-2">
              {missions.filter(m => m.status === 'pending_approval').length > 0 && (
                <span className="text-xs font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full animate-pulse">
                  {missions.filter(m => m.status === 'pending_approval').length} Proposals Pending Review
                </span>
              )}
              <span className="text-xs font-bold text-[#2d6a4f] bg-[#d8f3dc] px-3 py-1 rounded-full">
                {missions.filter(m => m.status !== 'pending_approval').length} Active Missions
              </span>
            </div>
          </div>

          {/* CITIZEN PROPOSED MISSIONS QUEUE (PENDING HQ APPROVAL) */}
          {missions.filter(m => m.status === 'pending_approval').length > 0 && (
            <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/70 border-2 border-amber-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 text-amber-800" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-amber-950">Citizen Proposed Missions (Awaiting HQ Clearance)</h4>
                    <p className="text-xs text-amber-800/90">These community initiatives are awaiting official verification before appearing on the public citizen dashboard.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {missions.filter(m => m.status === 'pending_approval').map(proposal => (
                  <div key={proposal.id} className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                          {proposal.category}
                        </span>
                        <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          +{proposal.rewardPoints} Karma Bounty
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-[#1b4332]">{proposal.title}</h5>
                      <p className="text-xs text-gray-600 line-clamp-3">{proposal.description}</p>

                      <div className="pt-2 border-t border-gray-100 text-[11px] space-y-1 text-gray-500">
                        <p className="flex items-center space-x-1 truncate">
                          <MapPin className="w-3 h-3 text-[#52b788] shrink-0" />
                          <span className="truncate">{proposal.sector} • {proposal.meetingLocation}</span>
                        </p>
                        <p className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-sky-600 shrink-0" />
                          <span>Target: {proposal.targetParticipants} Stewards • Est: {proposal.estimatedDuration}</span>
                        </p>
                        <p className="text-[10px] text-amber-900 font-semibold">
                          Proposed by: <strong>{proposal.proposedBy || 'Active GMC Citizen'}</strong> ({proposal.proposedAt || 'Recent'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          if (onRejectMission) {
                            onRejectMission(proposal.id);
                          }
                          playMindfulChime('bell');
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold text-gray-600 transition min-h-[40px]"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onApproveMission) {
                            onApproveMission(proposal.id);
                          }
                          playMindfulChime('badge');
                        }}
                        className="flex-2 px-4 py-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-extrabold shadow-sm transition flex items-center justify-center space-x-1.5 min-h-[40px]"
                      >
                        <Check className="w-3.5 h-3.5 text-[#74c69d]" />
                        <span>Authorize & Publish</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {missionCreatedToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Mission announced successfully! Broadcasted to citizen mobile feeds and Interactive Eco-Atlas.</span>
            </div>
          )}

          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-gray-200 shadow-xs">
            <h4 className="text-sm font-extrabold text-[#1b4332] mb-4">Deploy Official Municipal Mission</h4>
            <form onSubmit={handleDeployMission} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1b4332] mb-1">Official Mission Title</label>
                  <input
                    type="text"
                    required
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    placeholder="e.g. Mao River Monsoon Riparian Embankment Reinforcement"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:border-[#2d6a4f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] mb-1">Mission Category</label>
                  <select
                    value={missionCategory}
                    onChange={(e) => setMissionCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] bg-white focus:outline-none"
                  >
                    <option value="revegetation">🌱 Revegetation & Native Planting</option>
                    <option value="wildlife-survey">🐾 Wildlife Survey & Canopy Monitoring</option>
                    <option value="cleanup">♻️ Circular Waste Cleanup & Composting</option>
                    <option value="sensor-maintenance">⚡ Eco-Sensors & Micro-Hydro Maintenance</option>
                    <option value="community-garden">🌿 Permaculture Terraces & Soil Revitalization</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] mb-1">Mission Objectives & Field Brief</label>
                <textarea
                  rows={3}
                  required
                  value={missionDescription}
                  onChange={(e) => setMissionDescription(e.target.value)}
                  placeholder="Detail the conservation scope, safety guidance, and stewardship impact for participating citizens..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:border-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1b4332] mb-1">GMC Sector Location</label>
                  <select
                    value={missionSector}
                    onChange={(e) => setMissionSector(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] bg-white focus:outline-none"
                  >
                    {GMC_SECTORS.map((sec) => (
                      <option key={sec.id} value={sec.name}>{sec.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] mb-1">Meeting Landmark</label>
                  <input
                    type="text"
                    value={missionLocation}
                    onChange={(e) => setMissionLocation(e.target.value)}
                    placeholder="e.g. Mindfulness Bridge Ranger Outpost"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] mb-1">Karma Bounty per Participant</label>
                  <input
                    type="number"
                    min={50}
                    max={1000}
                    value={missionReward}
                    onChange={(e) => setMissionReward(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1b4332] mb-1">Target Citizen Count</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={missionTargetParticipants}
                    onChange={(e) => setMissionTargetParticipants(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] mb-1">Urgency Level</label>
                  <select
                    value={missionUrgency}
                    onChange={(e) => setMissionUrgency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] bg-white focus:outline-none"
                  >
                    <option value="routine">Routine</option>
                    <option value="priority">Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] mb-1">Est. Duration</label>
                  <input
                    type="text"
                    value={missionDuration}
                    onChange={(e) => setMissionDuration(e.target.value)}
                    placeholder="e.g. 2.5 Hours"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] mb-1">Expected Ecological Impact Statement</label>
                <input
                  type="text"
                  value={missionImpact}
                  onChange={(e) => setMissionImpact(e.target.value)}
                  placeholder="e.g. Plant 120 Native Alder trees to secure 450m of river embankment"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-md transition flex items-center space-x-2 min-h-[48px]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Deploy Official Mission to City</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 3: COMMUNITY DASHBOARD & TELEMETRY CONTROLS */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'telemetry' && (
        <section className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#1b4332] tracking-tight">Live Community Dashboard Modulator</h3>
              <p className="text-xs text-gray-500">Directly adjust and broadcast real-time metrics shown on the public City Pulse</p>
            </div>

            {/* Scenario Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-gray-500">Preset Scenarios:</span>
              <button
                onClick={() => applyPresetScenario('optimal')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-200"
              >
                🌲 Optimal
              </button>
              <button
                onClick={() => applyPresetScenario('monsoon')}
                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-[11px] border border-sky-200"
              >
                🌧️ Monsoon Surge
              </button>
              <button
                onClick={() => applyPresetScenario('solar')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] border border-amber-200"
              >
                ☀️ Solar Peak
              </button>
              <button
                onClick={() => applyPresetScenario('wildlife')}
                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-[11px] border border-purple-200"
              >
                🐾 Wildlife Influx
              </button>
            </div>
          </div>

          {telemetrySavedFeedback && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Live Telemetry Broadcasted! The public City Pulse Dashboard is updated with the new metrics.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Air Quality (AQI) */}
            <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wind className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-[#1b4332]">Air Quality Index (AQI)</span>
                </div>
                <span className="text-xl font-extrabold text-[#1b4332]">{draftAqi} AQI</span>
              </div>
              <p className="text-xs text-gray-500">Himalayan Pristine Index across Gelephu valley</p>
              <input
                type="range"
                min={5}
                max={100}
                value={draftAqi}
                onChange={(e) => setDraftAqi(Number(e.target.value))}
                className="w-full accent-[#2d6a4f]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                <span>5 (Pristine)</span>
                <span>50 (Moderate)</span>
                <span>100 (Hazy)</span>
              </div>
            </div>

            {/* Renewable Power Mix (%) */}
            <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-bold text-[#1b4332]">Renewable Power Mix</span>
                </div>
                <span className="text-xl font-extrabold text-[#2d6a4f]">{draftRenewable}%</span>
              </div>
              <p className="text-xs text-gray-500">Hydro-Solar microgrid generation share</p>
              <input
                type="range"
                min={70}
                max={100}
                step={0.1}
                value={draftRenewable}
                onChange={(e) => setDraftRenewable(Number(e.target.value))}
                className="w-full accent-[#2d6a4f]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                <span>70%</span>
                <span>85%</span>
                <span>100% Zero-Carbon</span>
              </div>
            </div>

            {/* Biodiversity Corridor Health (%) */}
            <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-[#1b4332]">Biodiversity Corridor Health</span>
                </div>
                <span className="text-xl font-extrabold text-purple-800">{draftBiodiversity}%</span>
              </div>
              <p className="text-xs text-gray-500">Canopy bridge integrity & Langur corridor activity</p>
              <input
                type="range"
                min={60}
                max={100}
                step={0.5}
                value={draftBiodiversity}
                onChange={(e) => setDraftBiodiversity(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                <span>60%</span>
                <span>80%</span>
                <span>100% Flourishing</span>
              </div>
            </div>

            {/* Mao River Purity Index (%) */}
            <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-sky-600" />
                  <span className="text-sm font-bold text-[#1b4332]">Mao River Purity Index</span>
                </div>
                <span className="text-xl font-extrabold text-sky-700">{draftWaterPurity}%</span>
              </div>
              <p className="text-xs text-gray-500">Turbidity & glacial mineral balance in watershed</p>
              <input
                type="range"
                min={75}
                max={100}
                step={0.1}
                value={draftWaterPurity}
                onChange={(e) => setDraftWaterPurity(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                <span>75%</span>
                <span>90%</span>
                <span>100% Glacial Purity</span>
              </div>
            </div>

            {/* Overall Harmony Score */}
            <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#2d6a4f]" />
                  <span className="text-sm font-bold text-[#1b4332]">City Harmony Score</span>
                </div>
                <span className="text-xl font-extrabold text-[#1b4332]">{draftHarmony}%</span>
              </div>
              <p className="text-xs text-gray-500">Holistic balance score displayed in top navbar and pulse</p>
              <input
                type="range"
                min={50}
                max={100}
                step={0.1}
                value={draftHarmony}
                onChange={(e) => setDraftHarmony(Number(e.target.value))}
                className="w-full accent-[#2d6a4f]"
              />
            </div>

            {/* Active Stewards Count */}
            <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-bold text-[#1b4332]">Active Stewards Today</span>
                </div>
                <span className="text-xl font-extrabold text-indigo-800">{draftStewards}</span>
              </div>
              <p className="text-xs text-gray-500">Number of citizens currently logged into field stewardship</p>
              <input
                type="range"
                min={50}
                max={1500}
                step={10}
                value={draftStewards}
                onChange={(e) => setDraftStewards(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

          </div>

          <div className="p-5 rounded-3xl bg-[#081c15] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Commit Changes to Public City Dashboard</h4>
              <p className="text-xs text-[#d8f3dc]/70">Publishes all modulated values to the live Citizen Dashboard state</p>
            </div>
            <button
              onClick={handleBroadcastTelemetry}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2 min-h-[48px]"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Telemetry Update</span>
            </button>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 4: BROADCAST OFFICIAL BULLETIN */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'broadcast' && (
        <section className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-[#1b4332] tracking-tight">Official Ecological Bulletin & Alert System</h3>
            <p className="text-xs text-gray-500">Dispatch critical notices to all citizen notification inboxes and status tickers</p>
          </div>

          {noticeBroadcasted && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Notice broadcasted successfully! Added to City Pulse notification stream.</span>
            </div>
          )}

          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-gray-200 shadow-xs">
            <form onSubmit={handleSendNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1b4332] mb-1">Bulletin Headline</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Wildlife Corridor Advisory: Elephant Family Crossing Sector 3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:border-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] mb-1">Severity Level</label>
                <div className="flex gap-3">
                  {[
                    { id: 'info', label: '🌸 General Info / Update' },
                    { id: 'warning', label: '⚠️ Environmental Caution' },
                    { id: 'alert', label: '🚨 Priority Action Alert' },
                  ].map(sev => (
                    <label key={sev.id} className="flex items-center space-x-1.5 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="severity"
                        value={sev.id}
                        checked={noticeSeverity === sev.id}
                        onChange={() => setNoticeSeverity(sev.id as any)}
                        className="accent-[#2d6a4f]"
                      />
                      <span>{sev.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] mb-1">Official Message Body</label>
                <textarea
                  rows={3}
                  required
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="Provide precise details, guidelines, or mindful action requests for citizens..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:border-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-extrabold text-xs shadow-md transition flex items-center space-x-2 min-h-[48px]"
                >
                  <Megaphone className="w-4 h-4 text-[#74c69d]" />
                  <span>Broadcast Notice to City</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 5: FIELD RANGER UNITS */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'rangers' && (
        <section className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1b4332] tracking-tight">Active Field Personnel & Ranger Units</h3>
              <p className="text-xs text-gray-500">Biologists, watershed engineers, and circular waste logistics on active duty</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {fieldTeams.filter(t => t.status === 'on-duty' || t.status === 'dispatched').length} Units Deployed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fieldTeams.map((team) => (
              <div
                key={team.id}
                className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5 text-[#2d6a4f]" />
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      team.status === 'dispatched'
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : team.status === 'on-duty'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {team.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#1b4332]">{team.name}</h4>
                    <p className="text-xs font-semibold text-[#2d6a4f]">{team.specialty}</p>
                  </div>

                  <p className="text-[11px] text-gray-500">Lead: {team.leadName} ({team.membersCount} rangers)</p>
                </div>

                <div className="pt-2 border-t border-gray-100 text-[11px] space-y-1 text-gray-600">
                  <p className="flex items-center space-x-1 truncate">
                    <MapPin className="w-3 h-3 text-[#52b788] shrink-0" />
                    <span className="truncate">{team.currentSector}</span>
                  </p>
                  <p className="flex items-center space-x-1 font-mono text-[10px] text-gray-500">
                    <Radio className="w-3 h-3 text-sky-600 shrink-0" />
                    <span>{team.contactFreq}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Incident Dispatch & Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  selectedReport.status === 'pending_verification'
                    ? 'text-amber-900 bg-amber-100 border border-amber-300'
                    : 'text-[#2d6a4f] bg-[#d8f3dc]'
                }`}>
                  {selectedReport.status === 'pending_verification' ? '🌱 Citizen Fix Verification Queue' : `Incident Action Panel • ${selectedReport.category}`}
                </span>
                <h3 className="text-base font-bold text-[#1b4332] mt-1">{selectedReport.title}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            {/* CITIZEN FIX RESOLUTION EVIDENCE REVIEW SECTION */}
            {selectedReport.resolutionEvidence ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-950">
                      <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Citizen Remediation Report</span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                      Submitted {selectedReport.resolutionEvidence.fixedAt}
                    </span>
                  </div>

                  {/* Before & After Photo Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-rose-800">
                        <span>Original Incident (Before)</span>
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                      </div>
                      {selectedReport.photoUrl ? (
                        <img
                          src={selectedReport.photoUrl}
                          alt="Before Cleanup"
                          referrerPolicy="no-referrer"
                          className="w-full h-36 rounded-xl object-cover border border-rose-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-full h-36 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                          No initial photo
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                        <span>Citizen Cleanup (After)</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      </div>
                      {selectedReport.resolutionEvidence.afterPhotoUrl ? (
                        <img
                          src={selectedReport.resolutionEvidence.afterPhotoUrl}
                          alt="After Cleanup"
                          referrerPolicy="no-referrer"
                          className="w-full h-36 rounded-xl object-cover border-2 border-emerald-400 shadow-2xs"
                        />
                      ) : (
                        <div className="w-full h-36 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs text-emerald-600">
                          Verified on site
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fixer details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-xl border border-amber-200">
                    <div>
                      <span className="text-gray-500 block">Steward / Fixer:</span>
                      <strong className="text-[#1b4332]">{selectedReport.resolutionEvidence.fixerName}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Waste / Impact Logged:</span>
                      <strong className="text-emerald-700">{selectedReport.resolutionEvidence.wasteCollectedKg || 0} kg Diverted</strong>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-gray-100">
                      <span className="text-gray-500 block">Steward Notes:</span>
                      <p className="text-gray-800 text-xs italic">"{selectedReport.resolutionEvidence.description}"</p>
                    </div>
                  </div>

                  {/* Bonus Karma Point Allocation */}
                  <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1b4332] flex items-center space-x-1.5">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Karma Points Award to Fixer</span>
                      </label>
                      <span className="text-xs font-mono font-extrabold text-emerald-700">+{awardPointsInput} Karma</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={50}
                        max={1000}
                        value={awardPointsInput}
                        onChange={(e) => setAwardPointsInput(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#1b4332] text-center focus:outline-none"
                      />
                      <div className="flex items-center gap-1.5">
                        {[150, 200, 250, 300].map(pts => (
                          <button
                            key={pts}
                            type="button"
                            onClick={() => setAwardPointsInput(pts)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              awardPointsInput === pts
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            +{pts}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1b4332]">Official Verification / Certification Remarks</label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="E.g., Verified riverbank waste removed and native slope restored. Approved by HQ Command."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 min-h-[44px]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRejectFixEvidence(selectedReport)}
                    className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold transition min-h-[44px]"
                  >
                    Request More Evidence
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApproveFixEvidence(selectedReport)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md flex items-center space-x-1.5 min-h-[44px]"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>Approve Cleanup & Award +{awardPointsInput} Points</span>
                  </button>
                </div>
              </div>
            ) : (
              /* STANDARD DISPATCH & RESOLVE VIEW */
              <div className="space-y-4">
                {selectedReport.photoUrl && (
                  <img
                    src={selectedReport.photoUrl}
                    alt="Incident detail"
                    referrerPolicy="no-referrer"
                    className="w-full h-40 rounded-2xl object-cover border border-gray-100"
                  />
                )}

                <p className="text-xs text-gray-600">{selectedReport.description}</p>

                <div className="p-3 rounded-2xl bg-[#f8f9f6] border border-gray-200 text-xs space-y-2">
                  <label className="block font-bold text-[#1b4332]">Assign Dedicated Field Team</label>
                  <select
                    value={assigningTeam}
                    onChange={(e) => setAssigningTeam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1b4332] bg-white focus:outline-none"
                  >
                    {fieldTeams.map((team) => (
                      <option key={team.id} value={team.name}>
                        {team.name} ({team.specialty}) - Lead: {team.leadName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1b4332]">Official Resolution / Verification Notes</label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Log field verification results, biological acoustics, or clean-up notes..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 min-h-[44px]"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDispatchTeam(selectedReport)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs min-h-[44px]"
                  >
                    Dispatch {assigningTeam.split(' ')[0]}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResolveIncident(selectedReport)}
                    className="px-4 py-2 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] text-xs font-extrabold shadow-md flex items-center space-x-1 min-h-[44px]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

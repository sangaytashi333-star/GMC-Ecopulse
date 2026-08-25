import React, { useState } from 'react';
import { 
  Heart, 
  Wind, 
  Sun, 
  Waves, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  RefreshCw, 
  Trees, 
  TrendingUp, 
  Activity, 
  Compass, 
  Eye, 
  ThumbsUp, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Leaf
} from 'lucide-react';
import { CityMetrics, CitizenReport, Mission, CityInsight } from '../types';
import { GMC_SECTORS, INITIAL_CITY_METRICS, INITIAL_CITY_INSIGHT, INITIAL_REPORTS, INITIAL_MISSIONS } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';

interface CityPulseDashboardProps {
  metrics?: CityMetrics;
  reports?: CitizenReport[];
  recentReports?: CitizenReport[];
  missions?: Mission[];
  activeMissions?: Mission[];
  cityInsight?: CityInsight;
  onRefreshInsight?: () => Promise<void>;
  onNavigateToMap: (sectorId?: string) => void;
  onNavigateToMissions: () => void;
  onOpenReportModal: () => void;
  onUpvoteReport?: (reportId: string) => void;
  onSelectReport: (report: CitizenReport) => void;
}

export const CityPulseDashboard: React.FC<CityPulseDashboardProps> = ({
  metrics = INITIAL_CITY_METRICS,
  reports,
  recentReports: recentReportsProp,
  missions,
  activeMissions: activeMissionsProp,
  cityInsight = INITIAL_CITY_INSIGHT,
  onRefreshInsight,
  onNavigateToMap,
  onNavigateToMissions,
  onOpenReportModal,
  onUpvoteReport,
  onSelectReport,
}) => {
  const [isRefreshingInsight, setIsRefreshingInsight] = useState(false);
  const [selectedVitalTab, setSelectedVitalTab] = useState<'all' | 'air' | 'energy' | 'bio' | 'water'>('all');

  const handleRefresh = async () => {
    if (!onRefreshInsight) return;
    setIsRefreshingInsight(true);
    playMindfulChime('bell');
    try {
      await onRefreshInsight();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingInsight(false);
    }
  };

  const allMissions = missions || activeMissionsProp || INITIAL_MISSIONS;
  const currentActiveMissions = allMissions.filter(m => m.status === 'active');
  
  const allReports = reports || recentReportsProp || INITIAL_REPORTS;
  const displayReports = allReports.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Serene Hero Section: The Living City Heartbeat */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1b4332] text-white p-6 sm:p-8 lg:p-10 shadow-lg border border-[#52b788]/20">
        
        {/* Subtle decorative background botanical geometry */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-[#52b788]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-[#40916c]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline & Mindfulness Welcome */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#52b788]/20 border border-[#52b788]/30 text-[#d8f3dc] text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#52b788] animate-ping" />
              <span>Gelephu Mindfulness City • Real-Time Biosphere Telemetry</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Harmonizing Nature, Mind & Technology.
            </h1>

            <p className="text-sm sm:text-base text-[#d8f3dc]/85 leading-relaxed max-w-xl font-normal">
              GMC bridges Gross National Happiness with proactive ecological stewardship. Every observation, river cleanup, and clean commute keeps our Himalayan valley in living equilibrium.
            </p>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="btn-hero-report"
                onClick={onOpenReportModal}
                className="px-5 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <span>📸 Log Ecological Observation</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateToMap()}
                className="px-4 py-2.5 rounded-xl bg-[#2d6a4f]/80 hover:bg-[#2d6a4f] text-[#d8f3dc] border border-[#52b788]/30 font-semibold text-xs sm:text-sm transition flex items-center space-x-2"
              >
                <Compass className="w-4 h-4 text-[#74c69d]" />
                <span>Explore Eco-Atlas</span>
              </button>
            </div>
          </div>

          {/* Right Column: Grand Pulsating City Harmony Score Radial */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
              
              {/* Pulsing Concentric Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-[#52b788]/20 animate-ping opacity-25" />
              <div className="absolute inset-3 rounded-full border border-[#74c69d]/30 animate-pulse" />
              <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-[#1b4332] to-[#2d6a4f] border border-[#52b788]/40 shadow-2xl flex flex-col items-center justify-center text-center p-4">
                
                <div className="flex items-center space-x-1.5 text-[#52b788] mb-1">
                  <Activity className="w-4 h-4 animate-bounce" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#d8f3dc]">City Harmony Index</span>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {metrics.harmonyScore.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-[#52b788]">/100</span>
                </div>

                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#52b788]/25 border border-[#52b788]/40 text-[11px] font-bold text-[#d8f3dc]">
                  Optimal Equilibrium ✨
                </div>

                <p className="mt-1.5 text-[10px] text-[#d8f3dc]/70">
                  +0.4% from yesterday • 3,840 active stewards
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Banner Stats Strip */}
        <div className="mt-8 pt-6 border-t border-[#52b788]/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="block text-[11px] text-[#d8f3dc]/70">Daily CO₂ Offset</span>
            <span className="text-base font-bold text-white">{metrics.dailyCo2AvoidedTons} tons</span>
          </div>
          <div>
            <span className="block text-[11px] text-[#d8f3dc]/70">Forest Canopy Cover</span>
            <span className="text-base font-bold text-white">{metrics.forestCanopyPercent}%</span>
          </div>
          <div>
            <span className="block text-[11px] text-[#d8f3dc]/70">Wildlife Passage Safety</span>
            <span className="text-base font-bold text-white">{metrics.wildlifeMigrationSafety}% Safe</span>
          </div>
          <div>
            <span className="block text-[11px] text-[#d8f3dc]/70">Resolved Incidents Today</span>
            <span className="text-base font-bold text-white">{metrics.resolvedTodayCount} actions</span>
          </div>
        </div>
      </section>

      {/* 2. Four Core Vitals of Gelephu (High-Density Cards) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1b4332] tracking-tight">Urban Biosphere Vital Signs</h2>
            <p className="text-xs text-gray-500">Live environmental sensory grid across 7 Gelephu sectors</p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#2d6a4f] bg-[#e8f5e9] px-3 py-1 rounded-full font-semibold border border-[#c8e6c9]">
            <span className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-pulse" />
            <span>Telemetry Synchronized</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Air Quality Index */}
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center font-bold">
                <Wind className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#d8f3dc] text-[#1b4332]">
                AQI Level 1
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Air Quality (AQI)</p>
            <div className="flex items-baseline space-x-2 my-1">
              <span className="text-3xl font-extrabold text-[#1b4332]">{metrics.aqi}</span>
              <span className="text-xs font-medium text-emerald-600 font-semibold">Himalayan Crisp</span>
            </div>
            <p className="text-xs text-gray-600">PM2.5: {metrics.pm25} µg/m³ • Mountain breeze freshness optimal.</p>
            <div className="mt-3 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#40916c] h-full rounded-full" style={{ width: '16%' }} />
            </div>
          </div>

          {/* Card 2: Renewable Energy Grid */}
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff3cd] text-[#856404] flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 text-[#d97706]" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Microgrids Active
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Renewable Power Mix</p>
            <div className="flex items-baseline space-x-2 my-1">
              <span className="text-3xl font-extrabold text-[#1b4332]">{metrics.renewablePercent}%</span>
              <span className="text-xs font-medium text-amber-600 font-semibold">Solar + Hydro</span>
            </div>
            <p className="text-xs text-gray-600">Gen: {(metrics.solarOutputMw + metrics.hydroOutputMw).toFixed(1)} MW • Load: {metrics.cityLoadMw} MW</p>
            <div className="mt-3 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#52b788] h-full rounded-full" style={{ width: `${metrics.renewablePercent}%` }} />
            </div>
          </div>

          {/* Card 3: Biosphere & Wildlife Corridor */}
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] text-[#1b4332] flex items-center justify-center font-bold">
                <Trees className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#d8f3dc] text-[#1b4332]">
                7 Sanctuaries
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Biodiversity Health</p>
            <div className="flex items-baseline space-x-2 my-1">
              <span className="text-3xl font-extrabold text-[#1b4332]">{metrics.biodiversityCorridorHealth}%</span>
              <span className="text-xs font-medium text-emerald-600 font-semibold">Stable</span>
            </div>
            <p className="text-xs text-gray-600">Canopy: {metrics.forestCanopyPercent}% • Elephant & Langur bridges open.</p>
            <div className="mt-3 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#2d6a4f] h-full rounded-full" style={{ width: `${metrics.biodiversityCorridorHealth}%` }} />
            </div>
          </div>

          {/* Card 4: Mao River Watershed */}
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center font-bold">
                <Waves className="w-5 h-5 text-[#0284c7]" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                Class A Riparian
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mao River Purity</p>
            <div className="flex items-baseline space-x-2 my-1">
              <span className="text-3xl font-extrabold text-[#1b4332]">{metrics.waterPurityIndex}%</span>
              <span className="text-xs font-medium text-sky-600 font-semibold">High Flow</span>
            </div>
            <p className="text-xs text-gray-600">Sediment Sieve Status: Optimal • DO: 9.4 mg/L</p>
            <div className="mt-3 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0284c7] h-full rounded-full" style={{ width: `${metrics.waterPurityIndex}%` }} />
            </div>
          </div>

        </div>
      </section>

      {/* 3. AI Mindfulness Eco-Digest & Daily Harmony Reflection */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-[#f4f1de]/70 via-[#f8f9f6] to-[#d8f3dc]/40 border border-[#e2e8f0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#1b4332] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-[#52b788]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-[#1b4332] tracking-tight">AI City Pulse & Mindfulness Digest</h3>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-[#1b4332] text-[#d8f3dc] rounded">Gemini Powered</span>
              </div>
              <p className="text-xs text-gray-500">Synthesizing real-time telemetry, wildlife sensors, and community karma</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshingInsight}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-[#1b4332] flex items-center space-x-1.5 shadow-2xs transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingInsight ? 'animate-spin text-[#2d6a4f]' : ''}`} />
            <span>{isRefreshingInsight ? 'Consulting AI...' : 'Refresh Digest'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-start">
          <div className="lg:col-span-7 space-y-2">
            <h4 className="text-base font-bold text-[#1b4332]">{cityInsight.headline}</h4>
            <p className="text-xs text-gray-700 leading-relaxed">{cityInsight.summary}</p>
            
            <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-[#2d6a4f]">
              <MapPin className="w-3.5 h-3.5 text-[#52b788]" />
              <span>Active Sector: {cityInsight.focusSector}</span>
            </div>
          </div>

          <div className="lg:col-span-5 p-4 rounded-xl bg-white/90 border border-[#d8f3dc] shadow-2xs space-y-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#1b4332]">
              <Heart className="w-3.5 h-3.5 text-[#e07a5f]" />
              <span>Daily Mindfulness Prompt</span>
            </div>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              "{cityInsight.dailyMindfulnessPrompt}"
            </p>
            <div className="pt-1 text-[11px] font-semibold text-[#2d6a4f] bg-[#e8f5e9] p-2 rounded-lg border border-[#c8e6c9]">
              🎯 Suggested Action: {cityInsight.priorityAction}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Active Citizen Missions & Recent Reports Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Active Stewardship Missions (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1b4332] tracking-tight">Active Restoration Missions</h3>
              <p className="text-xs text-gray-500">Join hands to protect Gelephu's living corridors</p>
            </div>
            <button
              onClick={onNavigateToMissions}
              className="text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] flex items-center space-x-1"
            >
              <span>View All ({missions.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {currentActiveMissions.slice(0, 3).map((mission) => (
              <div 
                key={mission.id}
                className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:border-[#52b788] transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#d8f3dc] text-[#1b4332] mb-1.5">
                      {mission.sector}
                    </span>
                    <h4 className="text-sm font-bold text-[#1b4332]">{mission.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-[#fff3cd] text-[#856404] text-xs font-extrabold">
                      <Sparkles className="w-3 h-3 text-[#d97706]" />
                      <span>+{mission.rewardPoints} pts</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">{mission.description}</p>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>{mission.startDate}</span>
                  </div>
                  <span className="font-semibold text-[#1b4332]">
                    {mission.currentParticipants}/{mission.targetParticipants} Stewards
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#52b788] h-full rounded-full transition-all"
                    style={{ width: `${(mission.currentParticipants / mission.targetParticipants) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Citizen Observations & Ticker (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1b4332] tracking-tight">Citizen Observation Stream</h3>
              <p className="text-xs text-gray-500">Recent verified reports from across the city</p>
            </div>
            <button
              onClick={() => onNavigateToMap()}
              className="text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] flex items-center space-x-1"
            >
              <span>Map View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {displayReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:border-[#52b788] transition cursor-pointer flex gap-3.5 items-start group"
              >
                {report.photoUrl && (
                  <img
                    src={report.photoUrl}
                    alt={report.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                )}

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-wider bg-[#d8f3dc] px-2 py-0.5 rounded">
                      {report.category}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      report.status === 'resolved' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : report.status === 'in-progress'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-[#1b4332] truncate">{report.title}</h4>
                  <p className="text-[11px] text-gray-500 line-clamp-1">{report.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#52b788]" />
                      <span className="truncate max-w-[140px]">{report.locationName}</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onUpvoteReport) {
                          onUpvoteReport(report.id);
                        }
                      }}
                      className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                        report.userUpvoted 
                          ? 'bg-[#d8f3dc] text-[#1b4332] font-bold'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{report.upvotes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Gelephu 7 Sectors Equilibrium Overview */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1b4332] tracking-tight">District Harmony Index</h3>
            <p className="text-xs text-gray-500">Equilibrium score per GMC sector corridor</p>
          </div>
          <span className="text-xs text-gray-500">Click sector to filter Eco-Atlas</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {GMC_SECTORS.map((sec) => (
            <div
              key={sec.id}
              onClick={() => onNavigateToMap(sec.name)}
              className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#52b788] hover:shadow-md transition cursor-pointer text-center space-y-2 group"
            >
              <div className="w-8 h-8 mx-auto rounded-xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                🌿
              </div>
              <h5 className="text-[11px] font-bold text-[#1b4332] line-clamp-2 h-7">{sec.name.split(':')[1] || sec.name}</h5>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-lg font-extrabold text-[#2d6a4f]">{sec.harmony}</span>
                <span className="text-[10px] text-gray-400">/100</span>
              </div>
              <span className="inline-block text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Harmonious
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

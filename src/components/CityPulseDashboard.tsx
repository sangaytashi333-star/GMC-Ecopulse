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
  Leaf,
  Trophy,
  CloudSun,
  Radio,
  Thermometer,
  Droplets,
  Gauge,
  WifiOff,
  Database,
  LogOut,
  UserPlus
} from 'lucide-react';
import { CityMetrics, CitizenReport, Mission, CityInsight, LiveLocationState } from '../types';
import { GMC_SECTORS, INITIAL_CITY_METRICS, INITIAL_CITY_INSIGHT, INITIAL_REPORTS, INITIAL_MISSIONS, INITIAL_TOP_CONTRIBUTORS } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';
import { RealLeafletMap } from './RealLeafletMap';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getLastSyncTime } from '../lib/offlineStorage';

interface CityPulseDashboardProps {
  metrics?: CityMetrics;
  reports?: CitizenReport[];
  recentReports?: CitizenReport[];
  missions?: Mission[];
  activeMissions?: Mission[];
  cityInsight?: CityInsight;
  userLocation?: LiveLocationState;
  onRefreshInsight?: () => Promise<void>;
  onNavigateToMap: (sectorId?: string) => void;
  onNavigateToMissions: () => void;
  onNavigateToRankings?: () => void;
  onOpenReportModal: () => void;
  onUpvoteReport?: (reportId: string) => void;
  onSelectReport: (report: CitizenReport) => void;
  onJoinMission?: (missionId: string) => void;
}

export const CityPulseDashboard: React.FC<CityPulseDashboardProps> = ({
  metrics = INITIAL_CITY_METRICS,
  reports,
  recentReports: recentReportsProp,
  missions,
  activeMissions: activeMissionsProp,
  cityInsight = INITIAL_CITY_INSIGHT,
  userLocation,
  onRefreshInsight,
  onNavigateToMap,
  onNavigateToMissions,
  onNavigateToRankings,
  onOpenReportModal,
  onUpvoteReport,
  onSelectReport,
  onJoinMission = (_missionId: string) => {},
}) => {
  const { isOnline } = useOnlineStatus();
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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E4D3B] via-[#2E7D58] to-[#1E4D3B] text-white p-6 sm:p-8 lg:p-10 shadow-lg border border-[#DCC79A]/30">
        
        {/* Subtle decorative background botanical geometry */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-[#DCC79A]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-[#6FB68D]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline & Mindfulness Welcome */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1E4D3B]/70 border border-[#DCC79A]/40 text-[#F4E9D4] text-xs font-semibold tracking-wide backdrop-blur-sm">
              <img src="/app-logo.png" alt="GMC Ecopulse" className="w-4 h-4 rounded-full object-contain shrink-0" />
              <span>GMC-ecopulse • SENSE • LIVE • THRIVE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Harmonizing Nature, Mind & Technology.
            </h1>

            <p className="text-sm sm:text-base text-[#F4E9D4]/90 leading-relaxed max-w-xl font-normal">
              A mindful digital pulse inspired by nature, culture, and the 108 vision. Rooted in Bhutan, designed for the future.
            </p>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="btn-hero-report"
                onClick={onOpenReportModal}
                className="px-5 py-2.5 rounded-xl bg-[#DCC79A] hover:bg-[#ebd7ab] text-[#1E4D3B] font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <span>📸 Log Ecological Observation</span>
                <ArrowUpRight className="w-4 h-4 text-[#1E4D3B]" />
              </button>

              <button
                onClick={() => onNavigateToMap()}
                className="px-4 py-2.5 rounded-xl bg-[#1E4D3B]/80 hover:bg-[#1E4D3B] text-[#F4E9D4] border border-[#DCC79A]/30 font-semibold text-xs sm:text-sm transition flex items-center space-x-2"
              >
                <Compass className="w-4 h-4 text-[#6FB68D]" />
                <span>Explore Eco-Atlas</span>
              </button>
            </div>
          </div>

          {/* Right Column: Grand Pulsating City Harmony Score Radial */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
              
              {/* Pulsing Concentric Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-[#DCC79A]/20 animate-ping opacity-25" />
              <div className="absolute inset-3 rounded-full border border-[#6FB68D]/30 animate-pulse" />
              <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-[#1E4D3B] to-[#2E7D58] border border-[#DCC79A]/40 shadow-2xl flex flex-col items-center justify-center text-center p-4">
                
                <div className="flex items-center space-x-1.5 text-[#DCC79A] mb-1">
                  <Activity className="w-4 h-4 animate-bounce" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#F4E9D4]">City Harmony Index</span>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {metrics.harmonyScore.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-[#DCC79A]">/100</span>
                </div>

                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#1E4D3B]/60 border border-[#DCC79A]/40 text-[11px] font-bold text-[#F4E9D4]">
                  Optimal Equilibrium ✨
                </div>

                <p className="mt-1.5 text-[10px] text-[#F4E9D4]/75">
                  +0.4% from yesterday • 3,840 active stewards
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Banner Stats Strip */}
        <div className="mt-8 pt-6 border-t border-[#DCC79A]/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="block text-[11px] text-[#F4E9D4]/75">Daily CO₂ Offset</span>
            <span className="text-base font-bold text-white">{metrics.dailyCo2AvoidedTons} tons</span>
          </div>
          <div>
            <span className="block text-[11px] text-[#F4E9D4]/75">Forest Canopy Cover</span>
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

      {/* 2. Urban Biosphere Vital Signs: UV, Radiation, Weather & Core Eco-Telemetry */}
      <section className="space-y-4">
        
        {/* Offline Remote Sector Telemetry Indicator */}
        {!isOnline && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#FFF3E0] to-[#FFE0B2] border border-[#FFB74D] text-[#8C3B00] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-[#E65100] text-white shadow-sm shrink-0">
                <WifiOff className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold leading-tight uppercase tracking-wider text-[#B25E00]">
                    Remote Ecological Sector — Autonomous Offline Mode
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E65100] text-white">
                    Cached
                  </span>
                </div>
                <p className="text-xs text-[#9E4700] mt-0.5">
                  Critical city metrics (UV Index, Ambient Radiation, AQI, Weather) & active missions are served from local offline cache (Synced {getLastSyncTime()}).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 text-[11px] font-semibold text-[#8C3B00] bg-white/70 px-3 py-1.5 rounded-xl border border-[#FFB74D]/50">
              <Database className="w-3.5 h-3.5 text-[#E65100]" />
              <span>Full Local Offline Cache Active</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-[#1b4332] tracking-tight">Urban Biosphere Vital Signs</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#d8f3dc] text-[#1b4332] rounded-full">
                Telemetry Grid Active
              </span>
            </div>
            <p className="text-xs text-gray-500">Continuous environmental sensors: UV radiation, ambient background, weather status & biosphere health</p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#2d6a4f] bg-[#e8f5e9] px-3 py-1 rounded-full font-semibold border border-[#c8e6c9] self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-pulse" />
            <span>Synchronized with 7 Sectors</span>
          </div>
        </div>

        {/* Live Weather Status Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1b4332] via-[#245a42] to-[#1b4332] text-white border border-[#52b788]/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#52b788]/20 border border-[#52b788]/40 flex items-center justify-center text-3xl">
              {metrics.weather?.icon || '🌤️'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#d8f3dc]">GMC Atmospheric Telemetry</span>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded bg-[#52b788] text-[#081c15]">LIVE</span>
              </div>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {metrics.weather?.tempC ?? 22.4}°C
                </span>
                <span className="text-xs font-semibold text-[#d8f3dc]">
                  {metrics.weather?.conditionShort || 'Mild & Crisp'} • {metrics.weather?.condition || 'Gentle Himalayan Breeze'}
                </span>
              </div>
            </div>
          </div>

          {/* Weather Sub-parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#081c15]/40 p-3 rounded-xl border border-white/10">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-[#74c69d]" />
              <div>
                <span className="block text-[10px] text-gray-300">Humidity</span>
                <span className="font-bold text-white">{metrics.weather?.humidity ?? 62}%</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-[#74c69d]" />
              <div>
                <span className="block text-[10px] text-gray-300">Breeze</span>
                <span className="font-bold text-white">{metrics.weather?.windKmh ?? 9.2} km/h</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-[#74c69d]" />
              <div>
                <span className="block text-[10px] text-gray-300">Barometer</span>
                <span className="font-bold text-white">{metrics.weather?.barometricHpa ?? 1014.2} hPa</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-[#facc15]" />
              <div>
                <span className="block text-[10px] text-gray-300">Rain Prob.</span>
                <span className="font-bold text-white">{metrics.weather?.rainProbabilityPercent ?? 12}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* High-Density Biosphere Vital Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          
          {/* Card 1: UV Index */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Sun className="w-4 h-4 text-amber-600" />
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                (metrics.uvIndex ?? 3.4) <= 2 ? 'bg-emerald-100 text-emerald-800' :
                (metrics.uvIndex ?? 3.4) <= 5 ? 'bg-amber-100 text-amber-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {metrics.uvLevel || 'Moderate'}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">UV Index</p>
            <div className="flex items-baseline space-x-1.5 my-1">
              <span className="text-2xl font-extrabold text-[#1b4332]">{metrics.uvIndex ?? 3.4}</span>
              <span className="text-xs font-semibold text-amber-600">UV / 11+</span>
            </div>
            <p className="text-[11px] text-gray-600">Solar: {metrics.weather?.solarRadiationWm2 ?? 485} W/m² • Hat recommended midday.</p>
            <div className="mt-2.5 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, ((metrics.uvIndex ?? 3.4) / 11) * 100)}%` }} />
            </div>
          </div>

          {/* Card 2: Ambient Radiation */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Radio className="w-4 h-4 text-purple-600" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                {metrics.radiationStatus || 'Safe Normal'}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Radiation Level</p>
            <div className="flex items-baseline space-x-1.5 my-1">
              <span className="text-2xl font-extrabold text-[#1b4332]">{metrics.radiationUsv ?? 0.09}</span>
              <span className="text-xs font-semibold text-purple-600">µSv/h</span>
            </div>
            <p className="text-[11px] text-gray-600">Natural Himalayan baseline. Well within WHO safe limits (&lt;0.25).</p>
            <div className="mt-2.5 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '18%' }} />
            </div>
          </div>

          {/* Card 3: Air Quality Index */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center font-bold">
                <Wind className="w-4 h-4 text-[#2d6a4f]" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#d8f3dc] text-[#1b4332]">
                AQI Level 1
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Air Quality (AQI)</p>
            <div className="flex items-baseline space-x-1.5 my-1">
              <span className="text-2xl font-extrabold text-[#1b4332]">{metrics.aqi}</span>
              <span className="text-xs font-medium text-emerald-600 font-semibold">Pristine</span>
            </div>
            <p className="text-[11px] text-gray-600">PM2.5: {metrics.pm25} µg/m³ • Mountain breeze freshness optimal.</p>
            <div className="mt-2.5 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#40916c] h-full rounded-full" style={{ width: '16%' }} />
            </div>
          </div>

          {/* Card 4: Clean Energy Grid */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#fff3cd] text-[#856404] flex items-center justify-center font-bold">
                <Zap className="w-4 h-4 text-[#d97706]" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                100% Clean
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Renewable Mix</p>
            <div className="flex items-baseline space-x-1.5 my-1">
              <span className="text-2xl font-extrabold text-[#1b4332]">{metrics.renewablePercent}%</span>
              <span className="text-xs font-medium text-amber-600 font-semibold">Hydro+Solar</span>
            </div>
            <p className="text-[11px] text-gray-600">Gen: {(metrics.solarOutputMw + metrics.hydroOutputMw).toFixed(1)} MW • Load: {metrics.cityLoadMw} MW</p>
            <div className="mt-2.5 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#52b788] h-full rounded-full" style={{ width: `${metrics.renewablePercent}%` }} />
            </div>
          </div>

          {/* Card 5: Biosphere Health */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#e8f5e9] text-[#1b4332] flex items-center justify-center font-bold">
                <Trees className="w-4 h-4 text-[#2d6a4f]" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#d8f3dc] text-[#1b4332]">
                Canopy {metrics.forestCanopyPercent}%
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Biodiversity Index</p>
            <div className="flex items-baseline space-x-1.5 my-1">
              <span className="text-2xl font-extrabold text-[#1b4332]">{metrics.biodiversityCorridorHealth}%</span>
              <span className="text-xs font-medium text-emerald-600 font-semibold">Optimal</span>
            </div>
            <p className="text-[11px] text-gray-600">Canopy: {metrics.forestCanopyPercent}% • Wildlife bridges open.</p>
            <div className="mt-2.5 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#2d6a4f] h-full rounded-full" style={{ width: `${metrics.biodiversityCorridorHealth}%` }} />
            </div>
          </div>

          {/* Card 6: Watershed Purity */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center font-bold">
                <Waves className="w-4 h-4 text-[#0284c7]" />
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                Class A River
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Mao River Purity</p>
            <div className="flex items-baseline space-x-1.5 my-1">
              <span className="text-2xl font-extrabold text-[#1b4332]">{metrics.waterPurityIndex}%</span>
              <span className="text-xs font-medium text-sky-600 font-semibold">Aerated</span>
            </div>
            <p className="text-[11px] text-gray-600">Sediment Sieve Status: Optimal • DO: 9.4 mg/L</p>
            <div className="mt-2.5 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0284c7] h-full rounded-full" style={{ width: `${metrics.waterPurityIndex}%` }} />
            </div>
          </div>

        </div>
      </section>

      {/* 2.5 Real-Time Living Eco-Atlas & Live GPS Location Section */}
      {userLocation && (
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-[#1b4332] tracking-tight">Real-Time Gelephu Eco-Atlas & Live GPS</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#d8f3dc] text-[#1b4332] rounded-full flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-ping" />
                  <span>Real-Time Telemetry</span>
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Interactive satellite & street GIS layer with citizen observations, wildlife corridors, and real-time GPS tracking.
              </p>
            </div>
            <button
              onClick={() => onNavigateToMap()}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            >
              <Compass className="w-3.5 h-3.5 text-[#52b788]" />
              <span>Expand Eco-Atlas Map</span>
            </button>
          </div>

          <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-md">
            <RealLeafletMap
              reports={allReports}
              missions={currentActiveMissions}
              userLocation={userLocation}
              mapStyle="satellite"
              onSelectReport={onSelectReport}
              onJoinMission={onJoinMission}
            />
          </div>
        </section>
      )}

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
                    style={{ width: `${Math.min(100, (mission.currentParticipants / mission.targetParticipants) * 100)}%` }}
                  />
                </div>

                {/* Enrollment & Action */}
                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <span className="text-[11px] font-medium text-gray-500">
                    {mission.joined ? (
                      <span className="inline-flex items-center text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#2d6a4f]" />
                        Enrolled as Steward
                      </span>
                    ) : (
                      <span>Open for enrollment</span>
                    )}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onJoinMission(mission.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs min-h-[34px] ${
                      mission.joined
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-[#52b788] hover:bg-[#74c69d] text-[#081c15]'
                    }`}
                  >
                    {mission.joined ? (
                      <>
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Leave Mission</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Join Mission</span>
                      </>
                    )}
                  </button>
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
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-wider bg-[#d8f3dc] px-2 py-0.5 rounded">
                        {report.category}
                      </span>
                      {report.voiceAudioUrl && (
                        <span className="text-[10px] font-extrabold text-[#1b4332] bg-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          🎙️ Voice
                        </span>
                      )}
                    </div>
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

      {/* 5. Community Rankings & 24h Rising Stars Leaderboard Showcase */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-[#1b4332] tracking-tight">Community Rankings & 24h Rising Stars</h3>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                Live 24h Telemetry
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Recognizing citizens who climbed the ranks in the last 24 hours through verified ecological actions
            </p>
          </div>

          {onNavigateToRankings && (
            <button
              onClick={() => {
                playMindfulChime('bell');
                onNavigateToRankings();
              }}
              className="text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] flex items-center space-x-1 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs hover:border-[#52b788] transition"
            >
              <span>View Full Top 10 Leaderboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 4 Featured Top Contributors & Rising Stars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {INITIAL_TOP_CONTRIBUTORS.slice(0, 4).map((contributor) => {
            const isClimber = contributor.rankChange24h > 0;
            return (
              <div
                key={contributor.id}
                onClick={() => onNavigateToRankings && onNavigateToRankings()}
                className="p-4 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#52b788] hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-xs ${
                      contributor.rank === 1
                        ? 'bg-amber-400 text-amber-950'
                        : contributor.rank === 2
                        ? 'bg-slate-200 text-slate-800'
                        : contributor.rank === 3
                        ? 'bg-orange-300 text-orange-950'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      #{contributor.rank}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#1E4D3B] text-white flex items-center justify-center font-bold text-sm">
                      {contributor.avatarEmoji || '🌲'}
                    </div>
                  </div>

                  {/* 24-Hour Trend Indicator */}
                  <div>
                    {isClimber ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-black animate-pulse">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>+{contributor.rankChange24h} in 24h</span>
                        {contributor.isRisingStar && <span>🌟</span>}
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500 text-[10px] font-semibold">
                        <span>— Steady</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1b4332] group-hover:text-[#2d6a4f] truncate">
                    {contributor.name}
                  </h4>
                  <p className="text-[11px] text-amber-800 font-medium truncate">
                    {contributor.levelTitle}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {contributor.specialty}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Total Karma</span>
                    <span className="font-extrabold text-[#1b4332]">{contributor.totalKarmaPoints.toLocaleString()} pts</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      +{contributor.karmaEarned24h} today
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Gelephu 7 Sectors Equilibrium Overview */}
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

import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Sparkles, 
  Award, 
  Crown, 
  Flame, 
  Search, 
  Filter, 
  Trees, 
  Recycle, 
  Eye, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  X, 
  Star, 
  Zap, 
  Waves, 
  Share2,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CommunityRankingContributor, UserProfile, ContributorBadge } from '../types';
import { INITIAL_TOP_CONTRIBUTORS } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';

interface CommunityRankingsProps {
  currentUser?: UserProfile;
  contributors?: CommunityRankingContributor[];
  onOpenReportModal?: () => void;
  onNavigateToProfile?: () => void;
}

export const CommunityRankings: React.FC<CommunityRankingsProps> = ({
  currentUser,
  contributors = INITIAL_TOP_CONTRIBUTORS,
  onOpenReportModal,
  onNavigateToProfile,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'rising' | 'podium'>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingContributor, setInspectingContributor] = useState<CommunityRankingContributor | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Sync current user's latest stats into rank list if user matches
  const mergedContributors = useMemo(() => {
    return contributors.map((contributor) => {
      if (currentUser && (contributor.email === currentUser.email || contributor.name === currentUser.name)) {
        return {
          ...contributor,
          name: currentUser.name,
          avatarUrl: currentUser.avatarUrl || contributor.avatarUrl,
          totalKarmaPoints: Math.max(contributor.totalKarmaPoints, currentUser.totalKarmaPoints),
          levelTitle: currentUser.levelTitle || contributor.levelTitle,
          levelNumber: currentUser.levelNumber || contributor.levelNumber,
          treesPlanted: Math.max(contributor.treesPlanted, currentUser.treesPlanted || 0),
          wasteRemovedKg: Math.max(contributor.wasteRemovedKg, currentUser.wasteRemovedKg || 0),
          wildlifeObservedCount: Math.max(contributor.wildlifeObservedCount, currentUser.wildlifeObservedCount || 0),
        };
      }
      return contributor;
    }).sort((a, b) => b.totalKarmaPoints - a.totalKarmaPoints)
      .map((c, index) => ({
        ...c,
        rank: index + 1
      }));
  }, [contributors, currentUser]);

  // Aggregate 24h trend metrics
  const trendMetrics = useMemo(() => {
    const risingCount = mergedContributors.filter(c => c.rankChange24h > 0).length;
    const totalKarma24h = mergedContributors.reduce((sum, c) => sum + (c.karmaEarned24h || 0), 0);
    const topClimber = [...mergedContributors].sort((a, b) => (b.rankChange24h - a.rankChange24h))[0];
    return {
      risingCount,
      totalKarma24h,
      topClimber
    };
  }, [mergedContributors]);

  // Sectors list for filter
  const sectors = useMemo(() => {
    const set = new Set<string>();
    mergedContributors.forEach(c => {
      if (c.primarySector) set.add(c.primarySector);
    });
    return Array.from(set);
  }, [mergedContributors]);

  // Filtered contributors
  const filteredContributors = useMemo(() => {
    return mergedContributors.filter((c) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesSpecialty = c.specialty.toLowerCase().includes(q);
        const matchesSector = c.primarySector.toLowerCase().includes(q);
        if (!matchesName && !matchesSpecialty && !matchesSector) return false;
      }

      // Sector filter
      if (selectedSector !== 'all' && c.primarySector !== selectedSector) {
        return false;
      }

      // View mode filter
      if (selectedFilter === 'rising') {
        return c.rankChange24h > 0;
      }
      if (selectedFilter === 'podium') {
        return c.rank <= 3;
      }

      return true;
    });
  }, [mergedContributors, searchQuery, selectedSector, selectedFilter]);

  const top3 = useMemo(() => {
    return mergedContributors.slice(0, 3);
  }, [mergedContributors]);

  const handleShareRanks = (contributor: CommunityRankingContributor) => {
    navigator.clipboard.writeText(
      `GMC Citizen Leaderboard: ${contributor.name} is Rank #${contributor.rank} in Gelephu with ${contributor.totalKarmaPoints} Karma! 24h Trend: ${contributor.rankChange24h > 0 ? `Climbed +${contributor.rankChange24h} ranks (Rising Star 🌟)` : 'Steady Guardian'}.`
    );
    setShareSuccess(true);
    playMindfulChime('badge');
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setShareSuccess(false), 2500);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'mythic':
        return 'bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-200 border-purple-400';
      case 'diamond':
        return 'bg-gradient-to-r from-cyan-900 to-blue-900 text-cyan-200 border-cyan-400';
      case 'gold':
        return 'bg-gradient-to-r from-amber-700 to-yellow-600 text-amber-100 border-amber-300';
      case 'silver':
        return 'bg-gradient-to-r from-slate-600 to-gray-500 text-slate-100 border-slate-300';
      default:
        return 'bg-gradient-to-r from-amber-900 to-orange-950 text-amber-200 border-amber-700';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-16 sm:pb-12 max-w-7xl mx-auto">
      
      {/* 1. Header Banner & Mindful 24h Karma Surge Showcase */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E4D3B] via-[#2E7D58] to-[#1E4D3B] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-[#DCC79A]/30">
        
        {/* Sacred ambient glows */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-[#DCC79A]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-64 h-64 rounded-full bg-[#6FB68D]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1E4D3B]/70 border border-[#DCC79A]/40 text-[#F4E9D4] text-xs font-semibold backdrop-blur-sm shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#52b788] animate-ping" />
                <span className="font-mono">LIVE • 24H STEWARDSHIP SURGE</span>
                <span className="text-[#DCC79A]">✦</span>
                <span>GMC Top 10</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Community Rankings & Rising Stars
              </h1>

              <p className="text-sm sm:text-base text-[#F4E9D4]/90 font-normal leading-relaxed">
                Celebrating Gelephu’s foremost citizen guardians who restore forest canopies, safeguard wildlife corridors, and uplift Bhutan’s Gross National Happiness through verified eco-karma.
              </p>
            </div>

            {/* Quick Action & Audio Inspiration */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              {onOpenReportModal && (
                <button
                  onClick={() => {
                    playMindfulChime('karma');
                    onOpenReportModal();
                  }}
                  className="px-5 py-3 rounded-2xl bg-[#DCC79A] hover:bg-[#ebd7ab] text-[#1E4D3B] font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 text-[#1E4D3B]" />
                  <span>Log Action & Climb Ranks</span>
                </button>
              )}
              {onNavigateToProfile && (
                <button
                  onClick={onNavigateToProfile}
                  className="px-4 py-3 rounded-2xl bg-[#1E4D3B]/80 hover:bg-[#1E4D3B] text-[#F4E9D4] border border-[#DCC79A]/40 font-bold text-xs sm:text-sm transition flex items-center space-x-1.5"
                >
                  <Award className="w-4 h-4 text-[#6FB68D]" />
                  <span>My Badges & Standing</span>
                </button>
              )}
            </div>

          </div>

          {/* Live 24-Hour Velocity Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#DCC79A]/20">
            
            <div className="p-3.5 rounded-2xl bg-black/25 border border-[#DCC79A]/20 backdrop-blur-xs space-y-1">
              <span className="text-[10px] sm:text-xs text-[#F4E9D4]/75 font-semibold uppercase tracking-wider block">
                24h Rising Stars
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-extrabold text-[#74c69d]">
                  {trendMetrics.risingCount} Stewards
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#2d6a4f] text-[10px] font-bold text-emerald-200">
                  Surging
                </span>
              </div>
              <p className="text-[10px] text-[#F4E9D4]/70">Climbed leaderboard positions</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/25 border border-[#DCC79A]/20 backdrop-blur-xs space-y-1">
              <span className="text-[10px] sm:text-xs text-[#F4E9D4]/75 font-semibold uppercase tracking-wider block">
                24h Karma Velocity
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-[#DCC79A]">
                  +{trendMetrics.totalKarma24h.toLocaleString()}
                </span>
                <span className="text-xs text-[#F4E9D4]/70">pts</span>
              </div>
              <p className="text-[10px] text-[#F4E9D4]/70">Earned across community today</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/25 border border-[#DCC79A]/20 backdrop-blur-xs space-y-1">
              <span className="text-[10px] sm:text-xs text-[#F4E9D4]/75 font-semibold uppercase tracking-wider block">
                Top 24h Climber
              </span>
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="text-base sm:text-lg font-bold text-white truncate">
                  {trendMetrics.topClimber?.name || 'Dechen Zangmo'}
                </span>
              </div>
              <p className="text-[10px] text-[#74c69d] font-bold flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-[#74c69d]" />
                <span>+{trendMetrics.topClimber?.rankChange24h || 3} positions today</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/25 border border-[#DCC79A]/20 backdrop-blur-xs space-y-1">
              <span className="text-[10px] sm:text-xs text-[#F4E9D4]/75 font-semibold uppercase tracking-wider block">
                Verification Protocol
              </span>
              <div className="flex items-center space-x-1 text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-[#74c69d]" />
                <span className="text-sm font-bold">100% On-Chain GMC</span>
              </div>
              <p className="text-[10px] text-[#F4E9D4]/70">Anti-tamper cryptographic seals</p>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Top 3 Sacred Himalayan Podium Showcase */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1E4D3B] tracking-tight">
                Himalayan Crown Podium (Top 3)
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              The supreme ecological custodians of Gelephu with their latest 24-hour rank momentum
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Updated hourly based on verified citizen observations</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {top3.map((contributor) => {
            const isFirst = contributor.rank === 1;
            const isSecond = contributor.rank === 2;
            const isThird = contributor.rank === 3;

            const podiumMeta = isFirst
              ? {
                  crownBg: 'from-amber-400 via-yellow-300 to-amber-500',
                  badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
                  medalEmoji: '🥇',
                  ringColor: 'ring-amber-400',
                  border: 'border-amber-300',
                  title: '1st Place • Crown Luminary',
                }
              : isSecond
              ? {
                  crownBg: 'from-slate-300 via-gray-200 to-slate-400',
                  badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
                  medalEmoji: '🥈',
                  ringColor: 'ring-slate-300',
                  border: 'border-slate-300',
                  title: '2nd Place • Vice Luminary',
                }
              : {
                  crownBg: 'from-amber-600 via-orange-400 to-amber-700',
                  badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
                  medalEmoji: '🥉',
                  ringColor: 'ring-amber-600',
                  border: 'border-orange-300',
                  title: '3rd Place • Grand Sentinel',
                };

            return (
              <div
                key={contributor.id}
                onClick={() => {
                  playMindfulChime('badge');
                  setInspectingContributor(contributor);
                }}
                className={`p-5 sm:p-6 rounded-3xl bg-white border-2 ${podiumMeta.border} shadow-md hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between space-y-4`}
              >
                {/* Decorative background glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${podiumMeta.crownBg} opacity-15 rounded-full blur-2xl pointer-events-none group-hover:opacity-25 transition-opacity`} />

                {/* Top Badge: Rank & Medal */}
                <div className="flex items-center justify-between relative z-10">
                  <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs ${podiumMeta.badgeBg}`}>
                    <span className="text-base">{podiumMeta.medalEmoji}</span>
                    <span>RANK #{contributor.rank}</span>
                  </div>

                  {/* 24-Hour Trend Indicator Badge on Podium */}
                  <div>
                    {contributor.rankChange24h > 0 ? (
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-black shadow-xs animate-pulse">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+{contributor.rankChange24h} in 24h</span>
                        {contributor.isRisingStar && <span className="text-xs">🌟</span>}
                      </div>
                    ) : contributor.rankChange24h === 0 ? (
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-500 text-xs font-semibold">
                        <Minus className="w-3.5 h-3.5 text-gray-400" />
                        <span>Steady</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-500 text-xs font-medium">
                        <ArrowDown className="w-3.5 h-3.5 text-gray-400" />
                        <span>{contributor.rankChange24h}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contributor Identity & Crown */}
                <div className="flex items-center space-x-3.5 relative z-10">
                  <div className="relative shrink-0">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${podiumMeta.crownBg} p-1 shadow-md`}>
                      <div className="w-full h-full rounded-[12px] bg-[#1E4D3B] flex items-center justify-center text-2xl text-white overflow-hidden font-bold">
                        {contributor.avatarUrl ? (
                          <img 
                            src={contributor.avatarUrl} 
                            alt={contributor.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          contributor.avatarEmoji || '🌲'
                        )}
                      </div>
                    </div>
                    {isFirst && (
                      <Crown className="w-6 h-6 text-amber-500 absolute -top-3 -right-2 drop-shadow-md transform rotate-12" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-[#1E4D3B] truncate group-hover:text-[#2E7D58] transition-colors">
                      {contributor.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-700 truncate">{contributor.levelTitle}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      Level {contributor.levelNumber}
                    </span>
                  </div>
                </div>

                {/* Contributor's Pinned Badges Ribbon */}
                <div className="space-y-1.5 relative z-10">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                    <span>Key Achievement Medals</span>
                    <span className="text-[#2E7D58] font-bold">{contributor.badges.length} Unlocked</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {contributor.badges.slice(0, 3).map((badge) => (
                      <span
                        key={badge.id}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border shadow-2xs ${getTierColor(badge.tier)}`}
                        title={`${badge.name} (${badge.tier.toUpperCase()})`}
                      >
                        <span>{badge.iconEmoji}</span>
                        <span className="truncate max-w-[110px]">{badge.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Karma & 24h Surge Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between relative z-10">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Total Karma</span>
                    <span className="text-xl font-black text-[#1E4D3B]">
                      {contributor.totalKarmaPoints.toLocaleString()} <span className="text-xs text-gray-500 font-normal">pts</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      +{contributor.karmaEarned24h} pts (24h)
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">Click to view stats</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Trend Indicator Explainer Card */}
      <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#d8f3dc]/60 via-[#f8f9f6] to-[#f4f1de]/60 border border-[#b7e4c7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#1E4D3B] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <TrendingUp className="w-5 h-5 text-[#52b788]" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-extrabold text-[#1E4D3B]">
                How 24-Hour Rank Trend Indicators Work
              </h4>
              <span className="px-2 py-0.2 rounded-full bg-[#1E4D3B] text-[#d8f3dc] text-[10px] font-bold">
                Dynamic Telemetry
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
              Rank trends track live positions over a rolling 24-hour cycle. Citizens who plant trees, resolve field reports, or verify wildlife sightings earn immediate Karma points that propel them upward.
            </p>
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            <span>▲ +N in 24h (Rising Star)</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 font-semibold">
            <Minus className="w-3.5 h-3.5 text-gray-500" />
            <span>— Steady Rank</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            <span>▼ Shifted</span>
          </div>
        </div>
      </section>

      {/* 4. Filter Toolbar & Search Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs">
        
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all' as const, label: '🌟 All Top 10' },
            { id: 'rising' as const, label: '🚀 Rising Stars Only (24h)' },
            { id: 'podium' as const, label: '🏆 Podium (Top 3)' },
          ].map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedFilter(tab.id);
                  playMindfulChime('bell');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-[#1E4D3B] text-[#F4E9D4] shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === 'rising' && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-[#52b788] text-[#081c15]' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {trendMetrics.risingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sector dropdown & Search query */}
        <div className="flex items-center space-x-2">
          <div className="relative min-w-[140px] sm:min-w-[180px]">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[#2E7D58] min-h-[38px]"
            >
              <option value="all">All GMC Sectors</option>
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec.split(':')[0] || sec}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search steward..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#2E7D58] min-h-[38px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </section>

      {/* 5. Complete Top 10 Community Rankings Table / Card Grid */}
      <section className="space-y-3">
        {filteredContributors.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h4 className="text-base font-bold text-[#1E4D3B]">No stewards found</h4>
            <p className="text-xs text-gray-500">Try clearing the search query or changing the sector filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('all');
                setSelectedFilter('all');
              }}
              className="px-4 py-2 bg-[#1E4D3B] text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredContributors.map((contributor) => {
            const isCurrentUser = currentUser && (
              contributor.email === currentUser.email || 
              contributor.name.toLowerCase() === currentUser.name.toLowerCase()
            );

            const isClimber = contributor.rankChange24h > 0;
            const isTop3 = contributor.rank <= 3;

            return (
              <div
                key={contributor.id}
                onClick={() => {
                  playMindfulChime('badge');
                  setInspectingContributor(contributor);
                }}
                className={`p-4 sm:p-5 rounded-2xl transition-all cursor-pointer border flex flex-col lg:flex-row lg:items-center justify-between gap-4 group hover:shadow-md ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-[#d8f3dc]/70 via-[#f4f9f5] to-white border-[#52b788] shadow-sm ring-1 ring-[#52b788]/50'
                    : 'bg-white border-gray-200 hover:border-[#2E7D58]/40'
                }`}
              >
                
                {/* Left Side: Rank, Trend Indicator, Avatar, Name & Level */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  
                  {/* Rank Badge */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-11 sm:w-12 text-center">
                    <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-xs ${
                      contributor.rank === 1
                        ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 border border-amber-300'
                        : contributor.rank === 2
                        ? 'bg-gradient-to-tr from-slate-200 to-gray-300 text-slate-800 border border-slate-300'
                        : contributor.rank === 3
                        ? 'bg-gradient-to-tr from-amber-600 to-orange-400 text-white border border-orange-400'
                        : 'bg-gray-100 text-[#1E4D3B] font-bold border border-gray-200'
                    }`}>
                      #{contributor.rank}
                    </span>

                    {/* Small Rank Label */}
                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">
                      {isTop3 ? 'Podium' : 'Steward'}
                    </span>
                  </div>

                  {/* 24-Hour Trend Indicator Badge (Focus Requirement) */}
                  <div className="shrink-0">
                    {isClimber ? (
                      <div 
                        title={`Climbed ${contributor.rankChange24h} positions in the last 24h (from #${contributor.previousRank24h} to #${contributor.rank})`}
                        className="flex flex-col items-center justify-center min-w-[76px] sm:min-w-[90px]"
                      >
                        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-xs shadow-xs group-hover:scale-105 transition-transform">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>+{contributor.rankChange24h}</span>
                          <span className="hidden sm:inline text-[10px] text-emerald-600">24h</span>
                        </div>
                        
                        {contributor.isRisingStar && (
                          <span className="mt-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs animate-pulse flex items-center space-x-0.5">
                            <span>🌟</span>
                            <span>Rising Star</span>
                          </span>
                        )}
                      </div>
                    ) : contributor.rankChange24h === 0 ? (
                      <div 
                        title="Maintained steady position over the last 24 hours"
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 font-semibold text-xs min-w-[70px] justify-center"
                      >
                        <Minus className="w-3 h-3 text-gray-400" />
                        <span className="text-[11px]">Steady</span>
                      </div>
                    ) : (
                      <div 
                        title={`Shifted down ${Math.abs(contributor.rankChange24h)} positions in the last 24h`}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs min-w-[70px] justify-center"
                      >
                        <ArrowDown className="w-3 h-3 text-slate-400" />
                        <span className="text-[11px]">{contributor.rankChange24h}</span>
                      </div>
                    )}
                  </div>

                  {/* Avatar Photo / Emoji */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E4D3B] p-0.5 shadow-sm overflow-hidden flex items-center justify-center border border-[#DCC79A]/40 text-xl text-white">
                      {contributor.avatarUrl ? (
                        <img 
                          src={contributor.avatarUrl} 
                          alt={contributor.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        contributor.avatarEmoji || '🌲'
                      )}
                    </div>
                    {isCurrentUser && (
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#52b788] text-[#081c15] text-[8px] font-black uppercase border border-white shadow-xs">
                        YOU
                      </span>
                    )}
                  </div>

                  {/* Name, Level, District */}
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#1E4D3B] truncate group-hover:text-[#2E7D58] transition-colors">
                        {contributor.name}
                      </h4>
                      {isCurrentUser && (
                        <span className="px-2 py-0.2 rounded-full bg-[#1b4332] text-[#d8f3dc] text-[10px] font-bold">
                          Current Account
                        </span>
                      )}
                      <span className="px-2 py-0.2 rounded-full bg-[#f4ebd0] text-[#1E4D3B] text-[10px] font-extrabold border border-[#DCC79A]/50">
                        Lvl {contributor.levelNumber}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-amber-800 truncate">
                      {contributor.levelTitle}
                    </p>

                    <div className="flex items-center space-x-2 text-[11px] text-gray-500 truncate">
                      <span className="flex items-center space-x-1 truncate max-w-[200px] sm:max-w-none">
                        <MapPin className="w-3 h-3 text-[#2E7D58] shrink-0" />
                        <span className="truncate">{contributor.primarySector.split(':')[1] || contributor.primarySector}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-0.5 text-amber-700 font-semibold shrink-0">
                        <Flame className="w-3 h-3 text-amber-500" />
                        <span>{contributor.currentStreakDays}d Streak</span>
                      </span>
                    </div>
                  </div>

                </div>

                {/* Center / Middle: Achievement Badges Shelf */}
                <div className="flex-1 lg:max-w-sm flex flex-col justify-center space-y-1 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                    <span>Verified Badges & Medals ({contributor.badges.length})</span>
                    <span className="text-[#2E7D58] font-bold text-[10px]">Verifiable</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5">
                    {contributor.badges.slice(0, 4).map((badge) => (
                      <span
                        key={badge.id}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border shadow-2xs ${getTierColor(badge.tier)}`}
                        title={`${badge.name} • ${badge.tier.toUpperCase()}`}
                      >
                        <span>{badge.iconEmoji}</span>
                        <span className="truncate max-w-[95px]">{badge.name}</span>
                      </span>
                    ))}
                    {contributor.badges.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold">
                        +{contributor.badges.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side: Karma Points, 24h Velocity & Action CTA */}
                <div className="flex items-center justify-between lg:justify-end space-x-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                      Lifetime Karma
                    </span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-lg sm:text-xl font-black text-[#1E4D3B]">
                        {contributor.totalKarmaPoints.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold">pts</span>
                    </div>
                    
                    <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-0.5">
                      <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
                      <span>+{contributor.karmaEarned24h} pts today</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playMindfulChime('bell');
                      setInspectingContributor(contributor);
                    }}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-100 hover:bg-[#1E4D3B] hover:text-[#F4E9D4] text-gray-700 transition flex items-center space-x-1 text-xs font-bold min-h-[40px] shrink-0"
                  >
                    <span className="hidden sm:inline">Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                </div>

              </div>
            );
          })
        )}
      </section>

      {/* 6. Detailed Contributor Inspection Modal */}
      {inspectingContributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#081c15]/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-2xl bg-[#1E4D3B] p-0.5 shadow-md flex items-center justify-center text-2xl text-white overflow-hidden border-2 border-[#DCC79A]">
                  {inspectingContributor.avatarUrl ? (
                    <img 
                      src={inspectingContributor.avatarUrl} 
                      alt={inspectingContributor.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    inspectingContributor.avatarEmoji || '🌲'
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-xs border border-amber-300">
                      RANK #{inspectingContributor.rank}
                    </span>
                    {inspectingContributor.rankChange24h > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>+{inspectingContributor.rankChange24h} in 24h</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-[#1E4D3B] mt-1">{inspectingContributor.name}</h3>
                  <p className="text-xs font-bold text-amber-800">{inspectingContributor.levelTitle} (Level {inspectingContributor.levelNumber})</p>
                </div>
              </div>

              <button
                onClick={() => setInspectingContributor(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specialty & Sector */}
            <div className="p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#DCC79A]/40 space-y-1 text-xs">
              <div className="flex items-center space-x-1.5 text-[#1E4D3B] font-bold">
                <MapPin className="w-3.5 h-3.5 text-[#2E7D58]" />
                <span>{inspectingContributor.primarySector}</span>
              </div>
              <p className="text-gray-700 italic">
                "{inspectingContributor.specialty}"
              </p>
              {inspectingContributor.recentHighlight && (
                <div className="pt-1.5 text-[11px] text-emerald-800 font-semibold flex items-center space-x-1">
                  <span>⚡ 24h Highlight:</span>
                  <span>{inspectingContributor.recentHighlight}</span>
                </div>
              )}
            </div>

            {/* Verified Stewardship Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Canopy Trees</span>
                <span className="text-lg font-black text-[#1E4D3B]">{inspectingContributor.treesPlanted}</span>
                <span className="text-[10px] text-gray-400 block">planted</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Biomass / Waste</span>
                <span className="text-lg font-black text-[#1E4D3B]">{inspectingContributor.wasteRemovedKg}</span>
                <span className="text-[10px] text-gray-400 block">kg recovered</span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Wildlife Sightings</span>
                <span className="text-lg font-black text-[#1E4D3B]">{inspectingContributor.wildlifeObservedCount}</span>
                <span className="text-[10px] text-gray-400 block">verified logs</span>
              </div>
            </div>

            {/* Badges Shelf */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-[#1E4D3B] tracking-wider">
                  Unlocked GMC Achievement Medals ({inspectingContributor.badges.length})
                </h4>
                <span className="text-[10px] text-gray-400">Cryptographically Signed</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inspectingContributor.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${getTierColor(badge.tier)}`}
                  >
                    <span className="text-xl shrink-0">{badge.iconEmoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{badge.name}</p>
                      <span className="text-[9px] font-extrabold uppercase opacity-85">{badge.tier} tier</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleShareRanks(inspectingContributor)}
                className="flex-1 py-3 rounded-xl bg-[#DCC79A] hover:bg-[#ebd7ab] text-[#1E4D3B] font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-1.5 min-h-[46px]"
              >
                <Share2 className="w-4 h-4 text-[#1E4D3B]" />
                <span>{shareSuccess ? 'Copied Leaderboard Card!' : 'Share Steward Accomplishment'}</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectingContributor(null)}
                className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold min-h-[46px]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

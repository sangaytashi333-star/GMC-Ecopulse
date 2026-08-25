import React, { useState } from 'react';
import { 
  User, 
  Award, 
  Sparkles, 
  Trees, 
  Waves, 
  Recycle, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Share2, 
  Download, 
  TrendingUp, 
  X,
  ExternalLink,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Badge, CitizenReport } from '../types';
import { playMindfulChime } from '../utils/audio';

interface StewardshipProfileProps {
  user: UserProfile;
  userReports: CitizenReport[];
  onOpenReportModal: () => void;
}

export const StewardshipProfile: React.FC<StewardshipProfileProps> = ({
  user,
  userReports,
  onOpenReportModal,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [certificateCopied, setCertificateCopied] = useState(false);

  // Next level math
  const currentLevelMin = 1000;
  const nextLevelTarget = 2000;
  const progressPercent = Math.min(100, Math.round(((user.totalKarmaPoints - currentLevelMin) / (nextLevelTarget - currentLevelMin)) * 100));

  const handleShareCertificate = (badge: Badge) => {
    navigator.clipboard.writeText(
      `Verified GMC Ecological Credential: ${badge.name} | Seal: ${badge.sealCode} | Awarded to ${user.name} for exemplary Himalayan stewardship.`
    );
    setCertificateCopied(true);
    confetti({ particleCount: 40, spread: 40, origin: { y: 0.8 } });
    playMindfulChime('badge');
    setTimeout(() => setCertificateCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Steward Identity & Level Progression Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1b4332] text-white shadow-lg border border-[#52b788]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar & Rank */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#52b788] to-[#d8f3dc] p-1 shadow-md">
                <div className="w-full h-full rounded-[14px] bg-[#1b4332] flex items-center justify-center text-2xl font-bold text-[#d8f3dc]">
                  KT
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-[#52b788] text-[#081c15] font-extrabold text-[10px] rounded-full border border-white">
                Lvl {user.levelNumber}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">{user.name}</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#52b788]/20 text-[#d8f3dc] rounded-full border border-[#52b788]/40">
                  Verified Steward
                </span>
              </div>
              <p className="text-sm font-semibold text-[#74c69d]">{user.levelTitle}</p>
              <p className="text-xs text-[#d8f3dc]/70">Member since {user.joinedDate} • {user.currentStreakDays} Days Mindful Streak 🔥</p>
            </div>
          </div>

          {/* Karma Score Pill Boxes */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            <div className="p-3.5 rounded-2xl bg-[#081c15]/60 border border-[#52b788]/30 text-center min-w-[110px]">
              <span className="block text-[10px] font-bold uppercase text-[#d8f3dc]/70">Spendable Karma</span>
              <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-[#74c69d]">{user.spendablePoints}</span>
                <span className="text-[10px] text-[#d8f3dc]/70">pts</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#52b788]/20 border border-[#52b788]/40 text-center min-w-[110px]">
              <span className="block text-[10px] font-bold uppercase text-[#d8f3dc]/70">Lifetime Prestige</span>
              <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">{user.totalKarmaPoints}</span>
                <span className="text-[10px] text-[#d8f3dc]/70">pts</span>
              </div>
            </div>

          </div>

        </div>

        {/* Level Progress Bar */}
        <div className="mt-8 pt-6 border-t border-[#52b788]/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#d8f3dc]/80 font-semibold">
              Rank Progression: <strong className="text-white">{user.levelTitle}</strong>
            </span>
            <span className="text-[#74c69d] font-bold">
              {user.totalKarmaPoints} / {nextLevelTarget} pts to Level 5 (Master of Harmony)
            </span>
          </div>

          <div className="w-full bg-[#081c15]/60 h-2.5 rounded-full overflow-hidden p-0.5 border border-[#52b788]/30">
            <div
              className="bg-gradient-to-r from-[#52b788] to-[#74c69d] h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Lifetime Impact Metrics Grid */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#1b4332] tracking-tight">Verified Lifetime Ecological Impact</h3>
          <p className="text-xs text-gray-500">Your direct physical contribution to Gelephu's urban and natural ecosystem</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] text-[#2d6a4f] flex items-center justify-center mb-3">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase">Circular Waste Diverted</span>
              <p className="text-2xl font-extrabold text-[#1b4332] mt-1">{user.wasteRemovedKg} <span className="text-sm font-normal">kg</span></p>
            </div>
            <p className="text-[11px] text-emerald-600 mt-2 font-medium">Composted & Biogas</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-[#2d6a4f]" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase">Wildlife Observations</span>
              <p className="text-2xl font-extrabold text-[#1b4332] mt-1">{user.wildlifeObservedCount} <span className="text-sm font-normal">verified</span></p>
            </div>
            <p className="text-[11px] text-emerald-600 mt-2 font-medium">Langurs, Hornbills & More</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#fff3cd] text-[#856404] flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-[#d97706]" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase">Clean Energy Credits</span>
              <p className="text-2xl font-extrabold text-[#1b4332] mt-1">{user.cleanEnergyCreditsKwh} <span className="text-sm font-normal">kWh</span></p>
            </div>
            <p className="text-[11px] text-amber-600 mt-2 font-medium">Solar & Transit Offsets</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center mb-3">
              <Trees className="w-5 h-5 text-[#0284c7]" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase">Native Saplings Planted</span>
              <p className="text-2xl font-extrabold text-[#1b4332] mt-1">{user.treesPlanted} <span className="text-sm font-normal">trees</span></p>
            </div>
            <p className="text-[11px] text-sky-600 mt-2 font-medium">Mao Watershed & Terraces</p>
          </div>

        </div>
      </section>

      {/* 3. Achievements & Digital Badges Gallery */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1b4332] tracking-tight">Achievements & GMC Digital Credentials</h3>
            <p className="text-xs text-gray-500">Cryptographically verifiable credentials for mindful ecological action</p>
          </div>
          <span className="text-xs font-bold text-[#2d6a4f] bg-[#d8f3dc] px-3 py-1 rounded-full">
            {user.badges.filter(b => b.isUnlocked).length} of {user.badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.badges.map((badge) => {
            const isUnlocked = badge.isUnlocked;
            return (
              <div
                key={badge.id}
                onClick={() => {
                  playMindfulChime('bell');
                  setSelectedBadge(badge);
                }}
                className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-white border-[#52b788] shadow-sm hover:shadow-md hover:border-[#2d6a4f]'
                    : 'bg-gray-50 border-gray-200 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs ${
                      isUnlocked ? 'bg-[#d8f3dc] text-[#1b4332]' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {badge.category === 'river' ? '🌊' : badge.category === 'community' ? '🌱' : badge.category === 'wildlife' ? '🐾' : badge.category === 'energy' ? '⚡' : badge.category === 'waste' ? '♻️' : '✨'}
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      isUnlocked 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {badge.tier}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#1b4332]">{badge.name}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{badge.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  {isUnlocked ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-gray-500 font-semibold">{badge.sealCode}</span>
                      <span className="text-emerald-700 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                        <span>Progress</span>
                        <span>{badge.progress} / {badge.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#2d6a4f] h-full rounded-full"
                          style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Personal Activity Chronology */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1b4332] tracking-tight">Your Stewardship Log</h3>
            <p className="text-xs text-gray-500">Chronological history of observations and actions submitted</p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-bold text-xs shadow-xs"
          >
            + New Log
          </button>
        </div>

        <div className="space-y-3">
          {userReports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5">
                {report.photoUrl && (
                  <img
                    src={report.photoUrl}
                    alt={report.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                  />
                )}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded bg-[#d8f3dc] text-[#1b4332]">
                      {report.category}
                    </span>
                    <span className="text-[11px] text-gray-500">{report.timestamp}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1b4332]">{report.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#52b788]" />
                    <span>{report.locationName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#2d6a4f]">+{report.pointsAwarded} pts</span>
                  <p className={`text-[10px] font-semibold ${
                    report.status === 'resolved' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {report.status.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Badge Credential Inspection Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 text-center">
            
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Seal Graphic */}
            <div className="w-20 h-20 mx-auto rounded-full bg-[#d8f3dc] border-4 border-[#52b788] flex items-center justify-center text-3xl shadow-md">
              {selectedBadge.category === 'river' ? '🌊' : selectedBadge.category === 'community' ? '🌱' : '🐾'}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#2d6a4f] bg-[#e8f5e9] px-2.5 py-1 rounded-full">
                GMC Sovereign Digital Credential
              </span>
              <h3 className="text-xl font-extrabold text-[#1b4332] pt-1">{selectedBadge.name}</h3>
              <p className="text-xs text-gray-600 leading-relaxed px-4">{selectedBadge.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8f9f6] border border-gray-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Credential Holder:</span>
                <span className="font-bold text-[#1b4332]">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tier:</span>
                <span className="font-bold text-[#2d6a4f] uppercase">{selectedBadge.tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Verification Seal:</span>
                <span className="font-mono font-bold text-gray-800">{selectedBadge.sealCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold text-emerald-600">{selectedBadge.isUnlocked ? 'Active & Cryptographically Verified' : 'In Progress'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleShareCertificate(selectedBadge)}
                className="flex-1 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>{certificateCopied ? 'Copied Verification Link!' : 'Share Credential'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

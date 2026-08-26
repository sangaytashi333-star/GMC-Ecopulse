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
  Flame,
  Edit3,
  Mail,
  Compass,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Badge, CitizenReport } from '../types';
import { playMindfulChime } from '../utils/audio';

interface StewardshipProfileProps {
  user: UserProfile;
  userReports: CitizenReport[];
  onOpenReportModal: () => void;
  onUpdateProfile?: (updatedUser: Partial<UserProfile>) => void;
}

export const StewardshipProfile: React.FC<StewardshipProfileProps> = ({
  user,
  userReports,
  onOpenReportModal,
  onUpdateProfile,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [certificateCopied, setCertificateCopied] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editBio, setEditBio] = useState(user.bio || 'Dedicated citizen steward contributing to Bhutan’s mindfulness ecological vision in Gelephu.');
  const [editSpecialty, setEditSpecialty] = useState(user.specialty || 'Golden Langur Habitat Monitor & Watershed Steward');
  const [editSector, setEditSector] = useState(user.preferredSector || 'Sector 3: Phibsoo Wildlife Buffer & Elephant Highway');

  // Keep synced with current user profile
  React.useEffect(() => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditBio(user.bio || 'Dedicated citizen steward contributing to Bhutan’s mindfulness ecological vision in Gelephu.');
    setEditSpecialty(user.specialty || 'Golden Langur Habitat Monitor & Watershed Steward');
    setEditSector(user.preferredSector || 'Sector 3: Phibsoo Wildlife Buffer & Elephant Highway');
  }, [user]);

  // Next level math
  const currentLevelMin = 1000;
  const nextLevelTarget = 2000;
  const progressPercent = Math.min(100, Math.round(((user.totalKarmaPoints - currentLevelMin) / (nextLevelTarget - currentLevelMin)) * 100));

  const getInitials = (fullName: string) => {
    if (!fullName || typeof fullName !== 'string') return 'ST';
    const clean = fullName.trim();
    if (!clean) return 'ST';
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleShareCertificate = (badge: Badge) => {
    navigator.clipboard.writeText(
      `Verified GMC Ecological Credential: ${badge.name} | Seal: ${badge.sealCode} | Awarded to ${user.name} for exemplary Himalayan stewardship.`
    );
    setCertificateCopied(true);
    confetti({ particleCount: 40, spread: 40, origin: { y: 0.8 } });
    playMindfulChime('badge');
    setTimeout(() => setCertificateCopied(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName.trim() || user.name,
        email: editEmail.trim() || user.email,
        bio: editBio.trim(),
        specialty: editSpecialty.trim(),
        preferredSector: editSector
      });
    }
    playMindfulChime('karma');
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-16 sm:pb-8">
      
      {/* 1. Steward Identity & Level Progression Card */}
      <div className="p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1b4332] text-white shadow-lg border border-[#52b788]/30 relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-[#52b788]/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Avatar & Rank */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#52b788] to-[#d8f3dc] p-1 shadow-md">
                <div className="w-full h-full rounded-[14px] bg-[#1b4332] flex items-center justify-center text-xl sm:text-2xl font-extrabold text-[#d8f3dc]">
                  {getInitials(user.name)}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-[#52b788] text-[#081c15] font-extrabold text-[10px] rounded-full border border-white">
                Lvl {user.levelNumber}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">{user.name}</h2>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  user.role === 'admin' || user.role === 'official'
                    ? 'bg-[#e07a5f]/20 text-[#f4a261] border-[#e07a5f]/40'
                    : 'bg-[#52b788]/20 text-[#d8f3dc] border-[#52b788]/40'
                }`}>
                  {user.role === 'admin' || user.role === 'official' ? '🛡️ GMC Official' : '🌿 Verified Citizen'}
                </span>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#d8f3dc] text-[11px] font-semibold transition flex items-center space-x-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Profile</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#74c69d]">{user.levelTitle}</p>
              <p className="text-[11px] text-[#d8f3dc]/70 flex items-center gap-1.5 flex-wrap">
                <Mail className="w-3 h-3 opacity-80" />
                <span>{user.email}</span>
                <span>•</span>
                <span>Member since {user.joinedDate}</span>
                <span>•</span>
                <span>{user.currentStreakDays} Days Streak 🔥</span>
              </p>
              {user.specialty && (
                <p className="text-[11px] text-[#95d5b2] font-medium pt-0.5">
                  Focus: {user.specialty}
                </p>
              )}
            </div>
          </div>

          {/* Karma Score Pill Boxes */}
          <div className="flex items-center space-x-3 sm:space-x-4 self-stretch sm:self-auto justify-between sm:justify-start">
            
            <div className="flex-1 sm:flex-initial p-3 sm:p-3.5 rounded-2xl bg-[#081c15]/60 border border-[#52b788]/30 text-center min-w-[100px] sm:min-w-[110px]">
              <span className="block text-[9px] sm:text-[10px] font-bold uppercase text-[#d8f3dc]/70">Spendable Karma</span>
              <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-[#74c69d]">{user.spendablePoints}</span>
                <span className="text-[10px] text-[#d8f3dc]/70">pts</span>
              </div>
            </div>

            <div className="flex-1 sm:flex-initial p-3 sm:p-3.5 rounded-2xl bg-[#52b788]/20 border border-[#52b788]/40 text-center min-w-[100px] sm:min-w-[110px]">
              <span className="block text-[9px] sm:text-[10px] font-bold uppercase text-[#d8f3dc]/70">Lifetime Prestige</span>
              <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">{user.totalKarmaPoints}</span>
                <span className="text-[10px] text-[#d8f3dc]/70">pts</span>
              </div>
            </div>

          </div>

        </div>

        {/* Bio / Mindful Commitment */}
        {user.bio && (
          <div className="mt-4 p-3 rounded-xl bg-black/20 border border-[#52b788]/20 text-xs text-[#d8f3dc]/90 italic">
            "{user.bio}"
          </div>
        )}

        {/* Level Progress Bar */}
        <div className="mt-6 pt-4 border-t border-[#52b788]/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#d8f3dc]/80 font-semibold truncate pr-2">
              Rank: <strong className="text-white">{user.levelTitle}</strong>
            </span>
            <span className="text-[#74c69d] font-bold shrink-0 text-right">
              {user.totalKarmaPoints} / {nextLevelTarget} pts to Lvl 5
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

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-[#d8f3dc] text-[#1b4332]">
                  <Edit3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[#1b4332]">Edit Citizen Profile</h3>
                  <p className="text-xs text-gray-500">Update your verified steward credentials and focus areas</p>
                </div>
              </div>
              <button onClick={() => setIsEditingProfile(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1b4332] mb-1">Full Citizen Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#2d6a4f] focus:outline-none"
                  placeholder="Your full name (e.g. Sangay Tashi)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#2d6a4f] focus:outline-none"
                  placeholder="sangaytashi.333@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] mb-1">Stewardship Specialty / Ecological Focus</label>
                <input
                  type="text"
                  value={editSpecialty}
                  onChange={(e) => setEditSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#2d6a4f] focus:outline-none"
                  placeholder="e.g. Golden Langur Habitat Monitor & Watershed Steward"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] mb-1">Primary Residing Sector</label>
                <select
                  value={editSector}
                  onChange={(e) => setEditSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] bg-white focus:outline-none"
                >
                  <option value="Sector 1: Mindfulness Spine & Central Bridge">Sector 1: Mindfulness Spine & Central Bridge</option>
                  <option value="Sector 2: Mao River Watershed & Riparian Buffer">Sector 2: Mao River Watershed & Riparian Buffer</option>
                  <option value="Sector 3: Phibsoo Wildlife Buffer & Elephant Highway">Sector 3: Phibsoo Wildlife Buffer & Elephant Highway</option>
                  <option value="Sector 4: Agri-Tech & Permaculture Terraces">Sector 4: Agri-Tech & Permaculture Terraces</option>
                  <option value="Sector 5: Eco-Tech Innovation Gate & Clean Logistics">Sector 5: Eco-Tech Innovation Gate & Clean Logistics</option>
                  <option value="Sector 6: Sarpang Dzongkhag Heritage Forest">Sector 6: Sarpang Dzongkhag Heritage Forest</option>
                  <option value="Sector 7: Royal Manas Biological Foothills">Sector 7: Royal Manas Biological Foothills</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] mb-1">Stewardship Bio & Mindful Intention</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:border-[#2d6a4f] focus:outline-none"
                  placeholder="Describe your environmental mission in GMC..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] text-xs font-extrabold shadow-md flex items-center space-x-1.5 min-h-[44px]"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 2. Lifetime Impact Metrics Grid */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#1b4332] tracking-tight">Verified Lifetime Ecological Impact</h3>
          <p className="text-xs text-gray-500">Your direct physical contribution to Gelephu's urban and natural ecosystem</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e8f5e9] text-[#2d6a4f] flex items-center justify-center mb-2 sm:mb-3">
              <Recycle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Circular Waste</span>
              <p className="text-lg sm:text-2xl font-extrabold text-[#1b4332] mt-0.5 sm:mt-1">{user.wasteRemovedKg} <span className="text-xs font-normal">kg</span></p>
            </div>
            <p className="text-[10px] text-emerald-600 mt-1 font-medium truncate">Compost & Biogas</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center mb-2 sm:mb-3">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#2d6a4f]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Wildlife Sightings</span>
              <p className="text-lg sm:text-2xl font-extrabold text-[#1b4332] mt-0.5 sm:mt-1">{user.wildlifeObservedCount} <span className="text-xs font-normal">verified</span></p>
            </div>
            <p className="text-[10px] text-emerald-600 mt-1 font-medium truncate">Langurs & Hornbills</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#fff3cd] text-[#856404] flex items-center justify-center mb-2 sm:mb-3">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#d97706]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Clean Energy</span>
              <p className="text-lg sm:text-2xl font-extrabold text-[#1b4332] mt-0.5 sm:mt-1">{user.cleanEnergyCreditsKwh} <span className="text-xs font-normal">kWh</span></p>
            </div>
            <p className="text-[10px] text-amber-600 mt-1 font-medium truncate">Solar Offsets</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center mb-2 sm:mb-3">
              <Trees className="w-4 h-4 sm:w-5 sm:h-5 text-[#0284c7]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Trees Planted</span>
              <p className="text-lg sm:text-2xl font-extrabold text-[#1b4332] mt-0.5 sm:mt-1">{user.treesPlanted} <span className="text-xs font-normal">trees</span></p>
            </div>
            <p className="text-[10px] text-sky-600 mt-1 font-medium truncate">Mao Watershed</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {user.badges.map((badge) => {
            const isUnlocked = badge.isUnlocked;
            return (
              <div
                key={badge.id}
                onClick={() => {
                  playMindfulChime('bell');
                  setSelectedBadge(badge);
                }}
                className={`p-4 sm:p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between min-h-[160px] ${
                  isUnlocked
                    ? 'bg-white border-[#52b788] shadow-xs hover:shadow-md hover:border-[#2d6a4f]'
                    : 'bg-gray-50 border-gray-200 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-xs ${
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
                    <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 leading-relaxed line-clamp-2">{badge.description}</p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-100">
                  {isUnlocked ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-gray-500 font-semibold">{badge.sealCode}</span>
                      <span className="text-emerald-700 font-bold flex items-center space-x-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500">
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
            className="px-3.5 py-2 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-bold text-xs shadow-xs min-h-[44px] flex items-center"
          >
            + New Log
          </button>
        </div>

        <div className="space-y-3">
          {userReports.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-gray-200 text-center space-y-2">
              <span className="text-3xl">🌿</span>
              <h4 className="text-sm font-bold text-[#1b4332]">No reports filed yet</h4>
              <p className="text-xs text-gray-500">Start logging wildlife sightings, river clarity, or waste pickups to earn Karma.</p>
              <button
                onClick={onOpenReportModal}
                className="mt-2 px-4 py-2 bg-[#2d6a4f] text-white rounded-xl text-xs font-bold"
              >
                Log First Observation
              </button>
            </div>
          ) : (
            userReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  {report.photoUrl && (
                    <img
                      src={report.photoUrl}
                      alt={report.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                  )}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded bg-[#d8f3dc] text-[#1b4332]">
                        {report.category}
                      </span>
                      <span className="text-[11px] text-gray-500">{report.timestamp}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#1b4332] truncate">{report.title}</h4>
                    <p className="text-xs text-gray-500 flex items-center space-x-1 truncate">
                      <MapPin className="w-3 h-3 text-[#52b788] shrink-0" />
                      <span className="truncate">{report.locationName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-extrabold text-[#2d6a4f]">+{report.pointsAwarded} pts</span>
                    <p className={`text-[10px] font-semibold ${
                      report.status === 'resolved' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {report.status.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Badge Credential Inspection Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 text-center">
            
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                className="flex-1 py-3 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-1.5 min-h-[48px]"
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


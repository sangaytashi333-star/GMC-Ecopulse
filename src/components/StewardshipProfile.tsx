import React, { useState, useRef, useMemo } from 'react';
import { 
  Award, 
  Sparkles, 
  Trees, 
  Waves, 
  Recycle, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Share2, 
  X,
  Edit3,
  Mail,
  Camera,
  Upload,
  Trash2,
  Check,
  Flame,
  Crown,
  Lock,
  Compass,
  Filter,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Badge, CitizenReport, BadgeCategory } from '../types';
import { playMindfulChime } from '../utils/audio';
import { computeUserBadges, getTierColorClasses, getTierMedalSymbol, ALL_BADGE_DEFINITIONS } from '../utils/badgeSystem';

interface StewardshipProfileProps {
  user: UserProfile;
  userReports: CitizenReport[];
  onOpenReportModal: () => void;
  onUpdateProfile?: (updatedUser: Partial<UserProfile>) => void;
}

const PRESET_AVATARS = [
  { id: 'av-forest', label: 'Forest Steward', emoji: '🌲', bg: 'bg-[#1E4D3B]' },
  { id: 'av-mountain', label: 'Himalayan Guardian', emoji: '🏔️', bg: 'bg-[#2d6a4f]' },
  { id: 'av-langur', label: 'Langur Sentinel', emoji: '🐒', bg: 'bg-[#9B6F47]' },
  { id: 'av-river', label: 'Mao Watershed', emoji: '🌊', bg: 'bg-[#0369a1]' },
  { id: 'av-sun', label: 'Solar Luminary', emoji: '☀️', bg: 'bg-[#b45309]' },
  { id: 'av-lotus', label: '108 Mindfulness', emoji: '🪷', bg: 'bg-[#701a75]' },
  { id: 'av-leaf', label: 'Permaculture Scout', emoji: '🌿', bg: 'bg-[#15803d]' },
  { id: 'av-hornbill', label: 'Great Hornbill', emoji: '🦅', bg: 'bg-[#1e293b]' }
];

export const StewardshipProfile: React.FC<StewardshipProfileProps> = ({
  user,
  userReports,
  onOpenReportModal,
  onUpdateProfile,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [certificateCopied, setCertificateCopied] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<BadgeCategory>('all');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [customPhotoPreview, setCustomPhotoPreview] = useState<string | null>(user.avatarUrl || null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editBio, setEditBio] = useState(user.bio || 'Dedicated citizen steward contributing to Bhutan’s mindfulness ecological vision in Gelephu.');
  const [editSpecialty, setEditSpecialty] = useState(user.specialty || 'Golden Langur Habitat Monitor & Watershed Steward');
  const [editSector, setEditSector] = useState(user.preferredSector || 'Sector 3: Phibsoo Wildlife Buffer & Elephant Highway');

  // Compute live badges based on latest user stats
  const computedBadges = useMemo(() => {
    return computeUserBadges(user);
  }, [user]);

  // Keep synced with current user profile
  React.useEffect(() => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditBio(user.bio || 'Dedicated citizen steward contributing to Bhutan’s mindfulness ecological vision in Gelephu.');
    setEditSpecialty(user.specialty || 'Golden Langur Habitat Monitor & Watershed Steward');
    setEditSector(user.preferredSector || 'Sector 3: Phibsoo Wildlife Buffer & Elephant Highway');
    setCustomPhotoPreview(user.avatarUrl || null);
  }, [user]);

  // Next level math
  const currentLevelMin = 1000;
  const nextLevelTarget = 2000;
  const progressPercent = Math.min(100, Math.round(((user.totalKarmaPoints - currentLevelMin) / (nextLevelTarget - currentLevelMin)) * 100));

  // Pinned badge object
  const pinnedBadge = useMemo(() => {
    if (!user.pinnedBadgeId) return null;
    return computedBadges.find(b => b.id === user.pinnedBadgeId) || null;
  }, [user.pinnedBadgeId, computedBadges]);

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
      `Verified GMC Ecological Credential: ${badge.name} (${badge.tier.toUpperCase()}) | Seal: ${badge.sealCode} | Awarded to ${user.name} for exemplary Himalayan stewardship.`
    );
    setCertificateCopied(true);
    confetti({ particleCount: 45, spread: 50, origin: { y: 0.75 } });
    playMindfulChime('badge');
    setTimeout(() => setCertificateCopied(false), 2500);
  };

  const handleTogglePinBadge = (badge: Badge) => {
    if (!badge.isUnlocked) return;
    const nextPinnedId = user.pinnedBadgeId === badge.id ? undefined : badge.id;
    if (onUpdateProfile) {
      onUpdateProfile({ pinnedBadgeId: nextPinnedId });
    }
    playMindfulChime('badge');
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
  };

  // Image upload handling
  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    // Limit size to ~5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCustomPhotoPreview(dataUrl);
      if (onUpdateProfile) {
        onUpdateProfile({ avatarUrl: dataUrl });
      }
      playMindfulChime('karma');
      confetti({ particleCount: 35, spread: 45, origin: { y: 0.85 } });
      setIsPhotoModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setCustomPhotoPreview(null);
    if (onUpdateProfile) {
      onUpdateProfile({ avatarUrl: undefined });
    }
    setIsPhotoModalOpen(false);
    playMindfulChime('bell');
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

  // Filtered badges
  const filteredBadges = useMemo(() => {
    if (activeCategoryFilter === 'all') return computedBadges;
    return computedBadges.filter(b => b.category === activeCategoryFilter);
  }, [computedBadges, activeCategoryFilter]);

  const unlockedCount = computedBadges.filter(b => b.isUnlocked).length;
  const totalCount = computedBadges.length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-16 sm:pb-8">
      
      {/* Hidden File Input for Direct Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0]);
          }
        }}
        accept="image/*"
        className="hidden"
      />

      {/* 1. Steward Identity & Level Progression Card */}
      <div className="p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1E4D3B] via-[#2E7D58] to-[#1E4D3B] text-white shadow-xl border border-[#DCC79A]/30 relative overflow-hidden">
        
        {/* Subtle Background Glows */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-[#DCC79A]/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#6FB68D]/15 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Avatar & Rank with Photo Upload Trigger */}
          <div className="flex items-start sm:items-center space-x-4">
            
            <div className="relative shrink-0 group">
              <div 
                onClick={() => setIsPhotoModalOpen(true)}
                title="Click to change profile picture"
                className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-[#DCC79A] via-[#6FB68D] to-white p-1 shadow-lg cursor-pointer transition-transform group-hover:scale-105"
              >
                <div className="w-full h-full rounded-[14px] bg-[#1E4D3B] flex items-center justify-center relative overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl font-extrabold text-[#F4E9D4]">
                      {getInitials(user.name)}
                    </span>
                  )}

                  {/* Hover Camera Icon Overlay */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-[#DCC79A]" />
                    <span className="text-[9px] font-bold mt-0.5 text-[#F4E9D4]">Change</span>
                  </div>
                </div>
              </div>

              {/* Level Badge Pill */}
              <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 bg-[#DCC79A] text-[#1E4D3B] font-extrabold text-[10px] rounded-full border border-white shadow-md">
                Lvl {user.levelNumber}
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate max-w-[280px] sm:max-w-none">
                  {user.name}
                </h2>
                
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-xs ${
                  user.role === 'admin' || user.role === 'official'
                    ? 'bg-[#9B6F47]/30 text-[#F4E9D4] border-[#DCC79A]/40'
                    : 'bg-[#2E7D58]/40 text-[#F4E9D4] border-[#DCC79A]/30'
                }`}>
                  {user.role === 'admin' || user.role === 'official' ? '🛡️ GMC Official' : '🌿 Verified Citizen Steward'}
                </span>

                <button
                  id="btn-edit-profile"
                  onClick={() => setIsEditingProfile(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#F4E9D4] text-[11px] font-semibold transition flex items-center space-x-1 border border-white/20"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Profile</span>
                </button>

                <button
                  id="btn-change-avatar"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#DCC79A]/20 hover:bg-[#DCC79A]/30 text-[#F4E9D4] text-[11px] font-semibold transition flex items-center space-x-1 border border-[#DCC79A]/40"
                >
                  <Camera className="w-3 h-3 text-[#DCC79A]" />
                  <span>Photo</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <p className="text-xs sm:text-sm font-semibold text-[#DCC79A]">{user.levelTitle}</p>
                {pinnedBadge && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#1E4D3B]/80 border border-[#DCC79A]/50 text-[10px] font-bold text-[#F4E9D4]">
                    <span>{getTierMedalSymbol(pinnedBadge.tier)}</span>
                    <span>Pinned: {pinnedBadge.name}</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#F4E9D4]/80 flex items-center gap-1.5 flex-wrap">
                <Mail className="w-3 h-3 opacity-80" />
                <span>{user.email}</span>
                <span>•</span>
                <span>Member since {user.joinedDate}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-amber-300 font-semibold">
                  <Flame className="w-3 h-3 text-amber-400" />
                  {user.currentStreakDays} Days Streak
                </span>
              </p>

              {user.specialty && (
                <p className="text-[11px] text-[#6FB68D] font-medium pt-0.5 truncate">
                  Focus: {user.specialty}
                </p>
              )}
            </div>
          </div>

          {/* Karma Score Pill Boxes */}
          <div className="flex items-center space-x-3 sm:space-x-4 self-stretch sm:self-auto justify-between sm:justify-start">
            
            <div className="flex-1 sm:flex-initial p-3 sm:p-3.5 rounded-2xl bg-[#081c15]/60 border border-[#DCC79A]/30 text-center min-w-[105px] sm:min-w-[120px] backdrop-blur-sm">
              <span className="block text-[9px] sm:text-[10px] font-bold uppercase text-[#F4E9D4]/70">Spendable Karma</span>
              <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-[#DCC79A]">{user.spendablePoints}</span>
                <span className="text-[10px] text-[#F4E9D4]/70">pts</span>
              </div>
            </div>

            <div className="flex-1 sm:flex-initial p-3 sm:p-3.5 rounded-2xl bg-[#1E4D3B]/70 border border-[#DCC79A]/50 text-center min-w-[105px] sm:min-w-[120px] backdrop-blur-sm">
              <span className="block text-[9px] sm:text-[10px] font-bold uppercase text-[#F4E9D4]/70">Lifetime Prestige</span>
              <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">{user.totalKarmaPoints}</span>
                <span className="text-[10px] text-[#F4E9D4]/70">pts</span>
              </div>
            </div>

          </div>

        </div>

        {/* Bio / Mindful Commitment */}
        {user.bio && (
          <div className="mt-4 p-3 rounded-xl bg-black/25 border border-[#DCC79A]/20 text-xs text-[#F4E9D4]/90 italic leading-relaxed">
            "{user.bio}"
          </div>
        )}

        {/* Level Progress Bar */}
        <div className="mt-5 pt-4 border-t border-[#DCC79A]/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#F4E9D4]/80 font-semibold truncate pr-2">
              Current Rank: <strong className="text-white">{user.levelTitle}</strong>
            </span>
            <span className="text-[#DCC79A] font-bold shrink-0 text-right">
              {user.totalKarmaPoints} / {nextLevelTarget} pts to Lvl {user.levelNumber + 1}
            </span>
          </div>

          <div className="w-full bg-[#081c15]/70 h-2.5 rounded-full overflow-hidden p-0.5 border border-[#DCC79A]/30">
            <div
              className="bg-gradient-to-r from-[#6FB68D] via-[#DCC79A] to-[#ebd7ab] h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Photo Upload & Custom Avatar Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#081c15]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-gray-200 space-y-5 my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-[#F4E9D4] text-[#1E4D3B]">
                  <Camera className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[#1E4D3B]">Profile Picture</h3>
                  <p className="text-xs text-gray-500">Upload your real photo or select a mindful avatar</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPhotoModalOpen(false)} 
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Preview */}
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <div className="w-24 h-24 rounded-full border-4 border-[#DCC79A] p-0.5 shadow-md overflow-hidden bg-[#1E4D3B] flex items-center justify-center">
                {customPhotoPreview ? (
                  <img
                    src={customPhotoPreview}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-[#F4E9D4]">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium">Active Profile Image</span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => modalFileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                isDraggingOver
                  ? 'border-[#2E7D58] bg-[#6FB68D]/10 scale-[1.01]'
                  : 'border-gray-300 hover:border-[#1E4D3B] bg-gray-50/70 hover:bg-gray-50'
              }`}
            >
              <input
                type="file"
                ref={modalFileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-2 text-xs">
                <div className="w-10 h-10 rounded-full bg-[#1E4D3B]/10 text-[#1E4D3B] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="font-bold text-[#1E4D3B]">
                  Click to select photo or drag & drop here
                </p>
                <p className="text-[11px] text-gray-500">Supports JPG, PNG, WebP up to 5MB</p>
              </div>
            </div>

            {/* Mindful Presets Grid */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-[#1E4D3B]">Or choose a mindful emblem preset</label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      // Generate a simple emoji data avatar URL or reset photo
                      const canvas = document.createElement('canvas');
                      canvas.width = 120;
                      canvas.height = 120;
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.fillStyle = '#1E4D3B';
                        ctx.fillRect(0, 0, 120, 120);
                        ctx.font = '60px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(preset.emoji, 60, 65);
                        const dataUrl = canvas.toDataURL('image/png');
                        setCustomPhotoPreview(dataUrl);
                        if (onUpdateProfile) {
                          onUpdateProfile({ avatarUrl: dataUrl });
                        }
                        playMindfulChime('badge');
                        setIsPhotoModalOpen(false);
                      }
                    }}
                    className="p-2.5 rounded-xl border border-gray-200 hover:border-[#1E4D3B] bg-white hover:bg-[#F4E9D4]/30 flex flex-col items-center justify-center space-y-1 transition text-center"
                  >
                    <span className="text-xl">{preset.emoji}</span>
                    <span className="text-[9px] font-semibold text-gray-700 truncate w-full">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              {user.avatarUrl ? (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#1E4D3B] hover:bg-[#2E7D58] text-white text-xs font-bold shadow-md"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#081c15]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-gray-200 space-y-5 max-h-[92vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-[#F4E9D4] text-[#1E4D3B]">
                  <Edit3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[#1E4D3B]">Edit Citizen Profile</h3>
                  <p className="text-xs text-gray-500">Update your verified steward credentials and focus areas</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditingProfile(false)} 
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Photo Avatar Quick Trigger inside Edit */}
              <div className="flex items-center space-x-4 p-3 rounded-2xl bg-[#F8F5ED] border border-[#DCC79A]/40">
                <div className="w-14 h-14 rounded-2xl bg-[#1E4D3B] p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-[#F4E9D4]">{getInitials(user.name)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1E4D3B]">Profile Avatar</p>
                  <p className="text-[11px] text-gray-500">Displayed on verified reports and certificates</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#1E4D3B] text-xs font-semibold text-[#1E4D3B] shadow-xs"
                >
                  Upload New
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E4D3B] mb-1">Full Citizen Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#2E7D58] focus:outline-none"
                  placeholder="Your full name (e.g. Sangay Tashi)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E4D3B] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#2E7D58] focus:outline-none"
                  placeholder="sangaytashi.333@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E4D3B] mb-1">Stewardship Specialty / Ecological Focus</label>
                <input
                  type="text"
                  value={editSpecialty}
                  onChange={(e) => setEditSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#2E7D58] focus:outline-none"
                  placeholder="e.g. Golden Langur Habitat Monitor & Watershed Steward"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E4D3B] mb-1">Primary Residing Sector</label>
                <select
                  value={editSector}
                  onChange={(e) => setEditSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1E4D3B] bg-white focus:outline-none"
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
                <label className="block text-xs font-bold text-[#1E4D3B] mb-1">Stewardship Bio & Mindful Intention</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1E4D3B] focus:border-[#2E7D58] focus:outline-none leading-relaxed"
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
                  className="px-5 py-2.5 rounded-xl bg-[#1E4D3B] hover:bg-[#2E7D58] text-[#F4E9D4] text-xs font-extrabold shadow-md flex items-center space-x-1.5 min-h-[44px]"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 4. Lifetime Impact Metrics Grid */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#1E4D3B] tracking-tight">Verified Lifetime Ecological Impact</h3>
          <p className="text-xs text-gray-500">Your direct physical contribution to Gelephu's urban and natural ecosystem</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-[#2E7D58]/40 transition">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e8f5e9] text-[#2E7D58] flex items-center justify-center mb-2 sm:mb-3">
              <Recycle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Circular Waste</span>
              <p className="text-lg sm:text-2xl font-extrabold text-[#1E4D3B] mt-0.5 sm:mt-1">{user.wasteRemovedKg} <span className="text-xs font-normal">kg</span></p>
            </div>
            <p className="text-[10px] text-emerald-600 mt-1 font-medium truncate">Waste Warrior Tier</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-[#2E7D58]/40 transition">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#d8f3dc] text-[#1E4D3B] flex items-center justify-center mb-2 sm:mb-3">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#2E7D58]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Wildlife Sightings</span>
              <p className="text-lg sm:text-2xl font-extrabold text-[#1E4D3B] mt-0.5 sm:mt-1">{user.wildlifeObservedCount} <span className="text-xs font-normal">verified</span></p>
            </div>
            <p className="text-[10px] text-emerald-600 mt-1 font-medium truncate">Langur Protector</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-[#2E7D58]/40 transition">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#fff3cd] text-[#856404] flex items-center justify-center mb-2 sm:mb-3">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#d97706]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Clean Energy</span>
              <p className="text-lg sm:text-2xl font-extrabold text-[#1E4D3B] mt-0.5 sm:mt-1">{user.cleanEnergyCreditsKwh} <span className="text-xs font-normal">kWh</span></p>
            </div>
            <p className="text-[10px] text-amber-600 mt-1 font-medium truncate">Breathkeeper Tier</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-[#2E7D58]/40 transition">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center mb-2 sm:mb-3">
              <Trees className="w-4 h-4 sm:w-5 sm:h-5 text-[#0284c7]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase">Trees Planted</span>
              <p className="text-lg sm:text-2xl font-extrabold text-[#1E4D3B] mt-0.5 sm:mt-1">{user.treesPlanted} <span className="text-xs font-normal">trees</span></p>
            </div>
            <p className="text-[10px] text-sky-600 mt-1 font-medium truncate">Forest Guardian Tier</p>
          </div>

        </div>
      </section>

      {/* 5. Achievements & GMC Digital Medals Gallery */}
      <section className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#DCC79A]" />
              <h3 className="text-lg font-bold text-[#1E4D3B] tracking-tight">
                Achievement Medals & GMC Digital Credentials
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              Verified medals based on Karma milestones and domain contributions (Forest Guardian, Waste Warrior, etc.)
            </p>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-extrabold text-[#1E4D3B] bg-[#DCC79A]/30 border border-[#DCC79A]/60 px-3 py-1 rounded-full shadow-xs">
              {unlockedCount} of {totalCount} Medals Unlocked 🎖️
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none pt-1">
          {[
            { id: 'all' as BadgeCategory, label: '🌟 All Medals' },
            { id: 'karma' as BadgeCategory, label: '🏆 Karma Milestones' },
            { id: 'forest' as BadgeCategory, label: '🌲 Forest Guardian' },
            { id: 'waste' as BadgeCategory, label: '🛡️ Waste Warrior' },
            { id: 'wildlife' as BadgeCategory, label: '🐾 Wildlife Sentinel' },
            { id: 'river' as BadgeCategory, label: '🌊 Watershed' },
            { id: 'energy' as BadgeCategory, label: '⚡ Clean Energy' },
            { id: 'resolution' as BadgeCategory, label: '🎯 Civic Resolver' },
          ].map((cat) => {
            const isActive = activeCategoryFilter === cat.id;
            const count = cat.id === 'all' 
              ? computedBadges.length 
              : computedBadges.filter(b => b.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategoryFilter(cat.id);
                  playMindfulChime('bell');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 min-h-[38px] ${
                  isActive
                    ? 'bg-[#1E4D3B] text-[#F4E9D4] shadow-md border border-[#DCC79A]/50'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                  isActive ? 'bg-[#DCC79A] text-[#1E4D3B]' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Medals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = badge.isUnlocked;
            const tierStyle = getTierColorClasses(badge.tier, isUnlocked);
            const medalSymbol = getTierMedalSymbol(badge.tier);
            const isPinned = user.pinnedBadgeId === badge.id;

            return (
              <div
                key={badge.id}
                onClick={() => {
                  playMindfulChime(isUnlocked ? 'badge' : 'bell');
                  setSelectedBadge(badge);
                }}
                className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between min-h-[190px] relative overflow-hidden group ${
                  isUnlocked
                    ? `${tierStyle.cardBg} ${tierStyle.border} ${tierStyle.glow} shadow-sm hover:shadow-lg hover:scale-[1.01]`
                    : 'bg-gray-50/90 border-gray-200 opacity-75 hover:opacity-100'
                }`}
              >
                
                {/* Decorative Rosette Ribbon on Top Right */}
                <div className="absolute top-0 right-0">
                  <div className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-bl-2xl shadow-xs flex items-center space-x-1 bg-gradient-to-r ${tierStyle.ribbonBg}`}>
                    <span>{medalSymbol}</span>
                    <span>{badge.tier}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  
                  {/* Icon & Category */}
                  <div className="flex items-start space-x-3 pr-16">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${
                      isUnlocked ? 'bg-white border-[#DCC79A]' : 'bg-gray-200 border-gray-300'
                    }`}>
                      {badge.category === 'river' ? '🌊' : 
                       badge.category === 'forest' ? '🌲' : 
                       badge.category === 'waste' ? '♻️' : 
                       badge.category === 'wildlife' ? '🐾' : 
                       badge.category === 'energy' ? '⚡' : 
                       badge.category === 'resolution' ? '🎯' : 
                       badge.category === 'karma' ? '🏆' : '✨'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                          {badge.category}
                        </span>
                        {isPinned && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#1E4D3B] text-[#F4E9D4] text-[9px] font-extrabold">
                            PINNED
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-[#1E4D3B] truncate">{badge.name}</h4>
                      {badge.rarity && (
                        <span className="text-[10px] font-semibold text-amber-700 block">
                          ✦ {badge.rarity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>

                  {/* Perk / Bonus */}
                  {badge.perk && (
                    <div className="px-2.5 py-1 rounded-xl bg-[#F8F5ED] border border-[#DCC79A]/30 text-[10px] text-[#1E4D3B] font-medium truncate">
                      🎁 <strong>Perk:</strong> {badge.perk}
                    </div>
                  )}

                </div>

                {/* Progress / Verified Footer */}
                <div className="mt-3.5 pt-3 border-t border-gray-100/80">
                  {isUnlocked ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-gray-500 font-semibold truncate max-w-[140px]">
                        {badge.sealCode}
                      </span>
                      <span className="text-[#1E4D3B] font-extrabold flex items-center space-x-1 text-[11px] bg-[#d8f3dc] px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D58]" />
                        <span>Verified</span>
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>Progress</span>
                        </span>
                        <span className="text-[#1E4D3B]">{badge.progress} / {badge.maxProgress} {badge.metricUnit || 'pts'}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#2E7D58] to-[#DCC79A] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (badge.progress / badge.maxProgress) * 100)}%` }}
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

      {/* 6. Personal Activity Chronology */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1E4D3B] tracking-tight">Your Stewardship Log</h3>
            <p className="text-xs text-gray-500">Chronological history of observations and actions submitted</p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-2 rounded-xl bg-[#1E4D3B] hover:bg-[#2E7D58] text-[#F4E9D4] font-bold text-xs shadow-md min-h-[44px] flex items-center space-x-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-[#DCC79A]" />
            <span>+ New Observation</span>
          </button>
        </div>

        <div className="space-y-3">
          {userReports.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-gray-200 text-center space-y-2">
              <span className="text-3xl">🌿</span>
              <h4 className="text-sm font-bold text-[#1E4D3B]">No reports filed yet</h4>
              <p className="text-xs text-gray-500">Start logging wildlife sightings, river clarity, or waste pickups to earn Karma.</p>
              <button
                onClick={onOpenReportModal}
                className="mt-2 px-4 py-2 bg-[#1E4D3B] text-white rounded-xl text-xs font-bold"
              >
                Log First Observation
              </button>
            </div>
          ) : (
            userReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:border-[#2E7D58]/40 transition"
              >
                <div className="flex items-start space-x-3.5">
                  {report.photoUrl && (
                    <img
                      src={report.photoUrl}
                      alt={report.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0 shadow-xs"
                    />
                  )}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#d8f3dc] text-[#1E4D3B]">
                        {report.category}
                      </span>
                      <span className="text-[11px] text-gray-500">{report.timestamp}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#1E4D3B] truncate">{report.title}</h4>
                    <p className="text-xs text-gray-500 flex items-center space-x-1 truncate">
                      <MapPin className="w-3 h-3 text-[#2E7D58] shrink-0" />
                      <span className="truncate">{report.locationName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-extrabold text-[#1E4D3B]">+{report.pointsAwarded} pts</span>
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

      {/* 7. Medal Credential Inspection & Share Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#081c15]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-5 text-center my-auto">
            
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sacred Medal Graphic */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#DCC79A] animate-pulse opacity-50" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1E4D3B] to-[#2E7D58] border-2 border-[#DCC79A] flex items-center justify-center text-3xl shadow-xl">
                {selectedBadge.category === 'river' ? '🌊' : 
                 selectedBadge.category === 'forest' ? '🌲' : 
                 selectedBadge.category === 'waste' ? '♻️' : 
                 selectedBadge.category === 'wildlife' ? '🐾' : 
                 selectedBadge.category === 'energy' ? '⚡' : 
                 selectedBadge.category === 'resolution' ? '🎯' : 
                 selectedBadge.category === 'karma' ? '🏆' : '✨'}
              </div>
              <span className="absolute -bottom-1 -right-1 text-2xl">
                {getTierMedalSymbol(selectedBadge.tier)}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#1E4D3B] bg-[#F4E9D4] px-3 py-1 rounded-full border border-[#DCC79A]/50">
                GMC Sovereign Ecological Credential
              </span>
              <h3 className="text-xl font-extrabold text-[#1E4D3B] pt-1.5">{selectedBadge.name}</h3>
              <p className="text-xs text-gray-600 leading-relaxed px-3">{selectedBadge.description}</p>
            </div>

            {selectedBadge.perk && (
              <div className="p-3 rounded-2xl bg-[#F8F5ED] border border-[#DCC79A]/40 text-xs text-[#1E4D3B] font-medium text-left">
                🎁 <strong>Unlocked Stewardship Perk:</strong>
                <p className="text-[11px] text-gray-600 mt-0.5">{selectedBadge.perk}</p>
              </div>
            )}

            {/* Credential Details Box */}
            <div className="p-4 rounded-2xl bg-[#f8f9f6] border border-gray-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Steward:</span>
                <span className="font-bold text-[#1E4D3B]">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Medal Tier:</span>
                <span className="font-bold text-[#2E7D58] uppercase flex items-center space-x-1">
                  <span>{getTierMedalSymbol(selectedBadge.tier)}</span>
                  <span>{selectedBadge.tier}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Progress:</span>
                <span className="font-bold text-gray-800">
                  {selectedBadge.progress} / {selectedBadge.maxProgress} {selectedBadge.metricUnit || 'pts'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cryptographic Seal:</span>
                <span className="font-mono font-bold text-[#1E4D3B]">{selectedBadge.sealCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`font-bold ${selectedBadge.isUnlocked ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedBadge.isUnlocked ? 'Active & Verifiable ✨' : 'In Progress (Locked)'}
                </span>
              </div>
              {selectedBadge.unlockedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Awarded On:</span>
                  <span className="font-semibold text-gray-700">{selectedBadge.unlockedAt}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              {selectedBadge.isUnlocked && (
                <button
                  type="button"
                  onClick={() => handleTogglePinBadge(selectedBadge)}
                  className={`w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border min-h-[46px] ${
                    user.pinnedBadgeId === selectedBadge.id
                      ? 'bg-[#1E4D3B] text-[#F4E9D4] border-[#DCC79A]'
                      : 'bg-white text-[#1E4D3B] border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Crown className="w-4 h-4 text-[#DCC79A]" />
                  <span>{user.pinnedBadgeId === selectedBadge.id ? 'Unpin from Header' : 'Pin to Profile'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleShareCertificate(selectedBadge)}
                className="flex-1 w-full py-3 rounded-xl bg-[#DCC79A] hover:bg-[#ebd7ab] text-[#1E4D3B] font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-1.5 min-h-[46px]"
              >
                <Share2 className="w-4 h-4 text-[#1E4D3B]" />
                <span>{certificateCopied ? 'Copied Verification Link!' : 'Share Credential'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

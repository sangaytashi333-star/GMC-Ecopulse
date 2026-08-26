import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ArrowUpRight, 
  Filter, 
  PlusCircle, 
  Trees, 
  Waves, 
  ShieldCheck, 
  Calendar,
  X,
  Crosshair,
  Hourglass,
  ShieldAlert,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Mission, Coordinates, UserProfile } from '../types';
import { GMC_SECTORS } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';
import { calculateDistanceKm, formatDistance } from '../utils/geo';

interface MissionsHubProps {
  missions: Mission[];
  user?: UserProfile;
  onJoinMission: (missionId: string) => void;
  onNavigateToMap: (sectorId?: string) => void;
  onCreateMission?: (newMission: Mission) => void;
  userCoords?: Coordinates;
}

export const MissionsHub: React.FC<MissionsHubProps> = ({
  missions,
  user,
  onJoinMission,
  onNavigateToMap,
  onCreateMission,
  userCoords,
}) => {
  const [hubTab, setHubTab] = useState<'public' | 'my-proposals'>('public');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Propose form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSector, setNewSector] = useState(GMC_SECTORS[1].name);
  const [newCategory, setNewCategory] = useState<Mission['category']>('revegetation');
  const [newParticipants, setNewParticipants] = useState(20);
  const [estimatedDuration, setEstimatedDuration] = useState('2 Hours');
  const [skillsText, setSkillsText] = useState('Mindful Participation, Native Botany');

  // Filter public approved missions
  const publicMissions = missions.filter(m => m.status === 'active' || m.status === 'upcoming');
  const myProposedMissions = missions.filter(m => 
    m.proposedByEmail === user?.email || 
    (m.proposedBy && user?.name && m.proposedBy === user.name) ||
    m.status === 'pending_approval'
  );

  const filteredMissions = (hubTab === 'public' ? publicMissions : myProposedMissions).filter(m => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (sectorFilter !== 'all' && m.sector !== sectorFilter) return false;
    return true;
  });

  const handleToggleJoin = (mission: Mission) => {
    if (!mission.joined) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#52b788', '#74c69d', '#1b4332']
      });
      playMindfulChime('karma');
    }
    onJoinMission(mission.id);
  };

  const handleCreateMissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const mission: Mission = {
      id: `mis-prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Citizen-proposed ecological restoration initiative.',
      category: newCategory,
      sector: newSector,
      locationName: `${newSector} Restoration Zone`,
      coordinates: {
        lat: 26.885 + (Math.random() - 0.5) * 0.02,
        lng: 90.505 + (Math.random() - 0.5) * 0.02
      },
      targetParticipants: newParticipants,
      currentParticipants: 1,
      rewardPoints: 200,
      urgency: 'priority',
      status: 'pending_approval',
      startDate: 'Scheduled upon HQ Sector Clearance',
      duration: estimatedDuration || '2 Hours',
      organizer: user ? `${user.name} (Citizen Steward)` : 'Citizen Community Guild',
      proposedBy: user?.name || 'Citizen Steward',
      proposedByEmail: user?.email || 'citizen@gmc.bt',
      proposalDate: 'Just now',
      requiredSkills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
      impactEstimate: 'Awaiting GMC Biosphere Command Validation',
      joined: true
    };

    if (onCreateMission) onCreateMission(mission);
    setProposeModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
    playMindfulChime('badge');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Mission Proposal Dispatched to GMC HQ Command!</p>
              <p className="text-[11px] text-emerald-700">
                GMC Municipal Officials in the HQ Command portal will review your proposed mission before publishing it to the public citizen feed.
              </p>
            </div>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-[#52b788]/30">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#52b788]/20 border border-[#52b788]/30 text-[#d8f3dc] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-[#52b788]" />
            <span>Community Ecological Restoration Guild</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Active Stewardship Missions</h2>
          <p className="text-xs sm:text-sm text-[#d8f3dc]/85 leading-relaxed">
            Hands-on restoration projects uniting citizens, ecologists, and rangers across Gelephu's living rivers, wildlife corridors, and terraced slopes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setProposeModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-bold text-xs shadow-md transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Propose New Mission</span>
          </button>
        </div>
      </div>

      {/* Hub Mode Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="bg-white p-1 rounded-2xl border border-gray-200 flex items-center space-x-1 text-xs shadow-xs">
          <button
            onClick={() => setHubTab('public')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
              hubTab === 'public'
                ? 'bg-[#1b4332] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Public Missions ({publicMissions.length})</span>
          </button>
          <button
            onClick={() => setHubTab('my-proposals')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
              hubTab === 'my-proposals'
                ? 'bg-[#1b4332] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>HQ Review Queue ({myProposedMissions.length})</span>
          </button>
        </div>

        {hubTab === 'my-proposals' && (
          <p className="text-xs text-amber-800 font-medium bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            ⏳ Citizen proposals must be authorized by GMC HQ Command before appearing on the public map & board.
          </p>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'revegetation', label: '🌱 Revegetation' },
            { id: 'wildlife-survey', label: '🐾 Wildlife Survey' },
            { id: 'cleanup', label: '🌊 Watershed Cleanup' },
            { id: 'community-garden', label: '🐝 Pollinator Gardens' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                categoryFilter === cat.id
                  ? 'bg-[#1b4332] text-white shadow-xs'
                  : 'bg-[#f8f9f6] text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sector Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-gray-500">District:</span>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-[#f8f9f6] border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-[#1b4332] focus:outline-none"
          >
            <option value="all">All Sectors</option>
            {GMC_SECTORS.map(s => (
              <option key={s.id} value={s.name}>{s.name.split(':')[1] || s.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Empty State */}
      {filteredMissions.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 space-y-3">
          <Compass className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-[#1b4332]">No missions found in this category</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {hubTab === 'my-proposals' 
              ? 'You have no proposed missions currently pending HQ approval.' 
              : 'Try changing your sector or category filters.'}
          </p>
        </div>
      )}

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMissions.map((mission) => {
          const isFull = mission.currentParticipants >= mission.targetParticipants;
          const percentFilled = Math.min(100, Math.round((mission.currentParticipants / mission.targetParticipants) * 100));

          return (
            <div
              key={mission.id}
              className={`p-6 rounded-3xl bg-white border transition flex flex-col justify-between shadow-sm hover:shadow-md ${
                mission.joined 
                  ? 'border-[#52b788] ring-1 ring-[#52b788]/30 bg-gradient-to-b from-white to-[#d8f3dc]/10' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="space-y-4">
                
                {/* Top Badge Strip */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#d8f3dc] text-[#1b4332]">
                      {mission.category.replace('-', ' ')}
                    </span>
                    {mission.urgency === 'priority' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-800">
                        Priority Action
                      </span>
                    )}
                    {mission.joined && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>You're Enrolled</span>
                      </span>
                    )}
                  </div>

                  <span className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#fff3cd] text-[#856404] text-xs font-extrabold shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>+{mission.rewardPoints} Karma pts</span>
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1b4332] leading-snug">{mission.title}</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{mission.description}</p>
                </div>

                {/* Location & Time Info */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-[#f8f9f6] p-3 rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>{mission.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#52b788] shrink-0" />
                      <span className="truncate">{mission.locationName}</span>
                    </div>
                    {userCoords && (
                      <span className="text-[10px] font-mono font-bold text-[#1b4332] bg-[#d8f3dc] px-1.5 py-0.5 rounded shrink-0">
                        {formatDistance(calculateDistanceKm(userCoords, mission.coordinates))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ecological Impact Estimate */}
                <div className="p-2.5 rounded-xl bg-[#e8f5e9] border border-[#c8e6c9] text-[11px] text-[#2d6a4f] font-semibold flex items-center space-x-1.5">
                  <Trees className="w-3.5 h-3.5 text-[#2d6a4f] flex-shrink-0" />
                  <span>Impact: {mission.impactEstimate}</span>
                </div>

                {/* Progress Bar & Participant count */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-500">Steward Registration</span>
                    <span className="text-[#1b4332]">{mission.currentParticipants} of {mission.targetParticipants} joined ({percentFilled}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-[#2d6a4f]' : 'bg-[#52b788]'
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigateToMap(mission.sector)}
                  className="text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] flex items-center space-x-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Locate on Map</span>
                </button>

                {mission.status === 'pending_approval' ? (
                  <span className="px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center space-x-1">
                    <Hourglass className="w-3.5 h-3.5 animate-spin" />
                    <span>Under HQ Review</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleToggleJoin(mission)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition ${
                      mission.joined
                        ? 'bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600'
                        : 'bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] shadow-md'
                    }`}
                  >
                    {mission.joined ? 'Leave Mission' : isFull ? 'Join Waitlist' : 'Join Mission'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Propose Mission Modal */}
      {proposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center font-bold text-xs">
                    🌱
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    HQ Clearance Required
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#1b4332]">Propose Citizen Ecological Mission</h3>
              </div>
              <button onClick={() => setProposeModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* HQ Review Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Municipal HQ Clearance Protocol</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                When you submit this proposal, it is routed to <strong>GMC HQ Command Sectors</strong>. Municipal Officials will verify logistics, allocate public Karma bounties, and authorize the mission before it appears on the live citizen feed.
              </p>
            </div>

            <form onSubmit={handleCreateMissionSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1b4332]">Mission Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Watershed Wildflower Seeding along Terrace 4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1b4332]">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none"
                  >
                    <option value="revegetation">Revegetation</option>
                    <option value="wildlife-survey">Wildlife Survey</option>
                    <option value="cleanup">Watershed Cleanup</option>
                    <option value="community-garden">Community Garden</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1b4332]">GMC Sector</label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none"
                  >
                    {GMC_SECTORS.map(s => (
                      <option key={s.id} value={s.name}>{s.name.split(':')[1] || s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1b4332]">Description & Objective</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What is the ecological purpose? What tools or footwear should participants bring?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setProposeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold shadow-md flex items-center space-x-1.5"
                >
                  <Hourglass className="w-3.5 h-3.5" />
                  <span>Submit for HQ Approval</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

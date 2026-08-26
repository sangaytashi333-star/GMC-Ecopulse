export type ReportCategory = 
  | 'wildlife' 
  | 'waste' 
  | 'hazard' 
  | 'watershed' 
  | 'botanical' 
  | 'infrastructure';

export type ReportStatus = 'pending' | 'dispatched' | 'in-progress' | 'pending_verification' | 'resolved';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LiveLocationState {
  coords: Coordinates;
  accuracy: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  nearestSector: string;
  isLiveTracking: boolean;
  mode: 'real' | 'simulated';
  status: 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable';
  errorMessage?: string;
}

export interface AIAnalysisResult {
  verifiedCategory: string;
  speciesOrItemIdentified: string;
  ecologicalImpactScore: number;
  suggestedKarmaPoints: number;
  urgencyLevel: 'Low' | 'Normal' | 'High' | 'Critical';
  mindfulReflection: string;
  actionableRecommendations: string[];
  biodiversityIndexContribution: string;
  carbonCircularityNote: string;
}

export interface ResolutionEvidence {
  fixerName: string;
  fixerEmail?: string;
  fixDescription?: string;
  description?: string;
  afterPhotoUrl?: string;
  beforePhotoUrl?: string;
  timestamp?: string;
  fixedAt?: string;
  wasteWeightKg?: number;
  wasteCollectedKg?: number;
  treesRestored?: number;
  proposedBonusPoints?: number;
  pointsAwarded?: number;
  officialNotes?: string;
  verifiedByOfficial?: string;
  verifiedAt?: string;
  isApproved?: boolean;
  isVerifiedByHQ?: boolean;
}

export interface CitizenReport {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  sector: string;
  locationName: string;
  coordinates: Coordinates;
  photoUrl?: string;
  status: ReportStatus;
  timestamp: string;
  reporterName: string;
  isAnonymous?: boolean;
  pointsAwarded: number;
  aiAnalysis?: AIAnalysisResult;
  fieldTeamAssigned?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  upvotes: number;
  userUpvoted?: boolean;
  resolutionEvidence?: ResolutionEvidence;
  cleanupKarmaBonus?: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'revegetation' | 'wildlife-survey' | 'cleanup' | 'sensor-maintenance' | 'community-garden';
  sector: string;
  locationName: string;
  coordinates: Coordinates;
  targetParticipants: number;
  currentParticipants: number;
  rewardPoints: number;
  urgency: 'routine' | 'priority' | 'urgent';
  status: 'active' | 'completed' | 'upcoming' | 'pending_approval' | 'rejected';
  startDate: string;
  duration: string;
  organizer: string;
  requiredSkills: string[];
  impactEstimate: string;
  joined: boolean;
  proposedBy?: string;
  proposedByEmail?: string;
  proposalDate?: string;
  approvedByOfficial?: string;
  rejectionReason?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'wellness' | 'transit' | 'market' | 'nature' | 'energy';
  imageEmoji: string;
  location: string;
  redemptionLimit: number;
  remainingCount: number;
  highlightTag?: string;
  terms: string;
}

export interface RedeemedVoucher {
  id: string;
  rewardId: string;
  title: string;
  pointsSpent?: number;
  pointsPaid?: number;
  redeemedAt: string;
  expiresAt?: string;
  code: string;
  qrData?: string;
  category?: string;
  imageEmoji: string;
  isUsed?: boolean;
  status?: 'active' | 'used' | 'expired';
  location?: string;
}

export type BadgeCategory = 'all' | 'karma' | 'forest' | 'waste' | 'wildlife' | 'river' | 'energy' | 'resolution' | 'community' | 'mastery';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'mythic';

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'karma' | 'forest' | 'waste' | 'wildlife' | 'river' | 'energy' | 'resolution' | 'community' | 'mastery';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'mythic';
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  sealCode: string;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Sacred 108';
  metricUnit?: string;
  perk?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'citizen' | 'official' | 'admin';
  levelTitle: string;
  levelNumber: number;
  totalKarmaPoints: number;
  spendablePoints: number;
  totalReportsCount: number;
  totalMissionsCount: number;
  reportsResolvedCount?: number;
  missionsCompleted?: number;
  stats?: {
    reportsResolved?: number;
    reportsSubmitted?: number;
  };
  wasteRemovedKg: number;
  wildlifeObservedCount: number;
  cleanEnergyCreditsKwh: number;
  treesPlanted: number;
  currentStreakDays: number;
  joinedDate: string;
  badges: Badge[];
  bio?: string;
  specialty?: string;
  preferredSector?: string;
  avatarEmoji?: string;
  avatarUrl?: string; // Custom uploaded profile photo (data URL / image URL)
  pinnedBadgeId?: string; // Pinned medal displayed with badge ribbon
  phone?: string;
}

export interface FieldTeam {
  id: string;
  name: string;
  specialty: 'Biodiversity & Wildlife' | 'Mao River Hydrology' | 'Circular Waste Logistics' | 'Forestry & Botanical';
  leadName: string;
  status: 'on-duty' | 'dispatched' | 'standby';
  currentSector: string;
  activeIncidentId?: string;
  assignedIncidentTitle?: string;
  vehicleType: string;
  membersCount: number;
  contactFreq: string;
}

export interface CityMetrics {
  harmonyScore: number; // 0 - 100
  aqi: number; // e.g. 18 (Himalayan Crisp)
  pm25: number; // ug/m3
  renewablePercent: number; // e.g. 98.4%
  solarOutputMw: number;
  hydroOutputMw: number;
  cityLoadMw: number;
  forestCanopyPercent: number;
  biodiversityCorridorHealth: number; // %
  wildlifeMigrationSafety: number; // %
  waterPurityIndex: number; // %
  dailyCo2AvoidedTons: number;
  activeStewardsCount: number;
  activeIncidentsCount: number;
  resolvedTodayCount: number;
}

export interface CityInsight {
  headline: string;
  summary: string;
  dailyMindfulnessPrompt: string;
  focusSector: string;
  priorityAction: string;
  updatedAt?: string;
}

export interface Project108Bridge {
  id: string;
  bridgeNumber: number;
  name: string;
  sacredSymbol: string;
  mindfulnessTheme: string;
  sector: string;
  coordinates: Coordinates;
  elevationM: number;
  architecturalType: 'Timber Habitat Overpass' | 'Hydro-Spine Cable' | 'Sacred Geometry Promenade' | 'Bamboo Biophilic Viaduct' | 'Mindfulness Meditation Span';
  ecologicalFunction: string;
  sensorNodeId: string;
  wildlifeCrossingsToday: number;
  acousticMindfulnessDb: number;
  purityIndex: number;
  aiDiagnosticNote: string;
}

export interface Project108AiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relatedBridgeNumber?: number;
  mindfulBlessing?: string;
  suggestedAction?: string;
}

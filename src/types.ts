export type ReportCategory = 
  | 'wildlife' 
  | 'waste' 
  | 'hazard' 
  | 'watershed' 
  | 'botanical' 
  | 'infrastructure';

export type ReportStatus = 'pending' | 'dispatched' | 'in-progress' | 'resolved';

export interface Coordinates {
  lat: number;
  lng: number;
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
  status: 'active' | 'completed' | 'upcoming';
  startDate: string;
  duration: string;
  organizer: string;
  requiredSkills: string[];
  impactEstimate: string;
  joined: boolean;
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

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'river' | 'wildlife' | 'waste' | 'energy' | 'community' | 'mastery';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  sealCode: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'citizen' | 'admin';
  levelTitle: string;
  levelNumber: number;
  totalKarmaPoints: number;
  spendablePoints: number;
  totalReportsCount: number;
  totalMissionsCount: number;
  wasteRemovedKg: number;
  wildlifeObservedCount: number;
  cleanEnergyCreditsKwh: number;
  treesPlanted: number;
  currentStreakDays: number;
  joinedDate: string;
  badges: Badge[];
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

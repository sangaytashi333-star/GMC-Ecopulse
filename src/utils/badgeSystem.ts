import { Badge, UserProfile, BadgeCategory, BadgeTier } from '../types';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'karma' | 'forest' | 'waste' | 'wildlife' | 'river' | 'energy' | 'resolution' | 'community' | 'mastery';
  tier: BadgeTier;
  iconName: string;
  iconEmoji: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Sacred 108';
  metricUnit: string;
  maxProgress: number;
  perk: string;
  sealPrefix: string;
  getProgress: (user: UserProfile) => number;
}

export const ALL_BADGE_DEFINITIONS: BadgeDefinition[] = [
  // --- KARMA MILESTONES ---
  {
    id: 'badge-karma-initiate',
    name: 'Initiate Steward',
    description: 'Earned your first 100 Karma points through verified civic ecological stewardship in GMC.',
    category: 'karma',
    tier: 'bronze',
    iconName: 'Sparkles',
    iconEmoji: '🌱',
    rarity: 'Common',
    metricUnit: 'pts',
    maxProgress: 100,
    perk: '+5% Karma bonus on initial river observations',
    sealPrefix: 'GMC-KARMA-100',
    getProgress: (u) => u.totalKarmaPoints || 0,
  },
  {
    id: 'badge-karma-pioneer',
    name: 'Mindful Pioneer',
    description: 'Accumulated 500+ lifetime Karma points across community missions and sensor reports.',
    category: 'karma',
    tier: 'silver',
    iconName: 'Compass',
    iconEmoji: '🧭',
    rarity: 'Rare',
    metricUnit: 'pts',
    maxProgress: 500,
    perk: 'Unlocks priority verification queue for field observations',
    sealPrefix: 'GMC-PIONEER-500',
    getProgress: (u) => u.totalKarmaPoints || 0,
  },
  {
    id: 'badge-karma-guardian',
    name: 'Himalayan Guardian',
    description: 'Reached 1,000 lifetime Karma milestone, solidifying your role in Bhutan’s GNH ecological blueprint.',
    category: 'karma',
    tier: 'gold',
    iconName: 'Shield',
    iconEmoji: '🏔️',
    rarity: 'Epic',
    metricUnit: 'pts',
    maxProgress: 1000,
    perk: 'Grants Official Volunteer Badge & Free Eco-Transit Pass',
    sealPrefix: 'GMC-GUARDIAN-1K',
    getProgress: (u) => u.totalKarmaPoints || 0,
  },
  {
    id: 'badge-karma-harmony-master',
    name: 'Master of Harmony',
    description: 'Attained 2,000+ Karma points, placing in the top echelon of Gelephu’s verified eco-citizens.',
    category: 'karma',
    tier: 'diamond',
    iconName: 'Crown',
    iconEmoji: '👑',
    rarity: 'Legendary',
    metricUnit: 'pts',
    maxProgress: 2000,
    perk: 'Voting rights on community green budget allocations',
    sealPrefix: 'GMC-MASTER-2K',
    getProgress: (u) => u.totalKarmaPoints || 0,
  },
  {
    id: 'badge-karma-visionary',
    name: '108 Visionary Luminary',
    description: 'Reached the sacred 5,000 Karma pinnacle, embodying the 108 mindful bridges of Gelephu.',
    category: 'karma',
    tier: 'mythic',
    iconName: 'Award',
    iconEmoji: '✨',
    rarity: 'Sacred 108',
    metricUnit: 'pts',
    maxProgress: 5000,
    perk: 'Permanent engraved tribute on the Mao River Mindfulness Span',
    sealPrefix: 'GMC-108-SACRED',
    getProgress: (u) => u.totalKarmaPoints || 0,
  },

  // --- FOREST & REVEGETATION (FOREST GUARDIAN) ---
  {
    id: 'badge-forest-sapling-tender',
    name: 'Sapling Tender',
    description: 'Planted 10 native Himalayan saplings in the urban rewilding corridors.',
    category: 'forest',
    tier: 'bronze',
    iconName: 'Sprout',
    iconEmoji: '🌿',
    rarity: 'Common',
    metricUnit: 'saplings',
    maxProgress: 10,
    perk: 'Free organic seed packet from Phibsoo nursery',
    sealPrefix: 'GMC-FOREST-10',
    getProgress: (u) => u.treesPlanted || 0,
  },
  {
    id: 'badge-forest-guardian',
    name: 'Forest Guardian',
    description: 'Planted and sustained 50+ trees across GMC permaculture terraces and riparian belts.',
    category: 'forest',
    tier: 'gold',
    iconName: 'Trees',
    iconEmoji: '🌲',
    rarity: 'Epic',
    metricUnit: 'trees planted',
    maxProgress: 50,
    perk: 'Forestry fast-track tools access & specialized botanical kit',
    sealPrefix: 'GMC-FOREST-50',
    getProgress: (u) => u.treesPlanted || 0,
  },
  {
    id: 'badge-forest-canopy-master',
    name: 'Canopy Sovereign',
    description: 'Achieved 100+ native trees planted, creating a self-sustaining biodiversity pocket.',
    category: 'forest',
    tier: 'diamond',
    iconName: 'Trees',
    iconEmoji: '🌳',
    rarity: 'Legendary',
    metricUnit: 'trees',
    maxProgress: 100,
    perk: 'Adopt and name a designated micro-forest reserve',
    sealPrefix: 'GMC-CANOPY-100',
    getProgress: (u) => u.treesPlanted || 0,
  },

  // --- CIRCULAR WASTE (WASTE WARRIOR) ---
  {
    id: 'badge-waste-sorter',
    name: 'Circular Apprentice',
    description: 'Diverted 20 kg of organic and recyclable waste away from municipal landfills.',
    category: 'waste',
    tier: 'bronze',
    iconName: 'Recycle',
    iconEmoji: '♻️',
    rarity: 'Common',
    metricUnit: 'kg diverted',
    maxProgress: 20,
    perk: '10% discount at GMC Zero-Waste Bulk Dispensary',
    sealPrefix: 'GMC-WASTE-20',
    getProgress: (u) => u.wasteRemovedKg || 0,
  },
  {
    id: 'badge-waste-warrior',
    name: 'Waste Warrior',
    description: 'Recovered and logged 50+ kg of biomass and circular materials for composting and biogas.',
    category: 'waste',
    tier: 'silver',
    iconName: 'Trash2',
    iconEmoji: '🛡️',
    rarity: 'Rare',
    metricUnit: 'kg recovered',
    maxProgress: 50,
    perk: 'Free home vermicomposting starter unit voucher',
    sealPrefix: 'GMC-WARRIOR-50',
    getProgress: (u) => u.wasteRemovedKg || 0,
  },
  {
    id: 'badge-waste-zero-master',
    name: 'Zero-Waste Champion',
    description: 'Exceeded 100 kg of reclaimed waste, pioneering closed-loop circularity in Gelephu.',
    category: 'waste',
    tier: 'gold',
    iconName: 'Sparkles',
    iconEmoji: '🔄',
    rarity: 'Epic',
    metricUnit: 'kg reclaimed',
    maxProgress: 100,
    perk: 'GMC Circular Economy Ambassador credential',
    sealPrefix: 'GMC-ZERO-100',
    getProgress: (u) => u.wasteRemovedKg || 0,
  },

  // --- WILDLIFE & BIODIVERSITY ---
  {
    id: 'badge-wildlife-spotter',
    name: 'Wildlife Tracker',
    description: 'Logged 10 verified fauna sightings along ecological transit corridors.',
    category: 'wildlife',
    tier: 'bronze',
    iconName: 'Eye',
    iconEmoji: '🐾',
    rarity: 'Common',
    metricUnit: 'sightings',
    maxProgress: 10,
    perk: 'Access to real-time bio-acoustic telemetry map layer',
    sealPrefix: 'GMC-FAUNA-10',
    getProgress: (u) => u.wildlifeObservedCount || 0,
  },
  {
    id: 'badge-wildlife-langur-protector',
    name: 'Langur Protector',
    description: 'Contributed 30+ verified sightings to the endangered Golden Langur migration study.',
    category: 'wildlife',
    tier: 'gold',
    iconName: 'ShieldAlert',
    iconEmoji: '🐒',
    rarity: 'Epic',
    metricUnit: 'sightings',
    maxProgress: 30,
    perk: 'Invitation to Royal Manas wildlife research symposiums',
    sealPrefix: 'GMC-LANGUR-30',
    getProgress: (u) => u.wildlifeObservedCount || 0,
  },

  // --- WATERSHED & RIVER ---
  {
    id: 'badge-river-guardian',
    name: 'River Guardian',
    description: 'Dedicated 5+ verified river restoration and water quality monitoring actions at Mao River.',
    category: 'river',
    tier: 'gold',
    iconName: 'Waves',
    iconEmoji: '🌊',
    rarity: 'Epic',
    metricUnit: 'river actions',
    maxProgress: 5,
    perk: 'Hydro-sensor deployment certification in Sector 2',
    sealPrefix: 'GMC-WATERSHED-05',
    getProgress: (u) => Math.floor((u.totalReportsCount || 0) * 0.25) + 3,
  },

  // --- CLEAN ENERGY & EMISSIONS ---
  {
    id: 'badge-energy-breathkeeper',
    name: 'Himalayan Breathkeeper',
    description: 'Offset 250+ kWh equivalent through clean mobility and solar community sharing.',
    category: 'energy',
    tier: 'diamond',
    iconName: 'Wind',
    iconEmoji: '⚡',
    rarity: 'Legendary',
    metricUnit: 'kWh offset',
    maxProgress: 250,
    perk: 'Priority reservation for GMC electric autonomous pods',
    sealPrefix: 'GMC-CLEANAIR-250',
    getProgress: (u) => u.cleanEnergyCreditsKwh || 0,
  },

  // --- CIVIC RESOLUTION HERO ---
  {
    id: 'badge-resolution-hero',
    name: 'Civic Resolver',
    description: 'Successfully verified and resolved 10+ community ecological issues and trail hazards.',
    category: 'resolution',
    tier: 'silver',
    iconName: 'CheckCircle2',
    iconEmoji: '🎯',
    rarity: 'Rare',
    metricUnit: 'reports resolved',
    maxProgress: 10,
    perk: 'Earns 2x bonus Karma on resolution certifications',
    sealPrefix: 'GMC-RESOLVER-10',
    getProgress: (u) => u.reportsResolvedCount ?? u.stats?.reportsResolved ?? 12,
  },

  // --- MINDFUL COMMUNITY ANCHOR ---
  {
    id: 'badge-community-anchor',
    name: 'Community Anchor',
    description: 'Completed 5+ collective volunteer missions with fellow Gelephu stewards.',
    category: 'community',
    tier: 'silver',
    iconName: 'Users',
    iconEmoji: '🤝',
    rarity: 'Rare',
    metricUnit: 'missions completed',
    maxProgress: 5,
    perk: 'Ability to initiate community-led flash cleanups',
    sealPrefix: 'GMC-COMMUNITY-05',
    getProgress: (u) => u.missionsCompleted ?? u.totalMissionsCount ?? 9,
  },
];

/**
 * Dynamically computes badges based on live user statistics.
 * Retains previously earned badges while updating progress and unlocking new ones.
 */
export function computeUserBadges(user: UserProfile): Badge[] {
  return ALL_BADGE_DEFINITIONS.map((def) => {
    const progressRaw = def.getProgress(user);
    const progress = Math.min(progressRaw, def.maxProgress);
    const isUnlocked = progressRaw >= def.maxProgress;

    // Check if user already had this badge with a custom unlock timestamp
    const existingBadge = user.badges?.find((b) => b.id === def.id || b.name === def.name);
    const unlockedAt = isUnlocked
      ? existingBadge?.unlockedAt || existingBadge?.isUnlocked
        ? existingBadge.unlockedAt || '2026-08-01'
        : new Date().toISOString().split('T')[0]
      : undefined;

    const sealCode = existingBadge?.sealCode || `${def.sealPrefix}-${Math.abs(hashString(def.id + user.email)).toString(16).toUpperCase().slice(0, 6)}`;

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      iconName: def.iconName,
      category: def.category,
      tier: def.tier,
      progress,
      maxProgress: def.maxProgress,
      isUnlocked,
      unlockedAt,
      sealCode,
      rarity: def.rarity,
      metricUnit: def.metricUnit,
      perk: def.perk,
    };
  });
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export function getTierColorClasses(tier: BadgeTier, isUnlocked: boolean) {
  if (!isUnlocked) {
    return {
      border: 'border-gray-200',
      badgeBg: 'bg-gray-100 text-gray-500 border-gray-200',
      ribbonBg: 'from-gray-300 to-gray-400 text-gray-700',
      glow: '',
      cardBg: 'bg-gray-50/80',
      textAccent: 'text-gray-400',
    };
  }

  switch (tier) {
    case 'bronze':
      return {
        border: 'border-amber-700/30 hover:border-amber-700/60',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        ribbonBg: 'from-amber-600 to-amber-800 text-white',
        glow: 'shadow-[0_0_15px_rgba(217,119,6,0.15)]',
        cardBg: 'bg-gradient-to-br from-white via-amber-50/20 to-white',
        textAccent: 'text-amber-800',
      };
    case 'silver':
      return {
        border: 'border-slate-300 hover:border-slate-400',
        badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
        ribbonBg: 'from-slate-400 to-slate-600 text-white',
        glow: 'shadow-[0_0_15px_rgba(148,163,184,0.2)]',
        cardBg: 'bg-gradient-to-br from-white via-slate-50/30 to-white',
        textAccent: 'text-slate-700',
      };
    case 'gold':
      return {
        border: 'border-[#DCC79A] hover:border-[#bfa76f]',
        badgeBg: 'bg-amber-50 text-[#78591f] border-[#DCC79A]',
        ribbonBg: 'from-[#DCC79A] via-[#c9ad6a] to-[#9B6F47] text-[#1E4D3B]',
        glow: 'shadow-[0_0_20px_rgba(220,199,154,0.35)]',
        cardBg: 'bg-gradient-to-br from-white via-[#F4E9D4]/30 to-white',
        textAccent: 'text-[#9B6F47]',
      };
    case 'diamond':
      return {
        border: 'border-cyan-300 hover:border-cyan-400',
        badgeBg: 'bg-cyan-50 text-cyan-900 border-cyan-300',
        ribbonBg: 'from-cyan-400 via-teal-400 to-emerald-500 text-slate-900',
        glow: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]',
        cardBg: 'bg-gradient-to-br from-white via-cyan-50/30 to-white',
        textAccent: 'text-cyan-700',
      };
    case 'mythic':
      return {
        border: 'border-emerald-500/50 hover:border-emerald-600',
        badgeBg: 'bg-gradient-to-r from-[#1E4D3B] to-[#2E7D58] text-[#F4E9D4] border-[#DCC79A]',
        ribbonBg: 'from-[#1E4D3B] via-[#2E7D58] to-[#DCC79A] text-white',
        glow: 'shadow-[0_0_30px_rgba(46,125,88,0.35)]',
        cardBg: 'bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/40',
        textAccent: 'text-[#1E4D3B]',
      };
  }
}

export function getTierMedalSymbol(tier: BadgeTier) {
  switch (tier) {
    case 'bronze':
      return '🥉';
    case 'silver':
      return '🥈';
    case 'gold':
      return '🥇';
    case 'diamond':
      return '💎';
    case 'mythic':
      return '👑';
  }
}

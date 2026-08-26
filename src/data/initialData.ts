import { 
  CityMetrics, 
  CitizenReport, 
  Mission, 
  RewardItem, 
  UserProfile, 
  FieldTeam, 
  CityInsight 
} from '../types';

export const INITIAL_CITY_METRICS: CityMetrics = {
  harmonyScore: 92.6,
  aqi: 16, // Himalayan pristine
  pm25: 4.2,
  renewablePercent: 98.8,
  solarOutputMw: 42.5,
  hydroOutputMw: 118.0,
  cityLoadMw: 132.4,
  forestCanopyPercent: 76.4,
  biodiversityCorridorHealth: 94.2,
  wildlifeMigrationSafety: 96.8,
  waterPurityIndex: 97.5,
  dailyCo2AvoidedTons: 148.6,
  activeStewardsCount: 3840,
  activeIncidentsCount: 5,
  resolvedTodayCount: 19,
};

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "Sangay Tashi",
  email: "sangaytashi.333@gmail.com",
  role: "citizen",
  levelTitle: "Senior Forest Steward",
  levelNumber: 4,
  totalKarmaPoints: 1480,
  spendablePoints: 830,
  totalReportsCount: 24,
  totalMissionsCount: 9,
  wasteRemovedKg: 68.5,
  wildlifeObservedCount: 37,
  cleanEnergyCreditsKwh: 410,
  treesPlanted: 52,
  currentStreakDays: 14,
  joinedDate: "October 2025",
  specialty: "Golden Langur Habitat Monitor & Watershed Steward",
  preferredSector: "Sector 3: Phibsoo Wildlife Buffer & Elephant Highway",
  bio: "Committed to preserving Bhutan's high-biodiversity riparian zones and mindful permaculture terraces in GMC.",
  badges: [
    {
      id: "badge-river-guardian",
      name: "River Guardian",
      description: "Dedicated 5+ restoration hours to the Mao River Watershed corridor.",
      iconName: "Waves",
      category: "river",
      tier: "gold",
      progress: 5,
      maxProgress: 5,
      isUnlocked: true,
      unlockedAt: "2026-07-12",
      sealCode: "GMC-WATERSHED-0914"
    },
    {
      id: "badge-soil-savior",
      name: "Soil Savior",
      description: "Planted over 50 native saplings across GMC permaculture terraces.",
      iconName: "Sprout",
      category: "community",
      tier: "gold",
      progress: 52,
      maxProgress: 50,
      isUnlocked: true,
      unlockedAt: "2026-08-01",
      sealCode: "GMC-AGRI-4821"
    },
    {
      id: "badge-langur-protector",
      name: "Langur Protector",
      description: "Contributed 10+ verified sightings to the Golden Langur wildlife corridor survey.",
      iconName: "ShieldAlert",
      category: "wildlife",
      tier: "silver",
      progress: 8,
      maxProgress: 10,
      isUnlocked: false,
      sealCode: "GMC-FAUNA-1102"
    },
    {
      id: "badge-breathkeeper",
      name: "Himalayan Breathkeeper",
      description: "Used zero-emission transit for 30 consecutive commutes in the city.",
      iconName: "Wind",
      category: "energy",
      tier: "diamond",
      progress: 30,
      maxProgress: 30,
      isUnlocked: true,
      unlockedAt: "2026-08-19",
      sealCode: "GMC-CLEANAIR-7789"
    },
    {
      id: "badge-zero-waste",
      name: "Zero Waste Pioneer",
      description: "Reported and logged circular composting & recovered 50kg+ reusable biomass.",
      iconName: "Recycle",
      category: "waste",
      tier: "silver",
      progress: 42,
      maxProgress: 50,
      isUnlocked: false,
      sealCode: "GMC-CIRCULAR-304"
    },
    {
      id: "badge-harmony-master",
      name: "Master of Harmony",
      description: "Achieved top 5% stewardship index across all GMC districts.",
      iconName: "Sparkles",
      category: "mastery",
      tier: "gold",
      progress: 1480,
      maxProgress: 2000,
      isUnlocked: false,
      sealCode: "GMC-GNH-MASTER"
    }
  ]
};

export const INITIAL_REPORTS: CitizenReport[] = [
  {
    id: "rep-001",
    title: "Golden Langur Family Crossing at Bamboo Overpass",
    description: "Observed a troop of 7 endangered Golden Langurs peacefully using the canopy rope bridge above the Sector 2 eco-transit boulevard.",
    category: "wildlife",
    sector: "Sector 2: Mao River Watershed",
    locationName: "Bridge 14 Canopy Corridor",
    coordinates: { lat: 26.8835, lng: 90.4982 },
    photoUrl: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80",
    status: "resolved",
    timestamp: "Today, 06:45 AM",
    reporterName: "Karma Tenzin",
    isAnonymous: false,
    pointsAwarded: 95,
    upvotes: 28,
    userUpvoted: true,
    aiAnalysis: {
      verifiedCategory: "Fauna & Biodiversity Corridor",
      speciesOrItemIdentified: "Trachypithecus geei (Golden Langur)",
      ecologicalImpactScore: 98,
      suggestedKarmaPoints: 95,
      urgencyLevel: "Low",
      mindfulReflection: "Their presence reminds us that our bridges are built to serve all sentient life of the Himalayas.",
      actionableRecommendations: [
        "Logged into GMC Wildlife Sentinel database",
        "Canopy rope tension verified as optimal by telemetry",
        "Sensors confirmed zero vehicle interference"
      ],
      biodiversityIndexContribution: "+0.24% Corridor Stability",
      carbonCircularityNote: "Non-disruptive citizen telemetry"
    },
    fieldTeamAssigned: "Unit Bio-Alpha (Wildlife Patrol)",
    resolutionNotes: "Automated wildlife acoustic monitor confirmed safe transit across Sector 2 corridor.",
    resolvedAt: "07:15 AM"
  },
  {
    id: "rep-002",
    title: "Storm Debris Accumulation near Mao River Fish Ladder",
    description: "Driftwood and organic mountain runoff has partially obstructed the bypass channel near the hydro-monitoring station.",
    category: "watershed",
    sector: "Sector 2: Mao River Watershed",
    locationName: "Mao River Station 4",
    coordinates: { lat: 26.8920, lng: 90.5120 },
    photoUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    status: "in-progress",
    timestamp: "Today, 08:12 AM",
    reporterName: "Pema Dorji",
    isAnonymous: false,
    pointsAwarded: 70,
    upvotes: 14,
    userUpvoted: false,
    aiAnalysis: {
      verifiedCategory: "Riparian & Hydro Health",
      speciesOrItemIdentified: "Organic Woody Debris / Sediment Sieve",
      ecologicalImpactScore: 78,
      suggestedKarmaPoints: 70,
      urgencyLevel: "Normal",
      mindfulReflection: "Water finds its path, and through mindful clearing we restore the sacred flow of life.",
      actionableRecommendations: [
        "Reposition woody biomass to biochar composting yard",
        "Inspect upstream fish passage grating",
        "Verify river velocity telemetry"
      ],
      biodiversityIndexContribution: "+0.15% Watershed Flow",
      carbonCircularityNote: "Collected wood will be converted to soil mulch."
    },
    fieldTeamAssigned: "Unit Hydro-2 (Watershed Tech)",
    resolutionNotes: "Team dispatched with electric barge. Estimated clearing time 45 mins."
  },
  {
    id: "rep-003",
    title: "Loose Cable on Solar Canopy Walkway 7",
    description: "Exposed grounding conduit after high wind near the mindfulness pavilion solar array.",
    category: "infrastructure",
    sector: "Sector 1: Mindfulness Spine",
    locationName: "Pavilion 3 Microgrid Hub",
    coordinates: { lat: 26.8790, lng: 90.5050 },
    photoUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    status: "dispatched",
    timestamp: "Today, 09:30 AM",
    reporterName: "Dechen Wangmo",
    isAnonymous: true,
    pointsAwarded: 60,
    upvotes: 9,
    userUpvoted: false,
    aiAnalysis: {
      verifiedCategory: "Clean Energy Microgrid Infrastructure",
      speciesOrItemIdentified: "Grounding Conduit Clip (Low Voltage)",
      ecologicalImpactScore: 65,
      suggestedKarmaPoints: 60,
      urgencyLevel: "Normal",
      mindfulReflection: "Caring for our clean energy vessels keeps the light of mindfulness burning steadily.",
      actionableRecommendations: [
        "Secure weatherized clip",
        "Ensure pedestrian safety corridor"
      ],
      biodiversityIndexContribution: "+0.08% Grid Uptime",
      carbonCircularityNote: "Prevents energy loss across Sector 1 microgrid."
    },
    fieldTeamAssigned: "Unit Delta (Smart Grid Technicians)"
  },
  {
    id: "rep-004",
    title: "Rufous-necked Hornbill Nest in Ancient Cypress",
    description: "Pair of vulnerable Rufous-necked Hornbills spotted feeding chicks in hollow trunk 12m high in the protected heritage grove.",
    category: "wildlife",
    sector: "Sector 6: Sarpang Dzongkhag Forest",
    locationName: "Ancient Cypress Sanctuary",
    coordinates: { lat: 26.8995, lng: 90.4850 },
    photoUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80",
    status: "resolved",
    timestamp: "Yesterday, 04:20 PM",
    reporterName: "Karma Tenzin",
    isAnonymous: false,
    pointsAwarded: 110,
    upvotes: 45,
    userUpvoted: true,
    aiAnalysis: {
      verifiedCategory: "Himalayan Avian Sanctuary",
      speciesOrItemIdentified: "Aceros nipalensis (Rufous-necked Hornbill)",
      ecologicalImpactScore: 99,
      suggestedKarmaPoints: 110,
      urgencyLevel: "Low",
      mindfulReflection: "In their gentle nest, we witness the serene fruit of our forest stewardship.",
      actionableRecommendations: [
        "Designate 30m quiet acoustic buffer",
        "Log GPS into GMC Ornithology Index",
        "Avoid any low drone flight over coordinates"
      ],
      biodiversityIndexContribution: "+0.32% Species Resilience",
      carbonCircularityNote: "Protects keystone seed disperser of GMC canopy."
    },
    fieldTeamAssigned: "Unit Bio-Alpha (Wildlife Patrol)",
    resolutionNotes: "Quiet buffer zone established. Acoustic sensors placed on silent surveillance mode.",
    resolvedAt: "Yesterday, 05:40 PM"
  },
  {
    id: "rep-005",
    title: "Excess Organic Fruit Husk at Farmers Marketplace",
    description: "Compost collection receptacle full after morning organic market; requires transfer to the biogas anaerobic digester.",
    category: "waste",
    sector: "Sector 4: Agri-Tech Valley",
    locationName: "Organic Valley Market Stall 12",
    coordinates: { lat: 26.8710, lng: 90.5210 },
    photoUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    status: "pending",
    timestamp: "20 mins ago",
    reporterName: "Sonam Choden",
    isAnonymous: false,
    pointsAwarded: 45,
    upvotes: 6,
    userUpvoted: false,
    aiAnalysis: {
      verifiedCategory: "Circular Biomass & Composting",
      speciesOrItemIdentified: "Organic Fruit Biomass (Rich in Nitrogen)",
      ecologicalImpactScore: 72,
      suggestedKarmaPoints: 45,
      urgencyLevel: "Normal",
      mindfulReflection: "Nothing is waste in the circle of nature; all transforms into fertile soil.",
      actionableRecommendations: [
        "Dispatch electric cargo tricycle",
        "Transfer to Valley Biogas Digester Unit 2"
      ],
      biodiversityIndexContribution: "+0.10% Circularity",
      carbonCircularityNote: "Expected methane capture: 4.8 kWh equivalent energy."
    }
  }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: "mis-001",
    title: "Mao Riverbank Native Revegetation & Alder Planting",
    description: "Join community ecologists in planting 300 native Himalayan alder and willow saplings to stabilize the riparian buffer before the late monsoon rains.",
    category: "revegetation",
    sector: "Sector 2: Mao River Watershed",
    locationName: "Riverbank Zone 3 (Near Bridge 8)",
    coordinates: { lat: 26.8870, lng: 90.5080 },
    targetParticipants: 25,
    currentParticipants: 19,
    rewardPoints: 180,
    urgency: "priority",
    status: "active",
    startDate: "Tomorrow, 07:30 AM",
    duration: "2.5 Hours",
    organizer: "GMC River Conservancy & Ecological Council",
    requiredSkills: ["Gentle Digging", "Mindful Teamwork", "Watering"],
    impactEstimate: "+0.8% Riparian Soil Retention & 1.2 tons CO2 offset/yr",
    joined: true
  },
  {
    id: "mis-002",
    title: "Golden Langur Canopy Corridor Sensor Check",
    description: "Walk the elevated forest walkways with portable optical scanners to calibrate wildlife motion sensors and check canopy bridge integrity.",
    category: "wildlife-survey",
    sector: "Sector 3: Phibsoo Wildlife Buffer",
    locationName: "Canopy Walkway Segment D",
    coordinates: { lat: 26.8950, lng: 90.4920 },
    targetParticipants: 12,
    currentParticipants: 11,
    rewardPoints: 150,
    urgency: "routine",
    status: "active",
    startDate: "Saturday, 08:00 AM",
    duration: "2 Hours",
    organizer: "Himalayan Biodiversity Research Institute",
    requiredSkills: ["Wildlife Observation", "Gentle Pace", "Quiet Demeanor"],
    impactEstimate: "Calibrates real-time wildlife passage across 4.2 km corridor",
    joined: false
  },
  {
    id: "mis-003",
    title: "Zero-Waste River Sieve Silt & Leaf Clearing",
    description: "Mindfully clear organic silt and ensure smooth water passage through the natural bamboo micro-sieves protecting the downstream aquatic sanctuary.",
    category: "cleanup",
    sector: "Sector 2: Mao River Watershed",
    locationName: "Silt Sieve Point Alpha",
    coordinates: { lat: 26.8810, lng: 90.5140 },
    targetParticipants: 15,
    currentParticipants: 8,
    rewardPoints: 120,
    urgency: "routine",
    status: "active",
    startDate: "Sunday, 09:00 AM",
    duration: "1.5 Hours",
    organizer: "GMC Watershed Youth Circle",
    requiredSkills: ["Light Physical Work", "Rubber Boots provided"],
    impactEstimate: "Maintains 99.4% water flow aeration for Mahseer fish",
    joined: false
  },
  {
    id: "mis-004",
    title: "Mindful Urban Pollinator Garden Terracing",
    description: "Plant native Bhutanese wildflowers, marigolds, and medicinal herbs along the terraced edges of Sector 4 to support Himalayan honeybee colonies.",
    category: "community-garden",
    sector: "Sector 4: Agri-Tech Valley",
    locationName: "Terrace 5 Bee Sanctuary",
    coordinates: { lat: 26.8680, lng: 90.5180 },
    targetParticipants: 20,
    currentParticipants: 20,
    rewardPoints: 140,
    urgency: "routine",
    status: "active",
    startDate: "Next Tuesday, 04:00 PM",
    duration: "2 Hours",
    organizer: "GMC Permaculture Guild",
    requiredSkills: ["Flower Planting", "Composting"],
    impactEstimate: "Provides habitat for 14 native wild bee species",
    joined: false
  }
];

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: "rew-001",
    title: "Gelephu Geothermal Hot Springs (Tshachu) Day Pass",
    description: "Immerse in the sacred mineral thermal waters of Gelephu Tshachu for cellular recovery and meditative serenity. Includes organic herbal tea service.",
    pointsCost: 250,
    category: "wellness",
    imageEmoji: "♨️",
    location: "GMC Wellness Valley, Upper Springs",
    redemptionLimit: 50,
    remainingCount: 38,
    highlightTag: "Popular Community Choice",
    terms: "Valid for 60 days. Open daily 06:00 - 21:00. Towel and herbal infusion provided."
  },
  {
    id: "rew-002",
    title: "GMC Autonomous Eco-Transit & Cableway Monthly Pass",
    description: "Unlimited rides on all 100% solar-powered autonomous electric pods, river shuttles, and scenic Himalayan canopy cableways across all 7 sectors.",
    pointsCost: 350,
    category: "transit",
    imageEmoji: "🚠",
    location: "All GMC Stations & Skyway Terminals",
    redemptionLimit: 100,
    remainingCount: 74,
    highlightTag: "Clean Mobility",
    terms: "Instant digital activation on your GMC Smart Transit ID. Valid for 30 consecutive days."
  },
  {
    id: "rew-003",
    title: "Organic Valley Market Harvest Basket (5kg)",
    description: "Freshly harvested seasonal basket of pesticide-free organic vegetables, red rice, wild fiddlehead ferns, and mountain honey from local permaculture growers.",
    pointsCost: 200,
    category: "market",
    imageEmoji: "🧺",
    location: "Sector 4 Farmers Exchange",
    redemptionLimit: 40,
    remainingCount: 19,
    highlightTag: "Zero Food Miles",
    terms: "Collect on Friday or Saturday morning at Sector 4 Organic Hub."
  },
  {
    id: "rew-004",
    title: "Traditional Sowa Rigpa Himalayan Herbal Wellness Session",
    description: "A 45-minute bespoke consultation and herbal compress massage rooted in centuries-old Bhutanese traditional medicine for bodily balance.",
    pointsCost: 450,
    category: "wellness",
    imageEmoji: "🌿",
    location: "Institute of Traditional Healing, Sector 1",
    redemptionLimit: 25,
    remainingCount: 11,
    highlightTag: "Mind-Body Harmony",
    terms: "Prior appointment required via GMC Health Portal."
  },
  {
    id: "rew-005",
    title: "Native Himalayan Rhododendron & Cypress Seedling Kit",
    description: "Two nurtured native saplings, organic biochar compost, terracotta pot, and planting guidance card for your balcony or home garden.",
    pointsCost: 120,
    category: "nature",
    imageEmoji: "🪴",
    location: "GMC Botanic Nursery, Sector 6",
    redemptionLimit: 80,
    remainingCount: 62,
    highlightTag: "Green Home",
    terms: "Includes lifelong consultation with GMC urban botanists."
  },
  {
    id: "rew-006",
    title: "Royal Manas Guided Eco-Safari & Birding Walk",
    description: "Exclusive half-day dawn expedition with certified senior wildlife rangers through the protected biological corridor adjacent to Royal Manas National Park.",
    pointsCost: 600,
    category: "nature",
    imageEmoji: "🦅",
    location: "Phibsoo Biological Gateway",
    redemptionLimit: 15,
    remainingCount: 6,
    highlightTag: "Master Steward Privilege",
    terms: "Small group (max 4). Includes optical binoculars and breakfast pack."
  },
  {
    id: "rew-007",
    title: "Solar Microgrid Co-op Equity Credit (50 kWh)",
    description: "Direct credit deducted from your household clean energy bill via the GMC Decentralized Microgrid Cooperative.",
    pointsCost: 500,
    category: "energy",
    imageEmoji: "⚡",
    location: "Direct Smart Meter Credit",
    redemptionLimit: 200,
    remainingCount: 184,
    highlightTag: "Energy Independence",
    terms: "Applied automatically to your linked GMC utility meter within 24 hours."
  },
  {
    id: "rew-008",
    title: "Mindfulness Tea Pavilion Sacred Tasting Flight",
    description: "Curated ceremony sampling rare high-altitude white teas, ginger infusions, and cordyceps nectar accompanied by singing bowl acoustics.",
    pointsCost: 180,
    category: "wellness",
    imageEmoji: "🍵",
    location: "Mindfulness Bridge Pavilion 1",
    redemptionLimit: 60,
    remainingCount: 45,
    terms: "Valid any afternoon between 14:00 - 18:00."
  }
];

export const INITIAL_FIELD_TEAMS: FieldTeam[] = [
  {
    id: "team-bio-alpha",
    name: "Unit Bio-Alpha",
    specialty: "Biodiversity & Wildlife",
    leadName: "Dr. Dorji Tshering (Chief Ecologist)",
    status: "on-duty",
    currentSector: "Sector 2: Mao River Watershed",
    activeIncidentId: "rep-001",
    assignedIncidentTitle: "Golden Langur Family Crossing",
    vehicleType: "Silent Electric 4x4 Ranger",
    membersCount: 4,
    contactFreq: "GMC-VHF-144.200"
  },
  {
    id: "team-hydro-2",
    name: "Unit Hydro-2",
    specialty: "Mao River Hydrology",
    leadName: "Sonam Pelden (Water Systems Engineer)",
    status: "dispatched",
    currentSector: "Sector 2: Mao River Watershed",
    activeIncidentId: "rep-002",
    assignedIncidentTitle: "Storm Debris at Fish Ladder",
    vehicleType: "Solar Electric River Patrol Boat",
    membersCount: 3,
    contactFreq: "GMC-VHF-144.850"
  },
  {
    id: "team-circular-waste",
    name: "Unit Eco-Logistics",
    specialty: "Circular Waste Logistics",
    leadName: "Tashi Wangchuk (Resource Recovery Lead)",
    status: "standby",
    currentSector: "Sector 4: Agri-Tech Valley",
    vehicleType: "Electric Biomass Transporter",
    membersCount: 5,
    contactFreq: "GMC-VHF-145.100"
  },
  {
    id: "team-grid-delta",
    name: "Unit Delta",
    specialty: "Forestry & Botanical",
    leadName: "Ugyen Norbu (Grid & Canopy Specialist)",
    status: "dispatched",
    currentSector: "Sector 1: Mindfulness Spine",
    activeIncidentId: "rep-003",
    assignedIncidentTitle: "Grounding Conduit Maintenance",
    vehicleType: "Electric Elevated Boom Cart",
    membersCount: 2,
    contactFreq: "GMC-VHF-145.350"
  }
];

export const INITIAL_CITY_INSIGHT: CityInsight = {
  headline: "Mao River Corridor & Forest Equilibrium at Peak Harmony",
  summary: "Gelephu's micro-hydro grids are operating at 98.8% renewable equilibrium while dawn bird songs indicate flourishing riverbank regeneration across all 35 bridge spans.",
  dailyMindfulnessPrompt: "Take three mindful breaths before crossing the Mindfulness Bridge today; notice the gentle harmony between mountain water flow and the whispering forest canopy.",
  focusSector: "Sector 2: Mao River Watershed & Wildlife Sanctuary",
  priorityAction: "Join tomorrow's 07:30 AM Himalayan Alder revegetation mission along the riverbank.",
  updatedAt: "Updated 10 minutes ago via GMC Eco-Intelligence Node"
};

export const GMC_SECTORS = [
  { id: "sec-1", name: "Sector 1: Mindfulness Spine & Central Bridge", coordinates: { lat: 26.8858, lng: 90.5015 }, icon: "Landmark", color: "#1b4332", harmony: 94 },
  { id: "sec-2", name: "Sector 2: Mao River Watershed & Riparian Corridor", coordinates: { lat: 26.8720, lng: 90.4950 }, icon: "Waves", color: "#2d6a4f", harmony: 91 },
  { id: "sec-3", name: "Sector 3: Phibsoo Wildlife Buffer & Elephant Highway", coordinates: { lat: 26.8950, lng: 90.4780 }, icon: "Footprints", color: "#40916c", harmony: 96 },
  { id: "sec-4", name: "Sector 4: Agri-Tech & Permaculture Terraces", coordinates: { lat: 26.8680, lng: 90.5180 }, icon: "Sprout", color: "#52b788", harmony: 93 },
  { id: "sec-5", name: "Sector 5: Eco-Tech Innovation Gate & Clean Logistics", coordinates: { lat: 26.8810, lng: 90.5280 }, icon: "Cpu", color: "#2d6a4f", harmony: 90 },
  { id: "sec-6", name: "Sector 6: Sarpang Dzongkhag Heritage Forest", coordinates: { lat: 26.9020, lng: 90.4890 }, icon: "Trees", color: "#1b4332", harmony: 97 },
  { id: "sec-7", name: "Sector 7: Royal Manas Biological Foothills", coordinates: { lat: 26.9150, lng: 90.5120 }, icon: "Mountain", color: "#081c15", harmony: 95 },
];

export const INITIAL_USER = INITIAL_USER_PROFILE;


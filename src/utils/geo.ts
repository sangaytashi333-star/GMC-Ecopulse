import { Coordinates } from '../types';
import { GMC_SECTORS } from '../data/initialData';

// Calculate distance between two coordinates in kilometers using Haversine formula
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance human-readably (e.g. "350 m" or "2.4 km")
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Format coordinates to DMS or standard decimal
export function formatCoordinates(coords: Coordinates): string {
  const latDir = coords.lat >= 0 ? 'N' : 'S';
  const lngDir = coords.lng >= 0 ? 'E' : 'W';
  return `${Math.abs(coords.lat).toFixed(5)}° ${latDir}, ${Math.abs(coords.lng).toFixed(5)}° ${lngDir}`;
}

// Find closest GMC sector to given coordinates
export function getClosestGMCSector(coords: Coordinates): string {
  let closestSector = GMC_SECTORS[0].name;
  let minDistance = Infinity;

  GMC_SECTORS.forEach((s) => {
    const dist = calculateDistanceKm(coords, s.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      closestSector = s.name;
    }
  });

  return closestSector;
}

// Gelephu reference anchor points
export const GMC_CENTER_COORDS: Coordinates = {
  lat: 26.8858,
  lng: 90.5015,
};

// Convert bearing in degrees to human-readable compass cardinal
export function getCompassDirection(bearing: number | null | undefined): string {
  if (bearing === null || bearing === undefined || isNaN(bearing)) return 'N';
  const normalized = ((bearing % 360) + 360) % 360;
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

// Curated live patrol routes through GMC corridors for simulation and demo
export const GMC_PATROL_ROUTES: { id: string; name: string; sector: string; waypoints: Coordinates[] }[] = [
  {
    id: 'spine-patrol',
    name: 'Mindfulness Spine & Central Bridge Canopy',
    sector: 'Sector 1: Mindfulness Spine & Central Bridge Canopy',
    waypoints: [
      { lat: 26.8858, lng: 90.5015 },
      { lat: 26.8872, lng: 90.5032 },
      { lat: 26.8890, lng: 90.5050 },
      { lat: 26.8908, lng: 90.5065 },
      { lat: 26.8925, lng: 90.5078 },
      { lat: 26.8940, lng: 90.5095 },
      { lat: 26.8955, lng: 90.5110 },
      { lat: 26.8942, lng: 90.5098 },
      { lat: 26.8920, lng: 90.5075 },
      { lat: 26.8895, lng: 90.5052 },
      { lat: 26.8870, lng: 90.5030 },
      { lat: 26.8858, lng: 90.5015 }
    ]
  },
  {
    id: 'mao-river-patrol',
    name: 'Mao River Sacred Hydrology Corridor',
    sector: 'Sector 2: Mao River Watershed & Clean Riparian Zones',
    waypoints: [
      { lat: 26.8930, lng: 90.5085 },
      { lat: 26.8950, lng: 90.5105 },
      { lat: 26.8975, lng: 90.5135 },
      { lat: 26.9010, lng: 90.5180 },
      { lat: 26.9035, lng: 90.5215 },
      { lat: 26.9015, lng: 90.5185 },
      { lat: 26.8980, lng: 90.5140 },
      { lat: 26.8945, lng: 90.5095 }
    ]
  },
  {
    id: 'phibsoo-buffer',
    name: 'Phibsoo Wildlife & Elephant Migration Buffer',
    sector: 'Sector 3: Phibsoo Wildlife Buffer & Canopy Bridges',
    waypoints: [
      { lat: 26.8780, lng: 90.4910 },
      { lat: 26.8805, lng: 90.4935 },
      { lat: 26.8830, lng: 90.4965 },
      { lat: 26.8855, lng: 90.4990 },
      { lat: 26.8835, lng: 90.4970 },
      { lat: 26.8800, lng: 90.4930 }
    ]
  }
];


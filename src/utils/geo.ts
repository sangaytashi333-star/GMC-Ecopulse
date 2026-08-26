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

import { useState, useEffect, useRef, useCallback } from 'react';
import { Coordinates, LiveLocationState } from '../types';
import { GMC_CENTER_COORDS, getClosestGMCSector } from '../utils/geo';

const DEFAULT_COORDS: Coordinates = {
  lat: 26.8858,
  lng: 90.5015,
};

export function useLiveLocation() {
  const [locationState, setLocationState] = useState<LiveLocationState>({
    coords: DEFAULT_COORDS,
    accuracy: 12,
    altitude: 240,
    heading: 42,
    speed: 0,
    timestamp: Date.now(),
    nearestSector: 'Sector 1: Mindfulness Spine & Central Bridge Canopy',
    isLiveTracking: true,
    mode: 'real',
    status: 'idle',
  });

  const watchIdRef = useRef<number | null>(null);
  const simulationIntervalRef = useRef<any>(null);

  // Request & start real hardware GPS tracking
  const startRealLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState(prev => ({
        ...prev,
        status: 'unavailable',
        errorMessage: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setLocationState(prev => ({ ...prev, status: 'requesting', mode: 'real' }));

    // First get quick initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocationState({
          coords,
          accuracy: Math.round(pos.coords.accuracy || 10),
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
          heading: pos.coords.heading !== null ? Math.round(pos.coords.heading) : null,
          speed: pos.coords.speed !== null ? Number((pos.coords.speed * 3.6).toFixed(1)) : null, // km/h
          timestamp: pos.timestamp || Date.now(),
          nearestSector: getClosestGMCSector(coords),
          isLiveTracking: true,
          mode: 'real',
          status: 'active',
        });
      },
      (err) => {
        console.warn('Geolocation initial error:', err.message);
        // If user denied or unavailable, fallback gracefully to GMC anchor
        setLocationState(prev => ({
          ...prev,
          status: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable',
          errorMessage: err.message || 'Unable to retrieve location.',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    // Then start continuous real-time watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocationState(prev => ({
          ...prev,
          coords,
          accuracy: Math.round(pos.coords.accuracy || 8),
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : prev.altitude,
          heading: pos.coords.heading !== null ? Math.round(pos.coords.heading) : prev.heading,
          speed: pos.coords.speed !== null ? Number((pos.coords.speed * 3.6).toFixed(1)) : prev.speed,
          timestamp: pos.timestamp || Date.now(),
          nearestSector: getClosestGMCSector(coords),
          status: 'active',
          mode: 'real',
        }));
      },
      (err) => {
        console.warn('Geolocation watch error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 2000,
      }
    );
  }, []);

  // Stop real location tracking
  const stopRealLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Switch to simulated GMC field coordinates (e.g. for demonstrating Gelephu valley corridor)
  const setSimulatedCoords = useCallback((coords: Coordinates, sectorName?: string) => {
    stopRealLocationTracking();
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    setLocationState({
      coords,
      accuracy: 5,
      altitude: 275,
      heading: 68,
      speed: 1.2,
      timestamp: Date.now(),
      nearestSector: sectorName || getClosestGMCSector(coords),
      isLiveTracking: true,
      mode: 'simulated',
      status: 'active',
    });
  }, [stopRealLocationTracking]);

  // Toggle live tracking on/off
  const toggleLiveTracking = useCallback(() => {
    setLocationState(prev => {
      const nextTracking = !prev.isLiveTracking;
      if (!nextTracking) {
        stopRealLocationTracking();
      } else if (prev.mode === 'real') {
        startRealLocationTracking();
      }
      return { ...prev, isLiveTracking: nextTracking };
    });
  }, [startRealLocationTracking, stopRealLocationTracking]);

  // Initial load auto-trigger
  useEffect(() => {
    startRealLocationTracking();

    return () => {
      stopRealLocationTracking();
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [startRealLocationTracking, stopRealLocationTracking]);

  return {
    locationState,
    startRealLocationTracking,
    stopRealLocationTracking,
    setSimulatedCoords,
    toggleLiveTracking,
  };
}

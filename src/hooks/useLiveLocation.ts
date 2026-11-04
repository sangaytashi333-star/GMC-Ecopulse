import { useState, useEffect, useRef, useCallback } from 'react';
import { Coordinates, LiveLocationState } from '../types';
import { GMC_CENTER_COORDS, getClosestGMCSector, calculateDistanceKm, GMC_PATROL_ROUTES } from '../utils/geo';

const DEFAULT_COORDS: Coordinates = GMC_CENTER_COORDS;

export function useLiveLocation() {
  const [locationState, setLocationState] = useState<LiveLocationState>({
    coords: DEFAULT_COORDS,
    accuracy: 8,
    altitude: 248,
    heading: 45,
    speed: 0,
    timestamp: Date.now(),
    nearestSector: 'Sector 1: Mindfulness Spine & Central Bridge Canopy',
    isLiveTracking: true,
    isAutoFollow: true,
    trail: [DEFAULT_COORDS],
    distanceTraveledKm: 0,
    mode: 'real',
    status: 'idle',
  });

  const watchIdRef = useRef<number | null>(null);
  const simulationIntervalRef = useRef<any>(null);
  const simRouteIndexRef = useRef<number>(0);
  const simWaypointIndexRef = useRef<number>(0);
  const lastCoordRef = useRef<Coordinates>(DEFAULT_COORDS);

  // Helper to append breadcrumb if distance moved > 3 meters
  const recordTrailPoint = useCallback((newCoords: Coordinates) => {
    setLocationState(prev => {
      const lastPoint = prev.trail && prev.trail.length > 0 ? prev.trail[prev.trail.length - 1] : prev.coords;
      const stepKm = calculateDistanceKm(lastPoint, newCoords);
      
      // If moved more than 3 meters (0.003 km)
      if (stepKm >= 0.003) {
        const updatedTrail = [...(prev.trail || []), newCoords].slice(-100); // keep last 100 points
        const updatedDist = Number(((prev.distanceTraveledKm || 0) + stepKm).toFixed(3));
        return {
          ...prev,
          coords: newCoords,
          trail: updatedTrail,
          distanceTraveledKm: updatedDist,
        };
      }
      return {
        ...prev,
        coords: newCoords,
      };
    });
  }, []);

  // Request & start real hardware GPS tracking
  const startRealLocationTracking = useCallback(() => {
    // Clear any active simulation first
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    if (!navigator.geolocation) {
      setLocationState(prev => ({
        ...prev,
        status: 'unavailable',
        errorMessage: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setLocationState(prev => ({ ...prev, status: 'requesting', mode: 'real', isLiveTracking: true }));

    // 1. Initial quick fix
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        lastCoordRef.current = coords;
        
        setLocationState(prev => ({
          ...prev,
          coords,
          accuracy: Math.round(pos.coords.accuracy || 8),
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : (prev.altitude || 240),
          heading: pos.coords.heading !== null && !isNaN(pos.coords.heading) ? Math.round(pos.coords.heading) : prev.heading,
          speed: pos.coords.speed !== null && !isNaN(pos.coords.speed) ? Number((pos.coords.speed * 3.6).toFixed(1)) : 0,
          timestamp: pos.timestamp || Date.now(),
          nearestSector: getClosestGMCSector(coords),
          isLiveTracking: true,
          mode: 'real',
          status: 'active',
          trail: prev.trail && prev.trail.length > 0 ? prev.trail : [coords],
        }));
      },
      (err) => {
        console.warn('Geolocation initial error:', err.message);
        setLocationState(prev => ({
          ...prev,
          status: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable',
          errorMessage: err.message || 'Unable to retrieve location.',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    // 2. High-precision continuous watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        const speedKmH = pos.coords.speed !== null && !isNaN(pos.coords.speed) 
          ? Number((pos.coords.speed * 3.6).toFixed(1)) 
          : 0;

        setLocationState(prev => {
          const lastPoint = prev.trail && prev.trail.length > 0 ? prev.trail[prev.trail.length - 1] : prev.coords;
          const stepKm = calculateDistanceKm(lastPoint, coords);
          const shouldAppend = stepKm >= 0.003;
          const newTrail = shouldAppend ? [...(prev.trail || []), coords].slice(-100) : prev.trail;
          const newDistance = shouldAppend ? Number(((prev.distanceTraveledKm || 0) + stepKm).toFixed(3)) : prev.distanceTraveledKm;

          return {
            ...prev,
            coords,
            accuracy: Math.round(pos.coords.accuracy || 6),
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : prev.altitude,
            heading: pos.coords.heading !== null && !isNaN(pos.coords.heading) 
              ? Math.round(pos.coords.heading) 
              : prev.heading,
            speed: speedKmH,
            timestamp: pos.timestamp || Date.now(),
            nearestSector: getClosestGMCSector(coords),
            status: 'active',
            mode: 'real',
            isLiveTracking: true,
            trail: newTrail,
            distanceTraveledKm: newDistance,
          };
        });
      },
      (err) => {
        console.warn('Geolocation watch error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 500,
      }
    );
  }, []);

  // Device orientation / compass heading sensor fusion for mobile and tablet
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // webkitCompassHeading for iOS Safari, alpha for Android Chrome
      let compassHeading: number | null = null;
      if ((event as any).webkitCompassHeading !== undefined && (event as any).webkitCompassHeading !== null) {
        compassHeading = Math.round((event as any).webkitCompassHeading);
      } else if (event.alpha !== null && !isNaN(event.alpha)) {
        compassHeading = Math.round((360 - event.alpha) % 360);
      }

      if (compassHeading !== null) {
        setLocationState(prev => {
          // Only update if heading changed meaningfully (> 2 degrees)
          if (Math.abs((prev.heading || 0) - compassHeading!) > 2) {
            return { ...prev, heading: compassHeading };
          }
          return prev;
        });
      }
    };

    if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  // Stop real location tracking
  const stopRealLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Set explicit simulated coordinates
  const setSimulatedCoords = useCallback((coords: Coordinates, sectorName?: string) => {
    stopRealLocationTracking();
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    setLocationState(prev => ({
      ...prev,
      coords,
      accuracy: 4,
      altitude: 275,
      heading: 68,
      speed: 1.2,
      timestamp: Date.now(),
      nearestSector: sectorName || getClosestGMCSector(coords),
      isLiveTracking: true,
      mode: 'simulated',
      status: 'active',
      trail: [...(prev.trail || []), coords].slice(-100),
    }));
  }, [stopRealLocationTracking]);

  // Start animated GMC corridor patrol simulation (moving along waypoints in real-time)
  const startPatrolSimulation = useCallback((routeId: string = 'spine-patrol') => {
    stopRealLocationTracking();
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    const route = GMC_PATROL_ROUTES.find(r => r.id === routeId) || GMC_PATROL_ROUTES[0];
    const waypoints = route.waypoints;
    simWaypointIndexRef.current = 0;

    const initialCoord = waypoints[0];
    setLocationState(prev => ({
      ...prev,
      coords: initialCoord,
      accuracy: 3,
      altitude: 260,
      heading: 52,
      speed: 4.8, // Walking/patrol speed km/h
      nearestSector: route.sector,
      mode: 'simulated',
      status: 'active',
      isLiveTracking: true,
      isAutoFollow: true,
      trail: [initialCoord],
      distanceTraveledKm: 0,
      timestamp: Date.now(),
    }));

    let currentIdx = 0;
    simulationIntervalRef.current = setInterval(() => {
      currentIdx = (currentIdx + 1) % waypoints.length;
      const target = waypoints[currentIdx];
      const prevPt = waypoints[(currentIdx - 1 + waypoints.length) % waypoints.length];
      
      // Calculate bearing between previous point and target
      const y = Math.sin(((target.lng - prevPt.lng) * Math.PI) / 180) * Math.cos((target.lat * Math.PI) / 180);
      const x = Math.cos((prevPt.lat * Math.PI) / 180) * Math.sin((target.lat * Math.PI) / 180) -
                Math.sin((prevPt.lat * Math.PI) / 180) * Math.cos((target.lat * Math.PI) / 180) * Math.cos(((target.lng - prevPt.lng) * Math.PI) / 180);
      const bearingRad = Math.atan2(y, x);
      const bearingDeg = Math.round(((bearingRad * 180) / Math.PI + 360) % 360);

      // Minor jitter to mimic authentic GPS satellite sensor readings
      const jitterLat = (Math.random() - 0.5) * 0.00008;
      const jitterLng = (Math.random() - 0.5) * 0.00008;
      const nextCoord = {
        lat: Number((target.lat + jitterLat).toFixed(6)),
        lng: Number((target.lng + jitterLng).toFixed(6)),
      };

      setLocationState(prev => {
        const stepKm = calculateDistanceKm(prev.coords, nextCoord);
        const newDist = Number(((prev.distanceTraveledKm || 0) + stepKm).toFixed(3));
        const newTrail = [...(prev.trail || []), nextCoord].slice(-100);

        return {
          ...prev,
          coords: nextCoord,
          heading: bearingDeg,
          speed: Number((4.2 + (Math.random() * 0.8)).toFixed(1)), // km/h
          altitude: Math.round(250 + Math.sin(currentIdx) * 15),
          accuracy: Math.round(3 + Math.random() * 2),
          nearestSector: getClosestGMCSector(nextCoord),
          timestamp: Date.now(),
          trail: newTrail,
          distanceTraveledKm: newDist,
        };
      });
    }, 1500);
  }, [stopRealLocationTracking]);

  // Toggle Auto-Follow camera behavior
  const setAutoFollow = useCallback((enable: boolean) => {
    setLocationState(prev => ({ ...prev, isAutoFollow: enable }));
  }, []);

  const toggleAutoFollow = useCallback(() => {
    setLocationState(prev => ({ ...prev, isAutoFollow: !prev.isAutoFollow }));
  }, []);

  // Clear live breadcrumbs trail
  const clearTrail = useCallback(() => {
    setLocationState(prev => ({
      ...prev,
      trail: [prev.coords],
      distanceTraveledKm: 0,
    }));
  }, []);

  // Toggle live tracking on/off
  const toggleLiveTracking = useCallback(() => {
    setLocationState(prev => {
      const nextTracking = !prev.isLiveTracking;
      if (!nextTracking) {
        stopRealLocationTracking();
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = null;
        }
      } else if (prev.mode === 'real') {
        startRealLocationTracking();
      } else {
        startPatrolSimulation();
      }
      return { ...prev, isLiveTracking: nextTracking };
    });
  }, [startRealLocationTracking, stopRealLocationTracking, startPatrolSimulation]);

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
    startPatrolSimulation,
    toggleLiveTracking,
    setAutoFollow,
    toggleAutoFollow,
    clearTrail,
  };
}


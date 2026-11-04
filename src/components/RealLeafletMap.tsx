import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  Crosshair, 
  Layers, 
  Compass, 
  Activity, 
  Eye, 
  ThumbsUp, 
  CheckCircle2, 
  Waves, 
  Trees, 
  Sparkles,
  RefreshCw,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Globe,
  Radio,
  Copy,
  Check,
  Play,
  Footprints,
  AlertTriangle,
  LocateFixed,
  LogOut,
  UserPlus
} from 'lucide-react';
import { CitizenReport, Mission, Coordinates, LiveLocationState } from '../types';
import { calculateDistanceKm, formatDistance, formatCoordinates, getCompassDirection, GMC_PATROL_ROUTES } from '../utils/geo';
import { GMC_SECTORS } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';
import { VoicePlayer } from './VoicePlayer';

export type MapTileStyle = 'satellite' | 'street' | 'voyager' | 'topo';

interface RealLeafletMapProps {
  reports: CitizenReport[];
  missions: Mission[];
  userLocation: LiveLocationState;
  mapStyle?: MapTileStyle;
  onMapStyleChange?: (style: MapTileStyle) => void;
  onSelectReport: (report: CitizenReport) => void;
  onJoinMission: (missionId: string) => void;
  onOpenReportModalWithCoords?: (coords: Coordinates, sectorName: string) => void;
  onOpenFixResolution?: (report: CitizenReport) => void;
  onRecenterGPS: () => void;
  onToggleTracking: () => void;
  onSimulateGMCLocation: (coords: Coordinates, sectorName: string) => void;
  onStartPatrolSimulation?: (routeId?: string) => void;
  onSetAutoFollow?: (enable: boolean) => void;
  onToggleAutoFollow?: () => void;
  onClearTrail?: () => void;
}

export const RealLeafletMap: React.FC<RealLeafletMapProps> = ({
  reports,
  missions,
  userLocation,
  mapStyle: externalMapStyle,
  onMapStyleChange,
  onSelectReport,
  onJoinMission,
  onOpenReportModalWithCoords,
  onOpenFixResolution,
  onRecenterGPS,
  onToggleTracking,
  onSimulateGMCLocation,
  onStartPatrolSimulation,
  onSetAutoFollow,
  onToggleAutoFollow,
  onClearTrail,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const trailPolylineRef = useRef<L.Polyline | null>(null);
  const trailGlowPolylineRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Satellite view is active by default
  const [internalMapStyle, setInternalMapStyle] = useState<MapTileStyle>('satellite');
  const mapStyle: MapTileStyle = externalMapStyle || internalMapStyle;

  const handleSetMapStyle = (newStyle: MapTileStyle) => {
    setInternalMapStyle(newStyle);
    if (onMapStyleChange) {
      onMapStyleChange(newStyle);
    }
  };

  const [allowWheelZoom, setAllowWheelZoom] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState(false);
  const [showTrail, setShowTrail] = useState(true);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [patrolSelectorOpen, setPatrolSelectorOpen] = useState(false);

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'report' | 'mission' | 'custom-pin';
    data: any;
    coords: Coordinates;
    distanceText: string;
  } | null>(null);
  const [droppedPin, setDroppedPin] = useState<Coordinates | null>(null);

  // Keep selectedEntity mission synced with live missions state
  useEffect(() => {
    if (selectedEntity?.type === 'mission' && selectedEntity.data?.id) {
      const updated = missions.find(m => m.id === selectedEntity.data.id);
      if (updated && (updated.joined !== selectedEntity.data.joined || updated.currentParticipants !== selectedEntity.data.currentParticipants)) {
        setSelectedEntity(prev => (prev ? { ...prev, data: updated } : null));
      }
    }
  }, [missions, selectedEntity?.type, selectedEntity?.data?.id]);

  // Compute nearby proximity alert (within 150 meters)
  const nearbyAlert = useMemo(() => {
    // Check missions first
    for (const m of missions) {
      const distKm = calculateDistanceKm(userLocation.coords, m.coordinates);
      if (distKm <= 0.15) {
        return {
          type: 'mission' as const,
          title: m.title,
          distanceText: formatDistance(distKm),
          data: m
        };
      }
    }
    // Then check reports
    for (const r of reports) {
      if (r.status !== 'resolved') {
        const distKm = calculateDistanceKm(userLocation.coords, r.coordinates);
        if (distKm <= 0.15) {
          return {
            type: 'report' as const,
            title: r.title,
            distanceText: formatDistance(distKm),
            data: r
          };
        }
      }
    }
    return null;
  }, [userLocation.coords, missions, reports]);

  // Map Tile Providers
  const TILE_SERVERS: Record<MapTileStyle, { url: string; attribution: string; maxZoom: number; subdomains?: string }> = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
      maxZoom: 19,
    },
    street: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
    voyager: {
      url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
      maxZoom: 20,
    },
    topo: {
      url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap',
      maxZoom: 17,
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = userLocation.coords.lat;
      const initialLng = userLocation.coords.lng;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: false,
        scrollWheelZoom: false,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
        touchZoom: 'center',
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Base Layer
      const baseTile = L.tileLayer(TILE_SERVERS[mapStyle].url, {
        attribution: TILE_SERVERS[mapStyle].attribution,
        maxZoom: TILE_SERVERS[mapStyle].maxZoom,
        subdomains: (TILE_SERVERS[mapStyle] as any).subdomains || 'abc',
      }).addTo(map);
      tileLayerRef.current = baseTile;

      // Group for markers
      const markerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markerGroup;

      // Map click handler to drop pinpoint
      map.on('click', (e: L.LeafletMouseEvent) => {
        const clickedCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
        setDroppedPin(clickedCoords);
        const dist = calculateDistanceKm(userLocation.coords, clickedCoords);
        setSelectedEntity({
          type: 'custom-pin',
          data: {
            lat: clickedCoords.lat,
            lng: clickedCoords.lng,
          },
          coords: clickedCoords,
          distanceText: formatDistance(dist),
        });
      });

      // When user drags or zooms manually, disengage auto-follow gracefully so they can explore
      map.on('dragstart', () => {
        onSetAutoFollow?.(false);
      });
      map.on('zoomstart', (e: any) => {
        // Only if user initiated
        if (e && e.originalEvent) {
          onSetAutoFollow?.(false);
        }
      });

      mapInstanceRef.current = map;

      // Trigger size invalidations
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 600);
      setTimeout(() => map.invalidateSize(), 1200);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Wheel Zoom behavior dynamically
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (allowWheelZoom) {
      mapInstanceRef.current.scrollWheelZoom.enable();
    } else {
      mapInstanceRef.current.scrollWheelZoom.disable();
    }
  }, [allowWheelZoom]);

  // Update Base Layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const newTile = L.tileLayer(TILE_SERVERS[mapStyle].url, {
      attribution: TILE_SERVERS[mapStyle].attribution,
      maxZoom: TILE_SERVERS[mapStyle].maxZoom,
      subdomains: (TILE_SERVERS[mapStyle] as any).subdomains || 'abc',
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [mapStyle]);

  // Update User Live Location Marker, Heading Beam & Accuracy Circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const { lat, lng } = userLocation.coords;
    const accuracy = userLocation.accuracy || 10;
    const heading = userLocation.heading ?? 0;
    const speed = userLocation.speed ?? 0;

    // Build custom high-tech GIS beacon with rotating direction cone
    const userPulseIcon = L.divIcon({
      className: 'custom-user-gps-marker',
      html: `
        <div class="relative flex items-center justify-center select-none pointer-events-none" style="width: 60px; height: 60px;">
          <!-- Real-Time Heading Field Beam (translucent 60-degree cone) -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300" style="transform: rotate(${heading}deg);">
            <svg viewBox="0 0 100 100" class="w-20 h-20 -translate-y-4 opacity-75 drop-shadow-md">
              <defs>
                <linearGradient id="liveGpsBeamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="#52b788" stop-opacity="0.85" />
                  <stop offset="50%" stop-color="#52b788" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#52b788" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path d="M 50 50 L 22 2 A 50 50 0 0 1 78 2 Z" fill="url(#liveGpsBeamGrad)" />
            </svg>
          </div>

          <!-- Outer Radar Ripple -->
          <div class="absolute w-10 h-10 rounded-full bg-[#52b788]/30 animate-ping"></div>
          
          <!-- Mid Glow Ring -->
          <div class="absolute w-8 h-8 rounded-full bg-[#1b4332]/40 border border-[#52b788]/60"></div>
          
          <!-- Core Steward Beacon -->
          <div class="w-6 h-6 rounded-full bg-[#1b4332] border-2 border-white shadow-2xl flex items-center justify-center relative z-10 ring-2 ring-[#52b788]">
            <div class="w-2 h-2 rounded-full bg-[#52b788] animate-pulse"></div>
          </div>
        </div>
      `,
      iconSize: [60, 60],
      iconAnchor: [30, 30],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([lat, lng], { icon: userPulseIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindTooltip(
          `<b>Live Citizen Telemetry</b><br/>Speed: ${speed} km/h • Bearing: ${heading}° (${getCompassDirection(heading)})`,
          { direction: 'top', offset: [0, -20] }
        );

      accuracyCircleRef.current = L.circle([lat, lng], {
        radius: Math.max(5, Math.min(accuracy, 250)),
        color: '#2d6a4f',
        fillColor: '#52b788',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4 4'
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([lat, lng]);
      userMarkerRef.current.setIcon(userPulseIcon);
      userMarkerRef.current.setTooltipContent(
        `<b>Live Citizen Telemetry</b><br/>Speed: ${speed} km/h • Bearing: ${heading}° (${getCompassDirection(heading)})`
      );

      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([lat, lng]);
        accuracyCircleRef.current.setRadius(Math.max(5, Math.min(accuracy, 250)));
      }
    }

    // Auto-Follow Camera: Glide map to keep user centered if auto-follow is active
    if (userLocation.isAutoFollow) {
      map.panTo([lat, lng], { animate: true, duration: 0.6 });
    }
  }, [userLocation.coords, userLocation.accuracy, userLocation.heading, userLocation.speed, userLocation.isAutoFollow]);

  // Render & Update Real-Time Breadcrumb Trail Polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (!showTrail || !userLocation.trail || userLocation.trail.length < 2) {
      if (trailPolylineRef.current) {
        map.removeLayer(trailPolylineRef.current);
        trailPolylineRef.current = null;
      }
      if (trailGlowPolylineRef.current) {
        map.removeLayer(trailGlowPolylineRef.current);
        trailGlowPolylineRef.current = null;
      }
      return;
    }

    const latLngs: L.LatLngExpression[] = userLocation.trail.map(pt => [pt.lat, pt.lng]);

    // Outer glow line
    if (!trailGlowPolylineRef.current) {
      trailGlowPolylineRef.current = L.polyline(latLngs, {
        color: '#1b4332',
        weight: 7,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    } else {
      trailGlowPolylineRef.current.setLatLngs(latLngs);
    }

    // Inner bright dashed trail line
    if (!trailPolylineRef.current) {
      trailPolylineRef.current = L.polyline(latLngs, {
        color: '#52b788',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '8 6',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    } else {
      trailPolylineRef.current.setLatLngs(latLngs);
    }
  }, [userLocation.trail, showTrail]);

  // Render Report, Mission, and Custom Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    // 1. Citizen Report Markers
    reports.forEach((report) => {
      const dist = calculateDistanceKm(userLocation.coords, report.coordinates);
      const categoryColors: Record<string, { bg: string; border: string; emoji: string }> = {
        wildlife: { bg: '#52b788', border: '#1b4332', emoji: '🐾' },
        forestry: { bg: '#2d6a4f', border: '#1b4332', emoji: '🌲' },
        municipal: { bg: '#3b82f6', border: '#1d4ed8', emoji: '🏛️' },
        agriculture: { bg: '#eab308', border: '#a16207', emoji: '🌾' },
        livestock: { bg: '#d97706', border: '#92400e', emoji: '🐂' },
        watershed: { bg: '#0ea5e9', border: '#0369a1', emoji: '💧' },
        waste: { bg: '#f59e0b', border: '#b45309', emoji: '♻️' },
        hazard: { bg: '#ef4444', border: '#991b1b', emoji: '⚠️' },
        botanical: { bg: '#10b981', border: '#065f46', emoji: '🌿' },
        infrastructure: { bg: '#8b5cf6', border: '#5b21b6', emoji: '🌉' }
      };
      const cat = categoryColors[report.category] || categoryColors.wildlife;
      const isPendingVerification = report.status === 'pending_verification';

      const hasVoice = Boolean(report.voiceAudioUrl);
      const reportIcon = L.divIcon({
        className: 'custom-report-marker',
        html: `
          <div class="group relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-115">
            <div class="w-8 h-8 rounded-2xl flex items-center justify-center text-sm shadow-md border-2 ${
              isPendingVerification ? 'ring-2 ring-amber-400 animate-pulse' : ''
            }" style="background: ${isPendingVerification ? '#fbbf24' : cat.bg}; border-color: ${cat.border};">
              <span>${isPendingVerification ? '⏳' : cat.emoji}</span>
              ${hasVoice ? '<span class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#081c15] text-white text-[9px] rounded-full flex items-center justify-center border border-[#52b788] shadow-xs" title="Voice Dispatch Available">🎙️</span>' : ''}
            </div>
            <div class="absolute -bottom-1 w-2 h-2 rotate-45" style="background: ${cat.border};"></div>
          </div>
        `,
        iconSize: [32, 36],
        iconAnchor: [16, 36],
      });

      const marker = L.marker([report.coordinates.lat, report.coordinates.lng], { icon: reportIcon });
      marker.on('click', () => {
        playMindfulChime('bell');
        setSelectedEntity({
          type: 'report',
          data: report,
          coords: report.coordinates,
          distanceText: formatDistance(dist),
        });
      });

      marker.bindTooltip(`
        <div class="p-1 font-sans">
          <div class="font-bold text-xs text-[#1b4332]">${report.title}</div>
          <div class="text-[10px] text-gray-600">${formatDistance(dist)} away • ${
            isPendingVerification ? '⏳ Verification in Progress' : report.sector
          }</div>
          ${hasVoice ? '<div class="text-[10px] text-emerald-800 font-extrabold flex items-center gap-1 mt-0.5">🎙️ Voice Dispatch Recorded</div>' : ''}
        </div>
      `, { direction: 'top', offset: [0, -32] });

      layerGroup.addLayer(marker);
    });

    // 2. Community Mission Markers
    missions.forEach((mission) => {
      const dist = calculateDistanceKm(userLocation.coords, mission.coordinates);
      const missionIcon = L.divIcon({
        className: 'custom-mission-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-115">
            <div class="w-9 h-9 rounded-full bg-[#1b4332] text-[#52b788] flex items-center justify-center shadow-lg border-2 border-[#52b788] animate-bounce">
              <span class="text-xs font-black">🌱</span>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([mission.coordinates.lat, mission.coordinates.lng], { icon: missionIcon });
      marker.on('click', () => {
        playMindfulChime('bell');
        setSelectedEntity({
          type: 'mission',
          data: mission,
          coords: mission.coordinates,
          distanceText: formatDistance(dist),
        });
      });

      marker.bindTooltip(`
        <div class="p-1 font-sans">
          <div class="font-bold text-xs text-[#1b4332]">Mission: ${mission.title}</div>
          <div class="text-[10px] text-gray-600">+${mission.rewardPoints} Karma • ${formatDistance(dist)} away</div>
        </div>
      `, { direction: 'top', offset: [0, -32] });

      layerGroup.addLayer(marker);
    });

    // 3. Dropped Pin Marker
    if (droppedPin) {
      const pinIcon = L.divIcon({
        className: 'custom-dropped-pin',
        html: `
          <div class="flex items-center justify-center text-red-600 animate-pulse">
            <div class="w-8 h-8 rounded-full bg-[#e76f51] text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-xl">
              📍
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      const pinMarker = L.marker([droppedPin.lat, droppedPin.lng], { icon: pinIcon });
      layerGroup.addLayer(pinMarker);
    }
  }, [reports, missions, userLocation.coords, droppedPin]);

  // Recenter map on user GPS with smooth flyTo and re-enable Auto-Follow
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [userLocation.coords.lat, userLocation.coords.lng],
        16,
        { duration: 0.9, easeLinearity: 0.25 }
      );
    }
    onSetAutoFollow?.(true);
    playMindfulChime('bell');
    onRecenterGPS();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
  };

  const copyCoordinatesToClipboard = () => {
    const text = `${userLocation.coords.lat.toFixed(6)}, ${userLocation.coords.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    });
  };

  const compassHeading = userLocation.heading ?? 0;
  const compassCardinal = getCompassDirection(compassHeading);

  return (
    <div 
      ref={mapWrapperRef}
      className={`relative w-full rounded-3xl bg-[#081c15] border border-[#2d6a4f]/40 overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : ''
      }`}
    >
      
      {/* Real-time Map Canvas Container */}
      <div 
        ref={mapContainerRef} 
        className={`w-full z-0 focus:outline-none min-h-[380px] sm:min-h-[480px] ${
          isFullscreen ? 'h-screen' : 'h-[400px] sm:h-[500px] md:h-[600px] lg:h-[660px]'
        }`}
        style={{ touchAction: 'pan-x pan-y', width: '100%' }}
      />

      {/* Top Floating Proximity Alert (Within 150m of report or mission) */}
      {nearbyAlert && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[92%] sm:max-w-md animate-in fade-in slide-in-from-top-2">
          <div 
            onClick={() => {
              playMindfulChime('bell');
              setSelectedEntity({
                type: nearbyAlert.type,
                data: nearbyAlert.data,
                coords: (nearbyAlert.data as any).coordinates,
                distanceText: nearbyAlert.distanceText
              });
            }}
            className="cursor-pointer bg-[#1b4332]/95 hover:bg-[#2d6a4f] backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#52b788] text-white shadow-2xl flex items-center space-x-2.5 transition active:scale-98"
          >
            <div className="w-6 h-6 rounded-full bg-[#52b788] text-[#081c15] flex items-center justify-center text-xs font-black shrink-0 animate-pulse">
              {nearbyAlert.type === 'mission' ? '🌱' : '⚠️'}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[#74c69d] font-bold uppercase tracking-wider flex items-center space-x-1">
                <span>Nearby Action • {nearbyAlert.distanceText}</span>
              </div>
              <p className="text-xs font-extrabold text-white truncate max-w-[240px] sm:max-w-xs">
                {nearbyAlert.title}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top-Left HUD: Live Telemetry Dashboard */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 max-w-[calc(100%-80px)] sm:max-w-none z-20 flex flex-col gap-2 pointer-events-none">
        
        {/* Main Live Telemetry Capsule */}
        <div className="pointer-events-auto bg-[#081c15]/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-[#52b788]/40 text-white shadow-xl flex flex-col space-y-1.5 transition">
          <div className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center justify-center shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#52b788]" />
                <span className="absolute w-4 h-4 rounded-full bg-[#52b788]/50 animate-ping" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5 text-[9px] sm:text-[10px] font-black tracking-wider text-[#d8f3dc]">
                  <span>{userLocation.mode === 'real' ? 'LIVE GPS TRACKING' : 'PATROL SIMULATOR'}</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] bg-[#52b788] text-[#081c15] font-black uppercase">
                    {userLocation.isLiveTracking ? 'ACTIVE' : 'PAUSED'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-mono font-bold text-white flex items-center space-x-1.5">
                  <span>{formatCoordinates(userLocation.coords)}</span>
                  <button 
                    type="button" 
                    onClick={copyCoordinatesToClipboard}
                    className="hover:text-[#52b788] text-gray-400 transition"
                    title="Copy exact coordinates"
                  >
                    {copiedCoords ? <Check className="w-3 h-3 text-[#52b788]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </p>
              </div>
            </div>

            {/* Toggle Telemetry Expand */}
            <button
              type="button"
              onClick={() => setIsTelemetryExpanded(!isTelemetryExpanded)}
              className="p-1 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition"
              title={isTelemetryExpanded ? "Collapse telemetry" : "Expand telemetry metrics"}
            >
              {isTelemetryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Auto-Follow Status Pill */}
          <div className="flex items-center justify-between text-[10px] pt-0.5 border-t border-white/10">
            <span className="text-gray-400">Camera lock:</span>
            <button
              type="button"
              onClick={() => onToggleAutoFollow?.()}
              className={`font-bold px-1.5 py-0.5 rounded transition flex items-center space-x-1 ${
                userLocation.isAutoFollow 
                  ? 'bg-[#52b788]/20 text-[#74c69d]' 
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${userLocation.isAutoFollow ? 'bg-[#52b788]' : 'bg-amber-400'}`} />
              <span>{userLocation.isAutoFollow ? 'Locked on You' : 'Free Explore (Tap to Lock)'}</span>
            </button>
          </div>

          {/* Expanded Real-Time Sensor Telemetry */}
          {isTelemetryExpanded && (
            <div className="pt-2 border-t border-white/15 grid grid-cols-2 gap-2 text-[10px] animate-in fade-in duration-200">
              <div className="bg-white/5 p-1.5 rounded-xl">
                <span className="text-gray-400 block">Speed & Pace:</span>
                <span className="font-mono font-bold text-white text-[11px]">{userLocation.speed || 0} km/h</span>
              </div>
              <div className="bg-white/5 p-1.5 rounded-xl">
                <span className="text-gray-400 block">Compass Bearing:</span>
                <span className="font-mono font-bold text-[#74c69d] text-[11px] flex items-center space-x-1">
                  <span style={{ display: 'inline-block', transform: `rotate(${compassHeading}deg)` }}>🧭</span>
                  <span>{compassHeading}° {compassCardinal}</span>
                </span>
              </div>
              <div className="bg-white/5 p-1.5 rounded-xl">
                <span className="text-gray-400 block">Elevation:</span>
                <span className="font-mono font-bold text-white text-[11px]">{userLocation.altitude || 240}m AMSL</span>
              </div>
              <div className="bg-white/5 p-1.5 rounded-xl">
                <span className="text-gray-400 block">GPS Precision:</span>
                <span className="font-mono font-bold text-[#74c69d] text-[11px]">±{userLocation.accuracy}m</span>
              </div>
              <div className="col-span-2 bg-white/5 p-1.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block">Patrol Distance Walked:</span>
                  <span className="font-mono font-bold text-white text-[11px]">
                    {userLocation.distanceTraveledKm ? `${userLocation.distanceTraveledKm} km` : '0.000 km'}
                  </span>
                </div>
                {onClearTrail && (
                  <button
                    type="button"
                    onClick={onClearTrail}
                    className="px-2 py-1 rounded-lg text-[9px] bg-red-500/20 hover:bg-red-500/30 text-red-200 font-bold transition"
                  >
                    Reset Trail
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Recenter, Follow Mode, Trail Toggle, Safe Wheel Zoom, Fullscreen, Tile Switcher */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex flex-col space-y-1.5 sm:space-y-2">
        
        {/* Recenter & Re-lock Camera on Me */}
        <button
          type="button"
          onClick={handleRecenter}
          className={`p-2.5 rounded-2xl border shadow-xl transition-all flex items-center justify-center group active:scale-95 min-h-[44px] min-w-[44px] ${
            userLocation.isAutoFollow 
              ? 'bg-[#1b4332] text-[#52b788] border-[#52b788] ring-2 ring-[#52b788]/40' 
              : 'bg-[#081c15]/95 hover:bg-[#1b4332] text-white border-white/20'
          }`}
          title={userLocation.isAutoFollow ? "Following Live User Location" : "Center & Lock onto Live Location"}
        >
          <Crosshair className={`w-5 h-5 ${userLocation.isAutoFollow ? 'text-[#52b788] animate-spin-slow' : 'text-gray-300'}`} />
        </button>

        {/* Trail Toggle */}
        <button
          type="button"
          onClick={() => setShowTrail(!showTrail)}
          className={`p-2.5 rounded-2xl border shadow-xl transition-all flex items-center justify-center active:scale-95 min-h-[44px] min-w-[44px] ${
            showTrail
              ? 'bg-[#1b4332] text-[#52b788] border-[#52b788]/50'
              : 'bg-[#081c15]/95 text-gray-400 border-white/20'
          }`}
          title={showTrail ? "Hide live patrol breadcrumb trail" : "Show live patrol breadcrumb trail"}
        >
          <Footprints className="w-5 h-5" />
        </button>

        {/* Wheel Zoom Lock Toggle */}
        <button
          type="button"
          onClick={() => setAllowWheelZoom(!allowWheelZoom)}
          className={`p-2.5 rounded-2xl border shadow-xl transition-all flex items-center justify-center group active:scale-95 min-h-[44px] min-w-[44px] ${
            allowWheelZoom
              ? 'bg-[#52b788] text-[#081c15] border-[#52b788]'
              : 'bg-[#1b4332]/95 hover:bg-[#2d6a4f] text-[#d8f3dc] border-[#52b788]/30'
          }`}
          title={allowWheelZoom ? "Wheel Zoom Enabled (Click to lock page scroll)" : "Scroll Safe (Click to enable wheel zoom)"}
        >
          {allowWheelZoom ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2.5 rounded-2xl bg-[#1b4332]/95 hover:bg-[#2d6a4f] text-white border border-[#52b788]/30 shadow-xl transition-all flex items-center justify-center active:scale-95 min-h-[44px] min-w-[44px]"
          title={isFullscreen ? "Exit Fullscreen" : "Immersive Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Tile Layers Selector */}
        <div className="bg-[#1b4332]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#52b788]/30 shadow-xl flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => handleSetMapStyle('satellite')}
            className={`px-2 py-1.5 rounded-xl text-[10px] font-bold text-left transition flex items-center space-x-1.5 min-h-[34px] ${
              mapStyle === 'satellite' ? 'bg-[#52b788] text-[#081c15]' : 'text-gray-300 hover:text-white'
            }`}
            title="Satellite Aerial Imagery"
          >
            <span>🛰️</span>
            <span className="hidden sm:inline">Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetMapStyle('street')}
            className={`px-2 py-1.5 rounded-xl text-[10px] font-bold text-left transition flex items-center space-x-1.5 min-h-[34px] ${
              mapStyle === 'street' ? 'bg-[#52b788] text-[#081c15]' : 'text-gray-300 hover:text-white'
            }`}
            title="Street Map"
          >
            <span>🗺️</span>
            <span className="hidden sm:inline">Street</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetMapStyle('topo')}
            className={`px-2 py-1.5 rounded-xl text-[10px] font-bold text-left transition flex items-center space-x-1.5 min-h-[34px] ${
              mapStyle === 'topo' ? 'bg-[#52b788] text-[#081c15]' : 'text-gray-300 hover:text-white'
            }`}
            title="Topography"
          >
            <span>⛰️</span>
            <span className="hidden sm:inline">Topo</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Sector Teleport & Simulation Controls */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Sector Quick Jump Pills */}
        <div className="pointer-events-auto flex items-center space-x-1.5 overflow-x-auto max-w-[calc(100%-140px)] sm:max-w-none pb-1 scrollbar-none bg-[#081c15]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#2d6a4f]/50">
          <span className="text-[10px] font-bold uppercase text-gray-400 px-2 flex items-center shrink-0">
            <Compass className="w-3.5 h-3.5 mr-1 text-[#52b788]" /> Sectors:
          </span>
          {GMC_SECTORS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onSimulateGMCLocation(s.coordinates, s.name);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([s.coordinates.lat, s.coordinates.lng], 15, { duration: 1.0 });
                }
              }}
              className="px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold bg-[#1b4332]/80 hover:bg-[#2d6a4f] text-[#d8f3dc] whitespace-nowrap transition border border-[#52b788]/20 shrink-0 min-h-[32px] flex items-center"
            >
              {s.name.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Real GPS vs Patrol Simulator Toggle */}
        <div className="pointer-events-auto flex items-center space-x-1.5">
          {userLocation.mode === 'simulated' ? (
            <button
              type="button"
              onClick={() => {
                onRecenterGPS();
                playMindfulChime('bell');
              }}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-[11px] sm:text-xs shadow-lg transition flex items-center space-x-1.5 shrink-0 min-h-[38px]"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>Use My Device GPS</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onStartPatrolSimulation) {
                  onStartPatrolSimulation('spine-patrol');
                } else {
                  onToggleTracking();
                }
                playMindfulChime('bell');
              }}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white border border-[#52b788] font-bold text-[11px] sm:text-xs shadow-lg transition flex items-center space-x-1.5 shrink-0 min-h-[38px]"
            >
              <Play className="w-3.5 h-3.5 text-[#52b788]" />
              <span>Simulate GMC Patrol</span>
            </button>
          )}
        </div>
      </div>

      {/* Entity Details Floating Popup (when marker or pin is clicked) */}
      {selectedEntity && (
        <div className="absolute bottom-16 sm:bottom-auto sm:top-20 left-3 sm:left-4 right-3 sm:right-auto sm:w-96 z-30 bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-3 max-h-[65vh] sm:max-h-[80vh] overflow-y-auto">
          <div className="flex items-start justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-[#d8f3dc] text-[#1b4332]">
                {selectedEntity.type === 'report' ? 'Citizen Observation' : selectedEntity.type === 'mission' ? 'Active Mission' : 'Custom Pin'}
              </span>
              <span className="text-xs text-gray-500 font-medium">{selectedEntity.distanceText} away</span>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-gray-400 hover:text-gray-600 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* 1. Report Content */}
          {selectedEntity.type === 'report' && (
            <div className="mt-3 space-y-3">
              <h4 className="text-sm font-bold text-[#1b4332]">{selectedEntity.data.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{selectedEntity.data.description}</p>
              
              {/* Citizen Voice Audio Dispatch */}
              {selectedEntity.data.voiceAudioUrl && (
                <VoicePlayer
                  audioUrl={selectedEntity.data.voiceAudioUrl}
                  durationSeconds={selectedEntity.data.voiceDurationSeconds}
                  label="Citizen Field Voice Dispatch"
                />
              )}

              {selectedEntity.data.photoUrl && (
                <img
                  src={selectedEntity.data.photoUrl}
                  alt={selectedEntity.data.title}
                  className="w-full h-32 object-cover rounded-xl border border-gray-100"
                  referrerPolicy="no-referrer"
                />
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Status: <strong className="text-[#1b4332] uppercase">{selectedEntity.data.status}</strong></span>
                <span>+{selectedEntity.data.karmaAwarded || 30} Karma</span>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => onSelectReport(selectedEntity.data)}
                  className="flex-1 py-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs text-center transition"
                >
                  View Full Details
                </button>
                {onOpenFixResolution && selectedEntity.data.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => onOpenFixResolution(selectedEntity.data)}
                    className="py-2 px-3 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-bold text-xs transition"
                  >
                    Submit Fix
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. Mission Content */}
          {selectedEntity.type === 'mission' && (() => {
            const liveMission = missions.find(m => m.id === selectedEntity.data?.id) || selectedEntity.data;
            if (!liveMission) return null;
            return (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                    {liveMission.category?.replace('-', ' ') || 'Action'}
                  </span>
                  <span className="text-xs font-bold text-[#2d6a4f]">+{liveMission.rewardPoints} Karma</span>
                </div>
                <h4 className="text-sm font-bold text-[#1b4332]">{liveMission.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{liveMission.description}</p>
                <div className="bg-[#f8f9f6] p-2.5 rounded-xl border border-gray-200 text-xs flex justify-between">
                  <span>Sector: <strong>{liveMission.sector?.split(':')[0]}</strong></span>
                  <span className="text-gray-600">{liveMission.currentParticipants} of {liveMission.targetParticipants} joined</span>
                </div>
                <button
                  type="button"
                  onClick={() => onJoinMission(liveMission.id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 min-h-[44px] ${
                    liveMission.joined
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 shadow-xs'
                      : 'bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] shadow-md'
                  }`}
                >
                  {liveMission.joined ? (
                    <>
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Leave Mission</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-[#081c15]" />
                      <span>Join Community Mission</span>
                    </>
                  )}
                </button>
              </div>
            );
          })()}

          {/* 3. Custom Dropped Pin Content */}
          {selectedEntity.type === 'custom-pin' && (
            <div className="mt-3 space-y-3">
              <h4 className="text-sm font-bold text-[#1b4332]">Selected Map Coordinates</h4>
              <p className="text-xs font-mono bg-gray-50 p-2 rounded-lg border text-gray-700">
                {selectedEntity.coords.lat.toFixed(6)}, {selectedEntity.coords.lng.toFixed(6)}
              </p>
              <p className="text-xs text-gray-500">
                Distance from your location: <strong className="text-gray-900">{selectedEntity.distanceText}</strong>
              </p>
              {onOpenReportModalWithCoords && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenReportModalWithCoords(selectedEntity.coords, 'Selected Location');
                    setSelectedEntity(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-bold text-xs transition"
                >
                  File Observation at this Point
                </button>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
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
  ExternalLink,
  ShieldCheck,
  Globe,
  Radio
} from 'lucide-react';
import { CitizenReport, Mission, Coordinates, LiveLocationState } from '../types';
import { calculateDistanceKm, formatDistance, formatCoordinates } from '../utils/geo';
import { GMC_SECTORS } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';

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
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Satellite view is active by default as requested
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

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'report' | 'mission' | 'custom-pin';
    data: any;
    coords: Coordinates;
    distanceText: string;
  } | null>(null);
  const [droppedPin, setDroppedPin] = useState<Coordinates | null>(null);

  // Map Tile Providers (High Performance & Ultra Reliable Satellite, Street, and Topo)
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

      // Initialize with smooth scrollWheelZoom disabled by default so page scrolling is never blocked
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: false, // Default false to prevent trapping vertical page scroll
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
        touchZoom: 'center',
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Initial Base Layer
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

      mapInstanceRef.current = map;

      // Trigger multiple size invalidations to guarantee tile rendering across all devices and flex containers
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 500);
      setTimeout(() => map.invalidateSize(), 1200);
    }

    // Set up ResizeObserver to keep tiles smooth on container resize
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

  // Update User Live Location Marker & Accuracy Circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const { lat, lng } = userLocation.coords;
    const accuracy = userLocation.accuracy || 15;

    // Create custom live pulsing GPS user icon
    const userPulseIcon = L.divIcon({
      className: 'custom-user-gps-marker',
      html: `
        <div class="relative flex items-center justify-center pointer-events-none">
          <div class="absolute w-8 h-8 rounded-full bg-[#1b4332]/25 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-[#1b4332] border-2 border-white shadow-xl flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-[#52b788]"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([lat, lng], { icon: userPulseIcon })
        .addTo(map)
        .bindTooltip('<b>You are here</b><br/>GMC Citizen Telemetry', { direction: 'top', offset: [0, -10] });

      accuracyCircleRef.current = L.circle([lat, lng], {
        radius: Math.min(accuracy, 200),
        color: '#2d6a4f',
        fillColor: '#52b788',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '3 4'
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([lat, lng]);
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([lat, lng]);
        accuracyCircleRef.current.setRadius(Math.min(accuracy, 200));
      }
    }
  }, [userLocation.coords, userLocation.accuracy, userLocation.heading]);

  // Render Report, Mission, and Project 108 Bridge Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    // 1. Citizen Report Markers
    reports.forEach((report) => {
      const dist = calculateDistanceKm(userLocation.coords, report.coordinates);
      const categoryColors: Record<string, { bg: string; border: string; emoji: string }> = {
        wildlife: { bg: '#52b788', border: '#1b4332', emoji: '🐾' },
        watershed: { bg: '#0ea5e9', border: '#0369a1', emoji: '💧' },
        waste: { bg: '#f59e0b', border: '#b45309', emoji: '♻️' },
        hazard: { bg: '#ef4444', border: '#991b1b', emoji: '⚠️' },
        botanical: { bg: '#10b981', border: '#065f46', emoji: '🌿' },
        infrastructure: { bg: '#8b5cf6', border: '#5b21b6', emoji: '🌉' }
      };
      const cat = categoryColors[report.category] || categoryColors.wildlife;
      const isPendingVerification = report.status === 'pending_verification';

      const reportIcon = L.divIcon({
        className: 'custom-report-marker',
        html: `
          <div class="group relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-115">
            <div class="w-8 h-8 rounded-2xl flex items-center justify-center text-sm shadow-md border-2 ${
              isPendingVerification ? 'ring-2 ring-amber-400 animate-pulse' : ''
            }" style="background: ${isPendingVerification ? '#fbbf24' : cat.bg}; border-color: ${cat.border};">
              <span>${isPendingVerification ? '⏳' : cat.emoji}</span>
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

  // Recenter map on user GPS with smooth flyTo
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [userLocation.coords.lat, userLocation.coords.lng],
        15,
        { duration: 1.0, easeLinearity: 0.25 }
      );
    }
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
        className={`w-full z-0 focus:outline-none min-h-[460px] ${
          isFullscreen ? 'h-screen' : 'h-[460px] sm:h-[540px] md:h-[620px]'
        }`}
        style={{ touchAction: 'pan-x pan-y', minHeight: '460px', width: '100%' }}
      />

      {/* Top HUD: Real-Time GPS Telemetry Strip */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-auto z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        
        {/* Live GPS Coordinates Pill */}
        <div className="pointer-events-auto bg-[#1b4332]/95 backdrop-blur-md px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border border-[#52b788]/40 text-white shadow-lg flex items-center space-x-2.5 sm:space-x-3">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#52b788]" />
            <span className="absolute w-4 h-4 rounded-full bg-[#52b788]/40 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-extrabold text-[#d8f3dc]">
              <span>LIVE GIS TELEMETRY</span>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded bg-[#52b788] text-[#081c15] font-black">
                {userLocation.mode === 'real' ? 'DEVICE GPS' : 'GMC SIMULATOR'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-mono font-bold text-white">
              {formatCoordinates(userLocation.coords)}
            </p>
          </div>
        </div>

        {/* Accuracy & Sector Pill */}
        <div className="pointer-events-auto hidden md:flex items-center space-x-3 bg-[#081c15]/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-[#2d6a4f]/50 text-white text-xs shadow-lg">
          <div>
            <span className="text-[10px] text-gray-400 block">Sector / District:</span>
            <span className="font-bold text-[#d8f3dc] truncate max-w-[200px] block">
              {userLocation.nearestSector}
            </span>
          </div>
          <div className="border-l border-white/20 pl-3">
            <span className="text-[10px] text-gray-400 block">Accuracy:</span>
            <span className="font-mono font-bold text-[#74c69d]">±{userLocation.accuracy}m</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Recenter, Layers, Wheel Zoom Lock, Fullscreen */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex flex-col space-y-2">
        
        {/* Recenter / Locate Me Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="p-2.5 sm:p-3 rounded-2xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white border border-[#52b788]/40 shadow-xl transition-all flex items-center justify-center group active:scale-95"
          title="Recenter to Live GPS"
        >
          <Crosshair className="w-4 h-4 sm:w-5 sm:h-5 text-[#52b788] group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Wheel Zoom Safe Lock Toggle (Lets user easily scroll page vs zoom map) */}
        <button
          type="button"
          onClick={() => setAllowWheelZoom(!allowWheelZoom)}
          className={`p-2.5 sm:p-3 rounded-2xl border shadow-xl transition-all flex items-center justify-center group active:scale-95 ${
            allowWheelZoom
              ? 'bg-[#52b788] text-[#081c15] border-[#52b788]'
              : 'bg-[#1b4332]/95 hover:bg-[#2d6a4f] text-[#d8f3dc] border-[#52b788]/30'
          }`}
          title={allowWheelZoom ? "Wheel Zoom Enabled (Click to Lock Page Scroll)" : "Page Scroll Safe (Click to Enable Wheel Zoom)"}
        >
          {allowWheelZoom ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2.5 sm:p-3 rounded-2xl bg-[#1b4332]/95 hover:bg-[#2d6a4f] text-white border border-[#52b788]/30 shadow-xl transition-all flex items-center justify-center active:scale-95"
          title={isFullscreen ? "Exit Fullscreen" : "Immersive Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Map Layer Switcher */}
        <div className="bg-[#1b4332]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#52b788]/30 shadow-xl flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => handleSetMapStyle('satellite')}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-left transition flex items-center space-x-1.5 ${
              mapStyle === 'satellite' ? 'bg-[#52b788] text-[#081c15]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>🛰️ Satellite (Aerial)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetMapStyle('street')}
            className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold text-left transition flex items-center space-x-1.5 ${
              mapStyle === 'street' ? 'bg-[#52b788] text-[#081c15]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>🗺️ Street (OSM)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetMapStyle('voyager')}
            className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold text-left transition flex items-center space-x-1.5 ${
              mapStyle === 'voyager' ? 'bg-[#52b788] text-[#081c15]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>🌿 Mindful GIS</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetMapStyle('topo')}
            className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold text-left transition flex items-center space-x-1.5 ${
              mapStyle === 'topo' ? 'bg-[#52b788] text-[#081c15]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>⛰️ Topography</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Sector Quick-Jump / Simulation Hub */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Gelephu Sector Teleport Pills */}
        <div className="pointer-events-auto flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none bg-[#081c15]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#2d6a4f]/50">
          <span className="text-[10px] font-bold uppercase text-gray-400 px-2 flex items-center shrink-0">
            <Compass className="w-3.5 h-3.5 mr-1 text-[#52b788]" /> Jump:
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
              className="px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold bg-[#1b4332]/80 hover:bg-[#2d6a4f] text-[#d8f3dc] whitespace-nowrap transition border border-[#52b788]/20 shrink-0"
            >
              {s.name.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Real GPS / Simulator Mode Switch */}
        <button
          type="button"
          onClick={onToggleTracking}
          className="pointer-events-auto px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-[11px] sm:text-xs shadow-lg transition flex items-center space-x-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{userLocation.mode === 'real' ? 'Simulate Gelephu Walk' : 'Use My Device GPS'}</span>
        </button>
      </div>

      {/* Entity Details Floating Popup (when marker or pin is clicked) */}
      {selectedEntity && (
        <div className="absolute top-16 sm:top-20 left-3 sm:left-4 right-3 sm:right-auto sm:w-96 z-30 bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-3 max-h-[80vh] overflow-y-auto">
          <div className="flex items-start justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-[#d8f3dc] text-[#1b4332]">
                {selectedEntity.type === 'report' ? 'Citizen Observation' : selectedEntity.type === 'mission' ? 'Active Mission' : 'Custom Pin'}
              </span>
              <span className="text-xs text-gray-500 font-medium">{selectedEntity.distanceText} away</span>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
          </div>

          {/* 1. Report Content */}
          {selectedEntity.type === 'report' && (
            <div className="mt-3 space-y-3">
              <h4 className="text-sm font-bold text-[#1b4332]">{selectedEntity.data.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{selectedEntity.data.description}</p>
              
              {selectedEntity.data.photoUrl && (
                <img
                  src={selectedEntity.data.photoUrl}
                  alt={selectedEntity.data.title}
                  className="w-full h-32 object-cover rounded-xl border border-gray-100"
                  referrerPolicy="no-referrer"
                />
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>📍 {selectedEntity.data.locationName}</span>
                <span className="font-bold text-[#2d6a4f]">+{selectedEntity.data.pointsAwarded} Karma</span>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => {
                    onSelectReport(selectedEntity.data);
                    setSelectedEntity(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold transition"
                >
                  View Full Details
                </button>
                {onOpenFixResolution && selectedEntity.data.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      onOpenFixResolution(selectedEntity.data);
                      setSelectedEntity(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] text-xs font-extrabold transition"
                  >
                    ✨ Resolve & Earn
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. Mission Content */}
          {selectedEntity.type === 'mission' && (
            <div className="mt-3 space-y-3">
              <h4 className="text-sm font-bold text-[#1b4332]">{selectedEntity.data.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{selectedEntity.data.description}</p>

              <div className="p-2.5 rounded-xl bg-[#d8f3dc]/50 text-xs text-[#1b4332] space-y-1">
                <div className="flex justify-between">
                  <span>📅 Date & Time:</span>
                  <span className="font-bold">{selectedEntity.data.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>🌱 Bounty Reward:</span>
                  <span className="font-extrabold text-[#2d6a4f]">+{selectedEntity.data.rewardPoints} Karma Points</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onJoinMission(selectedEntity.data.id);
                  setSelectedEntity(null);
                }}
                className="w-full py-2.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] text-xs font-extrabold transition shadow-md"
              >
                {selectedEntity.data.joined ? '✓ Joined & Confirmed' : 'Join Citizen Mission'}
              </button>
            </div>
          )}

          {/* 3. Custom Dropped Pin Content */}
          {selectedEntity.type === 'custom-pin' && (
            <div className="mt-3 space-y-3">
              <h4 className="text-sm font-bold text-[#1b4332]">Custom Location Marked</h4>
              <p className="text-xs font-mono text-gray-600">
                Coordinates: {formatCoordinates(selectedEntity.coords)}
              </p>
              <p className="text-xs text-gray-500">
                Spot something in the field at this location? Report a hazard, wildlife sighting, or river debris.
              </p>
              {onOpenReportModalWithCoords && (
                <button
                  onClick={() => {
                    onOpenReportModalWithCoords(selectedEntity.coords, userLocation.nearestSector);
                    setSelectedEntity(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold transition shadow-md"
                >
                  📸 Log Observation at this Pin
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subtle Bottom Scroll Hint */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden md:flex items-center space-x-1 text-[10px] text-white/60 bg-[#081c15]/60 px-2 py-0.5 rounded-full">
        <span>↓ Scroll down to view report directory & missions</span>
      </div>
    </div>
  );
};

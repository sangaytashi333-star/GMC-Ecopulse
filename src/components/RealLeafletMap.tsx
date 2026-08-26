import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
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
  Maximize2
} from 'lucide-react';
import { CitizenReport, Mission, Coordinates, LiveLocationState } from '../types';
import { calculateDistanceKm, formatDistance, formatCoordinates } from '../utils/geo';
import { GMC_SECTORS } from '../data/initialData';

interface RealLeafletMapProps {
  reports: CitizenReport[];
  missions: Mission[];
  userLocation: LiveLocationState;
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
  onSelectReport,
  onJoinMission,
  onOpenReportModalWithCoords,
  onOpenFixResolution,
  onRecenterGPS,
  onToggleTracking,
  onSimulateGMCLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'osm' | 'topo' | 'satellite'>('osm');
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'report' | 'mission' | 'custom-pin';
    data: any;
    coords: Coordinates;
    distanceText: string;
  } | null>(null);
  const [droppedPin, setDroppedPin] = useState<Coordinates | null>(null);

  // Map Tile Providers
  const TILE_SERVERS = {
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; OSM contributors, SRTM | Map style: &copy; OpenTopoMap',
      maxZoom: 17,
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
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
        zoom: 14,
        zoomControl: false,
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Initial Base Layer
      const baseTile = L.tileLayer(TILE_SERVERS[mapStyle].url, {
        attribution: TILE_SERVERS[mapStyle].attribution,
        maxZoom: TILE_SERVERS[mapStyle].maxZoom,
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
    }

    return () => {
      // Clean up map instance on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const newTile = L.tileLayer(TILE_SERVERS[mapStyle].url, {
      attribution: TILE_SERVERS[mapStyle].attribution,
      maxZoom: TILE_SERVERS[mapStyle].maxZoom,
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
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-[#3b82f6]/30 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-[#1d4ed8] border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
          ${userLocation.heading ? `
            <div class="absolute -top-3 text-[10px] transform -rotate-45 font-bold text-blue-800">▲</div>
          ` : ''}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([lat, lng], { icon: userPulseIcon })
        .addTo(map)
        .bindTooltip('<b>You are here</b><br/>Live GPS Telemetry', { direction: 'top', offset: [0, -10] });

      accuracyCircleRef.current = L.circle([lat, lng], {
        radius: Math.min(accuracy, 200),
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4 4'
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([lat, lng]);
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([lat, lng]);
        accuracyCircleRef.current.setRadius(Math.min(accuracy, 200));
      }
    }
  }, [userLocation.coords, userLocation.accuracy, userLocation.heading]);

  // Render Report and Mission Markers
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
          <div class="group relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
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
        setSelectedEntity({
          type: 'report',
          data: report,
          coords: report.coordinates,
          distanceText: formatDistance(dist),
        });
      });

      marker.bindTooltip(`
        <div class="p-1">
          <div class="font-bold text-xs">${report.title}</div>
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
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
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
        setSelectedEntity({
          type: 'mission',
          data: mission,
          coords: mission.coordinates,
          distanceText: formatDistance(dist),
        });
      });

      marker.bindTooltip(`
        <div class="p-1">
          <div class="font-bold text-xs text-green-900">Mission: ${mission.title}</div>
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
            <div class="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-xl">
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

  // Recenter map on user GPS
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [userLocation.coords.lat, userLocation.coords.lng],
        15,
        { duration: 1.2 }
      );
    }
    onRecenterGPS();
  };

  return (
    <div className="relative w-full rounded-3xl bg-[#081c15] border border-[#2d6a4f]/50 overflow-hidden shadow-2xl">
      
      {/* Real-time Map Canvas Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[520px] sm:h-[620px] z-0 focus:outline-none"
      />

      {/* Top HUD: Real-Time GPS Telemetry Strip */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        
        {/* Live GPS Coordinates Pill */}
        <div className="pointer-events-auto bg-[#1b4332]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#52b788]/40 text-white shadow-lg flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#52b788]" />
            <span className="absolute w-4 h-4 rounded-full bg-[#52b788]/40 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 text-[11px] font-extrabold text-[#d8f3dc]">
              <span>LIVE GPS TELEMETRY</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#52b788] text-[#081c15] font-black">
                {userLocation.mode === 'real' ? 'DEVICE GPS' : 'GMC SIMULATOR'}
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-white">
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
          {userLocation.altitude && (
            <div className="border-l border-white/20 pl-3">
              <span className="text-[10px] text-gray-400 block">Altitude:</span>
              <span className="font-mono font-bold text-[#38bdf8]">{userLocation.altitude}m ASL</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Map Layers & Recenter */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        
        {/* Recenter / Locate Me Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="p-3 rounded-2xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white border border-[#52b788]/40 shadow-xl transition-all flex items-center justify-center group active:scale-95"
          title="Recenter to Live GPS"
        >
          <Crosshair className="w-5 h-5 text-[#52b788] group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Map Layer Switcher */}
        <div className="bg-[#1b4332]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#52b788]/30 shadow-xl flex flex-col space-y-1">
          <button
            type="button"
            onClick={() => setMapStyle('osm')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left transition ${
              mapStyle === 'osm' ? 'bg-[#52b788] text-[#081c15]' : 'text-gray-300 hover:text-white'
            }`}
          >
            🗺️ Street
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('topo')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left transition ${
              mapStyle === 'topo' ? 'bg-[#52b788] text-[#081c15]' : 'text-gray-300 hover:text-white'
            }`}
          >
            ⛰️ Topo
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left transition ${
              mapStyle === 'satellite' ? 'bg-[#52b788] text-[#081c15]' : 'text-gray-300 hover:text-white'
            }`}
          >
            🛰️ Satellite
          </button>
        </div>
      </div>

      {/* Bottom Floating Sector Quick-Jump / Simulation Hub */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Gelephu Sector Teleport Pills */}
        <div className="pointer-events-auto flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none bg-[#081c15]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#2d6a4f]/50">
          <span className="text-[10px] font-bold uppercase text-gray-400 px-2 flex items-center">
            <Compass className="w-3.5 h-3.5 mr-1 text-[#52b788]" /> Jump To:
          </span>
          {GMC_SECTORS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onSimulateGMCLocation(s.coordinates, s.name);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([s.coordinates.lat, s.coordinates.lng], 15, { duration: 1.2 });
                }
              }}
              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#1b4332]/80 hover:bg-[#2d6a4f] text-[#d8f3dc] whitespace-nowrap transition border border-[#52b788]/20"
            >
              {s.name.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Real GPS / Simulator Mode Switch */}
        <button
          type="button"
          onClick={onToggleTracking}
          className="pointer-events-auto px-3.5 py-2 rounded-2xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-lg transition flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{userLocation.mode === 'real' ? 'Simulate Gelephu Walk' : 'Use My Live Device GPS'}</span>
        </button>
      </div>

      {/* Entity Details Floating Popup (when marker or pin is clicked) */}
      {selectedEntity && (
        <div className="absolute top-20 left-4 right-4 sm:right-auto sm:w-96 z-30 bg-white rounded-3xl p-5 shadow-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">
                {selectedEntity.type === 'report' ? '📍' : selectedEntity.type === 'mission' ? '🌱' : '📌'}
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2d6a4f] tracking-wider">
                  {selectedEntity.type === 'report' 
                    ? `${selectedEntity.data.category.toUpperCase()} OBSERVATION` 
                    : selectedEntity.type === 'mission' 
                    ? 'RESTORATION MISSION' 
                    : 'PIN DROPPED'}
                </span>
                <h4 className="font-extrabold text-sm text-[#1b4332] leading-tight">
                  {selectedEntity.data.title || 'Custom Location Pin'}
                </h4>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedEntity(null);
                setDroppedPin(null);
              }}
              className="text-gray-400 hover:text-gray-700 p-1 font-bold text-xs"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8f9f6] border border-[#d8f3dc]">
              <span className="font-semibold text-gray-700">Distance from Live GPS:</span>
              <span className="font-bold text-[#2d6a4f] text-sm">{selectedEntity.distanceText}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span>Geocoordinates:</span>
              <span className="font-mono font-medium text-gray-700">
                {formatCoordinates(selectedEntity.coords)}
              </span>
            </div>

            {selectedEntity.data.description && (
              <p className="text-xs text-gray-600 line-clamp-2 italic pt-1">
                "{selectedEntity.data.description}"
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
            {selectedEntity.type === 'report' && (
              <>
                <button
                  onClick={() => onSelectReport(selectedEntity.data)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold text-xs shadow-xs transition"
                >
                  Inspect Telemetry & AI
                </button>
                {selectedEntity.data.status !== 'resolved' && selectedEntity.data.status !== 'pending_verification' && onOpenFixResolution && (
                  <button
                    onClick={() => {
                      onOpenFixResolution(selectedEntity.data);
                      setSelectedEntity(null);
                    }}
                    className="py-2 px-3 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-xs transition flex items-center space-x-1"
                  >
                    <span>🧹 Fixed / Cleaned</span>
                  </button>
                )}
                {selectedEntity.data.status === 'pending_verification' && (
                  <span className="w-full text-center py-1.5 px-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                    ⏳ Cleanup Evidence Pending Official HQ Review
                  </span>
                )}
              </>
            )}

            {selectedEntity.type === 'mission' && (
              <button
                onClick={() => onJoinMission(selectedEntity.data.id)}
                className="flex-1 py-2 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-bold text-xs shadow-xs transition"
              >
                Enroll in Field Mission
              </button>
            )}

            {selectedEntity.type === 'custom-pin' && onOpenReportModalWithCoords && (
              <button
                onClick={() => {
                  onOpenReportModalWithCoords(
                    selectedEntity.coords,
                    userLocation.nearestSector
                  );
                  setSelectedEntity(null);
                  setDroppedPin(null);
                }}
                className="flex-1 py-2 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold text-xs shadow-xs transition"
              >
                Report Incident Here
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

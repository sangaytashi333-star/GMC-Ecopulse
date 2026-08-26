import React, { useState } from 'react';
import { 
  MapPin, 
  Compass, 
  Layers, 
  Filter, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Waves, 
  Trees, 
  Zap, 
  Info, 
  Search,
  PlusCircle,
  ThumbsUp,
  X,
  Crosshair,
  Navigation,
  Globe,
  Radio
} from 'lucide-react';
import { CitizenReport, Mission, Coordinates, LiveLocationState } from '../types';
import { GMC_SECTORS } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';
import { RealLeafletMap } from './RealLeafletMap';
import { calculateDistanceKm, formatDistance, formatCoordinates } from '../utils/geo';

interface InteractiveEcoMapProps {
  reports: CitizenReport[];
  missions: Mission[];
  userLocation: LiveLocationState;
  initialSectorFilter?: string;
  onSelectReport: (report: CitizenReport) => void;
  onJoinMission: (missionId: string) => void;
  onOpenReportModal: () => void;
  onOpenReportModalWithCoords: (coords: Coordinates, sectorName: string) => void;
  onOpenFixResolution?: (report: CitizenReport) => void;
  onUpvoteReport: (reportId: string) => void;
  onRecenterGPS: () => void;
  onToggleTracking: () => void;
  onSimulateGMCLocation: (coords: Coordinates, sectorName: string) => void;
}

export const InteractiveEcoMap: React.FC<InteractiveEcoMapProps> = ({
  reports,
  missions,
  userLocation,
  initialSectorFilter,
  onSelectReport,
  onJoinMission,
  onOpenReportModal,
  onOpenReportModalWithCoords,
  onOpenFixResolution,
  onUpvoteReport,
  onRecenterGPS,
  onToggleTracking,
  onSimulateGMCLocation,
}) => {
  const [mapEngine, setMapEngine] = useState<'real' | 'schematic'>('real');
  const [selectedSector, setSelectedSector] = useState<string>(initialSectorFilter || 'all');
  const [activeLayerMissions, setActiveLayerMissions] = useState(true);
  const [activeLayerReports, setActiveLayerReports] = useState(true);
  const [activeLayerSensors, setActiveLayerSensors] = useState(true);
  const [activeLayerWildlife, setActiveLayerWildlife] = useState(true);
  const [includeResolved, setIncludeResolved] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'report' | 'mission' | 'sensor' | 'wildlife'; data: any } | null>(null);

  // Calculate distance for all reports and sort nearest
  const reportsWithDistance = reports.map(r => ({
    ...r,
    distanceKm: calculateDistanceKm(userLocation.coords, r.coordinates),
    distanceText: formatDistance(calculateDistanceKm(userLocation.coords, r.coordinates))
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  // Filtered reports (By default, once resolved & approved by HQ, it disappears from the active map)
  const filteredReports = reportsWithDistance.filter(r => {
    if (selectedSector !== 'all' && r.sector !== selectedSector) return false;
    if (!includeResolved && r.status === 'resolved') return false;
    return true;
  });

  // Filtered missions (only active or upcoming missions on public map)
  const filteredMissions = missions.filter(m => {
    if (selectedSector !== 'all' && m.sector !== selectedSector) return false;
    if (m.status === 'pending_approval' || m.status === 'rejected') return false;
    return true;
  });

  // Map coordinates simulation for GMC canvas (bounds roughly 26.86 to 26.91 Lat, 90.47 to 90.53 Lng)
  const mapWidth = 900;
  const mapHeight = 560;

  const projectCoord = (coord: Coordinates) => {
    const minLat = 26.865;
    const maxLat = 26.905;
    const minLng = 90.480;
    const maxLng = 90.525;

    const x = ((coord.lng - minLng) / (maxLng - minLng)) * (mapWidth - 100) + 50;
    const y = ((maxLat - coord.lat) / (maxLat - minLat)) * (mapHeight - 100) + 50;
    return { x: Math.max(40, Math.min(mapWidth - 40, x)), y: Math.max(40, Math.min(mapHeight - 40, y)) };
  };

  const SENSOR_NODES = [
    { id: 'sens-1', name: 'Mao River Sensor Alpha', type: 'water', aqi: 14, purity: '98.2%', x: 380, y: 220, sector: 'Sector 2: Mao River Watershed' },
    { id: 'sens-2', name: 'Spine Microgrid Pod 4', type: 'energy', output: '4.8 MW', x: 510, y: 310, sector: 'Sector 1: Mindfulness Spine' },
    { id: 'sens-3', name: 'Phibsoo Canopy Acoustic Trap', type: 'wildlife', langurs: 14, x: 210, y: 140, sector: 'Sector 3: Phibsoo Wildlife Buffer' },
    { id: 'sens-4', name: 'Sarpang Heritage Grove Node', type: 'air', aqi: 12, pm25: '3.1', x: 680, y: 110, sector: 'Sector 6: Sarpang Dzongkhag Forest' },
    { id: 'sens-5', name: 'Agri-Terrace Soil Moisture Node', type: 'soil', moisture: '78%', x: 620, y: 440, sector: 'Sector 4: Agri-Tech Valley' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Controls Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-[#1b4332] tracking-tight">GMC Living Eco-Atlas & Real-Time GIS</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#d8f3dc] text-[#1b4332] rounded-full flex items-center space-x-1">
              <Radio className="w-3 h-3 text-[#2d6a4f] animate-pulse" />
              <span>Live GPS Active</span>
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Real-time geocoordinate tracking: <span className="font-mono font-bold text-[#1b4332]">{formatCoordinates(userLocation.coords)}</span> (±{userLocation.accuracy}m)
          </p>
        </div>

        {/* View engine switcher & Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIncludeResolved(!includeResolved)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
              includeResolved 
                ? 'bg-[#1b4332] text-white border-[#1b4332]' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{includeResolved ? 'Showing All (Inc. Resolved)' : 'Active Incidents Only'}</span>
          </button>

          <div className="bg-[#f8f9f6] p-1 rounded-xl border border-gray-200 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setMapEngine('real')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                mapEngine === 'real' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Real Tile Map (GPS)</span>
            </button>
            <button
              onClick={() => setMapEngine('schematic')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                mapEngine === 'schematic' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>GMC Schematic</span>
            </button>
          </div>

          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-2 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-bold text-xs shadow-xs flex items-center space-x-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report at My GPS</span>
          </button>
        </div>
      </div>

      {/* Real Tile Map (with Leaflet, OSM/Satellite/Topo and Live User GPS) */}
      {mapEngine === 'real' && (
        <RealLeafletMap
          reports={filteredReports}
          missions={filteredMissions}
          userLocation={userLocation}
          onSelectReport={onSelectReport}
          onJoinMission={onJoinMission}
          onOpenReportModalWithCoords={onOpenReportModalWithCoords}
          onOpenFixResolution={onOpenFixResolution}
          onRecenterGPS={onRecenterGPS}
          onToggleTracking={onToggleTracking}
          onSimulateGMCLocation={onSimulateGMCLocation}
        />
      )}

      {/* GMC Schematic Vector Canvas */}
      {mapEngine === 'schematic' && (
        <div className="space-y-4">
          {/* Layer Toggles & District Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8f9f6] p-3.5 rounded-2xl border border-[#d8f3dc]">
            
            {/* Layer Switches */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold uppercase text-gray-500 mr-1 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1 text-[#2d6a4f]" /> Layers:
              </span>

              <button
                onClick={() => setActiveLayerMissions(!activeLayerMissions)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
                  activeLayerMissions ? 'bg-[#1b4332] text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#52b788]" />
                <span>Missions ({filteredMissions.length})</span>
              </button>

              <button
                onClick={() => setActiveLayerReports(!activeLayerReports)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
                  activeLayerReports ? 'bg-[#2d6a4f] text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#f4a261]" />
                <span>Incidents & Reports ({filteredReports.length})</span>
              </button>

              <button
                onClick={() => setActiveLayerSensors(!activeLayerSensors)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
                  activeLayerSensors ? 'bg-[#40916c] text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                <span>Sensor Pods ({SENSOR_NODES.length})</span>
              </button>

              <button
                onClick={() => setActiveLayerWildlife(!activeLayerWildlife)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
                  activeLayerWildlife ? 'bg-[#081c15] text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#fbbf24]" />
                <span>Wildlife Corridors</span>
              </button>
            </div>

            {/* Sector Selector Dropdown */}
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-gray-600">Sector:</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-[#1b4332] focus:outline-none focus:border-[#2d6a4f]"
              >
                <option value="all">All GMC Sectors (Whole City)</option>
                {GMC_SECTORS.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

          </div>

      {/* Main Interactive Map Canvas Container */}
      <div className="relative rounded-3xl bg-[#081c15] border border-[#2d6a4f]/40 overflow-hidden shadow-xl">
        
        {/* Top Floating Map Status Bar */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-[#1b4332]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#52b788]/30 text-white text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#52b788] animate-ping" />
          <span>GMC Spatial Telemetry Active • Sector Harmony 92.6%</span>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center space-x-4 bg-[#1b4332]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#52b788]/30 text-white text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#52b788] border border-white" />
            <span>Active Mission</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#f4a261] border border-white" />
            <span>Incident / Report</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#38bdf8] border border-white" />
            <span>Sensor Pod</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1.5 bg-[#40916c] rounded" />
            <span>Wildlife Canopy Bridge</span>
          </div>
        </div>

        {/* SVG Vector Map Rendering */}
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-[460px] sm:h-[540px] select-none"
        >
          <defs>
            {/* Soft gradients for landscape */}
            <linearGradient id="valleyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d2818" />
              <stop offset="50%" stopColor="#1b4332" />
              <stop offset="100%" stopColor="#081c15" />
            </linearGradient>

            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Valley Terrain */}
          <rect width={mapWidth} height={mapHeight} fill="url(#valleyGrad)" />

          {/* Topographic Elevation Curves (Himalayan Foothills) */}
          <path d="M 0 120 Q 250 80 500 130 T 900 90" fill="none" stroke="#2d6a4f" strokeWidth="1.5" opacity="0.4" />
          <path d="M 0 200 Q 300 160 600 220 T 900 170" fill="none" stroke="#2d6a4f" strokeWidth="1.5" opacity="0.3" />
          <path d="M 0 350 Q 350 300 700 370 T 900 320" fill="none" stroke="#2d6a4f" strokeWidth="1.5" opacity="0.3" />
          <path d="M 0 470 Q 400 420 800 490 T 900 440" fill="none" stroke="#2d6a4f" strokeWidth="1.5" opacity="0.4" />

          {/* Wildlife Sanctuary Zones (Green Translucent Polygons) */}
          {activeLayerWildlife && (
            <g opacity="0.7">
              {/* Phibsoo Buffer */}
              <polygon
                points="80,60 320,50 280,240 100,220"
                fill="#52b788"
                fillOpacity="0.15"
                stroke="#52b788"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="130" y="90" fill="#d8f3dc" fontSize="11" fontWeight="bold" opacity="0.8">
                PHIBSOO WILDLIFE BUFFER
              </text>

              {/* Sarpang Heritage Forest */}
              <polygon
                points="580,40 860,30 840,200 620,180"
                fill="#40916c"
                fillOpacity="0.15"
                stroke="#40916c"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="640" y="70" fill="#d8f3dc" fontSize="11" fontWeight="bold" opacity="0.8">
                SARPANG HERITAGE CANOPY
              </text>

              {/* Elephant Corridor Highway Track */}
              <path
                d="M 120 180 Q 300 240 450 180 T 800 210"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeDasharray="6 4"
                opacity="0.8"
              />
              <text x="320" y="215" fill="#fde047" fontSize="10" fontWeight="bold">
                🐾 Sacred Asian Elephant & Langur Highway
              </text>
            </g>
          )}

          {/* Mao River Spine (Sacred Himalayan Waterway) */}
          <path
            d="M 320 0 C 340 100, 390 180, 370 280 C 350 380, 420 460, 450 560"
            fill="none"
            stroke="url(#riverGrad)"
            strokeWidth="28"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* River Center Shimmer */}
          <path
            d="M 320 0 C 340 100, 390 180, 370 280 C 350 380, 420 460, 450 560"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="3"
            strokeDasharray="12 18"
            opacity="0.9"
          />

          {/* 35+ Bridges Network Representation across the River */}
          <g stroke="#ffffff" strokeWidth="3" opacity="0.9">
            {/* Bridge 1: Central Mindfulness Bridge */}
            <line x1="330" y1="120" x2="380" y2="120" stroke="#f4a261" strokeWidth="5" />
            <text x="390" y="124" fill="#ffffff" fontSize="9" fontWeight="bold">Bridge 1 (Central Hub)</text>

            {/* Bridge 8: Mao Revegetation Bridge */}
            <line x1="340" y1="210" x2="390" y2="210" stroke="#52b788" strokeWidth="4" />
            <text x="400" y="214" fill="#d8f3dc" fontSize="9">Bridge 8 (Eco-Pass)</text>

            {/* Bridge 14: Canopy Langur Overpass */}
            <line x1="330" y1="310" x2="385" y2="310" stroke="#74c69d" strokeWidth="4" />
            <text x="395" y="314" fill="#d8f3dc" fontSize="9">Bridge 14 (Canopy Link)</text>

            {/* Bridge 22: Hydro Sieve Bridge */}
            <line x1="345" y1="410" x2="410" y2="410" stroke="#38bdf8" strokeWidth="4" />
            <text x="420" y="414" fill="#d8f3dc" fontSize="9">Bridge 22 (Hydro-Tech)</text>
          </g>

          {/* Sector 1: Mindfulness Spine Transit Ribbon */}
          <path
            d="M 180 340 Q 420 320 720 340"
            fill="none"
            stroke="#52b788"
            strokeWidth="4"
            opacity="0.75"
          />
          <text x="480" y="360" fill="#d8f3dc" fontSize="10" fontWeight="bold">
            GMC Autonomous Solar Transit Spine
          </text>

          {/* SENSOR NODES LAYER */}
          {activeLayerSensors && SENSOR_NODES.map((sensor) => (
            <g 
              key={sensor.id}
              onClick={() => {
                playMindfulChime('bell');
                setSelectedEntity({ type: 'sensor', data: sensor });
              }}
              className="cursor-pointer group"
            >
              <circle cx={sensor.x} cy={sensor.y} r="14" fill="#0284c7" fillOpacity="0.3" className="animate-ping" />
              <circle cx={sensor.x} cy={sensor.y} r="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              <text x={sensor.x + 10} y={sensor.y + 4} fill="#e0f2fe" fontSize="10" fontWeight="600">
                {sensor.name.split(' ')[0]}
              </text>
            </g>
          ))}

          {/* INCIDENTS & OBSERVATION REPORTS LAYER */}
          {activeLayerReports && filteredReports.map((report) => {
            const pos = projectCoord(report.coordinates);
            const isResolved = report.status === 'resolved';
            const color = isResolved ? '#52b788' : report.status === 'in-progress' ? '#38bdf8' : '#f4a261';

            return (
              <g
                key={report.id}
                onClick={() => {
                  playMindfulChime('bell');
                  setSelectedEntity({ type: 'report', data: report });
                }}
                className="cursor-pointer transform hover:scale-125 transition-transform"
              >
                {/* Marker Halo */}
                <circle cx={pos.x} cy={pos.y} r="16" fill={color} fillOpacity="0.25" />
                <circle cx={pos.x} cy={pos.y} r="8" fill={color} stroke="#ffffff" strokeWidth="2" filter="url(#glow)" />
                <text x={pos.x} y={pos.y + 3} textAnchor="middle" fill="#081c15" fontSize="8" fontWeight="bold">
                  {report.category === 'wildlife' ? '🐾' : report.category === 'waste' ? '♻️' : '⚠️'}
                </text>
              </g>
            );
          })}

          {/* ACTIVE MISSIONS LAYER */}
          {activeLayerMissions && filteredMissions.map((mission) => {
            const pos = projectCoord(mission.coordinates);
            return (
              <g
                key={mission.id}
                onClick={() => {
                  playMindfulChime('karma');
                  setSelectedEntity({ type: 'mission', data: mission });
                }}
                className="cursor-pointer group"
              >
                <circle cx={pos.x} cy={pos.y} r="20" fill="#52b788" fillOpacity="0.3" className="animate-pulse" />
                <circle cx={pos.x} cy={pos.y} r="10" fill="#52b788" stroke="#ffffff" strokeWidth="2.5" />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#081c15" fontSize="9" fontWeight="extrabold">
                  ★
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Entity Popup Drawer Overlay */}
        {selectedEntity && (
          <div className="absolute bottom-4 right-4 max-w-sm sm:max-w-md w-full bg-white rounded-2xl p-5 shadow-2xl border border-gray-200 z-30 animate-in fade-in slide-in-from-bottom-3 text-[#1c2826]">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-[#d8f3dc] text-[#1b4332]">
                  {selectedEntity.type === 'report' ? 'Citizen Report' : selectedEntity.type === 'mission' ? 'Active Mission' : 'Telemetry Sensor'}
                </span>
                {selectedEntity.type === 'report' && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    selectedEntity.data.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedEntity.data.status.toUpperCase()}
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedEntity(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2.5">
              <h4 className="text-sm sm:text-base font-bold text-[#1b4332] leading-snug">
                {selectedEntity.data.title || selectedEntity.data.name}
              </h4>

              {selectedEntity.data.photoUrl && (
                <img
                  src={selectedEntity.data.photoUrl}
                  alt="Inspection"
                  referrerPolicy="no-referrer"
                  className="w-full h-32 rounded-xl object-cover border border-gray-100"
                />
              )}

              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedEntity.data.description || 'Continuous telemetry stream connected to GMC Central Hub.'}
              </p>

              <div className="text-[11px] text-gray-500 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#52b788]" />
                <span>{selectedEntity.data.locationName || selectedEntity.data.sector}</span>
              </div>

              {/* Mission Specific Action */}
              {selectedEntity.type === 'mission' && (
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#2d6a4f]">+{selectedEntity.data.rewardPoints} Karma Points</span>
                    <p className="text-[10px] text-gray-500">{selectedEntity.data.currentParticipants}/{selectedEntity.data.targetParticipants} joined</p>
                  </div>
                  <button
                    onClick={() => {
                      onJoinMission(selectedEntity.data.id);
                      setSelectedEntity({
                        ...selectedEntity,
                        data: {
                          ...selectedEntity.data,
                          joined: !selectedEntity.data.joined,
                          currentParticipants: selectedEntity.data.joined ? selectedEntity.data.currentParticipants - 1 : selectedEntity.data.currentParticipants + 1
                        }
                      });
                    }}
                    className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition ${
                      selectedEntity.data.joined
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-[#52b788] hover:bg-[#74c69d] text-[#081c15]'
                    }`}
                  >
                    {selectedEntity.data.joined ? 'Leave Mission' : 'Join Mission'}
                  </button>
                </div>
              )}

              {/* Report Specific Action */}
              {selectedEntity.type === 'report' && (
                <div className="pt-2 flex items-center justify-between border-t border-gray-100 mt-2">
                  <span className="text-[11px] text-gray-500">
                    Logged by {selectedEntity.data.reporterName} • {selectedEntity.data.pointsAwarded} pts awarded
                  </span>
                  <button
                    onClick={() => onUpvoteReport(selectedEntity.data.id)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#1b4332]"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Upvote ({selectedEntity.data.upvotes})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )}

      {/* Real-time Proximity Radar Feed (sorted by distance from live GPS) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <Crosshair className="w-4 h-4 text-[#2d6a4f]" />
            <h3 className="text-sm font-extrabold text-[#1b4332]">Real-Time GPS Proximity Radar</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d8f3dc] text-[#1b4332] font-bold">
              Nearest First
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Citizen reference point: <strong className="font-mono text-[#1b4332]">{formatCoordinates(userLocation.coords)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportsWithDistance.slice(0, 6).map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="p-3.5 rounded-xl border border-gray-100 hover:border-[#52b788] hover:bg-[#f8f9f6] transition cursor-pointer flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[#1b4332] group-hover:text-[#2d6a4f] line-clamp-1">
                  {report.title}
                </span>
                <span className="text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full bg-[#1b4332] text-[#d8f3dc] shrink-0">
                  {report.distanceText}
                </span>
              </div>

              <p className="text-[11px] text-gray-500 line-clamp-2">{report.description}</p>

              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                <span>{report.locationName}</span>
                <span className="font-mono">{formatCoordinates(report.coordinates)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

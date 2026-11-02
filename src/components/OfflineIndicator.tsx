import React, { useState } from 'react';
import { Wifi, WifiOff, CloudDownload, RefreshCw, Compass, ShieldCheck, Database } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getOfflineCacheSummary, getLastSyncTime } from '../lib/offlineStorage';

interface OfflineIndicatorProps {
  onForceSync?: () => void;
  currentSector?: string;
  isSyncing?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onForceSync,
  currentSector = 'Sector 3: Phibsoo Wildlife Buffer',
  isSyncing = false,
}) => {
  const { isOnline, simulatedOffline, toggleSimulatedOffline } = useOnlineStatus();
  const [isExpanded, setIsExpanded] = useState(false);
  const cacheSummary = getOfflineCacheSummary();

  return (
    <div className="relative">
      {/* Primary compact status badge */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
            isOnline
              ? 'bg-[#EBF7EE] text-[#1E5D3A] border-[#95D5B2] hover:bg-[#D8F3DC]'
              : 'bg-[#FFF3E0] text-[#B25E00] border-[#FFB74D] hover:bg-[#FFE0B2] animate-pulse'
          }`}
          title={isOnline ? 'Connected to GMC Eco-Mesh. Click to view offline cache.' : 'Offline in Remote Sector. Click to view cached telemetry and missions.'}
        >
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-[#2E7D58]" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-[#E65100]" />
          )}

          <span className="truncate max-w-[130px] sm:max-w-none">
            {isOnline ? 'GMC Mesh Online' : 'Remote Sector Offline'}
          </span>

          {cacheSummary.pendingActionsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E65100] text-white">
              {cacheSummary.pendingActionsCount}
            </span>
          )}
        </button>

        {/* Quick simulator switch for field testing */}
        <button
          onClick={toggleSimulatedOffline}
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all border ${
            simulatedOffline
              ? 'bg-[#1B4332] text-[#D8F3DC] border-[#2D6A4F] hover:bg-[#24533e]'
              : 'bg-white/80 text-gray-600 border-gray-200 hover:text-[#1B4332] hover:border-[#2D6A4F]/40'
          }`}
          title="Toggle simulation of being in remote Himalayan sectors without network"
        >
          <Compass className="w-3 h-3 text-[#E9A822]" />
          <span>{simulatedOffline ? 'Exit Forest Mode' : 'Test Remote Sector'}</span>
        </button>
      </div>

      {/* Expanded Offline Cache Intelligence Drawer / Popover */}
      {isExpanded && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsExpanded(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl border border-[#2D6A4F]/20 text-[#192723] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isOnline ? 'bg-[#2E7D58] text-white' : 'bg-[#E65100] text-white'}`}>
                  {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                    {isOnline ? 'GMC Biosphere Mesh Online' : 'Remote Ecological Sector Mode'}
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    {isOnline ? 'Real-time telemetry streaming' : 'Autonomous local caching active'}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isOnline ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
                {isOnline ? 'Active' : 'Offline'}
              </span>
            </div>

            {/* Offline Cache Status Grid */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8F5ED] border border-[#2E7D58]/15">
                <div className="flex items-center gap-1.5 text-[#2E7D58] font-semibold text-[11px] mb-1">
                  <Database className="w-3.5 h-3.5" />
                  <span>City Metrics Cache</span>
                </div>
                <p className="text-[11px] text-gray-700 font-medium">
                  UV, Radiation, AQI, Weather
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Synced: {cacheSummary.lastSyncTimestamp || 'Cached'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8F5ED] border border-[#2E7D58]/15">
                <div className="flex items-center gap-1.5 text-[#2E7D58] font-semibold text-[11px] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Missions Offline</span>
                </div>
                <p className="text-[11px] text-gray-700 font-medium">
                  {cacheSummary.cachedMissionsCount} active missions
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Available without signal
                </p>
              </div>
            </div>

            {/* Sector Coverage Notice */}
            <div className="mt-3 p-2.5 rounded-xl bg-[#EBF7EE]/60 border border-[#95D5B2]/40 text-xs">
              <div className="flex items-start gap-2">
                <Compass className="w-4 h-4 text-[#2E7D58] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1B4332] text-[11px]">Sector Coverage Guarantee</p>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                    Designed for remote Bhutanese corridors including <strong>Phibsoo Buffer</strong>, <strong>Sarpang High Ridges</strong>, and <strong>Mao River Gorge</strong> where cellular reception is unavailable.
                  </p>
                </div>
              </div>
            </div>

            {/* Queued Actions */}
            {cacheSummary.pendingActionsCount > 0 && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#FFF3E0] border border-[#FFB74D]/60 text-xs text-[#B25E00]">
                <p className="font-bold flex items-center justify-between text-[11px]">
                  <span>Pending Offline Actions</span>
                  <span className="px-1.5 py-0.5 bg-[#E65100] text-white rounded-full text-[10px]">
                    {cacheSummary.pendingActionsCount}
                  </span>
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  Actions taken offline will automatically synchronize to GMC servers when connectivity returns.
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              {onForceSync && (
                <button
                  onClick={() => {
                    onForceSync();
                  }}
                  disabled={isSyncing}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1B4332] py-2 text-xs font-semibold text-white hover:bg-[#2D6A4F] transition shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              )}

              <button
                onClick={toggleSimulatedOffline}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 py-2 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <span>{simulatedOffline ? 'Disable Simulation' : 'Simulate Offline'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import { CityMetrics, Mission } from '../types';
import { INITIAL_CITY_METRICS, INITIAL_MISSIONS } from '../data/initialData';

const METRICS_CACHE_KEY = 'gmc_offline_city_metrics_v2';
const MISSIONS_CACHE_KEY = 'gmc_offline_active_missions_v2';
const LAST_SYNC_KEY = 'gmc_offline_last_sync_v2';
const ACTION_QUEUE_KEY = 'gmc_offline_action_queue_v2';
const REMOTE_SECTOR_KEY = 'gmc_offline_current_sector_v2';

export interface QueuedAction {
  id: string;
  type: 'join_mission' | 'leave_mission' | 'offline_report';
  payload: any;
  timestamp: string;
  sector?: string;
}

export interface OfflineCacheSummary {
  hasCachedMetrics: boolean;
  hasCachedMissions: boolean;
  cachedMissionsCount: number;
  lastSyncTimestamp: string | null;
  pendingActionsCount: number;
}

/**
 * Cache City Metrics in LocalStorage with timestamp
 */
export function saveCachedMetrics(metrics: CityMetrics): void {
  try {
    localStorage.setItem(METRICS_CACHE_KEY, JSON.stringify(metrics));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch (err) {
    console.warn('Could not cache city metrics to localStorage:', err);
  }
}

/**
 * Retrieve cached City Metrics with fallback to INITIAL_CITY_METRICS
 */
export function getCachedMetrics(): CityMetrics {
  try {
    const raw = localStorage.getItem(METRICS_CACHE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading cached city metrics:', err);
  }
  return INITIAL_CITY_METRICS;
}

/**
 * Cache Active Missions in LocalStorage
 */
export function saveCachedMissions(missions: Mission[]): void {
  try {
    localStorage.setItem(MISSIONS_CACHE_KEY, JSON.stringify(missions));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch (err) {
    console.warn('Could not cache active missions to localStorage:', err);
  }
}

/**
 * Retrieve cached Missions with fallback to INITIAL_MISSIONS
 */
export function getCachedMissions(): Mission[] {
  try {
    const raw = localStorage.getItem(MISSIONS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading cached missions:', err);
  }
  return INITIAL_MISSIONS;
}

const USER_JOINED_MISSIONS_KEY_PREFIX = 'gmc_user_joined_missions_';

/**
 * Get IDs of missions joined by a specific user from localStorage
 */
export function getLocalJoinedMissionIds(userEmail: string): string[] {
  try {
    const key = `${USER_JOINED_MISSIONS_KEY_PREFIX}${(userEmail || 'default').toLowerCase().trim()}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading joined missions from storage:', err);
  }
  return ['mis-001']; // Initial default
}

/**
 * Persist IDs of missions joined by a specific user to localStorage
 */
export function saveLocalJoinedMissionIds(userEmail: string, missionIds: string[]): void {
  try {
    const key = `${USER_JOINED_MISSIONS_KEY_PREFIX}${(userEmail || 'default').toLowerCase().trim()}`;
    localStorage.setItem(key, JSON.stringify(missionIds));
  } catch (err) {
    console.warn('Error saving joined missions to storage:', err);
  }
}

/**
 * Get human-readable time since last data sync
 */
export function getLastSyncTime(): string {
  try {
    const raw = localStorage.getItem(LAST_SYNC_KEY);
    if (!raw) return 'Initial package';
    const date = new Date(raw);
    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

/**
 * Queue an offline action (e.g. joined a mission or logged observation while in deep forest)
 */
export function queueOfflineAction(action: Omit<QueuedAction, 'id' | 'timestamp'>): QueuedAction {
  const queued: QueuedAction = {
    ...action,
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = getQueuedActions();
    existing.push(queued);
    localStorage.setItem(ACTION_QUEUE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('Could not queue offline action:', err);
  }

  return queued;
}

/**
 * Retrieve all pending offline actions
 */
export function getQueuedActions(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(ACTION_QUEUE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading queued actions:', err);
  }
  return [];
}

/**
 * Clear queued actions after successful sync
 */
export function clearQueuedActions(): void {
  try {
    localStorage.removeItem(ACTION_QUEUE_KEY);
  } catch (err) {
    console.warn('Error clearing queued actions:', err);
  }
}

/**
 * Save current remote ecological sector
 */
export function setCachedRemoteSector(sector: string): void {
  try {
    localStorage.setItem(REMOTE_SECTOR_KEY, sector);
  } catch (err) {
    console.warn('Error saving remote sector:', err);
  }
}

export function getCachedRemoteSector(): string {
  try {
    return localStorage.getItem(REMOTE_SECTOR_KEY) || 'Sector 3: Phibsoo Wildlife Buffer & Elephant Highway';
  } catch {
    return 'Sector 3: Phibsoo Wildlife Buffer & Elephant Highway';
  }
}

/**
 * Diagnostic summary of offline storage status
 */
export function getOfflineCacheSummary(): OfflineCacheSummary {
  const missions = getCachedMissions();
  const queue = getQueuedActions();
  return {
    hasCachedMetrics: !!localStorage.getItem(METRICS_CACHE_KEY),
    hasCachedMissions: !!localStorage.getItem(MISSIONS_CACHE_KEY),
    cachedMissionsCount: missions.length,
    lastSyncTimestamp: getLastSyncTime(),
    pendingActionsCount: queue.length,
  };
}

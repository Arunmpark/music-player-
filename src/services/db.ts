import { Track, Playlist, SyncAction, SyncActionType } from '../types';

const DB_NAME = 'resonance_music_db';
const DB_VERSION = 1;

interface CachedAudioRecord {
  id: string;
  blob: Blob;
  size: number;
  cachedAt: number;
  trackMeta: Track;
}

let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('cached_audio')) {
        db.createObjectStore('cached_audio', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('liked_tracks')) {
        db.createObjectStore('liked_tracks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_outbox')) {
        db.createObjectStore('sync_outbox', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('listening_history')) {
        db.createObjectStore('listening_history', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cloud_uploads')) {
        db.createObjectStore('cloud_uploads', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Offline Audio Caching
export async function cacheTrackForOffline(track: Track, onProgress?: (percent: number) => void): Promise<boolean> {
  try {
    const db = await getDB();
    
    // Fetch audio data
    const response = await fetch(track.audioUrl);
    if (!response.ok) throw new Error(`Failed to download track audio: ${response.statusText}`);

    const blob = await response.blob();
    const record: CachedAudioRecord = {
      id: track.id,
      blob: blob,
      size: blob.size,
      cachedAt: Date.now(),
      trackMeta: {
        ...track,
        isDownloaded: true,
        fileSize: blob.size
      }
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('cached_audio', 'readwrite');
      const store = tx.objectStore('cached_audio');
      const req = store.put(record);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Error caching audio for offline:', error);
    return false;
  }
}

export async function getOfflineAudioUrl(trackId: string): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('cached_audio', 'readonly');
      const store = tx.objectStore('cached_audio');
      const req = store.get(trackId);

      req.onsuccess = () => {
        const record = req.result as CachedAudioRecord | undefined;
        if (record && record.blob) {
          resolve(URL.createObjectURL(record.blob));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function removeOfflineTrack(trackId: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('cached_audio', 'readwrite');
      const store = tx.objectStore('cached_audio');
      const req = store.delete(trackId);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function getAllOfflineTracks(): Promise<Track[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('cached_audio', 'readonly');
      const store = tx.objectStore('cached_audio');
      const req = store.getAll();

      req.onsuccess = () => {
        const records = (req.result || []) as CachedAudioRecord[];
        resolve(records.map(r => r.trackMeta));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function getOfflineStorageUsage(): Promise<{ count: number; bytes: number }> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('cached_audio', 'readonly');
      const store = tx.objectStore('cached_audio');
      const req = store.getAll();

      req.onsuccess = () => {
        const records = (req.result || []) as CachedAudioRecord[];
        const bytes = records.reduce((acc, curr) => acc + (curr.size || 0), 0);
        resolve({ count: records.length, bytes });
      };
      req.onerror = () => resolve({ count: 0, bytes: 0 });
    });
  } catch {
    return { count: 0, bytes: 0 };
  }
}

// Sync Outbox & Offline Queue Management
export async function queueSyncAction(type: SyncActionType, payload: any): Promise<SyncAction> {
  const action: SyncAction = {
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: Date.now(),
    synced: false
  };

  try {
    const db = await getDB();
    const tx = db.transaction('sync_outbox', 'readwrite');
    const store = tx.objectStore('sync_outbox');
    store.put(action);
  } catch (err) {
    console.warn('Could not persist sync action in IDB:', err);
  }

  return action;
}

export async function getPendingSyncActions(): Promise<SyncAction[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('sync_outbox', 'readonly');
      const store = tx.objectStore('sync_outbox');
      const req = store.getAll();

      req.onsuccess = () => {
        resolve(req.result || []);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function clearPendingSyncActions(actionIds: string[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('sync_outbox', 'readwrite');
    const store = tx.objectStore('sync_outbox');
    for (const id of actionIds) {
      store.delete(id);
    }
  } catch (err) {
    console.warn('Failed to clear sync outbox:', err);
  }
}

export async function clearAudioBlobs(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('cached_audio', 'readwrite');
    const store = tx.objectStore('cached_audio');
    store.clear();
  } catch (err) {
    console.warn('Failed to clear cached audio:', err);
  }
}

export const dbService = {
  getDB,
  cacheTrackForOffline,
  getOfflineAudioUrl,
  removeOfflineTrack,
  getAllOfflineTracks,
  getOfflineStorageUsage,
  clearAudioBlobs,
  queueSyncAction,
  getPendingSyncActions,
  clearPendingSyncActions
};

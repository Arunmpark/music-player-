import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Track, 
  Playlist, 
  User, 
  EqualizerSettings, 
  ReleaseNotification, 
  PlaybackState,
  SyncActionType
} from '../types';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS, INITIAL_NOTIFICATIONS } from '../data/mockCatalog';
import { audioEngine } from '../services/audioEngine';
import { 
  cacheTrackForOffline, 
  getOfflineAudioUrl, 
  removeOfflineTrack, 
  getAllOfflineTracks, 
  queueSyncAction, 
  getPendingSyncActions, 
  clearPendingSyncActions 
} from '../services/db';

interface MusicContextType {
  // Playback state & controls
  playback: PlaybackState;
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setCrossfade: (seconds: number) => void;
  toggleHiResMode: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (newQueue: Track[]) => void;
  clearQueue: () => void;

  // Equalizer
  equalizer: EqualizerSettings;
  updateEqualizer: (settings: Partial<EqualizerSettings>) => void;
  applyEQPreset: (preset: EqualizerSettings['preset']) => void;

  // Library & Content
  allTracks: Track[];
  playlists: Playlist[];
  likedTrackIds: Set<string>;
  uploadedTracks: Track[];
  offlineTrackIds: Set<string>;
  history: Track[];
  toggleLikeTrack: (trackId: string) => void;
  
  // Playlists
  createPlaylist: (title: string, description?: string, coverUrl?: string, trackIds?: string[]) => Promise<Playlist>;
  updatePlaylist: (playlist: Playlist) => void;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylistTracks: (playlistId: string, newTrackIds: string[]) => void;

  // Offline Caching & Sync
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  downloadTrackForOffline: (track: Track) => Promise<boolean>;
  deleteOfflineTrack: (trackId: string) => Promise<boolean>;
  syncWithCloud: () => Promise<void>;

  // User & Auth
  currentUser: User | null;
  loginUser: (email: string) => Promise<void>;
  loginDemoUser: () => Promise<void>;
  logoutUser: () => void;
  uploadCloudTrack: (trackData: any) => Promise<Track>;

  // Notifications
  notifications: ReleaseNotification[];
  unreadNotifCount: number;
  markNotificationAsRead: (id: string) => void;
  addNotification: (notif: Omit<ReleaseNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Navigation & UI Modals
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  isVisualizerOpen: boolean;
  setIsVisualizerOpen: (open: boolean) => void;
  isEqualizerOpen: boolean;
  setIsEqualizerOpen: (open: boolean) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  shareTarget: { track?: Track; playlist?: Playlist } | null;
  openShareModal: (item: { track?: Track; playlist?: Playlist }) => void;
  isCloudUploadOpen: boolean;
  setIsCloudUploadOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isPlaylistCreatorOpen: boolean;
  setIsPlaylistCreatorOpen: (open: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

const DEFAULT_EQ: EqualizerSettings = {
  enabled: true,
  preset: 'audiophile',
  bass: 3,
  lowMid: 1,
  mid: 0,
  highMid: 2,
  treble: 4,
  preamp: 0
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Network status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Playback state
  const [playback, setPlayback] = useState<PlaybackState>({
    currentTrack: INITIAL_TRACKS[0],
    isPlaying: false,
    currentTime: 0,
    duration: INITIAL_TRACKS[0].duration,
    volume: 0.85,
    isMuted: false,
    isShuffle: false,
    repeatMode: 'off',
    queue: INITIAL_TRACKS,
    queueIndex: 0,
    crossfadeDuration: 3,
    hiResMode: true,
    playbackRate: 1.0
  });

  // Equalizer
  const [equalizer, setEqualizer] = useState<EqualizerSettings>(DEFAULT_EQ);

  // Library Collections
  const [allTracks, setAllTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set(['track-1', 'track-2', 'track-4', 'track-8']));
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([]);
  const [offlineTrackIds, setOfflineTrackIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<Track[]>([]);

  // User auth
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'user-demo-1',
    name: 'Alex Vance',
    email: 'alex.audiophile@resonance.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    tier: 'Audiophile Hi-Fi',
    joinedAt: '2024-01-01T00:00:00.000Z'
  });

  // Notifications
  const [notifications, setNotifications] = useState<ReleaseNotification[]>(INITIAL_NOTIFICATIONS);

  // View state & modals
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState<boolean>(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareTarget, setShareTarget] = useState<{ track?: Track; playlist?: Playlist } | null>(null);
  const [isCloudUploadOpen, setIsCloudUploadOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPlaylistCreatorOpen, setIsPlaylistCreatorOpen] = useState<boolean>(false);

  // Audio engine listeners & callbacks
  useEffect(() => {
    audioEngine.setCallbacks({
      onTimeUpdate: (currentTime, duration) => {
        setPlayback(prev => ({
          ...prev,
          currentTime,
          duration: duration > 0 ? duration : prev.duration
        }));
      },
      onPlay: () => {
        setPlayback(prev => ({ ...prev, isPlaying: true }));
      },
      onPause: () => {
        setPlayback(prev => ({ ...prev, isPlaying: false }));
      },
      onEnded: () => {
        setPlayback(prev => {
          if (prev.repeatMode === 'one' && prev.currentTrack) {
            audioEngine.loadTrack(prev.currentTrack.audioUrl, prev.currentTrack);
            audioEngine.play().catch(console.warn);
            return prev;
          }

          if (prev.queueIndex < prev.queue.length - 1) {
            const nextIdx = prev.queueIndex + 1;
            const nextTrk = prev.queue[nextIdx];
            audioEngine.loadTrack(nextTrk.audioUrl, nextTrk);
            audioEngine.play().catch(console.warn);
            return {
              ...prev,
              currentTrack: nextTrk,
              queueIndex: nextIdx,
              currentTime: 0
            };
          } else if (prev.repeatMode === 'all' && prev.queue.length > 0) {
            const nextTrk = prev.queue[0];
            audioEngine.loadTrack(nextTrk.audioUrl, nextTrk);
            audioEngine.play().catch(console.warn);
            return {
              ...prev,
              currentTrack: nextTrk,
              queueIndex: 0,
              currentTime: 0
            };
          } else {
            return { ...prev, isPlaying: false };
          }
        });
      }
    });
  }, []);

  // Initialize offline track detection
  useEffect(() => {
    async function loadOffline() {
      const offlineList = await getAllOfflineTracks();
      if (offlineList && offlineList.length > 0) {
        setOfflineTrackIds(new Set(offlineList.map(t => t.id)));
        setAllTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const additions = offlineList.filter(t => !existingIds.has(t.id));
          return [...prev, ...additions];
        });
      }
      const pending = await getPendingSyncActions();
      setPendingSyncCount(pending.length);
    }
    loadOffline();
  }, []);

  // Online / Offline listener & auto-sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger cloud sync automatically on reconnect
      syncWithCloud();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Apply Equalizer changes
  useEffect(() => {
    audioEngine.applyEqualizer(equalizer);
  }, [equalizer]);

  // Play a specific track
  const playTrack = useCallback(async (track: Track, newQueue?: Track[]) => {
    try {
      let finalAudioUrl = track.audioUrl;

      // Check if track is available offline in IndexedDB
      const offlineUrl = await getOfflineAudioUrl(track.id);
      if (offlineUrl) {
        finalAudioUrl = offlineUrl;
      }

      audioEngine.loadTrack(finalAudioUrl, track);
      await audioEngine.play();

      setPlayback(prev => {
        const queueToUse = newQueue || prev.queue;
        const trackIdx = queueToUse.findIndex(t => t.id === track.id);
        const finalQueue = trackIdx >= 0 ? queueToUse : [track, ...queueToUse];
        const finalIdx = trackIdx >= 0 ? trackIdx : 0;

        return {
          ...prev,
          currentTrack: track,
          queue: finalQueue,
          queueIndex: finalIdx,
          isPlaying: true,
          currentTime: 0,
          duration: track.duration
        };
      });

      // Log to history
      setHistory(prev => [track, ...prev.filter(t => t.id !== track.id)].slice(0, 50));
      queueSyncAction('ADD_HISTORY', track);
    } catch (err) {
      console.warn('Playback initiation note:', err);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (playback.isPlaying) {
      audioEngine.pause();
      setPlayback(prev => ({ ...prev, isPlaying: false }));
    } else {
      if (playback.currentTrack) {
        audioEngine.loadTrack(playback.currentTrack.audioUrl, playback.currentTrack);
        if (playback.currentTime > 0) {
          audioEngine.seek(playback.currentTime);
        }
        await audioEngine.play().catch(console.warn);
        setPlayback(prev => ({ ...prev, isPlaying: true }));
      }
    }
  }, [playback.isPlaying, playback.currentTrack, playback.currentTime]);

  const seek = useCallback((seconds: number) => {
    audioEngine.seek(seconds);
    setPlayback(prev => ({ ...prev, currentTime: seconds }));
  }, []);

  const setVolume = useCallback((vol: number) => {
    audioEngine.setVolume(vol);
    setPlayback(prev => ({ ...prev, volume: vol, isMuted: vol === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    setPlayback(prev => {
      const nextMuted = !prev.isMuted;
      audioEngine.setVolume(nextMuted ? 0 : prev.volume || 0.85);
      return { ...prev, isMuted: nextMuted };
    });
  }, []);

  const nextTrack = useCallback(() => {
    setPlayback(prev => {
      if (prev.queue.length === 0) return prev;
      let nextIdx = prev.queueIndex + 1;
      if (prev.isShuffle) {
        nextIdx = Math.floor(Math.random() * prev.queue.length);
      } else if (nextIdx >= prev.queue.length) {
        nextIdx = prev.repeatMode === 'all' ? 0 : prev.queueIndex;
      }

      const nextTrk = prev.queue[nextIdx];
      if (nextTrk) {
        playTrack(nextTrk);
      }
      return prev;
    });
  }, [playTrack]);

  const prevTrack = useCallback(() => {
    setPlayback(prev => {
      if (prev.queue.length === 0) return prev;
      if (prev.currentTime > 3) {
        audioEngine.seek(0);
        return { ...prev, currentTime: 0 };
      }
      const prevIdx = Math.max(0, prev.queueIndex - 1);
      const prevTrk = prev.queue[prevIdx];
      if (prevTrk) {
        playTrack(prevTrk);
      }
      return prev;
    });
  }, [playTrack]);

  const toggleShuffle = useCallback(() => {
    setPlayback(prev => ({ ...prev, isShuffle: !prev.isShuffle }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setPlayback(prev => {
      const modes: PlaybackState['repeatMode'][] = ['off', 'all', 'one'];
      const currentIdx = modes.indexOf(prev.repeatMode);
      const nextMode = modes[(currentIdx + 1) % modes.length];
      return { ...prev, repeatMode: nextMode };
    });
  }, []);

  const setCrossfade = useCallback((seconds: number) => {
    setPlayback(prev => ({ ...prev, crossfadeDuration: seconds }));
  }, []);

  const toggleHiResMode = useCallback(() => {
    setPlayback(prev => ({ ...prev, hiResMode: !prev.hiResMode }));
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setPlayback(prev => ({
      ...prev,
      queue: [...prev.queue, track]
    }));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setPlayback(prev => {
      const newQueue = prev.queue.filter((_, idx) => idx !== index);
      let newIdx = prev.queueIndex;
      if (index < prev.queueIndex) {
        newIdx = Math.max(0, prev.queueIndex - 1);
      }
      return { ...prev, queue: newQueue, queueIndex: newIdx };
    });
  }, []);

  const reorderQueue = useCallback((newQueue: Track[]) => {
    setPlayback(prev => ({ ...prev, queue: newQueue }));
  }, []);

  const clearQueue = useCallback(() => {
    setPlayback(prev => ({
      ...prev,
      queue: prev.currentTrack ? [prev.currentTrack] : [],
      queueIndex: 0
    }));
  }, []);

  // Equalizer presets
  const applyEQPreset = useCallback((preset: EqualizerSettings['preset']) => {
    const presets: Record<EqualizerSettings['preset'], Partial<EqualizerSettings>> = {
      flat: { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0, preamp: 0 },
      bass_boost: { bass: 7, lowMid: 4, mid: -1, highMid: 1, treble: 2, preamp: -2 },
      vocal: { bass: -2, lowMid: 1, mid: 5, highMid: 4, treble: 1, preamp: 0 },
      electronic: { bass: 6, lowMid: 3, mid: -2, highMid: 3, treble: 6, preamp: -1 },
      acoustic: { bass: 2, lowMid: 3, mid: 2, highMid: 4, treble: 3, preamp: 0 },
      rock: { bass: 5, lowMid: 2, mid: -1, highMid: 3, treble: 5, preamp: 0 },
      audiophile: { bass: 3, lowMid: 1, mid: 0, highMid: 2, treble: 4, preamp: 0 }
    };

    setEqualizer(prev => ({
      ...prev,
      preset,
      ...presets[preset]
    }));
  }, []);

  const updateEqualizer = useCallback((settings: Partial<EqualizerSettings>) => {
    setEqualizer(prev => ({ ...prev, ...settings }));
  }, []);

  // Like / Unlike Track
  const toggleLikeTrack = useCallback(async (trackId: string) => {
    setLikedTrackIds(prev => {
      const next = new Set(prev);
      const isLiked = next.has(trackId);
      if (isLiked) {
        next.delete(trackId);
        queueSyncAction('UNLIKE_TRACK', { trackId });
      } else {
        next.add(trackId);
        queueSyncAction('LIKE_TRACK', { trackId });
      }
      return next;
    });

    const pending = await getPendingSyncActions();
    setPendingSyncCount(pending.length);
  }, []);

  // Offline Caching
  const downloadTrackForOffline = useCallback(async (track: Track): Promise<boolean> => {
    const success = await cacheTrackForOffline(track);
    if (success) {
      setOfflineTrackIds(prev => new Set(prev).add(track.id));
      setAllTracks(prev => prev.map(t => t.id === track.id ? { ...t, isDownloaded: true } : t));
      
      // Add local notification
      setNotifications(prev => [
        {
          id: `notif-dl-${Date.now()}`,
          title: 'Offline Download Ready',
          message: `"${track.title}" is saved for 100% offline playback.`,
          timestamp: 'Just now',
          read: false,
          type: 'sync',
          coverUrl: track.coverUrl
        },
        ...prev
      ]);
    }
    return success;
  }, []);

  const deleteOfflineTrack = useCallback(async (trackId: string): Promise<boolean> => {
    const success = await removeOfflineTrack(trackId);
    if (success) {
      setOfflineTrackIds(prev => {
        const next = new Set(prev);
        next.delete(trackId);
        return next;
      });
      setAllTracks(prev => prev.map(t => t.id === trackId ? { ...t, isDownloaded: false } : t));
    }
    return success;
  }, []);

  // Cloud Synchronization
  const syncWithCloud = useCallback(async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);

    try {
      const pendingActions = await getPendingSyncActions();
      const payload = {
        userId: currentUser?.id || 'user-demo-1',
        actions: pendingActions,
        clientLibrary: {
          likedTrackIds: Array.from(likedTrackIds),
          playlists: playlists
        }
      };

      const res = await fetch('/api/library/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.serverLibrary) {
          if (data.serverLibrary.likedTrackIds) {
            setLikedTrackIds(new Set(data.serverLibrary.likedTrackIds));
          }
          if (data.serverLibrary.playlists && data.serverLibrary.playlists.length > 0) {
            setPlaylists(data.serverLibrary.playlists);
          }
          if (data.serverLibrary.uploadedTracks) {
            setUploadedTracks(data.serverLibrary.uploadedTracks);
          }
        }

        // Clear outbox queue
        if (pendingActions.length > 0) {
          await clearPendingSyncActions(pendingActions.map(a => a.id));
        }
        setPendingSyncCount(0);

        setNotifications(prev => [
          {
            id: `notif-sync-${Date.now()}`,
            title: 'Cloud Synchronization Succeeded',
            message: `Synced ${pendingActions.length} changes with cloud storage.`,
            timestamp: 'Just now',
            read: false,
            type: 'sync'
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.warn('Sync attempt note:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser, likedTrackIds, playlists]);

  // Playlist management
  const createPlaylist = useCallback(async (
    title: string, 
    description?: string, 
    coverUrl?: string, 
    trackIds?: string[]
  ): Promise<Playlist> => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      title: title || 'New Playlist',
      description: description || 'Personal curated mix',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      trackIds: trackIds || [],
      isPublic: true,
      authorId: currentUser?.id || 'user-demo-1',
      authorName: currentUser?.name || 'Alex Vance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0
    };

    setPlaylists(prev => [newPlaylist, ...prev]);
    queueSyncAction('CREATE_PLAYLIST', newPlaylist);
    const pending = await getPendingSyncActions();
    setPendingSyncCount(pending.length);

    return newPlaylist;
  }, [currentUser]);

  const updatePlaylist = useCallback((updated: Playlist) => {
    setPlaylists(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p));
    queueSyncAction('UPDATE_PLAYLIST', updated);
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    queueSyncAction('DELETE_PLAYLIST', { id: playlistId });
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (!p.trackIds.includes(trackId)) {
          const updated = { ...p, trackIds: [...p.trackIds, trackId], updatedAt: new Date().toISOString() };
          queueSyncAction('UPDATE_PLAYLIST', updated);
          return updated;
        }
      }
      return p;
    }));
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        const updated = { ...p, trackIds: p.trackIds.filter(id => id !== trackId), updatedAt: new Date().toISOString() };
        queueSyncAction('UPDATE_PLAYLIST', updated);
        return updated;
      }
      return p;
    }));
  }, []);

  const reorderPlaylistTracks = useCallback((playlistId: string, newTrackIds: string[]) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        const updated = { ...p, trackIds: newTrackIds, updatedAt: new Date().toISOString() };
        queueSyncAction('UPDATE_PLAYLIST', updated);
        return updated;
      }
      return p;
    }));
  }, []);

  // User Auth
  const loginUser = useCallback(async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsAuthModalOpen(false);
        syncWithCloud();
      }
    } catch (e) {
      console.warn('Login note:', e);
    }
  }, [syncWithCloud]);

  const loginDemoUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsAuthModalOpen(false);
        syncWithCloud();
      }
    } catch (e) {
      console.warn('Demo login note:', e);
    }
  }, [syncWithCloud]);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const uploadCloudTrack = useCallback(async (trackData: any): Promise<Track> => {
    const res = await fetch('/api/library/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...trackData,
        userId: currentUser?.id
      })
    });

    if (res.ok) {
      const data = await res.json();
      const newTrack: Track = data.track;
      setUploadedTracks(prev => [newTrack, ...prev]);
      setAllTracks(prev => [newTrack, ...prev]);
      queueSyncAction('UPLOAD_TRACK', newTrack);
      return newTrack;
    }
    throw new Error('Failed to upload track to cloud locker');
  }, [currentUser]);

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id || id === 'all' ? { ...n, read: true } : n));
    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(console.warn);
  }, []);

  const addNotification = useCallback((notif: Omit<ReleaseNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: ReleaseNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const openShareModal = useCallback((item: { track?: Track; playlist?: Playlist }) => {
    setShareTarget(item);
    setIsShareModalOpen(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <MusicContext.Provider
      value={{
        playback,
        playTrack,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleRepeat,
        setCrossfade,
        toggleHiResMode,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        clearQueue,

        equalizer,
        updateEqualizer,
        applyEQPreset,

        allTracks,
        playlists,
        likedTrackIds,
        uploadedTracks,
        offlineTrackIds,
        history,
        toggleLikeTrack,

        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        reorderPlaylistTracks,

        isOnline,
        isSyncing,
        pendingSyncCount,
        downloadTrackForOffline,
        deleteOfflineTrack,
        syncWithCloud,

        currentUser,
        loginUser,
        loginDemoUser,
        logoutUser,
        uploadCloudTrack,

        notifications,
        unreadNotifCount,
        markNotificationAsRead,
        addNotification,

        currentView,
        setCurrentView,
        selectedPlaylistId,
        setSelectedPlaylistId,
        isVisualizerOpen,
        setIsVisualizerOpen,
        isEqualizerOpen,
        setIsEqualizerOpen,
        isQueueOpen,
        setIsQueueOpen,
        isShareModalOpen,
        setIsShareModalOpen,
        shareTarget,
        openShareModal,
        isCloudUploadOpen,
        setIsCloudUploadOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isPlaylistCreatorOpen,
        setIsPlaylistCreatorOpen,
        theme,
        toggleTheme
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

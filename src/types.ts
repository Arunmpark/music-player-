export type AudioQuality = 'hi-res' | 'high' | 'normal';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  genre: string;
  releaseYear?: number;
  isHiRes?: boolean;
  format?: 'FLAC' | 'WAV' | 'AAC' | 'MP3';
  bitDepth?: number; // e.g. 24 or 16
  sampleRate?: number; // e.g. 96000 or 44100
  bitrate?: number; // e.g. 1411 (kbps)
  lyrics?: string[];
  isDownloaded?: boolean;
  fileSize?: number; // in bytes
  source?: 'catalog' | 'stream' | 'upload' | 'offline';
  playCount?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  isPublic?: boolean;
  authorId?: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: 'Audiophile Hi-Fi' | 'Lossless Premium' | 'Standard';
  joinedAt: string;
  storageUsedBytes?: number;
}

export type SyncActionType = 
  | 'LIKE_TRACK'
  | 'UNLIKE_TRACK'
  | 'CREATE_PLAYLIST'
  | 'UPDATE_PLAYLIST'
  | 'DELETE_PLAYLIST'
  | 'ADD_TO_PLAYLIST'
  | 'REMOVE_FROM_PLAYLIST'
  | 'REORDER_PLAYLIST'
  | 'UPLOAD_TRACK'
  | 'ADD_HISTORY';

export interface SyncAction {
  id: string;
  type: SyncActionType;
  payload: any;
  timestamp: number;
  synced: boolean;
}

export interface ReleaseNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'release' | 'sync' | 'social' | 'system';
  trackId?: string;
  coverUrl?: string;
}

export interface EqualizerSettings {
  enabled: boolean;
  preset: 'flat' | 'bass_boost' | 'vocal' | 'electronic' | 'acoustic' | 'rock' | 'audiophile';
  bass: number; // -12 to 12 dB (80 Hz)
  lowMid: number; // -12 to 12 dB (320 Hz)
  mid: number; // -12 to 12 dB (1000 Hz)
  highMid: number; // -12 to 12 dB (3200 Hz)
  treble: number; // -12 to 12 dB (12000 Hz)
  preamp: number; // -6 to 6 dB
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  queueIndex: number;
  crossfadeDuration: number; // seconds (0 to 12)
  hiResMode: boolean;
  playbackRate: number;
}

export interface CommunityComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  comment: string;
  timestamp: string;
}

export interface CommunityPlaylist extends Playlist {
  comments?: CommunityComment[];
  sharesCount?: number;
}

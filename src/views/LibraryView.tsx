import React, { useState } from 'react';
import { 
  Heart, 
  Layers, 
  Cloud, 
  DownloadCloud, 
  Clock, 
  Plus, 
  CloudUpload, 
  RefreshCw, 
  Sparkles, 
  Music, 
  HardDrive,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { TrackItem } from '../components/TrackItem';

export const LibraryView: React.FC = () => {
  const {
    allTracks,
    playlists,
    likedTrackIds,
    uploadedTracks,
    offlineTrackIds,
    history,
    setCurrentView,
    setSelectedPlaylistId,
    setIsPlaylistCreatorOpen,
    setIsCloudUploadOpen,
    syncWithCloud,
    isSyncing
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'liked' | 'playlists' | 'cloud' | 'offline' | 'history'>('liked');

  const likedTracksList = allTracks.filter(t => likedTrackIds.has(t.id));
  const offlineTracksList = allTracks.filter(t => offlineTrackIds.has(t.id));

  // Audio stats
  const totalPlaylists = playlists.length;
  const totalLiked = likedTrackIds.size;
  const totalUploaded = uploadedTracks.length;
  const totalOffline = offlineTrackIds.size;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1512] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Personalized Studio Library
          </h1>
          <p className="text-xs sm:text-sm text-[#8e8279] mt-1">
            Manage your high-resolution masters, playlists, offline downloads, and cloud lockers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => syncWithCloud()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#140e0b] hover:bg-[#1a1512] border border-[#251d18] text-xs font-semibold text-[#e0d8d0] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#ff4e00]' : 'text-[#8e8279]'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          <button
            onClick={() => setIsCloudUploadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#140e0b] hover:bg-[#1a1512] border border-[#251d18] text-xs font-semibold text-[#ff7300] hover:text-[#ffd000] transition-colors"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setCurrentView('creator')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff4e00] to-[#ffd000] hover:brightness-110 text-[#0a0502] text-xs font-bold shadow-lg shadow-[#ff4e00]/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0f0a08]/80 border border-[#1a1512] p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-[#ff4e00]">
            <Heart className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Liked Songs</span>
          </div>
          <p className="text-xl font-bold font-mono text-white mt-1">{totalLiked} tracks</p>
        </div>

        <div className="bg-[#0f0a08]/80 border border-[#1a1512] p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-[#ff7300]">
            <Layers className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Playlists</span>
          </div>
          <p className="text-xl font-bold font-mono text-white mt-1">{totalPlaylists} mixes</p>
        </div>

        <div className="bg-[#0f0a08]/80 border border-[#1a1512] p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-[#ffd000]">
            <DownloadCloud className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Offline Cached</span>
          </div>
          <p className="text-xl font-bold font-mono text-white mt-1">{totalOffline} downloads</p>
        </div>

        <div className="bg-[#0f0a08]/80 border border-[#1a1512] p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-[#ff4e00]">
            <Cloud className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Cloud Locker</span>
          </div>
          <p className="text-xl font-bold font-mono text-white mt-1">{totalUploaded} files</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1a1512] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'liked'
              ? 'bg-[#ff4e00]/15 border border-[#ff4e00]/30 text-[#ff4e00] shadow-sm'
              : 'text-[#8e8279] hover:text-white hover:bg-[#140e0b]'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-[#ff4e00] text-[#ff4e00]" />
          <span>Liked Songs ({likedTracksList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'playlists'
              ? 'bg-[#ff4e00]/15 border border-[#ff4e00]/30 text-[#ff4e00] shadow-sm'
              : 'text-[#8e8279] hover:text-white hover:bg-[#140e0b]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#ff7300]" />
          <span>Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'cloud'
              ? 'bg-[#ff4e00]/15 border border-[#ff4e00]/30 text-[#ff4e00] shadow-sm'
              : 'text-[#8e8279] hover:text-white hover:bg-[#140e0b]'
          }`}
        >
          <Cloud className="w-3.5 h-3.5 text-[#ffd000]" />
          <span>Cloud Uploads ({uploadedTracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('offline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'offline'
              ? 'bg-[#ff4e00]/15 border border-[#ff4e00]/30 text-[#ff4e00] shadow-sm'
              : 'text-[#8e8279] hover:text-white hover:bg-[#140e0b]'
          }`}
        >
          <DownloadCloud className="w-3.5 h-3.5 text-[#ff4e00]" />
          <span>Offline Cached ({offlineTracksList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'history'
              ? 'bg-[#ff4e00]/15 border border-[#ff4e00]/30 text-[#ff4e00] shadow-sm'
              : 'text-[#8e8279] hover:text-white hover:bg-[#140e0b]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#8e8279]" />
          <span>Listening History</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'liked' && (
          <div>
            {likedTracksList.length === 0 ? (
              <div className="py-16 text-center text-[#6d5f56] bg-[#0f0a08]/40 rounded-3xl border border-[#1a1512] p-8 space-y-2">
                <Heart className="w-10 h-10 text-[#6d5f56] mx-auto" />
                <p className="text-sm font-bold text-white">No Liked Tracks Yet</p>
                <p className="text-xs text-[#8e8279]">Click the heart icon on any master track to save it here.</p>
              </div>
            ) : (
              <div className="bg-[#0f0a08]/60 border border-[#1a1512] rounded-2xl p-2 divide-y divide-[#1a1512]/60">
                {likedTracksList.map((trk, i) => (
                  <TrackItem
                    key={trk.id}
                    track={trk}
                    index={i}
                    playlistContext={likedTracksList}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => {
                  setSelectedPlaylistId(pl.id);
                  setCurrentView('playlist');
                }}
                className="bg-[#0f0a08]/80 hover:bg-[#140e0b] border border-[#1a1512] hover:border-[#ff4e00]/40 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-xl flex gap-4 items-center group"
              >
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-md group-hover:scale-105 transition-transform border border-[#251d18]"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-[#ff4e00] transition-colors truncate">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-[#8e8279] line-clamp-2 mt-1">{pl.description}</p>
                  <p className="text-[10px] font-mono text-[#6d5f56] mt-2">{pl.trackIds.length} tracks &bull; Synced</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cloud' && (
          <div>
            {uploadedTracks.length === 0 ? (
              <div className="py-16 text-center text-[#6d5f56] bg-[#0f0a08]/40 rounded-3xl border border-[#1a1512] p-8 space-y-3">
                <Cloud className="w-10 h-10 text-[#ff7300] mx-auto" />
                <p className="text-sm font-bold text-white">Your Cloud Locker is Empty</p>
                <p className="text-xs text-[#8e8279] max-w-sm mx-auto">
                  Upload your own high-resolution WAV, FLAC, or MP3 files to stream across all devices.
                </p>
                <button
                  onClick={() => setIsCloudUploadOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff4e00] to-[#ffd000] text-[#0a0502] text-xs font-bold"
                >
                  Upload First Track
                </button>
              </div>
            ) : (
              <div className="bg-[#0f0a08]/60 border border-[#1a1512] rounded-2xl p-2 divide-y divide-[#1a1512]/60">
                {uploadedTracks.map((trk, i) => (
                  <TrackItem
                    key={trk.id}
                    track={trk}
                    index={i}
                    playlistContext={uploadedTracks}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'offline' && (
          <div>
            {offlineTracksList.length === 0 ? (
              <div className="py-16 text-center text-[#6d5f56] bg-[#0f0a08]/40 rounded-3xl border border-[#1a1512] p-8 space-y-2">
                <DownloadCloud className="w-10 h-10 text-[#ffd000] mx-auto" />
                <p className="text-sm font-bold text-white">No Tracks Downloaded for Offline Mode</p>
                <p className="text-xs text-[#8e8279]">
                  Click the cloud download icon on any song to save uncompressed audio into local IndexedDB storage.
                </p>
              </div>
            ) : (
              <div className="bg-[#0f0a08]/60 border border-[#1a1512] rounded-2xl p-2 divide-y divide-[#1a1512]/60">
                {offlineTracksList.map((trk, i) => (
                  <TrackItem
                    key={trk.id}
                    track={trk}
                    index={i}
                    playlistContext={offlineTracksList}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {history.length === 0 ? (
              <div className="py-16 text-center text-[#6d5f56] bg-[#0f0a08]/40 rounded-3xl border border-[#1a1512] p-8 space-y-2">
                <Clock className="w-10 h-10 text-[#6d5f56] mx-auto" />
                <p className="text-sm font-bold text-white">No Listening History</p>
                <p className="text-xs text-[#8e8279]">Tracks you play will automatically appear here.</p>
              </div>
            ) : (
              <div className="bg-[#0f0a08]/60 border border-[#1a1512] rounded-2xl p-2 divide-y divide-[#1a1512]/60">
                {history.map((trk, i) => (
                  <TrackItem
                    key={`${trk.id}-${i}`}
                    track={trk}
                    index={i}
                    playlistContext={history}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

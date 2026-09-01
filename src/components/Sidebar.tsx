import React, { useState } from 'react';
import { 
  Home, 
  Compass, 
  Library, 
  Heart, 
  Plus, 
  Radio, 
  Flame, 
  DownloadCloud, 
  Layers, 
  Users, 
  HardDrive, 
  Cloud, 
  FolderPlus,
  Sparkles,
  Music2,
  Trash2
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    playlists,
    createPlaylist,
    selectedPlaylistId,
    setSelectedPlaylistId,
    likedTrackIds,
    offlineTrackIds,
    uploadedTracks,
    addTrackToPlaylist,
    setIsPlaylistCreatorOpen
  } = useMusic();

  const [dragOverPlaylistId, setDragOverPlaylistId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, playlistId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverPlaylistId(playlistId);
  };

  const handleDragLeave = () => {
    setDragOverPlaylistId(null);
  };

  const handleDrop = (e: React.DragEvent, playlistId: string) => {
    e.preventDefault();
    setDragOverPlaylistId(null);
    try {
      const trackData = e.dataTransfer.getData('application/json');
      if (trackData) {
        const track = JSON.parse(trackData);
        if (track && track.id) {
          addTrackToPlaylist(playlistId, track.id);
        }
      }
    } catch (err) {
      console.warn('Drop track error:', err);
    }
  };

  const handleCreateQuickPlaylist = async () => {
    const title = `My Mix #${playlists.length + 1}`;
    const newPl = await createPlaylist(title, 'Curated custom high-res playlist');
    setSelectedPlaylistId(newPl.id);
    setCurrentView('playlist');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0f0a08] border-r border-[#1a1512] flex flex-col h-[calc(100vh-4rem-5.5rem)] select-none">
      {/* Primary Navigation */}
      <div className="p-4 space-y-1">
        <button
          onClick={() => {
            setSelectedPlaylistId(null);
            setCurrentView('home');
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            currentView === 'home'
              ? 'bg-[#1a1512] text-white border border-[#251d18] shadow-sm'
              : 'text-[#8e8279] hover:text-[#e0d8d0] hover:bg-[#140e0b]'
          }`}
        >
          <Home className={`w-4 h-4 ${currentView === 'home' ? 'text-[#ff4e00]' : ''}`} />
          <span>Discover</span>
        </button>

        <button
          onClick={() => {
            setSelectedPlaylistId(null);
            setCurrentView('search');
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            currentView === 'search'
              ? 'bg-[#1a1512] text-white border border-[#251d18] shadow-sm'
              : 'text-[#8e8279] hover:text-[#e0d8d0] hover:bg-[#140e0b]'
          }`}
        >
          <Compass className={`w-4 h-4 ${currentView === 'search' ? 'text-[#ff4e00]' : ''}`} />
          <span>Search & Streaming</span>
        </button>

        <button
          onClick={() => {
            setSelectedPlaylistId(null);
            setCurrentView('library');
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            currentView === 'library'
              ? 'bg-[#1a1512] text-white border border-[#251d18] shadow-sm'
              : 'text-[#8e8279] hover:text-[#e0d8d0] hover:bg-[#140e0b]'
          }`}
        >
          <Library className={`w-4 h-4 ${currentView === 'library' ? 'text-[#ff4e00]' : ''}`} />
          <span>Your Library</span>
        </button>

        <button
          onClick={() => {
            setSelectedPlaylistId(null);
            setCurrentView('creator');
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            currentView === 'creator'
              ? 'bg-gradient-to-r from-[#251206] to-[#1a100a] text-[#ff7300] border border-[#ff4e00]/30'
              : 'text-[#ff7300]/90 hover:text-[#ff7300] hover:bg-[#ff4e00]/10'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#ff4e00]" />
          <span>Playlist Creator (D&D)</span>
        </button>

        <button
          onClick={() => {
            setSelectedPlaylistId(null);
            setCurrentView('offline');
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            currentView === 'offline'
              ? 'bg-[#251206] text-[#ffd000] border border-[#ffd000]/30'
              : 'text-[#8e8279] hover:text-[#e0d8d0] hover:bg-[#140e0b]'
          }`}
        >
          <div className="flex items-center gap-3">
            <DownloadCloud className={`w-4 h-4 ${currentView === 'offline' ? 'text-[#ffd000]' : 'text-[#8e8279]'}`} />
            <span>Offline Cached</span>
          </div>
          {offlineTrackIds.size > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffd000]/20 text-[#ffd000]">
              {offlineTrackIds.size}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setSelectedPlaylistId(null);
            setCurrentView('community');
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            currentView === 'community'
              ? 'bg-[#1a1512] text-white border border-[#251d18] shadow-sm'
              : 'text-[#8e8279] hover:text-[#e0d8d0] hover:bg-[#140e0b]'
          }`}
        >
          <Users className={`w-4 h-4 ${currentView === 'community' ? 'text-[#ff7300]' : ''}`} />
          <span>Community Mixes</span>
        </button>
      </div>

      {/* Library Collections */}
      <div className="px-4 py-2 border-t border-[#1a1512] flex-1 overflow-y-auto">
        <div className="flex items-center justify-between py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6d5f56]">
          <span>Playlists & Collections</span>
          <button
            onClick={handleCreateQuickPlaylist}
            title="Create Playlist"
            className="p-1 hover:bg-[#1a1512] hover:text-white rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Liked Songs Special Row */}
        <button
          onClick={() => {
            setSelectedPlaylistId('liked-songs');
            setCurrentView('playlist');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
            selectedPlaylistId === 'liked-songs'
              ? 'bg-[#1a1512] text-white border border-[#251d18]'
              : 'text-[#8e8279] hover:text-[#e0d8d0] hover:bg-[#140e0b]'
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff4e00] to-[#922b00] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="flex-1 text-left truncate">
            <span className="block truncate text-[#e0d8d0] group-hover:text-white font-medium">Liked Songs</span>
            <span className="text-[10px] text-[#6d5f56]">{likedTrackIds.size} tracks</span>
          </div>
        </button>

        {/* Cloud Uploads Row */}
        {uploadedTracks.length > 0 && (
          <button
            onClick={() => {
              setSelectedPlaylistId('cloud-uploads');
              setCurrentView('playlist');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
              selectedPlaylistId === 'cloud-uploads'
                ? 'bg-[#1a1512] text-white border border-[#251d18]'
                : 'text-[#8e8279] hover:text-[#e0d8d0] hover:bg-[#140e0b]'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff7300] to-[#b83800] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <Cloud className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 text-left truncate">
              <span className="block truncate text-[#e0d8d0] group-hover:text-white font-medium">Cloud Masters</span>
              <span className="text-[10px] text-[#6d5f56]">{uploadedTracks.length} files</span>
            </div>
          </button>
        )}

        {/* Custom Playlists List (Drop targets for dragging tracks!) */}
        <div className="mt-2 space-y-1">
          {playlists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.id;
            const isDragOver = dragOverPlaylistId === pl.id;

            return (
              <div
                key={pl.id}
                onDragOver={(e) => handleDragOver(e, pl.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, pl.id)}
                onClick={() => {
                  setSelectedPlaylistId(pl.id);
                  setCurrentView('playlist');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                  isDragOver
                    ? 'border-[#ff4e00] bg-[#ff4e00]/20 text-[#ff7300] scale-[1.02]'
                    : isSelected
                    ? 'bg-[#1a1512] border-[#251d18] text-white'
                    : 'border-transparent text-[#8e8279] hover:text-[#e0d8d0] hover:bg-[#140e0b]'
                }`}
              >
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-7 h-7 rounded-md object-cover flex-shrink-0 bg-[#1a1512] border border-[#251d18]"
                />
                <div className="flex-1 min-w-0 text-left">
                  <span className="block truncate text-[#e0d8d0] font-medium">{pl.title}</span>
                  <span className="text-[10px] text-[#6d5f56]">{pl.trackIds.length} tracks</span>
                </div>
                {isDragOver && (
                  <span className="text-[9px] font-bold uppercase text-[#ff4e00] px-1.5 py-0.5 bg-[#ff4e00]/20 rounded">
                    Drop to add
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage & Hi-Res Status Meter Footer */}
      <div className="p-3.5 border-t border-[#1a1512] bg-[#0a0502]/90 text-xs">
        <div className="flex items-center justify-between text-[#8e8279] mb-1.5">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-[#6d5f56]" />
            <span className="text-[11px] font-medium">Offline Cache</span>
          </div>
          <span className="text-[10px] text-[#6d5f56]">{offlineTrackIds.size} tracks cached</span>
        </div>
        <div className="w-full bg-[#140e0b] border border-[#1a1512] rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#ff4e00] to-[#ffd000] h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(8, offlineTrackIds.size * 12))}%` }}
          />
        </div>
      </div>
    </aside>
  );
};

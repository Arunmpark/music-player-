import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  DownloadCloud, 
  Check, 
  MoreHorizontal, 
  Share2, 
  ListPlus, 
  GripVertical,
  Volume2
} from 'lucide-react';
import { Track } from '../types';
import { useMusic } from '../context/MusicContext';

interface TrackItemProps {
  track: Track;
  index: number;
  playlistContext?: Track[];
  showAlbum?: boolean;
  showCover?: boolean;
  showDragHandle?: boolean;
  onRemoveFromPlaylist?: (trackId: string) => void;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  track,
  index,
  playlistContext,
  showAlbum = true,
  showCover = true,
  showDragHandle = true,
  onRemoveFromPlaylist
}) => {
  const {
    playback,
    playTrack,
    togglePlay,
    likedTrackIds,
    toggleLikeTrack,
    offlineTrackIds,
    downloadTrackForOffline,
    deleteOfflineTrack,
    playlists,
    addTrackToPlaylist,
    openShareModal,
    addToQueue
  } = useMusic();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlaylistSubmenuOpen, setIsPlaylistSubmenuOpen] = useState(false);

  const isCurrent = playback.currentTrack?.id === track.id;
  const isPlaying = isCurrent && playback.isPlaying;
  const isLiked = likedTrackIds.has(track.id);
  const isDownloaded = offlineTrackIds.has(track.id);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, playlistContext);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(track));
    e.dataTransfer.setData('text/plain', track.id);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  return (
    <div
      draggable={showDragHandle}
      onDragStart={handleDragStart}
      className={`group relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all border ${
        isCurrent
          ? 'bg-[#1a1512] border-[#ff4e00]/40 text-[#ff4e00]'
          : 'border-transparent hover:bg-[#140e0b] text-[#e0d8d0]'
      }`}
    >
      {/* Left: Drag handle, index / play button, cover, title, artist */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {showDragHandle && (
          <div 
            title="Drag to add to playlist or reorder"
            className="cursor-grab active:cursor-grabbing text-[#6d5f56] group-hover:text-[#8e8279] p-0.5"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Index or Play icon */}
        <div className="w-6 flex items-center justify-center text-xs font-mono text-[#6d5f56] flex-shrink-0">
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-1 bg-[#ff4e00] h-full animate-pulse" />
              <span className="w-1 bg-[#ff4e00] h-2/3 animate-pulse delay-75" />
              <span className="w-1 bg-[#ff4e00] h-4/5 animate-pulse delay-150" />
            </div>
          ) : (
            <span className="group-hover:hidden">{index + 1}</span>
          )}
          <button
            onClick={handlePlayClick}
            className={`hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full hover:scale-110 active:scale-95 transition-transform ${
              isCurrent ? 'text-[#ff4e00]' : 'text-white'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Cover Art */}
        {showCover && (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-[#140e0b] border border-[#251d18] shadow-sm"
          />
        )}

        {/* Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#ff4e00]' : 'text-[#e0d8d0]'}`}>
              {track.title}
            </span>
            {track.isHiRes && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#ff4e00]/15 text-[#ff4e00] border border-[#ff4e00]/30 flex-shrink-0 font-mono">
                {track.format || 'FLAC'}
              </span>
            )}
          </div>
          <p className="text-xs text-[#8e8279] truncate mt-0.5">{track.artist}</p>
        </div>
      </div>

      {/* Center: Album info (Desktop) */}
      {showAlbum && (
        <div className="hidden md:block w-1/4 truncate text-xs text-[#8e8279]">
          {track.album}
        </div>
      )}

      {/* Right: Like, Offline Download, Duration, Actions Menu */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Like button */}
        <button
          onClick={() => toggleLikeTrack(track.id)}
          title={isLiked ? 'Unlike' : 'Like track'}
          className={`p-1.5 rounded-full transition-colors ${
            isLiked ? 'text-[#ff4e00]' : 'text-[#6d5f56] hover:text-[#e0d8d0] opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#ff4e00]' : ''}`} />
        </button>

        {/* Offline Download button */}
        <button
          onClick={() => {
            if (isDownloaded) {
              deleteOfflineTrack(track.id);
            } else {
              downloadTrackForOffline(track);
            }
          }}
          title={isDownloaded ? 'Downloaded (Offline Ready)' : 'Download for offline playback'}
          className={`p-1.5 rounded-full transition-colors ${
            isDownloaded ? 'text-[#ff4e00]' : 'text-[#6d5f56] hover:text-[#e0d8d0] opacity-0 group-hover:opacity-100'
          }`}
        >
          {isDownloaded ? <Check className="w-4 h-4" /> : <DownloadCloud className="w-4 h-4" />}
        </button>

        {/* Duration */}
        <span className="text-xs font-mono text-[#6d5f56] w-10 text-right">
          {formatDuration(track.duration)}
        </span>

        {/* More Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-full text-[#6d5f56] hover:text-[#e0d8d0] opacity-0 group-hover:opacity-100 transition-opacity"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div 
              onMouseLeave={() => {
                setIsMenuOpen(false);
                setIsPlaylistSubmenuOpen(false);
              }}
              className="absolute right-0 bottom-full mb-1 w-48 bg-[#0f0a08] border border-[#251d18] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in"
            >
              <button
                onClick={() => {
                  addToQueue(track);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-[#e0d8d0] hover:text-white hover:bg-[#1a1512] rounded-lg flex items-center gap-2"
              >
                <ListPlus className="w-3.5 h-3.5 text-[#8e8279]" />
                <span>Add to Queue</span>
              </button>

              <button
                onClick={() => setIsPlaylistSubmenuOpen(!isPlaylistSubmenuOpen)}
                className="w-full text-left px-3 py-1.5 text-xs text-[#e0d8d0] hover:text-white hover:bg-[#1a1512] rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ListPlus className="w-3.5 h-3.5 text-[#8e8279]" />
                  <span>Add to Playlist</span>
                </div>
                <span className="text-[10px] text-[#6d5f56]">▶</span>
              </button>

              {isPlaylistSubmenuOpen && (
                <div className="bg-[#140e0b] border border-[#251d18] rounded-lg p-1 mt-1 space-y-0.5 max-h-36 overflow-y-auto">
                  {playlists.length === 0 ? (
                    <p className="text-[10px] text-[#6d5f56] px-2 py-1">No playlists yet</p>
                  ) : (
                    playlists.map((pl) => (
                      <button
                        key={pl.id}
                        onClick={() => {
                          addTrackToPlaylist(pl.id, track.id);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-2 py-1 text-[11px] text-[#e0d8d0] hover:text-white hover:bg-[#1a1512] rounded truncate"
                      >
                        {pl.title}
                      </button>
                    ))
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  openShareModal({ track });
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-[#e0d8d0] hover:text-white hover:bg-[#1a1512] rounded-lg flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5 text-[#8e8279]" />
                <span>Share Track</span>
              </button>

              {onRemoveFromPlaylist && (
                <button
                  onClick={() => {
                    onRemoveFromPlaylist(track.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 border-t border-[#1a1512] mt-1 pt-1.5"
                >
                  <span>Remove from playlist</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

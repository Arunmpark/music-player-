import React, { useState } from 'react';
import { 
  Play, 
  Shuffle, 
  Heart, 
  DownloadCloud, 
  Share2, 
  Trash2, 
  Edit3, 
  Clock, 
  Sparkles, 
  ArrowLeft,
  GripVertical,
  Plus,
  Layers
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { TrackItem } from '../components/TrackItem';
import { Track } from '../types';

export const PlaylistDetailView: React.FC = () => {
  const {
    selectedPlaylistId,
    playlists,
    allTracks,
    likedTrackIds,
    uploadedTracks,
    offlineTrackIds,
    playTrack,
    toggleShuffle,
    removeTrackFromPlaylist,
    reorderPlaylistTracks,
    deletePlaylist,
    openShareModal,
    downloadTrackForOffline,
    setCurrentView
  } = useMusic();

  const [draggedTrackIndex, setDraggedTrackIndex] = useState<number | null>(null);

  // Determine playlist data
  let playlistTitle = 'Playlist';
  let playlistDesc = 'Curated collection';
  let playlistCover = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';
  let tracks: Track[] = [];
  let isLikedPlaylist = selectedPlaylistId === 'liked-songs';
  let isCloudLockerPlaylist = selectedPlaylistId === 'cloud-uploads';
  let isCustom = false;
  let authorName = 'Resonance Editorial';

  if (isLikedPlaylist) {
    playlistTitle = 'Liked Songs';
    playlistDesc = 'Your personal high-resolution favorites collection';
    playlistCover = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80';
    tracks = allTracks.filter(t => likedTrackIds.has(t.id));
    authorName = 'Personal Library';
  } else if (isCloudLockerPlaylist) {
    playlistTitle = 'Cloud Masters Locker';
    playlistDesc = 'Uploaded studio files stored in your uncompressed cloud locker';
    playlistCover = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80';
    tracks = uploadedTracks;
    authorName = 'Cloud Storage';
  } else {
    const pl = playlists.find(p => p.id === selectedPlaylistId);
    if (pl) {
      playlistTitle = pl.title;
      playlistDesc = pl.description || 'Custom mix';
      playlistCover = pl.coverUrl;
      authorName = pl.authorName || 'Resonance User';
      tracks = pl.trackIds
        .map(id => allTracks.find(t => t.id === id))
        .filter((t): t is Track => !!t);
      isCustom = true;
    }
  }

  // Playlist stats
  const totalSeconds = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalSizeMB = (tracks.reduce((acc, t) => acc + (t.fileSize || 30000000), 0) / (1024 * 1024)).toFixed(1);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShuffleAll = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  const handleDownloadAll = async () => {
    for (const trk of tracks) {
      await downloadTrackForOffline(trk);
    }
  };

  // Reordering handlers
  const handleDragStart = (index: number) => {
    setDraggedTrackIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedTrackIndex === null || draggedTrackIndex === targetIndex || !isCustom || !selectedPlaylistId) return;

    const newTrackList = [...tracks];
    const item = newTrackList.splice(draggedTrackIndex, 1)[0];
    newTrackList.splice(targetIndex, 0, item);
    setDraggedTrackIndex(targetIndex);
    reorderPlaylistTracks(selectedPlaylistId, newTrackList.map(t => t.id));
  };

  const handleDragEnd = () => {
    setDraggedTrackIndex(null);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Back Button */}
      <button
        onClick={() => setCurrentView('library')}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#8e8279] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </button>

      {/* Playlist Hero Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 bg-gradient-to-b from-[#140e0b] to-[#0a0502] border border-[#1a1512] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <img
          src={playlistCover}
          alt={playlistTitle}
          className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover shadow-2xl border border-[#251d18] flex-shrink-0"
        />

        <div className="space-y-3 min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/20 text-[10px] font-bold uppercase tracking-wider font-mono">
            <span>PUBLIC LOSSLESS PLAYLIST</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif italic text-white tracking-tight">
            {playlistTitle}
          </h1>

          <p className="text-sm text-[#8e8279] line-clamp-2">{playlistDesc}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#8e8279] pt-1 font-mono">
            <span className="font-semibold text-[#e0d8d0]">{authorName}</span>
            <span>&bull;</span>
            <span>{tracks.length} tracks</span>
            <span>&bull;</span>
            <span>~{totalMinutes} mins</span>
            <span>&bull;</span>
            <span className="text-[#ff4e00] font-bold">{totalSizeMB} MB 24-bit Audio</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1a1512] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4e00] to-[#ffd000] hover:brightness-110 text-[#0a0502] font-extrabold text-sm shadow-lg shadow-[#ff4e00]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Play All</span>
          </button>

          <button
            onClick={handleShuffleAll}
            disabled={tracks.length === 0}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#140e0b] hover:bg-[#1a1512] border border-[#251d18] text-xs font-bold text-[#e0d8d0] hover:text-white transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>

          <button
            onClick={handleDownloadAll}
            disabled={tracks.length === 0}
            title="Download entire playlist for offline listening"
            className="p-3 rounded-full bg-[#140e0b] hover:bg-[#1a1512] border border-[#251d18] text-[#ff7300] hover:text-[#ffd000] transition-colors"
          >
            <DownloadCloud className="w-4 h-4" />
          </button>

          <button
            onClick={() => openShareModal({ playlist: playlists.find(p => p.id === selectedPlaylistId) })}
            title="Share Playlist"
            className="p-3 rounded-full bg-[#140e0b] hover:bg-[#1a1512] border border-[#251d18] text-[#8e8279] hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {isCustom && selectedPlaylistId && (
          <button
            onClick={() => {
              deletePlaylist(selectedPlaylistId);
              setCurrentView('library');
            }}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Playlist</span>
          </button>
        )}
      </div>

      {/* Tracklist with Drag & Drop Reordering */}
      <div className="space-y-1">
        {tracks.length === 0 ? (
          <div className="py-16 text-center text-[#6d5f56] bg-[#0f0a08]/40 rounded-3xl border border-[#1a1512] p-8 space-y-3">
            <Layers className="w-10 h-10 text-[#6d5f56] mx-auto" />
            <p className="text-sm font-bold text-white">This Playlist is Empty</p>
            <p className="text-xs text-[#8e8279]">
              Drag and drop songs from Discover or Search into this playlist, or use the Drag & Drop Playlist Creator.
            </p>
            <button
              onClick={() => setCurrentView('creator')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff4e00] to-[#ffd000] text-[#0a0502] text-xs font-bold"
            >
              Open Playlist Creator
            </button>
          </div>
        ) : (
          <div className="bg-[#0f0a08]/60 border border-[#1a1512] rounded-2xl p-2 divide-y divide-[#1a1512]/60">
            {tracks.map((trk, i) => (
              <div
                key={`${trk.id}-${i}`}
                draggable={isCustom}
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                className={draggedTrackIndex === i ? 'opacity-40 scale-98 transition-all' : ''}
              >
                <TrackItem
                  track={trk}
                  index={i}
                  playlistContext={tracks}
                  showDragHandle={isCustom}
                  onRemoveFromPlaylist={isCustom && selectedPlaylistId ? () => removeTrackFromPlaylist(selectedPlaylistId, trk.id) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

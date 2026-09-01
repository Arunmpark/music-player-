import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Heart, 
  Maximize2, 
  Sliders, 
  ListMusic, 
  Share2, 
  DownloadCloud, 
  Check, 
  Radio, 
  Sparkles, 
  Disc3,
  Timer
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const PlayerBar: React.FC = () => {
  const {
    playback,
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
    likedTrackIds,
    toggleLikeTrack,
    offlineTrackIds,
    downloadTrackForOffline,
    deleteOfflineTrack,
    setIsVisualizerOpen,
    setIsEqualizerOpen,
    isQueueOpen,
    setIsQueueOpen,
    openShareModal
  } = useMusic();

  const [isCrossfadeHovered, setIsCrossfadeHovered] = useState(false);
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const { currentTrack, isPlaying, currentTime, duration, volume, isMuted, isShuffle, repeatMode, crossfadeDuration, hiResMode } = playback;

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);
  const isDownloaded = offlineTrackIds.has(currentTrack.id);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverSeekTime(pos * duration);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pos * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[5.5rem] bg-[#0a0502]/95 backdrop-blur-xl border-t border-[#1a1512] z-40 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Left: Track Details & Quick Actions */}
      <div className="flex items-center gap-3 w-1/4 min-w-[180px] max-w-[280px]">
        <div 
          onClick={() => setIsVisualizerOpen(true)}
          className="relative group cursor-pointer flex-shrink-0"
        >
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-13 h-13 rounded-xl object-cover shadow-md border border-[#251d18] group-hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
          {isPlaying && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff4e00] flex items-center justify-center ring-2 ring-[#0a0502]">
              <Disc3 className="w-3 h-3 text-[#0a0502] animate-spin" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 
              onClick={() => setIsVisualizerOpen(true)}
              className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:text-[#ff4e00] transition-colors"
            >
              {currentTrack.title}
            </h4>
            {currentTrack.isHiRes && (
              <span 
                onClick={toggleHiResMode}
                title="Master Quality Audio: 24-bit 96kHz Lossless"
                className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-gradient-to-r from-[#ff4e00] to-[#ffd000] text-[#0a0502] font-mono tracking-tight flex-shrink-0 cursor-pointer shadow-sm"
              >
                24-BIT
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#8e8279] truncate hover:text-[#e0d8d0] cursor-pointer">
            {currentTrack.artist}
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleLikeTrack(currentTrack.id)}
            title={isLiked ? 'Unlike track' : 'Like track'}
            className="p-1.5 rounded-full text-[#8e8279] hover:text-[#ff4e00] transition-colors"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#ff4e00] text-[#ff4e00]' : ''}`} />
          </button>

          <button
            onClick={() => {
              if (isDownloaded) {
                deleteOfflineTrack(currentTrack.id);
              } else {
                downloadTrackForOffline(currentTrack);
              }
            }}
            title={isDownloaded ? 'Downloaded for offline. Click to remove.' : 'Download for offline playback'}
            className={`p-1.5 rounded-full transition-colors ${
              isDownloaded ? 'text-[#ff4e00] hover:text-[#ff7300]' : 'text-[#8e8279] hover:text-white'
            }`}
          >
            {isDownloaded ? <Check className="w-4 h-4" /> : <DownloadCloud className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Center: Main Playback Controls & Progress Bar */}
      <div className="flex-1 max-w-2xl flex flex-col items-center gap-1.5 px-2">
        {/* Buttons Row */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={toggleShuffle}
            title={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
            className={`p-1.5 rounded-full transition-colors ${
              isShuffle ? 'text-[#ff4e00] hover:text-[#ff7300]' : 'text-[#6d5f56] hover:text-[#8e8279]'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            title="Previous Track"
            className="p-1.5 rounded-full text-[#e0d8d0] hover:text-[#ff4e00] hover:scale-110 active:scale-95 transition-all"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ff4e00] to-[#ffd000] hover:brightness-110 text-[#0a0502] flex items-center justify-center shadow-lg shadow-[#ff4e00]/25 hover:scale-105 active:scale-95 transition-all font-bold"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            title="Next Track"
            className="p-1.5 rounded-full text-[#e0d8d0] hover:text-[#ff4e00] hover:scale-110 active:scale-95 transition-all"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            title={`Repeat mode: ${repeatMode}`}
            className={`p-1.5 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-[#ff4e00] hover:text-[#ff7300]' : 'text-[#6d5f56] hover:text-[#8e8279]'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-[#8e8279]">
          <span className="w-9 text-right">{formatTime(currentTime)}</span>
          
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            onMouseMove={handleProgressMouseMove}
            onMouseLeave={() => setHoverSeekTime(null)}
            className="relative flex-1 h-3 flex items-center cursor-pointer group"
          >
            {/* Background track */}
            <div className="w-full h-1 bg-[#1a1512] rounded-full overflow-hidden group-hover:h-1.5 transition-all border border-[#251d18]/50">
              <div 
                className="h-full bg-gradient-to-r from-[#ff4e00] to-[#ffd000] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Thumb on hover */}
            <div 
              className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,78,0,0.6)] opacity-0 group-hover:opacity-100 transition-opacity -ml-1.5 pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />
            {/* Hover timestamp tooltip */}
            {hoverSeekTime !== null && (
              <div
                className="absolute -top-7 bg-[#0f0a08] text-[#e0d8d0] text-[10px] px-1.5 py-0.5 rounded shadow border border-[#251d18] pointer-events-none -translate-x-1/2"
                style={{ left: `${(hoverSeekTime / duration) * 100}%` }}
              >
                {formatTime(hoverSeekTime)}
              </div>
            )}
          </div>

          <span className="w-9 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Audio Quality, Equalizer, Queue, Crossfade, Volume */}
      <div className="hidden lg:flex items-center justify-end gap-3 w-1/4 min-w-[220px]">
        {/* Visualizer & Lyrics Modal */}
        <button
          onClick={() => setIsVisualizerOpen(true)}
          title="Fullscreen Lyrics & Spectrum Visualizer"
          className="p-2 rounded-full text-[#8e8279] hover:text-[#ff4e00] hover:bg-[#140e0b] transition-colors"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Studio Equalizer */}
        <button
          onClick={() => setIsEqualizerOpen(true)}
          title="5-Band Studio Equalizer"
          className="p-2 rounded-full text-[#8e8279] hover:text-[#ff4e00] hover:bg-[#140e0b] transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Queue Drawer */}
        <button
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          title="Playback Queue"
          className={`p-2 rounded-full hover:bg-[#140e0b] transition-colors relative ${
            isQueueOpen ? 'text-[#ff4e00]' : 'text-[#8e8279] hover:text-white'
          }`}
        >
          <ListMusic className="w-4 h-4" />
          {playback.queue.length > 1 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1a1512] border border-[#251d18] text-[9px] font-bold flex items-center justify-center text-[#e0d8d0]">
              {playback.queue.length}
            </span>
          )}
        </button>

        {/* Crossfade Selector */}
        <div 
          className="relative flex items-center"
          onMouseEnter={() => setIsCrossfadeHovered(true)}
          onMouseLeave={() => setIsCrossfadeHovered(false)}
        >
          <button 
            title={`Crossfade: ${crossfadeDuration}s`}
            className="p-2 rounded-full text-[#8e8279] hover:text-[#ff4e00] hover:bg-[#140e0b] transition-colors flex items-center gap-1"
          >
            <Timer className="w-4 h-4" />
            <span className="text-[10px] font-mono">{crossfadeDuration}s</span>
          </button>

          {isCrossfadeHovered && (
            <div className="absolute bottom-10 -left-12 bg-[#0f0a08] border border-[#251d18] p-2.5 rounded-xl shadow-xl w-36 z-50 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] text-[#8e8279] mb-1.5">
                <span>Crossfade</span>
                <span className="font-mono text-[#ff4e00] font-bold">{crossfadeDuration}s</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={crossfadeDuration}
                onChange={(e) => setCrossfade(Number(e.target.value))}
                className="w-full accent-[#ff4e00] h-1 bg-[#1a1512] rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Social Share Button */}
        <button
          onClick={() => openShareModal({ track: currentTrack })}
          title="Share Track"
          className="p-2 rounded-full text-[#8e8279] hover:text-white hover:bg-[#140e0b] transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-[#8e8279] hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 accent-[#ff4e00] h-1 bg-[#1a1512] rounded-lg cursor-pointer hover:h-1.5 transition-all"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
};

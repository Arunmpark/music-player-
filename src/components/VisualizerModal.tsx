import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Heart, 
  Sliders, 
  Sparkles, 
  Volume2, 
  Radio, 
  Layers, 
  Share2, 
  Disc,
  Clock
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { audioEngine } from '../services/audioEngine';

export const VisualizerModal: React.FC = () => {
  const {
    isVisualizerOpen,
    setIsVisualizerOpen,
    playback,
    togglePlay,
    seek,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    likedTrackIds,
    toggleLikeTrack,
    setIsEqualizerOpen,
    openShareModal
  } = useMusic();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'lyrics' | 'specs'>('visualizer');

  const { currentTrack, isPlaying, currentTime, duration, isShuffle, repeatMode } = playback;

  // Real-time Canvas Spectrum Animation
  useEffect(() => {
    if (!isVisualizerOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(64);

    const render = () => {
      audioEngine.getFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / 48) - 2;
      let x = 0;

      // Draw mirrored radial/frequency spectrum bars
      for (let i = 0; i < 48; i++) {
        const barHeight = Math.max(4, (dataArray[i] / 255) * (height * 0.75));

        // Radiant orange to amber gold gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(255, 78, 0, 0.2)');
        gradient.addColorStop(0.5, 'rgba(255, 115, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 208, 0, 1)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, Math.max(2, barWidth), barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth + 2;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isVisualizerOpen, isPlaying]);

  if (!isVisualizerOpen || !currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0502]/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in select-none">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#ff4e00]/15 text-[#ff4e00] flex items-center justify-center border border-[#ff4e00]/30">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-serif italic text-white uppercase tracking-wider">Master Studio Theater</h3>
            <p className="text-[11px] text-[#ff7300] font-mono">24-BIT / 96.0 kHz LOSSLESS FLAC</p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-[#140e0b] border border-[#1a1512] rounded-full p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3 py-1 rounded-full transition-colors ${
              activeTab === 'visualizer' ? 'bg-[#ff4e00] text-[#0a0502] font-bold' : 'text-[#8e8279] hover:text-white'
            }`}
          >
            Spectrum
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-3 py-1 rounded-full transition-colors ${
              activeTab === 'lyrics' ? 'bg-[#ff4e00] text-[#0a0502] font-bold' : 'text-[#8e8279] hover:text-white'
            }`}
          >
            Lyrics
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1 rounded-full transition-colors ${
              activeTab === 'specs' ? 'bg-[#ff4e00] text-[#0a0502] font-bold' : 'text-[#8e8279] hover:text-white'
            }`}
          >
            Audiophile Specs
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisualizerOpen(false)}
          className="p-2 rounded-full bg-[#140e0b] hover:bg-[#1a1512] text-[#8e8279] hover:text-white border border-[#1a1512] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Stage */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto my-4 overflow-hidden">
        
        {activeTab === 'visualizer' && (
          <div className="w-full flex flex-col items-center justify-center space-y-6">
            {/* Spinning Vinyl & Artwork */}
            <div className="relative group">
              <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#140e0b] border-4 border-[#251d18] shadow-2xl flex items-center justify-center overflow-hidden p-2 relative">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className={`w-full h-full rounded-full object-cover shadow-2xl ${
                    isPlaying ? 'animate-spin-slow' : ''
                  }`}
                />
                {/* Center vinyl spindle */}
                <div className="absolute w-12 h-12 rounded-full bg-[#0a0502] border-2 border-[#332a22] flex items-center justify-center shadow-inner">
                  <div className="w-4 h-4 rounded-full bg-[#140e0b]" />
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-white tracking-tight">{currentTrack.title}</h2>
              <p className="text-sm font-medium text-[#ff4e00]">{currentTrack.artist}</p>
              <p className="text-xs text-[#8e8279]">{currentTrack.album} &bull; {currentTrack.genre}</p>
            </div>

            {/* Real-time Spectrum Canvas */}
            <div className="w-full max-w-lg h-28 bg-[#140e0b]/80 border border-[#1a1512] rounded-2xl p-2 flex items-center justify-center shadow-inner">
              <canvas ref={canvasRef} width={480} height={100} className="w-full h-full" />
            </div>
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="w-full h-96 overflow-y-auto px-6 py-4 space-y-4 text-center">
            {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
              currentTrack.lyrics.map((line, idx) => (
                <p 
                  key={idx} 
                  className={`text-base sm:text-lg font-medium transition-colors cursor-pointer hover:text-[#ffd000] ${
                    idx === 2 ? 'text-[#ff4e00] font-bold text-xl sm:text-2xl' : 'text-[#8e8279]'
                  }`}
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="text-[#6d5f56] py-12">No lyrics available for this master recording.</p>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="w-full max-w-2xl bg-[#0f0a08]/90 border border-[#1a1512] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1a1512] pb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#ff4e00]" />
                <h3 className="text-base font-serif italic text-white">Lossless Master Stream Diagnostics</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#ff4e00]/15 text-[#ff4e00] border border-[#ff4e00]/30">
                VERIFIED BIT-PERFECT
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-[#140e0b] p-4 rounded-2xl border border-[#1a1512]">
                <span className="text-[11px] text-[#6d5f56] uppercase tracking-wider font-bold">Bit Depth</span>
                <p className="text-lg font-mono font-bold text-white mt-1">{currentTrack.bitDepth || 24}-Bit Integer</p>
              </div>

              <div className="bg-[#140e0b] p-4 rounded-2xl border border-[#1a1512]">
                <span className="text-[11px] text-[#6d5f56] uppercase tracking-wider font-bold">Sample Rate</span>
                <p className="text-lg font-mono font-bold text-[#ff4e00] mt-1">{(currentTrack.sampleRate || 96000) / 1000} kHz</p>
              </div>

              <div className="bg-[#140e0b] p-4 rounded-2xl border border-[#1a1512]">
                <span className="text-[11px] text-[#6d5f56] uppercase tracking-wider font-bold">Bitrate</span>
                <p className="text-lg font-mono font-bold text-white mt-1">{currentTrack.bitrate || 2304} kbps</p>
              </div>

              <div className="bg-[#140e0b] p-4 rounded-2xl border border-[#1a1512]">
                <span className="text-[11px] text-[#6d5f56] uppercase tracking-wider font-bold">Audio Codec</span>
                <p className="text-lg font-mono font-bold text-[#ffd000] mt-1">{currentTrack.format || 'FLAC'}</p>
              </div>

              <div className="bg-[#140e0b] p-4 rounded-2xl border border-[#1a1512]">
                <span className="text-[11px] text-[#6d5f56] uppercase tracking-wider font-bold">Dynamic Range</span>
                <p className="text-lg font-mono font-bold text-white mt-1">118.4 dB</p>
              </div>

              <div className="bg-[#140e0b] p-4 rounded-2xl border border-[#1a1512]">
                <span className="text-[11px] text-[#6d5f56] uppercase tracking-wider font-bold">D/A Conversion</span>
                <p className="text-lg font-mono font-bold text-[#ff4e00] mt-1">Direct Master</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Controls */}
      <div className="max-w-2xl w-full mx-auto space-y-4">
        {/* Progress scrub bar */}
        <div className="w-full flex items-center gap-3 text-xs font-mono text-[#8e8279]">
          <span>{formatTime(currentTime)}</span>
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seek(pos * duration);
            }}
            className="flex-1 h-2 bg-[#140e0b] border border-[#1a1512] rounded-full cursor-pointer overflow-hidden group"
          >
            <div 
              className="h-full bg-gradient-to-r from-[#ff4e00] to-[#ffd000] rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => toggleLikeTrack(currentTrack.id)}
            className="p-2.5 rounded-full bg-[#140e0b] hover:bg-[#1a1512] text-[#8e8279] hover:text-[#ff4e00] border border-[#1a1512] transition-colors"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#ff4e00] text-[#ff4e00]' : ''}`} />
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors ${
                isShuffle ? 'text-[#ff4e00]' : 'text-[#6d5f56] hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={prevTrack}
              className="p-2 text-[#e0d8d0] hover:text-white transition-colors"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#ff4e00] to-[#ffd000] text-[#0a0502] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-2 text-[#e0d8d0] hover:text-white transition-colors"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== 'off' ? 'text-[#ff4e00]' : 'text-[#6d5f56] hover:text-white'
              }`}
            >
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEqualizerOpen(true)}
              className="p-2.5 rounded-full bg-[#140e0b] hover:bg-[#1a1512] border border-[#1a1512] text-[#8e8279] hover:text-[#ff4e00] transition-colors"
              title="Equalizer"
            >
              <Sliders className="w-5 h-5" />
            </button>
            <button
              onClick={() => openShareModal({ track: currentTrack })}
              className="p-2.5 rounded-full bg-[#140e0b] hover:bg-[#1a1512] border border-[#1a1512] text-[#8e8279] hover:text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

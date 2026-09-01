import React from 'react';
import { 
  Play, 
  Sparkles, 
  Flame, 
  Radio, 
  Heart, 
  Plus, 
  DownloadCloud, 
  ArrowRight, 
  Sliders, 
  Clock, 
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { TrackItem } from '../components/TrackItem';
import { GENRE_CATEGORIES } from '../data/mockCatalog';

export const HomeView: React.FC = () => {
  const {
    allTracks,
    playlists,
    playTrack,
    setCurrentView,
    setSelectedPlaylistId,
    setIsPlaylistCreatorOpen,
    setIsCloudUploadOpen,
    likedTrackIds
  } = useMusic();

  const featuredTrack = allTracks[0];
  const hiResTracks = allTracks.filter(t => t.isHiRes).slice(0, 5);
  const trendingTracks = allTracks.slice(0, 6);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Featured Master Hero Banner */}
      {featuredTrack && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#251206] via-[#140e0b] to-[#0f0a08] border border-[#ff4e00]/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none bg-radial from-[#ff4e00]/40 to-transparent" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4e00]/15 text-[#ff4e00] border border-[#ff4e00]/30 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>STUDIO MASTER &bull; 24-BIT / 96 kHz LOSSLESS</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-serif text-white italic font-normal tracking-tight">
                {featuredTrack.title}
              </h1>
              
              <p className="text-sm text-[#8e8279]">
                Experience pristine dynamic range and acoustic depth from <span className="text-[#e0d8d0] font-semibold">{featuredTrack.artist}</span> on the landmark album <span className="text-[#e0d8d0] font-semibold">"{featuredTrack.album}"</span>.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => playTrack(featuredTrack, allTracks)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4e00] to-[#ffd000] hover:brightness-110 text-[#0a0502] font-extrabold text-sm shadow-lg shadow-[#ff4e00]/25 transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Stream Studio Master</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedPlaylistId('playlist-audiophile-showcase');
                    setCurrentView('playlist');
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#1a1512] hover:bg-[#251d18] border border-[#332a22] text-[#e0d8d0] font-bold text-sm transition-colors"
                >
                  <span>Explore Hi-Res Mix</span>
                  <ArrowRight className="w-4 h-4 text-[#ff4e00]" />
                </button>
              </div>
            </div>

            <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => playTrack(featuredTrack, allTracks)}>
              <img
                src={featuredTrack.coverUrl}
                alt={featuredTrack.title}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl object-cover shadow-2xl border-2 border-[#ff4e00]/40 group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#ff4e00] to-[#ffd000] text-[#0a0502] flex items-center justify-center shadow-xl">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Curated Editorial Playlists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif italic text-white tracking-tight flex items-center gap-2">
              <Headphones className="w-5 h-5 text-[#ff4e00]" />
              <span>Curated Reference Playlists</span>
            </h2>
            <p className="text-xs text-[#8e8279]">Tuned for studio reference monitors & audiophile playback</p>
          </div>

          <button
            onClick={() => setCurrentView('creator')}
            className="text-xs font-bold text-[#ff4e00] hover:text-[#ff7300] flex items-center gap-1"
          >
            <span>Create Custom Mix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => {
                setSelectedPlaylistId(pl.id);
                setCurrentView('playlist');
              }}
              className="group bg-[#0f0a08]/80 hover:bg-[#140e0b] border border-[#1a1512] hover:border-[#ff4e00]/40 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-xl flex gap-4 items-center"
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
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono text-[#6d5f56]">{pl.trackIds.length} tracks</span>
                  {pl.tags && pl.tags.length > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/20">
                      {pl.tags[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hi-Res Audiophile Showcase Tracklist */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif italic text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff4e00]" />
              <span>24-bit Lossless Highlights</span>
            </h2>
            <p className="text-xs text-[#8e8279]">Drag any track to a playlist or dropzone</p>
          </div>
        </div>

        <div className="bg-[#0f0a08]/60 border border-[#1a1512] rounded-2xl p-2 divide-y divide-[#1a1512]/60">
          {hiResTracks.map((trk, i) => (
            <TrackItem
              key={trk.id}
              track={trk}
              index={i}
              playlistContext={hiResTracks}
            />
          ))}
        </div>
      </section>

      {/* Genre & Atmospheric Worlds */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-serif italic text-white tracking-tight">
            Browse By Acoustic Dimension
          </h2>
          <p className="text-xs text-[#8e8279]">Filtered frequency palettes and moods</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {GENRE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setCurrentView('search');
              }}
              className={`relative overflow-hidden h-28 rounded-2xl p-3 bg-gradient-to-br ${cat.color} cursor-pointer group shadow-lg flex flex-col justify-between hover:scale-105 transition-all border border-[#332a22]/30`}
            >
              <img
                src={cat.cover}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-40 transition-opacity mix-blend-overlay"
              />
              <span className="text-xs font-bold text-white tracking-tight relative z-10">{cat.name}</span>
              <span className="text-[10px] text-white/80 font-mono relative z-10 flex items-center gap-1">
                <span>Explore</span> &rarr;
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

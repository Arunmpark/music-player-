import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, 
  Sparkles, 
  Filter, 
  Radio, 
  Sliders, 
  Flame, 
  Music, 
  Compass, 
  RefreshCw,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { TrackItem } from '../components/TrackItem';
import { Track } from '../types';
import { GENRE_CATEGORIES } from '../data/mockCatalog';

export const SearchView: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const { allTracks } = useMusic();
  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [hiResOnly, setHiResOnly] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync initial query
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Live search debounced query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      // Return default catalog tracks filtered by genre / hi-res
      let results = [...allTracks];
      if (selectedGenre !== 'all') {
        results = results.filter(t => t.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
      }
      if (hiResOnly) {
        results = results.filter(t => t.isHiRes);
      }
      setSearchResults(results);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = `/api/music/search?q=${encodeURIComponent(trimmed)}${hiResOnly ? '&hires=true' : ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const liveTracks = data.results || [];
          
          // Also match local catalog
          const localMatches = allTracks.filter(t => 
            t.title.toLowerCase().includes(trimmed.toLowerCase()) ||
            t.artist.toLowerCase().includes(trimmed.toLowerCase()) ||
            t.genre.toLowerCase().includes(trimmed.toLowerCase())
          );

          // Merge unique by title/id
          const combined = [...localMatches, ...liveTracks.filter((lt: Track) => !localMatches.some(lm => lm.id === lt.id))];
          
          let filtered = combined;
          if (selectedGenre !== 'all') {
            filtered = filtered.filter(t => t.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
          }
          if (hiResOnly) {
            filtered = filtered.filter(t => t.isHiRes);
          }

          setSearchResults(filtered);
        }
      } catch (e) {
        console.warn('Search query fallback:', e);
        // Local fallback
        let results = allTracks.filter(t => 
          t.title.toLowerCase().includes(trimmed.toLowerCase()) ||
          t.artist.toLowerCase().includes(trimmed.toLowerCase())
        );
        if (hiResOnly) results = results.filter(t => t.isHiRes);
        setSearchResults(results);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedGenre, hiResOnly, allTracks]);

  const quickGenres = [
    { id: 'all', label: 'All Catalog' },
    { id: 'synthwave', label: 'Synthwave' },
    { id: 'acoustic', label: 'Acoustic' },
    { id: 'electronic', label: 'Electronic' },
    { id: 'ambient', label: 'Ambient & Lo-Fi' },
    { id: 'classical', label: 'Classical' },
    { id: 'rock', label: 'Rock' }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Search Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Search & Streaming Gateway
          </h1>
          <p className="text-xs sm:text-sm text-[#8e8279] mt-1">
            Discover real streaming metadata from Apple iTunes, curated 24-bit lossless masters, and cloud files.
          </p>
        </div>

        {/* Search input and filters bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 text-[#8e8279] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by track name, artist, album, or genre..."
              className="w-full bg-[#0f0a08] border border-[#1a1512] hover:border-[#251d18] focus:border-[#ff4e00] rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-[#6d5f56] focus:outline-none focus:ring-1 focus:ring-[#ff4e00]/50 shadow-inner transition-colors"
            />
            {isLoading && (
              <RefreshCw className="w-4 h-4 text-[#ff4e00] animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* 24-bit Hi-Res toggle button */}
          <button
            onClick={() => setHiResOnly(!hiResOnly)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${
              hiResOnly
                ? 'bg-[#ff4e00]/15 text-[#ff4e00] border-[#ff4e00]/50 shadow-md'
                : 'bg-[#0f0a08] hover:bg-[#140e0b] text-[#8e8279] border-[#1a1512]'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${hiResOnly ? 'text-[#ff4e00]' : 'text-[#6d5f56]'}`} />
            <span>24-bit Lossless Only</span>
          </button>
        </div>

        {/* Quick Genre Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {quickGenres.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === g.id
                  ? 'bg-gradient-to-r from-[#ff4e00] to-[#ffd000] text-[#0a0502] font-bold shadow-md shadow-[#ff4e00]/20'
                  : 'bg-[#0f0a08] hover:bg-[#140e0b] text-[#8e8279] hover:text-white border border-[#1a1512]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#1a1512]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6d5f56]">
            Results ({searchResults.length} {searchResults.length === 1 ? 'track' : 'tracks'})
          </span>
          <span className="text-[11px] text-[#6d5f56] font-mono">
            Drag any item into sidebar playlists
          </span>
        </div>

        {searchResults.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#0f0a08]/40 rounded-3xl border border-[#1a1512] p-8">
            <div className="w-12 h-12 rounded-2xl bg-[#140e0b] border border-[#251d18] flex items-center justify-center mx-auto text-[#6d5f56]">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No Matching Tracks Found</h3>
              <p className="text-xs text-[#8e8279] max-w-sm mx-auto mt-1">
                Try searching for a different keyword or toggle off the 24-bit lossless filter.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#0f0a08]/60 border border-[#1a1512] rounded-2xl p-2 divide-y divide-[#1a1512]/60">
            {searchResults.map((trk, i) => (
              <TrackItem
                key={`${trk.id}-${i}`}
                track={trk}
                index={i}
                playlistContext={searchResults}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

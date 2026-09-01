import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  Trash2, 
  GripVertical, 
  Search, 
  Save, 
  DownloadCloud, 
  Music, 
  Layers, 
  Image as ImageIcon,
  CheckCircle2,
  FileDown,
  ArrowRight,
  Disc,
  Play
} from 'lucide-react';
import { Track } from '../types';
import { useMusic } from '../context/MusicContext';

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
];

export const DragDropPlaylistBuilder: React.FC = () => {
  const {
    allTracks,
    createPlaylist,
    setCurrentView,
    setSelectedPlaylistId,
    downloadTrackForOffline,
    playTrack
  } = useMusic();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState(COVER_PRESETS[0]);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isDragOverDropzone, setIsDragOverDropzone] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Filter available source tracks
  const availableTracks = allTracks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.genre.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSearch;
  });

  // Drag handlers for source tracks
  const handleSourceDragStart = (e: React.DragEvent, track: Track) => {
    e.dataTransfer.setData('application/json', JSON.stringify(track));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Drop handlers for builder dropzone
  const handleDropzoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOverDropzone(true);
  };

  const handleDropzoneDragLeave = () => {
    setIsDragOverDropzone(false);
  };

  const handleDropzoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDropzone(false);
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const track: Track = JSON.parse(data);
        if (track && track.id) {
          if (!playlistTracks.some(t => t.id === track.id)) {
            setPlaylistTracks(prev => [...prev, track]);
          }
        }
      }
    } catch (err) {
      console.warn('Drop parsing note:', err);
    }
  };

  // Internal reordering drag handlers
  const handleItemDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleItemDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const updated = [...playlistTracks];
    const item = updated.splice(draggedItemIndex, 1)[0];
    updated.splice(targetIndex, 0, item);
    setDraggedItemIndex(targetIndex);
    setPlaylistTracks(updated);
  };

  const handleItemDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const removeTrackFromBuilder = (trackId: string) => {
    setPlaylistTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const addTrackDirect = (track: Track) => {
    if (!playlistTracks.some(t => t.id === track.id)) {
      setPlaylistTracks(prev => [...prev, track]);
    }
  };

  // Stats calculation
  const totalDurationSeconds = playlistTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalDurationMinutes = Math.floor(totalDurationSeconds / 60);
  const totalHiResSizeMB = (playlistTracks.reduce((acc, t) => acc + (t.fileSize || 25000000), 0) / (1024 * 1024)).toFixed(1);

  const handleSavePlaylist = async () => {
    if (!title.trim() && playlistTracks.length === 0) return;
    const finalTitle = title.trim() || `Custom Mix (${playlistTracks.length} tracks)`;
    const newPl = await createPlaylist(
      finalTitle,
      description.trim() || 'High-Resolution Drag & Drop Curated Mix',
      coverUrl,
      playlistTracks.map(t => t.id)
    );

    setIsSaved(true);
    setTimeout(() => {
      setSelectedPlaylistId(newPl.id);
      setCurrentView('playlist');
    }, 800);
  };

  const handleDownloadAll = async () => {
    for (const trk of playlistTracks) {
      await downloadTrackForOffline(trk);
    }
  };

  const exportM3U = () => {
    let content = '#EXTM3U\n';
    playlistTracks.forEach(t => {
      content += `#EXTINF:${t.duration},${t.artist} - ${t.title}\n${t.audioUrl}\n`;
    });
    const blob = new Blob([content], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'playlist').toLowerCase().replace(/\s+/g, '_')}.m3u`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1512] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-white tracking-tight">
              Drag & Drop Playlist Creator
            </h1>
          </div>
          <p className="text-sm text-[#8e8279] mt-1">
            Drag master tracks from your catalog or search library into the dropzone to create seamless high-res mixes.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {playlistTracks.length > 0 && (
            <>
              <button
                onClick={exportM3U}
                title="Export M3U file"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#140e0b] hover:bg-[#1a1512] border border-[#1a1512] text-xs font-semibold text-[#e0d8d0] hover:text-white transition-colors"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export M3U</span>
              </button>

              <button
                onClick={handleDownloadAll}
                title="Cache all tracks in this playlist for offline listening"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#140e0b] hover:bg-[#1a1512] border border-[#1a1512] text-xs font-semibold text-[#ff4e00] hover:text-[#ff7300] transition-colors"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Download Mix</span>
              </button>
            </>
          )}

          <button
            onClick={handleSavePlaylist}
            disabled={playlistTracks.length === 0}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition-all ${
              playlistTracks.length > 0
                ? 'bg-gradient-to-r from-[#ff4e00] to-[#ffd000] hover:brightness-110 text-[#0a0502] shadow-[#ff4e00]/20 active:scale-95'
                : 'bg-[#140e0b] text-[#6d5f56] border border-[#1a1512] cursor-not-allowed'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved & Synced!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save to Library</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Builder Grid: Left (Source Pool) | Right (Dropzone Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Track Library Pool (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f0a08]/80 border border-[#1a1512] rounded-2xl p-4 flex flex-col h-[640px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a1512]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-[#ff4e00]" />
              <span>Audio Sources ({availableTracks.length})</span>
            </h3>
            <span className="text-[11px] text-[#6d5f56]">Drag any row to dropzone</span>
          </div>

          {/* Quick search input */}
          <div className="my-3 relative">
            <Search className="w-3.5 h-3.5 text-[#6d5f56] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by title, artist, genre..."
              className="w-full bg-[#140e0b] border border-[#1a1512] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#e0d8d0] placeholder-[#6d5f56] focus:outline-none focus:border-[#ff4e00]"
            />
          </div>

          {/* Scrollable draggable track list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {availableTracks.map((trk) => {
              const isAlreadyAdded = playlistTracks.some(t => t.id === trk.id);

              return (
                <div
                  key={trk.id}
                  draggable={true}
                  onDragStart={(e) => handleSourceDragStart(e, trk)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 cursor-grab active:cursor-grabbing select-none transition-all group ${
                    isAlreadyAdded
                      ? 'bg-[#140e0b]/40 border-[#1a1512] opacity-50'
                      : 'bg-[#140e0b] border-[#1a1512] hover:border-[#ff4e00]/50 hover:bg-[#1a1512] text-[#e0d8d0] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <GripVertical className="w-3.5 h-3.5 text-[#6d5f56] group-hover:text-[#ff4e00] flex-shrink-0" />
                    <img
                      src={trk.coverUrl}
                      alt={trk.title}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate">{trk.title}</span>
                        {trk.isHiRes && (
                          <span className="text-[8px] font-bold px-1 rounded bg-[#ff4e00]/15 text-[#ff4e00]">
                            24b
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8e8279] truncate">{trk.artist}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => addTrackDirect(trk)}
                    disabled={isAlreadyAdded}
                    className={`p-1.5 rounded-lg text-xs transition-colors flex-shrink-0 ${
                      isAlreadyAdded
                        ? 'text-[#6d5f56]'
                        : 'bg-[#1a1512] hover:bg-[#ff4e00] hover:text-[#0a0502] text-[#e0d8d0]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Playlist Config & Interactive Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Metadata Card */}
          <div className="bg-[#0f0a08]/80 border border-[#1a1512] rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
            {/* Cover Art selection */}
            <div className="flex-shrink-0 space-y-2">
              <img
                src={coverUrl}
                alt="Playlist Cover"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-xl border border-[#1a1512]"
              />
              <div className="flex gap-1 justify-center">
                {COVER_PRESETS.slice(0, 4).map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setCoverUrl(c)}
                    className={`w-5 h-5 rounded-full overflow-hidden border-2 transition-all ${
                      coverUrl === c ? 'border-[#ff4e00] scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={c} alt="Cover option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Playlist Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Midnight Hi-Res Spatial Journey"
                  className="w-full mt-1 bg-[#140e0b] border border-[#1a1512] rounded-xl px-3.5 py-2 text-sm text-white font-semibold placeholder-[#6d5f56] focus:outline-none focus:border-[#ff4e00]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on mastering, headphones calibrated for, or mood notes..."
                  rows={2}
                  className="w-full mt-1 bg-[#140e0b] border border-[#1a1512] rounded-xl px-3.5 py-1.5 text-xs text-[#e0d8d0] placeholder-[#6d5f56] focus:outline-none focus:border-[#ff4e00] resize-none"
                />
              </div>

              {/* Quick Summary Pill Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#140e0b] text-[#e0d8d0] border border-[#1a1512]">
                  {playlistTracks.length} tracks
                </span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#140e0b] text-[#e0d8d0] border border-[#1a1512]">
                  ~{totalDurationMinutes} mins
                </span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#ff4e00]/15 text-[#ff4e00] border border-[#ff4e00]/30">
                  {totalHiResSizeMB} MB Lossless
                </span>
              </div>
            </div>
          </div>

          {/* Drag & Drop Reorderable Dropzone */}
          <div
            onDragOver={handleDropzoneDragOver}
            onDragLeave={handleDropzoneDragLeave}
            onDrop={handleDropzoneDrop}
            className={`border-2 border-dashed rounded-2xl min-h-[380px] max-h-[420px] overflow-y-auto p-4 transition-all ${
              isDragOverDropzone
                ? 'border-[#ff4e00] bg-[#ff4e00]/10 scale-[1.01]'
                : playlistTracks.length === 0
                ? 'border-[#1a1512] bg-[#0f0a08]/40 flex flex-col items-center justify-center text-center'
                : 'border-[#1a1512] bg-[#0f0a08]/60 space-y-2'
            }`}
          >
            {playlistTracks.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#140e0b] border border-[#1a1512] flex items-center justify-center mx-auto text-[#ff4e00] shadow-inner">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Drop Tracks Here</h4>
                  <p className="text-xs text-[#8e8279] max-w-sm mt-1">
                    Drag tracks from the left pane and drop them into this zone to assemble your playlist. You can drag to reorder them at any time.
                  </p>
                </div>
              </div>
            ) : (
              playlistTracks.map((trk, index) => (
                <div
                  key={trk.id}
                  draggable={true}
                  onDragStart={() => handleItemDragStart(index)}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDragEnd={handleItemDragEnd}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#140e0b] border transition-all ${
                    draggedItemIndex === index
                      ? 'border-[#ff4e00] opacity-40 scale-95'
                      : 'border-[#1a1512] hover:border-[#251d18]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-mono text-[#6d5f56] w-5 text-right">{index + 1}</span>
                    <div 
                      title="Drag up or down to reorder track position"
                      className="cursor-grab active:cursor-grabbing text-[#6d5f56] hover:text-[#8e8279]"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    <img
                      src={trk.coverUrl}
                      alt={trk.title}
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-white truncate">{trk.title}</h5>
                      <p className="text-[11px] text-[#8e8279] truncate">{trk.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-[#6d5f56]">
                      {Math.floor(trk.duration / 60)}:{(trk.duration % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => removeTrackFromBuilder(trk.id)}
                      title="Remove track"
                      className="p-1.5 rounded-lg text-[#6d5f56] hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

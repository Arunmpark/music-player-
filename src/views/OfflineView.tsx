import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  Wifi, 
  DownloadCloud, 
  Trash2, 
  HardDrive, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { TrackItem } from '../components/TrackItem';
import { dbService } from '../services/db';

export const OfflineView: React.FC = () => {
  const {
    allTracks,
    offlineTrackIds,
    downloadTrackForOffline,
    removeOfflineTrack,
    playTrack,
    isOnline,
    setCurrentView
  } = useMusic();

  const [cachedMB, setCachedMB] = useState('0.0');
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const offlineTracks = allTracks.filter(t => offlineTrackIds.has(t.id));

  // Calculate approximate storage usage
  useEffect(() => {
    const totalBytes = offlineTracks.reduce((acc, t) => acc + (t.fileSize || 25000000), 0);
    setCachedMB((totalBytes / (1024 * 1024)).toFixed(1));
  }, [offlineTracks]);

  const handleDownloadAllCatalog = async () => {
    setIsBulkDownloading(true);
    setDownloadProgress(0);

    for (let i = 0; i < allTracks.length; i++) {
      await downloadTrackForOffline(allTracks[i]);
      setDownloadProgress(Math.round(((i + 1) / allTracks.length) * 100));
    }

    setIsBulkDownloading(false);
  };

  const handleClearOfflineCache = async () => {
    if (confirm('Are you sure you want to clear all offline cached tracks from this device?')) {
      await dbService.clearAudioBlobs();
      for (const t of offlineTracks) {
        await removeOfflineTrack(t.id);
      }
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Network Status Banner */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
        isOnline 
          ? 'bg-[#0f0a08]/80 border-[#1a1512] text-[#e0d8d0]' 
          : 'bg-amber-950/30 border-[#ff7300]/40 text-amber-200'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-2xl ${isOnline ? 'bg-[#ff4e00]/15 text-[#ff4e00]' : 'bg-[#ff7300]/15 text-[#ff7300]'}`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                {isOnline ? 'Network Online & Cloud Sync Active' : 'Offline Mode Active'}
              </h2>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isOnline ? 'bg-[#ff4e00]/15 text-[#ff4e00]' : 'bg-[#ff7300]/15 text-[#ff7300]'
              }`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs text-[#8e8279] mt-0.5">
              {isOnline 
                ? 'All tracks and playlist changes are automatically synchronized with cloud servers.'
                : 'Playing high-res tracks stored locally in browser IndexedDB cache. Outbox actions will sync once reconnected.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDownloadAllCatalog}
            disabled={isBulkDownloading || offlineTracks.length === allTracks.length}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ff4e00] to-[#ffd000] hover:brightness-110 disabled:bg-[#140e0b] text-[#0a0502] disabled:text-[#6d5f56] text-xs font-bold shadow-md transition-colors"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>{isBulkDownloading ? `Downloading ${downloadProgress}%` : 'Download All Tracks'}</span>
          </button>

          {offlineTracks.length > 0 && (
            <button
              onClick={handleClearOfflineCache}
              className="p-2 rounded-xl bg-[#140e0b] hover:bg-red-950/40 text-[#8e8279] hover:text-red-400 border border-[#251d18] transition-colors"
              title="Clear Offline Cache"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Storage Gauge Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f0a08]/80 border border-[#1a1512] p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Offline Storage Used</span>
          <p className="text-2xl font-bold font-mono text-[#ff4e00]">{cachedMB} MB</p>
          <p className="text-[11px] text-[#6d5f56]">IndexedDB Audio Blob Store</p>
        </div>

        <div className="bg-[#0f0a08]/80 border border-[#1a1512] p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Cached Audio Tracks</span>
          <p className="text-2xl font-bold font-mono text-white">{offlineTracks.length} / {allTracks.length}</p>
          <p className="text-[11px] text-[#6d5f56]">Available without internet connection</p>
        </div>

        <div className="bg-[#0f0a08]/80 border border-[#1a1512] p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Master Audio Integrity</span>
          <p className="text-2xl font-bold font-mono text-[#ffd000]">Bit-Perfect</p>
          <p className="text-[11px] text-[#6d5f56]">24-bit 96kHz Lossless decoding</p>
        </div>
      </div>

      {/* Offline Tracklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1a1512]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#e0d8d0] flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#ff4e00]" />
            <span>Cached Offline Masters ({offlineTracks.length})</span>
          </h3>

          {offlineTracks.length > 0 && (
            <button
              onClick={() => playTrack(offlineTracks[0], offlineTracks)}
              className="text-xs font-bold text-[#ff4e00] hover:text-[#ff7300] flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All Offline</span>
            </button>
          )}
        </div>

        {offlineTracks.length === 0 ? (
          <div className="py-16 text-center text-[#6d5f56] bg-[#0f0a08]/40 rounded-3xl border border-[#1a1512] p-8 space-y-3">
            <WifiOff className="w-10 h-10 text-[#6d5f56] mx-auto" />
            <p className="text-sm font-bold text-white">No Offline Tracks Downloaded</p>
            <p className="text-xs text-[#8e8279] max-w-sm mx-auto">
              Download your favorite tracks to enjoy high-resolution audio on flights, remote travel, or low-connectivity zones.
            </p>
            <button
              onClick={handleDownloadAllCatalog}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff4e00] to-[#ffd000] text-[#0a0502] text-xs font-bold"
            >
              Download All Recommended Tracks
            </button>
          </div>
        ) : (
          <div className="bg-[#0f0a08]/60 border border-[#1a1512] rounded-2xl p-2 divide-y divide-[#1a1512]/60">
            {offlineTracks.map((trk, i) => (
              <TrackItem
                key={trk.id}
                track={trk}
                index={i}
                playlistContext={offlineTracks}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

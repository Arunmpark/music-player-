import React, { useState } from 'react';
import { X, ListMusic, Trash2, GripVertical, Play, Pause, Save, Plus } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Track } from '../types';

export const QueueDrawer: React.FC = () => {
  const {
    isQueueOpen,
    setIsQueueOpen,
    playback,
    playTrack,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    createPlaylist,
    setSelectedPlaylistId,
    setCurrentView
  } = useMusic();

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  if (!isQueueOpen) return null;

  const { queue, queueIndex, currentTrack, isPlaying } = playback;
  const upNextTracks = queue.slice(queueIndex + 1);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;

    const newQueue = [...queue];
    const item = newQueue.splice(draggedIdx, 1)[0];
    newQueue.splice(targetIdx, 0, item);
    setDraggedIdx(targetIdx);
    reorderQueue(newQueue);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleSaveQueueAsPlaylist = async () => {
    if (queue.length === 0) return;
    const newPl = await createPlaylist(`Queue Mix (${queue.length} tracks)`, 'Saved from current playback queue', undefined, queue.map(t => t.id));
    setSelectedPlaylistId(newPl.id);
    setCurrentView('playlist');
    setIsQueueOpen(false);
  };

  return (
    <div className="fixed right-0 top-16 bottom-[5.5rem] w-80 sm:w-96 bg-[#0f0a08]/95 border-l border-[#1a1512] z-40 backdrop-blur-xl shadow-2xl flex flex-col p-4 animate-in slide-in-from-right select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1a1512]">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-[#ff4e00]" />
          <h3 className="text-sm font-bold text-white">Playback Queue ({queue.length})</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={clearQueue}
            title="Clear Queue"
            className="p-1.5 rounded-lg text-[#8e8279] hover:text-red-400 hover:bg-[#140e0b] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsQueueOpen(false)}
            className="p-1.5 rounded-lg text-[#8e8279] hover:text-white hover:bg-[#140e0b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Now Playing section */}
      {currentTrack && (
        <div className="py-3 border-b border-[#1a1512]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff4e00]">Now Playing</span>
          <div className="flex items-center gap-3 mt-1.5 p-2 rounded-xl bg-[#140e0b] border border-[#ff4e00]/30">
            <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
              <p className="text-[11px] text-[#ff7300] truncate">{currentTrack.artist}</p>
            </div>
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-1 bg-[#ff4e00] h-full animate-pulse" />
                <span className="w-1 bg-[#ff4e00] h-2/3 animate-pulse delay-75" />
                <span className="w-1 bg-[#ff4e00] h-4/5 animate-pulse delay-150" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Up Next List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1.5">
        <div className="flex items-center justify-between pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d5f56]">Up Next</span>
          {queue.length > 1 && (
            <button
              onClick={handleSaveQueueAsPlaylist}
              className="text-[10px] text-[#ff4e00] hover:underline flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              <span>Save as Playlist</span>
            </button>
          )}
        </div>

        {queue.length <= 1 ? (
          <p className="text-xs text-[#6d5f56] py-8 text-center">No more tracks in queue</p>
        ) : (
          queue.map((trk, idx) => {
            if (idx === queueIndex) return null;

            return (
              <div
                key={`${trk.id}-${idx}`}
                draggable={true}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`p-2 rounded-xl border flex items-center justify-between gap-2.5 transition-all group ${
                  draggedIdx === idx
                    ? 'border-[#ff4e00] opacity-40 bg-[#140e0b]'
                    : 'border-transparent hover:border-[#1a1512] hover:bg-[#140e0b]/80 text-[#e0d8d0] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div title="Drag to reorder" className="cursor-grab active:cursor-grabbing text-[#6d5f56] group-hover:text-[#8e8279]">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                  <img src={trk.coverUrl} alt={trk.title} className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h5 
                      onClick={() => playTrack(trk)}
                      className="text-xs font-semibold truncate hover:text-[#ff4e00] cursor-pointer"
                    >
                      {trk.title}
                    </h5>
                    <p className="text-[10px] text-[#8e8279] truncate">{trk.artist}</p>
                  </div>
                </div>

                <button
                  onClick={() => removeFromQueue(idx)}
                  className="p-1 rounded-md text-[#6d5f56] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from queue"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

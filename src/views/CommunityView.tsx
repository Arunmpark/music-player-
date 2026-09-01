import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Sparkles, 
  Plus, 
  Share2, 
  Headphones, 
  Send, 
  Clock, 
  Flame, 
  Heart,
  CheckCircle2
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { CommunityPlaylist, CommunityComment } from '../types';

export const CommunityView: React.FC = () => {
  const { 
    currentUser, 
    createPlaylist, 
    setCurrentView, 
    setSelectedPlaylistId,
    openShareModal,
    isOnline
  } = useMusic();

  const [communityPlaylists, setCommunityPlaylists] = useState<CommunityPlaylist[]>([]);
  const [selectedPl, setSelectedPl] = useState<CommunityPlaylist | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [headphoneModel, setHeadphoneModel] = useState('Sennheiser HD 660S2');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [clonedId, setClonedId] = useState<string | null>(null);

  // Fetch community playlists from backend
  const fetchCommunityData = async () => {
    try {
      const res = await fetch('/api/community/playlists');
      if (res.ok) {
        const data = await res.json();
        setCommunityPlaylists(data);
        if (data.length > 0 && !selectedPl) {
          setSelectedPl(data[0]);
          fetchComments(data[0].id);
        }
      }
    } catch (err) {
      console.warn('Community fetch fallback:', err);
    }
  };

  const fetchComments = async (playlistId: string) => {
    try {
      const res = await fetch(`/api/community/playlists/${playlistId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.warn('Comments fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const handleSelectPlaylist = (pl: CommunityPlaylist) => {
    setSelectedPl(pl);
    fetchComments(pl.id);
  };

  const handleUpvote = async (playlistId: string) => {
    try {
      const res = await fetch(`/api/community/playlists/${playlistId}/upvote`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setCommunityPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, upvotes: updated.upvotes } : p));
        if (selectedPl && selectedPl.id === playlistId) {
          setSelectedPl(prev => prev ? { ...prev, upvotes: updated.upvotes } : null);
        }
      }
    } catch (e) {
      console.warn('Upvote error:', e);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPl || !newCommentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/community/playlists/${selectedPl.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: currentUser ? currentUser.name : 'Audiophile Enthusiast',
          userAvatar: currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          text: newCommentText.trim(),
          headphoneGear: headphoneModel
        })
      });

      if (res.ok) {
        const newC = await res.json();
        setComments(prev => [newC, ...prev]);
        setNewCommentText('');
      }
    } catch (err) {
      console.warn('Comment post error:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleClonePlaylist = async (pl: CommunityPlaylist) => {
    const newPl = await createPlaylist(
      `${pl.title} (Community Mix)`,
      `Cloned from community curator @${pl.authorName}. ${pl.description}`,
      pl.coverUrl,
      pl.trackIds
    );
    setClonedId(pl.id);
    setTimeout(() => {
      setSelectedPlaylistId(newPl.id);
      setCurrentView('playlist');
    }, 800);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="border-b border-[#1a1512] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
              Audiophile Community & Social Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#8e8279] mt-0.5">
              Discuss master recordings, exchange EQ setups, and explore shared lossless playlists.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Community Playlists) | Right (Active Discussion & Comments) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Community Playlists (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#6d5f56] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#ff4e00]" />
            <span>Trending Community Curations</span>
          </h2>

          <div className="space-y-3">
            {communityPlaylists.map((pl) => {
              const isSelected = selectedPl?.id === pl.id;

              return (
                <div
                  key={pl.id}
                  onClick={() => handleSelectPlaylist(pl)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#140e0b] border-[#ff4e00]/60 shadow-xl'
                      : 'bg-[#0f0a08]/80 border-[#1a1512] hover:border-[#251d18] hover:bg-[#140e0b]/60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={pl.coverUrl}
                      alt={pl.title}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-lg border border-[#251d18]"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-white truncate">{pl.title}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/20 font-mono">
                          {pl.tags[0] || 'Hi-Res'}
                        </span>
                      </div>

                      <p className="text-xs text-[#8e8279] line-clamp-2 mt-1">{pl.description}</p>
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-[#6d5f56] font-mono">
                        <span>by <strong className="text-[#e0d8d0] font-semibold">{pl.authorName}</strong></span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpvote(pl.id);
                            }}
                            className="flex items-center gap-1 text-[#ff4e00] hover:text-[#ff7300] transition-colors"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{pl.upvotes}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClonePlaylist(pl);
                            }}
                            className="flex items-center gap-1 text-[#e0d8d0] hover:text-white bg-[#1a1512] hover:bg-[#251d18] border border-[#251d18] px-2 py-1 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            {clonedId === pl.id ? <CheckCircle2 className="w-3 h-3 text-[#ff4e00]" /> : <Plus className="w-3 h-3" />}
                            <span>{clonedId === pl.id ? 'Added' : 'Save'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Discussion & Headphone Pairing Thread (6 cols) */}
        <div className="lg:col-span-6 bg-[#0f0a08]/80 border border-[#1a1512] rounded-2xl p-5 space-y-5">
          {selectedPl ? (
            <>
              <div className="border-b border-[#1a1512] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#ff4e00]" />
                    <span>Discussion: {selectedPl.title}</span>
                  </h3>
                  <p className="text-xs text-[#8e8279] mt-0.5">Mastering analysis & headphone synergy</p>
                </div>

                <button
                  onClick={() => openShareModal({ playlist: selectedPl as any })}
                  className="p-2 rounded-lg bg-[#140e0b] hover:bg-[#1a1512] border border-[#251d18] text-[#8e8279] hover:text-white transition-colors"
                  title="Share Discussion"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Comment Input Form */}
              <form onSubmit={handlePostComment} className="space-y-3 bg-[#140e0b] p-3.5 rounded-xl border border-[#1a1512]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56] flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-[#ff4e00]" />
                    <span>Listening On:</span>
                  </span>
                  <select
                    value={headphoneModel}
                    onChange={(e) => setHeadphoneModel(e.target.value)}
                    className="bg-[#0f0a08] border border-[#251d18] text-[11px] text-[#e0d8d0] rounded-lg px-2 py-1 focus:outline-none focus:border-[#ff4e00]"
                  >
                    <option value="Sennheiser HD 660S2">Sennheiser HD 660S2</option>
                    <option value="Audeze LCD-X Planar">Audeze LCD-X Planar</option>
                    <option value="Sony WH-1000XM5 (LDAC)">Sony WH-1000XM5 (LDAC)</option>
                    <option value="Apple AirPods Max (Lossless)">Apple AirPods Max</option>
                    <option value="Focal Clear Mg Open-Back">Focal Clear Mg</option>
                    <option value="Genelec 8330A Studio Monitors">Genelec 8330A Monitors</option>
                  </select>
                </div>

                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share impressions on dynamic range, soundstage, or your EQ preset tweaks..."
                  rows={2}
                  className="w-full bg-[#0f0a08] border border-[#1a1512] focus:border-[#ff4e00] rounded-xl px-3 py-2 text-xs text-white placeholder-[#6d5f56] focus:outline-none resize-none transition-colors"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newCommentText.trim() || isSubmittingComment}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff4e00] to-[#ffd000] hover:brightness-110 text-[#0a0502] text-xs font-bold shadow-md disabled:opacity-50 transition-all font-sans"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </form>

              {/* Comments Stream */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-[#6d5f56] py-8 text-center">
                    No community notes yet. Be the first to review this playlist!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3 bg-[#140e0b]/70 border border-[#1a1512] rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={c.userAvatar}
                            alt={c.userName}
                            className="w-6 h-6 rounded-full object-cover border border-[#251d18]"
                          />
                          <span className="text-xs font-bold text-white">{c.userName}</span>
                        </div>
                        {c.headphoneGear && (
                          <span className="text-[10px] font-mono text-[#ff4e00] bg-[#ff4e00]/10 px-2 py-0.5 rounded border border-[#ff4e00]/20">
                            {c.headphoneGear}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#8e8279] pl-8">{c.text}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-[#6d5f56] py-12 text-center">Select a community playlist to view notes</p>
          )}
        </div>

      </div>
    </div>
  );
};

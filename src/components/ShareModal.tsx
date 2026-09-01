import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  Sparkles, 
  Send, 
  Code, 
  Download,
  ExternalLink
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, setIsShareModalOpen, shareTarget } = useMusic();
  const [copied, setCopied] = useState(false);
  const [activeShareTab, setActiveShareTab] = useState<'link' | 'qrcode' | 'embed' | 'story'>('link');

  if (!isShareModalOpen || !shareTarget) return null;

  const item = shareTarget.track || shareTarget.playlist;
  if (!item) return null;

  const shareUrl = `${window.location.origin}/#${shareTarget.track ? 'track' : 'playlist'}/${item.id}`;
  const shareTitle = `${item.title} on Resonance Hi-Res Music`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const shareSocial = (platform: 'twitter' | 'whatsapp' | 'reddit') => {
    let url = '';
    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Listening to "${item.title}" in 24-bit master quality on @ResonanceMusic 🎧 ${shareUrl}`)}`;
    } else if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out "${item.title}" on Resonance Music: ${shareUrl}`)}`;
    } else if (platform === 'reddit') {
      url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-[#0f0a08] border border-[#1a1512] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1a1512] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white">Share Master Recording</h3>
              <p className="text-xs text-[#8e8279]">Collaborate & share with audiophile communities</p>
            </div>
          </div>

          <button
            onClick={() => setIsShareModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-[#140e0b] text-[#8e8279] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview Card */}
        <div className="flex items-center gap-4 bg-[#140e0b] p-3.5 rounded-2xl border border-[#1a1512]">
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-16 h-16 rounded-xl object-cover shadow-lg border border-[#251d18]"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff4e00]">
              {shareTarget.track ? 'Master Track' : 'Curated Playlist'}
            </span>
            <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
            <p className="text-xs text-[#8e8279] truncate">
              {shareTarget.track ? (item as any).artist : `${(item as any).trackIds?.length || 0} Tracks`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#140e0b] p-1 rounded-xl border border-[#1a1512] text-xs font-semibold">
          <button
            onClick={() => setActiveShareTab('link')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeShareTab === 'link' ? 'bg-[#ff4e00] text-[#0a0502] font-bold' : 'text-[#8e8279] hover:text-white'
            }`}
          >
            Direct Link
          </button>
          <button
            onClick={() => setActiveShareTab('qrcode')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeShareTab === 'qrcode' ? 'bg-[#ff4e00] text-[#0a0502] font-bold' : 'text-[#8e8279] hover:text-white'
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => setActiveShareTab('embed')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeShareTab === 'embed' ? 'bg-[#ff4e00] text-[#0a0502] font-bold' : 'text-[#8e8279] hover:text-white'
            }`}
          >
            Embed Player
          </button>
        </div>

        {/* Tab Content */}
        {activeShareTab === 'link' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-[#0a0502] border border-[#1a1512] rounded-xl p-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs text-[#e0d8d0] px-2 focus:outline-none font-mono truncate"
              />
              <button
                onClick={() => copyToClipboard(shareUrl)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#ffd000] hover:brightness-110 text-[#0a0502] font-bold text-xs shadow-md transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Social Share Buttons */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#6d5f56] mb-2">Share Directly</p>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => shareSocial('twitter')}
                  className="py-2 px-3 rounded-xl bg-[#140e0b] hover:bg-[#1a1512] border border-[#1a1512] text-xs font-semibold text-[#e0d8d0] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>X / Twitter</span>
                </button>
                <button
                  onClick={() => shareSocial('whatsapp')}
                  className="py-2 px-3 rounded-xl bg-[#140e0b] hover:bg-[#1a1512] border border-[#1a1512] text-xs font-semibold text-[#ff7300] hover:text-[#ffd000] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => shareSocial('reddit')}
                  className="py-2 px-3 rounded-xl bg-[#140e0b] hover:bg-[#1a1512] border border-[#1a1512] text-xs font-semibold text-[#ff4e00] hover:text-[#ff7300] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Reddit</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeShareTab === 'qrcode' && (
          <div className="flex flex-col items-center justify-center p-4 bg-[#140e0b] rounded-2xl border border-[#1a1512] space-y-3">
            <div className="bg-white p-3 rounded-2xl shadow-xl">
              {/* Clean SVG QR Code representation */}
              <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white" />
                <path d="M10 10h30v30h-30z M16 16v18h18v-18z M22 22h6v6h-6z" fill="#0a0502" />
                <path d="M60 10h30v30h-30z M66 16v18h18v-18z M72 22h6v6h-6z" fill="#0a0502" />
                <path d="M10 60h30v30h-30z M16 66v18h18v-18z M22 72h6v6h-6z" fill="#0a0502" />
                <rect x="50" y="50" width="10" height="10" fill="#ff4e00" />
                <rect x="70" y="60" width="8" height="16" fill="#0a0502" />
                <rect x="60" y="80" width="16" height="8" fill="#0a0502" />
                <rect x="80" y="80" width="10" height="10" fill="#ff4e00" />
                <rect x="45" y="20" width="8" height="8" fill="#0a0502" />
                <rect x="20" y="45" width="8" height="8" fill="#0a0502" />
              </svg>
            </div>
            <p className="text-xs text-[#8e8279] text-center max-w-xs">
              Scan with camera to instantly open high-res audio stream on mobile devices.
            </p>
          </div>
        )}

        {activeShareTab === 'embed' && (
          <div className="space-y-3">
            <div className="bg-[#0a0502] p-3 rounded-xl border border-[#1a1512] font-mono text-[11px] text-[#e0d8d0] overflow-x-auto">
              {`<iframe src="${shareUrl}?embed=true" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media"></iframe>`}
            </div>
            <button
              onClick={() => copyToClipboard(`<iframe src="${shareUrl}?embed=true" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media"></iframe>`)}
              className="w-full py-2 rounded-xl bg-[#140e0b] hover:bg-[#1a1512] border border-[#251d18] text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Code className="w-3.5 h-3.5 text-[#ff4e00]" />
              <span>Copy HTML Embed Snippet</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

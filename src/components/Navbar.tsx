import React, { useState } from 'react';
import { 
  Search, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bell, 
  Sun, 
  Moon, 
  User as UserIcon, 
  Sliders, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  CloudUpload,
  Layers
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const Navbar: React.FC<{ onSearchQuery?: (q: string) => void }> = ({ onSearchQuery }) => {
  const {
    isOnline,
    isSyncing,
    pendingSyncCount,
    syncWithCloud,
    theme,
    toggleTheme,
    unreadNotifCount,
    notifications,
    markNotificationAsRead,
    currentUser,
    setIsAuthModalOpen,
    setIsCloudUploadOpen,
    setIsEqualizerOpen,
    setCurrentView,
    playback
  } = useMusic();

  const [searchVal, setSearchVal] = useState('');
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setCurrentView('search');
      if (onSearchQuery) onSearchQuery(searchVal.trim());
    }
  };

  return (
    <header className="h-16 border-b border-[#1a1512] bg-[#0a0502]/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Brand & Hi-Res Indicator */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff4e00] via-[#ff7300] to-[#ffd000] flex items-center justify-center shadow-lg shadow-[#ff4e00]/20 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 text-[#0a0502] font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-[#ff4e00] transition-colors">
                RESONANCE
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/30">
                Hi-Res
              </span>
            </div>
            <p className="text-[10px] text-[#8e8279] hidden sm:block">24-bit / 96kHz Lossless Studio</p>
          </div>
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-[#8e8279] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              if (onSearchQuery) onSearchQuery(e.target.value);
            }}
            onFocus={() => {
              if (window.location.hash !== '#search') setCurrentView('search');
            }}
            placeholder="Search tracks, artists, genres, or 24-bit masters..."
            className="w-full bg-[#140e0b] border border-[#251d18] hover:border-[#332a22] focus:border-[#ff4e00] text-sm text-[#e0d8d0] placeholder-[#6d5f56] rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#ff4e00]/40 transition-all"
          />
        </form>
      </div>

      {/* Status Controls & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Network & Cloud Sync Badge */}
        <button
          onClick={() => syncWithCloud()}
          disabled={!isOnline || isSyncing}
          title={isOnline ? (pendingSyncCount > 0 ? `${pendingSyncCount} changes pending sync. Click to sync now.` : 'Cloud Sync Active') : 'Offline Mode. Using local cached storage.'}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-all ${
            isOnline
              ? pendingSyncCount > 0
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-[#ff4e00]/10 text-[#ff4e00] border-[#ff4e00]/30 hover:bg-[#ff4e00]/20'
              : 'bg-[#1a1512] text-[#8e8279] border-[#251d18]'
          }`}
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ff4e00]" />
          ) : isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-[#ff4e00]" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden md:inline">
            {isSyncing ? 'Syncing...' : isOnline ? (pendingSyncCount > 0 ? `Sync (${pendingSyncCount})` : 'Cloud Synced') : 'Offline Mode'}
          </span>
        </button>

        {/* Cloud Upload Button */}
        <button
          onClick={() => setIsCloudUploadOpen(true)}
          title="Upload High-Res Audio to Cloud Locker"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#140e0b] hover:bg-[#1a1512] border border-[#251d18] text-[#e0d8d0] hover:text-white transition-colors"
        >
          <CloudUpload className="w-3.5 h-3.5 text-[#ff4e00]" />
          <span>Upload</span>
        </button>

        {/* 5-Band Equalizer Toggle */}
        <button
          onClick={() => setIsEqualizerOpen(true)}
          title="Open 5-Band Studio Equalizer"
          className="p-2 rounded-full hover:bg-[#140e0b] text-[#8e8279] hover:text-[#ff4e00] transition-colors relative"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="p-2 rounded-full hover:bg-[#140e0b] text-[#8e8279] hover:text-white transition-colors relative"
            title="Notifications & Release Radar"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ff4e00] ring-2 ring-[#0a0502] animate-pulse" />
            )}
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0f0a08] border border-[#251d18] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#1a1512]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ff4e00]" />
                  <span className="text-sm font-bold text-white">Release Radar & Sync</span>
                </div>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={() => markNotificationAsRead('all')}
                    className="text-xs text-[#ff4e00] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#1a1512] mt-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#6d5f56] py-4 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`py-2.5 px-2 rounded-lg cursor-pointer flex gap-3 items-start transition-colors ${
                        n.read ? 'hover:bg-[#140e0b] text-[#8e8279]' : 'bg-[#ff4e00]/10 hover:bg-[#ff4e00]/20 text-[#e0d8d0]'
                      }`}
                    >
                      {n.coverUrl ? (
                        <img src={n.coverUrl} alt="Release" className="w-10 h-10 rounded-md object-cover flex-shrink-0 border border-[#251d18]" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-[#140e0b] border border-[#251d18] flex items-center justify-center flex-shrink-0 text-[#ff4e00]">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                          <span className="text-[10px] text-[#6d5f56] flex-shrink-0">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-[#8e8279] line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Auth Toggle */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-[#140e0b] hover:bg-[#1a1512] border border-[#251d18] transition-colors"
        >
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover border border-[#332a22]" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#1a1512] flex items-center justify-center text-[#e0d8d0]">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-semibold text-[#e0d8d0] hidden lg:inline max-w-[100px] truncate">
            {currentUser?.name || 'Sign In'}
          </span>
        </button>
      </div>
    </header>
  );
};

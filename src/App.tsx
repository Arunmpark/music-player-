import React from 'react';
import { MusicProvider, useMusic } from './context/MusicContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { VisualizerModal } from './components/VisualizerModal';
import { EqualizerModal } from './components/EqualizerModal';
import { ShareModal } from './components/ShareModal';
import { CloudUploadModal } from './components/CloudUploadModal';
import { AuthModal } from './components/AuthModal';
import { QueueDrawer } from './components/QueueDrawer';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { LibraryView } from './views/LibraryView';
import { PlaylistDetailView } from './views/PlaylistDetailView';
import { CommunityView } from './views/CommunityView';
import { OfflineView } from './views/OfflineView';
import { DragDropPlaylistBuilder } from './components/DragDropPlaylistBuilder';

const MainLayout: React.FC = () => {
  const { currentView } = useMusic();

  const renderActiveView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'search':
        return <SearchView />;
      case 'library':
        return <LibraryView />;
      case 'playlist':
        return <PlaylistDetailView />;
      case 'creator':
        return <DragDropPlaylistBuilder />;
      case 'community':
        return <CommunityView />;
      case 'offline':
        return <OfflineView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#0a0502] text-[#e0d8d0] font-sans select-none relative">
      {/* Top Application Navbar */}
      <Navbar />

      {/* Main Center Area: Sidebar + Scrollable Content View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Ambient Top-Right Radial Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-gradient-to-bl from-[#ff4e0018] via-transparent to-transparent pointer-events-none blur-[120px] -z-0" />

        {/* Left Drag & Drop Sidebar */}
        <Sidebar />

        {/* Dynamic Main View Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#140e0b]/30 to-[#0a0502] relative scroll-smooth pb-24 md:pb-28 z-10">
          {renderActiveView()}
        </main>

        {/* Up Next Playback Queue Drawer */}
        <QueueDrawer />
      </div>

      {/* Fixed Bottom Audio Player Bar */}
      <PlayerBar />

      {/* Interactive Overlays & Modals */}
      <VisualizerModal />
      <EqualizerModal />
      <ShareModal />
      <CloudUploadModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <MusicProvider>
      <MainLayout />
    </MusicProvider>
  );
}

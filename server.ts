import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory Cloud Database Store (Persisted across client sessions)
interface ServerUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: 'Audiophile Hi-Fi' | 'Lossless Premium' | 'Standard';
  joinedAt: string;
  likedTrackIds: string[];
  playlists: any[];
  uploadedTracks: any[];
  history: any[];
}

const usersStore: Map<string, ServerUser> = new Map();

// Seed initial Demo User
const demoUser: ServerUser = {
  id: 'user-demo-1',
  name: 'Alex Vance',
  email: 'alex.audiophile@resonance.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  tier: 'Audiophile Hi-Fi',
  joinedAt: '2024-01-01T00:00:00.000Z',
  likedTrackIds: ['track-1', 'track-2', 'track-4', 'track-8'],
  playlists: [],
  uploadedTracks: [],
  history: []
};
usersStore.set(demoUser.id, demoUser);
usersStore.set(demoUser.email, demoUser);

// Community Shared Playlists Store
let communityPlaylists = [
  {
    id: 'community-1',
    title: 'Midnight Synthwave Journey',
    description: 'A continuous cosmic drive through 80s retrowave, cybernetic beats, and analog synth warmth.',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-1', 'track-3', 'track-6', 'track-8'],
    isPublic: true,
    authorId: 'user-demo-1',
    authorName: 'Alex Vance',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    likesCount: 342,
    tags: ['Synthwave', 'Hi-Res', 'Night Drive'],
    comments: [
      {
        id: 'c1',
        userId: 'u-elena',
        userName: 'Elena Rostova',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        comment: 'The audio clarity on Midnight Horizon with planar magnetic headphones is breathtaking!',
        timestamp: '2 hours ago'
      },
      {
        id: 'c2',
        userId: 'u-marcus',
        userName: 'Marcus Chen',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        comment: 'Great seamless flow. Added this to my offline commute downloads.',
        timestamp: '5 hours ago'
      }
    ]
  },
  {
    id: 'community-2',
    title: 'Acoustic & Studio Masters',
    description: 'Pure uncompressed acoustic guitars, grand pianos, and gentle strings recorded at 24-bit 192kHz.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-2', 'track-4', 'track-7'],
    isPublic: true,
    authorId: 'u-sarah',
    authorName: 'Sarah Jenkins',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    likesCount: 521,
    tags: ['Acoustic', 'FLAC', 'Classical'],
    comments: [
      {
        id: 'c3',
        userId: 'u-david',
        userName: 'David K.',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        comment: 'The dynamic range in Cascade of Stars is masterfully mastered.',
        timestamp: '1 day ago'
      }
    ]
  }
];

// Live Notifications Store
let serverNotifications = [
  {
    id: 'notif-srv-1',
    title: 'New Studio Master Available',
    message: 'Celeste Duo released a remastered 24-bit/192kHz edition of "Acoustic Resonance".',
    timestamp: '10m ago',
    read: false,
    type: 'release',
    trackId: 'track-2',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'notif-srv-2',
    title: 'Cloud Synchronization Active',
    message: 'Your playlist changes and offline cache verified across 2 linked devices.',
    timestamp: '45m ago',
    read: false,
    type: 'sync'
  },
  {
    id: 'notif-srv-3',
    title: 'Trending in Community',
    message: 'Your curated playlist "Audiophile Hi-Res Showcase" hit top 5 trending mixes.',
    timestamp: '3h ago',
    read: true,
    type: 'social'
  }
];

// API ROUTES

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString(), version: '2.4.0' });
});

// 2. Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  let user = usersStore.get(email);

  if (!user) {
    // Auto-create or return demo user
    user = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
      email: email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      tier: 'Audiophile Hi-Fi',
      joinedAt: new Date().toISOString(),
      likedTrackIds: ['track-1', 'track-2'],
      playlists: [],
      uploadedTracks: [],
      history: []
    };
    usersStore.set(user.id, user);
    usersStore.set(email, user);
  }

  res.json({
    token: `jwt-token-${user.id}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      tier: user.tier,
      joinedAt: user.joinedAt
    }
  });
});

app.post('/api/auth/demo', (req, res) => {
  res.json({
    token: `jwt-token-${demoUser.id}`,
    user: {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      avatar: demoUser.avatar,
      tier: demoUser.tier,
      joinedAt: demoUser.joinedAt
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = 'user-demo-1';
  if (authHeader && authHeader.startsWith('Bearer jwt-token-')) {
    userId = authHeader.replace('Bearer jwt-token-', '');
  }

  const user = usersStore.get(userId) || demoUser;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      tier: user.tier,
      joinedAt: user.joinedAt
    },
    library: {
      likedTrackIds: user.likedTrackIds || [],
      playlists: user.playlists || [],
      uploadedTracks: user.uploadedTracks || [],
      history: user.history || []
    }
  });
});

// 3. Search endpoint (Live Streaming API integration with iTunes metadata + high-res catalog fallback)
app.get('/api/music/search', async (req, res) => {
  const query = (req.query.q as string || '').trim();
  const genre = (req.query.genre as string || '').trim();
  const hiResOnly = req.query.hires === 'true';

  if (!query) {
    return res.json({ results: [] });
  }

  try {
    // Call iTunes Search API for real streaming audio preview metadata
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`;
    const response = await fetch(itunesUrl);
    
    if (response.ok) {
      const data = await response.json();
      const tracks = (data.results || []).map((item: any, idx: number) => {
        const isHiResMaster = idx % 2 === 0;
        // high resolution cover artwork replacement (600x600 instead of 100x100)
        const highResCover = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

        return {
          id: `itunes-${item.trackId}`,
          title: item.trackName || 'Unknown Title',
          artist: item.artistName || 'Unknown Artist',
          album: item.collectionName || 'Single',
          duration: Math.round((item.trackTimeMillis || 180000) / 1000),
          audioUrl: item.previewUrl,
          coverUrl: highResCover,
          genre: item.primaryGenreName || 'Pop / Electronic',
          releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 2024,
          isHiRes: isHiResMaster,
          format: isHiResMaster ? 'FLAC' : 'AAC',
          bitDepth: isHiResMaster ? 24 : 16,
          sampleRate: isHiResMaster ? 96000 : 44100,
          bitrate: isHiResMaster ? 2304 : 320,
          source: 'stream',
          playCount: Math.floor(Math.random() * 80000) + 12000,
          lyrics: [
            `[00:00.00] (Streaming high-definition audio preview)`,
            `[00:08.00] ${item.trackName} by ${item.artistName}`,
            `[00:18.00] Album: ${item.collectionName || 'Original Release'}`,
            `[00:28.00] High-Fidelity preview active`
          ]
        };
      }).filter((t: any) => t.audioUrl);

      if (hiResOnly) {
        return res.json({ results: tracks.filter((t: any) => t.isHiRes) });
      }

      return res.json({ results: tracks });
    }
  } catch (error) {
    console.warn('iTunes API search fallback triggered:', error);
  }

  res.json({ results: [] });
});

// 4. Multi-Device Cloud Sync Endpoint (Synchronizes offline outbox & returns merged state)
app.post('/api/library/sync', (req, res) => {
  const { userId, actions, clientLibrary } = req.body;
  const targetUserId = userId || 'user-demo-1';
  let user = usersStore.get(targetUserId);

  if (!user) {
    user = {
      id: targetUserId,
      name: 'Resonance User',
      email: 'user@resonance.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      tier: 'Audiophile Hi-Fi',
      joinedAt: new Date().toISOString(),
      likedTrackIds: [],
      playlists: [],
      uploadedTracks: [],
      history: []
    };
    usersStore.set(targetUserId, user);
  }

  // Process offline actions ledger
  if (Array.isArray(actions)) {
    for (const action of actions) {
      switch (action.type) {
        case 'LIKE_TRACK':
          if (!user.likedTrackIds.includes(action.payload.trackId)) {
            user.likedTrackIds.push(action.payload.trackId);
          }
          break;
        case 'UNLIKE_TRACK':
          user.likedTrackIds = user.likedTrackIds.filter(id => id !== action.payload.trackId);
          break;
        case 'CREATE_PLAYLIST':
          if (!user.playlists.some(p => p.id === action.payload.id)) {
            user.playlists.unshift(action.payload);
          }
          break;
        case 'UPDATE_PLAYLIST':
          user.playlists = user.playlists.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p);
          break;
        case 'DELETE_PLAYLIST':
          user.playlists = user.playlists.filter(p => p.id !== action.payload.id);
          break;
        case 'UPLOAD_TRACK':
          if (!user.uploadedTracks.some(t => t.id === action.payload.id)) {
            user.uploadedTracks.unshift(action.payload);
          }
          break;
        case 'ADD_HISTORY':
          user.history.unshift(action.payload);
          if (user.history.length > 50) user.history.pop();
          break;
      }
    }
  }

  // If client supplied existing local playlists/likes, merge safely
  if (clientLibrary) {
    if (Array.isArray(clientLibrary.likedTrackIds)) {
      user.likedTrackIds = Array.from(new Set([...user.likedTrackIds, ...clientLibrary.likedTrackIds]));
    }
    if (Array.isArray(clientLibrary.playlists)) {
      for (const pl of clientLibrary.playlists) {
        const existingIdx = user.playlists.findIndex(p => p.id === pl.id);
        if (existingIdx >= 0) {
          user.playlists[existingIdx] = { ...user.playlists[existingIdx], ...pl };
        } else {
          user.playlists.push(pl);
        }
      }
    }
  }

  res.json({
    success: true,
    syncedAt: new Date().toISOString(),
    serverLibrary: {
      likedTrackIds: user.likedTrackIds,
      playlists: user.playlists,
      uploadedTracks: user.uploadedTracks,
      history: user.history
    }
  });
});

// 5. Cloud Storage Integration: User Audio Upload Endpoint
app.post('/api/library/upload', (req, res) => {
  const { userId, title, artist, album, genre, audioDataUrl, format, fileSize, duration } = req.body;
  const targetUserId = userId || 'user-demo-1';
  let user = usersStore.get(targetUserId);

  if (!user) {
    user = demoUser;
  }

  const isLossless = (format === 'FLAC' || format === 'WAV');
  const newUploadedTrack = {
    id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title || 'My Studio Track',
    artist: artist || user.name || 'Original Artist',
    album: album || 'Cloud Masters',
    duration: duration || 210,
    audioUrl: audioDataUrl || 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
    genre: genre || 'Master Upload',
    releaseYear: new Date().getFullYear(),
    isHiRes: isLossless,
    format: format || 'FLAC',
    bitDepth: isLossless ? 24 : 16,
    sampleRate: isLossless ? 96000 : 44100,
    bitrate: isLossless ? 2304 : 320,
    fileSize: fileSize || 35000000,
    source: 'upload',
    playCount: 1,
    lyrics: [
      '[00:00.00] (User uploaded cloud master audio file)',
      `[00:10.00] Track: ${title || 'My Studio Track'}`,
      `[00:20.00] Quality: ${format || 'FLAC'} 24-bit 96kHz Lossless`
    ]
  };

  user.uploadedTracks.unshift(newUploadedTrack);

  // Add system release alert
  serverNotifications.unshift({
    id: `notif-up-${Date.now()}`,
    title: 'Cloud Master Uploaded',
    message: `"${newUploadedTrack.title}" has been encoded and synced to your high-resolution cloud locker.`,
    timestamp: 'Just now',
    read: false,
    type: 'release',
    trackId: newUploadedTrack.id,
    coverUrl: newUploadedTrack.coverUrl
  });

  res.json({
    success: true,
    track: newUploadedTrack
  });
});

// 6. Community Playlists & Social Endpoints
app.get('/api/social/community', (req, res) => {
  res.json({ playlists: communityPlaylists });
});

app.post('/api/social/community/like', (req, res) => {
  const { playlistId } = req.body;
  const pl = communityPlaylists.find(p => p.id === playlistId);
  if (pl) {
    pl.likesCount = (pl.likesCount || 0) + 1;
    return res.json({ success: true, likesCount: pl.likesCount });
  }
  res.status(404).json({ error: 'Playlist not found' });
});

app.post('/api/social/community/comment', (req, res) => {
  const { playlistId, comment, userName, userAvatar, userId } = req.body;
  const pl = communityPlaylists.find(p => p.id === playlistId);
  if (!pl) return res.status(404).json({ error: 'Playlist not found' });

  const newComment = {
    id: `c-${Date.now()}`,
    userId: userId || 'user-demo-1',
    userName: userName || 'Alex Vance',
    userAvatar: userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    comment: comment || 'Amazing audio soundstage!',
    timestamp: 'Just now'
  };

  pl.comments = pl.comments || [];
  pl.comments.unshift(newComment);

  res.json({ success: true, comment: newComment });
});

// 7. Notifications Endpoints
app.get('/api/notifications', (req, res) => {
  res.json({ notifications: serverNotifications });
});

app.post('/api/notifications/mark-read', (req, res) => {
  const { id } = req.body;
  if (id === 'all') {
    serverNotifications.forEach(n => n.read = true);
  } else {
    const notif = serverNotifications.find(n => n.id === id);
    if (notif) notif.read = true;
  }
  res.json({ success: true });
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Resonance Music Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

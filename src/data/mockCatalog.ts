import { Track, Playlist, ReleaseNotification } from '../types';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Midnight Horizon',
    artist: 'Aetheria',
    album: 'Neon Solitude',
    duration: 218,
    audioUrl: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    genre: 'Synthwave / Electronic',
    releaseYear: 2024,
    isHiRes: true,
    format: 'FLAC',
    bitDepth: 24,
    sampleRate: 96000,
    bitrate: 2304,
    fileSize: 48200000,
    playCount: 142300,
    source: 'catalog',
    lyrics: [
      '[00:00.00] (Synth bassline swells under atmospheric pads)',
      '[00:14.20] City lights reflect on chrome and glass',
      '[00:26.50] Echoes of the day we watched the skyline pass',
      '[00:39.80] Drifting into zero gravity tonight',
      '[00:52.40] Guided by the pulse of neon violet light',
      '[01:06.10] Midnight horizon, take me away',
      '[01:18.90] Into the spaces where the soundwaves play',
      '[01:32.40] (Arpeggiated synthesizer solo)',
      '[01:58.20] Infinite frequencies resonating deep',
      '[02:10.00] Secrets of the cosmos that the rhythms keep'
    ]
  },
  {
    id: 'track-2',
    title: 'Cascade of Stars',
    artist: 'Celeste Duo',
    album: 'Acoustic Resonance',
    duration: 185,
    audioUrl: 'https://cdn.freesound.org/previews/676/676412_5674468-lq.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    genre: 'Acoustic / Neo-Classical',
    releaseYear: 2024,
    isHiRes: true,
    format: 'FLAC',
    bitDepth: 24,
    sampleRate: 192000,
    bitrate: 4608,
    fileSize: 64100000,
    playCount: 98400,
    source: 'catalog',
    lyrics: [
      '[00:00.00] (Delicate fingerstyle nylon acoustic guitar)',
      '[00:12.30] Falling like rain through the silent night',
      '[00:25.00] Every small chord is a spark of light',
      '[00:37.80] Hold on to the melody in your heart',
      '[00:50.10] Even when the shadows start to part',
      '[01:04.50] Cascade of stars, shining forever bright'
    ]
  },
  {
    id: 'track-3',
    title: 'Quantum Drift',
    artist: 'Subatomic Pulse',
    album: 'Hyperdrive',
    duration: 242,
    audioUrl: 'https://cdn.freesound.org/previews/608/608645_5674468-lq.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    genre: 'Deep House / Melodic',
    releaseYear: 2023,
    isHiRes: true,
    format: 'FLAC',
    bitDepth: 24,
    sampleRate: 96000,
    bitrate: 2304,
    fileSize: 52400000,
    playCount: 219800,
    source: 'catalog',
    lyrics: [
      '[00:00.00] (Deep 4/4 sub-kick and rhythmic hi-hat groove)',
      '[00:20.00] Feel the sub-bass moving your soul',
      '[00:44.00] In the vibration we find our control',
      '[01:10.00] (Hypnotic filter sweep drop)',
      '[01:34.00] Lost inside the quantum drift',
      '[01:56.00] Watch the spatial dimensions shift'
    ]
  },
  {
    id: 'track-4',
    title: 'Rainforest Epiphany',
    artist: 'Maya Lin',
    album: 'Organic Earth',
    duration: 210,
    audioUrl: 'https://cdn.freesound.org/previews/530/530703_5674468-lq.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
    genre: 'Ambient / Chillout',
    releaseYear: 2024,
    isHiRes: true,
    format: 'WAV',
    bitDepth: 32,
    sampleRate: 96000,
    bitrate: 3072,
    fileSize: 72000000,
    playCount: 184500,
    source: 'catalog',
    lyrics: [
      '[00:00.00] (Gentle rainfall with warm Rhodes piano and flute)',
      '[00:30.00] Breathe in the freshness of the green canopy',
      '[01:00.00] Harmony restored within every tree',
      '[01:30.00] Flow like the river to the open sea',
      '[02:00.00] Natural peace and tranquillity'
    ]
  },
  {
    id: 'track-5',
    title: 'Golden Sunset Blvd',
    artist: 'The Sunset Collective',
    album: 'Pacific Vibes',
    duration: 198,
    audioUrl: 'https://cdn.freesound.org/previews/615/615099_5674468-lq.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    genre: 'Lo-Fi / Chillhop',
    releaseYear: 2024,
    isHiRes: false,
    format: 'AAC',
    bitDepth: 16,
    sampleRate: 44100,
    bitrate: 320,
    fileSize: 8400000,
    playCount: 312000,
    source: 'catalog',
    lyrics: [
      '[00:00.00] (Vinyl crackle with jazzy piano chops and dusty drum loops)',
      '[00:22.00] Driving down the coastline as the sun goes down',
      '[00:45.00] Leaving all the noise in the crowded town',
      '[01:10.00] Golden hour dreams and a mellow sound',
      '[01:35.00] Peace of mind is the treasure found'
    ]
  },
  {
    id: 'track-6',
    title: 'Velocity Prime',
    artist: 'Hyperion 9',
    album: 'Cybernetic Overdrive',
    duration: 230,
    audioUrl: 'https://cdn.freesound.org/previews/518/518305_5674468-lq.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
    genre: 'Drum & Bass / Cyberpunk',
    releaseYear: 2024,
    isHiRes: true,
    format: 'FLAC',
    bitDepth: 24,
    sampleRate: 96000,
    bitrate: 2304,
    fileSize: 55000000,
    playCount: 165400,
    source: 'catalog',
    lyrics: [
      '[00:00.00] (174 BPM rolling reese bass with snappy amen breaks)',
      '[00:25.00] Acceleration peaking at the red line zone',
      '[00:50.00] Synthetic adrenaline in muscle and bone',
      '[01:15.00] (Full speed neurofunk drop)',
      '[01:45.00] Break the sound barrier alone'
    ]
  },
  {
    id: 'track-7',
    title: 'Symphony of the Northern Lights',
    artist: 'Nordic Philharmonic',
    album: 'Aurora Borealis',
    duration: 315,
    audioUrl: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&auto=format&fit=crop&q=80',
    genre: 'Classical / Orchestral',
    releaseYear: 2023,
    isHiRes: true,
    format: 'FLAC',
    bitDepth: 24,
    sampleRate: 192000,
    bitrate: 4608,
    fileSize: 95000000,
    playCount: 88200,
    source: 'catalog',
    lyrics: [
      '[00:00.00] (Lush string section entering with soft French horns)',
      '[01:00.00] (Crescendo building with timpani and harp glissando)',
      '[02:00.00] (Majestic brass choir and soaring violins theme)',
      '[02:45.00] (Gentle woodwind resolution)'
    ]
  },
  {
    id: 'track-8',
    title: 'Neon Tokyo Alleyway',
    artist: 'Kaito Morita',
    album: 'Shibuya Midnight',
    duration: 205,
    audioUrl: 'https://cdn.freesound.org/previews/608/608645_5674468-lq.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    genre: 'Future Funk / Nu-Disco',
    releaseYear: 2024,
    isHiRes: true,
    format: 'FLAC',
    bitDepth: 24,
    sampleRate: 96000,
    bitrate: 2304,
    fileSize: 45000000,
    playCount: 275000,
    source: 'catalog',
    lyrics: [
      '[00:00.00] (Punchy slap bass and shimmering disco rhythm guitar)',
      '[00:18.00] Neon signs flashing in Japanese rain',
      '[00:36.00] Dance until we forget every pain',
      '[00:54.00] Shibuya crossing under midnight glow',
      '[01:12.00] Move to the groove and let the feeling flow'
    ]
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-audiophile-showcase',
    title: 'Audiophile Hi-Res Showcase',
    description: 'Master quality audio files recorded at 24-bit/96kHz & 192kHz. Calibrated for reference studio monitors & premium planar headphones.',
    coverUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-1', 'track-2', 'track-3', 'track-7', 'track-4'],
    isPublic: true,
    authorName: 'Resonance Editorial',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z',
    likesCount: 1420,
    tags: ['Hi-Res', 'Lossless', 'Audiophile', '24-bit']
  },
  {
    id: 'playlist-late-night-lofi',
    title: 'Late Night Flow & Lo-Fi',
    description: 'Warm tape saturation, vinyl dust, and relaxing beats for deep work, coding, and nocturnal relaxation.',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-5', 'track-4', 'track-8'],
    isPublic: true,
    authorName: 'Chill Studio',
    createdAt: '2024-02-10T00:00:00.000Z',
    updatedAt: '2024-02-28T00:00:00.000Z',
    likesCount: 890,
    tags: ['Lo-Fi', 'Study', 'Chill', 'Coding']
  },
  {
    id: 'playlist-cyberpunk-pulse',
    title: 'Cyberpunk & Synth Pulse',
    description: 'High-energy synthesized dystopias, 80s analog nostalgia, and crushing drum & bass rhythms.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-1', 'track-6', 'track-3', 'track-8'],
    isPublic: true,
    authorName: 'SynthCity Records',
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-03-05T00:00:00.000Z',
    likesCount: 1105,
    tags: ['Synthwave', 'D&B', 'Electronic', 'Hi-Energy']
  }
];

export const INITIAL_NOTIFICATIONS: ReleaseNotification[] = [
  {
    id: 'notif-1',
    title: 'New Album Release',
    message: 'Aetheria just released "Neon Solitude" in 24-bit Lossless Studio Master format.',
    timestamp: 'Just now',
    read: false,
    type: 'release',
    trackId: 'track-1',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'notif-2',
    title: 'Cloud Sync Complete',
    message: 'Your offline downloads and library changes have synchronized across all active devices.',
    timestamp: '15m ago',
    read: false,
    type: 'sync'
  },
  {
    id: 'notif-3',
    title: 'Featured by Curators',
    message: 'Your custom playlist "Late Night Flow" was upvoted by 48 audiophiles in the Community Feed.',
    timestamp: '2h ago',
    read: true,
    type: 'social'
  }
];

export const GENRE_CATEGORIES = [
  { id: 'synthwave', name: 'Synthwave & Cyber', color: 'from-fuchsia-600 to-indigo-700', icon: 'Sparkles', cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80' },
  { id: 'acoustic', name: 'Acoustic & Classical', color: 'from-amber-600 to-rose-700', icon: 'Music', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80' },
  { id: 'electronic', name: 'Deep House & EDM', color: 'from-cyan-600 to-blue-800', icon: 'Zap', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80' },
  { id: 'ambient', name: 'Ambient & Lo-Fi', color: 'from-emerald-600 to-teal-800', icon: 'Wind', cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&auto=format&fit=crop&q=80' },
  { id: 'rock', name: 'Rock & Alternative', color: 'from-red-600 to-orange-700', icon: 'Flame', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80' },
  { id: 'jazz', name: 'Jazz & Soul Vibes', color: 'from-violet-600 to-purple-900', icon: 'Radio', cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&auto=format&fit=crop&q=80' }
];

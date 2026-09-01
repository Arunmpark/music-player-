import { EqualizerSettings, Track } from '../types';

export interface AudioEngineCallbacks {
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (err: any) => void;
}

class AudioEngine {
  private audio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private masterGainNode: GainNode | null = null;
  private preampNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  // 5-band Equalizer filters
  private bassFilter: BiquadFilterNode | null = null;
  private lowMidFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private highMidFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;

  // Synthesizer nodes & scheduling
  private synthGainNode: GainNode | null = null;
  private synthInterval: any = null;
  private synthTimer: any = null;
  private isSynthPlaying = false;
  private synthCurrentTime = 0;
  private synthDuration = 180;
  private currentTrackData: Track | null = null;
  private activeOscillators: { stop: (time?: number) => void }[] = [];

  private isWebAudioInitialized = false;
  private volumeLevel = 0.85;
  private isMutedState = false;
  private playbackRateVal = 1.0;
  private isUsingSynthMode = false;

  private callbacks: AudioEngineCallbacks = {};

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';

    // Handle standard audio element events
    this.audio.addEventListener('timeupdate', () => {
      if (!this.isUsingSynthMode) {
        const cur = this.audio.currentTime;
        const dur = isFinite(this.audio.duration) && this.audio.duration > 0 ? this.audio.duration : this.synthDuration;
        this.callbacks.onTimeUpdate?.(cur, dur);
      }
    });

    this.audio.addEventListener('play', () => {
      if (!this.isUsingSynthMode) {
        this.callbacks.onPlay?.();
      }
    });

    this.audio.addEventListener('pause', () => {
      if (!this.isUsingSynthMode) {
        this.callbacks.onPause?.();
      }
    });

    this.audio.addEventListener('ended', () => {
      if (!this.isUsingSynthMode) {
        this.callbacks.onEnded?.();
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio element source error, seamlessly falling back to high-res procedural audio synthesis:', e);
      this.fallbackToSynth();
    });
  }

  public setCallbacks(cbs: AudioEngineCallbacks) {
    this.callbacks = { ...this.callbacks, ...cbs };
  }

  public initWebAudio() {
    if (this.isWebAudioInitialized && this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(console.warn);
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.audioCtx = new AudioCtxClass();

      // Analyser for real-time visualizer
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Master and preamp gains
      this.preampNode = this.audioCtx.createGain();
      this.masterGainNode = this.audioCtx.createGain();
      this.synthGainNode = this.audioCtx.createGain();
      this.synthGainNode.gain.value = 0.8;

      // Equalizer filters
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 80;

      this.lowMidFilter = this.audioCtx.createBiquadFilter();
      this.lowMidFilter.type = 'peaking';
      this.lowMidFilter.frequency.value = 320;
      this.lowMidFilter.Q.value = 1.0;

      this.midFilter = this.audioCtx.createBiquadFilter();
      this.midFilter.type = 'peaking';
      this.midFilter.frequency.value = 1000;
      this.midFilter.Q.value = 1.0;

      this.highMidFilter = this.audioCtx.createBiquadFilter();
      this.highMidFilter.type = 'peaking';
      this.highMidFilter.frequency.value = 3200;
      this.highMidFilter.Q.value = 1.0;

      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 12000;

      // Synth chain: synthGainNode -> preampNode -> EQ filters -> masterGainNode -> analyserNode -> destination
      this.synthGainNode.connect(this.preampNode);
      this.preampNode
        .connect(this.bassFilter)
        .connect(this.lowMidFilter)
        .connect(this.midFilter)
        .connect(this.highMidFilter)
        .connect(this.trebleFilter)
        .connect(this.masterGainNode)
        .connect(this.analyserNode)
        .connect(this.audioCtx.destination);

      // Connect MediaElementSource safely
      try {
        if (!this.sourceNode) {
          this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
          this.sourceNode.connect(this.preampNode);
        }
      } catch (err) {
        console.warn('MediaElementSource attach notice:', err);
      }

      this.setVolume(this.volumeLevel);
      this.isWebAudioInitialized = true;
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  public async resumeContext() {
    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (e) {
        console.warn('AudioContext resume notice:', e);
      }
    }
  }

  public loadTrack(url: string, trackInfo?: Track) {
    this.initWebAudio();
    this.stopSynth();
    this.currentTrackData = trackInfo || null;
    this.synthDuration = trackInfo?.duration || 210;
    this.synthCurrentTime = 0;

    // Check if the URL is valid user-uploaded audio or direct data stream
    const isDataOrBlob = url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/api/');
    const isExternalValid = url.startsWith('http') && !url.includes('freesound.org');

    if (isDataOrBlob || isExternalValid) {
      this.isUsingSynthMode = false;
      this.audio.src = url;
      this.audio.load();
    } else {
      // For demo catalog or CORS-restricted URLs, use high-res procedural audio synthesis
      this.isUsingSynthMode = true;
      this.audio.pause();
      this.audio.removeAttribute('src');
    }
  }

  public async play(): Promise<void> {
    await this.resumeContext();

    if (this.isUsingSynthMode) {
      this.startSynth();
      this.callbacks.onPlay?.();
      return;
    }

    try {
      await this.audio.play();
      this.callbacks.onPlay?.();
    } catch (err) {
      console.warn('Audio element play failed, engaging procedural audio synthesis engine:', err);
      this.fallbackToSynth();
      this.startSynth();
      this.callbacks.onPlay?.();
    }
  }

  public pause(): void {
    if (this.isUsingSynthMode) {
      this.stopSynth();
      this.callbacks.onPause?.();
    } else {
      this.audio.pause();
    }
  }

  public seek(seconds: number): void {
    const target = Math.max(0, Math.min(this.synthDuration, seconds));
    if (this.isUsingSynthMode) {
      this.synthCurrentTime = target;
      this.callbacks.onTimeUpdate?.(this.synthCurrentTime, this.synthDuration);
    } else {
      try {
        if (isFinite(seconds) && seconds >= 0) {
          this.audio.currentTime = seconds;
        }
      } catch (e) {
        this.synthCurrentTime = target;
      }
    }
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volumeLevel = clamped;
    this.audio.volume = clamped;

    if (this.masterGainNode && this.audioCtx) {
      this.masterGainNode.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
  }

  public setPlaybackRate(rate: number): void {
    this.playbackRateVal = Math.max(0.5, Math.min(2.0, rate));
    this.audio.playbackRate = this.playbackRateVal;
  }

  public applyEqualizer(eq: EqualizerSettings): void {
    if (!this.isWebAudioInitialized || !this.audioCtx) return;

    const time = this.audioCtx.currentTime;

    if (!eq.enabled) {
      if (this.bassFilter) this.bassFilter.gain.setValueAtTime(0, time);
      if (this.lowMidFilter) this.lowMidFilter.gain.setValueAtTime(0, time);
      if (this.midFilter) this.midFilter.gain.setValueAtTime(0, time);
      if (this.highMidFilter) this.highMidFilter.gain.setValueAtTime(0, time);
      if (this.trebleFilter) this.trebleFilter.gain.setValueAtTime(0, time);
      if (this.preampNode) this.preampNode.gain.setValueAtTime(1.0, time);
      return;
    }

    if (this.bassFilter) this.bassFilter.gain.setValueAtTime(eq.bass, time);
    if (this.lowMidFilter) this.lowMidFilter.gain.setValueAtTime(eq.lowMid, time);
    if (this.midFilter) this.midFilter.gain.setValueAtTime(eq.mid, time);
    if (this.highMidFilter) this.highMidFilter.gain.setValueAtTime(eq.highMid, time);
    if (this.trebleFilter) this.trebleFilter.gain.setValueAtTime(eq.treble, time);

    if (this.preampNode) {
      const linear = Math.pow(10, (eq.preamp || 0) / 20);
      this.preampNode.gain.setValueAtTime(linear, time);
    }
  }

  public getFrequencyData(dataArray: Uint8Array): void {
    if (this.analyserNode && (this.isSynthPlaying || !this.audio.paused)) {
      this.analyserNode.getByteFrequencyData(dataArray);
    } else {
      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = 0;
      }
    }
  }

  public getAudioElement(): HTMLAudioElement {
    return this.audio;
  }

  private fallbackToSynth() {
    this.isUsingSynthMode = true;
    this.audio.pause();
    this.audio.removeAttribute('src');
  }

  // ==========================================
  // PROCEDURAL HIGH-RES WEB AUDIO SYNTHESIZER
  // ==========================================

  private startSynth() {
    this.stopSynth();
    if (!this.audioCtx || !this.synthGainNode) {
      this.initWebAudio();
    }
    if (!this.audioCtx) return;

    this.isSynthPlaying = true;
    const genre = (this.currentTrackData?.genre || 'electronic').toLowerCase();
    const trackId = this.currentTrackData?.id || 'track-1';

    // Determine musical properties based on track
    let bpm = 120;
    let rootFreq = 220; // A3
    let scale = [0, 3, 5, 7, 10, 12, 15, 17]; // Minor Pentatonic / Blues

    if (genre.includes('synthwave') || trackId === 'track-1') {
      bpm = 118;
      rootFreq = 220; // A
      scale = [0, 3, 7, 10, 12, 15, 19, 22]; // Synthwave minor 7th
    } else if (genre.includes('acoustic') || genre.includes('classical') || trackId === 'track-2') {
      bpm = 90;
      rootFreq = 293.66; // D
      scale = [0, 4, 7, 9, 12, 16, 19, 21]; // Major pentatonic / Acoustic
    } else if (genre.includes('house') || genre.includes('electronic') || trackId === 'track-3') {
      bpm = 124;
      rootFreq = 174.61; // F
      scale = [0, 3, 7, 8, 10, 12, 15, 19]; // Deep house minor
    } else if (genre.includes('ambient') || genre.includes('chill') || trackId === 'track-4') {
      bpm = 76;
      rootFreq = 164.81; // E
      scale = [0, 2, 4, 7, 9, 12, 14, 16]; // Lydian / Ambient
    } else if (genre.includes('lo-fi') || genre.includes('chillhop') || trackId === 'track-5') {
      bpm = 84;
      rootFreq = 261.63; // C
      scale = [0, 4, 7, 11, 12, 14, 16, 19]; // Lo-Fi Major 7th / 9th
    } else if (genre.includes('drum & bass') || genre.includes('cyber') || trackId === 'track-6') {
      bpm = 170;
      rootFreq = 164.81; // E
      scale = [0, 3, 5, 6, 7, 10, 12, 15]; // D&B Blues / Cyber
    } else if (genre.includes('orchestral') || trackId === 'track-7') {
      bpm = 74;
      rootFreq = 196.0; // G
      scale = [0, 2, 3, 7, 8, 12, 14, 15]; // Orchestral minor
    } else if (genre.includes('funk') || genre.includes('disco') || trackId === 'track-8') {
      bpm = 116;
      rootFreq = 293.66; // D
      scale = [0, 3, 5, 7, 10, 12, 15, 17]; // Funk Minor
    }

    const stepDuration = (60 / bpm) / 4; // 16th note duration in seconds
    let step = 0;

    // Trigger procedural audio scheduler loop
    const scheduleTick = () => {
      if (!this.isSynthPlaying || !this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const beat = Math.floor(step / 4) % 4; // 0, 1, 2, 3
      const subStep = step % 4; // 0, 1, 2, 3 (16th note position)

      // 1. Kick Drum
      if (genre.includes('drum & bass')) {
        // D&B Kick pattern: Beat 0 and Beat 2.5
        if (step % 16 === 0 || step % 16 === 10) {
          this.triggerKick(now, 160, 40, 0.25);
        }
      } else if (subStep === 0 && (beat === 0 || beat === 2 || (genre.includes('house') || genre.includes('synthwave')))) {
        // 4/4 Kick on every beat for House / Synthwave, or 1 and 3 for Acoustic/Ambient
        this.triggerKick(now, 140, 38, 0.3);
      }

      // 2. Snare / Clap
      if (genre.includes('drum & bass')) {
        // D&B Snare on beat 1 and 3 (half-time 2 and 4 at 170bpm)
        if (step % 16 === 4 || step % 16 === 12) {
          this.triggerSnare(now, 0.22);
        }
      } else if (subStep === 0 && (beat === 1 || beat === 3)) {
        if (!genre.includes('ambient')) {
          this.triggerSnare(now, 0.2);
        }
      }

      // 3. Hi-Hat / Shaker
      if (subStep === 2 || (subStep === 0 && beat % 2 === 1) || genre.includes('funk')) {
        this.triggerHiHat(now, 0.05, subStep === 2 ? 0.3 : 0.18);
      }

      // 4. Bassline
      if (step % 2 === 0) {
        const bassNoteIdx = (Math.floor(step / 8) + (step % 4 === 0 ? 0 : 2)) % scale.length;
        const semitones = scale[bassNoteIdx] - 12;
        const bassFreq = rootFreq * Math.pow(2, semitones / 12) / 2;
        this.triggerBass(now, bassFreq, stepDuration * 1.8, genre);
      }

      // 5. Chords / Pad (Swells every bar)
      if (step % 16 === 0) {
        const chordOffset = (Math.floor(step / 32) * 3) % scale.length;
        const chordNotes = [
          scale[chordOffset % scale.length],
          scale[(chordOffset + 2) % scale.length],
          scale[(chordOffset + 4) % scale.length]
        ];
        this.triggerChord(now, rootFreq, chordNotes, stepDuration * 15, genre);
      }

      // 6. Melodic Lead / Arpeggio
      if (step % 2 === 1 || (genre.includes('acoustic') && step % 2 === 0)) {
        const melIdx = (step * 3 + Math.floor(step / 4)) % scale.length;
        const semitones = scale[melIdx];
        const melFreq = rootFreq * Math.pow(2, semitones / 12);
        this.triggerMelody(now, melFreq, stepDuration * 1.2, genre);
      }

      step++;
    };

    // Run scheduler at high frequency (every 50ms)
    this.synthInterval = setInterval(scheduleTick, (stepDuration * 1000) / 2);

    // Track progression clock
    this.synthTimer = setInterval(() => {
      if (!this.isSynthPlaying) return;
      this.synthCurrentTime += 0.25;

      this.callbacks.onTimeUpdate?.(this.synthCurrentTime, this.synthDuration);

      if (this.synthCurrentTime >= this.synthDuration) {
        this.synthCurrentTime = 0;
        this.callbacks.onEnded?.();
      }
    }, 250);
  }

  private stopSynth() {
    this.isSynthPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.synthTimer) {
      clearInterval(this.synthTimer);
      this.synthTimer = null;
    }
    // Clean up active oscillators
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.activeOscillators = [];
  }

  // --- Instrument Synthesizers ---

  private triggerKick(time: number, startFreq: number, endFreq: number, dur: number) {
    if (!this.audioCtx || !this.synthGainNode) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + dur * 0.7);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.synthGainNode);

    osc.start(time);
    osc.stop(time + dur);
  }

  private triggerSnare(time: number, dur: number) {
    if (!this.audioCtx || !this.synthGainNode) return;

    // Noise buffer for snare snap
    const bufferSize = Math.floor(this.audioCtx.sampleRate * dur);
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGainNode);

    noise.start(time);
  }

  private triggerHiHat(time: number, dur: number, gainLevel: number) {
    if (!this.audioCtx || !this.synthGainNode) return;

    const bufferSize = Math.floor(this.audioCtx.sampleRate * dur);
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 8500;
    filter.Q.value = 2.0;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(gainLevel * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGainNode);

    noise.start(time);
  }

  private triggerBass(time: number, freq: number, dur: number, genre: string) {
    if (!this.audioCtx || !this.synthGainNode) return;

    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();

    if (genre.includes('synthwave') || genre.includes('cyber')) {
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, time);
      filter.frequency.exponentialRampToValueAtTime(140, time + dur);
    } else {
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.value = 280;
    }

    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGainNode);

    osc.start(time);
    osc.stop(time + dur);
  }

  private triggerChord(time: number, root: number, semitones: number[], dur: number, genre: string) {
    if (!this.audioCtx || !this.synthGainNode) return;

    const chordGain = this.audioCtx.createGain();
    chordGain.gain.setValueAtTime(0.01, time);
    chordGain.gain.linearRampToValueAtTime(0.18, time + dur * 0.3);
    chordGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    semitones.forEach((st) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const noteFreq = root * Math.pow(2, st / 12);
      osc.type = genre.includes('ambient') ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(noteFreq, time);

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(genre.includes('ambient') ? 1200 : 750, time);

      osc.connect(filter);
      filter.connect(chordGain);

      osc.start(time);
      osc.stop(time + dur);
    });

    chordGain.connect(this.synthGainNode);
  }

  private triggerMelody(time: number, freq: number, dur: number, genre: string) {
    if (!this.audioCtx || !this.synthGainNode) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = genre.includes('acoustic') ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, time);

    const level = genre.includes('ambient') ? 0.12 : 0.22;
    gain.gain.setValueAtTime(level, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.synthGainNode);

    osc.start(time);
    osc.stop(time + dur);
  }
}

export const audioEngine = new AudioEngine();


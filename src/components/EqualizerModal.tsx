import React from 'react';
import { X, Sliders, Volume2, Sparkles, RotateCcw, Check } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { EqualizerSettings } from '../types';

const PRESETS: Array<{ id: EqualizerSettings['preset']; label: string; desc: string }> = [
  { id: 'audiophile', label: 'Audiophile Reference', desc: 'Slight dynamic sparkle with neutral frequency linearity.' },
  { id: 'bass_boost', label: 'Deep Sub-Bass', desc: '+7dB sub-bass boost for electronic & dance masters.' },
  { id: 'acoustic', label: 'Acoustic & Classical', desc: 'Warm mids and articulate treble for organic instruments.' },
  { id: 'vocal', label: 'Vocal Clarity', desc: 'Enhanced 1kHz-3.2kHz presence for podcasts & vocal mixes.' },
  { id: 'electronic', label: 'Electronic & Synth', desc: 'V-shaped curve with punchy lows and crisp high-hats.' },
  { id: 'rock', label: 'Rock & Guitars', desc: 'Mid-range crunch and driving rhythm section punch.' },
  { id: 'flat', label: 'Bypass / Linear Flat', desc: 'True uncolored raw output with 0dB filter gain.' }
];

export const EqualizerModal: React.FC = () => {
  const { isEqualizerOpen, setIsEqualizerOpen, equalizer, updateEqualizer, applyEQPreset } = useMusic();

  if (!isEqualizerOpen) return null;

  const handleBandChange = (key: keyof EqualizerSettings, val: number) => {
    updateEqualizer({ [key]: val, preset: 'audiophile' });
  };

  const bands: Array<{ key: 'bass' | 'lowMid' | 'mid' | 'highMid' | 'treble'; label: string; freq: string }> = [
    { key: 'bass', label: 'Sub-Bass', freq: '80 Hz' },
    { key: 'lowMid', label: 'Low-Mid', freq: '320 Hz' },
    { key: 'mid', label: 'Midrange', freq: '1.0 kHz' },
    { key: 'highMid', label: 'Presence', freq: '3.2 kHz' },
    { key: 'treble', label: 'Air / Treble', freq: '12.0 kHz' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-[#0f0a08] border border-[#1a1512] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1512] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif italic text-white tracking-tight">5-Band Studio Equalizer</h3>
              <p className="text-xs text-[#8e8279]">Web Audio API Hardware-Calibrated DSP Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Enable/Bypass switch */}
            <button
              onClick={() => updateEqualizer({ enabled: !equalizer.enabled })}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                equalizer.enabled
                  ? 'bg-[#ff4e00]/15 text-[#ff4e00] border-[#ff4e00]/40'
                  : 'bg-[#140e0b] text-[#6d5f56] border-[#251d18]'
              }`}
            >
              {equalizer.enabled ? 'EQ Active' : 'EQ Bypassed'}
            </button>

            <button
              onClick={() => setIsEqualizerOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#140e0b] text-[#8e8279] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5-Band Slider Sliders */}
        <div className={`grid grid-cols-5 gap-3 sm:gap-6 py-4 bg-[#140e0b] rounded-2xl p-5 border border-[#1a1512] transition-opacity ${
          equalizer.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}>
          {bands.map((b) => (
            <div key={b.key} className="flex flex-col items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#ff4e00]">
                {equalizer[b.key] > 0 ? `+${equalizer[b.key]}` : equalizer[b.key]} dB
              </span>

              {/* Vertical Slider Wrapper */}
              <div className="h-40 flex items-center justify-center">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={equalizer[b.key]}
                  onChange={(e) => handleBandChange(b.key, Number(e.target.value))}
                  className="w-36 h-2 accent-[#ff4e00] rounded-lg cursor-pointer -rotate-90"
                />
              </div>

              <div className="text-center">
                <p className="text-[11px] font-bold text-[#e0d8d0]">{b.label}</p>
                <p className="text-[10px] font-mono text-[#6d5f56]">{b.freq}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Preamp Control */}
        <div className="flex items-center justify-between bg-[#140e0b] p-3 rounded-xl border border-[#1a1512]">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#8e8279]" />
            <span className="text-xs font-semibold text-[#e0d8d0]">Master Preamp Gain</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="-6"
              max="6"
              step="0.5"
              value={equalizer.preamp || 0}
              onChange={(e) => handleBandChange('preamp', Number(e.target.value))}
              className="w-32 accent-[#ff4e00]"
            />
            <span className="text-xs font-mono text-[#ff4e00] font-bold w-12 text-right">
              {(equalizer.preamp || 0) > 0 ? `+${equalizer.preamp}` : equalizer.preamp || 0} dB
            </span>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#6d5f56]">Acoustic Presets</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const isSelected = equalizer.preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => applyEQPreset(p.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-[#ff4e00]/15 border-[#ff4e00]/40 text-[#ff7300]'
                      : 'bg-[#140e0b]/60 border-[#1a1512] text-[#8e8279] hover:text-[#e0d8d0] hover:bg-[#140e0b]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#e0d8d0]">{p.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#ff4e00]" />}
                  </div>
                  <p className="text-[10px] text-[#6d5f56] line-clamp-1 mt-0.5">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

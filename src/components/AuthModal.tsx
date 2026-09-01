import React, { useState } from 'react';
import { X, User, Mail, Lock, ShieldCheck, Sparkles, Wifi, HardDrive, CheckCircle2, ArrowRight } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser, loginUser, loginDemoUser, logoutUser } = useMusic();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    await loginUser(email);
    setIsSubmitting(false);
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    await loginDemoUser();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-[#0f0a08] border border-[#1a1512] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1512] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white">
                {currentUser ? 'User Account & Cloud Sync' : 'Sign in to Resonance'}
              </h3>
              <p className="text-xs text-[#8e8279]">Cross-device seamless synchronization</p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-[#140e0b] text-[#8e8279] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUser ? (
          /* Profile Details */
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-[#140e0b] p-4 rounded-2xl border border-[#1a1512]">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover border border-[#251d18] shadow-md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{currentUser.name}</h4>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#ff4e00]/15 text-[#ff4e00] border border-[#ff4e00]/30">
                    HI-FI
                  </span>
                </div>
                <p className="text-xs text-[#8e8279] truncate">{currentUser.email}</p>
                <p className="text-[11px] text-[#6d5f56] mt-1">Tier: {currentUser.tier}</p>
              </div>
            </div>

            {/* Cloud Sync Features List */}
            <div className="bg-[#140e0b]/60 p-3.5 rounded-2xl border border-[#1a1512] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#e0d8d0]">
                <CheckCircle2 className="w-4 h-4 text-[#ff4e00] flex-shrink-0" />
                <span>Lossless 24-bit audio streaming enabled</span>
              </div>
              <div className="flex items-center gap-2 text-[#e0d8d0]">
                <CheckCircle2 className="w-4 h-4 text-[#ff4e00] flex-shrink-0" />
                <span>Automatic offline playlist and likes sync</span>
              </div>
              <div className="flex items-center gap-2 text-[#e0d8d0]">
                <CheckCircle2 className="w-4 h-4 text-[#ff4e00] flex-shrink-0" />
                <span>Unlimited Cloud Master locker uploads</span>
              </div>
            </div>

            <button
              onClick={logoutUser}
              className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-950/30 text-xs font-bold transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Sign In Form */
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Email Address</label>
                <div className="mt-1 relative">
                  <Mail className="w-4 h-4 text-[#6d5f56] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@audiophile.io"
                    className="w-full bg-[#0a0502] border border-[#1a1512] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-[#6d5f56] focus:outline-none focus:border-[#ff4e00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6d5f56]">Password</label>
                <div className="mt-1 relative">
                  <Lock className="w-4 h-4 text-[#6d5f56] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0502] border border-[#1a1512] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-[#6d5f56] focus:outline-none focus:border-[#ff4e00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ff4e00] to-[#ffd000] hover:brightness-110 text-[#0a0502] font-bold text-xs shadow-lg shadow-[#ff4e00]/20 transition-all active:scale-98 mt-2"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In / Register'}
              </button>
            </form>

            {/* Quick 1-Click Demo Account */}
            <div className="pt-2 border-t border-[#1a1512] text-center">
              <p className="text-[11px] text-[#6d5f56] mb-2">Want to try with pre-loaded cloud sync data?</p>
              <button
                onClick={handleDemoLogin}
                className="w-full py-2 px-3 rounded-xl bg-[#140e0b] hover:bg-[#1a1512] border border-[#251d18] text-xs font-semibold text-[#e0d8d0] hover:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ff4e00]" />
                <span>1-Click Demo Audiophile Account</span>
                <ArrowRight className="w-3 h-3 text-[#6d5f56]" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

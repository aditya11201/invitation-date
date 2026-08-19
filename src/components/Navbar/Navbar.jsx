import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Heart, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';

export default function Navbar({
  recipientName,
  musicEnabled,
  onToggleMusic,
  scrollProgress = 0,
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMusicClick = () => {
    sound.playClick();
    onToggleMusic();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 px-4 sm:px-8 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 transition-all duration-300">
      <div
        className={`mx-auto max-w-4xl flex items-center justify-between px-5 py-2.5 rounded-full transition-all duration-500 ${
          isScrolled
            ? 'bg-white/85 backdrop-blur-xl border border-white/90 shadow-glass'
            : 'bg-white/45 backdrop-blur-md border border-white/60 shadow-sm'
        }`}
      >
        {/* Minimal Branding */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-400 to-purple-400 flex items-center justify-center shadow-sm">
            <Heart className="w-3.5 h-3.5 text-white fill-white animate-pulse" />
          </div>
          <span className="font-display font-semibold text-slate-800 text-sm sm:text-base tracking-wide flex items-center gap-1.5">
            <span>For {recipientName || 'You'}</span>
            <span className="text-romantic-500 font-normal text-xs sm:text-sm">💗</span>
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleMusicClick}
            aria-label={musicEnabled ? 'Mute romantic music' : 'Play romantic music'}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-romantic-100/70 hover:bg-romantic-200/80 text-romantic-700 text-xs font-semibold tracking-wide border border-romantic-200 transition-all duration-200 active:scale-95 cursor-pointer min-h-[44px]"
          >
            {musicEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-romantic-600 animate-pulse" />
                <span className="hidden sm:inline text-xs">Music On</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline text-xs text-slate-600">Music Off</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Thin Cinematic Journey Progress Bar */}
      <div className="mx-auto max-w-4xl mt-1.5 px-3">
        <div className="h-[2.5px] w-full bg-pink-200/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
          />
        </div>
      </div>
    </header>
  );
}

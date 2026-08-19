import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';

export default function Preloader({ onStart, recipientName }) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 10;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        setIsReady(true);
        clearInterval(interval);
      } else {
        setProgress(current);
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    sound.playPop(1.2);
    sound.playSparkle();
    setIsFading(true);
    setTimeout(() => {
      onStart();
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-romantic-50 via-romantic-100 to-lavender-100 px-6 transition-opacity duration-700 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Soft Glow Orbs */}
      <div className="absolute w-72 h-72 rounded-full bg-romantic-300/30 blur-3xl animate-pulse" />
      <div className="absolute w-64 h-64 rounded-full bg-lavender-300/30 blur-3xl translate-x-20 -translate-y-16 animate-pulse delay-700" />

      {/* Floating 3D Heart Visual */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute inset-0 scale-150 rounded-full bg-gradient-to-r from-pink-400/30 to-purple-400/30 blur-xl animate-pulseGlow" />
        
        <div className="relative animate-floatSlow text-romantic-500 drop-shadow-[0_15px_25px_rgba(236,72,153,0.4)]">
          <svg className="w-24 h-24 sm:w-28 sm:h-28" viewBox="0 0 24 24" fill="url(#preloaderHeart)">
            <defs>
              <linearGradient id="preloaderHeart" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>

          {/* Mini Sparkles */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          <Heart className="absolute -bottom-1 -left-2 w-5 h-5 text-pink-300 fill-pink-300 animate-bounce" />
        </div>
      </div>

      {/* Title / Status */}
      <h1 className="text-center font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 mb-2">
        Preparing something special for you... 💗
      </h1>
      <p className="text-sm sm:text-base font-handwriting text-2xl text-romantic-600 mb-6">
        for {recipientName || "my beautiful girl"}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-xs bg-white/60 backdrop-blur-md rounded-full p-1 border border-white/80 shadow-sm mb-6">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-pink-400 via-rose-500 to-purple-500 transition-all duration-300 shadow-glow-pink"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-xs font-semibold text-slate-500 tabular-nums tracking-wider mb-6">
        {progress}%
      </span>

      {/* Enter Button (Unlocked at 100%) */}
      {isReady && (
        <button
          onClick={handleEnter}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-glow-pink hover:shadow-glow-lavender hover:scale-105 active:scale-95 transition-all duration-300 animate-heartPop focus:outline-none focus:ring-4 focus:ring-pink-300 cursor-pointer min-h-[44px]"
        >
          <span className="relative z-10 font-medium tracking-wide">Open My Invitation 💌</span>
          <Heart className="w-5 h-5 fill-white transition-transform group-hover:scale-125" />
        </button>
      )}
    </div>
  );
}

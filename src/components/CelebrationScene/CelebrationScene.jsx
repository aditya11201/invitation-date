import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { sound } from '../../utils/sound';

export default function CelebrationScene({ onContinue }) {
  return (
    <div className="relative my-12 py-8 flex flex-col items-center justify-center text-center px-4 animate-heartPop select-none">
      {/* Radiant Multilayer Ambient Glow */}
      <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-pink-300/40 via-purple-300/30 to-rose-300/40 blur-3xl pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-pink-400/20 via-rose-300/20 to-purple-400/20 blur-2xl animate-pulse pointer-events-none" />

      {/* Floating Badge */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-pink-200 shadow-glass text-romantic-700 text-sm font-bold tracking-wide mb-4">
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span>BEST DECISION EVER! 🎉💗</span>
      </div>

      <h3 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mb-3" style={{ textWrap: 'balance' }}>
        Now let’s plan our special day together! ✨
      </h3>
      <p className="font-handwriting text-2xl sm:text-3xl text-romantic-600 mb-6">
        Next step: Choose where we're going...
      </p>

      {/* Continue CTA */}
      <button
        onClick={() => {
          sound.playClick();
          onContinue();
        }}
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-glow-pink hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer min-h-[44px]"
      >
        <span>Pick Our Destination</span>
        <Heart className="w-4 h-4 fill-white" />
      </button>
    </div>
  );
}

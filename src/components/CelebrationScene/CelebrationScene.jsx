import React from 'react';
import { Heart } from 'lucide-react';
import { sound } from '../../utils/sound';

export default function CelebrationScene({ onContinue }) {
  return (
    <div className="relative pt-2 pb-10 border-b border-burgundy-200/60 flex flex-col items-center justify-center text-center space-y-5 animate-heartPop">
      {/* Ribbon tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy-100/80 border border-burgundy-200 text-burgundy-900 text-[11px] font-bold tracking-wider uppercase">
        <span className="text-burgundy-600">✦</span>
        <span>She said YES! Best decision ever 🎉</span>
        <span className="text-burgundy-600">✦</span>
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-burgundy-900 leading-tight">
        Now let's plan our special day together! ✨
      </h2>
      <p className="font-handwritingPaper text-2xl sm:text-3xl text-burgundy-600 font-bold">
        Next step: Choose where we're going...
      </p>

      {/* Continue CTA — reference RSVP button treatment */}
      <button
        onClick={() => {
          sound.playClick();
          onContinue();
        }}
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-burgundy-900 hover:bg-burgundy-800 text-amber-100 font-bold text-sm rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition duration-200 border border-gold-300 cursor-pointer min-h-[44px]"
      >
        <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
        <span>Pick Our Destination</span>
      </button>
    </div>
  );
}

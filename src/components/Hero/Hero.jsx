import React, { useState, useEffect } from 'react';
import { ChevronDown, Heart } from 'lucide-react';
import { sound } from '../../utils/sound';

export default function Hero({ config, onScrollDown }) {
  const greeting = config.hero?.greeting || "Hellooo my beautiful Sassy, my cutieeeeeee 💗";
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Handwriting reveal effect
  useEffect(() => {
    let index = 0;
    const speed = 45; // ms per character
    setDisplayedText('');
    setIsTypingDone(false);

    const timer = setInterval(() => {
      if (index < greeting.length) {
        setDisplayedText(greeting.slice(0, index + 1));
        index++;
      } else {
        setIsTypingDone(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [greeting]);

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 pt-[calc(5rem+env(safe-area-inset-top,0px))] pb-12 select-none">
      {/* Stationery double-rule frame */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 sm:inset-5 rounded-[2px] border border-romantic-200/60" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-[17px] sm:inset-[26px] rounded-[2px] border border-romantic-200/35" />

      {/* Asymmetric editorial ornaments */}
      <div aria-hidden="true" className="pointer-events-none absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-3">
        <span className="w-px h-20 bg-gradient-to-b from-transparent to-romantic-300/70" />
        <Heart className="w-3 h-3 text-romantic-300 fill-romantic-300/70" />
        <span className="w-px h-20 bg-gradient-to-t from-transparent to-romantic-300/70" />
      </div>
      <Heart aria-hidden="true" strokeWidth={1} className="pointer-events-none absolute right-4 sm:right-10 top-[15%] w-36 h-36 sm:w-48 sm:h-48 text-romantic-200/50 rotate-12 hidden sm:block" />

      {/* Kicker — thin rules flanking letterspaced small caps */}
      <div className="relative inline-flex items-center gap-3 sm:gap-4 mb-10 sm:mb-14 animate-floatSlow">
        <span aria-hidden="true" className="h-px w-6 sm:w-12 bg-romantic-300/70" />
        <span aria-hidden="true" className="w-1.5 h-1.5 rotate-45 bg-rose-400/70" />
        <span className="px-1 text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-[0.26em] sm:tracking-[0.32em] text-romantic-600">
          {config.hero?.badge || "A Special Delivery Just For You ✨"}
        </span>
        <span aria-hidden="true" className="w-1.5 h-1.5 rotate-45 bg-rose-400/70" />
        <span aria-hidden="true" className="h-px w-6 sm:w-12 bg-romantic-300/70" />
      </div>

      {/* Main Handwriting Greeting */}
      <div className="relative max-w-2xl mx-auto my-2 min-h-[140px] sm:min-h-[180px] flex items-center justify-center">
        <h1
          className={`font-handwriting text-4xl sm:text-6xl md:text-7xl font-bold leading-tight transition-all duration-700 ${
            isTypingDone
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-romantic-500 via-rose-600 to-lavender-600 drop-shadow-[0_4px_16px_rgba(163,78,93,0.35)] animate-float'
              : 'text-romantic-800'
          }`}
          style={{ textWrap: 'balance' }}
        >
          {displayedText}
          {!isTypingDone && (
            <span className="inline-block w-[2px] h-10 sm:h-14 ml-1.5 rounded-full bg-rose-500 animate-pulse align-middle" />
          )}
        </h1>
      </div>

      {/* Subtitle */}
      <p
        className={`relative max-w-md mx-auto font-display italic text-lg sm:text-xl text-romantic-700/80 mt-5 transition-all duration-1000 ${
          isTypingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ textWrap: 'pretty' }}
      >
        {config.hero?.subtitle || "I made this little universe just for you..."}
      </p>

      {/* Keyboard-Accessible Scroll Indicator Button */}
      <button
        type="button"
        aria-label={config.hero?.scrollPrompt || "Scroll down to open your letter"}
        className={`group relative mt-12 sm:mt-16 inline-flex flex-col items-center gap-3 cursor-pointer transition-all duration-1000 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-romantic-50 rounded-lg px-4 py-2 min-h-[44px] ${
          isTypingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
        onClick={() => {
          sound.playPaperRustle();
          onScrollDown();
        }}
      >
        <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-romantic-600 border-b border-romantic-300/60 pb-1.5 transition-colors duration-300 group-hover:text-rose-600 group-hover:border-rose-400">
          {config.hero?.scrollPrompt || "Scroll down to open your letter"}
        </span>
        <span className="w-10 h-10 rounded-full border border-romantic-300/80 bg-ivory-50/70 flex items-center justify-center text-romantic-500 shadow-sm transition-all duration-300 group-hover:border-rose-400 group-hover:text-rose-600 group-hover:shadow-glow-pink group-active:scale-[0.96] min-h-[40px] min-w-[40px]">
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </span>
      </button>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
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
    <section className="relative pt-6 pb-10 border-b border-burgundy-200/60 text-center space-y-5 select-none">
      {/* Main Handwriting Greeting */}
      <div className="max-w-2xl mx-auto min-h-[120px] sm:min-h-[160px] flex items-center justify-center">
        <h1
          className={`font-handwritingPaper text-4xl sm:text-6xl font-bold leading-tight transition-colors duration-700 ${
            isTypingDone ? 'text-burgundy-900' : 'text-ink/50'
          }`}
          style={{ textWrap: 'balance' }}
        >
          {displayedText}
          {!isTypingDone && (
            <span className="inline-block w-[2px] h-10 sm:h-14 ml-1.5 rounded-full bg-burgundy-400 animate-pulse align-middle" />
          )}
        </h1>
      </div>

      {/* Subtitle */}
      <p
        className={`max-w-md mx-auto font-serif italic text-base sm:text-lg text-ink/80 transition-opacity duration-1000 ${
          isTypingDone ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ textWrap: 'pretty' }}
      >
        {config.hero?.subtitle || "I made this little universe just for you..."}
      </p>

      {/* Keyboard-Accessible Scroll Indicator Button */}
      <button
        type="button"
        aria-label={config.hero?.scrollPrompt || "Scroll down to open your letter"}
        className={`group relative inline-flex flex-col items-center gap-3 cursor-pointer transition-all duration-1000 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg px-4 py-2 min-h-[44px] ${
          isTypingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
        onClick={() => {
          sound.playPaperRustle();
          onScrollDown();
        }}
      >
        <span className="text-xs font-mono tracking-widest text-burgundy-800 uppercase font-bold">
          {config.hero?.scrollPrompt || "Scroll down to open your letter"}
        </span>
        <span className="w-10 h-10 rounded-full bg-burgundy-900 text-amber-100 flex items-center justify-center shadow-md group-hover:bg-burgundy-800 group-hover:translate-y-1 transition">
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </span>
      </button>
    </section>
  );
}

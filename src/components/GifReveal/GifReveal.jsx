import React, { useState, useRef } from 'react';
import { Sparkles, Heart, Ticket, ArrowRight } from 'lucide-react';
import { SurpriseVisual } from '../PlacePreviews/SurpriseVisual';
import { sound } from '../../utils/sound';
import { formatLocalDateString } from '../../utils/date';

export default function GifReveal({
  config,
  selectedPlace,
  selectedDate,
  onProceedToTicket,
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  // Parallax tilt on desktop
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 15, y: -y * 15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Format date nicely using local timezone
  const dateFormatted = formatLocalDateString(selectedDate, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleViewTicket = () => {
    sound.playSparkle();
    onProceedToTicket();
  };

  return (
    <section
      id="gif-reveal-section"
      className="relative min-h-[90vh] py-16 px-4 sm:px-6 flex flex-col items-center justify-center text-center select-none"
    >
      {/* Background glow orb */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-pink-300/30 via-purple-300/30 to-rose-200/30 blur-3xl pointer-events-none" />

      {/* Floating Badge */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-pink-200 shadow-sm text-romantic-600 text-xs font-semibold uppercase tracking-wider mb-6 animate-floatSlow">
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '5s' }} />
        <span>Official Date Confirmed 💌</span>
      </div>

      {/* Primary & Secondary Copy */}
      <h2 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 mb-3" style={{ textWrap: 'balance' }}>
        {config.surprise?.title || "Yay, it's a date! 💗"}
      </h2>
      <p className="font-handwriting text-2xl sm:text-3xl text-romantic-600 max-w-lg mx-auto mb-8" style={{ textWrap: 'pretty' }}>
        {config.surprise?.subtitle || "Can't wait to spend this cute little day with you 🥹✨"}
      </p>

      {/* Floating 3D Surprise Card with Parallax Tilt */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-md p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/90 shadow-2xl transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
          boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.35)',
        }}
      >
        <SurpriseVisual
          gifSrc={config.surprise?.gif}
          title={config.surprise?.title}
        />

        {/* Date & Destination Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-romantic-50/80 border border-pink-100 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-romantic-600 uppercase tracking-wider">
            {selectedPlace || "Our Romantic Date"}
          </span>
          <span className="text-sm font-semibold text-slate-800 mt-0.5">
            {dateFormatted || "Coming Soon 💗"}
          </span>
        </div>
      </div>

      {/* Button to view Final Ticket */}
      <div className="mt-10">
        <button
          onClick={handleViewTicket}
          className="group inline-flex items-center gap-2.5 px-9 py-4 rounded-full font-bold text-white text-base bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-glow-pink hover:shadow-glow-lavender hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer min-h-[44px]"
        >
          <Ticket className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          <span>Claim Our Date Ticket 🎟️</span>
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}

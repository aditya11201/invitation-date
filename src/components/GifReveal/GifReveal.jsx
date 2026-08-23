import React, { useState, useRef } from 'react';
import { Sparkles, Ticket, ArrowRight } from 'lucide-react';
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
      className="relative py-10 border-b border-burgundy-200/60 flex flex-col items-center text-center space-y-5 select-none"
    >
      {/* Ribbon Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy-100/80 border border-burgundy-200 text-burgundy-900 text-[11px] font-bold tracking-wider uppercase mb-2 animate-floatSlow">
        <Sparkles className="w-3.5 h-3.5 text-burgundy-600 animate-spin" style={{ animationDuration: '5s' }} />
        <span>{config.ui.surpriseUi.badge}</span>
      </div>

      {/* Primary & Secondary Copy */}
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-burgundy-900 mb-1" style={{ textWrap: 'balance' }}>
        {config.surprise.title}
      </h2>
      <p className="font-handwritingPaper text-2xl sm:text-3xl text-burgundy-600 font-bold max-w-lg mx-auto mb-6" style={{ textWrap: 'pretty' }}>
        {config.surprise.subtitle}
      </p>

      {/* Polaroid Surprise Card with Parallax Tilt */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-md p-4 pb-6 bg-white rounded shadow-md border border-gray-200 transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="washi-tape absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 transform rotate-1 z-10" aria-hidden="true" />

        <SurpriseVisual
          gifSrc={config.surprise?.gif}
          title={config.surprise?.title}
        />

        {/* Date & Destination Banner */}
        <div className="mt-4 p-3 rounded-lg bg-burgundy-50/80 border border-burgundy-200 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-burgundy-600 uppercase tracking-wider">
            {selectedPlace || "Our Romantic Date"}
          </span>
          <span className="text-sm font-semibold text-ink mt-0.5">
            {dateFormatted || "Coming Soon 💗"}
          </span>
        </div>
      </div>

      {/* Button to view Final Ticket */}
      <div className="mt-10">
        <button
          onClick={handleViewTicket}
          className="group inline-flex items-center gap-2 px-8 py-3.5 bg-burgundy-900 hover:bg-burgundy-800 text-amber-100 font-bold text-sm rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition duration-200 border border-gold-300 cursor-pointer min-h-[44px]"
        >
          <Ticket className="w-4 h-4 text-amber-100 group-hover:rotate-12 transition-transform" />
          <span>{config.ui.surpriseUi.claimButton}</span>
          <ArrowRight className="w-4 h-4 text-amber-100 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}

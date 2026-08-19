import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Sparkles, Check } from 'lucide-react';
import { PlaceVisual } from '../PlacePreviews/PlaceVisual';
import { sound } from '../../utils/sound';

export default function LocationPicker({
  places = [],
  selectedPlace,
  onSelectPlace,
  onConfirmPlace,
  isConfirmed = false,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const isInteractionDisabled = isConfirmed;
  const currentPlace = places[activeIndex] || places[0];

  const handleNext = () => {
    if (isInteractionDisabled) return;
    sound.playClick();
    setActiveIndex((prev) => (prev + 1) % places.length);
  };

  const handlePrev = () => {
    if (isInteractionDisabled) return;
    sound.playClick();
    setActiveIndex((prev) => (prev - 1 + places.length) % places.length);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    if (isInteractionDisabled) return;
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (isInteractionDisabled || touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  const handleChooseDestination = () => {
    if (isInteractionDisabled) return;
    sound.playPop(1.3);
    sound.playSparkle();
    onSelectPlace(currentPlace.title);
    setTimeout(() => {
      onConfirmPlace();
    }, 400);
  };

  return (
    <section
      id="destination-picker-section"
      className="relative min-h-[90vh] py-16 px-4 sm:px-6 flex flex-col items-center justify-center select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-200/40 via-purple-200/30 to-indigo-200/30 blur-3xl" />
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-pink-200 shadow-sm text-romantic-600 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Step 1: The Destination 📍</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 mb-3" style={{ textWrap: 'balance' }}>
          Where should we go? 💗
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-medium">
          {isConfirmed ? 'Destination confirmed!' : 'Swipe or tap the arrows to explore our options'}
        </p>
      </div>

      {/* 3D Carousel Stage */}
      <div className="relative w-full max-w-4xl h-[420px] sm:h-[460px] flex items-center justify-center perspective-[1200px] overflow-hidden">
        {places.map((place, idx) => {
          let offset = idx - activeIndex;
          if (offset < -Math.floor(places.length / 2)) offset += places.length;
          if (offset > Math.floor(places.length / 2)) offset -= places.length;

          const isActive = offset === 0;
          const isVisible = Math.abs(offset) <= 2;

          if (!isVisible) return null;

          const translateX = offset * (window.innerWidth < 640 ? 110 : 260);
          const translateZ = isActive ? 0 : -140 - Math.abs(offset) * 60;
          const rotateY = offset * -18;
          const scale = isActive ? 1 : 0.82;
          const opacity = isActive ? 1 : 0.45;

          return (
            <div
              key={place.id}
              onClick={() => {
                if (!isActive && !isInteractionDisabled) {
                  sound.playClick();
                  setActiveIndex(idx);
                }
              }}
              className={`absolute w-[290px] sm:w-[360px] h-[380px] sm:h-[420px] rounded-3xl p-3 bg-white/80 backdrop-blur-xl border border-white/90 transition-all duration-500 flex flex-col justify-between ${
                isInteractionDisabled && !isActive ? 'pointer-events-none opacity-20' : 'cursor-pointer'
              } ${
                isActive
                  ? 'shadow-2xl ring-2 ring-pink-400/50 z-30'
                  : 'shadow-md z-10 filter blur-[0.5px]'
              }`}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: opacity,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Media Card Header Preview */}
              <div className="relative w-full h-[220px] sm:h-[250px] rounded-2xl overflow-hidden shadow-inner">
                <PlaceVisual place={place} isActive={isActive} />

                {/* Floating Emoji Badge */}
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-white flex items-center justify-center text-xl">
                  {place.emoji}
                </div>
              </div>

              {/* Destination Card Body */}
              <div className="p-2 sm:p-3 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-800 tracking-tight">
                    {place.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-snug" style={{ textWrap: 'pretty' }}>
                    {place.copy}
                  </p>
                </div>

                {/* Highlights Tags */}
                {isActive && place.highlights && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {place.highlights.map((h, i) => (
                      <span key={i} className="text-[10px] font-semibold text-romantic-700 bg-romantic-50 px-2 py-0.5 rounded-full border border-romantic-200">
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Dots & Arrow Controls */}
      <div className="flex items-center gap-6 mt-6 z-20">
        <button
          onClick={handlePrev}
          disabled={isInteractionDisabled}
          aria-label="Previous destination"
          className={`w-11 h-11 rounded-full border shadow-md flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
            isInteractionDisabled
              ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-white/90 hover:bg-white text-slate-700 border-slate-200 active:scale-95 cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="flex items-center gap-2">
          {places.map((_, i) => (
            <button
              key={i}
              disabled={isInteractionDisabled}
              onClick={() => {
                if (isInteractionDisabled) return;
                sound.playClick();
                setActiveIndex(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isInteractionDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${
                i === activeIndex ? 'w-8 bg-romantic-500 shadow-glow-pink' : 'w-2.5 bg-slate-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={isInteractionDisabled}
          aria-label="Next destination"
          className={`w-11 h-11 rounded-full border shadow-md flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
            isInteractionDisabled
              ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-white/90 hover:bg-white text-slate-700 border-slate-200 active:scale-95 cursor-pointer'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* CTA Button to Confirm Destination */}
      <div className="mt-8 z-20">
        {isConfirmed ? (
          <div className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-base shadow-sm animate-heartPop">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>Destination Locked: {selectedPlace || currentPlace.title} 💗</span>
          </div>
        ) : (
          <button
            onClick={handleChooseDestination}
            className="group inline-flex items-center gap-2.5 px-9 py-4 rounded-full font-bold text-white text-base bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-glow-pink hover:shadow-glow-lavender hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer min-h-[44px]"
          >
            <Heart className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
            <span>Choose this date 💗</span>
          </button>
        )}
      </div>
    </section>
  );
}

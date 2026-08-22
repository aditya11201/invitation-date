import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Check } from 'lucide-react';
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
      className="relative py-10 border-b border-burgundy-200/60 space-y-8"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      {/* Header */}
      <div className="text-center space-y-2 relative z-10">
        <span className="text-xs font-mono tracking-widest text-burgundy-600 uppercase font-bold">STEP 01 • THE DESTINATION</span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-burgundy-900">Where should we go? 💗</h2>
        <p className="text-xs sm:text-sm text-ink/70">
          {isConfirmed ? 'Destination confirmed!' : 'Swipe or tap the arrows to explore our options'}
        </p>
      </div>

      {/* 3D Carousel Stage */}
      <div className="relative w-full h-[420px] sm:h-[460px] flex items-center justify-center perspective-[1200px] overflow-hidden">
        {places.map((place, idx) => {
          let offset = idx - activeIndex;
          if (offset < -Math.floor(places.length / 2)) offset += places.length;
          if (offset > Math.floor(places.length / 2)) offset -= places.length;

          const isActive = offset === 0;
          const isVisible = Math.abs(offset) <= 2;

          if (!isVisible) return null;

          const translateX = offset * (window.innerWidth < 640 ? 90 : 170);
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
              className={`absolute w-[260px] sm:w-[320px] h-[360px] sm:h-[400px] rounded-xl p-3 bg-white border border-burgundy-200/80 transition-all duration-500 flex flex-col justify-between circled-option ${
                isInteractionDisabled && !isActive ? 'pointer-events-none opacity-20' : 'cursor-pointer'
              } ${
                isActive
                  ? 'selected shadow-lg z-30'
                  : 'z-10 opacity-45 blur-[0.5px]'
              }`}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: opacity,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Media Card Header Preview */}
              <div className="relative w-full h-[190px] sm:h-[210px] rounded-lg overflow-hidden shadow-inner">
                <PlaceVisual place={place} isActive={isActive} />

                {/* Floating Emoji Badge */}
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-md border border-burgundy-200 flex items-center justify-center text-xl">
                  {place.emoji}
                </div>
              </div>

              {/* Destination Card Body */}
              <div className="p-2 sm:p-3 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-serif font-bold text-lg text-burgundy-900 tracking-tight">
                    {place.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-ink/70 font-medium mt-1 leading-snug" style={{ textWrap: 'pretty' }}>
                    {place.copy}
                  </p>
                </div>

                {/* Highlights Tags */}
                {isActive && place.highlights && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {place.highlights.map((h, i) => (
                      <span key={i} className="text-[10px] font-semibold text-burgundy-800 bg-burgundy-50 px-2 py-0.5 rounded-full border border-burgundy-200">
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
              ? 'opacity-40 border-burgundy-100 text-burgundy-200 cursor-not-allowed'
              : 'bg-white hover:bg-burgundy-50 text-burgundy-800 border-burgundy-200 active:scale-95 cursor-pointer'
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
                i === activeIndex ? 'w-8 bg-burgundy-600' : 'w-2.5 bg-burgundy-200'
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
              ? 'opacity-40 border-burgundy-100 text-burgundy-200 cursor-not-allowed'
              : 'bg-white hover:bg-burgundy-50 text-burgundy-800 border-burgundy-200 active:scale-95 cursor-pointer'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* CTA Button to Confirm Destination */}
      <div className="mt-8 z-20">
        {isConfirmed ? (
          <div className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-burgundy-50 border border-burgundy-200 text-burgundy-800 font-bold text-base shadow-sm animate-heartPop">
            <Check className="w-5 h-5 text-burgundy-600" />
            <span>Destination Locked: {selectedPlace || currentPlace.title} 💗</span>
          </div>
        ) : (
          <button
            onClick={handleChooseDestination}
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-burgundy-900 hover:bg-burgundy-800 text-amber-100 font-bold text-sm rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition duration-200 border border-gold-300 cursor-pointer min-h-[44px]"
          >
            <Heart className="w-4 h-4 fill-rose-400 text-rose-400 group-hover:scale-125 transition-transform" />
            <span>Choose this date 💗</span>
          </button>
        )}
      </div>
    </section>
  );
}

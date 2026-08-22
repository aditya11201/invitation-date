import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Sparkles, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { PlaceVisual } from '../PlacePreviews/PlaceVisual';
import BookCard from './BookCard';
import { sound } from '../../utils/sound';
import { resolveAssetUrl } from '../../utils/assets';

const COVER_OPEN = -158;
const COVER_NEAR = -14;
const COVER_CLOSED = 0;

const getCircularOffset = (index, activeIndex, length) => {
  let offset = index - activeIndex;
  const midpoint = Math.floor(length / 2);
  if (offset > midpoint) offset -= length;
  if (offset < -midpoint) offset += length;
  return offset;
};

export default function LocationPicker({
  places = [],
  selectedPlace,
  onSelectPlace,
  onConfirmPlace,
  isConfirmed = false,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeIndexRef = useRef(0);
  const prevActiveIndexRef = useRef(0);
  const updateRef = useRef(null);

  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const coverRefs = useRef([]);
  const backdropRefs = useRef([]);
  const confirmTimeoutRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);

  // Preload all destination images on mount so no decode stall happens during switch
  useEffect(() => {
    places.forEach((place) => {
      if (place.media?.src) {
        const img = new Image();
        img.src = resolveAssetUrl(place.media.src);
        if (img.decode) {
          img.decode().catch(() => {});
        }
      }
    });
  }, [places]);

  useEffect(() => () => clearTimeout(confirmTimeoutRef.current), []);

  // Mount-once GSAP context & matchMedia
  useLayoutEffect(() => {
    if (places.length === 0) return undefined;

    let mm;
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia();

      mm.add(
        {
          all: 'all',
          mobile: '(max-width: 639px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        ({ conditions }) => {
          const isReduceMotion = conditions.reduceMotion;
          const isMobile = conditions.mobile;
          const cardDuration = isReduceMotion ? 0.12 : 0.75;
          const bgDuration = isReduceMotion ? 0.12 : 0.8;

          const update = (isInitial = false) => {
            const current = activeIndexRef.current;
            const previous = prevActiveIndexRef.current;

            // 1. Persistent background crossfade:
            // Incoming layer fades to 1 over ~0.8s ('power2.out') on top (zIndex: 2).
            // Outgoing previous layer stays fully visible beneath it (zIndex: 1) and fades to 0 with delay.
            // Other idle layers remain at 0 (zIndex: 0).
            places.forEach((_, index) => {
              const el = backdropRefs.current[index];
              if (!el) return;
              const isTarget = index === current;
              const wasPrevious = index === previous;

              if (isInitial) {
                gsap.set(el, {
                  zIndex: isTarget ? 2 : 1,
                  opacity: isTarget ? 1 : 0,
                });
                return;
              }

              if (isTarget) {
                gsap.set(el, { zIndex: 2 });
                gsap.to(el, {
                  opacity: 1,
                  duration: bgDuration,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              } else if (wasPrevious) {
                gsap.set(el, { zIndex: 1 });
                // Hold fully visible while the incoming layer rises, then fade fast
                // so stacked coverage never drops below ~99% mid-transition.
                gsap.to(el, {
                  opacity: 0,
                  duration: bgDuration * 0.55,
                  delay: bgDuration * 0.55,
                  ease: 'power2.in',
                  overwrite: 'auto',
                });
              } else {
                gsap.set(el, { zIndex: 0 });
                gsap.to(el, {
                  opacity: 0,
                  duration: bgDuration,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              }
            });

            // 2. 3D Card Depth Tweens:
            cardRefs.current.forEach((card, index) => {
              if (!card) return;
              const offset = getCircularOffset(index, current, places.length);
              const isCenter = offset === 0;
              const absOffset = Math.abs(offset);

              // Set stacking order upfront to prevent mid-tween zIndex pops
              gsap.set(card, {
                zIndex: isCenter ? 30 : Math.max(1, 20 - absOffset * 5),
              });

              const cardProps = {
                xPercent: -50,
                yPercent: -50,
                x: offset * (isMobile ? 200 : 280),
                scale: isCenter ? 1.05 : Math.max(0.72, 1 - absOffset * 0.2),
                opacity: Math.max(0.15, 1 - absOffset * 0.38),
                overwrite: 'auto',
              };

              if (isReduceMotion) {
                cardProps.z = 0;
                cardProps.rotateY = 0;
                cardProps.duration = 0.12;
                cardProps.ease = 'none';
              } else {
                cardProps.z = isCenter ? 90 : -absOffset * 150;
                cardProps.rotateY = offset * -28;
                cardProps.duration = cardDuration;
                cardProps.ease = 'power3.out';
              }

              if (isInitial) {
                gsap.set(card, cardProps);
              } else {
                gsap.to(card, cardProps);
              }

              // 3. Book Cover Flap Tweens:
              if (coverRefs.current[index]) {
                const coverEl = coverRefs.current[index];
                if (isReduceMotion) {
                  const coverProps = {
                    rotationY: 0,
                    opacity: isCenter ? 0 : 1,
                    scale: isCenter ? 0.98 : 1,
                    duration: cardDuration,
                    ease: 'none',
                    overwrite: 'auto',
                  };
                  if (isInitial) {
                    gsap.set(coverEl, coverProps);
                  } else {
                    gsap.to(coverEl, coverProps);
                  }
                } else {
                  const targetAngle = isCenter ? COVER_OPEN : absOffset === 1 ? COVER_NEAR : COVER_CLOSED;
                  const coverDuration = isCenter ? 1.15 : absOffset === 1 ? 0.8 : 0.6;
                  const coverDelay = isCenter ? 0.18 : 0;
                  if (isInitial) {
                    gsap.set(coverEl, { rotationY: targetAngle });
                  } else {
                    gsap.to(coverEl, {
                      rotationY: targetAngle,
                      duration: coverDuration,
                      delay: coverDelay,
                      ease: 'power3.inOut',
                      overwrite: 'auto',
                    });
                  }
                }
              }
            });
          };

          updateRef.current = update;
          update(true);
        },
      );
    }, rootRef);

    return () => {
      mm?.revert();
      ctx.revert();
    };
  }, [places.length]);

  // Trigger update on activeIndex change without recreating GSAP context
  useLayoutEffect(() => {
    prevActiveIndexRef.current = activeIndexRef.current;
    activeIndexRef.current = activeIndex;
    updateRef.current?.(false);
  }, [activeIndex]);

  if (places.length === 0) return null;

  const currentPlace = places[activeIndex] || places[0];

  const goTo = (nextIndex) => {
    if (isConfirmed || places.length < 2) return;
    const normalizedIndex = ((nextIndex % places.length) + places.length) % places.length;
    if (normalizedIndex === activeIndex) return;
    sound.playClick();
    setActiveIndex(normalizedIndex);
  };

  const handleNext = () => goTo(activeIndex + 1);
  const handlePrev = () => goTo(activeIndex - 1);

  const handleTouchStart = (event) => {
    if (isConfirmed) return;
    const touch = event.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (event) => {
    if (!touchStart || isConfirmed) return;
    const touch = event.changedTouches[0];
    const dx = touchStart.x - touch.clientX;
    const dy = touchStart.y - touch.clientY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      dx > 0 ? handleNext() : handlePrev();
    }
    setTouchStart(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') handleNext();
    if (event.key === 'ArrowLeft') handlePrev();
  };

  const handleChooseDestination = () => {
    if (isConfirmed) return;
    sound.playPop(1.3);
    sound.playSparkle();
    onSelectPlace(currentPlace.title);
    clearTimeout(confirmTimeoutRef.current);
    confirmTimeoutRef.current = setTimeout(onConfirmPlace, 400);
  };

  return (
    <section
      ref={rootRef}
      id="destination-picker-section"
      role="region"
      aria-label="Date destination selector"
      tabIndex={0}
      aria-roledescription="carousel"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="destination-book-selector relative flex min-h-[100svh] h-[100svh] w-screen max-w-[100vw] flex-col items-center justify-between overflow-hidden"
    >
      {/* Persistent Full-bleed Background Layers with continuous GSAP crossfade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {places.map((place, index) => (
          <div
            key={place.id}
            ref={(node) => {
              backdropRefs.current[index] = node;
            }}
            className="absolute inset-0 h-full w-full pointer-events-none"
            style={{
              '--place-color': place.themeColor,
            }}
          >
            <PlaceVisual place={place} isActive={index === activeIndex} />
            <div className="destination-book-selector__scrim absolute inset-0" />
          </div>
        ))}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {currentPlace.title}
      </p>

      {/* Top Header Overlay */}
      <header className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto px-4 pt-3 sm:pt-5">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 shadow-sm backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Step 1: The Destination 📍</span>
        </div>
        <h2
          className="mb-1.5 font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]"
          style={{ textWrap: 'balance' }}
        >
          Where should we go? <span className="inline-block animate-bounce">💗</span>
        </h2>
        <p className="text-xs sm:text-sm font-medium text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
          {isConfirmed ? 'Destination confirmed!' : 'Swipe or tap the arrows to explore our options'}
        </p>
      </header>

      {/* Centered 3D Book Carousel Stage */}
      <div
        className="carousel-stage destination-book-selector__stage relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center pointer-events-auto"
        style={{ touchAction: 'pan-y' }}
      >
        {places.map((place, index) => (
          <BookCard
            key={place.id}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            coverRef={(node) => {
              coverRefs.current[index] = node;
            }}
            place={place}
            index={index}
            offset={getCircularOffset(index, activeIndex, places.length)}
            isActive={index === activeIndex}
            isConfirmed={isConfirmed}
            onSelect={goTo}
          />
        ))}
      </div>

      {/* Bottom Overlays: Dots, Navigation, and Action CTA */}
      <footer className="relative z-20 flex flex-col items-center gap-3 pb-3 sm:pb-6 px-4 w-full max-w-md mx-auto">
        {/* Navigation Dots */}
        <div className="flex items-center gap-1" aria-label="Destination slides">
          {places.map((place, index) => (
            <button
              key={place.id}
              type="button"
              disabled={isConfirmed}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}: ${place.title}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              className={`flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
                isConfirmed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 active:scale-95'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-8 bg-gradient-to-r from-pink-400 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                    : 'w-2.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Action Row: Prev, CTA, Next */}
        <div className="flex items-center justify-between w-full gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isConfirmed}
            aria-label="Previous destination"
            className={`flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-white/40 bg-white/80 backdrop-blur-md text-slate-800 shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
              isConfirmed
                ? 'cursor-not-allowed opacity-40 border-slate-300'
                : 'cursor-pointer hover:bg-white hover:scale-105 active:scale-95 hover:shadow-xl'
            }`}
          >
            <ChevronLeft className="h-6 w-6 text-slate-700" />
          </button>

          <div className="flex-1 flex justify-center">
            {isConfirmed ? (
              <div className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-500/90 backdrop-blur-md px-6 sm:px-8 py-3 text-sm sm:text-base font-bold text-white shadow-lg animate-heartPop">
                <Check className="h-5 w-5 text-white" />
                <span>Destination Locked: {selectedPlace || currentPlace.title} 💗</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleChooseDestination}
                className="group w-full inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-[0_4px_20px_rgba(244,63,94,0.45)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_6px_28px_rgba(244,63,94,0.65)] active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <Heart className="h-5 w-5 fill-white transition-transform group-hover:scale-125 duration-300" />
                <span>Choose this date 💗</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={isConfirmed}
            aria-label="Next destination"
            className={`flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-white/40 bg-white/80 backdrop-blur-md text-slate-800 shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
              isConfirmed
                ? 'cursor-not-allowed opacity-40 border-slate-300'
                : 'cursor-pointer hover:bg-white hover:scale-105 active:scale-95 hover:shadow-xl'
            }`}
          >
            <ChevronRight className="h-6 w-6 text-slate-700" />
          </button>
        </div>
      </footer>
    </section>
  );
}

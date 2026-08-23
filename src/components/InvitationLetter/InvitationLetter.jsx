import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Paperclip } from 'lucide-react';
import { sound } from '../../utils/sound';

export default function InvitationLetter({
  config,
  onAccept,
  isAccepted,
  noClickCount,
  setNoClickCount,
  onQuestionReady,
}) {
  const questionRef = useRef(null);
  const yesButtonRef = useRef(null);
  // YES escalation: 'inline' grows in-place; 'pinned' breaks out of the paper
  // at the button's exact screen rect; 'full' smoothly covers the whole viewport.
  const [yesPhase, setYesPhase] = useState('inline');
  const [yesRect, setYesRect] = useState(null);

  // Signal question readiness for scroll lock once the question block enters view
  useEffect(() => {
    if (isAccepted || !questionRef.current || !onQuestionReady) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAccepted) {
            onQuestionReady(true);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(questionRef.current);
    return () => observer.disconnect();
  }, [isAccepted, onQuestionReady]);

  const noProgression = config.noProgression || [
    "No 🙄",
    "Are you sure? 🥺",
    "Seriously? 😭",
    "Really now? 😤",
    "Pleaseee 💗"
  ];

  const handleNoClick = (e) => {
    e.stopPropagation();
    sound.playPop(0.8 + noClickCount * 0.15);

    // Optional haptic vibration on supported devices
    if (navigator.vibrate) {
      navigator.vibrate(60);
    }

    // On the 4th No, break the Yes button out of the paper: pin it at its
    // exact on-screen rect (zero jump), then let it grow to cover the viewport.
    if (noClickCount === 3 && yesButtonRef.current) {
      const rect = yesButtonRef.current.getBoundingClientRect();
      setYesRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
      setYesPhase('pinned');
    }

    setNoClickCount(prev => Math.min(5, prev + 1));
  };

  // One frame after pinning, expand the pinned Yes button to the full viewport.
  useEffect(() => {
    if (yesPhase !== 'pinned') return undefined;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setYesPhase('full'));
    });
    return () => cancelAnimationFrame(raf);
  }, [yesPhase]);

  const handleYesClick = () => {
    sound.playPop(1.5);
    sound.playCelebration();
    sound.playSparkle();

    if (navigator.vibrate) {
      navigator.vibrate([80, 50, 120]);
    }

    if (onQuestionReady) {
      onQuestionReady(false);
    }

    onAccept();
  };

  // Yes button presentation per escalation phase.
  const getYesPresentation = () => {
    if (yesPhase !== 'inline') {
      const full = yesPhase === 'full';
      return {
        className: `group flex items-center justify-center gap-3 bg-burgundy-900 text-amber-100 font-bold border border-gold-300 shadow-2xl cursor-pointer ${
          full ? 'text-2xl sm:text-4xl' : 'text-sm sm:text-base'
        }`,
        style: {
          position: 'fixed',
          // Center-anchored: expands evenly around its own center while the
          // center glides from the pinned rect to the viewport center.
          left: full ? '50vw' : `${yesRect.left + yesRect.width / 2}px`,
          top: full ? '50vh' : `${yesRect.top + yesRect.height / 2}px`,
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'center center',
          width: full ? '100vw' : yesRect.width,
          height: full ? '100vh' : yesRect.height,
          margin: 0,
          borderRadius: full ? 0 : 9999,
          zIndex: 70,
          transition: 'all 700ms cubic-bezier(0.22, 1, 0.36, 1)',
        },
      };
    }
    const scaleClasses = {
      1: 'scale-[1.25] z-20 shadow-glow-pink',
      2: 'scale-[1.60] z-20 shadow-glow-pink',
      3: 'scale-[2.20] z-30 shadow-glow-pink',
    };
    return {
      className: `group inline-flex items-center justify-center gap-2 px-6 py-3 bg-burgundy-900 hover:bg-burgundy-800 text-amber-100 font-bold text-sm rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition duration-200 border border-gold-300 min-h-[44px] cursor-pointer ${
        scaleClasses[noClickCount] || 'scale-100'
      }`,
      style: undefined,
    };
  };
  const yesPresentation = getYesPresentation();

  const paragraphs = config.letter?.body || [];

  return (
    <section
      id="invitation-letter-section"
      className="relative py-10 border-b border-burgundy-200/60 space-y-6 select-none"
    >
      {/* Section eyebrow */}
      <div className="text-center">
        <span className="text-xs font-mono tracking-widest text-burgundy-600 uppercase font-bold">
          {config.letter?.tag || "A Note From My Heart 💌"}
        </span>
      </div>

      {/* Letter card on the continuous paper sheet */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-burgundy-200/70 shadow-inner p-6 sm:p-8 relative space-y-4">
        {/* Paperclip decor */}
        <Paperclip
          aria-hidden="true"
          className="absolute -top-3 left-6 w-6 h-6 transform -rotate-45 text-burgundy-800 opacity-80"
        />

        {/* Salutation */}
        <h2 className="font-handwritingPaper text-2xl sm:text-3xl text-burgundy-900 font-bold">
          {config.letter?.greeting}
        </h2>

        {/* Letter body — always fully visible */}
        <div className="space-y-4">
          {paragraphs.map((para, idx) => (
            <p
              key={idx}
              className="font-serif text-sm sm:text-base text-ink/90 leading-relaxed"
              style={{ textWrap: 'pretty' }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Ornament divider — rule-heart-rule */}
        <div aria-hidden="true" className="flex items-center gap-3">
          <span className="flex-1 h-px bg-burgundy-200" />
          <Heart className="w-3 h-3 text-burgundy-400 fill-burgundy-400" />
          <span className="flex-1 h-px bg-burgundy-200" />
        </div>

        {/* The Big Question Area */}
        <div ref={questionRef} className="text-center">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-burgundy-900">
            {config.letter?.question || "Would you go on a date with me? 🥺💗"}
          </h3>
          <p className="font-serif italic text-sm sm:text-base text-ink/70">
            {config.letter?.subtext || "Choose what feels right for you 💌"}
          </p>

          {/* YES / NO Action Buttons */}
          {!isAccepted ? (
            <div className="relative min-h-[90px] mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {/* Subtle heart reaction — re-keyed per No click so the pop replays */}
              {noClickCount > 0 && (
                <span
                  key={noClickCount}
                  aria-hidden="true"
                  className="absolute -top-1 right-4 sm:right-10 z-10 pointer-events-none animate-heartPop"
                >
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400 opacity-70" />
                </span>
              )}

              {/* YES Button — portals to <body> once it breaks out of the paper,
                  because the letter card's backdrop-filter makes it a containing
                  block that would otherwise clip and skew the fixed positioning. */}
              {yesPhase === 'inline' ? (
                <button
                  ref={yesButtonRef}
                  type="button"
                  onClick={handleYesClick}
                  className={yesPresentation.className}
                >
                  <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
                  <span>YES 💗</span>
                </button>
              ) : (
                <>
                  {/* Placeholder keeps the NO button from shifting while Yes is portaled */}
                  <span
                    aria-hidden="true"
                    style={{ width: yesRect.width, height: yesRect.height }}
                    className="inline-block"
                  />
                  {createPortal(
                    <button
                      type="button"
                      onClick={handleYesClick}
                      className={yesPresentation.className}
                      style={yesPresentation.style}
                    >
                      <Heart
                        className={`fill-rose-400 text-rose-400 transition-all duration-700 ${
                          yesPhase === 'full' ? 'w-10 h-10 sm:w-14 sm:h-14' : 'w-4 h-4'
                        }`}
                      />
                      <span>YES 💗</span>
                    </button>,
                    document.body,
                  )}
                </>
              )}

              {/* NO Button (5-click playful gimmick) */}
              {noClickCount < 5 && (
                <button
                  type="button"
                  onClick={handleNoClick}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-burgundy-50 border border-burgundy-200 text-burgundy-800 font-semibold text-sm rounded-full shadow-sm active:scale-95 transition duration-200 min-h-[44px] cursor-pointer"
                >
                  <span>{noProgression[noClickCount]}</span>
                </button>
              )}
            </div>
          ) : (
            /* Accepted Banner */
            <div className="inline-flex items-center gap-2 px-6 py-3 mt-6 bg-burgundy-900 border border-gold-300 text-amber-100 rounded-full font-bold text-sm shadow-lg animate-heartPop">
              <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
              <span>SHE SAID YES! 🎉💗</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

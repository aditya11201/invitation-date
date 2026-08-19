import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { sound } from '../../utils/sound';

export default function InvitationLetter({
  config,
  onAccept,
  isAccepted,
  noClickCount,
  setNoClickCount,
  onQuestionReady,
}) {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);
  const yesButtonRef = useRef(null);

  // Monitor scroll within the letter section to drive letter extraction & staged paragraphs
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far the section has progressed through viewport
      const totalDist = rect.height + windowHeight;
      const currentPos = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(1, currentPos / (totalDist * 0.75)));

      setScrollProgress(progress);
      if (progress > 0.15) {
        setEnvelopeOpen(true);
      }

      // Signal question readiness for scroll lock once question and buttons are reached
      if (progress >= 0.75 && !isAccepted && onQuestionReady) {
        onQuestionReady(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
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

    setNoClickCount(prev => Math.min(5, prev + 1));
  };

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

  // Compute Yes button dynamic scaling and styles according to PRD progression
  const getYesScaleClass = () => {
    switch (noClickCount) {
      case 1:
        return 'scale-[1.25] z-20 shadow-glow-pink';
      case 2:
        return 'scale-[1.60] z-20 shadow-glow-pink';
      case 3:
        return 'scale-[2.20] z-30 shadow-glow-pink';
      case 4:
        return 'scale-[2.80] sm:scale-[3.20] z-30 shadow-glow-pink px-10 py-5';
      case 5:
        return 'fixed inset-4 sm:inset-10 z-50 flex items-center justify-center text-2xl sm:text-4xl rounded-3xl animate-heartPop shadow-2xl';
      default:
        return 'scale-100';
    }
  };

  const paragraphs = config.letter?.body || [];

  return (
    <section
      ref={containerRef}
      id="invitation-letter-section"
      className="relative min-h-[140vh] py-20 px-4 sm:px-6 flex flex-col items-center justify-start select-none"
    >
      {/* Section kicker — thin rules flanking letterspaced small caps */}
      <div className="inline-flex items-center gap-3 sm:gap-4 mb-10 sm:mb-12">
        <span aria-hidden="true" className="h-px w-8 sm:w-12 bg-romantic-300/70" />
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span className="text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-[0.26em] sm:tracking-[0.3em] text-romantic-600">
          {config.letter?.tag || "A Note From My Heart 💌"}
        </span>
        <span aria-hidden="true" className="h-px w-8 sm:w-12 bg-romantic-300/70" />
      </div>

      {/* 3D Envelope & Letter Extraction Container */}
      <div className="relative w-full max-w-xl mx-auto flex flex-col items-center">

        {/* Envelope 3D Visual */}
        <div
          className="relative w-full max-w-md aspect-[16/10] mx-auto rounded-xl bg-gradient-to-br from-romantic-200 via-ivory-200 to-lavender-200 p-2 shadow-paper border border-white/60 transition-all duration-700"
          style={{
            transform: `perspective(1000px) rotateX(${Math.max(0, 20 - scrollProgress * 20)}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Envelope Pocket */}
          <div className="relative w-full h-full bg-gradient-to-tr from-ivory-50 to-romantic-100 rounded-md overflow-hidden shadow-inner flex items-center justify-center">
            {/* Wax Seal */}
            <div
              className={`absolute z-30 transition-all duration-500 ${
                envelopeOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-romantic-500 to-romantic-700 shadow-lg ring-1 ring-romantic-300/60 -rotate-6 flex items-center justify-center text-ivory-50 font-display font-bold text-xl">
                <Heart className="w-7 h-7 fill-white/90" />
              </div>
            </div>

            {/* Envelope Triangles */}
            <div className="absolute inset-0 border-t-[80px] sm:border-t-[110px] border-t-ivory-300/90 border-x-[150px] sm:border-x-[220px] border-x-transparent border-b-0 top-0 transition-transform duration-700 origin-top"
              style={{
                transform: envelopeOpen ? 'rotateX(180deg) translateY(-20px)' : 'rotateX(0deg)',
              }}
            />
            <div className="absolute inset-0 border-b-[80px] sm:border-b-[110px] border-b-romantic-200/90 border-x-[150px] sm:border-x-[220px] border-x-transparent border-t-0 bottom-0 pointer-events-none" />
          </div>
        </div>

        {/* The Physical Letter — backing sheet + paper, extracted upwards & centered */}
        <div
          className={`relative w-full max-w-lg mt-[-100px] sm:mt-[-130px] z-20 transition-all duration-700 ${
            envelopeOpen ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-8'
          }`}
        >
          {/* Backing sheet for layered paper depth */}
          <div aria-hidden="true" className="absolute inset-0 translate-x-2 translate-y-2.5 rounded-lg bg-ivory-200/90 border border-ivory-300/70 shadow-paper" />

          <div
            id="letter-paper"
            className="relative rounded-lg bg-ivory-100 border border-ivory-300 p-6 sm:p-10 shadow-2xl"
            style={{
              backgroundImage: `radial-gradient(rgba(214,154,153,0.28) 0.5px, transparent 0.5px), radial-gradient(rgba(201,183,210,0.26) 0.5px, #fcfbf7 0.5px)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}
          >
            {/* Airmail trim along the letterhead edge */}
            <div
              aria-hidden="true"
              className="absolute top-0 inset-x-0 h-1.5 rounded-t-lg opacity-60"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(163,78,93,0.85) 0 9px, transparent 9px 16px, rgba(135,109,145,0.8) 16px 25px, transparent 25px 32px)',
              }}
            />

            {/* Paper Stamp */}
            <div className="absolute top-4 right-4 w-12 h-14 border-2 border-dashed border-romantic-300 bg-romantic-50/60 p-1 flex flex-col items-center justify-center rotate-3">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span className="text-[9px] font-bold text-romantic-500 uppercase tracking-tighter mt-1">LOVE</span>
            </div>

            {/* Letter Salutation */}
            <h2 className="font-handwriting text-3xl sm:text-4xl text-romantic-700 font-bold pr-12 mb-4">
              {config.letter?.greeting}
            </h2>
            <div aria-hidden="true" className="flex items-center gap-2 mb-6">
              <span className="h-px w-12 bg-romantic-300/80" />
              <span className="w-1 h-1 rotate-45 bg-rose-400/80" />
            </div>

            {/* Staged Reading Paragraphs */}
            <div className="space-y-4 font-sans text-romantic-900/75 text-sm sm:text-base leading-loose">
              {paragraphs.map((para, idx) => {
                // Stagger reveal based on scroll or show all if unlocked
                const isRevealed = scrollProgress > (0.15 + idx * 0.1) || isAccepted;
                return (
                  <p
                    key={idx}
                    className={`transition-all duration-700 ${
                      isRevealed ? 'opacity-100 translate-y-0' : 'opacity-20 blur-[1px] translate-y-2'
                    }`}
                    style={{ textWrap: 'pretty' }}
                  >
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Editorial rule with heart ornament */}
            <div aria-hidden="true" className="my-8 flex items-center gap-3">
              <span className="flex-1 h-px bg-romantic-200/80" />
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span className="flex-1 h-px bg-romantic-200/80" />
            </div>

            {/* The Big Question Area */}
            <div className="text-center">
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-romantic-900 mb-2 tracking-tight">
                {config.letter?.question || "Would you go on a date with me? 🥺💗"}
              </h3>
              <p className="font-display italic text-sm sm:text-base text-romantic-600/90 mb-8">
                {config.letter?.subtext || "Choose what feels right for you 💌"}
              </p>

              {/* YES / NO Action Buttons */}
              {!isAccepted ? (
                <div className="relative min-h-[90px] flex flex-wrap items-center justify-center gap-4 sm:gap-6">
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

                  {/* YES Button */}
                  <button
                    ref={yesButtonRef}
                    type="button"
                    onClick={handleYesClick}
                    className={`group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-md font-bold text-ivory-50 bg-romantic-600 ring-1 ring-inset ring-romantic-700/40 shadow-md hover:bg-romantic-700 hover:shadow-glow-pink hover:scale-105 active:scale-[0.96] transition-all duration-300 cursor-pointer min-h-[44px] ${getYesScaleClass()}`}
                  >
                    <Heart className="w-5 h-5 fill-white animate-pulse" />
                    <span className="tracking-[0.18em]">YES 💗</span>
                  </button>

                  {/* NO Button (5-click playful gimmick) */}
                  {noClickCount < 5 && (
                    <button
                      type="button"
                      onClick={handleNoClick}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold text-romantic-700 bg-ivory-50/80 hover:bg-ivory-200 hover:text-romantic-900 border border-romantic-200 shadow-sm active:scale-[0.96] transition-all duration-200 cursor-pointer min-h-[44px]"
                    >
                      <span>{noProgression[noClickCount]}</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Accepted Banner */
                <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-md bg-romantic-600 border border-romantic-700/40 text-ivory-50 font-bold text-base shadow-glow-pink animate-heartPop">
                  <Heart className="w-5 h-5 fill-white text-white" />
                  <span>SHE SAID YES! 🎉💗</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

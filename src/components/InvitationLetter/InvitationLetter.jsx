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
}) {
  const questionRef = useRef(null);
  const yesButtonRef = useRef(null);
  const hasSnappedToQuestion = useRef(false);
  // YES escalation: 'inline' grows in-place; 'pinned' breaks out of the paper
  // at the button's exact screen rect; 'full' smoothly covers the whole viewport.
  const [yesPhase, setYesPhase] = useState('inline');
  const [yesRect, setYesRect] = useState(null);

  // Reveal and center the question once its block first enters view.
  useEffect(() => {
    if (isAccepted || !questionRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasSnappedToQuestion.current && !isAccepted) {
            hasSnappedToQuestion.current = true;
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            questionRef.current?.scrollIntoView({
              block: 'center',
              behavior: reducedMotion ? 'instant' : 'smooth',
            });
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(questionRef.current);
    return () => observer.disconnect();
  }, [isAccepted]);

  const noProgression = config.noProgression;

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

    onAccept();
  };

  // Yes button presentation per escalation phase.
  const getYesPresentation = () => {
    if (yesPhase !== 'inline') {
      const full = yesPhase === 'full';
      return {
        className: `rsvp-yes-button font-handwritingPaper group flex items-center justify-center gap-3 bg-burgundy-900 text-amber-100 font-bold border border-gold-300 shadow-2xl cursor-pointer ${
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
      className: `rsvp-yes-button font-handwritingPaper group inline-flex items-center justify-center gap-2 px-6 py-3 bg-burgundy-900 hover:bg-burgundy-800 text-amber-100 font-bold text-sm rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition duration-200 border border-gold-300 min-h-[44px] cursor-pointer ${
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
      className="letter-section relative select-none"
    >
      <div className="letter-face">
        <Paperclip aria-hidden="true" className="letter-paperclip" />
        <span className="letter-top-tape" aria-hidden="true" />

        <div className="letter-postal-marks" aria-hidden="true">
          <svg className="letter-postmark" viewBox="0 0 164 86" fill="none">
            <defs>
              <path id="invitation-postmark-copy" d="M88 43a35 35 0 0 1 70 0" />
            </defs>
            <path
              d="M1 21c12-8 21 8 33 0s21 8 33 0 13-3 20 0M1 32c12-8 21 8 33 0s21 8 33 0 13-3 20 0M1 43c12-8 21 8 33 0s21 8 33 0 13-3 20 0M1 54c12-8 21 8 33 0s21 8 33 0 13-3 20 0"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="123" cy="43" r="35" stroke="currentColor" strokeWidth="1.15" />
            <circle cx="123" cy="43" r="29" stroke="currentColor" strokeWidth="0.8" />
            <text>
              <textPath href="#invitation-postmark-copy" startOffset="50%" textAnchor="middle">
                DARI: AKU ✦ UNTUK: KAMU ✦
              </textPath>
            </text>
            <text className="letter-postmark-center" x="123" y="46" textAnchor="middle">HARI INI</text>
          </svg>

          <div className="letter-stamp">
            <span className="letter-stamp-label">LOVE·POST</span>
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 20.2 4.8 13A5.05 5.05 0 0 1 12 5.9 5.05 5.05 0 0 1 19.2 13L12 20.2Z"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.2 9.5h4l1.3-2.2 2.1 5 1.5-3h6.7"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="letter-stamp-label">FOREVER</span>
          </div>
        </div>

        <h2 className="letter-salutation">{config.letter?.greeting}</h2>

        <div className="letter-copy">
          {paragraphs.map((para, idx) => (
            <p key={idx} style={{ textWrap: 'pretty' }}>
              {idx === 3 ? <span className="letter-highlight">{para}</span> : para}
            </p>
          ))}
        </div>

        <section ref={questionRef} className="rsvp-card" aria-labelledby="invitation-question">
          <span className="rsvp-tape rsvp-tape--left" aria-hidden="true" />
          <span className="rsvp-tape rsvp-tape--right" aria-hidden="true" />
          <h3 className="rsvp-question font-handwritingPaper font-bold" id="invitation-question">
            {config.letter.question}
          </h3>
          <div className="rsvp-heart-divider" aria-hidden="true">
            <span /><b>♡</b><span />
          </div>
          <p className="rsvp-subtext font-handwritingPaper not-italic font-semibold">
            {config.letter.subtext}
          </p>

          {!isAccepted ? (
            <div className="relative min-h-[90px] mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {noClickCount > 0 && (
                <span
                  key={noClickCount}
                  aria-hidden="true"
                  className="absolute -top-1 right-4 sm:right-10 z-10 pointer-events-none animate-heartPop"
                >
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400 opacity-70" />
                </span>
              )}

              {yesPhase === 'inline' ? (
                <button
                  ref={yesButtonRef}
                  type="button"
                  onClick={handleYesClick}
                  className={yesPresentation.className}
                >
                  <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
                  <span>{config.ui.question.yesButton}</span>
                </button>
              ) : (
                <>
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
                      <span>{config.ui.question.yesButton}</span>
                    </button>,
                    document.body,
                  )}
                </>
              )}

              {noClickCount < 5 && (
                <button
                  type="button"
                  onClick={handleNoClick}
                  className="rsvp-no-button font-handwritingPaper inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-burgundy-50 border border-burgundy-200 text-burgundy-800 font-semibold text-sm rounded-full shadow-sm active:scale-95 transition duration-200 min-h-[44px] cursor-pointer"
                >
                  <span>{noProgression[noClickCount]}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="rsvp-accepted-banner font-handwritingPaper animate-heartPop" role="status" aria-live="polite">
              <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
              <span>{config.ui.question.acceptedBanner}</span>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

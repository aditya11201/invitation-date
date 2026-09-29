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

        <div className="letter-stamp-anchor" aria-hidden="true">
          <svg className="letter-stamp" viewBox="0 0 448 560" aria-hidden="true">
            <defs>
              <radialGradient id="letter-stamp-red-gradient" cx="50%" cy="38%" r="78%">
                <stop offset="0%" stopColor="#C14A5A" />
                <stop offset="55%" stopColor="#B83A4B" />
                <stop offset="100%" stopColor="#7A2030" />
              </radialGradient>

              <pattern id="letter-stamp-perforation" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="16" height="16" fill="#fff" />
                <circle cx="0" cy="0" r="6" fill="#000" />
                <circle cx="16" cy="0" r="6" fill="#000" />
                <circle cx="0" cy="16" r="6" fill="#000" />
                <circle cx="16" cy="16" r="6" fill="#000" />
              </pattern>

              <mask id="letter-stamp-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="448" height="560">
                <rect width="448" height="560" fill="#fff" />
                <rect x="0" y="0" width="448" height="9" fill="url(#letter-stamp-perforation)" />
                <rect x="0" y="551" width="448" height="9" fill="url(#letter-stamp-perforation)" />
                <rect x="0" y="0" width="9" height="560" fill="url(#letter-stamp-perforation)" />
                <rect x="439" y="0" width="9" height="560" fill="url(#letter-stamp-perforation)" />
              </mask>

              <filter id="letter-stamp-grain" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
                <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0" />
              </filter>
            </defs>

            <g mask="url(#letter-stamp-mask)">
              <rect width="448" height="560" fill="url(#letter-stamp-red-gradient)" />

              <g transform="translate(0,28)">
                <g>
                  <path
                    fill="#f6c4cf"
                    d="M266 250 C252 210 230 152 200 96 Q242 132 252 170 Q258 202 262 232 Q265 248 268 252 Z"
                  />
                  <path
                    fill="none"
                    stroke="#7A2030"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    d="M262 244 Q250 198 233 140"
                  />
                </g>

                <path
                  fill="#fff"
                  d="M222 290 C178 290 134 304 92 326 Q84 356 102 372 Q102 400 128 406 Q168 396 214 312 Z"
                />
                <path
                  fill="none"
                  stroke="#c2231e"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  d="M220 292 Q162 300 106 320 M218 298 Q164 326 112 366 M216 304 Q172 344 138 396"
                />

                <path
                  fill="#fff"
                  d="M252 184 C258 172 274 167 286 175 C294 180 299 188 301 198
                     C302 208 298 218 290 226 C298 236 308 250 311 266
                     C313 284 304 300 288 310 C268 322 236 328 208 322
                     C184 316 166 306 154 292 C150 282 154 270 164 262
                     C180 248 208 238 236 232 C244 222 246 200 252 184 Z"
                />

                <g>
                  <path
                    fill="#fff"
                    d="M258 252 C240 216 210 156 152 98 Q146 130 166 158 Q172 196 198 224 Q210 258 244 268 Z"
                  />
                  <path
                    fill="none"
                    stroke="#c2231e"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    d="M252 248 Q206 206 172 152 M254 252 Q228 240 202 222"
                  />
                </g>

                <circle cx="284" cy="195" r="3.6" fill="#c2231e" />
                <circle cx="285.4" cy="193.6" r="1.15" fill="#fff" />
                <path fill="#f294ac" d="M294 199 C310 204 328 216 340 233 C322 232 304 226 292 220 Z" />

                <g transform="translate(316,226) rotate(9)">
                  <rect width="88" height="66" rx="4" fill="#f8b6c6" />
                  <path
                    d="M0 0 L88 0 44 34 Z"
                    fill="#f091ac"
                    stroke="#f091ac"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <path
                    fill="#c2231e"
                    d="M44 61 C41 58 31 51.5 31 44.5 C31 38.8 34.7 35 39.5 35 C41.8 35 44 36.7 44 38.8
                       C44 36.7 46.2 35 48.5 35 C53.3 35 57 38.8 57 44.5 C57 51.5 47 58 44 61 Z"
                  />
                </g>
              </g>

              <text transform="rotate(-4 38 84)" x="38" y="84" fontFamily="'Caveat',cursive" fontSize="47" fontWeight="600" fill="#fff">forever</text>
              <text x="418" y="506" textAnchor="end" fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="26" fontWeight="600" letterSpacing="4" fill="#fff">USA</text>
              <text x="418" y="531" textAnchor="end" fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="16" fontWeight="400" letterSpacing="3.5" fill="#fff">2024</text>

              <rect width="448" height="560" fill="#fff" fillOpacity="0.001" filter="url(#letter-stamp-grain)" />
            </g>
          </svg>
        </div>

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

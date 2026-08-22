import React, { useEffect, useRef } from 'react';

/**
 * LongPaper — one continuous vertical paper sheet hosting every
 * post-envelope section. Visual source of truth: reference-new-style.html
 * (<main id="mainPaperSheet">). Pure presentation wrapper: no state.
 *
 * handoffRect: on-screen rect of the 3D letter at envelope open-complete.
 * When present, the sheet FLIP-animates from that rect out to its natural
 * size so the letter visually becomes this paper (one continuous object).
 */
export default function LongPaper({ children, handoffRect = null }) {
  const sheetRef = useRef(null);

  useEffect(() => {
    const sheetEl = sheetRef.current;
    if (!sheetEl || !handoffRect) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const paperRect = sheetEl.getBoundingClientRect();
    const hr = handoffRect;
    if (!paperRect.width || !paperRect.height || hr.width < 40 || hr.height < 40) return undefined;

    const sx = Math.min(3, Math.max(0.05, hr.width / paperRect.width));
    const sy = Math.min(3, Math.max(0.05, hr.height / paperRect.height));
    const dx = hr.left + hr.width / 2 - (paperRect.left + paperRect.width / 2);
    const dy = hr.top - paperRect.top;

    const animation = sheetEl.animate(
      [
        { transformOrigin: 'top center', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transformOrigin: 'top center', transform: 'none' },
      ],
      { duration: 950, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
    return () => animation.cancel();
  }, [handoffRect]);

  return (
    <section className="relative py-6 px-3 sm:px-6 flex justify-center items-start">
      <div ref={sheetRef} className="paper-vertical-sheet w-full max-w-4xl min-h-[90vh] rounded-2xl relative p-5 sm:p-10 my-4 border border-gold-500/20 transition-all duration-300">
        {/* Top airmail strip */}
        <div className="absolute top-0 left-0 right-0 h-2.5 rounded-t-2xl airmail-strip opacity-90" aria-hidden="true" />

        {/* Washi tape corners */}
        <div className="washi-tape absolute -top-3 left-8 sm:left-12 w-24 sm:w-28 h-6 transform -rotate-3 z-30 rounded-sm pointer-events-none" aria-hidden="true" />
        <div className="washi-tape absolute -top-3 right-8 sm:right-12 w-24 sm:w-28 h-6 transform rotate-2 z-30 rounded-sm pointer-events-none" aria-hidden="true" />

        {children}

        {/* Bottom airmail strip */}
        <div className="absolute bottom-0 left-0 right-0 h-2.5 rounded-b-2xl airmail-strip opacity-90" aria-hidden="true" />
      </div>
    </section>
  );
}

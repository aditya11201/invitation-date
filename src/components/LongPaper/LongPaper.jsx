import React from 'react';

/**
 * LongPaper — one continuous vertical paper sheet hosting every
 * post-envelope section. Visual source of truth: reference-new-style.html
 * (<main id="mainPaperSheet">). Pure presentation wrapper: no state.
 */
export default function LongPaper({ children }) {
  return (
    <section className="relative desk-backdrop py-6 px-3 sm:px-6 flex justify-center items-start">
      <div className="paper-vertical-sheet w-full max-w-xl min-h-[90vh] rounded-2xl relative p-5 sm:p-10 my-4 border border-gold-500/20 transition-all duration-300">
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

import React, { forwardRef } from 'react';
import { gsap } from 'gsap';
import ScrapbookPhoto from './ScrapbookPhoto';
import { resolvePhotoSlots } from './photos';

// Color themes only — book copy (tag/spine/chapter/quote/badge/emoji) lives on
// place.book in src/config/config.js.
const PLACE_THEMES = {
  aquarium: {
    c1: '#00c6ff',
    c2: '#0072ff',
    leather: '#0a3a63',
  },
  cinema: {
    c1: '#301847',
    c2: '#c84e89',
    leather: '#2a123c',
  },
  museum: {
    c1: '#8c5040',
    c2: '#e0a96d',
    leather: '#4a2c1d',
  },
};

const BookCard = forwardRef(function BookCard(
  { place, index, offset, isActive, isConfirmed, onSelect, coverRef },
  cardRef,
) {
  const state = offset === 0 ? 'center' : Math.abs(offset) === 1 ? 'near' : 'far';
  const theme = PLACE_THEMES[place.id] || {};
  const book = place.book || {};

  const c1 = place.c1 || theme.c1 || place.themeColor || '#ff758c';
  const c2 = place.c2 || theme.c2 || place.themeColor || '#ff7eb3';
  const leather = place.leather || theme.leather || '#7c2a44';
  const tag = place.tag || book.tag || 'Date Story';
  const spine = place.spine || book.spine || `${place.title} · Vol. ${index + 1}`;
  const badge = place.badge || book.badge || place.emoji || '💖';
  const emoji = place.coverEmoji || book.emoji || place.emoji || '✨';
  const quote = place.quote || book.quote || place.copy;
  const chapter = place.chapter || book.chapter || `Chapter ${String(index + 1).padStart(2, '0')}`;
  const author = place.author || 'a date story · est. us';

  const handleMouseEnter = (e) => {
    if (isActive || isConfirmed) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const coverEl = e.currentTarget.querySelector('.book-cover');
    if (coverEl) {
      gsap.to(coverEl, { rotationY: -30, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    }
  };

  const handleMouseLeave = (e) => {
    if (isActive || isConfirmed) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const coverEl = e.currentTarget.querySelector('.book-cover');
    if (coverEl) {
      const targetAngle = Math.abs(offset) === 1 ? -14 : 0;
      gsap.to(coverEl, { rotationY: targetAngle, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    }
  };

  return (
    <button
      ref={cardRef}
      type="button"
      data-book-state={state === 'center' ? 'active' : state}
      data-state={state}
      data-index={index}
      aria-label={`Choose ${place.title}`}
      aria-current={isActive ? 'true' : undefined}
      disabled={isConfirmed}
      onClick={() => !isActive && !isConfirmed && onSelect(index)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--c1': c1,
        '--c2': c2,
        '--leather': leather,
        '--place-color': place.themeColor || c1,
      }}
      className={`date-card destination-book ${isActive ? 'active' : ''} absolute left-1/2 top-1/2 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40`}
    >
      {/* Book Back Cover */}
      <div className="book-backcover destination-book__back" aria-hidden="true" />

      {/* Book Pages */}
      <div className="book-pages destination-book__pages">
        <div className="page-content destination-book__content">
          <div className="page-chapter destination-book__chapter">{chapter}</div>
          <h2 className="page-title destination-book__title">{place.title}</h2>
          <p className="page-text destination-book__copy">{place.copy}</p>
          {place.highlights && place.highlights.length > 0 && (
            <div className="page-chips destination-book__chips destination-book__highlights">
              {place.highlights.map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
          )}
          <div className="page-num destination-book__page-number">
            — {String(index + 1).padStart(2, '0')} —
          </div>
        </div>

        {/* Scrapbook photo layer — decorative, non-interactive */}
        <div className="book-photos destination-book__photos" aria-hidden="true">
          {resolvePhotoSlots(place).map((slot, i) => (
            <ScrapbookPhoto key={`${place.id}-photo-${i}`} slot={slot} />
          ))}
        </div>
      </div>

      {/* Hinged Book Cover */}
      <div
        ref={coverRef}
        className="book-cover destination-book__cover"
        aria-hidden="true"
      >
        {/* Cover Front */}
        <div className="cover-face cover-front destination-book__cover-front">
          <div className="cover-spine destination-book__spine">
            <span>{spine}</span>
          </div>
          <div className="cover-deco destination-book__deco" />
          <div className="cover-emoji destination-book__emoji">{emoji}</div>
          <div className="cover-title destination-book__cover-title">{place.title}</div>
          <div className="cover-author destination-book__author">{author}</div>
          <div className="card-badge destination-book__badge">{badge}</div>
          <div className="card-tag destination-book__tag">{tag}</div>
        </div>

        {/* Cover Back */}
        <div className="cover-face cover-back destination-book__cover-back">
          <div className="in-emoji destination-book__in-emoji">{badge}</div>
          <p>{quote}</p>
        </div>
      </div>
    </button>
  );
});

export default BookCard;

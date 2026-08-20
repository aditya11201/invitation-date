import React, { useEffect, useRef, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';
import { getLoadingMessage, PRELOADER_COPY } from './preloaderStages.js';
import './preloader.css';

export default function Preloader({ onStart, recipientName }) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const fadeTimeoutRef = useRef(null);
  const startTimeoutRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const duration = 3200;
    const startedAt = performance.now();
    let frameId = 0;

    const updateProgress = (now) => {
      const nextProgress = Math.min(100, Math.round(((now - startedAt) / duration) * 100));
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        setIsReady(true);
        return;
      }

      frameId = requestAnimationFrame(updateProgress);
    };

    frameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => () => {
    clearTimeout(fadeTimeoutRef.current);
    clearTimeout(startTimeoutRef.current);
  }, []);

  const handleEnter = () => {
    if (!isReady || isOpening || startedRef.current) return;

    startedRef.current = true;
    sound.playPop(1.2);
    sound.playSparkle();
    setIsOpening(true);

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    fadeTimeoutRef.current = setTimeout(() => setIsFading(true), reducedMotion ? 0 : 420);
    startTimeoutRef.current = setTimeout(() => onStart(), reducedMotion ? 100 : 700);
  };

  const displayName = recipientName || 'my beautiful girl';
  const loadingMessage = getLoadingMessage(progress, recipientName);

  return (
    <div className={`preloader${isFading ? ' is-fading' : ''}`}>
      <div aria-hidden="true" className="preloader__ambient preloader__ambient--rose" />
      <div aria-hidden="true" className="preloader__ambient preloader__ambient--violet" />

      <div className="preloader__content">
        <div className="preloader__eyebrow" aria-hidden="true">
          <span className="preloader__eyebrow-rule" />
          <Sparkles className="preloader__eyebrow-mark" />
          <span>{PRELOADER_COPY.eyebrow}</span>
          <span className="preloader__eyebrow-rule" />
        </div>

        <h1 className="preloader__title">{PRELOADER_COPY.title}</h1>
        <p className="preloader__dedication">for {displayName} 💗</p>

        <div className="preloader__envelope-stage" aria-hidden="true">
          <div className={`preloader__envelope${isReady ? ' is-ready' : ''}${isOpening ? ' is-opening' : ''}`}>
            <div className="preloader__envelope-shell">
              <div className="preloader__envelope-inner">
                <div className="preloader__letter-peek">
                  <span className="preloader__letter-label">To: {recipientName || 'you'}</span>
                  <span className="preloader__letter-line" />
                  <span className="preloader__letter-line preloader__letter-line--short" />
                </div>
                <div className="preloader__flap preloader__flap--bottom" />
                <div className="preloader__flap preloader__flap--left" />
                <div className="preloader__flap preloader__flap--right" />
                <div className="preloader__flap preloader__flap--top" />
                <div className="preloader__seal">
                  <Heart className="preloader__seal-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="preloader__progress-panel">
          <div
            className="preloader__progress-track"
            role="progressbar"
            aria-label="Loading invitation"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
            aria-valuetext={loadingMessage}
          >
            <div className="preloader__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="preloader__progress-meta">
            <span className="preloader__progress-message" role="status" aria-live="polite">
              {loadingMessage}
            </span>
            <span className="preloader__progress-value">{progress}%</span>
          </div>
        </div>

        {isReady && (
          <>
            <p className="preloader__hint">The envelope is sealed just for you.</p>
            <button
              type="button"
              className="preloader__cta"
              onClick={handleEnter}
              disabled={isOpening}
              aria-label="Open the romantic invitation"
            >
              <span>{PRELOADER_COPY.cta}</span>
              <Heart className="preloader__cta-icon" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

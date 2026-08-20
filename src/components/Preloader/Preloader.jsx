import { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';
import { clampProgress, formatPreloaderCopy, getPreloaderPhase } from './preloaderStages.js';
import PreloaderCanvas from './PreloaderCanvas';
import './preloader.css';

export default function Preloader({ onAudioUnlock, onStart, preloaderConfig, recipientName, senderName, year }) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSealReady, setIsSealReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const startTimeoutRef = useRef(null);
  const openedRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener?.('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener?.('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(100);
      setIsLoaded(true);
      return undefined;
    }

    const startedAt = performance.now();
    const duration = 3200;
    let frameId = 0;
    const updateProgress = (timestamp) => {
      const nextProgress = clampProgress(((timestamp - startedAt) / duration) * 100);
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        setIsLoaded(true);
        return;
      }
      frameId = requestAnimationFrame(updateProgress);
    };

    frameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frameId);
  }, [reducedMotion]);

  useEffect(() => () => clearTimeout(startTimeoutRef.current), []);

  const displayName = recipientName || 'you';
  const safeSenderName = senderName || 'someone special';
  const values = useMemo(
    () => ({ recipientName: displayName, senderName: safeSenderName, year }),
    [displayName, safeSenderName, year],
  );
  const coverContent = useMemo(
    () => ({
      recipientName: displayName,
      senderName: safeSenderName,
      year,
      headline: preloaderConfig.coverHeadline,
      subtext: preloaderConfig.coverSubtext,
    }),
    [displayName, safeSenderName, year, preloaderConfig.coverHeadline, preloaderConfig.coverSubtext],
  );
  const phase = getPreloaderPhase(progress, preloaderConfig.phases);
  const loadingMessage = formatPreloaderCopy(phase.message, values);
  const format = (template) => formatPreloaderCopy(template, values);

  const handleOpen = () => {
    if (!isSealReady || isOpening || openedRef.current) return;
    openedRef.current = true;
    onAudioUnlock();
    sound.playPop(1.2);
    sound.playSparkle();
    setIsOpening(true);
  };

  const handleOpenComplete = () => {
    if (isFading || startedRef.current) return;
    setIsFading(true);
    startTimeoutRef.current = window.setTimeout(() => {
      if (startedRef.current) return;
      startedRef.current = true;
      onStart();
    }, reducedMotion ? 80 : 520);
  };

  return (
    <section className={`preloader${isFading ? ' is-fading' : ''}`} aria-busy={!isSealReady}>
      <div className="preloader__ambient preloader__ambient--rose" aria-hidden="true" />
      <div className="preloader__ambient preloader__ambient--violet" aria-hidden="true" />
      <div className="preloader__content">
        <p className="preloader__eyebrow"><Sparkles aria-hidden="true" /><span>{format(preloaderConfig.badge)}</span></p>
        <h1 className="preloader__title">{preloaderConfig.title}</h1>
        <p className="preloader__dedication">for {displayName} 💗</p>
        <div className="preloader__scene-stage">
          <PreloaderCanvas
            coverContent={coverContent}
            isOpening={isOpening}
            isReady={isLoaded}
            onOpenComplete={handleOpenComplete}
            onSealActivate={handleOpen}
            onSealReady={() => setIsSealReady(true)}
            reducedMotion={reducedMotion}
          />
        </div>
        <div className="preloader__progress-panel">
          <div className="preloader__progress-track" role="progressbar" aria-label="Preparing your invitation" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress} aria-valuetext={loadingMessage}>
            <div className="preloader__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="preloader__progress-meta">
            <span className="preloader__progress-message" role="status" aria-live="polite">{loadingMessage}</span>
            <span className="preloader__progress-value">{progress}%</span>
          </div>
        </div>
        <p className="preloader__hint" aria-live="polite">{isSealReady ? preloaderConfig.sealHint : 'Preparing the seal...'}</p>
        <button type="button" className="preloader__cta" onClick={handleOpen} disabled={!isSealReady || isOpening} aria-label={format(preloaderConfig.openLabel)}>
          <span>{format(preloaderConfig.openLabel)}</span>
          <Heart className="preloader__cta-icon" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

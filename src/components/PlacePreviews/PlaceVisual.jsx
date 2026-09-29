import React, { useRef, useState, useLayoutEffect } from 'react';
import { resolveAssetUrl } from '../../utils/assets';
import MuseumLogo from './MuseumLogo';
import aquariumShark from './aquarium-shark.svg';

/**
 * PlaceVisual:
 * Displays the destination's full-bleed background image with smooth fade-in.
 * Displays rich animated SVG fallback artwork when media is absent, loading, or on error.
 */
export function PlaceVisual({ place, isActive }) {
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const media = place.media;
  const mediaKey = `${place.id}:${media?.type ?? ''}:${media?.src ?? ''}`;
  const committedMediaKeyRef = useRef(mediaKey);

  useLayoutEffect(() => {
    committedMediaKeyRef.current = mediaKey;
    setMediaLoaded(false);
    setHasError(false);
  }, [mediaKey]);

  const renderArtwork = () => {
    switch (place.id) {
      case 'aquarium':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-sky-900 via-blue-800 to-indigo-950 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/30 via-transparent to-transparent animate-pulse" />
            <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="absolute inset-0 h-full w-full">
              <circle cx="230" cy="60" r="5" fill="#e0f2fe" opacity="0.6" className="animate-bounce" />
              <circle cx="240" cy="45" r="8" fill="#e0f2fe" opacity="0.5" className="animate-floatSlow" />
              <circle cx="80" cy="50" r="6" fill="#e0f2fe" opacity="0.7" className="animate-float" />
              <path d="M20 200 Q30 160 45 200 Q60 150 75 200" fill="#f472b6" opacity="0.4" />
              <path d="M260 200 Q280 155 295 200 Q305 165 315 200" fill="#a78bfa" opacity="0.4" />
            </svg>
            <img src={aquariumShark} alt="" className="aquarium-shark relative z-10 h-auto w-[68.834%] max-w-[255px]" />
          </div>
        );

      case 'cinema':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-purple-950 via-slate-900 to-rose-950 flex items-center justify-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-full bg-gradient-to-b from-amber-200/25 via-pink-300/10 to-transparent blur-sm" />
            <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
              <path d="M120 90 L130 165 L190 165 L200 90 Z" fill="#f43f5e" />
              <path d="M136 90 L142 165 M154 90 L156 165 M170 90 L168 165 M184 90 L178 165" stroke="#ffffff" strokeWidth="4" />
              <circle cx="140" cy="82" r="10" fill="#fef08a" />
              <circle cx="160" cy="76" r="12" fill="#fef08a" />
              <circle cx="180" cy="82" r="10" fill="#fef08a" />
              <circle cx="150" cy="68" r="11" fill="#fde047" />
              <circle cx="170" cy="70" r="10" fill="#fde047" />
              <rect x="50" y="70" width="45" height="28" rx="3" fill="#fbcfe8" transform="rotate(-15 70 80)" />
              <circle cx="50" cy="84" r="5" fill="#1e1b4b" transform="rotate(-15 70 80)" />
              <circle cx="95" cy="84" r="5" fill="#1e1b4b" transform="rotate(-15 70 80)" />
              <path d="M240 70 L243 78 L251 78 L245 83 L247 91 L240 86 L233 91 L235 83 L229 78 L237 78 Z" fill="#fde047" className="animate-pulse" />
              <path d="M75 40 L77 45 L82 45 L78 48 L80 53 L75 50 L70 53 L72 48 L68 45 L73 45 Z" fill="#fde047" className="animate-float" />
            </svg>
          </div>
        );

      case 'museum':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent animate-pulse" />
            <MuseumLogo className="relative z-10 h-[80%] w-[62%] max-w-[203px]" wall="#B9803F" />
          </div>
        );

      default:
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-pink-950 via-fuchsia-950 to-slate-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-500/20 via-transparent to-transparent" />
            <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
              <circle cx="160" cy="100" r="40" fill="#f472b6" opacity="0.5" className="animate-pulse" />
            </svg>
          </div>
        );
    }
  };

  const mediaUrl = media?.src ? resolveAssetUrl(media.src) : null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div aria-hidden="true" className="w-full h-full">
        {mediaUrl && !hasError && (
          <img
            key={mediaKey}
            src={mediaUrl}
            alt=""
            onLoad={() => {
              if (committedMediaKeyRef.current === mediaKey) {
                setMediaLoaded(true);
              }
            }}
            onError={() => {
              if (committedMediaKeyRef.current === mediaKey) {
                setHasError(true);
              }
            }}
            className={`destination-book-selector__media absolute inset-0 h-full w-full object-cover transition-opacity duration-[720ms] motion-reduce:duration-[120ms] ${
              mediaLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {(!mediaLoaded || hasError) && renderArtwork()}
      </div>
    </div>
  );
}

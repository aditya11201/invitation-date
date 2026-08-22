import React, { useRef, useState, useLayoutEffect } from 'react';
import { resolveAssetUrl } from '../../utils/assets';

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
            <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="w-full h-full text-cyan-200">
              <defs>
                <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path
                d="M160 80 Q190 70 230 85 Q190 100 160 120 Q130 100 90 85 Q130 70 160 80 Z"
                fill="url(#waterGrad)"
                className="animate-float"
              />
              <path d="M160 120 Q160 145 163 160" stroke="#bae6fd" strokeWidth="2.5" fill="none" />
              <circle cx="90" cy="130" r="14" fill="#fb923c" />
              <path d="M85 122 Q95 130 85 138" stroke="#ffffff" strokeWidth="3" fill="none" />
              <circle cx="230" cy="60" r="5" fill="#e0f2fe" opacity="0.6" className="animate-bounce" />
              <circle cx="240" cy="45" r="8" fill="#e0f2fe" opacity="0.5" className="animate-floatSlow" />
              <circle cx="80" cy="50" r="6" fill="#e0f2fe" opacity="0.7" className="animate-float" />
              <path d="M20 200 Q30 160 45 200 Q60 150 75 200" fill="#f472b6" opacity="0.4" />
              <path d="M260 200 Q280 155 295 200 Q305 165 315 200" fill="#a78bfa" opacity="0.4" />
            </svg>
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
            <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="w-full h-full text-amber-200">
              <defs>
                <linearGradient id="museumPillars" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde68a" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <polygon points="160,50 65,82 255,82" fill="url(#museumPillars)" />
              <rect x="75" y="82" width="170" height="8" rx="2" fill="#fcd34d" />
              <rect x="90" y="90" width="14" height="62" rx="2" fill="#fed7aa" />
              <rect x="130" y="90" width="14" height="62" rx="2" fill="#fed7aa" />
              <rect x="176" y="90" width="14" height="62" rx="2" fill="#fed7aa" />
              <rect x="216" y="90" width="14" height="62" rx="2" fill="#fed7aa" />
              <rect x="70" y="152" width="180" height="12" rx="2" fill="#fcd34d" />
              <rect x="140" y="104" width="40" height="34" rx="3" stroke="#f59e0b" strokeWidth="2" fill="#78350f" opacity="0.8" />
              <circle cx="160" cy="120" r="8" fill="#fbbf24" opacity="0.9" className="animate-pulse" />
              <circle cx="55" cy="65" r="4" fill="#fef08a" opacity="0.6" className="animate-floatSlow" />
              <circle cx="265" cy="68" r="5" fill="#fef08a" opacity="0.5" className="animate-float" />
            </svg>
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

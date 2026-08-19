import React, { useRef, useState, useEffect } from 'react';
import { resolveAssetUrl } from '../../utils/assets';

/**
 * PlaceVisual:
 * Only mounts and plays the active destination's video with preload="none" for optimal mobile performance.
 * Displays rich animated SVG fallback artwork when video is absent, inactive, or loading.
 */
export function PlaceVisual({ place, isActive }) {
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset video loaded state when place or active state changes
  useEffect(() => {
    if (!isActive) {
      setVideoLoaded(false);
    }
  }, [isActive]);

  // Attempt playback only for active card
  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy or video asset not found
        setHasError(true);
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [isActive]);

  const renderArtwork = () => {
    switch (place.id) {
      case 'aquarium':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-sky-900 via-blue-800 to-indigo-950 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/30 via-transparent to-transparent animate-pulse" />
            <svg viewBox="0 0 320 200" className="w-full h-full text-cyan-200">
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
            <div className="absolute bottom-3 left-4 text-xs font-semibold tracking-wider text-cyan-200 uppercase bg-sky-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-cyan-400/30 flex items-center gap-1.5">
              <span>🐠 Underwater Realm</span>
            </div>
          </div>
        );

      case 'cinema':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-purple-950 via-slate-900 to-rose-950 flex items-center justify-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-full bg-gradient-to-b from-amber-200/25 via-pink-300/10 to-transparent blur-sm" />
            <svg viewBox="0 0 320 200" className="w-full h-full">
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
            <div className="absolute bottom-3 left-4 text-xs font-semibold tracking-wider text-pink-200 uppercase bg-purple-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-pink-400/30 flex items-center gap-1.5">
              <span>🍿 Cozy Screening</span>
            </div>
          </div>
        );

      case 'ragunan':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-900 via-teal-950 to-amber-950 flex items-center justify-center overflow-hidden">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl" />
            <svg viewBox="0 0 320 200" className="w-full h-full">
              <path
                d="M110 160 L110 130 Q110 95 150 95 Q175 95 190 110 Q205 105 215 115 Q225 125 220 145 Q215 155 205 150 L205 135 Q195 125 185 130 L185 160 L170 160 L170 140 L145 140 L145 160 Z"
                fill="#a7f3d0"
                opacity="0.9"
              />
              <circle cx="195" cy="115" r="3" fill="#064e3b" />
              <path d="M195 85 C195 80 185 75 185 85 C185 95 195 102 195 102 C195 102 205 95 205 85 C205 75 195 80 195 85 Z" fill="#f43f5e" className="animate-float" />
              <path d="M30 200 Q20 120 70 110 Q50 150 70 200" fill="#059669" opacity="0.8" />
              <path d="M260 200 Q290 110 240 100 Q270 140 250 200" fill="#10b981" opacity="0.7" />
              <circle cx="85" cy="70" r="4" fill="#fbbf24" className="animate-bounce" />
              <circle cx="235" cy="60" r="3" fill="#f472b6" className="animate-floatSlow" />
            </svg>
            <div className="absolute bottom-3 left-4 text-xs font-semibold tracking-wider text-emerald-200 uppercase bg-emerald-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
              <span>🐘 Zoo Adventure</span>
            </div>
          </div>
        );

      case 'dufan':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-amber-950 via-rose-950 to-indigo-950 flex items-center justify-center overflow-hidden">
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-orange-500/25 via-pink-500/15 to-transparent" />
            <svg viewBox="0 0 320 200" className="w-full h-full">
              <circle cx="160" cy="100" r="45" stroke="#fcd34d" strokeWidth="2.5" fill="none" opacity="0.8" />
              <circle cx="160" cy="100" r="2" fill="#fcd34d" />
              <line x1="160" y1="55" x2="160" y2="145" stroke="#fcd34d" strokeWidth="1.5" opacity="0.6" />
              <line x1="115" y1="100" x2="205" y2="100" stroke="#fcd34d" strokeWidth="1.5" opacity="0.6" />
              <circle cx="160" cy="55" r="5" fill="#f43f5e" />
              <circle cx="160" cy="145" r="5" fill="#f43f5e" />
              <circle cx="115" cy="100" r="5" fill="#a855f7" />
              <circle cx="205" cy="100" r="5" fill="#a855f7" />
              <line x1="160" y1="100" x2="135" y2="175" stroke="#fed7aa" strokeWidth="3" />
              <line x1="160" y1="100" x2="185" y2="175" stroke="#fed7aa" strokeWidth="3" />
              <path d="M40 160 Q80 40 120 120 T200 130 T280 90" stroke="#fb7185" strokeWidth="3" fill="none" strokeDasharray="6 3" />
              <circle cx="90" cy="50" r="3" fill="#ffffff" className="animate-ping" />
              <circle cx="230" cy="40" r="2.5" fill="#fef08a" className="animate-pulse" />
            </svg>
            <div className="absolute bottom-3 left-4 text-xs font-semibold tracking-wider text-amber-200 uppercase bg-amber-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
              <span>🎢 Sunset & Thrills</span>
            </div>
          </div>
        );

      case 'lego':
      default:
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-pink-950 via-fuchsia-950 to-slate-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-500/20 via-transparent to-transparent" />
            <svg viewBox="0 0 320 200" className="w-full h-full">
              <g transform="translate(110, 80)" className="animate-float">
                <rect x="0" y="10" width="70" height="35" rx="4" fill="#ec4899" />
                <rect x="8" y="2" width="14" height="10" rx="2" fill="#f472b6" />
                <rect x="28" y="2" width="14" height="10" rx="2" fill="#f472b6" />
                <rect x="48" y="2" width="14" height="10" rx="2" fill="#f472b6" />
              </g>
              <g transform="translate(140, 42)" className="animate-floatSlow">
                <rect x="0" y="8" width="50" height="30" rx="4" fill="#a855f7" />
                <rect x="6" y="2" width="14" height="8" rx="2" fill="#c084fc" />
                <rect x="30" y="2" width="14" height="8" rx="2" fill="#c084fc" />
              </g>
              <circle cx="165" cy="57" r="4" fill="#ffffff" />
              <rect x="60" y="60" width="16" height="16" rx="3" fill="#fbbf24" transform="rotate(25 68 68)" className="animate-bounce" />
              <rect x="235" y="110" width="18" height="18" rx="3" fill="#38bdf8" transform="rotate(-15 244 119)" className="animate-float" />
            </svg>
            <div className="absolute bottom-3 left-4 text-xs font-semibold tracking-wider text-pink-200 uppercase bg-pink-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-pink-400/30 flex items-center gap-1.5">
              <span>🧱 Build & Love</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* Only load and render video for active card */}
      {isActive && place.video && !hasError && (
        <video
          ref={videoRef}
          src={resolveAssetUrl(place.video)}
          poster={resolveAssetUrl(place.poster)}
          preload="none"
          playsInline
          muted
          loop
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Fallback Artwork always available underneath */}
      {(!videoLoaded || !isActive || hasError) && renderArtwork()}
    </div>
  );
}

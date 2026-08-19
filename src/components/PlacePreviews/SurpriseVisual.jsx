import React, { useState } from 'react';
import { resolveAssetUrl } from '../../utils/assets';

export function SurpriseVisual({ gifSrc, title }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = resolveAssetUrl(gifSrc);

  return (
    <div className="relative w-full aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-tr from-pink-200 via-purple-100 to-rose-100 flex items-center justify-center p-2 shadow-inner">
      {/* Real GIF if provided */}
      {resolvedSrc && !hasError && (
        <img
          src={resolvedSrc}
          alt={title || "Surprise Date Reveal"}
          onLoad={() => setImgLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Romantic Animated SVG Art Fallback */}
      {(!imgLoaded || hasError) && (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
          {/* Radial soft light */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-400/30 via-purple-300/20 to-transparent animate-pulse" />

          {/* SVG Romantic Bears / Love Heart Celebration */}
          <svg viewBox="0 0 320 220" className="w-48 sm:w-56 h-auto drop-shadow-md">
            <defs>
              <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            {/* Left Cute Bear */}
            <circle cx="120" cy="130" r="32" fill="#e0d6c9" />
            <circle cx="98" cy="104" r="10" fill="#e0d6c9" />
            <circle cx="98" cy="104" r="6" fill="#fbcfe8" />
            <circle cx="142" cy="104" r="10" fill="#e0d6c9" />
            <circle cx="142" cy="104" r="6" fill="#fbcfe8" />
            {/* Left bear face */}
            <circle cx="112" cy="126" r="3.5" fill="#374151" />
            <circle cx="128" cy="126" r="3.5" fill="#374151" />
            <ellipse cx="120" cy="134" rx="7" ry="5" fill="#ffffff" />
            <circle cx="120" cy="133" r="2.5" fill="#1f2937" />
            <circle cx="106" cy="133" r="4" fill="#f472b6" opacity="0.6" />
            <circle cx="134" cy="133" r="4" fill="#f472b6" opacity="0.6" />

            {/* Right Cute Bear */}
            <circle cx="200" cy="130" r="32" fill="#fed7aa" />
            <circle cx="178" cy="104" r="10" fill="#fed7aa" />
            <circle cx="178" cy="104" r="6" fill="#fbcfe8" />
            <circle cx="222" cy="104" r="10" fill="#fed7aa" />
            <circle cx="222" cy="104" r="6" fill="#fbcfe8" />
            {/* Right bear face */}
            <circle cx="192" cy="126" r="3.5" fill="#374151" />
            <circle cx="208" cy="126" r="3.5" fill="#374151" />
            <ellipse cx="200" cy="134" rx="7" ry="5" fill="#ffffff" />
            <circle cx="200" cy="133" r="2.5" fill="#1f2937" />
            <circle cx="186" cy="133" r="4" fill="#f472b6" opacity="0.6" />
            <circle cx="214" cy="133" r="4" fill="#f472b6" opacity="0.6" />

            {/* Giant pulsing love heart above them */}
            <g className="animate-float">
              <path
                d="M160 85 C160 55 125 45 125 75 C125 105 160 120 160 120 C160 120 195 105 195 75 C195 45 160 55 160 85 Z"
                fill="url(#heartGrad)"
                className="drop-shadow-lg"
              />
              <circle cx="145" cy="68" r="4" fill="#ffffff" opacity="0.8" />
            </g>

            {/* Floating sparkle stars */}
            <circle cx="70" cy="80" r="3" fill="#fbbf24" className="animate-ping" />
            <circle cx="250" cy="75" r="4" fill="#f472b6" className="animate-bounce" />
            <circle cx="160" cy="30" r="3" fill="#ec4899" className="animate-pulse" />
          </svg>

          <span className="text-xs font-semibold tracking-wider text-pink-600 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-pink-200 shadow-sm mt-1">
            ✨ Pure Happiness ✨
          </span>
        </div>
      )}
    </div>
  );
}

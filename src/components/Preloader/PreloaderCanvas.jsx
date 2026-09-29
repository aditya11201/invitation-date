import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { resolveFallbackSealLabel, isFallbackSealDisabled } from './preloaderStages.js';
import {
  getStampFlapPose,
  scheduleCoverWriting,
  smoothstep,
  STAMP_FLAP_DURATION_MS,
} from './coverWriting.js';
import {
  createEnvelopeScene,
  getEnvelopeCameraDistance,
  DRAG_THRESHOLD_PX,
  clampPointerPosition,
  computeDragRotation,
  computeEnvelopeTargetRotation,
  computeCanonicalOpenRotation,
  getBaseYaw,
  ENVELOPE_OPEN_FINAL_STATE,
  ENVELOPE_OPEN_TIMING,
  isActivePointer,
  isPrimaryPointerDown,
  isDragMovement,
  isSealReady,
  canArmPointerDown,
  shouldActivateSeal,
  shouldUpdatePointerHover,
} from './envelopeScene.js';

function getCoverTextLines({ recipientName, senderName, headline, subtext }) {
  return [
    {
      text: `FROM: ${senderName || 'Your Secret Admirer'}`,
      segments: Array.from(`FROM: ${senderName || 'Your Secret Admirer'}`),
      x: 100,
      y: 140,
      font: "italic 44px 'Cormorant Garamond', Georgia, serif",
      color: '#fce7f3',
    },
    {
      text: `TO: ${recipientName || 'you'} ✨`,
      segments: Array.from(`TO: ${recipientName || 'you'} ✨`),
      x: 100,
      y: 260,
      font: "bold 64px 'Cormorant Garamond', Georgia, serif",
      color: '#fce7f3',
    },
    {
      text: headline || 'A Sealed Secret',
      segments: Array.from(headline || 'A Sealed Secret'),
      x: 100,
      y: 520,
      font: "bold 68px 'Cormorant Garamond', Georgia, serif",
      color: '#ffffff',
    },
    {
      text: subtext || 'is waiting for you...',
      segments: Array.from(subtext || 'is waiting for you...'),
      x: 100,
      y: 620,
      font: "italic 64px 'Cormorant Garamond', Georgia, serif",
      color: '#fce7f3',
    },
  ];
}

/** Everything on the cover EXCEPT the four handwritten text lines. */
// roundRect with a manual arcTo fallback for older browsers.
function traceRoundRect(context, x, y, width, height, radius) {
  if (typeof context.roundRect === 'function') {
    context.roundRect(x, y, width, height, radius);
    return;
  }
  const r = Math.min(radius, width / 2, height / 2);
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

const STAMP_VIEWBOX_WIDTH = 448;
const STAMP_VIEWBOX_HEIGHT = 560;
const FOREVER_STAMP_WIDTH = 200;
const FOREVER_STAMP_HEIGHT = 240;

const STAMP_PATH_DATA = {
  farWing: 'M266 250 C252 210 230 152 200 96 Q242 132 252 170 Q258 202 262 232 Q265 248 268 252 Z',
  farFeathers: 'M262 244 Q250 198 233 140',
  tail: 'M222 290 C178 290 134 304 92 326 Q84 356 102 372 Q102 400 128 406 Q168 396 214 312 Z',
  tailFeathers: 'M220 292 Q162 300 106 320 M218 298 Q164 326 112 366 M216 304 Q172 344 138 396',
  bodyAndHead: `M252 184 C258 172 274 167 286 175 C294 180 299 188 301 198
                       C302 208 298 218 290 226 C298 236 308 250 311 266
                       C313 284 304 300 288 310 C268 322 236 328 208 322
                       C184 316 166 306 154 292 C150 282 154 270 164 262
                       C180 248 208 238 236 232 C244 222 246 200 252 184 Z`,
  nearWing: 'M258 252 C240 216 210 156 152 98 Q146 130 166 158 Q172 196 198 224 Q210 258 244 268 Z',
  nearFeathers: 'M252 248 Q206 206 172 152 M254 252 Q228 240 202 222',
  beak: 'M294 199 C310 204 328 216 340 233 C322 232 304 226 292 220 Z',
  envelopeFlap: 'M0 0 L88 0 44 34 Z',
  heart: `M44 61 C41 58 31 51.5 31 44.5 C31 38.8 34.7 35 39.5 35 C41.8 35 44 36.7 44 38.8
                            C44 36.7 46.2 35 48.5 35 C53.3 35 57 38.8 57 44.5 C57 51.5 47 58 44 61 Z`,
};

function createStampNoiseTile() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  const image = context.createImageData(canvas.width, canvas.height);
  let seed = 7;

  for (let index = 0; index < image.data.length; index += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const value = seed >>> 24;
    image.data[index] = value;
    image.data[index + 1] = value;
    image.data[index + 2] = value;
    image.data[index + 3] = 255;
  }

  context.putImageData(image, 0, 0);
  return canvas;
}

function createForeverStampArtwork() {
  const canvas = document.createElement('canvas');
  canvas.width = STAMP_VIEWBOX_WIDTH;
  canvas.height = STAMP_VIEWBOX_HEIGHT;
  const context = canvas.getContext('2d');
  const paths = Object.fromEntries(
    Object.entries(STAMP_PATH_DATA).map(([key, data]) => [key, new Path2D(data)]),
  );

  return { canvas, context, paths, noiseTile: createStampNoiseTile() };
}

function drawStampBackground(context) {
  const centerX = STAMP_VIEWBOX_WIDTH * 0.5;
  const centerY = STAMP_VIEWBOX_HEIGHT * 0.38;
  const radiusX = STAMP_VIEWBOX_WIDTH * 0.78;
  const radiusYScale = STAMP_VIEWBOX_HEIGHT / STAMP_VIEWBOX_WIDTH;
  context.save();
  context.translate(0, centerY);
  context.scale(1, radiusYScale);
  context.translate(0, -centerY);
  const redGrad = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radiusX);
  redGrad.addColorStop(0, '#C14A5A');
  redGrad.addColorStop(0.55, '#B83A4B');
  redGrad.addColorStop(1, '#7A2030');
  context.fillStyle = redGrad;
  const fillTop = centerY - centerY / radiusYScale;
  const fillBottom = centerY + (STAMP_VIEWBOX_HEIGHT - centerY) / radiusYScale;
  context.fillRect(0, fillTop, STAMP_VIEWBOX_WIDTH, fillBottom - fillTop);
  context.restore();
}

function drawStampGrain(context, noiseTile) {
  context.save();
  context.globalAlpha = 0.08;
  context.fillStyle = context.createPattern(noiseTile, 'repeat');
  context.fillRect(0, 0, STAMP_VIEWBOX_WIDTH, STAMP_VIEWBOX_HEIGHT);
  context.restore();
}

function drawStampWing(context, path, feathers, pivotX, pivotY, angleDegrees, fill, featherColor, featherWidth) {
  context.save();
  context.translate(pivotX, pivotY);
  context.rotate((angleDegrees * Math.PI) / 180);
  context.translate(-pivotX, -pivotY);
  context.fillStyle = fill;
  context.fill(path);
  context.strokeStyle = featherColor;
  context.lineWidth = featherWidth;
  context.lineCap = 'round';
  context.stroke(feathers);
  context.restore();
}

function drawStampDove(context, paths, pose) {
  context.save();
  context.translate(0, 28 + (pose?.doveBobY || 0));

  drawStampWing(
    context,
    paths.farWing,
    paths.farFeathers,
    266,
    250,
    pose?.farWingRotationDegrees || 0,
    '#f6c4cf',
    '#7A2030',
    2.2,
  );

  context.fillStyle = '#fff';
  context.fill(paths.tail);
  context.strokeStyle = '#c2231e';
  context.lineWidth = 2.6;
  context.lineCap = 'round';
  context.stroke(paths.tailFeathers);

  context.fillStyle = '#fff';
  context.fill(paths.bodyAndHead);

  drawStampWing(
    context,
    paths.nearWing,
    paths.nearFeathers,
    250,
    258,
    pose?.nearWingRotationDegrees || 0,
    '#fff',
    '#c2231e',
    2.6,
  );

  context.fillStyle = '#c2231e';
  context.beginPath();
  context.arc(284, 195, 3.6, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#fff';
  context.beginPath();
  context.arc(285.4, 193.6, 1.15, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#f294ac';
  context.fill(paths.beak);

  context.save();
  context.translate(316, 226);
  context.rotate((9 * Math.PI) / 180);
  context.translate(24, 3);
  context.rotate(((pose?.envelopeSwingDegrees || 0) * Math.PI) / 180);
  context.translate(-24, -3);
  context.fillStyle = '#f8b6c6';
  context.beginPath();
  traceRoundRect(context, 0, 0, 88, 66, 4);
  context.fill();
  context.fillStyle = '#f091ac';
  context.strokeStyle = '#f091ac';
  context.lineWidth = 4;
  context.lineJoin = 'round';
  context.fill(paths.envelopeFlap);
  context.stroke(paths.envelopeFlap);
  context.fillStyle = '#c2231e';
  context.fill(paths.heart);
  context.restore();
  context.restore();
}

function drawTrackedStampText(context, text, rightX, y, tracking) {
  context.save();
  context.textAlign = 'right';
  if (typeof context.letterSpacing === 'string') {
    context.letterSpacing = `${tracking}px`;
    context.fillText(text, rightX, y);
    context.restore();
    return;
  }

  const letters = Array.from(text);
  const widths = letters.map((letter) => context.measureText(letter).width);
  const startX = rightX - context.measureText(text).width - tracking * (letters.length - 1);
  context.textAlign = 'left';
  letters.forEach((letter, index) => {
    const prefix = index === 0
      ? 0
      : context.measureText(text.slice(0, index + 1)).width - widths[index];
    context.fillText(letter, startX + prefix + tracking * index, y);
  });
  context.restore();
}

function drawStampText(context) {
  context.fillStyle = '#fff';
  context.textBaseline = 'alphabetic';
  context.save();
  context.translate(38, 84);
  context.rotate((-4 * Math.PI) / 180);
  context.font = "600 47px 'Caveat', cursive";
  context.textAlign = 'left';
  context.fillText('forever', 0, 0);
  context.restore();

  context.font = "600 26px 'Plus Jakarta Sans', sans-serif";
  drawTrackedStampText(context, 'USA', 418, 506, 4);
  context.font = "400 16px 'Plus Jakarta Sans', sans-serif";
  drawTrackedStampText(context, '2024', 418, 531, 3.5);
}

function punchStampPerforations(context) {
  context.save();
  context.globalCompositeOperation = 'destination-out';
  const punch = (x, y) => {
    context.beginPath();
    context.arc(x, y, 6, 0, Math.PI * 2);
    context.fill();
  };
  for (let x = 0; x <= STAMP_VIEWBOX_WIDTH; x += 16) {
    punch(x, 0);
    punch(x, STAMP_VIEWBOX_HEIGHT);
  }
  for (let y = 0; y <= STAMP_VIEWBOX_HEIGHT; y += 16) {
    punch(0, y);
    punch(STAMP_VIEWBOX_WIDTH, y);
  }
  context.restore();
}

function drawForeverStamp(context, canvas, artwork, pose = null) {
  const stampContext = artwork.context;
  stampContext.clearRect(0, 0, STAMP_VIEWBOX_WIDTH, STAMP_VIEWBOX_HEIGHT);
  drawStampBackground(stampContext);
  drawStampDove(stampContext, artwork.paths, pose);
  drawStampText(stampContext);
  drawStampGrain(stampContext, artwork.noiseTile);
  punchStampPerforations(stampContext);

  const scale = Math.min(FOREVER_STAMP_WIDTH / STAMP_VIEWBOX_WIDTH, FOREVER_STAMP_HEIGHT / STAMP_VIEWBOX_HEIGHT);
  const width = STAMP_VIEWBOX_WIDTH * scale;
  const height = STAMP_VIEWBOX_HEIGHT * scale;
  const x = canvas.width - 280 + (FOREVER_STAMP_WIDTH - width) / 2;
  context.drawImage(artwork.canvas, x, 80, width, height);
}

function drawCoverStatic(context, canvas, content, stampArtwork, stampPose = null) {

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ec4899';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = '#fce7f3';
  context.lineWidth = 14;
  context.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

  context.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  context.lineWidth = 3.5;
  context.strokeRect(56, 56, canvas.width - 112, canvas.height - 112);

  drawForeverStamp(context, canvas, stampArtwork, stampPose);
}

/** Draws `charCount` characters of a line, returns the pen-tip position. */
function drawCoverTextLine(context, line, charCount) {
  context.font = line.font;
  context.fillStyle = line.color;
  context.textAlign = 'left';
  const partial = line.segments.slice(0, charCount).join('');
  context.fillText(partial, line.x, line.y);
  return { x: line.x + context.measureText(partial).width + 6, y: line.y };
}

function drawCoverCanvas(context, canvas, content, stampArtwork, stampPose = null) {
  drawCoverStatic(context, canvas, content, stampArtwork, stampPose);
  getCoverTextLines(content).forEach((line) => {
    drawCoverTextLine(context, line, line.segments.length);
  });
}

const COVER_WRITING_MS = 2500;
const COVER_LINE_TRAVEL_MS = 160;
const COVER_PENCIL_WIDTH = 40;
const COVER_PENCIL_HEIGHT = 216;
// The SVG nib points down. A 126° nib angle becomes a +36° canvas rotation,
// placing the barrel up-right from the planted tip (about 36° off vertical).
const COVER_PENCIL_BASE_ANGLE = Math.PI * 0.7;
const COVER_PENCIL_WOBBLE = (2.5 * Math.PI) / 180;
const COVER_PENCIL_STRAIGHTEN = (6 * Math.PI) / 180;
const COVER_PENCIL_LIFT_ROTATION = (10 * Math.PI) / 180;
const COVER_PENCIL_LIFT_HEIGHT = 40;

function createWritingPencilSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 520;
  const context = canvas.getContext('2d');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="260" viewBox="0 0 48 260">
    <defs>
      <linearGradient id="silver-ferrule" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#837776"/>
        <stop offset=".22" stop-color="#c9c3c1"/>
        <stop offset=".5" stop-color="#ffffff"/>
        <stop offset=".78" stop-color="#c9c3c1"/>
        <stop offset="1" stop-color="#837776"/>
      </linearGradient>
      <linearGradient id="yellow-facets" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#a87428"/>
        <stop offset=".2" stop-color="#f3c64d"/>
        <stop offset=".5" stop-color="#fff0a2"/>
        <stop offset=".8" stop-color="#f3c64d"/>
        <stop offset="1" stop-color="#a87428"/>
      </linearGradient>
    </defs>
    <path d="M16 60h16l3 7v121l-5 9H18l-5-9V67z" fill="url(#yellow-facets)" stroke="#4a4038" stroke-width="5" stroke-linejoin="round"/>
    <path d="M18 69v113M30 69v113" fill="none" stroke="#a87428" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M24 68v123" fill="none" stroke="#fff0a2" stroke-width="4" stroke-linecap="round"/>
    <path d="M13 47h22v19H13z" fill="url(#silver-ferrule)" stroke="#4a4038" stroke-width="5" stroke-linejoin="round"/>
    <path d="M17 54h14M17 60h14" fill="none" stroke="#837776" stroke-width="2" stroke-linecap="round"/>
    <path d="M13 188h22l-11 49z" fill="#e9c98b" stroke="#4a4038" stroke-width="5" stroke-linejoin="round"/>
    <path d="M17 194c3 10 4 23 6 38M31 194c-3 10-4 23-6 38" fill="none" stroke="#a87428" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M20 229h8l-4 29z" fill="#212121" stroke="#4a4038" stroke-width="5" stroke-linejoin="round"/>
    <path d="M13 49V23c0-8 5-13 11-13s11 5 11 13v26z" fill="#e98f9d" stroke="#4a4038" stroke-width="5" stroke-linejoin="round"/>
    <ellipse cx="20" cy="22" rx="2.5" ry="5" fill="#ffffff" opacity=".9"/>
  </svg>`;
  const image = new Image();
  const ready = new Promise((resolve) => {
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(true);
    };
    image.onerror = () => resolve(false);
  });
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return { canvas, ready };
}

/** Draws the pencil with its graphite tip at the measured cover-text point. */
function drawWritingHand(context, sprite, { point, angle = COVER_PENCIL_BASE_ANGLE, pressure = 0.8, lift = 0, press = 0 }) {
  if (!sprite || !point) return;

  const weight = Math.min(1, Math.max(0, pressure));
  const raised = Math.min(1, Math.max(0, lift));
  context.save();
  context.translate(point.x + 30, point.y + 6);
  const shadowScale = 1 + raised * 0.5;
  context.scale(shadowScale, shadowScale);
  const shadow = context.createRadialGradient(0, 0, 0, 0, 0, 18);
  shadow.addColorStop(0, `rgba(74,64,56,${0.13 * (1 - raised)})`);
  shadow.addColorStop(1, 'rgba(74,64,56,0)');
  context.fillStyle = shadow;
  context.beginPath();
  context.ellipse(0, 0, 15, 5, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.save();
  context.translate(point.x, point.y + press * 1.5);
  context.rotate(angle - Math.PI / 2);
  const scale = 0.98 + weight * 0.035;
  context.scale(scale, scale);
  context.drawImage(sprite, -COVER_PENCIL_WIDTH / 2, -COVER_PENCIL_HEIGHT, COVER_PENCIL_WIDTH, COVER_PENCIL_HEIGHT);
  context.restore();
}

/**
 * Reveals the four cover lines character-by-character over 2.5s, lifting and
 * travelling between baselines. The rAF loop stops on its final ink frame.
 */
function startCoverWriting({ context, canvas, content, texture, pencilSprite, stampArtwork, onComplete }) {
  const lines = getCoverTextLines(content);
  const lineLengths = lines.map((line) => {
    context.font = line.font;
    return context.measureText(line.text).width;
  });
  const schedule = scheduleCoverWriting(
    lineLengths,
    COVER_WRITING_MS,
    COVER_LINE_TRAVEL_MS,
  );
  let cancelled = false;
  let frameId = 0;
  let startTimestamp = null;

  const renderProgress = (elapsed) => {
    drawCoverStatic(context, canvas, content, stampArtwork);
    let pencilPose = null;

    for (let index = 0; index < schedule.length; index += 1) {
      const event = schedule[index];
      const line = lines[event.lineIndex];

      if (elapsed >= event.startMs && elapsed < event.endMs) {
        const lineProgress = (elapsed - event.startMs) / Math.max(1, event.endMs - event.startMs);
        const characterPosition = smoothstep(lineProgress) * line.segments.length;
        const charCount = Math.min(line.segments.length, Math.floor(characterPosition));
        const pen = drawCoverTextLine(context, line, charCount);

        // Let the tip glide into the next character while the actual copy
        // keeps its established one-character-at-a-time reveal.
        if (charCount < line.segments.length) {
          const nextText = line.segments.slice(0, charCount + 1).join('');
          const nextX = line.x + context.measureText(nextText).width + 6;
          pen.x += (nextX - pen.x) * (characterPosition - charCount);
        }

        const press = Math.sin(Math.PI * lineProgress);
        const linePhase = event.lineIndex * 0.9;
        pencilPose = {
          point: pen,
          angle: COVER_PENCIL_BASE_ANGLE
            - press * COVER_PENCIL_STRAIGHTEN
            + COVER_PENCIL_WOBBLE * Math.sin(elapsed * 0.018 + linePhase),
          pressure: 0.72 + 0.12 * (0.5 + 0.5 * Math.sin(elapsed * 0.012 + linePhase)) + press * 0.12,
          press,
          lift: 0,
        };
        break;
      }

      if (elapsed >= event.endMs) {
        drawCoverTextLine(context, line, line.segments.length);

        const nextEvent = schedule[index + 1];
        if (nextEvent && elapsed < event.travelEndMs) {
          const nextLine = lines[nextEvent.lineIndex];
          const from = drawCoverTextLine(context, line, line.segments.length);
          const to = drawCoverTextLine(context, nextLine, 0);
          const travelProgress = (elapsed - event.endMs) / Math.max(1, event.travelEndMs - event.endMs);
          const easedTravel = smoothstep(travelProgress);
          const lift = Math.sin(Math.PI * travelProgress);
          const linePhase = event.lineIndex * 0.9;
          pencilPose = {
            point: {
              x: from.x + (to.x - from.x) * easedTravel,
              y: from.y + (to.y - from.y) * easedTravel - lift * COVER_PENCIL_LIFT_HEIGHT,
            },
            angle: Math.atan2(to.y - from.y, to.x - from.x)
              + lift * COVER_PENCIL_LIFT_ROTATION
              + COVER_PENCIL_WOBBLE * Math.sin(elapsed * 0.018 + linePhase) * (1 - lift * 0.85),
            pressure: 0.28,
            lift,
            press: 0,
          };
          break;
        }
      } else if (elapsed < event.startMs) {
        break;
      }
    }

    if (pencilPose) drawWritingHand(context, pencilSprite, pencilPose);
    texture.needsUpdate = true;
  };

  const step = (timestamp) => {
    if (cancelled) {
      return;
    }

    if (startTimestamp === null) {
      startTimestamp = timestamp;
    }

    const elapsed = Math.min(COVER_WRITING_MS, timestamp - startTimestamp);

    if (elapsed >= COVER_WRITING_MS) {
      drawCoverCanvas(context, canvas, content, stampArtwork); // final frame without the hand
      texture.needsUpdate = true;
      onComplete?.();
      return;
    }

    renderProgress(elapsed);
    frameId = requestAnimationFrame(step);
  };

  frameId = requestAnimationFrame(step);

  return () => {
    cancelled = true;
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
  };
}

function createCoverTexture({
  recipientName,
  senderName,
  year,
  headline,
  subtext,
  skipWriting,
  onWriteComplete,
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1440;
  canvas.height = 960;
  const context = canvas.getContext('2d');
  const content = { recipientName, senderName, year, headline, subtext };
  const pencilSprite = skipWriting ? null : createWritingPencilSprite();
  const stampArtwork = createForeverStampArtwork();

  if (skipWriting) {
    drawCoverCanvas(context, canvas, content, stampArtwork);
  } else {
    drawCoverStatic(context, canvas, content, stampArtwork);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  let disposed = false;
  let writingStarted = false;
  let cancelWriting = () => {};
  let flapFrameId = 0;
  let flapStartTimestamp = null;
  let flapActive = false;
  let pendingFlap = false;

  const flapStamp = () => {
    if (skipWriting || disposed) return;
    if (flapActive) {
      pendingFlap = true;
      return;
    }

    flapActive = true;
    flapStartTimestamp = null;
    const step = (timestamp) => {
      if (disposed) return;
      if (flapStartTimestamp === null) flapStartTimestamp = timestamp;
      const elapsed = timestamp - flapStartTimestamp;
      const pose = getStampFlapPose(elapsed);
      drawCoverCanvas(context, canvas, content, stampArtwork, pose);
      texture.needsUpdate = true;

      if (elapsed >= STAMP_FLAP_DURATION_MS) {
        flapActive = false;
        flapFrameId = 0;
        flapStartTimestamp = null;
        drawCoverCanvas(context, canvas, content, stampArtwork);
        texture.needsUpdate = true;
        if (pendingFlap) {
          pendingFlap = false;
          flapStamp();
        }
        return;
      }

      flapFrameId = requestAnimationFrame(step);
    };

    flapFrameId = requestAnimationFrame(step);
  };

  const startWriting = () => {
    if (writingStarted || disposed) {
      return;
    }

    writingStarted = true;

    if (skipWriting) {
      drawCoverCanvas(context, canvas, content, stampArtwork);
      texture.needsUpdate = true;
      onWriteComplete?.();
      return;
    }

    pencilSprite.ready.then((spriteReady) => {
      if (disposed) return;
      cancelWriting = startCoverWriting({
        context,
        canvas,
        content,
        texture,
        stampArtwork,
        pencilSprite: spriteReady ? pencilSprite.canvas : null,
        onComplete: onWriteComplete,
      });
    });
  };

  // Absorbs the old fonts.ready redraw: writing only starts once font
  // metrics are final, so every written frame doubles as the repaint.
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      if (!disposed) {
        startWriting();
      }
    });
  } else {
    startWriting();
  }

  return {
    texture,
    flapStamp,
    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      cancelWriting();
      if (flapFrameId) cancelAnimationFrame(flapFrameId);
      flapActive = false;
      pendingFlap = false;
      texture.dispose();
    },
  };
}

function wrapCanvasText(context, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || context.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

/** Letter face paper texture, in step with the long paper sheet. */
function drawLetterCanvas(context, canvas, { badge, greeting, subtitle, scrollPrompt, recipientName }) {
  const width = canvas.width;
  const height = canvas.height;
  const radius = 32;

  // Fully transparent base — everything outside the roundRect stays clear.
  context.clearRect(0, 0, width, height);

  context.save();
  context.beginPath();
    traceRoundRect(context, 0, 0, width, height, radius);
  context.fillStyle = '#fbf6ec';
  context.fill();

  // Sheen is under the ruled stationery marks.
  context.clip();
  const sheen = context.createLinearGradient(0, 0, 0, height);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  sheen.addColorStop(1, 'rgba(185, 128, 63, 0.025)');
  context.fillStyle = sheen;
  context.fillRect(0, 0, width, height);

  // 34px blue-grey rules, with the rose margin and two subtle fold lines.
  context.lineWidth = 1;
  context.strokeStyle = 'rgba(139,157,193,.22)';
  context.beginPath();
  for (let y = 34; y < height; y += 34) {
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  context.stroke();

  context.strokeStyle = 'rgba(196,112,127,.4)';
  context.beginPath();
  context.moveTo(width * 0.085, 0);
  context.lineTo(width * 0.085, height);
  context.stroke();

  context.strokeStyle = 'rgba(120,90,60,.07)';
  context.beginPath();
  context.moveTo(width * 0.34, 0);
  context.lineTo(width * 0.34, height);
  context.moveTo(width * 0.67, 0);
  context.lineTo(width * 0.67, height);
  context.stroke();
  context.restore();

  // Subtle warm gold hairline (no drawn frame).
  context.save();
  context.beginPath();
    traceRoundRect(context, 3, 3, width - 6, height - 6, radius);
  context.strokeStyle = 'rgba(185, 128, 63, 0.35)';
  context.lineWidth = 2;
  context.stroke();
  context.restore();

  const centerX = width / 2;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Caveat handwriting greeting.
  context.font = "600 78px 'Caveat', cursive";
  context.fillStyle = '#4a4038';
  let cursorY = 250;
  wrapCanvasText(context, greeting || `For ${recipientName} 💗`, 560).forEach((lineText) => {
    context.fillText(lineText, centerX, cursorY);
    cursorY += 92;
  });

  // Italic Playfair subtitle, 60px below the greeting block.
  if (subtitle) {
    context.font = "italic 36px 'Playfair Display', Georgia, serif";
    context.fillStyle = 'rgba(138, 122, 109, 0.8)';
    let subtitleY = cursorY - 92 + 60;
    wrapCanvasText(context, subtitle, 520).forEach((lineText) => {
      context.fillText(lineText, centerX, subtitleY);
      subtitleY += 46;
    });
  }

  // Uppercase scroll prompt near the bottom edge.
  if (scrollPrompt) {
    context.font = "700 20px 'Plus Jakarta Sans', sans-serif";
    try {
      context.letterSpacing = '3px';
    } catch {
      // ignore
    }
    context.fillStyle = '#7c2d3a';
    context.fillText(String(scrollPrompt).toUpperCase(), centerX, height - 130);
  }

  try {
    context.letterSpacing = '0px';
  } catch {
    // ignore
  }
}

function createLetterTexture({ letterContent, onUpdate }) {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1013;
  const context = canvas.getContext('2d');
  const content = { ...letterContent };

  drawLetterCanvas(context, canvas, content);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  let disposed = false;

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      if (disposed) {
        return;
      }

      drawLetterCanvas(context, canvas, content);
      texture.needsUpdate = true;
      onUpdate?.();
    });
  }

  return {
    texture,
    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      texture.dispose();
    },
  };
}

function createDustField() {
  const pCount = 90;
  const positions = new Float32Array(pCount * 3);

  for (let index = 0; index < positions.length; index += 3) {
    positions[index] = THREE.MathUtils.randFloatSpread(14);
    positions[index + 1] = THREE.MathUtils.randFloatSpread(12);
    positions[index + 2] = THREE.MathUtils.randFloatSpread(8);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Soft heart sprites — keeps the preloader dust in the same love-particle
  // visual language as the floating hearts behind the paper sections.
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = 64;
  spriteCanvas.height = 64;
  const spriteContext = spriteCanvas.getContext('2d');
  spriteContext.translate(32, 34);
  spriteContext.scale(2, 2);
  spriteContext.beginPath();
  spriteContext.moveTo(0, 9);
  spriteContext.bezierCurveTo(-11, -1, -8, -12, 0, -6);
  spriteContext.bezierCurveTo(8, -12, 11, -1, 0, 9);
  spriteContext.closePath();
  const spriteGradient = spriteContext.createRadialGradient(0, -2, 1, 0, -2, 12);
  spriteGradient.addColorStop(0, 'rgba(244, 114, 182, 0.9)');
  spriteGradient.addColorStop(1, 'rgba(244, 114, 182, 0.15)');
  spriteContext.fillStyle = spriteGradient;
  spriteContext.fill();

  const heartSprite = new THREE.CanvasTexture(spriteCanvas);
  heartSprite.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.PointsMaterial({
    map: heartSprite,
    color: 0xffffff,
    size: 0.16,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    alphaTest: 0.02,
    sizeAttenuation: true,
  });

  return {
    points: new THREE.Points(geometry, material),
    geometry,
    material,
    sprite: heartSprite,
  };
}

function getPointerPosition(event, element) {
  const bounds = element.getBoundingClientRect();

  return clampPointerPosition(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
}

function applyOpenFinalState(envelope) {
  envelope.seal.scale.setScalar(ENVELOPE_OPEN_FINAL_STATE.sealScale);
  envelope.topFlapPivot.rotation.x = ENVELOPE_OPEN_FINAL_STATE.topFlapRotationX;
  envelope.group.position.y = ENVELOPE_OPEN_FINAL_STATE.groupY;
  envelope.letterMesh.position.y = ENVELOPE_OPEN_FINAL_STATE.letterY;
  envelope.letterMesh.position.z = ENVELOPE_OPEN_FINAL_STATE.letterZ;
  envelope.letterMesh.scale.setScalar(ENVELOPE_OPEN_FINAL_STATE.letterScale);
}

export default function PreloaderCanvas({
  isReady,
  isOpening,
  isSealReady: isSealReadyProp,
  reducedMotion,
  coverContent,
  letterContent,
  openLabel,
  onSealReady,
  onSealActivate,
  onOpenComplete,
  onLetterRect,
  onWebGLChange,
}) {
  const {
    recipientName,
    senderName,
    year,
    headline,
    subtext,
  } = coverContent;
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const callbacksRef = useRef({ onSealReady, onSealActivate, onOpenComplete, onLetterRect, onWebGLChange });
  const reducedMotionRef = useRef(reducedMotion);
  const lifecycleRef = useRef({
    flipStarted: false,
    flipComplete: false,
    openStarted: false,
    openComplete: false,
    stampOpenFlapStarted: false,
  });
  const sceneGenerationRef = useRef(0);
  const [sceneGeneration, setSceneGeneration] = useState(1);
  const fallbackReadyRef = useRef(false);
  const fallbackOpenRef = useRef(false);
  const [webGLAvailable, setWebGLAvailable] = useState(true);

  callbacksRef.current = { onSealReady, onSealActivate, onOpenComplete, onLetterRect, onWebGLChange };
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !webGLAvailable) {
      return undefined;
    }

    const nextSceneGeneration = sceneGenerationRef.current + 1;
    sceneGenerationRef.current = nextSceneGeneration;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf6f2ed, 0.018);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, getEnvelopeCameraDistance(width));

    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      container.appendChild(renderer.domElement);
    } catch (error) {
      if (renderer) {
        renderer.dispose();

        if (renderer.domElement?.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }

      console.warn('Preloader WebGL unavailable; using static envelope fallback.', error);
      setWebGLAvailable(false);
      callbacksRef.current.onWebGLChange?.(false);
      return undefined;
    }

    const coverTexture = createCoverTexture({
      recipientName,
      senderName,
      year,
      headline,
      subtext,
      skipWriting: reducedMotionRef.current,
      onWriteComplete: () => {
        // Writing finished → release a seal-ready that was parked by the
        // flip completion (or just record done-ness for the usual order).
        const currentState = sceneRef.current;
        if (!currentState) {
          return;
        }
        if (!reducedMotionRef.current) currentState.coverStampFlap?.();
        currentState.coverWriteDone = true;
        const firePendingSealReady = currentState.pendingSealFire;
        currentState.pendingSealFire = null;
        firePendingSealReady?.();
      },
    });
    const letterTexture = createLetterTexture({
      letterContent: { ...letterContent, recipientName },
      onUpdate: () => {
        if (reducedMotionRef.current && sceneRef.current) {
          sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
        }
      },
    });
    const envelope = createEnvelopeScene({
      coverTexture: coverTexture.texture,
      letterTexture: letterTexture.texture,
    });
    const dust = createDustField();
    scene.add(envelope.group);
    scene.add(dust.points);

    const lifecycle = lifecycleRef.current;

    if (lifecycle.flipComplete || lifecycle.openStarted || lifecycle.openComplete) {
      envelope.group.rotation.set(0, Math.PI, 0);
    }

    if (lifecycle.openComplete) {
      applyOpenFinalState(envelope);
    }

    scene.add(new THREE.AmbientLight(0xfff5f8, 1.45));

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.1);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const roseLight = new THREE.PointLight(0xf472b6, 2.4, 18);
    roseLight.position.set(-3, -2, 3);
    scene.add(roseLight);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const drag = {
      isPointerDown: false,
      dragMoved: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      startYaw: 0,
      startPitch: 0,
      yaw: 0,
      pitch: 0,
      startedOnSeal: false,
    };
    const clock = new THREE.Clock();
    let fallbackPointerListenersAttached = false;
    let removeFallbackPointerListeners = () => {};
    const resetDrag = () => {
      const activePointerId = drag.pointerId;

      if (activePointerId !== null && container.releasePointerCapture) {
        try {
          if (!container.hasPointerCapture || container.hasPointerCapture(activePointerId)) {
            container.releasePointerCapture(activePointerId);
          }
        } catch {
          // Ignore untracked pointer capture errors
        }
      }

      removeFallbackPointerListeners();
      drag.isPointerDown = false;
      drag.dragMoved = false;
      drag.pointerId = null;
      drag.startX = 0;
      drag.startY = 0;
      drag.startYaw = 0;
      drag.startPitch = 0;
      drag.startedOnSeal = false;
    };
    const state = {
      scene,
      camera,
      renderer,
      envelope,
      dust,
      raycaster,
      pointer,
      mouse,
      drag,
      clock,
      frameId: 0,
      generation: nextSceneGeneration,
      didFlip: lifecycle.flipStarted || lifecycle.flipComplete,
      flipComplete: lifecycle.flipComplete,
      didOpen: lifecycle.openStarted || lifecycle.openComplete,
      openComplete: lifecycle.openComplete,
      coverWriteDone: false,
      coverStampFlap: coverTexture.flapStamp,
      pendingSealFire: null,
      resetDrag,
    };
    sceneRef.current = state;

    if (nextSceneGeneration !== sceneGeneration) {
      setSceneGeneration(nextSceneGeneration);
    }

    const isSealHit = (event) => {
      pointer.copy(getPointerPosition(event, container));
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObject(envelope.seal, true).length > 0;
    };

    const handlePointerDown = (event) => {
      if (!canArmPointerDown(state)) {
        return;
      }

      if (!isPrimaryPointerDown(event) || drag.isPointerDown || drag.pointerId !== null) {
        return;
      }

      drag.isPointerDown = true;
      drag.pointerId = event.pointerId;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      drag.startYaw = drag.yaw;
      drag.startPitch = drag.pitch;
      drag.dragMoved = false;
      drag.startedOnSeal = isSealReady(state) && isSealHit(event);

      if (container.setPointerCapture) {
        try {
          container.setPointerCapture(event.pointerId);
        } catch {
          // Window fallback listeners cover unavailable pointer capture.
        }
      }

      addFallbackPointerListeners();
    };

    const handlePointerMove = (event) => {
      if (!shouldUpdatePointerHover(drag, event.pointerId)) {
        return;
      }

      const nextPointer = getPointerPosition(event, container);
      mouse.targetX = nextPointer.x;
      mouse.targetY = nextPointer.y;

      if (!drag.isPointerDown) {
        return;
      }

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      if (!drag.dragMoved && isDragMovement(deltaX, deltaY, DRAG_THRESHOLD_PX)) {
        drag.dragMoved = true;
      }

      const canDrag = !state.didOpen && (!state.didFlip || state.flipComplete);

      if (canDrag && drag.dragMoved) {
        const computed = computeDragRotation({
          startYaw: drag.startYaw,
          startPitch: drag.startPitch,
          deltaX,
          deltaY,
          sensitivity: 0.004,
        });
        drag.yaw = computed.yaw;
        drag.pitch = computed.pitch;
      }

      if (reducedMotionRef.current && canDrag && drag.dragMoved) {
        const baseYaw = getBaseYaw(state);
        const targetRotation = computeEnvelopeTargetRotation({
          baseYaw,
          dragYaw: drag.yaw,
          dragPitch: drag.pitch,
          hoverX: 0,
          hoverY: 0,
        });
        envelope.group.rotation.x = targetRotation.pitch;
        envelope.group.rotation.y = targetRotation.yaw;
        renderer.render(scene, camera);
      }
    };

    const handlePointerUp = (event) => {
      const isTargetPointer = isActivePointer(drag, event.pointerId);

      if (!isTargetPointer) {
        return;
      }

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      const hadDragMovement = drag.dragMoved || isDragMovement(deltaX, deltaY, DRAG_THRESHOLD_PX);
      const releasedOnSeal = state.flipComplete && !state.didOpen && isSealHit(event);
      const shouldActivate = shouldActivateSeal({
        startedOnSeal: drag.startedOnSeal,
        releasedOnSeal,
        dragMoved: hadDragMovement,
      });

      state.resetDrag();

      if (hadDragMovement || !state.flipComplete || state.didOpen) {
        return;
      }

      if (shouldActivate) {
        callbacksRef.current.onSealActivate?.();
      }
    };

    const handlePointerCancel = (event) => {
      if (!isActivePointer(drag, event.pointerId)) {
        return;
      }

      state.resetDrag();
    };

    const handleLostPointerCapture = (event) => {
      if (!isActivePointer(drag, event.pointerId)) {
        return;
      }

      state.resetDrag();
    };

    const handleWindowBlur = () => {
      state.resetDrag();
    };

    const addFallbackPointerListeners = () => {
      if (fallbackPointerListenersAttached) {
        return;
      }

      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerup', handlePointerUp, { passive: true });
      window.addEventListener('pointercancel', handlePointerCancel, { passive: true });
      fallbackPointerListenersAttached = true;
    };

    removeFallbackPointerListeners = () => {
      if (!fallbackPointerListenersAttached) {
        return;
      }

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      fallbackPointerListenersAttached = false;
    };

    const handleResize = () => {
      const nextWidth = container.clientWidth || window.innerWidth;
      const nextHeight = container.clientHeight || window.innerHeight;
      camera.aspect = nextWidth / nextHeight;
      camera.position.z = getEnvelopeCameraDistance(nextWidth);
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
      if (reducedMotionRef.current) {
        renderer.render(scene, camera);
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerup', handlePointerUp, { passive: true });
    container.addEventListener('pointercancel', handlePointerCancel, { passive: true });
    container.addEventListener('lostpointercapture', handleLostPointerCapture);
    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      state.resetDrag();
      if (state.frameId) {
        cancelAnimationFrame(state.frameId);
        state.frameId = 0;
      }
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointercancel', handlePointerCancel);
      container.removeEventListener('lostpointercapture', handleLostPointerCapture);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handleWindowBlur);
      gsap.killTweensOf([
        envelope.group.rotation,
        envelope.group.position,
        envelope.topFlapPivot.rotation,
        envelope.seal.scale,
        envelope.letterMesh.position,
        envelope.letterMesh.scale,
      ]);
      envelope.dispose();
      coverTexture.dispose();
      letterTexture.dispose();
      dust.geometry.dispose();
      if (dust.material.map) dust.material.map.dispose();
      dust.material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      sceneRef.current = null;
    };
  }, [recipientName, senderName, year, headline, subtext, letterContent?.badge, letterContent?.greeting, letterContent?.subtitle, letterContent?.scrollPrompt, webGLAvailable]);

  useEffect(() => {
    const state = sceneRef.current;

    if (!state || state.generation !== sceneGeneration) {
      return undefined;
    }

    if (reducedMotion) {
      if (state.frameId) {
        cancelAnimationFrame(state.frameId);
        state.frameId = 0;
      }
      gsap.killTweensOf(state.envelope.seal.scale);
      if (!state.didOpen) {
        state.envelope.seal.scale.set(1, 1, 1);
      }
      state.renderer.render(state.scene, state.camera);
      return undefined;
    }

    if (state.flipComplete && !state.didOpen && !state.openComplete) {
      gsap.killTweensOf(state.envelope.seal.scale);
      gsap.to(state.envelope.seal.scale, {
        x: 1.25,
        y: 1.25,
        z: 1.25,
        duration: 0.6,
        yoyo: true,
        repeat: -1,
      });
    }

    let localFrameId = 0;

    const renderFrame = () => {
      const elapsed = state.clock.getElapsedTime();
      state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
      state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

      const canAnimateEnvelope = !state.didOpen && (!state.didFlip || state.flipComplete);

      if (canAnimateEnvelope) {
        state.envelope.group.position.y = Math.sin(elapsed * 1.2) * 0.08;
        const baseYaw = getBaseYaw(state);
        const targetRotation = computeEnvelopeTargetRotation({
          baseYaw,
          dragYaw: state.drag.yaw,
          dragPitch: state.drag.pitch,
          hoverX: state.mouse.x,
          hoverY: state.mouse.y,
        });
        state.envelope.group.rotation.x += (targetRotation.pitch - state.envelope.group.rotation.x) * 0.1;
        state.envelope.group.rotation.y += (targetRotation.yaw - state.envelope.group.rotation.y) * 0.1;
      }
      state.dust.points.rotation.y += 0.0007;

      state.renderer.render(state.scene, state.camera);
      localFrameId = requestAnimationFrame(renderFrame);
      state.frameId = localFrameId;
    };

    localFrameId = requestAnimationFrame(renderFrame);
    state.frameId = localFrameId;

    return () => {
      if (localFrameId) {
        cancelAnimationFrame(localFrameId);
      }
      if (state.frameId === localFrameId) {
        state.frameId = 0;
      }
      if (state.envelope?.seal?.scale) {
        gsap.killTweensOf(state.envelope.seal.scale);
      }
    };
  }, [reducedMotion, sceneGeneration]);

  useEffect(() => {
    const lifecycle = lifecycleRef.current;

    if (!webGLAvailable && isReady && !fallbackReadyRef.current && !lifecycle.flipComplete) {
      fallbackReadyRef.current = true;
      lifecycle.flipStarted = true;
      lifecycle.flipComplete = true;
      callbacksRef.current.onSealReady();
    }
  }, [webGLAvailable, isReady]);

  useEffect(() => {
    const state = sceneRef.current;
    const lifecycle = lifecycleRef.current;

    if (!state || state.generation !== sceneGeneration || !isReady || state.flipComplete) {
      return undefined;
    }

    state.resetDrag();
    state.drag.yaw = 0;
    state.drag.pitch = 0;

    if (reducedMotion) {
      state.didFlip = true;
      lifecycle.flipStarted = true;
      lifecycle.flipComplete = true;
      state.envelope.group.rotation.set(0, Math.PI, 0);
      state.flipComplete = true;
      callbacksRef.current.onSealReady();
      state.renderer.render(state.scene, state.camera);
      return undefined;
    }

    state.didFlip = true;
    lifecycle.flipStarted = true;

    const tweenX = gsap.to(state.envelope.group.rotation, {
      x: 0,
      duration: 0.8,
      ease: 'power2.out',
    });

    const tween = gsap.to(state.envelope.group.rotation, {
      y: Math.PI,
      duration: 1.4,
      ease: 'power2.inOut',
      onComplete: () => {
        if (sceneRef.current !== state || state.flipComplete || lifecycle.flipComplete) {
          return;
        }

        lifecycle.flipComplete = true;
        state.flipComplete = true;
        state.drag.yaw = 0;
        state.drag.pitch = 0;

        const fireSealReady = () => {
          callbacksRef.current.onSealReady();

          gsap.to(state.envelope.seal.scale, {
            x: 1.25,
            y: 1.25,
            z: 1.25,
            duration: 0.6,
            yoyo: true,
            repeat: -1,
          });
        };

        // The seal arms only after the handwriting on the cover finished.
        // If writing is still running, park the signal until it completes.
        if (state.coverWriteDone) {
          fireSealReady();
        } else {
          state.pendingSealFire = fireSealReady;
        }
      },
    });

    return () => {
      state.resetDrag();
      tweenX.kill();
      tween.kill();
      if (state.envelope?.seal?.scale) {
        gsap.killTweensOf(state.envelope.seal.scale);
      }
    };
  }, [isReady, reducedMotion, sceneGeneration]);

  useEffect(() => {
    const state = sceneRef.current;
    const lifecycle = lifecycleRef.current;

    if (!isOpening) {
      return undefined;
    }

    if (!state) {
      if (!webGLAvailable && !fallbackOpenRef.current && !lifecycle.openComplete) {
        fallbackOpenRef.current = true;
        lifecycle.openStarted = true;
        lifecycle.openComplete = true;
        callbacksRef.current.onOpenComplete();
      }
      return undefined;
    }

    if (state.generation !== sceneGeneration) {
      return undefined;
    }

    if (state.openComplete) {
      return undefined;
    }

    state.resetDrag();
    state.drag.yaw = 0;
    state.drag.pitch = 0;

    const canonicalOpen = computeCanonicalOpenRotation({
      currentYaw: state.envelope.group.rotation.y,
      currentPitch: state.envelope.group.rotation.x,
      targetBaseYaw: Math.PI,
    });

    if (reducedMotion) {
      state.didOpen = true;
      lifecycle.openStarted = true;
      lifecycle.openComplete = true;
      state.envelope.group.rotation.set(0, Math.PI, 0);
      applyOpenFinalState(state.envelope);
      state.openComplete = true;
      callbacksRef.current.onOpenComplete();
      state.renderer.render(state.scene, state.camera);
      return undefined;
    }

    if (!lifecycle.stampOpenFlapStarted) {
      lifecycle.stampOpenFlapStarted = true;
      state.coverStampFlap?.();
    }
    state.didOpen = true;
    lifecycle.openStarted = true;

    gsap.killTweensOf([
      state.envelope.seal.scale,
      state.envelope.group.rotation,
    ]);
    state.envelope.seal.scale.set(1, 1, 1);

    const timeline = gsap.timeline({
      onComplete: () => {
        if (sceneRef.current !== state || state.openComplete || lifecycle.openComplete) {
          return;
        }

        lifecycle.openComplete = true;
        state.openComplete = true;
        try {
          const cam = state.camera || sceneRef.current?.camera;
          const domElement = state.renderer?.domElement;
          if (cam && domElement) {
            const box = new THREE.Box3().setFromObject(state.envelope.letterMesh);
            const corners = [
              new THREE.Vector3(box.min.x, box.min.y, box.min.z),
              new THREE.Vector3(box.max.x, box.min.y, box.min.z),
              new THREE.Vector3(box.min.x, box.max.y, box.min.z),
              new THREE.Vector3(box.max.x, box.max.y, box.min.z),
              new THREE.Vector3(box.min.x, box.min.y, box.max.z),
              new THREE.Vector3(box.max.x, box.min.y, box.max.z),
              new THREE.Vector3(box.min.x, box.max.y, box.max.z),
              new THREE.Vector3(box.max.x, box.max.y, box.max.z),
            ];
            const vw = domElement.clientWidth || window.innerWidth;
            const vh = domElement.clientHeight || window.innerHeight;
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            corners.forEach((v) => {
              v.project(cam);
              minX = Math.min(minX, (v.x * 0.5 + 0.5) * vw);
              maxX = Math.max(maxX, (v.x * 0.5 + 0.5) * vw);
              minY = Math.min(minY, (-v.y * 0.5 + 0.5) * vh);
              maxY = Math.max(maxY, (-v.y * 0.5 + 0.5) * vh);
            });
            const rect = { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
            if (Number.isFinite(rect.left) && rect.width > 1 && rect.height > 1) {
              callbacksRef.current.onLetterRect?.(rect);
            }
          }
        } catch {
          // Rect is an enhancement; never block the open completion.
        }
        callbacksRef.current.onOpenComplete();
      },
    });

    timeline
      .to(state.envelope.group.rotation, {
        x: canonicalOpen.x,
        y: canonicalOpen.y,
        duration: ENVELOPE_OPEN_TIMING.recenterDuration,
        ease: 'power2.out',
      })
      .to(state.envelope.seal.scale, {
        x: ENVELOPE_OPEN_FINAL_STATE.sealScale,
        y: ENVELOPE_OPEN_FINAL_STATE.sealScale,
        z: ENVELOPE_OPEN_FINAL_STATE.sealScale,
        duration: 0.2,
      }, ENVELOPE_OPEN_TIMING.revealStartTime)
      .to(state.envelope.topFlapPivot.rotation, {
        x: ENVELOPE_OPEN_FINAL_STATE.topFlapRotationX,
        duration: 1.1,
        ease: 'back.out(1.8)',
      }, ENVELOPE_OPEN_TIMING.revealStartTime)
      .to(state.envelope.group.position, {
        y: ENVELOPE_OPEN_FINAL_STATE.groupY,
        duration: 1.2,
        ease: 'power2.out',
      }, ENVELOPE_OPEN_TIMING.envelopeDescentStartTime)
      .to(state.envelope.letterMesh.position, {
        y: ENVELOPE_OPEN_FINAL_STATE.letterY,
        z: ENVELOPE_OPEN_FINAL_STATE.letterZ,
        duration: 1.4,
        ease: 'power3.out',
      }, ENVELOPE_OPEN_TIMING.letterRiseStartTime)
      .to(state.envelope.letterMesh.scale, {
        x: ENVELOPE_OPEN_FINAL_STATE.letterScale,
        y: ENVELOPE_OPEN_FINAL_STATE.letterScale,
        z: ENVELOPE_OPEN_FINAL_STATE.letterScale,
        duration: 1.4,
        ease: 'back.out(1.4)',
      }, ENVELOPE_OPEN_TIMING.letterRiseStartTime);

    return () => timeline.kill();
  }, [isOpening, reducedMotion, webGLAvailable, sceneGeneration]);

  const sealReady = isSealReadyProp !== undefined ? isSealReadyProp : (fallbackReadyRef.current || isReady);
  const sealDisabled = isFallbackSealDisabled({ isSealReady: sealReady, isOpening });
  const resolvedOpenLabel = resolveFallbackSealLabel(openLabel, recipientName);

  return (
    <div ref={containerRef} className="preloader-canvas" aria-hidden={webGLAvailable ? 'true' : undefined}>
      {!webGLAvailable && (
        <div className="preloader-canvas__fallback">
          <div className="preloader-canvas__fallback-envelope">
            <div className="preloader-canvas__fallback-letter">
              <span>To: {recipientName || 'you'}</span>
              <span>{headline}</span>
              <span>{year}</span>
            </div>
            <div className="preloader-canvas__fallback-flap" aria-hidden="true" />
            <button
              type="button"
              className="preloader-canvas__fallback-seal"
              onClick={() => callbacksRef.current.onSealActivate?.()}
              disabled={sealDisabled}
              aria-label={resolvedOpenLabel}
            >
              <span aria-hidden="true">♥</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

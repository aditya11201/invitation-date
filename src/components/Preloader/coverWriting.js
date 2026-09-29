export function smoothstep(progress) {
  const t = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  return t * t * (3 - 2 * t);
}

export const STAMP_FLAP_DURATION_MS = 420 * 4;

const NEAR_WING_KEYFRAMES = [[0, 0], [0.42, -26], [0.82, 6], [1, 0]];
const FAR_WING_KEYFRAMES = [[0, 0], [0.14, 0], [0.52, -20], [0.85, 4], [1, 0]];
const ENVELOPE_KEYFRAMES = [[0, 0], [0.3, 8], [0.7, -6], [1, 0]];
const DOVE_BOB_KEYFRAMES = [[0, 0], [0.55, -8], [1, 0]];

function cubicBezierCoordinate(t, first, second) {
  const inverse = 1 - t;
  return (3 * inverse * inverse * t * first) + (3 * inverse * t * t * second) + (t * t * t);
}

function cubicBezierProgress(progress, x1, y1, x2, y2) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;

  let low = 0;
  let high = 1;
  for (let iteration = 0; iteration < 20; iteration += 1) {
    const midpoint = (low + high) / 2;
    if (cubicBezierCoordinate(midpoint, x1, x2) < progress) low = midpoint;
    else high = midpoint;
  }
  return cubicBezierCoordinate((low + high) / 2, y1, y2);
}

function interpolateStampKeyframes(progress, keyframes, bezier) {
  const exactFrame = keyframes.find(([time]) => Math.abs(progress - time) < 1e-9);
  if (exactFrame) return exactFrame[1];

  for (let index = 1; index < keyframes.length; index += 1) {
    const [endTime, endValue] = keyframes[index];
    if (progress <= endTime) {
      const [startTime, startValue] = keyframes[index - 1];
      const segmentProgress = (progress - startTime) / (endTime - startTime);
      const easedProgress = cubicBezierProgress(segmentProgress, ...bezier);
      return startValue + (endValue - startValue) * easedProgress;
    }
  }
  return keyframes[keyframes.length - 1][1];
}

export function getStampFlapPose(elapsedMs) {
  const elapsed = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  const flapActive = elapsed < STAMP_FLAP_DURATION_MS;
  const cycleProgress = (elapsed % 420) / 420;
  const envelopeProgress = Math.min(1, (elapsed % 800) / 800);

  return {
    nearWingRotationDegrees: flapActive
      ? interpolateStampKeyframes(cycleProgress, NEAR_WING_KEYFRAMES, [0.4, 0, 0.6, 1])
      : 0,
    farWingRotationDegrees: flapActive
      ? interpolateStampKeyframes(cycleProgress, FAR_WING_KEYFRAMES, [0.4, 0, 0.6, 1])
      : 0,
    envelopeSwingDegrees: elapsed < 1600
      ? interpolateStampKeyframes(envelopeProgress, ENVELOPE_KEYFRAMES, [0.4, 0, 0.6, 1])
      : 0,
    doveBobY: flapActive
      ? interpolateStampKeyframes(cycleProgress, DOVE_BOB_KEYFRAMES, [0.42, 0, 0.58, 1])
      : 0,
  };
}

export function scheduleCoverWriting(lineLengths, durationMs, travelMs = 160) {
  if (!Array.isArray(lineLengths)) return [];

  const lengths = lineLengths.map((length) => (
    Number.isFinite(length) ? Math.max(0, length) : 0
  ));
  const totalCharacters = lengths.reduce((sum, length) => sum + length, 0);
  if (!totalCharacters) return [];

  const duration = Math.max(0, Number.isFinite(durationMs) ? durationMs : 0);
  const transitions = Math.max(0, lengths.length - 1);
  const requestedTravel = Math.max(0, Number.isFinite(travelMs) ? travelMs : 0);
  const travelDuration = transitions
    ? Math.min(requestedTravel, duration / (transitions * 2))
    : 0;
  const characterDuration = (duration - travelDuration * transitions) / totalCharacters;
  let cursor = 0;

  return lengths.map((length, lineIndex) => {
    const startMs = cursor;
    const endMs = startMs + characterDuration * length;
    const travelEndMs = endMs + (lineIndex < lengths.length - 1 ? travelDuration : 0);
    cursor = travelEndMs;

    return { lineIndex, startMs, endMs, travelEndMs };
  });
}

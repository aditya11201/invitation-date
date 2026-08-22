export function clampProgress(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.round(Math.max(0, Math.min(100, numericValue)));
}

export function getPreloaderPhase(progress, phases) {
  const safeProgress = clampProgress(progress);
  const orderedPhases = [...phases].sort((left, right) => left.start - right.start);

  return orderedPhases.reduce(
    (selectedPhase, phase) => (safeProgress >= phase.start ? phase : selectedPhase),
    orderedPhases[0],
  );
}

export function formatPreloaderCopy(template, values = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? ''));
}

export const PRELOADER_COPY = Object.freeze({
  eyebrow: 'A special delivery ✨',
  title: 'Preparing something special for you... 💗',
  cta: 'Open My Invitation 💌',
  loading: Object.freeze({
    crafting: 'Crafting your envelope...',
    foil: 'Adding the gold trim...',
    ready: 'Your invitation is ready 💌',
  }),
});

export function getLoadingMessage(progress, recipientName = 'Sassy') {
  const numericProgress = Number(progress);
  const safeProgress = Number.isFinite(numericProgress)
    ? Math.max(0, Math.min(100, numericProgress))
    : 0;

  if (safeProgress >= 100) {
    return PRELOADER_COPY.loading.ready;
  }

  if (safeProgress >= 80) {
    return `Sealing a surprise for ${recipientName || 'you'}...`;
  }

  if (safeProgress >= 45) {
    return PRELOADER_COPY.loading.foil;
  }

  return PRELOADER_COPY.loading.crafting;
}

export function resolveFallbackSealLabel(openLabel, recipientName) {
  if (typeof openLabel === 'string' && openLabel.trim().length > 0) {
    return openLabel;
  }
  if (typeof recipientName === 'string' && recipientName.trim().length > 0) {
    return `Open ${recipientName}'s invitation`;
  }
  return 'Open invitation';
}

export function isFallbackSealDisabled({ isSealReady = false, isOpening = false } = {}) {
  return !isSealReady || Boolean(isOpening);
}

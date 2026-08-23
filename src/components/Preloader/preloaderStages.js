import { invitationConfig } from '../../config/config.js';

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

export function getLoadingMessage(progress, recipientName = 'Sassy', copy = invitationConfig.preloader) {
  const numericProgress = Number(progress);
  const safeProgress = Number.isFinite(numericProgress)
    ? Math.max(0, Math.min(100, numericProgress))
    : 0;

  if (safeProgress >= 100) {
    return copy.loadingReady;
  }

  if (safeProgress >= 80) {
    return `${copy.progressSealing} ${recipientName || 'you'}...`;
  }

  if (safeProgress >= 45) {
    return copy.loadingFoil;
  }

  return copy.loadingCrafting;
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

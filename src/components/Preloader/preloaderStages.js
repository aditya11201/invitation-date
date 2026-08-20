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

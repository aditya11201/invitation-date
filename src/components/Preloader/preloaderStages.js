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

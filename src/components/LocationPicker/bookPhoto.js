export function resolveBookPhotoSlot(image, caption) {
  const src = typeof image === 'string' && image.trim() ? image : null;
  const label = typeof caption === 'string' && caption.trim() ? caption : '[CAPTION]';
  return { src, caption: label };
}

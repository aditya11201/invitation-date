// Fixed scrapbook slot layout for the open book page.
// Order matters: index i maps to CSS class scrapbook-photo--{variant}.
export const PHOTO_SLOTS = [
  { variant: 'portrait', tilt: 6 },
  { variant: 'square', tilt: -7 },
  { variant: 'landscape', tilt: 3 },
  { variant: 'mini', tilt: -10 },
];

// Normalize place.book.photos into exactly PHOTO_SLOTS.length renderable slots.
export function resolvePhotoSlots(place) {
  const configured = Array.isArray(place?.book?.photos) ? place.book.photos : [];
  return PHOTO_SLOTS.map((slot, i) => {
    const photo = configured[i] || {};
    return {
      ...slot,
      src: typeof photo.src === 'string' && photo.src ? photo.src : null,
      caption: typeof photo.caption === 'string' ? photo.caption : '',
      emoji: photo.emoji || place?.emoji || '✨',
    };
  });
}

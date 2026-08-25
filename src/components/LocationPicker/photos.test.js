import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHOTO_SLOTS, resolvePhotoSlots } from './photos.js';

const place = {
  emoji: '🐠',
  book: {
    photos: [
      { src: '/assets/places/a.webp', caption: 'first stop' },
      { caption: 'us later' },
    ],
  },
};

test('always returns exactly four slots', () => {
  assert.equal(resolvePhotoSlots(place).length, PHOTO_SLOTS.length);
  assert.equal(PHOTO_SLOTS.length, 4);
});

test('maps configured photos onto slots in order', () => {
  const [first, second] = resolvePhotoSlots(place);
  assert.equal(first.src, '/assets/places/a.webp');
  assert.equal(first.caption, 'first stop');
  assert.equal(second.src, null);
  assert.equal(second.caption, 'us later');
});

test('missing entries become decorative placeholders with place emoji', () => {
  const [, , third, fourth] = resolvePhotoSlots(place);
  assert.equal(third.src, null);
  assert.equal(fourth.src, null);
  assert.equal(fourth.emoji, '🐠');
});

test('no photos config yields all placeholder slots', () => {
  const slots = resolvePhotoSlots({ emoji: '🍿' });
  assert.ok(slots.every((s) => s.src === null));
  assert.ok(slots.every((s) => s.caption === ''));
});

test('empty-string src is treated as absent', () => {
  const [first] = resolvePhotoSlots({ book: { photos: [{ src: '' }] } });
  assert.equal(first.src, null);
});

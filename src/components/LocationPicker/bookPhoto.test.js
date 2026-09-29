import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBookPhotoSlot } from './bookPhoto.js';

test('missing book images resolve to an explicit photo and caption placeholder', () => {
  assert.deepEqual(resolveBookPhotoSlot(undefined, ''), {
    src: null,
    caption: '[CAPTION]',
  });
});

test('configured book image and caption pass through unchanged', () => {
  assert.deepEqual(resolveBookPhotoSlot('/assets/places/aquarium-date.webp', 'Underwater Realm'), {
    src: '/assets/places/aquarium-date.webp',
    caption: 'Underwater Realm',
  });
});

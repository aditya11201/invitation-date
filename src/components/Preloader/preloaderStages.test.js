import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampProgress,
  formatPreloaderCopy,
  getPreloaderPhase,
  getLoadingMessage,
  resolveFallbackSealLabel,
  isFallbackSealDisabled,
} from './preloaderStages.js';

const phases = [
  { start: 0, key: 'crafting', message: 'Folding a little note...' },
  { start: 31, key: 'writing', message: 'Writing something just for {{recipientName}}...' },
  { start: 66, key: 'sealing', message: 'Adding a touch of golden wax...' },
  { start: 91, key: 'ready', message: 'Your invitation is ready.' },
];

test('clampProgress keeps progress inside the narrative range', () => {
  assert.equal(clampProgress(-5), 0);
  assert.equal(clampProgress(31.8), 32);
  assert.equal(clampProgress(100), 100);
  assert.equal(clampProgress(140), 100);
  assert.equal(clampProgress('not-a-number'), 0);
});

test('getPreloaderPhase selects the phase at every boundary', () => {
  assert.equal(getPreloaderPhase(0, phases).key, 'crafting');
  assert.equal(getPreloaderPhase(30, phases).key, 'crafting');
  assert.equal(getPreloaderPhase(31, phases).key, 'writing');
  assert.equal(getPreloaderPhase(65, phases).key, 'writing');
  assert.equal(getPreloaderPhase(66, phases).key, 'sealing');
  assert.equal(getPreloaderPhase(90, phases).key, 'sealing');
  assert.equal(getPreloaderPhase(91, phases).key, 'ready');
  assert.equal(getPreloaderPhase(100, phases).key, 'ready');
});

test('getPreloaderPhase clamps progress before selecting a phase', () => {
  assert.equal(getPreloaderPhase(-20, phases).key, 'crafting');
  assert.equal(getPreloaderPhase(140, phases).key, 'ready');
});

test('formatPreloaderCopy personalizes tokens without leaking undefined', () => {
  assert.equal(
    formatPreloaderCopy('For {{recipientName}} · {{year}}', {
      recipientName: 'Sassy',
      year: 2026,
    }),
    'For Sassy · 2026',
  );
  assert.equal(formatPreloaderCopy('For {{recipientName}}', {}), 'For ');
});

test('uses the crafting message before the foil stage', () => {
  assert.equal(getLoadingMessage(0, 'Sassy'), 'Getting your letter ready...');
  assert.equal(getLoadingMessage(44, 'Sassy'), 'Getting your letter ready...');
});

test('uses the gold trim message during the middle stage', () => {
  assert.equal(getLoadingMessage(45, 'Sassy'), 'Adding the gold trim...');
  assert.equal(getLoadingMessage(79, 'Sassy'), 'Adding the gold trim...');
});

test('personalizes the sealing message for the recipient', () => {
  assert.equal(getLoadingMessage(80, 'Sassy'), 'Sealing a surprise for Sassy...');
  assert.equal(getLoadingMessage(99, ''), 'Sealing a surprise for you...');
});

test('uses the ready message at 100 percent and clamps invalid ranges', () => {
  assert.equal(getLoadingMessage(100, 'Sassy'), 'Your invitation is ready 💌');
  assert.equal(getLoadingMessage(140, 'Sassy'), 'Your invitation is ready 💌');
  assert.equal(getLoadingMessage(-20, 'Sassy'), 'Getting your letter ready...');
});

test('resolveFallbackSealLabel returns formatted openLabel, personalized fallback, or generic default', () => {
  assert.equal(resolveFallbackSealLabel("Open Sassy's invitation", 'Sassy'), "Open Sassy's invitation");
  assert.equal(resolveFallbackSealLabel('', 'Sassy'), "Open Sassy's invitation");
  assert.equal(resolveFallbackSealLabel(undefined, 'Cutie'), "Open Cutie's invitation");
  assert.equal(resolveFallbackSealLabel(undefined, ''), 'Open invitation');
  assert.equal(resolveFallbackSealLabel(null, null), 'Open invitation');
});

test('isFallbackSealDisabled disables seal when not ready or during opening', () => {
  assert.equal(isFallbackSealDisabled({ isSealReady: false, isOpening: false }), true);
  assert.equal(isFallbackSealDisabled({ isSealReady: true, isOpening: false }), false);
  assert.equal(isFallbackSealDisabled({ isSealReady: true, isOpening: true }), true);
  assert.equal(isFallbackSealDisabled({ isSealReady: false, isOpening: true }), true);
  assert.equal(isFallbackSealDisabled(), true);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampProgress,
  formatPreloaderCopy,
  getPreloaderPhase,
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

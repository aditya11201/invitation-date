import test from 'node:test';
import assert from 'node:assert/strict';
import { getLoadingMessage } from './preloaderStages.js';

test('uses the crafting message before the foil stage', () => {
  assert.equal(getLoadingMessage(0, 'Sassy'), 'Crafting your envelope...');
  assert.equal(getLoadingMessage(44, 'Sassy'), 'Crafting your envelope...');
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
  assert.equal(getLoadingMessage(-20, 'Sassy'), 'Crafting your envelope...');
});

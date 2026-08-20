import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  createEnvelopeScene,
  getEnvelopeCameraDistance,
} from './envelopeScene.js';

test('uses a wider camera distance on narrow screens', () => {
  assert.equal(getEnvelopeCameraDistance(390), 8.5);
  assert.equal(getEnvelopeCameraDistance(639), 8.5);
  assert.equal(getEnvelopeCameraDistance(640), 7.2);
  assert.equal(getEnvelopeCameraDistance(1440), 7.2);
});

test('creates the named envelope hierarchy without a WebGL renderer', () => {
  const envelope = createEnvelopeScene();
  const names = [];

  envelope.group.traverse((object) => names.push(object.name));

  assert.ok(envelope.group instanceof THREE.Group);
  assert.equal(envelope.group.name, 'preloader-envelope');
  assert.ok(names.includes('preloader-envelope-body'));
  assert.ok(names.includes('preloader-envelope-front'));
  assert.ok(names.includes('preloader-envelope-letter'));
  assert.ok(names.includes('preloader-envelope-bottom-flap'));
  assert.ok(names.includes('preloader-envelope-left-flap'));
  assert.ok(names.includes('preloader-envelope-right-flap'));
  assert.ok(names.includes('preloader-envelope-top-flap'));
  assert.ok(names.includes('preloader-envelope-seal'));
  assert.equal(envelope.topFlapPivot.parent, envelope.group);
  assert.equal(envelope.seal.parent, envelope.topFlapPivot);
  assert.equal(envelope.letterMesh.geometry.parameters.height, 4.5);
  assert.equal(envelope.sealMesh.geometry.parameters.radiusTop, 0.28);
  assert.equal(envelope.sealMesh.geometry.parameters.height, 0.08);

  envelope.dispose();
});

test('accepts a cover texture on the front stationery plane', () => {
  const coverTexture = new THREE.Texture();
  const envelope = createEnvelopeScene({ coverTexture });
  const front = envelope.group.getObjectByName('preloader-envelope-front');

  assert.equal(front.material.map, coverTexture);

  envelope.dispose();
});

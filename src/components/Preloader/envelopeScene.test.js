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

test('disposes owned resources once without disposing the cover texture', () => {
  const coverTexture = new THREE.Texture();
  const envelope = createEnvelopeScene({ coverTexture });
  const geometries = new Set();
  const materials = new Set();

  envelope.group.traverse((object) => {
    if (object.geometry) {
      geometries.add(object.geometry);
    }

    if (object.material) {
      materials.add(object.material);
    }
  });

  const disposalCounts = new Map();
  [...geometries, ...materials].forEach((resource) => {
    disposalCounts.set(resource, 0);
    resource.addEventListener('dispose', () => {
      disposalCounts.set(resource, disposalCounts.get(resource) + 1);
    });
  });

  let coverTextureDisposals = 0;
  coverTexture.addEventListener('dispose', () => {
    coverTextureDisposals += 1;
  });

  envelope.dispose();

  geometries.forEach((geometry) => assert.equal(disposalCounts.get(geometry), 1));
  materials.forEach((material) => assert.equal(disposalCounts.get(material), 1));
  assert.equal(coverTextureDisposals, 0);
});

test('provides visible seal relief on both original and flipped facing states', () => {
  const envelope = createEnvelopeScene();

  // State 1: Original facing state (rotation.y = 0)
  envelope.group.rotation.y = 0;
  envelope.group.updateMatrixWorld(true);

  const sealMeshWorldPos0 = new THREE.Vector3();
  envelope.sealMesh.getWorldPosition(sealMeshWorldPos0);

  const reliefMeshes = [];
  envelope.seal.traverse((child) => {
    if (child.isMesh && child !== envelope.sealMesh) {
      reliefMeshes.push(child);
    }
  });

  assert.ok(reliefMeshes.length >= 2, 'Expected front and back relief meshes');

  const hasOriginalFacingRelief = reliefMeshes.some((mesh) => {
    const pos = new THREE.Vector3();
    mesh.getWorldPosition(pos);
    return pos.z > sealMeshWorldPos0.z;
  });
  assert.ok(hasOriginalFacingRelief, 'Expected relief visible in front of seal disc at rotation.y = 0');

  // State 2: Flipped facing state (rotation.y = Math.PI)
  envelope.group.rotation.y = Math.PI;
  envelope.group.updateMatrixWorld(true);

  const sealMeshWorldPosFlipped = new THREE.Vector3();
  envelope.sealMesh.getWorldPosition(sealMeshWorldPosFlipped);

  const hasFlippedFacingRelief = reliefMeshes.some((mesh) => {
    const pos = new THREE.Vector3();
    mesh.getWorldPosition(pos);
    return pos.z > sealMeshWorldPosFlipped.z;
  });
  assert.ok(hasFlippedFacingRelief, 'Expected relief visible in front of seal disc at rotation.y = Math.PI');

  envelope.dispose();
});


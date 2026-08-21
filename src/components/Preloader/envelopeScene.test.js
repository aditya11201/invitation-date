import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  createEnvelopeScene,
  getEnvelopeCameraDistance,
  DRAG_THRESHOLD_PX,
  sanitizeRotation,
  clampDragRotation,
  computeDragRotation,
  computeEnvelopeTargetRotation,
  getBaseYaw,
  clampPointerPosition,
  isDragMovement,
  shouldActivateSeal,
  ENVELOPE_OPEN_FINAL_STATE,
  isActivePointer,
  isPrimaryPointerDown,
  isSealReady,
  canArmPointerDown,
  shouldUpdatePointerHover,
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
  assert.equal(front.material.color.getHex(), 0xffffff);

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

test('matches the reference flap materials and top flap orientation', () => {
  const envelope = createEnvelopeScene();
  const bottomFlap = envelope.group.getObjectByName('preloader-envelope-bottom-flap');
  const topFlap = envelope.group.getObjectByName('preloader-envelope-top-flap');

  assert.equal(bottomFlap.material.color.getHex(), 0x7a1126);
  assert.equal(topFlap.material.color.getHex(), 0x540a18);
  assert.equal(topFlap.rotation.y, Math.PI);

  envelope.dispose();
});

test('ensures wax seal heart relief is oriented upright when envelope is sealed and flipped', () => {
  const envelope = createEnvelopeScene();

  // Flipped facing state (rotation.y = Math.PI, showing seal side to camera)
  envelope.group.rotation.y = Math.PI;
  envelope.group.updateMatrixWorld(true);

  const reliefBack = envelope.group.getObjectByName('preloader-envelope-seal-relief-back');
  assert.ok(reliefBack, 'Expected preloader-envelope-seal-relief-back mesh');

  const positionAttr = reliefBack.geometry.attributes.position;
  let minY = Infinity;
  let maxY = -Infinity;
  let bottomVertexWorld = null;
  let topVertexWorld = null;

  for (let i = 0; i < positionAttr.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(positionAttr, i);
    vertex.applyMatrix4(reliefBack.matrixWorld);

    if (vertex.y < minY) {
      minY = vertex.y;
      bottomVertexWorld = vertex;
    }
    if (vertex.y > maxY) {
      maxY = vertex.y;
      topVertexWorld = vertex;
    }
  }

  const sealCenterWorld = new THREE.Vector3();
  envelope.sealMesh.getWorldPosition(sealCenterWorld);

  // An upright heart has its pointed apex centered at the bottom (x ≈ 0)
  // and its lobes separated at the top (|x| > 0)
  assert.ok(
    Math.abs(bottomVertexWorld.x - sealCenterWorld.x) < 0.05,
    'Heart bottom vertex (apex point) must be horizontally centered'
  );
  assert.ok(
    Math.abs(topVertexWorld.x - sealCenterWorld.x) > 0.08,
    'Heart top vertex (lobe) must be offset horizontally from center'
  );

  envelope.dispose();
});

test('sanitizeRotation sanitizes finite numbers and provides fallback', () => {
  assert.equal(sanitizeRotation(5), 5);
  assert.equal(sanitizeRotation(-10.5), -10.5);
  assert.equal(sanitizeRotation(NaN), 0);
  assert.equal(sanitizeRotation(Infinity, 1), 1);
  assert.equal(sanitizeRotation(undefined, 0.5), 0.5);
});

test('clampDragRotation sanitizes finite numbers and allows continuous rotation', () => {
  const inside = clampDragRotation(0.2, -0.3);
  assert.equal(inside.yaw, 0.2);
  assert.equal(inside.pitch, -0.3);

  const largePositive = clampDragRotation(4 * Math.PI, 3 * Math.PI);
  assert.equal(largePositive.yaw, 4 * Math.PI);
  assert.equal(largePositive.pitch, 3 * Math.PI);

  const largeNegative = clampDragRotation(-4 * Math.PI, -3 * Math.PI);
  assert.equal(largeNegative.yaw, -4 * Math.PI);
  assert.equal(largeNegative.pitch, -3 * Math.PI);

  const invalid = clampDragRotation(NaN, undefined);
  assert.equal(invalid.yaw, 0);
  assert.equal(invalid.pitch, 0);
});

test('computeDragRotation updates rotation continuously without clamping past 2pi', () => {
  const result = computeDragRotation({
    startYaw: 2 * Math.PI,
    startPitch: -2 * Math.PI,
    deltaX: 1000,
    deltaY: -1000,
    sensitivity: 0.004,
  });

  assert.equal(result.yaw, 2 * Math.PI + 1000 * 0.004);
  assert.equal(result.pitch, -2 * Math.PI + -1000 * 0.004);
});

test('isDragMovement distinguishes clicks from drag gestures via threshold', () => {
  assert.equal(isDragMovement(0, 0), false);
  assert.equal(isDragMovement(3, 4), false); // hypot = 5 <= 6
  assert.equal(isDragMovement(DRAG_THRESHOLD_PX, 0), false);
  assert.equal(isDragMovement(0, DRAG_THRESHOLD_PX + 1), true);
  assert.equal(isDragMovement(10, 10), true);
});

test('clampPointerPosition keeps captured pointer coordinates inside normalized bounds', () => {
  const position = clampPointerPosition(3.5, -4);

  assert.equal(position.x, 1);
  assert.equal(position.y, -1);
});

test('computeEnvelopeTargetRotation blends continuous drag and hover rotation', () => {
  const result = computeEnvelopeTargetRotation({
    baseYaw: 0,
    dragYaw: 3 * Math.PI,
    dragPitch: 2 * Math.PI,
    hoverX: 1,
    hoverY: -1,
    hoverYaw: 0.12,
    hoverPitch: 0.08,
  });

  assert.equal(result.yaw, 3 * Math.PI + 0.12);
  assert.equal(result.pitch, 2 * Math.PI - 0.08);
});

test('shouldActivateSeal requires a seal start, seal release, and no drag movement', () => {
  assert.equal(shouldActivateSeal({ startedOnSeal: true, releasedOnSeal: true, dragMoved: false }), true);
  assert.equal(shouldActivateSeal({ startedOnSeal: false, releasedOnSeal: true, dragMoved: false }), false);
  assert.equal(shouldActivateSeal({ startedOnSeal: true, releasedOnSeal: false, dragMoved: false }), false);
  assert.equal(shouldActivateSeal({ startedOnSeal: true, releasedOnSeal: true, dragMoved: true }), false);
});

test('defines the canonical final transform for an opened envelope', () => {
  assert.deepEqual(ENVELOPE_OPEN_FINAL_STATE, {
    sealScale: 1,
    topFlapRotationX: -Math.PI * 0.95,
    groupY: -1.4,
    letterY: 1.5,
    letterZ: -0.25,
    letterScale: 1.18 * 0.48,
  });
});

test('matches pointer ownership only for the active pointer', () => {
  const drag = { isPointerDown: true, pointerId: 7 };

  assert.equal(isActivePointer(drag, 7), true);
  assert.equal(isActivePointer(drag, 8), false);
  assert.equal(isActivePointer({ ...drag, isPointerDown: false }, 7), false);
});

test('updates hover for the active pointer or when no drag is active', () => {
  assert.equal(shouldUpdatePointerHover({ isPointerDown: true, pointerId: 7 }, 7), true);
  assert.equal(shouldUpdatePointerHover({ isPointerDown: true, pointerId: 7 }, 8), false);
  assert.equal(shouldUpdatePointerHover({ isPointerDown: false, pointerId: null }, 8), true);
});

test('arms only for primary-button pointerdowns', () => {
  assert.equal(isPrimaryPointerDown({ button: 0, isPrimary: true }), true);
  assert.equal(isPrimaryPointerDown({ button: 1, isPrimary: true }), false);
  assert.equal(isPrimaryPointerDown({ button: 0, isPrimary: false }), false);
});

test('records seal starts only after the scripted flip is complete', () => {
  assert.equal(isSealReady({ flipComplete: true, didOpen: false }), true);
  assert.equal(isSealReady({ flipComplete: false, didOpen: false }), false);
  assert.equal(isSealReady({ flipComplete: true, didOpen: true }), false);
});

test('getBaseYaw returns 0 before flip completion and Math.PI when flipped', () => {
  assert.equal(getBaseYaw({ flipComplete: false }), 0);
  assert.equal(getBaseYaw({ flipComplete: true }), Math.PI);
  assert.equal(getBaseYaw({ isFlipped: true }), Math.PI);
  assert.equal(getBaseYaw(), 0);
});

test('computeEnvelopeTargetRotation resolves post-flip neutral offset to Math.PI', () => {
  const result = computeEnvelopeTargetRotation({
    baseYaw: Math.PI,
    dragYaw: 0,
    dragPitch: 0,
    hoverX: 0,
    hoverY: 0,
  });

  assert.equal(result.yaw, Math.PI);
  assert.equal(result.pitch, 0);
});

test('computeEnvelopeTargetRotation allows continuous multi-revolution orbit beyond 2pi in all directions', () => {
  const resultRotateRightToFront = computeEnvelopeTargetRotation({
    baseYaw: Math.PI,
    dragYaw: Math.PI,
    dragPitch: 0,
    hoverX: 0,
    hoverY: 0,
  });
  assert.equal(resultRotateRightToFront.yaw, 2 * Math.PI);
  assert.equal(resultRotateRightToFront.pitch, 0);

  const resultRotateLeftToFront = computeEnvelopeTargetRotation({
    baseYaw: Math.PI,
    dragYaw: -Math.PI,
    dragPitch: 0,
    hoverX: 0,
    hoverY: 0,
  });
  assert.equal(resultRotateLeftToFront.yaw, 0);
  assert.equal(resultRotateLeftToFront.pitch, 0);

  // Multi-revolution yaw and pitch (beyond ±2pi)
  const resultMultiRevPositive = computeEnvelopeTargetRotation({
    baseYaw: Math.PI,
    dragYaw: 4 * Math.PI,
    dragPitch: 4 * Math.PI,
    hoverX: 0,
    hoverY: 0,
  });
  assert.equal(resultMultiRevPositive.yaw, 5 * Math.PI);
  assert.equal(resultMultiRevPositive.pitch, 4 * Math.PI);

  const resultMultiRevNegative = computeEnvelopeTargetRotation({
    baseYaw: Math.PI,
    dragYaw: -4 * Math.PI,
    dragPitch: -4 * Math.PI,
    hoverX: 0,
    hoverY: 0,
  });
  assert.equal(resultMultiRevNegative.yaw, -3 * Math.PI);
  assert.equal(resultMultiRevNegative.pitch, -4 * Math.PI);
});

test('canArmPointerDown gates pointerdown during automatic flip or when opening', () => {
  assert.equal(canArmPointerDown({ didFlip: false, flipComplete: false, didOpen: false }), true);
  assert.equal(canArmPointerDown({ didFlip: true, flipComplete: false, didOpen: false }), false);
  assert.equal(canArmPointerDown({ didFlip: true, flipComplete: true, didOpen: false }), true);
  assert.equal(canArmPointerDown({ didFlip: false, flipComplete: false, didOpen: true }), false);
  assert.equal(canArmPointerDown({ didFlip: true, flipComplete: true, didOpen: true }), false);
});

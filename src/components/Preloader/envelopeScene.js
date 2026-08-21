import * as THREE from 'three';

const palette = Object.freeze({
  body: 0x7a1126,
  bodyDeep: 0x540a18,
  lining: 0xf0e7e2,
  paper: 0xfcfbf7,
  gold: 0xf3ca7e,
});

export function getEnvelopeCameraDistance(viewportWidth) {
  return viewportWidth < 640 ? 8.5 : 7.2;
}

export const ENVELOPE_DRAG_LIMITS = Object.freeze({
  minPitch: -Math.PI / 5,
  maxPitch: Math.PI / 5,
  minYaw: -Math.PI,
  maxYaw: Math.PI,
});

export const DRAG_THRESHOLD_PX = 6;

export const ENVELOPE_OPEN_FINAL_STATE = Object.freeze({
  sealScale: 1,
  topFlapRotationX: -Math.PI * 0.95,
  groupY: -1.4,
  letterY: 1.5,
  letterZ: -0.25,
  letterScale: 1.18 * 0.48,
});

export function isActivePointer(drag, pointerId) {
  return drag.isPointerDown && drag.pointerId === pointerId;
}

export function shouldUpdatePointerHover(drag, pointerId) {
  return !drag.isPointerDown || isActivePointer(drag, pointerId);
}

export function isPrimaryPointerDown(event) {
  return event?.button === 0 && event?.isPrimary !== false;
}

export function isSealReady({ flipComplete = false, didOpen = false } = {}) {
  return Boolean(flipComplete && !didOpen);
}

export function canArmPointerDown({ didFlip = false, flipComplete = false, didOpen = false } = {}) {
  if (didOpen) {
    return false;
  }
  if (didFlip && !flipComplete) {
    return false;
  }
  return true;
}

export function getBaseYaw({ flipComplete = false, isFlipped = false } = {}) {
  return (flipComplete || isFlipped) ? Math.PI : 0;
}

export function clampDragRotation(yaw, pitch, limits = ENVELOPE_DRAG_LIMITS) {
  const safeYaw = typeof yaw === 'number' && Number.isFinite(yaw) ? yaw : 0;
  const safePitch = typeof pitch === 'number' && Number.isFinite(pitch) ? pitch : 0;
  return {
    yaw: THREE.MathUtils.clamp(safeYaw, limits.minYaw, limits.maxYaw),
    pitch: THREE.MathUtils.clamp(safePitch, limits.minPitch, limits.maxPitch),
  };
}

export function clampPointerPosition(x, y) {
  const safeX = typeof x === 'number' && Number.isFinite(x) ? x : 0;
  const safeY = typeof y === 'number' && Number.isFinite(y) ? y : 0;
  return new THREE.Vector2(
    THREE.MathUtils.clamp(safeX, -1, 1),
    THREE.MathUtils.clamp(safeY, -1, 1),
  );
}

export function computeDragRotation({
  startYaw = 0,
  startPitch = 0,
  deltaX = 0,
  deltaY = 0,
  sensitivity = 0.004,
  limits = ENVELOPE_DRAG_LIMITS,
} = {}) {
  const nextYaw = startYaw + deltaX * sensitivity;
  const nextPitch = startPitch + deltaY * sensitivity;
  return clampDragRotation(nextYaw, nextPitch, limits);
}

export function computeEnvelopeTargetRotation({
  baseYaw = 0,
  dragYaw = 0,
  dragPitch = 0,
  hoverX = 0,
  hoverY = 0,
  hoverYaw = 0.12,
  hoverPitch = 0.08,
  limits = ENVELOPE_DRAG_LIMITS,
} = {}) {
  const clamped = clampDragRotation(
    dragYaw + hoverX * hoverYaw,
    dragPitch + hoverY * hoverPitch,
    limits,
  );
  return {
    yaw: baseYaw + clamped.yaw,
    pitch: clamped.pitch,
  };
}

export function isDragMovement(deltaX, deltaY, threshold = DRAG_THRESHOLD_PX) {
  return Math.hypot(deltaX, deltaY) > threshold;
}

export function shouldActivateSeal({
  startedOnSeal = false,
  releasedOnSeal = false,
  dragMoved = false,
} = {}) {
  return startedOnSeal && releasedOnSeal && !dragMoved;
}

function createTriangleGeometry(base, height) {
  const shape = new THREE.Shape();
  shape.moveTo(-base / 2, 0);
  shape.lineTo(base / 2, 0);
  shape.lineTo(0, height);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  });
}

function createSideFlapGeometry(isLeft) {
  const shape = new THREE.Shape();
  const sign = isLeft ? 1 : -1;
  shape.moveTo(0, -1.2);
  shape.lineTo(sign * 1.8, 0);
  shape.lineTo(0, 1.2);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  });
}

function createHeartReliefGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.09);
  shape.bezierCurveTo(-0.18, -0.24, -0.38, -0.02, 0, 0.24);
  shape.bezierCurveTo(0.38, -0.02, 0.18, -0.24, 0, -0.09);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.025,
    bevelEnabled: true,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  });
  geometry.center();
  geometry.rotateZ(Math.PI);
  return geometry;
}

/**
 * Builds the scene with an optional caller-owned cover texture. The cleanup
 * function disposes scene-owned resources but never disposes coverTexture.
 */
export function createEnvelopeScene({ coverTexture = null } = {}) {
  const group = new THREE.Group();
  group.name = 'preloader-envelope';

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: palette.body, roughness: 0.4, metalness: 0.15 });
  const deepBodyMaterial = new THREE.MeshStandardMaterial({ color: palette.bodyDeep, roughness: 0.5, metalness: 0.1 });
  const liningMaterial = new THREE.MeshStandardMaterial({ color: palette.lining, roughness: 0.65 });
  const paperMaterial = new THREE.MeshStandardMaterial({ color: palette.paper, roughness: 0.58 });
  const frontMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, map: coverTexture, roughness: 0.4, metalness: 0.05 });
  const waxMaterial = new THREE.MeshStandardMaterial({ color: palette.gold, roughness: 0.25, metalness: 0.85 });
  const reliefMaterial = new THREE.MeshStandardMaterial({ color: palette.gold, roughness: 0.25, metalness: 0.85 });

  const inner = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.3), liningMaterial);
  inner.name = 'preloader-envelope-inner';
  inner.position.z = -0.045;
  group.add(inner);

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 0.08), bodyMaterial);
  body.name = 'preloader-envelope-body';
  group.add(body);

  const front = new THREE.Mesh(new THREE.PlaneGeometry(3.56, 2.36), frontMaterial);
  front.name = 'preloader-envelope-front';
  front.position.z = 0.045;
  group.add(front);

  const letter = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.5, 0.02), paperMaterial);
  letter.name = 'preloader-envelope-letter';
  letter.position.set(0, -0.1, -0.015);
  letter.scale.setScalar(0.48);
  letter.rotation.y = Math.PI;
  group.add(letter);

  const bottomFlap = new THREE.Mesh(createTriangleGeometry(3.6, 1.3), bodyMaterial);
  bottomFlap.name = 'preloader-envelope-bottom-flap';
  bottomFlap.position.set(0, -1.2, -0.04);
  bottomFlap.rotation.y = Math.PI;
  group.add(bottomFlap);

  const leftFlap = new THREE.Mesh(createSideFlapGeometry(true), bodyMaterial);
  leftFlap.name = 'preloader-envelope-left-flap';
  leftFlap.position.set(-1.8, 0, -0.035);
  group.add(leftFlap);

  const rightFlap = new THREE.Mesh(createSideFlapGeometry(false), bodyMaterial);
  rightFlap.name = 'preloader-envelope-right-flap';
  rightFlap.position.set(1.8, 0, -0.035);
  group.add(rightFlap);

  const topFlapPivot = new THREE.Group();
  topFlapPivot.name = 'preloader-envelope-top-flap-pivot';
  topFlapPivot.position.set(0, 1.2, -0.04);

  const topFlap = new THREE.Mesh(createTriangleGeometry(3.6, -1.35), deepBodyMaterial);
  topFlap.name = 'preloader-envelope-top-flap';
  topFlap.rotation.y = Math.PI;
  topFlapPivot.add(topFlap);

  const seal = new THREE.Group();
  seal.name = 'preloader-envelope-seal';
  seal.position.set(0, -1.22, -0.03);

  const sealMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32), waxMaterial);
  sealMesh.name = 'preloader-envelope-seal-disc';
  sealMesh.rotation.x = Math.PI / 2;
  seal.add(sealMesh);

  const reliefGeometry = createHeartReliefGeometry();

  const relief = new THREE.Mesh(reliefGeometry, reliefMaterial);
  relief.name = 'preloader-envelope-seal-relief';
  relief.position.z = 0.05;
  seal.add(relief);

  const reliefBack = new THREE.Mesh(reliefGeometry, reliefMaterial);
  reliefBack.name = 'preloader-envelope-seal-relief-back';
  reliefBack.position.z = -0.05;
  reliefBack.rotation.y = Math.PI;
  seal.add(reliefBack);

  topFlapPivot.add(seal);
  group.add(topFlapPivot);

  const ownedGeometries = new Set();
  const ownedMaterials = new Set();
  group.traverse((object) => {
    if (object.geometry) {
      ownedGeometries.add(object.geometry);
    }

    if (object.material) {
      ownedMaterials.add(object.material);
    }
  });

  let disposed = false;

  return {
    group,
    topFlapPivot,
    seal,
    sealMesh,
    letterMesh: letter,
    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      ownedGeometries.forEach((geometry) => geometry.dispose());
      ownedMaterials.forEach((material) => material.dispose());
    },
  };
}

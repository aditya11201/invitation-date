import * as THREE from 'three';

const palette = Object.freeze({
  body: 0x6e3547,
  bodyDeep: 0x3b202c,
  lining: 0xf0e7e2,
  paper: 0xfcfbf7,
  rose: 0xa34e5d,
});

export function getEnvelopeCameraDistance(viewportWidth) {
  return viewportWidth < 640 ? 8.5 : 7.2;
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

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.025,
    bevelEnabled: true,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  });
}

/**
 * Builds the scene with an optional caller-owned cover texture. The cleanup
 * function disposes scene-owned resources but never disposes coverTexture.
 */
export function createEnvelopeScene({ coverTexture = null } = {}) {
  const group = new THREE.Group();
  group.name = 'preloader-envelope';

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: palette.body, roughness: 0.42, metalness: 0.08 });
  const deepBodyMaterial = new THREE.MeshStandardMaterial({ color: palette.bodyDeep, roughness: 0.5, metalness: 0.04 });
  const liningMaterial = new THREE.MeshStandardMaterial({ color: palette.lining, roughness: 0.65 });
  const paperMaterial = new THREE.MeshStandardMaterial({ color: palette.paper, roughness: 0.58 });
  const frontMaterial = new THREE.MeshStandardMaterial({ color: palette.body, map: coverTexture, roughness: 0.45, metalness: 0.04 });
  const waxMaterial = new THREE.MeshPhysicalMaterial({ color: palette.rose, roughness: 0.28, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const reliefMaterial = new THREE.MeshStandardMaterial({ color: palette.lining, roughness: 0.45, metalness: 0.04 });

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

  const bottomFlap = new THREE.Mesh(createTriangleGeometry(3.6, 1.3), deepBodyMaterial);
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

  const topFlap = new THREE.Mesh(createTriangleGeometry(3.6, -1.35), bodyMaterial);
  topFlap.name = 'preloader-envelope-top-flap';
  topFlapPivot.add(topFlap);

  const seal = new THREE.Group();
  seal.name = 'preloader-envelope-seal';
  seal.position.set(0, -1.22, -0.03);

  const sealMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32), waxMaterial);
  sealMesh.name = 'preloader-envelope-seal-disc';
  sealMesh.rotation.x = Math.PI / 2;
  seal.add(sealMesh);

  const relief = new THREE.Mesh(createHeartReliefGeometry(), reliefMaterial);
  relief.name = 'preloader-envelope-seal-relief';
  relief.position.z = 0.05;
  seal.add(relief);

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

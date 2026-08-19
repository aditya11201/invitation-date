import * as THREE from 'three';

/**
 * Creates an extruded 3D Heart geometry with smooth bevels
 */
export function createHeartGeometry(size = 1) {
  const x = 0, y = 0;
  const heartShape = new THREE.Shape();

  // Draw romantic heart curve
  heartShape.moveTo(x + 0.25 * size, y + 0.25 * size);
  heartShape.bezierCurveTo(x + 0.25 * size, y + 0.25 * size, x + 0.20 * size, y, x, y);
  heartShape.bezierCurveTo(x - 0.35 * size, y, x - 0.35 * size, y + 0.35 * size, x - 0.35 * size, y + 0.35 * size);
  heartShape.bezierCurveTo(x - 0.35 * size, y + 0.55 * size, x - 0.15 * size, y + 0.77 * size, x + 0.25 * size, y + 1.0 * size);
  heartShape.bezierCurveTo(x + 0.65 * size, y + 0.77 * size, x + 0.85 * size, y + 0.55 * size, x + 0.85 * size, y + 0.35 * size);
  heartShape.bezierCurveTo(x + 0.85 * size, y + 0.35 * size, x + 0.85 * size, y, x + 0.50 * size, y);
  heartShape.bezierCurveTo(x + 0.35 * size, y, x + 0.25 * size, y + 0.25 * size, x + 0.25 * size, y + 0.25 * size);

  const extrudeSettings = {
    depth: 0.15 * size,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.05 * size,
    bevelThickness: 0.05 * size,
  };

  const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  geometry.center();
  // Rotate so heart points upwards
  geometry.rotateZ(Math.PI);
  return geometry;
}

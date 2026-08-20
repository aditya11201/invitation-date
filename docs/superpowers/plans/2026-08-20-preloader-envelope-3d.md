# 3D Preloader Envelope Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current SVG-heart preloader with a procedural Three.js envelope scene inspired by `/mnt/c/Users/TiKi-TiKi/Documents/Dokumen Coding/My Github/invitation-web-app/test.html`, while preserving the existing invitation flow and audio handoff.

**Architecture:** Keep `Preloader` as the React state coordinator and add one isolated `PreloaderCanvas` component for the local Three.js renderer. Keep geometry creation in a browser-independent `envelopeScene.js` module so its scene contract can be tested without a WebGL context. The preloader reveals a sealed envelope, flips to the wax seal after narrative progress reaches 100%, accepts both canvas-pointer and semantic-button activation, animates the flap, then calls the existing entry boundary exactly once.

**Tech Stack:** React 19, Vite 6, Three.js 0.174, GSAP 3.12, Tailwind CSS 3.4 tokens, existing Web Audio utility, Node built-in `node:test`.

## Global Constraints

- Use the existing React + Vite bundle; do not copy the reference CDN scripts.
- Use Three.js procedural geometry (`BoxGeometry`, `PlaneGeometry`, `ExtrudeGeometry`, `CylinderGeometry`); do not add a `.glb`, `.gltf`, image, or texture asset.
- Do not add a runtime dependency. Use Node's built-in `node:test` for pure-module tests.
- Keep the existing invitation component tree after entry: `Hero`, `InvitationLetter`, `CelebrationScene`, `LocationPicker`, `CalendarJourney`, `GifReveal`, and `DateTicket` remain behaviorally unchanged.
- Keep the current English voice and personalize only from `invitationConfig`; do not copy the reference's `VIP PASS`, forced `YES/NO`, button-dodging, screen takeover, or infinite counter mechanics.
- Preserve the existing `onStart` handoff and make it fire once after the opening transition.
- Reuse `sound.js`; unlock audio on the user's seal/CTA gesture before playing the opening sound.
- Use existing design tokens: deep rose/burgundy envelope, warm ivory paper, dusk violet atmosphere, Playfair Display, Dancing Script, and Plus Jakarta Sans.
- Keep all semantic interactive targets at least 44px, with visible `:focus-visible` feedback.
- Expose progress through `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and a polite status message.
- Honor `prefers-reduced-motion`: remove continuous floating/particle motion and shorten the opening handoff.
- Keep the implementation compatible with `vite.config.js` relative `base: './'` and GitHub Pages subpaths.
- Do not modify generated `dist/` files manually and do not commit during this planning session.

---

## Existing Architecture and Reference Findings

### Current repo flow

```text
src/main.jsx
  └─ App.jsx
      ├─ ThreeScene                 // currently always mounted, fixed z-0 canvas
      ├─ Preloader                  // mounted while hasEntered === false, fixed z-50
      │   ├─ randomized progress interval
      │   ├─ isReady and isFading state
      │   ├─ SVG heart visual
      │   └─ onStart() after 600ms
      └─ invitation scenes           // mounted after hasEntered === true
```

`App.jsx` owns `hasEntered` and currently passes only `onStart` and `recipientName` to `Preloader`. `Preloader.jsx` owns its loading and fade state. `ThreeScene.jsx` already has a guarded WebGL setup and fallback, but it is a global background and should not run simultaneously with the new preloader renderer.

### Reference translation

The supplied `test.html` uses a standalone Three.js scene with a burgundy envelope body and flap hierarchy, a canvas-rendered cover/letter texture, directional/ambient/point lighting, a gold or rose wax seal, floating particles, a progress narrative that ends in a 180-degree envelope flip, and a seal interaction that opens the flap and transitions onward.

The implementation keeps the envelope, lighting, texture, progress narrative, and seal interaction. It does not copy the reference's game-like response buttons because the existing invitation already owns the later proposal interaction.

## File Map and Responsibilities

### Create

- `src/components/Preloader/preloaderStages.js` — pure progress clamping, phase selection, and `{{token}}` copy interpolation.
- `src/components/Preloader/preloaderStages.test.js` — Node tests for the pure helper contract.
- `src/components/Preloader/envelopeScene.js` — procedural Three.js envelope geometry, materials, named mesh references, camera distance helper, and disposal.
- `src/components/Preloader/envelopeScene.test.js` — Node tests for geometry names, dimensions, hierarchy, and camera distances without creating a renderer.
- `src/components/Preloader/PreloaderCanvas.jsx` — local renderer lifecycle, cover canvas texture, lights, particles, pointer raycasting, opening timeline, and WebGL fallback markup.
- `src/components/Preloader/preloader.css` — scoped backdrop, canvas stage, fallback envelope, progress rail, CTA, and reduced-motion styles.

### Modify

- `src/config/config.js:6-15` — add the preloader copy and progress phases.
- `package.json:6-10` — add the built-in Node test command.
- `src/App.jsx:15-70,153-167` — split audio unlock from the delayed `hasEntered` handoff and mount the global background Three.js scene only after entry.
- `src/components/Preloader/Preloader.jsx:1-100` — replace SVG visual/state presentation with the Three.js scene and accessible overlays.
- `index.html:6` — remove the mobile zoom restriction that prevents accessibility zoom.
- `README.md:11` — document the new Scene 0 behavior.

### Deliberately unchanged

- `src/components/ThreeCanvas/ThreeScene.jsx` — the existing global background scene and its fallback remain intact.
- `src/components/InvitationLetter/InvitationLetter.jsx` — the later envelope/letter experience remains the source of truth after entry.
- `src/utils/sound.js` — use its existing APIs; no new audio implementation.
- `src/index.css` and `tailwind.config.js` — use scoped preloader CSS and existing tokens rather than changing global styling.
- `vite.config.js` and `src/utils/assets.js` — no new asset path or base handling is needed.

## Acceptance Criteria

1. The preloader displays a procedural 3D envelope with burgundy paper, ivory lining, rose wax, restrained gold foil, lighting, depth, and ambient particles.
2. The cover texture uses the configured recipient, sender, and calendar year instead of hardcoded reference identities.
3. Narrative progress moves deterministically through four copy phases and exposes valid progress semantics.
4. At 100%, the envelope flips to the seal side and exposes an accessible open action.
5. Clicking the seal in the canvas or activating the HTML open button starts one opening timeline; repeated input cannot duplicate `onStart`.
6. The flap opens, the paper shifts forward, the preloader fades, and `App` mounts the existing invitation scenes.
7. Audio is unlocked from the user gesture before the opening sound is played; background music still starts through the existing sound configuration.
8. If the local WebGL renderer cannot initialize, the static fallback still displays and the semantic CTA still completes the handoff.
9. Reduced motion removes floating, particle, seal-pulse, and long flap motion while preserving a readable state transition.
10. The envelope remains contained at 390x844 and 1440x900, and all controls retain a 44px minimum hit area.
11. `npm test`, `npm run build`, and `git diff --check` pass.
12. The repository does not gain a CDN script, external model, or absolute asset dependency.

## Verification Evidence Path

| Claim | Evidence owner | Minimum evidence |
|---|---|---|
| Progress and copy boundaries are deterministic | `preloaderStages.test.js` | Tests at 0, 30, 31, 65, 66, 90, 91, 100, and out-of-range values |
| Envelope hierarchy has the required 3D parts | `envelopeScene.test.js` | Named object and geometry-parameter assertions without WebGL |
| Renderer lifecycle is safe | `PreloaderCanvas.jsx` + build | Cleanup code review, production build, one browser reload/unmount path |
| React handoff remains one-shot | `Preloader.jsx` + browser check | Repeated click/tap test and Hero visibility after opening |
| Accessibility behavior exists | JSX contract + browser check | Progress role, live text, keyboard activation, focus ring, reduced motion |
| GitHub Pages packaging remains valid | Vite build check | `dist/index.html`, relative paths, no reference CDN strings |

The WebGL renderer is browser-bound, so it is not mocked in Node tests. Geometry and state boundaries are tested in Node; renderer animation, fallback, and visual fidelity are verified in the browser after the production build.

---

### Task 1: Add deterministic preloader configuration and pure stage helpers

**Files:**

- Create: `src/components/Preloader/preloaderStages.test.js`
- Create: `src/components/Preloader/preloaderStages.js`
- Modify: `src/config/config.js:6-15`
- Modify: `package.json:6-10`

**Interfaces:**

- `clampProgress(value: unknown) -> number` returns an integer in `[0, 100]`; non-finite input returns `0`.
- `getPreloaderPhase(progress: unknown, phases: Array<{ start: number, key: string, message: string }>) -> { start: number, key: string, message: string }` selects the last phase whose `start` is not greater than the clamped progress.
- `formatPreloaderCopy(template: string, values: Record<string, string | number>) -> string` replaces `{{key}}` tokens and replaces missing values with an empty string.

- [ ] **Step 1: Write the failing tests**

Create `src/components/Preloader/preloaderStages.test.js`:

```js
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
  { start: 66, key: 'sealing', message: 'Adding a touch of rose wax...' },
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
```

- [ ] **Step 2: Run the tests and verify the expected red state**

Run:

```bash
node --test src/components/Preloader/preloaderStages.test.js
```

Expected: the command fails with `ERR_MODULE_NOT_FOUND` for `preloaderStages.js`; no production helper exists yet.

- [ ] **Step 3: Implement the minimal pure helper**

Create `src/components/Preloader/preloaderStages.js`:

```js
export function clampProgress(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.round(Math.max(0, Math.min(100, numericValue)));
}

export function getPreloaderPhase(progress, phases) {
  const safeProgress = clampProgress(progress);
  const orderedPhases = [...phases].sort((left, right) => left.start - right.start);

  return orderedPhases.reduce(
    (selectedPhase, phase) => (safeProgress >= phase.start ? phase : selectedPhase),
    orderedPhases[0],
  );
}

export function formatPreloaderCopy(template, values = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? ''));
}
```

- [ ] **Step 4: Run the focused tests and verify green**

Run:

```bash
node --test src/components/Preloader/preloaderStages.test.js
```

Expected: four tests pass and the process exits with code `0`.

- [ ] **Step 5: Add the preloader configuration block**

In `src/config/config.js`, insert this `preloader` property immediately after `hero` and before `letter`:

```js
  preloader: {
    badge: "A little delivery for {{recipientName}}",
    title: "Preparing something special for you... 💗",
    coverHeadline: "A sealed note",
    coverSubtext: "is waiting for you...",
    sealHint: "Tap the seal to open",
    openLabel: "Open {{recipientName}}'s invitation",
    phases: [
      { start: 0, key: "crafting", message: "Folding a little note..." },
      { start: 31, key: "writing", message: "Writing something just for {{recipientName}}..." },
      { start: 66, key: "sealing", message: "Adding a touch of rose wax..." },
      { start: 91, key: "ready", message: "Your invitation is ready." }
    ]
  },
```

The year shown on the envelope must be read from `invitationConfig.calendar.year`; do not add a second year value to the preloader configuration.

- [ ] **Step 6: Add the repository test command**

Replace the `scripts` object in `package.json` with:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test src/components/Preloader/*.test.js"
  },
```

- [ ] **Step 7: Run the package test command**

Run:

```bash
npm test
```

Expected: the four stage-helper tests pass. The shell glob currently resolves only `preloaderStages.test.js`; `envelopeScene.test.js` will be included after Task 2.

- [ ] **Step 8: Commit the tested configuration boundary**

```bash
git add package.json src/config/config.js src/components/Preloader/preloaderStages.js src/components/Preloader/preloaderStages.test.js
git commit -m "feat: add preloader narrative configuration"
```

---

### Task 2: Build and test the procedural envelope hierarchy

**Files:**

- Create: `src/components/Preloader/envelopeScene.test.js`
- Create: `src/components/Preloader/envelopeScene.js`

**Interfaces:**

- `getEnvelopeCameraDistance(viewportWidth: number) -> number` returns `8.5` below `640px` and `7.2` at or above `640px`.
- `createEnvelopeScene(options?: { coverTexture?: THREE.Texture | null }) -> { group, topFlapPivot, seal, sealMesh, letterMesh, dispose }` returns a named envelope graph and a cleanup function.
- The returned graph contains `preloader-envelope-body`, `preloader-envelope-front`, `preloader-envelope-letter`, `preloader-envelope-bottom-flap`, `preloader-envelope-left-flap`, `preloader-envelope-right-flap`, `preloader-envelope-top-flap`, and `preloader-envelope-seal`.

- [ ] **Step 1: Write the failing hierarchy tests**

Create `src/components/Preloader/envelopeScene.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests and verify the expected red state**

Run:

```bash
node --test src/components/Preloader/envelopeScene.test.js
```

Expected: the command fails with `ERR_MODULE_NOT_FOUND` for `envelopeScene.js`.

- [ ] **Step 3: Implement the geometry and material builder**

Create `src/components/Preloader/envelopeScene.js`:

```js
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

function disposeMaterial(material) {
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  if (!material) {
    return;
  }

  if (material.map) {
    material.map.dispose();
  }

  material.dispose();
}

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

  return {
    group,
    topFlapPivot,
    seal,
    sealMesh,
    letterMesh: letter,
    dispose() {
      group.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          disposeMaterial(object.material);
        }
      });
    },
  };
}
```

- [ ] **Step 4: Run the hierarchy tests and verify green**

Run:

```bash
node --test src/components/Preloader/envelopeScene.test.js
```

Expected: three tests pass with exit code `0`; no `WebGLRenderer` is created.

- [ ] **Step 5: Run all current unit tests**

Run:

```bash
npm test
```

Expected: eight tests pass: four stage-helper tests and four envelope-scene tests.

- [ ] **Step 6: Commit the tested scene graph**

```bash
git add src/components/Preloader/envelopeScene.js src/components/Preloader/envelopeScene.test.js
git commit -m "feat: add procedural preloader envelope scene"
```

---

### Task 3: Add the isolated Three.js canvas, texture, animation, and fallback

**Files:**

- Create: `src/components/Preloader/PreloaderCanvas.jsx`

**Interfaces:**

- Consumes `isReady`, `isOpening`, `reducedMotion`, and `coverContent: { recipientName: string, senderName: string, year: number, headline: string, subtext: string }`.
- Calls `onSealReady: () => void` after the 180-degree flip, `onSealActivate: () => void` when the seal is raycast, and `onOpenComplete: () => void` after the flap timeline.
- Produces one `.preloader-canvas` container and a CSS fallback when `WebGLRenderer` creation throws.
- When WebGL is unavailable, calls `onSealReady` after `isReady` becomes true and calls `onOpenComplete` once the semantic CTA begins opening, so the fallback preserves the full handoff contract.
- The canvas is `aria-hidden="true"`; `Preloader.jsx` owns the semantic open button.

- [ ] **Step 1: Write the failing browser-boundary check**

Run before creating the file:

```bash
node --input-type=module -e "import fs from 'node:fs'; try { fs.readFileSync('src/components/Preloader/PreloaderCanvas.jsx','utf8'); throw new Error('PreloaderCanvas already exists'); } catch (error) { if (error.code !== 'ENOENT') throw error; console.log('RED: local preloader canvas is not implemented'); }"
```

Expected: `RED: local preloader canvas is not implemented`.

This boundary cannot be rendered by Node without a browser WebGL context. Geometry behavior is already covered by Task 2; this task uses a source contract, the Vite build, and browser validation for the renderer lifecycle.

- [ ] **Step 2: Create `PreloaderCanvas.jsx` with one renderer and explicit cleanup**

Create `src/components/Preloader/PreloaderCanvas.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  createEnvelopeScene,
  getEnvelopeCameraDistance,
} from './envelopeScene.js';

function createCoverTexture({ recipientName, senderName, year, headline, subtext }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1440;
  canvas.height = 960;
  const context = canvas.getContext('2d');
  const safeRecipient = recipientName || 'you';
  const safeSender = senderName || 'someone special';

  context.fillStyle = '#6e3547';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#d4af37';
  context.lineWidth = 12;
  context.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);
  context.strokeStyle = 'rgba(252, 251, 247, 0.24)';
  context.lineWidth = 3;
  context.strokeRect(58, 58, canvas.width - 116, canvas.height - 116);

  context.fillStyle = '#fcfbf7';
  context.textAlign = 'left';
  context.font = 'italic 40px "Playfair Display", Georgia, serif';
  context.fillText(`From: ${safeSender}`, 112, 168);
  context.font = '700 52px "Playfair Display", Georgia, serif';
  context.fillText(`To: ${safeRecipient}`, 112, 254);

  context.fillStyle = '#f3e5ab';
  context.font = '700 64px "Playfair Display", Georgia, serif';
  context.fillText(headline, 112, 520);
  context.fillStyle = '#f0e7e2';
  context.font = 'italic 54px "Playfair Display", Georgia, serif';
  context.fillText(subtext, 112, 592);

  context.fillStyle = '#f3e5ab';
  context.textAlign = 'right';
  context.font = '700 30px "Plus Jakarta Sans", sans-serif';
  context.fillText(String(year), canvas.width - 112, 168);
  context.font = '700 24px "Plus Jakarta Sans", sans-serif';
  context.fillText('PRIVATE DELIVERY', canvas.width - 112, 208);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      texture.needsUpdate = true;
    });
  }

  return texture;
}

function createDustField() {
  const positions = new Float32Array(60 * 3);

  for (let index = 0; index < positions.length; index += 3) {
    positions[index] = THREE.MathUtils.randFloatSpread(14);
    positions[index + 1] = THREE.MathUtils.randFloatSpread(10);
    positions[index + 2] = THREE.MathUtils.randFloatSpread(8);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xd4af37,
    size: 0.045,
    transparent: true,
    opacity: 0.55,
  });

  return {
    points: new THREE.Points(geometry, material),
    geometry,
    material,
  };
}

function getPointerPosition(event, element) {
  const bounds = element.getBoundingClientRect();

  return new THREE.Vector2(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
}

export default function PreloaderCanvas({
  isReady,
  isOpening,
  reducedMotion,
  coverContent,
  onSealReady,
  onSealActivate,
  onOpenComplete,
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const callbacksRef = useRef({ onSealReady, onSealActivate, onOpenComplete });
  const reducedMotionRef = useRef(reducedMotion);
  const fallbackReadyRef = useRef(false);
  const fallbackOpenRef = useRef(false);
  const [webGLAvailable, setWebGLAvailable] = useState(true);

  callbacksRef.current = { onSealReady, onSealActivate, onOpenComplete };
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x3b202c, 0.035);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, getEnvelopeCameraDistance(width));

    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      container.appendChild(renderer.domElement);
    } catch (error) {
      console.warn('Preloader WebGL unavailable; using static envelope fallback.', error);
      setWebGLAvailable(false);
      return undefined;
    }

    const coverTexture = createCoverTexture(coverContent);
    const envelope = createEnvelopeScene({ coverTexture });
    const dust = createDustField();
    scene.add(envelope.group);
    scene.add(dust.points);

    scene.add(new THREE.AmbientLight(0xfff0f5, 1.2));

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.1);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const violetLight = new THREE.PointLight(0x876d91, 2.1, 16);
    violetLight.position.set(-4, -3, 3);
    scene.add(violetLight);

    const roseLight = new THREE.PointLight(0xa34e5d, 1.8, 14);
    roseLight.position.set(3, -2, 2);
    scene.add(roseLight);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const clock = new THREE.Clock();
    const state = {
      scene,
      camera,
      renderer,
      envelope,
      dust,
      raycaster,
      pointer,
      mouse,
      clock,
      frameId: 0,
      didFlip: false,
      didOpen: false,
    };
    sceneRef.current = state;

    const handlePointerMove = (event) => {
      const nextPointer = getPointerPosition(event, container);
      mouse.targetX = nextPointer.x;
      mouse.targetY = nextPointer.y;
    };

    const handlePointerUp = (event) => {
      if (!state.didFlip || state.didOpen) {
        return;
      }

      pointer.copy(getPointerPosition(event, container));
      raycaster.setFromCamera(pointer, camera);

      if (raycaster.intersectObject(envelope.seal, true).length > 0) {
        callbacksRef.current.onSealActivate();
      }
    };

    const handleResize = () => {
      const nextWidth = container.clientWidth || window.innerWidth;
      const nextHeight = container.clientHeight || window.innerHeight;
      camera.aspect = nextWidth / nextHeight;
      camera.position.z = getEnvelopeCameraDistance(nextWidth);
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('resize', handleResize);

    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      if (!reducedMotionRef.current) {
        envelope.group.position.y = Math.sin(elapsed * 1.2) * 0.08;
        envelope.group.rotation.x = mouse.y * 0.08;
        envelope.group.rotation.y += (mouse.x * 0.16 - envelope.group.rotation.y) * 0.03;
        dust.points.rotation.y += 0.0007;
      }

      renderer.render(scene, camera);
      state.frameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(state.frameId);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      gsap.killTweensOf([
        envelope.group.rotation,
        envelope.group.position,
        envelope.topFlapPivot.rotation,
        envelope.seal.scale,
        envelope.letterMesh.position,
      ]);
      envelope.dispose();
      dust.geometry.dispose();
      dust.material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      sceneRef.current = null;
    };
  }, [coverContent]);

  useEffect(() => {
    if (!webGLAvailable && isReady && !fallbackReadyRef.current) {
      fallbackReadyRef.current = true;
      callbacksRef.current.onSealReady();
    }
  }, [webGLAvailable, isReady]);

  useEffect(() => {
    const state = sceneRef.current;

    if (!state || !isReady || state.didFlip) {
      return undefined;
    }

    state.didFlip = true;

    if (reducedMotion) {
      state.envelope.group.rotation.y = Math.PI;
      callbacksRef.current.onSealReady();
      return undefined;
    }

    const tween = gsap.to(state.envelope.group.rotation, {
      y: Math.PI,
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => callbacksRef.current.onSealReady(),
    });

    return () => tween.kill();
  }, [isReady, reducedMotion]);

  useEffect(() => {
    const state = sceneRef.current;

    if (!isOpening) {
      return undefined;
    }

    if (!state) {
      if (!webGLAvailable && !fallbackOpenRef.current) {
        fallbackOpenRef.current = true;
        callbacksRef.current.onOpenComplete();
      }
      return undefined;
    }

    if (state.didOpen) {
      return undefined;
    }

    state.didOpen = true;

    if (reducedMotion) {
      state.envelope.topFlapPivot.rotation.x = -Math.PI * 0.95;
      state.envelope.group.position.y = -0.8;
      state.envelope.letterMesh.position.y = 1.2;
      callbacksRef.current.onOpenComplete();
      return undefined;
    }

    const timeline = gsap.timeline({
      onComplete: () => callbacksRef.current.onOpenComplete(),
    });

    timeline
      .to(state.envelope.seal.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.18 })
      .to(state.envelope.seal.scale, { x: 0.25, y: 0.25, z: 0.25, duration: 0.28 })
      .to(state.envelope.topFlapPivot.rotation, { x: -Math.PI * 0.95, duration: 0.9, ease: 'power2.out' }, '<')
      .to(state.envelope.letterMesh.position, { y: 1.25, z: -0.25, duration: 1.1, ease: 'power3.out' }, '-=0.55')
      .to(state.envelope.group.position, { y: -0.8, duration: 0.9, ease: 'power2.out' }, '-=0.85');

    return () => timeline.kill();
  }, [isOpening, reducedMotion, webGLAvailable]);

  return (
    <div ref={containerRef} className="preloader-canvas" aria-hidden="true">
      {!webGLAvailable && (
        <div className="preloader-canvas__fallback">
          <div className="preloader-canvas__fallback-envelope">
            <div className="preloader-canvas__fallback-letter">
              <span>To: {coverContent.recipientName || 'you'}</span>
              <span>{coverContent.headline}</span>
              <span>{coverContent.year}</span>
            </div>
            <div className="preloader-canvas__fallback-flap" />
            <div className="preloader-canvas__fallback-seal">♥</div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Run the contract check, all unit tests, and the build**

Run:

```bash
node --input-type=module -e "import fs from 'node:fs'; const source=fs.readFileSync('src/components/Preloader/PreloaderCanvas.jsx','utf8'); for (const token of ['createEnvelopeScene','WebGLRenderer','createCoverTexture','onSealReady','onSealActivate','onOpenComplete','dispose()']) { if (!source.includes(token)) throw new Error('Missing canvas boundary: '+token); } console.log('GREEN: preloader canvas boundary confirmed');"
npm test
npm run build
```

Expected: the contract command prints `GREEN: preloader canvas boundary confirmed`; eight unit tests pass; Vite exits with code `0`.

- [ ] **Step 4: Commit the isolated renderer**

```bash
git add src/components/Preloader/PreloaderCanvas.jsx
git commit -m "feat: add preloader three canvas lifecycle"
```

---

### Task 4: Integrate the canvas into React and preserve the audio handoff

**Files:**

- Create: `src/components/Preloader/preloader.css`
- Modify: `src/components/Preloader/Preloader.jsx:1-100`
- Modify: `src/App.jsx:15-70,153-167`
- Modify: `index.html:6`

**Interfaces:**

- `App` produces `onAudioUnlock: () => void` and `onStart: () => void` for `Preloader`.
- `Preloader` consumes `recipientName`, `senderName`, `year`, `preloaderConfig`, `onAudioUnlock`, and `onStart`.
- `Preloader` produces the `PreloaderCanvas` props defined in Task 3.
- `onAudioUnlock` runs immediately from the user's seal/CTA gesture; `onStart` runs only after the visual handoff.

- [ ] **Step 1: Write the failing preloader source-contract check**

Run before replacing the component:

```bash
node --input-type=module -e "import fs from 'node:fs'; const source=fs.readFileSync('src/components/Preloader/Preloader.jsx','utf8'); for (const token of ['preloaderHeart','Open My Invitation','bg-gradient-to-r from-pink-500']) { if (!source.includes(token)) throw new Error('Current preloader marker missing: '+token); } console.log('RED: old preloader contract confirmed');"
```

Expected: `RED: old preloader contract confirmed`.

- [ ] **Step 2: Replace `Preloader.jsx` with the state coordinator**

The replacement must keep all timer cleanup local to the component, use `useMemo` for the `coverContent` object so the canvas effect does not recreate on every progress update, and call the audio unlock callback before sound effects.

Replace `src/components/Preloader/Preloader.jsx` with the implementation in the code block below:

```jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';
import { clampProgress, formatPreloaderCopy, getPreloaderPhase } from './preloaderStages.js';
import PreloaderCanvas from './PreloaderCanvas';
import './preloader.css';

export default function Preloader({ onAudioUnlock, onStart, preloaderConfig, recipientName, senderName, year }) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSealReady, setIsSealReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const startTimeoutRef = useRef(null);
  const openedRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener?.('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener?.('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(100);
      setIsLoaded(true);
      return undefined;
    }

    const startedAt = performance.now();
    const duration = 3200;
    let frameId = 0;
    const updateProgress = (timestamp) => {
      const nextProgress = clampProgress(((timestamp - startedAt) / duration) * 100);
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        setIsLoaded(true);
        return;
      }
      frameId = requestAnimationFrame(updateProgress);
    };

    frameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frameId);
  }, [reducedMotion]);

  useEffect(() => () => clearTimeout(startTimeoutRef.current), []);

  const displayName = recipientName || 'you';
  const safeSenderName = senderName || 'someone special';
  const values = useMemo(
    () => ({ recipientName: displayName, senderName: safeSenderName, year }),
    [displayName, safeSenderName, year],
  );
  const coverContent = useMemo(
    () => ({
      recipientName: displayName,
      senderName: safeSenderName,
      year,
      headline: preloaderConfig.coverHeadline,
      subtext: preloaderConfig.coverSubtext,
    }),
    [displayName, safeSenderName, year, preloaderConfig.coverHeadline, preloaderConfig.coverSubtext],
  );
  const phase = getPreloaderPhase(progress, preloaderConfig.phases);
  const loadingMessage = formatPreloaderCopy(phase.message, values);
  const format = (template) => formatPreloaderCopy(template, values);

  const handleOpen = () => {
    if (!isSealReady || isOpening || openedRef.current) return;
    openedRef.current = true;
    onAudioUnlock();
    sound.playPop(1.2);
    sound.playSparkle();
    setIsOpening(true);
  };

  const handleOpenComplete = () => {
    if (isFading || startedRef.current) return;
    setIsFading(true);
    startTimeoutRef.current = window.setTimeout(() => {
      if (startedRef.current) return;
      startedRef.current = true;
      onStart();
    }, reducedMotion ? 80 : 520);
  };

  return (
    <section className={`preloader${isFading ? ' is-fading' : ''}`} aria-busy={!isSealReady}>
      <div className="preloader__ambient preloader__ambient--rose" aria-hidden="true" />
      <div className="preloader__ambient preloader__ambient--violet" aria-hidden="true" />
      <div className="preloader__content">
        <p className="preloader__eyebrow"><Sparkles aria-hidden="true" /><span>{format(preloaderConfig.badge)}</span></p>
        <h1 className="preloader__title">{preloaderConfig.title}</h1>
        <p className="preloader__dedication">for {displayName} 💗</p>
        <div className="preloader__scene-stage">
          <PreloaderCanvas
            coverContent={coverContent}
            isOpening={isOpening}
            isReady={isLoaded}
            onOpenComplete={handleOpenComplete}
            onSealActivate={handleOpen}
            onSealReady={() => setIsSealReady(true)}
            reducedMotion={reducedMotion}
          />
        </div>
        <div className="preloader__progress-panel">
          <div className="preloader__progress-track" role="progressbar" aria-label="Preparing your invitation" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress} aria-valuetext={loadingMessage}>
            <div className="preloader__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="preloader__progress-meta">
            <span className="preloader__progress-message" role="status" aria-live="polite">{loadingMessage}</span>
            <span className="preloader__progress-value">{progress}%</span>
          </div>
        </div>
        <p className="preloader__hint" aria-live="polite">{isSealReady ? preloaderConfig.sealHint : 'Preparing the seal...'}</p>
        <button type="button" className="preloader__cta" onClick={handleOpen} disabled={!isSealReady || isOpening} aria-label={format(preloaderConfig.openLabel)}>
          <span>{format(preloaderConfig.openLabel)}</span>
          <Heart className="preloader__cta-icon" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Split audio unlock from the delayed entry handoff in `App.jsx`**

Replace the current `handleStart` block in `src/App.jsx` with:

```jsx
  const handleAudioUnlock = () => {
    setMusicEnabled(true);
    sound.setMuted(false, invitationConfig.audio?.backgroundMusic, invitationConfig.audio?.enableSynthesizerFallback);
  };

  const handleStart = () => {
    setHasEntered(true);
  };
```

Replace the always-mounted `ThreeScene` and preloader section with:

```jsx
      {hasEntered && (
        <ThreeScene isCelebration={acceptedInvitation} sceneProgress={scrollProgress} />
      )}

      {!hasEntered && (
        <Preloader
          onAudioUnlock={handleAudioUnlock}
          onStart={handleStart}
          preloaderConfig={invitationConfig.preloader}
          recipientName={invitationConfig.recipientName}
          senderName={invitationConfig.senderName}
          year={invitationConfig.calendar.year}
        />
      )}
```

Keep `sound.setMuted(true)` and `setMusicEnabled(false)` in reset logic. Do not alter question-lock or downstream scene state.

- [ ] **Step 4: Remove the zoom restriction from `index.html`**

Change `index.html:6` to:

```html
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

- [ ] **Step 5: Add the scoped preloader stylesheet**

Create `src/components/Preloader/preloader.css`:

```css
.preloader {
  --preloader-bg: #1b0d14;
  --preloader-bg-mid: #3b202c;
  --preloader-rose-light: #d69a99;
  --preloader-ivory: #fcfbf7;
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: max(1.5rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right)) max(1.5rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left));
  color: var(--preloader-ivory);
  background:
    radial-gradient(circle at 50% 32%, rgba(163, 78, 93, 0.42), transparent 24rem),
    radial-gradient(circle at 88% 18%, rgba(135, 109, 145, 0.28), transparent 22rem),
    radial-gradient(circle at 50% 100%, #542b3a 0%, var(--preloader-bg-mid) 46%, var(--preloader-bg) 100%);
  opacity: 1;
  transition: opacity 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.preloader.is-fading { opacity: 0; pointer-events: none; }

.preloader__ambient {
  position: absolute;
  width: 18rem;
  height: 18rem;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(5rem);
}

.preloader__ambient--rose {
  top: 10%;
  left: 50%;
  background: rgba(214, 154, 153, 0.16);
  transform: translateX(-75%);
}

.preloader__ambient--violet {
  right: 4%;
  bottom: 8%;
  width: 16rem;
  height: 16rem;
  background: rgba(201, 183, 210, 0.18);
}

.preloader__content {
  position: relative;
  z-index: 1;
  display: flex;
  width: min(100%, 42rem);
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.preloader__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 0.75rem;
  color: var(--preloader-rose-light);
  font: 700 0.68rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.preloader__eyebrow svg { width: 0.9rem; height: 0.9rem; }

.preloader__title {
  max-width: 31rem;
  margin: 0;
  color: var(--preloader-ivory);
  font: 700 clamp(1.65rem, 5vw, 2.6rem)/1.08 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.preloader__dedication {
  margin: 0.35rem 0 0.8rem;
  color: var(--preloader-rose-light);
  font: 700 clamp(1.7rem, 6vw, 2.35rem)/1.05 'Dancing Script', 'Caveat', cursive;
}

.preloader__scene-stage {
  position: relative;
  width: min(92vw, 40rem);
  height: min(47vh, 22rem);
  min-height: 14rem;
  margin-bottom: 0.2rem;
}

.preloader-canvas {
  position: absolute;
  inset: 0;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
}

.preloader-canvas:active { cursor: grabbing; }
.preloader-canvas canvas { display: block; width: 100%; height: 100%; }

.preloader-canvas__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.preloader-canvas__fallback-envelope {
  position: relative;
  width: min(82vw, 22rem);
  aspect-ratio: 3 / 2;
  border: 1px solid rgba(212, 175, 55, 0.6);
  border-radius: 1rem;
  background: linear-gradient(145deg, #6e3547, #3b202c);
  box-shadow: 0 2rem 3rem -1.5rem rgba(0, 0, 0, 0.75);
}

.preloader-canvas__fallback-letter {
  position: absolute;
  inset: 8% 10% 12%;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 1rem;
  border-top: 2px solid rgba(212, 175, 55, 0.75);
  border-radius: 0.5rem 0.5rem 0 0;
  color: #3b202c;
  background: #fcfbf7;
  font: 0.85rem/1.3 'Playfair Display', Georgia, serif;
}

.preloader-canvas__fallback-letter span:nth-child(2) {
  margin-top: auto;
  color: #6e3547;
  font-size: 1.35rem;
  font-weight: 700;
}

.preloader-canvas__fallback-flap {
  position: absolute;
  inset: 0 0 auto;
  z-index: 2;
  height: 62%;
  background: linear-gradient(160deg, #873f50, #542b3a);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.preloader-canvas__fallback-seal {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  display: grid;
  width: 3.8rem;
  height: 3.8rem;
  place-items: center;
  border: 2px solid rgba(243, 229, 171, 0.7);
  border-radius: 50%;
  color: #f3e5ab;
  background: #a34e5d;
  font-size: 1.45rem;
  transform: translate(-50%, -50%);
}

.preloader__progress-panel { width: min(100%, 21rem); }

.preloader__progress-track {
  height: 0.7rem;
  padding: 0.12rem;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.42);
  border-radius: 9999px;
  background: rgba(10, 1, 4, 0.38);
}

.preloader__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #a34e5d, #d69a99, #f3e5ab);
  box-shadow: 0 0 1rem rgba(212, 175, 55, 0.48);
  transition: width 120ms ease-out;
}

.preloader__progress-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.55rem;
  color: rgba(252, 251, 247, 0.78);
  font: 600 0.7rem/1.3 'Plus Jakarta Sans', system-ui, sans-serif;
}

.preloader__progress-message { min-width: 0; text-align: left; }
.preloader__progress-value { color: #f3e5ab; font-variant-numeric: tabular-nums; letter-spacing: 0.1em; }

.preloader__hint {
  min-height: 1.2rem;
  margin: 0.85rem 0 0.65rem;
  color: rgba(252, 251, 247, 0.72);
  font: 0.72rem/1.3 'Plus Jakarta Sans', system-ui, sans-serif;
}

.preloader__cta {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 0.85rem 1.55rem;
  border: 1px solid rgba(212, 175, 55, 0.6);
  border-radius: 9999px;
  color: var(--preloader-ivory);
  background: #6e3547;
  box-shadow: 0 0 2rem -0.75rem rgba(214, 154, 153, 0.85);
  cursor: pointer;
  font: 700 0.74rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: transform 220ms ease, background 220ms ease, box-shadow 220ms ease;
}

.preloader__cta:hover:not(:disabled) { background: #873f50; transform: translateY(-2px); }
.preloader__cta:active:not(:disabled) { transform: translateY(1px) scale(0.97); }
.preloader__cta:focus-visible { outline: 2px solid #f3e5ab; outline-offset: 4px; }
.preloader__cta:disabled { cursor: wait; opacity: 0.55; }
.preloader__cta-icon { width: 1.1rem; height: 1.1rem; fill: currentColor; }

@media (max-width: 480px) {
  .preloader { padding-right: 1rem; padding-left: 1rem; }
  .preloader__scene-stage { width: 96vw; height: 38vh; min-height: 12.5rem; }
  .preloader__progress-meta { font-size: 0.64rem; }
}

@media (prefers-reduced-motion: reduce) {
  .preloader, .preloader__progress-fill, .preloader__cta { transition-duration: 0.01ms; }
}
```

- [ ] **Step 6: Run the integration contract, unit tests, and build**

Run:

```bash
node --input-type=module -e "import fs from 'node:fs'; const app=fs.readFileSync('src/App.jsx','utf8'); const preloader=fs.readFileSync('src/components/Preloader/Preloader.jsx','utf8'); const html=fs.readFileSync('index.html','utf8'); for (const token of ['onAudioUnlock','invitationConfig.preloader','year={invitationConfig.calendar.year}','{hasEntered &&','!hasEntered &&']) { if (!app.includes(token)) throw new Error('Missing App integration: '+token); } for (const token of ['PreloaderCanvas','role=\"progressbar\"','aria-valuenow','onAudioUnlock','sound.playPop','onStart']) { if (!preloader.includes(token)) throw new Error('Missing Preloader integration: '+token); } if (html.includes('user-scalable=no') || html.includes('maximum-scale=1.0')) throw new Error('Viewport zoom restriction remains'); console.log('GREEN: React preloader integration confirmed');"
npm test
npm run build
```

Expected: the contract command prints `GREEN: React preloader integration confirmed`; eight unit tests pass; Vite exits with code `0`.

- [ ] **Step 7: Commit the React integration**

```bash
git add index.html src/App.jsx src/components/Preloader/Preloader.jsx src/components/Preloader/preloader.css
git commit -m "feat: integrate interactive envelope preloader"
```

---

### Task 5: Document Scene 0 and perform integrated browser validation

**Files:**

- Modify: `README.md:11`
- Verify: `src/components/Preloader/Preloader.jsx`
- Verify: `src/components/Preloader/PreloaderCanvas.jsx`
- Verify: `src/components/Preloader/preloader.css`
- Verify: `src/components/Preloader/preloaderStages.test.js`
- Verify: `src/components/Preloader/envelopeScene.test.js`
- Verify: generated `dist/index.html`

**Interfaces:**

- Consumes the completed preloader implementation and its unit/build evidence.
- Produces documentation and a repeatable manual validation record for visual, input, accessibility, fallback, and deployment behavior.

- [ ] **Step 1: Update the README Scene 0 description**

Replace the current Scene 0 bullet in `README.md`:

```md
1. **Scene 0 — 3D Preloader**: Procedural Three.js envelope with burgundy stationery, ivory lining, rose wax seal, narrative progress, and an entry gesture that unlocks audio autoplay.
```

Do not rewrite unrelated README sections.

- [ ] **Step 2: Run the complete static checks**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: eight tests pass, Vite writes `dist/index.html`, and `git diff --check` prints no errors.

- [ ] **Step 3: Verify the generated bundle has no reference CDN dependency**

Run:

```bash
node --input-type=module -e "import fs from 'node:fs'; const output='dist/index.html'; if (!fs.existsSync(output)) throw new Error('Build output is missing: '+output); const source=fs.readFileSync(output,'utf8'); const forbiddenHosts=['cdnjs.cloudflare.com','cdn.jsdelivr.net','unpkg.com','threejs.org']; const runtimeTags=[]; for (const match of source.matchAll(/<(script|link)\b([^>]*)>/gi)) { const tag=match[1].toLowerCase(); const attributes=match[2]; const urlMatch=attributes.match(/\b(?:src|href)=['\"](https?:\/\/[^'\"]+)['\"]/i); if (!urlMatch) continue; const url=urlMatch[1]; const rel=(attributes.match(/\brel=['\"]([^'\"]+)['\"]/i)?.[1] || '').split(/\s+/); const isGoogleFontsStylesheet=tag==='link' && rel.includes('stylesheet') && /^https:\/\/fonts\.googleapis\.com\/css2\?/.test(url); const isRuntimeDependency=tag==='script' || (tag==='link' && rel.some((value)=>['stylesheet','modulepreload','preload'].includes(value))); if (isRuntimeDependency && !isGoogleFontsStylesheet) runtimeTags.push(url); } const forbidden=runtimeTags.filter((url)=>forbiddenHosts.some((host)=>new URL(url).hostname===host || new URL(url).hostname.endsWith('.'+host))); if (forbidden.length) throw new Error('Reference CDN leaked into build: '+[...new Set(forbidden)].join(', ')); if (runtimeTags.length) throw new Error('External runtime dependency leaked into build: '+[...new Set(runtimeTags)].join(', ')); console.log('GREEN: runtime dependencies are bundled; Google Fonts stylesheet links are allowed');"
```

Expected: `GREEN: runtime dependencies are bundled; Google Fonts stylesheet links are allowed`. The existing Google Fonts stylesheet remains an explicitly allowed external stylesheet; application runtime dependencies must remain bundled.

- [ ] **Step 4: Commit the documentation update**

```bash
git add README.md
git commit -m "docs: describe three envelope preloader"
```

- [ ] **Step 5: Start the production preview**

Run:

```bash
npm run preview -- --host 127.0.0.1
```

Open the printed local URL so Vite asset paths and the production bundle are exercised.

- [ ] **Step 6: Validate the desktop path at 1440x900**

Check in order:

1. The preloader covers the old global background while the local scene initializes.
2. The envelope has visible depth, burgundy exterior, ivory paper, rose seal, warm foil, and subtle particles.
3. The cover reads the configured recipient and sender and uses `calendar.year`.
4. Progress reaches 100% in approximately 3.2 seconds and changes to the ready phase.
5. The envelope flips to its seal side before the CTA becomes enabled.
6. Clicking the canvas seal starts the same opening path as clicking the CTA.
7. The seal scales down, the top flap opens, the letter shifts forward, and the preloader fades.
8. The Hero scene mounts after the fade and background music starts through `App.handleAudioUnlock`.
9. Rapid repeated clicks do not mount the invitation twice or call `onStart` twice.

- [ ] **Step 7: Validate the mobile path at 390x844**

Check in order:

1. The envelope remains fully inside the viewport with no horizontal scrollbar.
2. The progress message and percentage remain readable without overlap.
3. The CTA is at least 48px tall and remains above the safe-area inset.
4. Touch interaction on the seal does not scroll the page or trigger an unrelated scene.
5. After opening, the existing invitation content remains scrollable.

- [ ] **Step 8: Validate keyboard, reduced motion, and fallback behavior**

Check in order:

1. Press `Tab` until the open CTA is focused; verify the focus ring is visible.
2. Activate the focused CTA with `Enter`, then repeat from a reload with `Space`.
3. Enable `prefers-reduced-motion: reduce`, reload, and verify floating, particle, and seal-pulse motion are absent.
4. In reduced-motion mode, verify the seal-ready and handoff states complete without a long flap animation.
5. Disable WebGL or use a browser context where `WebGLRenderer` throws; verify the static fallback envelope appears and the semantic CTA still opens the invitation.

- [ ] **Step 9: Inspect the final diff and generated output**

Run:

```bash
git status --short
git diff --stat HEAD~5..HEAD
```

Expected: only the planned source, test, config, documentation, and plan files are modified; generated `dist/` files are not staged. If a browser is unavailable, retain the unit tests, build, static contract checks, and explicitly record browser validation as unobserved.

## Self-Review

### Spec coverage

- Existing section analysis: covered by the architecture map and file responsibilities.
- Reference envelope: covered by procedural Three.js geometry, canvas cover texture, lighting, seal, particles, and flip timeline.
- Existing content adaptation: covered by `recipientName`, `senderName`, `calendar.year`, and configurable English phase copy.
- React integration: covered by explicit `App` and `Preloader` prop interfaces.
- Audio: covered by the separate gesture-time `onAudioUnlock` callback and existing `sound.js` calls.
- Accessibility: covered by semantic progress, live status, keyboard CTA, visible focus, safe-area padding, zoom preservation, and reduced motion.
- WebGL resilience: covered by renderer `try/catch`, static fallback markup, and browser validation.
- Performance/lifecycle: covered by conditional global `ThreeScene` mounting, one local renderer, rAF cancellation, event cleanup, GSAP cleanup, and geometry/material disposal.
- Testing: covered by red/green Node tests for pure behavior, source-contract checks for the browser boundary, Vite build, bundle scan, and manual browser checks.
- Documentation: covered by the single README Scene 0 update.

### Placeholder scan

The plan contains exact paths, function signatures, code, commands, expected results, and commit messages. It does not rely on unspecified future decisions or filler implementation markers.

### Interface consistency

- Task 1 defines `clampProgress`, `getPreloaderPhase`, and `formatPreloaderCopy`; Task 4 imports those exact names.
- Task 2 defines `createEnvelopeScene` and `getEnvelopeCameraDistance`; Task 3 imports those exact names.
- Task 3 defines `PreloaderCanvas` props `isReady`, `isOpening`, `reducedMotion`, `coverContent`, `onSealReady`, `onSealActivate`, and `onOpenComplete`; Task 4 passes those exact props.
- Task 4 defines `onAudioUnlock` and `onStart` as separate callbacks; `App.jsx` supplies both and preserves the downstream scene contract.
- CSS class names emitted by `Preloader.jsx` and `PreloaderCanvas.jsx` are defined in `preloader.css`.
- WebGL fallback keeps the same semantic readiness/opening contract: `isReady` enables the CTA through `onSealReady`, and `isOpening` completes through `onOpenComplete` even when `sceneRef.current` is null.

### Post-implementation adjustments

- **Preloader layout and short viewport scrolling (`preloader.css`)**: Used `overflow-x: hidden; overflow-y: auto;` with safe centering (`place-items: safe center; place-content: safe center;` and `margin: auto 0;`) along with a `@media (max-height: 680px)` breakpoint and width constraints (`max-width: 100%`, `white-space: normal`, `overflow-wrap: anywhere`, `min(96vw, 100%)`) so that 200% zoom, short viewports, and narrow viewports keep all content and the CTA reachable without horizontal clipping.
- **PreloaderCanvas lifecycle and motion gating (`PreloaderCanvas.jsx`)**: Added `lifecycleRef` and `sceneGeneration` rehydration across prop updates, guarded the Three.js setup effect against re-initializing hidden renderers when `webGLAvailable` is false, and replaced perpetual requestAnimationFrame in `prefers-reduced-motion` mode with a single static frame render while retaining dynamic preference switching and resource disposal.
- **Runtime dependency scan (`dist/index.html`)**: Corrected the post-build runtime dependency scan script in Task 5 to permit pre-existing Google Fonts stylesheet `<link>` tags while strictly verifying that no external JavaScript or CDN scripts are loaded.

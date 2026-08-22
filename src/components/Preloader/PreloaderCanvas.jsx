import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { resolveFallbackSealLabel, isFallbackSealDisabled } from './preloaderStages.js';
import {
  createEnvelopeScene,
  getEnvelopeCameraDistance,
  DRAG_THRESHOLD_PX,
  clampPointerPosition,
  computeDragRotation,
  computeEnvelopeTargetRotation,
  computeCanonicalOpenRotation,
  getBaseYaw,
  ENVELOPE_OPEN_FINAL_STATE,
  ENVELOPE_OPEN_TIMING,
  isActivePointer,
  isPrimaryPointerDown,
  isDragMovement,
  isSealReady,
  canArmPointerDown,
  shouldActivateSeal,
  shouldUpdatePointerHover,
} from './envelopeScene.js';

function drawCoverCanvas(context, canvas, { recipientName, senderName, year, headline, subtext }) {
  const safeRecipient = recipientName || 'you';
  const safeSender = senderName || 'Your Secret Admirer';

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ec4899';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = '#fce7f3';
  context.lineWidth = 14;
  context.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

  context.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  context.lineWidth = 3.5;
  context.strokeRect(56, 56, canvas.width - 112, canvas.height - 112);

  // Stamp & Postmark
  context.fillStyle = '#fcfbf7';
  context.fillRect(canvas.width - 280, 80, 200, 240);
  context.fillStyle = '#db2777';
  context.font = "bold 40px 'Plus Jakarta Sans', sans-serif";
  context.textAlign = 'center';
  context.fillText('VIP PASS', canvas.width - 180, 180);
  context.fillText(String(year || 2026), canvas.width - 180, 240);

  // Addresses & Main Headline
  context.fillStyle = '#fce7f3';
  context.textAlign = 'left';
  context.font = "italic 44px 'Cormorant Garamond', Georgia, serif";
  context.fillText(`FROM: ${safeSender}`, 100, 140);
  context.font = "bold 64px 'Cormorant Garamond', Georgia, serif";
  context.fillText(`TO: ${safeRecipient} ✨`, 100, 260);

  context.fillStyle = '#ffffff';
  context.font = "bold 68px 'Cormorant Garamond', Georgia, serif";
  context.fillText(headline || 'A Sealed Secret', 100, 520);
  context.fillStyle = '#fce7f3';
  context.font = "italic 64px 'Cormorant Garamond', Georgia, serif";
  context.fillText(subtext || 'is waiting for you...', 100, 620);
}

function createCoverTexture({ recipientName, senderName, year, headline, subtext, onUpdate }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1440;
  canvas.height = 960;
  const context = canvas.getContext('2d');
  const content = { recipientName, senderName, year, headline, subtext };

  drawCoverCanvas(context, canvas, content);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  let disposed = false;

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      if (disposed) {
        return;
      }

      drawCoverCanvas(context, canvas, content);
      texture.needsUpdate = true;
      onUpdate?.();
    });
  }

  return {
    texture,
    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      texture.dispose();
    },
  };
}

function wrapCanvasText(context, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || context.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

/**
 * Letter face mirroring the long paper sheet's identity (.paper-vertical-sheet):
 * #FDFBF7 base, #e5dccb dot grain every 16px, vertical sheen overlay,
 * warm gold hairline edge, rounded corners on transparency.
 */
function drawLetterCanvas(context, canvas, { badge, greeting, subtitle, scrollPrompt, recipientName }) {
  const width = canvas.width;
  const height = canvas.height;
  const radius = 32;

  // Fully transparent base — everything outside the roundRect stays clear.
  context.clearRect(0, 0, width, height);

  context.save();
  context.beginPath();
  context.roundRect(0, 0, width, height, radius);
  context.fillStyle = '#FDFBF7';
  context.fill();

  // Dot grain clipped inside the paper path.
  context.clip();
  context.fillStyle = '#e5dccb';
  for (let y = 8; y < height; y += 16) {
    for (let x = 8; x < width; x += 16) {
      context.beginPath();
      context.arc(x, y, 0.7, 0, Math.PI * 2);
      context.fill();
    }
  }

  // Vertical sheen overlay.
  const sheen = context.createLinearGradient(0, 0, 0, height);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  sheen.addColorStop(1, 'rgba(248, 242, 230, 0.4)');
  context.fillStyle = sheen;
  context.fillRect(0, 0, width, height);
  context.restore();

  // Subtle warm gold hairline (no drawn frame).
  context.save();
  context.beginPath();
  context.roundRect(3, 3, width - 6, height - 6, radius);
  context.strokeStyle = 'rgba(212, 163, 115, 0.35)';
  context.lineWidth = 2;
  context.stroke();
  context.restore();

  const centerX = width / 2;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Caveat handwriting greeting.
  context.font = "600 78px 'Caveat', cursive";
  context.fillStyle = '#4D121D';
  let cursorY = 250;
  wrapCanvasText(context, greeting || `For ${recipientName} 💗`, 560).forEach((lineText) => {
    context.fillText(lineText, centerX, cursorY);
    cursorY += 92;
  });

  // Italic Playfair subtitle, 60px below the greeting block.
  if (subtitle) {
    context.font = "italic 36px 'Playfair Display', Georgia, serif";
    context.fillStyle = 'rgba(42, 27, 24, 0.8)';
    let subtitleY = cursorY - 92 + 60;
    wrapCanvasText(context, subtitle, 520).forEach((lineText) => {
      context.fillText(lineText, centerX, subtitleY);
      subtitleY += 46;
    });
  }

  // Uppercase scroll prompt near the bottom edge.
  if (scrollPrompt) {
    context.font = "700 20px 'Plus Jakarta Sans', sans-serif";
    try {
      context.letterSpacing = '3px';
    } catch {
      // ignore
    }
    context.fillStyle = '#7A2030';
    context.fillText(String(scrollPrompt).toUpperCase(), centerX, height - 130);
  }

  try {
    context.letterSpacing = '0px';
  } catch {
    // ignore
  }
}

function createLetterTexture({ letterContent, onUpdate }) {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1013;
  const context = canvas.getContext('2d');
  const content = { ...letterContent };

  drawLetterCanvas(context, canvas, content);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  let disposed = false;

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      if (disposed) {
        return;
      }

      drawLetterCanvas(context, canvas, content);
      texture.needsUpdate = true;
      onUpdate?.();
    });
  }

  return {
    texture,
    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      texture.dispose();
    },
  };
}

function createDustField() {
  const pCount = 90;
  const positions = new Float32Array(pCount * 3);

  for (let index = 0; index < positions.length; index += 3) {
    positions[index] = THREE.MathUtils.randFloatSpread(14);
    positions[index + 1] = THREE.MathUtils.randFloatSpread(12);
    positions[index + 2] = THREE.MathUtils.randFloatSpread(8);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Soft heart sprites — keeps the preloader dust in the same love-particle
  // visual language as the floating hearts behind the paper sections.
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = 64;
  spriteCanvas.height = 64;
  const spriteContext = spriteCanvas.getContext('2d');
  spriteContext.translate(32, 34);
  spriteContext.scale(2, 2);
  spriteContext.beginPath();
  spriteContext.moveTo(0, 9);
  spriteContext.bezierCurveTo(-11, -1, -8, -12, 0, -6);
  spriteContext.bezierCurveTo(8, -12, 11, -1, 0, 9);
  spriteContext.closePath();
  const spriteGradient = spriteContext.createRadialGradient(0, -2, 1, 0, -2, 12);
  spriteGradient.addColorStop(0, 'rgba(244, 114, 182, 0.9)');
  spriteGradient.addColorStop(1, 'rgba(244, 114, 182, 0.15)');
  spriteContext.fillStyle = spriteGradient;
  spriteContext.fill();

  const heartSprite = new THREE.CanvasTexture(spriteCanvas);
  heartSprite.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.PointsMaterial({
    map: heartSprite,
    color: 0xffffff,
    size: 0.16,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    alphaTest: 0.02,
    sizeAttenuation: true,
  });

  return {
    points: new THREE.Points(geometry, material),
    geometry,
    material,
    sprite: heartSprite,
  };
}

function getPointerPosition(event, element) {
  const bounds = element.getBoundingClientRect();

  return clampPointerPosition(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
}

function applyOpenFinalState(envelope) {
  envelope.seal.scale.setScalar(ENVELOPE_OPEN_FINAL_STATE.sealScale);
  envelope.topFlapPivot.rotation.x = ENVELOPE_OPEN_FINAL_STATE.topFlapRotationX;
  envelope.group.position.y = ENVELOPE_OPEN_FINAL_STATE.groupY;
  envelope.letterMesh.position.y = ENVELOPE_OPEN_FINAL_STATE.letterY;
  envelope.letterMesh.position.z = ENVELOPE_OPEN_FINAL_STATE.letterZ;
  envelope.letterMesh.scale.setScalar(ENVELOPE_OPEN_FINAL_STATE.letterScale);
}

export default function PreloaderCanvas({
  isReady,
  isOpening,
  isSealReady: isSealReadyProp,
  reducedMotion,
  coverContent,
  letterContent,
  openLabel,
  onSealReady,
  onSealActivate,
  onOpenComplete,
  onLetterRect,
  onWebGLChange,
}) {
  const {
    recipientName,
    senderName,
    year,
    headline,
    subtext,
  } = coverContent;
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const callbacksRef = useRef({ onSealReady, onSealActivate, onOpenComplete, onLetterRect, onWebGLChange });
  const reducedMotionRef = useRef(reducedMotion);
  const lifecycleRef = useRef({
    flipStarted: false,
    flipComplete: false,
    openStarted: false,
    openComplete: false,
  });
  const sceneGenerationRef = useRef(0);
  const [sceneGeneration, setSceneGeneration] = useState(1);
  const fallbackReadyRef = useRef(false);
  const fallbackOpenRef = useRef(false);
  const [webGLAvailable, setWebGLAvailable] = useState(true);

  callbacksRef.current = { onSealReady, onSealActivate, onOpenComplete, onLetterRect, onWebGLChange };
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !webGLAvailable) {
      return undefined;
    }

    const nextSceneGeneration = sceneGenerationRef.current + 1;
    sceneGenerationRef.current = nextSceneGeneration;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf6f2ed, 0.018);
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
      if (renderer) {
        renderer.dispose();

        if (renderer.domElement?.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }

      console.warn('Preloader WebGL unavailable; using static envelope fallback.', error);
      setWebGLAvailable(false);
      callbacksRef.current.onWebGLChange?.(false);
      return undefined;
    }

    const coverTexture = createCoverTexture({
      recipientName,
      senderName,
      year,
      headline,
      subtext,
      onUpdate: () => {
        if (reducedMotionRef.current && sceneRef.current) {
          sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
        }
      },
    });
    const letterTexture = createLetterTexture({
      letterContent: { ...letterContent, recipientName },
      onUpdate: () => {
        if (reducedMotionRef.current && sceneRef.current) {
          sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
        }
      },
    });
    const envelope = createEnvelopeScene({
      coverTexture: coverTexture.texture,
      letterTexture: letterTexture.texture,
    });
    const dust = createDustField();
    scene.add(envelope.group);
    scene.add(dust.points);

    const lifecycle = lifecycleRef.current;

    if (lifecycle.flipComplete || lifecycle.openStarted || lifecycle.openComplete) {
      envelope.group.rotation.set(0, Math.PI, 0);
    }

    if (lifecycle.openComplete) {
      applyOpenFinalState(envelope);
    }

    scene.add(new THREE.AmbientLight(0xfff5f8, 1.45));

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.1);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const roseLight = new THREE.PointLight(0xf472b6, 2.4, 18);
    roseLight.position.set(-3, -2, 3);
    scene.add(roseLight);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const drag = {
      isPointerDown: false,
      dragMoved: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      startYaw: 0,
      startPitch: 0,
      yaw: 0,
      pitch: 0,
      startedOnSeal: false,
    };
    const clock = new THREE.Clock();
    let fallbackPointerListenersAttached = false;
    let removeFallbackPointerListeners = () => {};
    const resetDrag = () => {
      const activePointerId = drag.pointerId;

      if (activePointerId !== null && container.releasePointerCapture) {
        try {
          if (!container.hasPointerCapture || container.hasPointerCapture(activePointerId)) {
            container.releasePointerCapture(activePointerId);
          }
        } catch {
          // Ignore untracked pointer capture errors
        }
      }

      removeFallbackPointerListeners();
      drag.isPointerDown = false;
      drag.dragMoved = false;
      drag.pointerId = null;
      drag.startX = 0;
      drag.startY = 0;
      drag.startYaw = 0;
      drag.startPitch = 0;
      drag.startedOnSeal = false;
    };
    const state = {
      scene,
      camera,
      renderer,
      envelope,
      dust,
      raycaster,
      pointer,
      mouse,
      drag,
      clock,
      frameId: 0,
      generation: nextSceneGeneration,
      didFlip: lifecycle.flipStarted || lifecycle.flipComplete,
      flipComplete: lifecycle.flipComplete,
      didOpen: lifecycle.openStarted || lifecycle.openComplete,
      openComplete: lifecycle.openComplete,
      resetDrag,
    };
    sceneRef.current = state;

    if (nextSceneGeneration !== sceneGeneration) {
      setSceneGeneration(nextSceneGeneration);
    }

    const isSealHit = (event) => {
      pointer.copy(getPointerPosition(event, container));
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObject(envelope.seal, true).length > 0;
    };

    const handlePointerDown = (event) => {
      if (!canArmPointerDown(state)) {
        return;
      }

      if (!isPrimaryPointerDown(event) || drag.isPointerDown || drag.pointerId !== null) {
        return;
      }

      drag.isPointerDown = true;
      drag.pointerId = event.pointerId;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      drag.startYaw = drag.yaw;
      drag.startPitch = drag.pitch;
      drag.dragMoved = false;
      drag.startedOnSeal = isSealReady(state) && isSealHit(event);

      if (container.setPointerCapture) {
        try {
          container.setPointerCapture(event.pointerId);
        } catch {
          // Window fallback listeners cover unavailable pointer capture.
        }
      }

      addFallbackPointerListeners();
    };

    const handlePointerMove = (event) => {
      if (!shouldUpdatePointerHover(drag, event.pointerId)) {
        return;
      }

      const nextPointer = getPointerPosition(event, container);
      mouse.targetX = nextPointer.x;
      mouse.targetY = nextPointer.y;

      if (!drag.isPointerDown) {
        return;
      }

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      if (!drag.dragMoved && isDragMovement(deltaX, deltaY, DRAG_THRESHOLD_PX)) {
        drag.dragMoved = true;
      }

      const canDrag = !state.didOpen && (!state.didFlip || state.flipComplete);

      if (canDrag && drag.dragMoved) {
        const computed = computeDragRotation({
          startYaw: drag.startYaw,
          startPitch: drag.startPitch,
          deltaX,
          deltaY,
          sensitivity: 0.004,
        });
        drag.yaw = computed.yaw;
        drag.pitch = computed.pitch;
      }

      if (reducedMotionRef.current && canDrag && drag.dragMoved) {
        const baseYaw = getBaseYaw(state);
        const targetRotation = computeEnvelopeTargetRotation({
          baseYaw,
          dragYaw: drag.yaw,
          dragPitch: drag.pitch,
          hoverX: 0,
          hoverY: 0,
        });
        envelope.group.rotation.x = targetRotation.pitch;
        envelope.group.rotation.y = targetRotation.yaw;
        renderer.render(scene, camera);
      }
    };

    const handlePointerUp = (event) => {
      const isTargetPointer = isActivePointer(drag, event.pointerId);

      if (!isTargetPointer) {
        return;
      }

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      const hadDragMovement = drag.dragMoved || isDragMovement(deltaX, deltaY, DRAG_THRESHOLD_PX);
      const releasedOnSeal = state.flipComplete && !state.didOpen && isSealHit(event);
      const shouldActivate = shouldActivateSeal({
        startedOnSeal: drag.startedOnSeal,
        releasedOnSeal,
        dragMoved: hadDragMovement,
      });

      state.resetDrag();

      if (hadDragMovement || !state.flipComplete || state.didOpen) {
        return;
      }

      if (shouldActivate) {
        callbacksRef.current.onSealActivate?.();
      }
    };

    const handlePointerCancel = (event) => {
      if (!isActivePointer(drag, event.pointerId)) {
        return;
      }

      state.resetDrag();
    };

    const handleLostPointerCapture = (event) => {
      if (!isActivePointer(drag, event.pointerId)) {
        return;
      }

      state.resetDrag();
    };

    const handleWindowBlur = () => {
      state.resetDrag();
    };

    const addFallbackPointerListeners = () => {
      if (fallbackPointerListenersAttached) {
        return;
      }

      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerup', handlePointerUp, { passive: true });
      window.addEventListener('pointercancel', handlePointerCancel, { passive: true });
      fallbackPointerListenersAttached = true;
    };

    removeFallbackPointerListeners = () => {
      if (!fallbackPointerListenersAttached) {
        return;
      }

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      fallbackPointerListenersAttached = false;
    };

    const handleResize = () => {
      const nextWidth = container.clientWidth || window.innerWidth;
      const nextHeight = container.clientHeight || window.innerHeight;
      camera.aspect = nextWidth / nextHeight;
      camera.position.z = getEnvelopeCameraDistance(nextWidth);
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
      if (reducedMotionRef.current) {
        renderer.render(scene, camera);
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerup', handlePointerUp, { passive: true });
    container.addEventListener('pointercancel', handlePointerCancel, { passive: true });
    container.addEventListener('lostpointercapture', handleLostPointerCapture);
    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      state.resetDrag();
      if (state.frameId) {
        cancelAnimationFrame(state.frameId);
        state.frameId = 0;
      }
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointercancel', handlePointerCancel);
      container.removeEventListener('lostpointercapture', handleLostPointerCapture);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handleWindowBlur);
      gsap.killTweensOf([
        envelope.group.rotation,
        envelope.group.position,
        envelope.topFlapPivot.rotation,
        envelope.seal.scale,
        envelope.letterMesh.position,
        envelope.letterMesh.scale,
      ]);
      envelope.dispose();
      coverTexture.dispose();
      letterTexture.dispose();
      dust.geometry.dispose();
      if (dust.material.map) dust.material.map.dispose();
      dust.material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      sceneRef.current = null;
    };
  }, [recipientName, senderName, year, headline, subtext, letterContent?.badge, letterContent?.greeting, letterContent?.subtitle, letterContent?.scrollPrompt, webGLAvailable]);

  useEffect(() => {
    const state = sceneRef.current;

    if (!state || state.generation !== sceneGeneration) {
      return undefined;
    }

    if (reducedMotion) {
      if (state.frameId) {
        cancelAnimationFrame(state.frameId);
        state.frameId = 0;
      }
      gsap.killTweensOf(state.envelope.seal.scale);
      if (!state.didOpen) {
        state.envelope.seal.scale.set(1, 1, 1);
      }
      state.renderer.render(state.scene, state.camera);
      return undefined;
    }

    if (state.flipComplete && !state.didOpen && !state.openComplete) {
      gsap.killTweensOf(state.envelope.seal.scale);
      gsap.to(state.envelope.seal.scale, {
        x: 1.25,
        y: 1.25,
        z: 1.25,
        duration: 0.6,
        yoyo: true,
        repeat: -1,
      });
    }

    let localFrameId = 0;

    const renderFrame = () => {
      const elapsed = state.clock.getElapsedTime();
      state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
      state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

      const canAnimateEnvelope = !state.didOpen && (!state.didFlip || state.flipComplete);

      if (canAnimateEnvelope) {
        state.envelope.group.position.y = Math.sin(elapsed * 1.2) * 0.08;
        const baseYaw = getBaseYaw(state);
        const targetRotation = computeEnvelopeTargetRotation({
          baseYaw,
          dragYaw: state.drag.yaw,
          dragPitch: state.drag.pitch,
          hoverX: state.mouse.x,
          hoverY: state.mouse.y,
        });
        state.envelope.group.rotation.x += (targetRotation.pitch - state.envelope.group.rotation.x) * 0.1;
        state.envelope.group.rotation.y += (targetRotation.yaw - state.envelope.group.rotation.y) * 0.1;
      }
      state.dust.points.rotation.y += 0.0007;

      state.renderer.render(state.scene, state.camera);
      localFrameId = requestAnimationFrame(renderFrame);
      state.frameId = localFrameId;
    };

    localFrameId = requestAnimationFrame(renderFrame);
    state.frameId = localFrameId;

    return () => {
      if (localFrameId) {
        cancelAnimationFrame(localFrameId);
      }
      if (state.frameId === localFrameId) {
        state.frameId = 0;
      }
      if (state.envelope?.seal?.scale) {
        gsap.killTweensOf(state.envelope.seal.scale);
      }
    };
  }, [reducedMotion, sceneGeneration]);

  useEffect(() => {
    const lifecycle = lifecycleRef.current;

    if (!webGLAvailable && isReady && !fallbackReadyRef.current && !lifecycle.flipComplete) {
      fallbackReadyRef.current = true;
      lifecycle.flipStarted = true;
      lifecycle.flipComplete = true;
      callbacksRef.current.onSealReady();
    }
  }, [webGLAvailable, isReady]);

  useEffect(() => {
    const state = sceneRef.current;
    const lifecycle = lifecycleRef.current;

    if (!state || state.generation !== sceneGeneration || !isReady || state.flipComplete) {
      return undefined;
    }

    state.resetDrag();
    state.drag.yaw = 0;
    state.drag.pitch = 0;

    if (reducedMotion) {
      state.didFlip = true;
      lifecycle.flipStarted = true;
      lifecycle.flipComplete = true;
      state.envelope.group.rotation.set(0, Math.PI, 0);
      state.flipComplete = true;
      callbacksRef.current.onSealReady();
      state.renderer.render(state.scene, state.camera);
      return undefined;
    }

    state.didFlip = true;
    lifecycle.flipStarted = true;

    const tweenX = gsap.to(state.envelope.group.rotation, {
      x: 0,
      duration: 0.8,
      ease: 'power2.out',
    });

    const tween = gsap.to(state.envelope.group.rotation, {
      y: Math.PI,
      duration: 1.4,
      ease: 'power2.inOut',
      onComplete: () => {
        if (sceneRef.current !== state || state.flipComplete || lifecycle.flipComplete) {
          return;
        }

        lifecycle.flipComplete = true;
        state.flipComplete = true;
        state.drag.yaw = 0;
        state.drag.pitch = 0;
        callbacksRef.current.onSealReady();

        gsap.to(state.envelope.seal.scale, {
          x: 1.25,
          y: 1.25,
          z: 1.25,
          duration: 0.6,
          yoyo: true,
          repeat: -1,
        });
      },
    });

    return () => {
      state.resetDrag();
      tweenX.kill();
      tween.kill();
      if (state.envelope?.seal?.scale) {
        gsap.killTweensOf(state.envelope.seal.scale);
      }
    };
  }, [isReady, reducedMotion, sceneGeneration]);

  useEffect(() => {
    const state = sceneRef.current;
    const lifecycle = lifecycleRef.current;

    if (!isOpening) {
      return undefined;
    }

    if (!state) {
      if (!webGLAvailable && !fallbackOpenRef.current && !lifecycle.openComplete) {
        fallbackOpenRef.current = true;
        lifecycle.openStarted = true;
        lifecycle.openComplete = true;
        callbacksRef.current.onOpenComplete();
      }
      return undefined;
    }

    if (state.generation !== sceneGeneration) {
      return undefined;
    }

    if (state.openComplete) {
      return undefined;
    }

    state.resetDrag();
    state.drag.yaw = 0;
    state.drag.pitch = 0;

    const canonicalOpen = computeCanonicalOpenRotation({
      currentYaw: state.envelope.group.rotation.y,
      currentPitch: state.envelope.group.rotation.x,
      targetBaseYaw: Math.PI,
    });

    if (reducedMotion) {
      state.didOpen = true;
      lifecycle.openStarted = true;
      lifecycle.openComplete = true;
      state.envelope.group.rotation.set(0, Math.PI, 0);
      applyOpenFinalState(state.envelope);
      state.openComplete = true;
      callbacksRef.current.onOpenComplete();
      state.renderer.render(state.scene, state.camera);
      return undefined;
    }

    state.didOpen = true;
    lifecycle.openStarted = true;

    gsap.killTweensOf([
      state.envelope.seal.scale,
      state.envelope.group.rotation,
    ]);
    state.envelope.seal.scale.set(1, 1, 1);

    const timeline = gsap.timeline({
      onComplete: () => {
        if (sceneRef.current !== state || state.openComplete || lifecycle.openComplete) {
          return;
        }

        lifecycle.openComplete = true;
        state.openComplete = true;
        try {
          const cam = state.camera || sceneRef.current?.camera;
          const domElement = state.renderer?.domElement;
          if (cam && domElement) {
            const box = new THREE.Box3().setFromObject(state.envelope.letterMesh);
            const corners = [
              new THREE.Vector3(box.min.x, box.min.y, box.min.z),
              new THREE.Vector3(box.max.x, box.min.y, box.min.z),
              new THREE.Vector3(box.min.x, box.max.y, box.min.z),
              new THREE.Vector3(box.max.x, box.max.y, box.min.z),
              new THREE.Vector3(box.min.x, box.min.y, box.max.z),
              new THREE.Vector3(box.max.x, box.min.y, box.max.z),
              new THREE.Vector3(box.min.x, box.max.y, box.max.z),
              new THREE.Vector3(box.max.x, box.max.y, box.max.z),
            ];
            const vw = domElement.clientWidth || window.innerWidth;
            const vh = domElement.clientHeight || window.innerHeight;
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            corners.forEach((v) => {
              v.project(cam);
              minX = Math.min(minX, (v.x * 0.5 + 0.5) * vw);
              maxX = Math.max(maxX, (v.x * 0.5 + 0.5) * vw);
              minY = Math.min(minY, (-v.y * 0.5 + 0.5) * vh);
              maxY = Math.max(maxY, (-v.y * 0.5 + 0.5) * vh);
            });
            const rect = { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
            if (Number.isFinite(rect.left) && rect.width > 1 && rect.height > 1) {
              callbacksRef.current.onLetterRect?.(rect);
            }
          }
        } catch {
          // Rect is an enhancement; never block the open completion.
        }
        callbacksRef.current.onOpenComplete();
      },
    });

    timeline
      .to(state.envelope.group.rotation, {
        x: canonicalOpen.x,
        y: canonicalOpen.y,
        duration: ENVELOPE_OPEN_TIMING.recenterDuration,
        ease: 'power2.out',
      })
      .to(state.envelope.seal.scale, {
        x: ENVELOPE_OPEN_FINAL_STATE.sealScale,
        y: ENVELOPE_OPEN_FINAL_STATE.sealScale,
        z: ENVELOPE_OPEN_FINAL_STATE.sealScale,
        duration: 0.2,
      }, ENVELOPE_OPEN_TIMING.revealStartTime)
      .to(state.envelope.topFlapPivot.rotation, {
        x: ENVELOPE_OPEN_FINAL_STATE.topFlapRotationX,
        duration: 1.1,
        ease: 'back.out(1.8)',
      }, ENVELOPE_OPEN_TIMING.revealStartTime)
      .to(state.envelope.group.position, {
        y: ENVELOPE_OPEN_FINAL_STATE.groupY,
        duration: 1.2,
        ease: 'power2.out',
      }, ENVELOPE_OPEN_TIMING.envelopeDescentStartTime)
      .to(state.envelope.letterMesh.position, {
        y: ENVELOPE_OPEN_FINAL_STATE.letterY,
        z: ENVELOPE_OPEN_FINAL_STATE.letterZ,
        duration: 1.4,
        ease: 'power3.out',
      }, ENVELOPE_OPEN_TIMING.letterRiseStartTime)
      .to(state.envelope.letterMesh.scale, {
        x: ENVELOPE_OPEN_FINAL_STATE.letterScale,
        y: ENVELOPE_OPEN_FINAL_STATE.letterScale,
        z: ENVELOPE_OPEN_FINAL_STATE.letterScale,
        duration: 1.4,
        ease: 'back.out(1.4)',
      }, ENVELOPE_OPEN_TIMING.letterRiseStartTime);

    return () => timeline.kill();
  }, [isOpening, reducedMotion, webGLAvailable, sceneGeneration]);

  const sealReady = isSealReadyProp !== undefined ? isSealReadyProp : (fallbackReadyRef.current || isReady);
  const sealDisabled = isFallbackSealDisabled({ isSealReady: sealReady, isOpening });
  const resolvedOpenLabel = resolveFallbackSealLabel(openLabel, recipientName);

  return (
    <div ref={containerRef} className="preloader-canvas" aria-hidden={webGLAvailable ? 'true' : undefined}>
      {!webGLAvailable && (
        <div className="preloader-canvas__fallback">
          <div className="preloader-canvas__fallback-envelope">
            <div className="preloader-canvas__fallback-letter">
              <span>To: {recipientName || 'you'}</span>
              <span>{headline}</span>
              <span>{year}</span>
            </div>
            <div className="preloader-canvas__fallback-flap" aria-hidden="true" />
            <button
              type="button"
              className="preloader-canvas__fallback-seal"
              onClick={() => callbacksRef.current.onSealActivate?.()}
              disabled={sealDisabled}
              aria-label={resolvedOpenLabel}
            >
              <span aria-hidden="true">♥</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

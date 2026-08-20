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
  const {
    recipientName,
    senderName,
    year,
    headline,
    subtext,
  } = coverContent;
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
      if (renderer) {
        renderer.dispose();

        if (renderer.domElement?.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }

      console.warn('Preloader WebGL unavailable; using static envelope fallback.', error);
      setWebGLAvailable(false);
      return undefined;
    }

    const coverTexture = createCoverTexture({ recipientName, senderName, year, headline, subtext });
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
      flipComplete: false,
      didOpen: false,
      openComplete: false,
    };
    sceneRef.current = state;

    const handlePointerMove = (event) => {
      const nextPointer = getPointerPosition(event, container);
      mouse.targetX = nextPointer.x;
      mouse.targetY = nextPointer.y;
    };

    const handlePointerUp = (event) => {
      if (!state.flipComplete || state.didOpen) {
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
        if (!state.didFlip && !state.didOpen) {
          envelope.group.position.y = Math.sin(elapsed * 1.2) * 0.08;
          envelope.group.rotation.x = mouse.y * 0.08;
          envelope.group.rotation.y += (mouse.x * 0.16 - envelope.group.rotation.y) * 0.03;
        }
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
      coverTexture.dispose();
      dust.geometry.dispose();
      dust.material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      sceneRef.current = null;
    };
  }, [recipientName, senderName, year, headline, subtext]);

  useEffect(() => {
    if (!webGLAvailable && isReady && !fallbackReadyRef.current) {
      fallbackReadyRef.current = true;
      callbacksRef.current.onSealReady();
    }
  }, [webGLAvailable, isReady]);

  useEffect(() => {
    const state = sceneRef.current;

    if (!state || !isReady || state.flipComplete) {
      return undefined;
    }

    if (reducedMotion) {
      state.didFlip = true;
      state.envelope.group.rotation.y = Math.PI;
      state.flipComplete = true;
      callbacksRef.current.onSealReady();
      return undefined;
    }

    if (state.didFlip) {
      return undefined;
    }

    state.didFlip = true;

    const tween = gsap.to(state.envelope.group.rotation, {
      y: Math.PI,
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => {
        if (state.flipComplete) {
          return;
        }

        state.flipComplete = true;
        callbacksRef.current.onSealReady();
      },
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

    if (state.openComplete) {
      return undefined;
    }

    if (reducedMotion) {
      state.didOpen = true;
      state.envelope.topFlapPivot.rotation.x = -Math.PI * 0.95;
      state.envelope.group.position.y = -0.8;
      state.envelope.letterMesh.position.y = 1.2;
      state.openComplete = true;
      callbacksRef.current.onOpenComplete();
      return undefined;
    }

    if (state.didOpen) {
      return undefined;
    }

    state.didOpen = true;

    const timeline = gsap.timeline({
      onComplete: () => {
        if (state.openComplete) {
          return;
        }

        state.openComplete = true;
        callbacksRef.current.onOpenComplete();
      },
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
              <span>To: {recipientName || 'you'}</span>
              <span>{headline}</span>
              <span>{year}</span>
            </div>
            <div className="preloader-canvas__fallback-flap" />
            <div className="preloader-canvas__fallback-seal">♥</div>
          </div>
        </div>
      )}
    </div>
  );
}

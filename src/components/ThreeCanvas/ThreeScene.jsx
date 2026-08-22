import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createHeartGeometry } from './heartGeometry';

export default function ThreeScene({ isCelebration = false, sceneProgress = 0 }) {
  const containerRef = useRef(null);
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const sceneProgressRef = useRef(sceneProgress);

  // Keep sceneProgress updated in ref for continuous render loop without re-instantiating scene
  useEffect(() => {
    sceneProgressRef.current = sceneProgress;
  }, [sceneProgress]);

  const sceneObjectsRef = useRef({
    hearts: [],
    celebrationParticles: [],
    pointLight1: null,
    pointLight2: null,
    camera: null,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    isCelebrationActive: false,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    let scene, camera, renderer;
    let heartGeo, celebGeo;
    let heartMaterials = [];

    const getAdaptiveDpr = (w) => {
      const maxDpr = w >= 1024 ? 1.25 : 1.5;
      return Math.min(window.devicePixelRatio || 1, maxDpr);
    };

    try {
      // 1. Scene & Camera setup
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0xfdf2f4, 0.025);

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 16);
      sceneObjectsRef.current.camera = camera;

      // 2. Guarded WebGL Renderer with adaptive DPR
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(getAdaptiveDpr(width));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not available or initialization failed; using CSS romantic background fallback', e);
      setWebGLAvailable(false);
      return;
    }

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5f8, 1.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xf472b6, 3.5, 35);
    pointLight1.position.set(5, 5, 8);
    scene.add(pointLight1);
    sceneObjectsRef.current.pointLight1 = pointLight1;

    const pointLight2 = new THREE.PointLight(0xc084fc, 2.5, 35);
    pointLight2.position.set(-6, -4, 6);
    scene.add(pointLight2);
    sceneObjectsRef.current.pointLight2 = pointLight2;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    // 4. Create Floating Love Bubble Hearts (optimized material & count)
    heartGeo = createHeartGeometry(0.8);
    const colors = [
      0xf472b6, // Soft pink
      0xec4899, // Vibrant pink
      0xdb2777, // Deep rose
      0xc084fc, // Lavender
      0xe879f9, // Soft magenta
      0xffb6c1, // Light pink
      0xfce7f3, // Ivory rose
    ];

    heartMaterials = colors.map(
      (c) =>
        new THREE.MeshStandardMaterial({
          color: c,
          roughness: 0.2,
          metalness: 0.1,
          transparent: true,
          opacity: 0.82,
          depthWrite: false,
        }),
    );

    const heartCount = window.innerWidth < 768 ? 16 : 24;
    const hearts = [];

    for (let i = 0; i < heartCount; i++) {
      const mat = heartMaterials[Math.floor(Math.random() * heartMaterials.length)];
      const mesh = new THREE.Mesh(heartGeo, mat);

      const isForeground = i % 5 === 0;
      const isBackground = i % 2 === 0;

      const z = isForeground
        ? THREE.MathUtils.randFloat(4, 10)
        : isBackground
          ? THREE.MathUtils.randFloat(-15, -4)
          : THREE.MathUtils.randFloat(-3, 3);

      const xRange = isForeground ? 12 : 20;
      const yRange = 18;

      mesh.position.set(
        THREE.MathUtils.randFloatSpread(xRange),
        THREE.MathUtils.randFloatSpread(yRange),
        z,
      );

      const baseScale = isForeground ? THREE.MathUtils.randFloat(0.4, 0.8) : THREE.MathUtils.randFloat(0.5, 1.2);
      mesh.scale.set(baseScale, baseScale, baseScale);

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );

      mesh.userData = {
        baseScale,
        baseX: mesh.position.x,
        baseY: mesh.position.y,
        baseZ: mesh.position.z,
        speedY: THREE.MathUtils.randFloat(0.008, 0.022),
        speedRotX: THREE.MathUtils.randFloat(-0.012, 0.012),
        speedRotY: THREE.MathUtils.randFloat(-0.015, 0.015),
        wobbleSpeed: THREE.MathUtils.randFloat(0.8, 2.0),
        wobbleAmp: THREE.MathUtils.randFloat(0.3, 0.8),
        phase: Math.random() * Math.PI * 2,
        isForeground,
      };

      scene.add(mesh);
      hearts.push(mesh);
    }
    sceneObjectsRef.current.hearts = hearts;

    // 5. Celebration particle system (initialized on standby)
    const celebCount = 40;
    const celebParticles = [];
    celebGeo = createHeartGeometry(0.4);

    for (let i = 0; i < celebCount; i++) {
      const mat = heartMaterials[Math.floor(Math.random() * heartMaterials.length)].clone();
      mat.opacity = 0;
      const mesh = new THREE.Mesh(celebGeo, mat);
      mesh.position.set(0, 0, 0);
      mesh.scale.set(0, 0, 0);
      mesh.visible = false;
      scene.add(mesh);

      celebParticles.push({
        mesh,
        active: false,
        velX: 0,
        velY: 0,
        velZ: 0,
        rotSpeedX: 0,
        rotSpeedY: 0,
        life: 0,
        maxLife: 1,
      });
    }
    sceneObjectsRef.current.celebrationParticles = celebParticles;

    // 6. Pointer & Parallax tracking
    const handlePointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : width / 2);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : height / 2);

      sceneObjectsRef.current.mouse.targetX = (clientX / width - 0.5) * 2;
      sceneObjectsRef.current.mouse.targetY = -(clientY / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // 7. Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(getAdaptiveDpr(w));
    };

    window.addEventListener('resize', handleResize);

    // 8. Document visibility tracking to pause rendering when hidden
    let isDocumentHidden = document.hidden;
    const handleVisibilityChange = () => {
      isDocumentHidden = document.hidden;
      if (!isDocumentHidden) {
        clock.getDelta(); // reset delta to prevent time jump
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 9. Main Render Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isDocumentHidden) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera mouse parallax + scroll depth influence
      const mouse = sceneObjectsRef.current.mouse;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const currentScroll = sceneProgressRef.current || 0;
      // Dolly camera smoothly forward with scroll progression
      const baseCameraZ = 16 - currentScroll * 2.5;

      camera.position.x = mouse.x * 1.5;
      camera.position.y = mouse.y * 1.2 - currentScroll * 1.5;
      camera.position.z += (baseCameraZ - camera.position.z) * 0.08;
      camera.lookAt(0, -currentScroll * 1.0, 0);

      // Light oscillation
      if (pointLight1) {
        pointLight1.position.x = 5 + Math.sin(elapsedTime * 0.8) * 2;
        pointLight1.position.y = 5 + Math.cos(elapsedTime * 0.7) * 2;
      }
      if (pointLight2) {
        pointLight2.position.x = -6 + Math.cos(elapsedTime * 0.6) * 2;
        pointLight2.position.y = -4 + Math.sin(elapsedTime * 0.5) * 2;
      }

      // Animate background floating love bubble hearts
      hearts.forEach((heart) => {
        const u = heart.userData;

        // Gentle bubble floating upward
        heart.position.y += u.speedY * 60 * delta;
        if (heart.position.y > 12) {
          heart.position.y = -12;
          heart.position.x = THREE.MathUtils.randFloatSpread(u.isForeground ? 12 : 20);
        }

        // Wobble like underwater love bubble
        heart.position.x = u.baseX + Math.sin(elapsedTime * u.wobbleSpeed + u.phase) * u.wobbleAmp;

        // Soft rotation
        heart.rotation.x += u.speedRotX;
        heart.rotation.y += u.speedRotY;
        heart.rotation.z += Math.sin(elapsedTime * 0.5 + u.phase) * 0.005;
      });

      // Animate celebration burst particles
      if (sceneObjectsRef.current.isCelebrationActive) {
        let anyActive = false;
        celebParticles.forEach((p) => {
          if (p.active) {
            anyActive = true;
            p.mesh.position.x += p.velX * delta * 60;
            p.mesh.position.y += p.velY * delta * 60;
            p.mesh.position.z += p.velZ * delta * 60;

            // Gravity effect
            p.velY -= 0.008 * delta * 60;

            p.mesh.rotation.x += p.rotSpeedX;
            p.mesh.rotation.y += p.rotSpeedY;

            p.life += delta;
            const progress = p.life / p.maxLife;

            if (progress >= 1) {
              p.active = false;
              p.mesh.visible = false;
            } else {
              const scale = progress < 0.2 ? (progress / 0.2) * 1.5 : (1 - progress) * 1.5;
              p.mesh.scale.set(scale, scale, scale);
              p.mesh.material.opacity = Math.max(0, 1 - progress);
            }
          }
        });

        if (!anyActive) {
          sceneObjectsRef.current.isCelebrationActive = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      if (heartGeo) heartGeo.dispose();
      if (celebGeo) celebGeo.dispose();
      celebParticles.forEach(({ mesh }) => mesh.material.dispose());
      heartMaterials.forEach((m) => m.dispose());
      if (renderer) renderer.dispose();
    };
  }, []);

  // Trigger celebration explosion when isCelebration is true
  useEffect(() => {
    if (isCelebration && sceneObjectsRef.current.celebrationParticles) {
      sceneObjectsRef.current.isCelebrationActive = true;
      const particles = sceneObjectsRef.current.celebrationParticles;
      const camera = sceneObjectsRef.current.camera;

      // Pulse lights
      if (sceneObjectsRef.current.pointLight1) {
        sceneObjectsRef.current.pointLight1.intensity = 8.0;
        setTimeout(() => {
          if (sceneObjectsRef.current.pointLight1) sceneObjectsRef.current.pointLight1.intensity = 3.5;
        }, 1200);
      }

      // Camera dolly-in & impact
      if (camera) {
        camera.position.z = 13.5;
        setTimeout(() => {
          if (camera) camera.position.z = 16;
        }, 800);
      }

      // Burst particles radially from center
      particles.forEach((p, idx) => {
        p.mesh.visible = true;
        p.active = true;
        p.life = 0;
        p.maxLife = THREE.MathUtils.randFloat(1.8, 3.2);

        p.mesh.position.set(
          THREE.MathUtils.randFloatSpread(1.2),
          THREE.MathUtils.randFloatSpread(1.0),
          THREE.MathUtils.randFloat(-1, 3)
        );

        const angle = (idx / particles.length) * Math.PI * 2 + Math.random() * 0.5;
        const speed = THREE.MathUtils.randFloat(0.12, 0.35);
        p.velX = Math.cos(angle) * speed;
        p.velY = Math.sin(angle) * speed + THREE.MathUtils.randFloat(0.08, 0.2);
        p.velZ = THREE.MathUtils.randFloat(-0.1, 0.3);

        p.rotSpeedX = THREE.MathUtils.randFloat(-0.08, 0.08);
        p.rotSpeedY = THREE.MathUtils.randFloat(-0.08, 0.08);
      });
    }
  }, [isCelebration]);

  // If WebGL failed to initialize, render CSS floating hearts fallback
  if (!webGLAvailable) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-romantic-50 via-romantic-100/60 to-lavender-100/70" aria-hidden="true">
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-pink-300/30 blur-2xl animate-floatSlow" />
        <div className="absolute top-1/3 right-12 w-36 h-36 rounded-full bg-purple-300/25 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-1/4 w-44 h-44 rounded-full bg-rose-300/30 blur-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}

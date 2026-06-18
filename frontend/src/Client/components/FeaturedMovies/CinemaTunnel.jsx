import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from './FeaturedMovies.module.css';

const CinemaTunnel = ({ onComplete }) => {
  const mountRef = useRef(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0518, 0.04);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 5); // Start closer

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Lighting 
    const ambientLight = new THREE.AmbientLight(0x1a0d30, 0.7);
    scene.add(ambientLight);

    const centerLight = new THREE.PointLight(0xa855f7, 2, 20);
    centerLight.position.set(0, 0, -10);
    scene.add(centerLight);

    // Procedural Textures
    // Concrete/Metal texture for walls/beams
    const createWallTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Base dark grey
      ctx.fillStyle = '#1e1e24';
      ctx.fillRect(0, 0, 256, 256);

      // Noise
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const val = Math.random() * 12;
        ctx.fillStyle = `rgba(${val}, ${val}, ${val}, 0.15)`;
        ctx.fillRect(x, y, 2, 2);
      }

      return new THREE.CanvasTexture(canvas);
    };

    const createBumpTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 3500; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const val = Math.floor(Math.random() * 70) + 90; // grey noise range
        ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        ctx.fillRect(x, y, 1, 1);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(16, 16);
      return tex;
    };

    // Neon portal gradients
    const createVerticalGradientTexture = (color1, color2) => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 256, 0, 0); // bottom to top
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 256);
      return new THREE.CanvasTexture(canvas);
    };

    const createHorizontalGradientTexture = (color1, color2) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 256, 0); // left to right
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 16);
      return new THREE.CanvasTexture(canvas);
    };

    const createRadialGradientTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(128, 128, 15, 128, 128, 120);
      grad.addColorStop(0, 'rgba(224, 36, 137, 0.95)'); // Pink glowing center
      grad.addColorStop(0.4, 'rgba(168, 85, 247, 0.6)'); // Purple transition
      grad.addColorStop(1, 'rgba(5, 2, 12, 0.95)'); // Dark background edges
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(canvas);
    };

    const wallTex = createWallTexture();
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(2, 4);

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.7,
      metalness: 0.8,
      color: 0x2d2d35,
    });

    // Dedicated Floor material for grey metallic concrete look with specular reflections
    const bumpTex = createBumpTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x7a7a82, // Grey concrete base color
      roughness: 0.35, // Low roughness for sharp light specular highlights
      metalness: 0.82, // Metallic shine
      bumpMap: bumpTex,
      bumpScale: 0.08,
    });

    // 1. Floor & Ceiling
    const floorGeo = new THREE.PlaneGeometry(16, 50);
    const floor = new THREE.Mesh(floorGeo, floorMat); // Uses floorMat
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.5;
    floor.position.z = -20;
    scene.add(floor);

    const ceilingGeo = new THREE.PlaneGeometry(16, 50);
    const ceiling = new THREE.Mesh(ceilingGeo, wallMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3.5;
    ceiling.position.z = -20;
    scene.add(ceiling);

    // 2. Beams
    const beamCount = 6;
    const beamSpacing = 5;
    const beams = [];

    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x111115,
      roughness: 0.5,
      metalness: 0.9,
    });

    for (let i = 0; i < beamCount; i++) {
      const zPos = -i * beamSpacing;

      // Left Pillar (vertical part)
      const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7, 0.8), beamMat);
      leftPillar.position.set(-6.5, 0, zPos);
      scene.add(leftPillar);
      beams.push(leftPillar);

      // Right Pillar
      const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7, 0.8), beamMat);
      rightPillar.position.set(6.5, 0, zPos);
      scene.add(rightPillar);
      beams.push(rightPillar);

      // Angled supports
      const leftSupport = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5, 0.6), beamMat);
      leftSupport.position.set(-4.5, 1.8, zPos);
      leftSupport.rotation.z = -Math.PI / 4;
      scene.add(leftSupport);
      beams.push(leftSupport);

      const rightSupport = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5, 0.6), beamMat);
      rightSupport.position.set(4.5, 1.8, zPos);
      rightSupport.rotation.z = Math.PI / 4;
      scene.add(rightSupport);
      beams.push(rightSupport);
    }

    // 3. Neon Red laser tubes
    const neonMat = new THREE.MeshBasicMaterial({ color: 0xff3344 });
    const laserCount = 5;
    const lasers = [];

    for (let i = 0; i < laserCount; i++) {
      const zPos = -i * 6 - 2;

      // Left laser tubes
      for (let j = 0; j < 3; j++) {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 7), neonMat);
        tube.position.set(-5.5 + j * 0.4, -2.2 + j * 0.4, zPos);
        tube.rotation.set(0, 0, -Math.PI / 6);
        scene.add(tube);
        lasers.push(tube);
      }

      // Right laser tubes
      for (let j = 0; j < 3; j++) {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 7), neonMat);
        tube.position.set(5.5 - j * 0.4, -2.2 + j * 0.4, zPos);
        tube.rotation.set(0, 0, Math.PI / 6);
        scene.add(tube);
        lasers.push(tube);
      }
    }

    // 4. White ceiling lights
    const whiteNeonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < beamCount; i++) {
      const zPos = -i * beamSpacing;

      const lightLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3.5), whiteNeonMat);
      lightLeft.position.set(-3.5, 3.4, zPos + 1.75);
      scene.add(lightLeft);

      const lightRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3.5), whiteNeonMat);
      lightRight.position.set(3.5, 3.4, zPos + 1.75);
      scene.add(lightRight);
    }

    // 5. Central Glowing Gradient Portal Frame at the end
    const portalZ = -40;
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, portalZ);

    // Create linear gradients matching top-left (purple) to bottom-right (pink) flow
    const vGradTex = createVerticalGradientTexture('#e02489', '#a855f7');
    const hGradTex = createHorizontalGradientTexture('#a855f7', '#e02489');

    const vPortalMat = new THREE.MeshBasicMaterial({ map: vGradTex });
    const hPortalMat = new THREE.MeshBasicMaterial({ map: hGradTex });

    // Left vertical bar (Purple at top, Pink at bottom)
    const pLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, 5.5, 0.15), vPortalMat);
    pLeft.position.set(-2.2, 0.2, 0);
    portalGroup.add(pLeft);

    // Right vertical bar (Purple at top, Pink at bottom)
    const pRight = new THREE.Mesh(new THREE.BoxGeometry(0.15, 5.5, 0.15), vPortalMat);
    pRight.position.set(2.2, 0.2, 0);
    portalGroup.add(pRight);

    // Top horizontal bar (Purple on left, Pink on right)
    const pTop = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.15, 0.15), hPortalMat);
    pTop.position.set(0, 2.95, 0);
    portalGroup.add(pTop);

    // Inner glowing plane with a mysterious dark purple/pink radial aura
    const portalInnerTex = createRadialGradientTexture();
    const portalInnerMat = new THREE.MeshBasicMaterial({
      map: portalInnerTex,
      transparent: true,
      opacity: 0.95,
    });
    const portalInner = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.3), portalInnerMat);
    portalInner.position.set(0, 0.2, -0.05);
    portalGroup.add(portalInner);

    scene.add(portalGroup);

    // Animation Loop
    let speed = 0.8; // Significantly faster initial speed (jump-start)
    let finished = false;
    let rafId;

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      // Move camera forward through the tunnel
      camera.position.z -= speed;

      // Subtle camera bobbing
      camera.position.y = Math.sin(camera.position.z * 0.2) * 0.08;
      camera.position.x = Math.cos(camera.position.z * 0.1) * 0.05;

      // When approaching the portal
      if (camera.position.z <= portalZ + 4 && !finished) {
        // Accelerate into portal
        speed = 0.99;
      }

      // Enter the portal void
      if (camera.position.z <= portalZ + 1 && !finished) {
        finished = true;
        setFading(true);
        setTimeout(() => {
          onComplete();
        }, 380); // Fast fade out transition
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onComplete]);

  return (
    <div className={`${styles.tunnelContainer} ${fading ? styles.tunnelFading : ''}`}>
      <div ref={mountRef} className={styles.tunnelCanvas} />

      {/* Portal white-out overlay flash */}
      <div className={`${styles.portalFlash} ${fading ? styles.portalFlashActive : ''}`} />
    </div>
  );
};

export default CinemaTunnel;

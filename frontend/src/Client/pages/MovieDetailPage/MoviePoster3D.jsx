import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MoviePoster3D = ({ posterUrl, title }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 400;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    // Renderer with alpha/transparency for page gradient to shine through
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    // Subtle ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    // Main spotlight from top-front shining down onto the poster
    const projectorLight = new THREE.SpotLight(0xfff8ee, 6.0, 15, Math.PI / 5, 0.6, 1);
    projectorLight.position.set(0, 5.5, 3.5);
    projectorLight.target.position.set(0, 0, 0);
    scene.add(projectorLight);
    scene.add(projectorLight.target);

    // Volumetric Projector Beam representation (Semi-transparent cone)
    const beamGeo = new THREE.CylinderGeometry(0.1, 2.8, 7, 32, 1, true);
    beamGeo.translate(0, -3.5, 0); // shift pivot to top apex
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfff3e3,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.set(0, 5.5, 3.5);
    beamMesh.lookAt(new THREE.Vector3(0, 0, 0));
    beamMesh.rotateX(Math.PI / 2); // align cylinder orientation to lookAt target
    scene.add(beamMesh);

    // --- Floating Light Dust Particles ---
    const particleCount = 35;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];

    for (let i = 0; i < particleCount; i++) {
      // Scatter positions within the light cone volume
      positions[i * 3] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;

      particleSpeeds.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() + 0.15) * 0.007, // float slowly upwards
        z: (Math.random() - 0.5) * 0.003,
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle texture (soft glowing circle)
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 253, 245, 1)');
    grad.addColorStop(1, 'rgba(255, 253, 245, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 16, 16);

    const pTexture = new THREE.CanvasTexture(pCanvas);
    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Poster Mesh ---
    const posterGeo = new THREE.PlaneGeometry(3.0, 4.3);
    let posterMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const posterMesh = new THREE.Mesh(posterGeo, posterMat);
    posterMesh.rotation.set(-0.06, 0.08, 0); // default slight tilt
    scene.add(posterMesh);

    // Load poster image texture through local proxy if it is external
    let finalUrl = posterUrl;
    if (posterUrl && posterUrl.startsWith('http')) {
      finalUrl = `/image-proxy/${encodeURIComponent(posterUrl)}`;
    }

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    textureLoader.load(
      finalUrl,
      (texture) => {
        posterMesh.material.map = texture;
        posterMesh.material.color.setHex(0xffffff);
        posterMesh.material.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn('Failed to load movie poster texture in WebGL:', err);
      }
    );

    // --- Hover / mousemove logic ---
    let targetX = 0.08;
    let targetY = -0.06;
    let currentX = 0.08;
    let currentY = -0.06;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) - 0.5;
      const mouseY = ((e.clientY - rect.top) / rect.height) - 0.5;

      targetX = mouseX * 0.4;  // Tilt amount limits
      targetY = -mouseY * 0.4;
    };

    const handleMouseLeave = () => {
      targetX = 0.08; // Reset back to default tilt
      targetY = -0.06;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // --- Animation loop ---
    let rafId;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Lerp calculations for smooth movement
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // Apply tilt + subtle breathing float effect
      posterMesh.rotation.y = currentX + Math.sin(time * 1.5) * 0.015;
      posterMesh.rotation.x = currentY + Math.cos(time * 1.2) * 0.01;

      // Drift floating light particles
      const posArray = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += particleSpeeds[i].x;
        posArray[i * 3 + 1] += particleSpeeds[i].y;
        posArray[i * 3 + 2] += particleSpeeds[i].z;

        // Wrap around when rising too high
        if (posArray[i * 3 + 1] > 3.8) {
          posArray[i * 3 + 1] = -3.8;
          posArray[i * 3] = (Math.random() - 0.5) * 5;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize handler ---
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [posterUrl]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '400px',
        position: 'relative',
        background: 'transparent',
        overflow: 'visible',
      }}
    />
  );
};

export default MoviePoster3D;

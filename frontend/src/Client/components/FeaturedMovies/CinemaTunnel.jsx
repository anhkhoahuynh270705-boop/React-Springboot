import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import styles from './FeaturedMovies.module.css';

const CinemaTunnel = ({ onComplete }) => {
  const mountRef = useRef(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene Setup with dark purple fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05020a, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 5); // Start closer

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Procedural Textures & Normal Map Generators
    const createConcreteNormalMap = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgb(128, 128, 255)';
      ctx.fillRect(0, 0, 256, 256);

      const imgData = ctx.getImageData(0, 0, 256, 256);
      const data = imgData.data;

      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          const noiseX = (Math.random() - 0.5) * 24;
          const noiseY = (Math.random() - 0.5) * 24;
          const nz = 255 - Math.abs(noiseX) - Math.abs(noiseY);

          const idx = (y * 256 + x) * 4;
          data[idx] = Math.min(255, Math.max(0, 128 + noiseX));
          data[idx + 1] = Math.min(255, Math.max(0, 128 + noiseY));
          data[idx + 2] = Math.min(255, Math.max(nz, 0));
        }
      }
      ctx.putImageData(imgData, 0, 0);

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 8);
      return tex;
    };

    const createWallTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Base dark grey concrete
      ctx.fillStyle = '#18181c';
      ctx.fillRect(0, 0, 256, 256);

      // Noise and imperfections
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const val = Math.random() * 18;
        ctx.fillStyle = `rgba(${val}, ${val}, ${val}, 0.2)`;
        ctx.fillRect(x, y, 2, 2);
      }

      return new THREE.CanvasTexture(canvas);
    };

    const createTunnelEnvMap = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Deep dark indigo background
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#020005');
      grad.addColorStop(0.5, '#05020c');
      grad.addColorStop(1, '#020003');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Magenta glow spot
      let rad = ctx.createRadialGradient(120, 128, 5, 120, 128, 120);
      rad.addColorStop(0, 'rgba(224, 36, 137, 0.45)');
      rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, 512, 256);

      // Purple glow spot
      rad = ctx.createRadialGradient(380, 128, 5, 380, 128, 140);
      rad.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
      rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, 512, 256);

      // Neon accent reflections
      ctx.fillStyle = 'rgba(255, 51, 68, 0.35)';
      ctx.filter = 'blur(12px)';
      ctx.fillRect(60, 40, 140, 24);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.fillRect(320, 180, 140, 24);
      ctx.filter = 'none';

      const tex = new THREE.CanvasTexture(canvas);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // Environment Map
    const envMap = createTunnelEnvMap();
    scene.environment = envMap;

    // Normal Map for bumpy surfaces
    const wallNormalMap = createConcreteNormalMap();

    // Wall Material
    const wallTex = createWallTexture();
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(2, 4);

    const wallMat = new THREE.MeshPhysicalMaterial({
      map: wallTex,
      normalMap: wallNormalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.65,
      metalness: 0.75,
      color: 0x22222a,
      envMapIntensity: 1.2,
    });

    // Floor Material (Brushed concrete/steel with clearcoat)
    const floorMat = new THREE.MeshPhysicalMaterial({
      color: 0x484852,
      normalMap: wallNormalMap,
      normalScale: new THREE.Vector2(0.3, 0.3),
      roughness: 0.28,
      metalness: 0.88,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.5,
    });

    // 1. Floor & Ceiling (set to receive/cast shadows)
    const floorGeo = new THREE.PlaneGeometry(16, 50);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.5;
    floor.position.z = -20;
    floor.receiveShadow = true;
    scene.add(floor);

    const ceilingGeo = new THREE.PlaneGeometry(16, 50);
    const ceiling = new THREE.Mesh(ceilingGeo, wallMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3.5;
    ceiling.position.z = -20;
    ceiling.receiveShadow = true;
    scene.add(ceiling);

    // 2. Beams / Pillars (PBR Metal clearcoat)
    const beamCount = 6;
    const beamSpacing = 5;
    const beams = [];

    const beamMat = new THREE.MeshPhysicalMaterial({
      color: 0x111115,
      roughness: 0.3,
      metalness: 0.95,
      clearcoat: 0.7,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.4,
    });

    for (let i = 0; i < beamCount; i++) {
      const zPos = -i * beamSpacing;

      // Left Pillar
      const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7, 0.8), beamMat);
      leftPillar.position.set(-6.5, 0, zPos);
      leftPillar.castShadow = true;
      leftPillar.receiveShadow = true;
      scene.add(leftPillar);
      beams.push(leftPillar);

      // Right Pillar
      const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7, 0.8), beamMat);
      rightPillar.position.set(6.5, 0, zPos);
      rightPillar.castShadow = true;
      rightPillar.receiveShadow = true;
      scene.add(rightPillar);
      beams.push(rightPillar);

      // Angled supports
      const leftSupport = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5, 0.6), beamMat);
      leftSupport.position.set(-4.5, 1.8, zPos);
      leftSupport.rotation.z = -Math.PI / 4;
      leftSupport.castShadow = true;
      leftSupport.receiveShadow = true;
      scene.add(leftSupport);
      beams.push(leftSupport);

      const rightSupport = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5, 0.6), beamMat);
      rightSupport.position.set(4.5, 1.8, zPos);
      rightSupport.rotation.z = Math.PI / 4;
      rightSupport.castShadow = true;
      rightSupport.receiveShadow = true;
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

    const createVerticalGradientTexture = (color1, color2) => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 256, 0, 0);
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
      const grad = ctx.createLinearGradient(0, 0, 256, 0);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 16);
      return new THREE.CanvasTexture(canvas);
    };

    const vGradTex = createVerticalGradientTexture('#e02489', '#a855f7');
    const hGradTex = createHorizontalGradientTexture('#a855f7', '#e02489');

    const vPortalMat = new THREE.MeshBasicMaterial({ map: vGradTex });
    const hPortalMat = new THREE.MeshBasicMaterial({ map: hGradTex });

    const pLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, 5.5, 0.15), vPortalMat);
    pLeft.position.set(-2.2, 0.2, 0);
    portalGroup.add(pLeft);

    const pRight = new THREE.Mesh(new THREE.BoxGeometry(0.15, 5.5, 0.15), vPortalMat);
    pRight.position.set(2.2, 0.2, 0);
    portalGroup.add(pRight);

    const pTop = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.15, 0.15), hPortalMat);
    pTop.position.set(0, 2.95, 0);
    portalGroup.add(pTop);

    // Dynamic Swirling Sci-Fi Portal Vortex Shader
    const portalInnerMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uColorStart: { value: new THREE.Color(0xa855f7) }, // Purple
        uColorEnd: { value: new THREE.Color(0xe02489) },   // Pink
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorStart;
        uniform vec3 uColorEnd;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv - 0.5;
          float dist = length(uv);
          
          // Swirling angle based on distance and time
          float angle = atan(uv.y, uv.x) + dist * 12.0 - uTime * 3.0;
          
          // Create spiral arms pattern
          float spiral = sin(angle * 4.0) * 0.5 + 0.5;
          
          // Smooth edge fade
          float alpha = smoothstep(0.5, 0.15, dist);
          
          // Pulse effect
          float pulse = sin(uTime * 5.0 - dist * 10.0) * 0.15 + 0.85;
          
          // Color interpolation
          vec3 color = mix(uColorStart, uColorEnd, sin(dist * 6.0 - uTime * 2.0) * 0.5 + 0.5);
          color += spiral * 0.45 * vec3(1.0, 0.8, 0.95);
          color *= pulse;
          
          gl_FragColor = vec4(color, alpha * 0.95);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const portalInner = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.3), portalInnerMat);
    portalInner.position.set(0, 0.2, -0.05);
    portalGroup.add(portalInner);

    // Concentric Spinning Neon Warp Rings
    const ringGeo1 = new THREE.RingGeometry(2.1, 2.18, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xff3366,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.position.z = 0.05;
    portalGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(2.3, 2.36, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.position.z = 0.08;
    portalGroup.add(ring2);

    // Cinematic Volumetric Light Beam/Cone shooting towards camera
    const beamGeo = new THREE.CylinderGeometry(0.1, 6.5, 35, 32, 1, true);
    beamGeo.translate(0, -17.5, 0); // shift pivot to portal mouth
    const portalBeamMat = new THREE.MeshBasicMaterial({
      color: 0xe02489,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const portalBeam = new THREE.Mesh(beamGeo, portalBeamMat);
    portalBeam.position.set(0, 0.2, 0);
    portalBeam.rotation.x = Math.PI / 2; // align along Z-axis pointing forward
    portalGroup.add(portalBeam);

    // Spiraling Particle Energy Vortex
    const portalParticleCount = 100;
    const portalParticlesGeo = new THREE.BufferGeometry();
    const portalPArray = new Float32Array(portalParticleCount * 3);
    const portalPSpeeds = [];
    for (let i = 0; i < portalParticleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * 2.5;
      portalPArray[i * 3] = Math.cos(angle) * r;
      portalPArray[i * 3 + 1] = Math.sin(angle) * r;
      portalPArray[i * 3 + 2] = (Math.random() - 0.5) * 5; // Z depth spread
      portalPSpeeds.push({
        angle: angle,
        radius: r,
        speed: 0.015 + Math.random() * 0.02,
        depthSpeed: -0.02 - Math.random() * 0.02,
      });
    }
    portalParticlesGeo.setAttribute('position', new THREE.BufferAttribute(portalPArray, 3));
    const portalPMat = new THREE.PointsMaterial({
      color: 0xff80ff,
      size: 0.07,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const portalParticles = new THREE.Points(portalParticlesGeo, portalPMat);
    portalGroup.add(portalParticles);

    scene.add(portalGroup);

    // Advanced Lighting & Shadow Map casting (Headlight attached to camera)
    const ambientLight = new THREE.AmbientLight(0x0e051a, 0.6);
    scene.add(ambientLight);

    const headlight = new THREE.SpotLight(0xa855f7, 30, 40, Math.PI / 3.5, 0.5, 0.95);
    headlight.castShadow = true;
    headlight.shadow.mapSize.width = 1024;
    headlight.shadow.mapSize.height = 1024;
    headlight.shadow.bias = -0.0006;
    headlight.shadow.radius = 4;
    scene.add(headlight);

    // Dynamic flashing light from neon portal
    const portalGlowLight = new THREE.PointLight(0xe02489, 4, 18);
    portalGlowLight.position.set(0, 0.2, portalZ + 2);
    scene.add(portalGlowLight);

    // Post-Processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Bloom Pass for neon lights glow
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.85, 0.5, 0.78);
    composer.addPass(bloomPass);

    // Vignette & Film grain shader pass
    const CinematicShader = {
      uniforms: {
        tDiffuse: { value: null },
        uVignette: { value: 1.2 },
        uGrain: { value: 0.05 },
        uTime: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uVignette;
        uniform float uGrain;
        uniform float uTime;
        varying vec2 vUv;

        float random(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          
          // Vignette
          vec2 uv = vUv - 0.5;
          float dist = length(uv);
          float vignette = smoothstep(0.85, 0.45 - uVignette * 0.16, dist);
          color.rgb *= mix(1.0, vignette, 0.65);

          // Film grain
          float grain = (random(vUv + vec2(uTime * 0.15, uTime * 0.25)) - 0.5) * uGrain;
          color.rgb += grain;

          gl_FragColor = color;
        }
      `
    };
    const cinematicPass = new ShaderPass(CinematicShader);
    composer.addPass(cinematicPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Animation Loop
    let speed = 1.5; // Significantly faster initial speed
    let finished = false;
    let rafId;

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      // Move camera forward through the tunnel
      camera.position.z -= speed;

      // Update headlight position with camera
      headlight.position.copy(camera.position);
      headlight.position.y += 0.5; // slight height offset

      // Subtle camera bobbing
      camera.position.y = Math.sin(camera.position.z * 0.2) * 0.08;
      camera.position.x = Math.cos(camera.position.z * 0.1) * 0.05;

      // Animate neon portal light pulsating
      portalGlowLight.intensity = 4.0 + Math.sin(performance.now() * 0.015) * 1.5;

      // Rotate portal warp rings
      ring1.rotation.z += 0.012;
      ring2.rotation.z -= 0.018;

      // Update shader time for swirling vortex
      portalInnerMat.uniforms.uTime.value = performance.now() * 0.001;

      // Animate portal energy particles spiraling in
      const pArray = portalParticles.geometry.attributes.position.array;
      for (let i = 0; i < portalParticleCount; i++) {
        const s = portalPSpeeds[i];
        s.angle += s.speed;
        s.radius -= 0.005; // spiral inwards
        if (s.radius < 0.1) {
          s.radius = 2.0 + Math.random() * 1.0; // reset to outer boundary
        }
        pArray[i * 3] = Math.cos(s.angle) * s.radius;
        pArray[i * 3 + 1] = Math.sin(s.angle) * s.radius;
        pArray[i * 3 + 2] += s.depthSpeed;
        if (pArray[i * 3 + 2] < -3) {
          pArray[i * 3 + 2] = 3;
        }
      }
      portalParticles.geometry.attributes.position.needsUpdate = true;

      // When approaching the portal
      if (camera.position.z <= portalZ + 4 && !finished) {
        // Accelerate into portal
        speed = 2.0;
      }

      // Enter the portal void
      if (camera.position.z <= portalZ + 1 && !finished) {
        finished = true;
        setFading(true);
        setTimeout(() => {
          onComplete();
        }, 380); // Fast fade out transition
      }

      cinematicPass.uniforms.uTime.value = performance.now() * 0.001;
      composer.render();
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      composer.dispose();
      envMap.dispose();
      wallNormalMap.dispose();
      wallTex.dispose();
      vGradTex.dispose();
      hGradTex.dispose();
      portalInnerMat.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      beamMat.dispose();
      portalBeamMat.dispose();
      portalPMat.dispose();
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

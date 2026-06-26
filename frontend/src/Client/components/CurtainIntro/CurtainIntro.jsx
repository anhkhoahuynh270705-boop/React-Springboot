import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './CurtainIntro.css';

/* Physical Parameters */
const CW = 4.8;
const CH = 3.6;

/* Procedural Texture Generators */
const createFabricColorTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep velvet red gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#5f0f12');
  grad.addColorStop(0.4, '#b21f24');
  grad.addColorStop(0.6, '#96151a');
  grad.addColorStop(1, '#3a0205');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Micro-weave pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  for (let y = 0; y < 512; y += 4) {
    ctx.fillRect(0, y, 512, 1.5);
  }
  for (let x = 0; x < 512; x += 4) {
    ctx.fillRect(x, 0, 1.5, 512);
  }

  // Brocade ornamental gold borders (bottom edge)
  ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
  for (let x = 0; x < 512; x += 16) {
    ctx.fillRect(x + 2, 480, 12, 6);
    ctx.fillRect(x + 4, 490, 8, 4);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

const createFabricNormalMap = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;

  // Weave bumpiness mapping
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const idx = (y * 256 + x) * 4;
      const nx = Math.sin(x * 1.5) * 12;
      const ny = Math.sin(y * 1.5) * 12;
      data[idx] = 128 + nx;
      data[idx + 1] = 128 + ny;
      data[idx + 2] = 255 - Math.abs(nx) - Math.abs(ny);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  return tex;
};

const createStageWoodTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Mahogany wood base color
  ctx.fillStyle = '#2a180e';
  ctx.fillRect(0, 0, 512, 512);

  // Wood planks lines
  ctx.strokeStyle = '#140b06';
  ctx.lineWidth = 3;
  for (let x = 0; x < 512; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Wood grain noise (vertical lines/stripes)
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = `rgba(12, 6, 3, ${Math.random() * 0.18})`;
    ctx.fillRect(x, y, 1 + Math.random() * 3, 35 + Math.random() * 110);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

const createHDRILikeEnvMap = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Dark studio ambient gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#040407');
  grad.addColorStop(0.5, '#0b0a11');
  grad.addColorStop(1, '#020204');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Soft warm studio panels
  let rad = ctx.createRadialGradient(160, 100, 5, 160, 100, 150);
  rad.addColorStop(0, 'rgba(255, 230, 200, 0.45)');
  rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, 512, 256);

  // Soft cool fill spot
  rad = ctx.createRadialGradient(360, 160, 5, 360, 160, 150);
  rad.addColorStop(0, 'rgba(100, 200, 255, 0.35)');
  rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, 512, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/* Curtain Mesh Generator with realistic wave folding */
const buildCurtainGeo = (isRight) => {
  const wSegments = 120; // High resolution for smooth folds
  const hSegments = 20;  // More vertical detail
  const geo = new THREE.PlaneGeometry(CW, CH, wSegments, hSegments);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    // High frequency pleats (approx 11 folds across the width)
    const waveFreq = (x / CW) * Math.PI * 22;
    const waveFactor = Math.sin(waveFreq);
    
    // Folds are slightly shallower at the top rod and deeper at the bottom
    const normalizedY = (y + CH / 2) / CH; // 0 at bottom, 1 at top
    const foldDepth = 0.22;
    const foldIntensity = 0.45 + 0.55 * (1.0 - normalizedY);

    const waveZ = waveFactor * foldDepth * foldIntensity;
    pos.setZ(i, waveZ);

    // Gather/pinch X coordinates where the fabric folds inwards (accordion gathering effect)
    const gatherX = Math.cos(waveFreq) * 0.08 * foldIntensity;
    pos.setX(i, x + gatherX);

    // Wavy scalloped hemline at the bottom edge
    const scallopedHem = Math.abs(waveFactor) * 0.05 * (1.0 - normalizedY);
    
    // Soft organic sag due to gravity
    const overallSag = Math.pow(1.0 - normalizedY, 2.0) * 0.06;

    pos.setY(i, y - scallopedHem - overallSag);
  }

  geo.computeVertexNormals();
  return geo;
};

const CurtainIntro = ({ progressRef }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    /* Scene with Fog */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030303);
    scene.fog = new THREE.FogExp2(0x030303, 0.018);

    const W = el.clientWidth || window.innerWidth;
    const H = el.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 50);
    camera.position.z = 5;

    /* Renderer with Shadow Map support */
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);

    /* HDRI-like Equirectangular Environment Map */
    const envMap = createHDRILikeEnvMap();
    scene.environment = envMap;

    /* Cinematic Advanced Lights & Shadows */
    scene.add(new THREE.AmbientLight(0x0a0305, 0.25));

    // Main Spotlight casting shadows
    const spot = new THREE.SpotLight(0xffebd2, 14, 25, Math.PI / 4.2, 0.5, 0.85);
    spot.position.set(0, 5, 5.5);
    spot.castShadow = true;
    spot.shadow.mapSize.width = 1024;
    spot.shadow.mapSize.height = 1024;
    spot.shadow.bias = -0.0004;
    spot.shadow.radius = 4.5;
    scene.add(spot);

    // Warm left fill light
    const fill = new THREE.DirectionalLight(0xff3b30, 0.8);
    fill.position.set(-6, 2.5, 4);
    scene.add(fill);

    // Cool right edge/rim light for depth highlights
    const rim = new THREE.DirectionalLight(0x00a2ff, 0.6);
    rim.position.set(6, -2, 3.5);
    scene.add(rim);

    /* PBR Velvet Curtain Material */
    const tex = createFabricColorTexture();
    const normalMap = createFabricNormalMap();
    const mat = new THREE.MeshPhysicalMaterial({
      map: tex,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.4, 0.4),
      roughness: 0.72,
      metalness: 0.1,
      sheen: 0.95,
      sheenColor: new THREE.Color(0xd63031),
      sheenRoughness: 0.45,
      side: THREE.FrontSide,
      shadowSide: THREE.FrontSide,
      envMapIntensity: 1.0,
    });

    /* Curtain meshes */
    const leftMesh = new THREE.Mesh(buildCurtainGeo(false), mat);
    leftMesh.position.x = -CW / 2;
    leftMesh.castShadow = true;
    leftMesh.receiveShadow = true;
    scene.add(leftMesh);

    const rightMesh = new THREE.Mesh(buildCurtainGeo(true), mat);
    rightMesh.position.x = CW / 2;
    rightMesh.scale.x = -1;
    rightMesh.castShadow = true;
    rightMesh.receiveShadow = true;
    scene.add(rightMesh);

    /* Gold valance with Clearcoat PBR */
    const valanceMat = new THREE.MeshPhysicalMaterial({
      color: 0xffd700,
      metalness: 0.94,
      roughness: 0.18,
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.5,
    });
    const valance = new THREE.Mesh(new THREE.BoxGeometry(9, 0.18, 0.14), valanceMat);
    valance.position.set(0, CH / 2 + 0.07, 0.05);
    valance.castShadow = true;
    valance.receiveShadow = true;
    scene.add(valance);

    /* Gold tassels */
    const tMat = new THREE.MeshPhysicalMaterial({
      color: 0xffd700,
      metalness: 0.96,
      roughness: 0.12,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.6,
    });
    [-3.8, -1.9, 0, 1.9, 3.8].forEach(x => {
      const tMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4), tMat);
      tMesh.position.set(x, CH / 2 - 0.08, 0.05);
      tMesh.castShadow = true;
      scene.add(tMesh);
    });

    /* --- THE 3D THEATER STAGE (Sân khấu) --- */
    // 1. Stage Floor (Polished wooden boards)
    const stageWoodTex = createStageWoodTexture();
    const stageFloorMat = new THREE.MeshPhysicalMaterial({
      map: stageWoodTex,
      roughness: 0.28,
      metalness: 0.1,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18,
    });
    const stageFloor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 5.5), stageFloorMat);
    stageFloor.position.set(0, -2.0, -2.5); // low and set back
    stageFloor.receiveShadow = true;
    scene.add(stageFloor);

    // 2. Stage Volumetric Light Cone Beams
    const beamGeo = new THREE.CylinderGeometry(0.05, 1.8, 6.5, 32, 1, true);
    beamGeo.translate(0, -3.25, 0); // pivot at peak of cone

    const stageBeamMatL = new THREE.MeshBasicMaterial({
      color: 0xffd27f,
      transparent: true,
      opacity: 0.0, // animated
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const stageBeamMatR = new THREE.MeshBasicMaterial({
      color: 0xffebd2,
      transparent: true,
      opacity: 0.0, // animated
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const leftBeam = new THREE.Mesh(beamGeo, stageBeamMatL);
    leftBeam.position.set(-3.2, 3.5, -2.8);
    leftBeam.rotation.z = -Math.PI / 6.5;
    leftBeam.rotation.x = Math.PI / 14;
    scene.add(leftBeam);

    const rightBeam = new THREE.Mesh(beamGeo, stageBeamMatR);
    rightBeam.position.set(3.2, 3.5, -2.8);
    rightBeam.rotation.z = Math.PI / 6.5;
    rightBeam.rotation.x = Math.PI / 14;
    scene.add(rightBeam);

    // 3. Dynamic spotlights pointing to center of stage floor
    const stageSpotLeft = new THREE.SpotLight(0xffd27f, 0.0, 15, Math.PI / 6, 0.5, 0.5);
    stageSpotLeft.position.set(-3.2, 3.5, -2.8);
    stageSpotLeft.target = stageFloor;
    stageSpotLeft.castShadow = true;
    scene.add(stageSpotLeft);

    const stageSpotRight = new THREE.SpotLight(0xffebd2, 0.0, 15, Math.PI / 6, 0.5, 0.5);
    stageSpotRight.position.set(3.2, 3.5, -2.8);
    stageSpotRight.target = stageFloor;
    stageSpotRight.castShadow = true;
    scene.add(stageSpotRight);

    /* Atmosphere Dust Particles */
    const N = 80;
    const pGeo = new THREE.BufferGeometry();
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xffdfaa,
      size: 0.024,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const pts = new THREE.Points(pGeo, pMat);
    scene.add(pts);



    /* RAF loop — scroll-driven: reads progressRef.current */
    const TARGET = CW * 1.65;
    let rafId;

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      const p = progressRef?.current ?? 0; // 0..1 from scroll

      // 1. Curtain Opens between scroll p=0.0 and p=0.45
      const curtainProgress = Math.max(0, Math.min(p / 0.45, 1.0));
      const curtainEase = 1 - Math.pow(1 - curtainProgress, 3); // ease-out cubic
      
      const GAP = 0.08; // A small dark gap in the middle at load
      leftMesh.position.x = -CW / 2 - GAP - curtainEase * TARGET;
      rightMesh.position.x = CW / 2 + GAP + curtainEase * TARGET;

      // Stage general lights fade in with curtain
      const stageFade = Math.min(p / 0.35, 1.0);
      stageSpotLeft.intensity = stageFade * 14.0;
      stageSpotRight.intensity = stageFade * 14.0;
      stageBeamMatL.opacity = stageFade * 0.14;
      stageBeamMatR.opacity = stageFade * 0.14;

      /* drift particles when curtain is moving */
      if (p > 0 && p < 1) {
        const pa = pts.geometry.attributes.position;
        for (let i = 0; i < N; i++) {
          pa.setY(i, pa.getY(i) + 0.0015);
          if (pa.getY(i) > 3.5) pa.setY(i, -3.5);
        }
        pa.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    tick();

    /* Resize */
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      envMap.dispose();
      tex.dispose();
      normalMap.dispose();
      stageWoodTex.dispose();
      stageFloorMat.dispose();
      stageBeamMatL.dispose();
      stageBeamMatR.dispose();
      pMat.dispose();
      valanceMat.dispose();
      tMat.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="curtain-overlay">
      <div ref={mountRef} className="curtain-canvas" />
      <div className="curtain-bar curtain-bar--top" />
      <div className="curtain-bar curtain-bar--bottom" />
    </div>
  );
};

export default CurtainIntro;

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './CurtainIntro.css';

/* Geometry  */
const CW = 3.6, CH = 4.2;

function buildCurtainGeo(flipX = false) {
  const geo = new THREE.PlaneGeometry(CW, CH, 40, 30);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) / CW + 0.5;
    const fold = Math.sin(u * Math.PI * 5) * 0.18;
    pos.setZ(i, fold * (flipX ? u : 1 - u));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

const CurtainIntro = ({ progressRef }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    /* Scene */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060606);

    const W = el.clientWidth || window.innerWidth;
    const H = el.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 50);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    el.appendChild(renderer.domElement);

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const spot = new THREE.SpotLight(0xffd7b0, 4, 20, Math.PI / 5, 0.5);
    spot.position.set(0, 4, 6);
    scene.add(spot);
    const fill = new THREE.DirectionalLight(0xff2020, 0.75);
    fill.position.set(-4, 2, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xff8040, 0.35);
    rim.position.set(4, -1, 2);
    scene.add(rim);

    /* Fabric texture */
    const tc = document.createElement('canvas');
    tc.width = tc.height = 512;
    const ctx = tc.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#8b0000');
    grad.addColorStop(0.3, '#c0050d');
    grad.addColorStop(0.7, '#a50008');
    grad.addColorStop(1, '#6b0000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    for (let x = 0; x < 512; x += 6) {
      ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.15 + 0.05})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(tc);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);

    const mat = new THREE.MeshPhongMaterial({
      map: tex, side: THREE.DoubleSide,
      shininess: 30, specular: new THREE.Color(0x550000),
    });

    /* Curtain meshes */
    const leftMesh = new THREE.Mesh(buildCurtainGeo(false), mat);
    leftMesh.position.x = -CW / 2;
    scene.add(leftMesh);

    const rightMesh = new THREE.Mesh(buildCurtainGeo(true), mat);
    rightMesh.position.x = CW / 2;
    rightMesh.scale.x = -1;
    scene.add(rightMesh);

    /* Gold valance */
    const valanceMat = new THREE.MeshStandardMaterial({ color: 0xc8a44a, metalness: 0.85, roughness: 0.2 });
    const valance = new THREE.Mesh(new THREE.BoxGeometry(9, 0.18, 0.14), valanceMat);
    valance.position.set(0, CH / 2 + 0.07, 0.05);
    scene.add(valance);

    /* Gold tassels */
    const tMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.1 });
    [-3.8, -1.9, 0, 1.9, 3.8].forEach(x => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), tMat);
      s.position.set(x, CH / 2 + 0.07, 0.14);
      scene.add(s);
    });

    /* Dust particles */
    const N = 200;
    const buf = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      buf[i * 3] = (Math.random() - 0.5) * 9;
      buf[i * 3 + 1] = (Math.random() - 0.5) * 6;
      buf[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(buf, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xffe8c0, size: 0.028, transparent: true, opacity: 0.55,
    }));
    scene.add(pts);

    /* RAF loop — scroll-driven: reads progressRef.current */
    const TARGET = CW * 1.65;
    let rafId;

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      const p = progressRef?.current ?? 0;           // 0..1 from scroll
      const ease = 1 - Math.pow(1 - Math.min(p, 1), 3); // ease-out cubic

      leftMesh.position.x = -CW / 2 - ease * TARGET;
      rightMesh.position.x = CW / 2 + ease * TARGET;

      /* drift particles when curtain is moving */
      if (p > 0 && p < 1) {
        const pa = pts.geometry.attributes.position;
        for (let i = 0; i < N; i++) {
          pa.setY(i, pa.getY(i) + 0.0012);
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

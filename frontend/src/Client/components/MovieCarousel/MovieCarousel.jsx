import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { ChevronLeft, ChevronRight, X, Play, Film } from 'lucide-react';
import './MovieCarousel.css';

const MovieCarousel = ({ movies }) => {
  if (!movies || movies.length === 0) return null;

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const navigationRef = useRef(null);

  const [zoomedMovie, setZoomedMovie] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Synchronize mobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helpers for titles and images
  const getImageUrl = (movie) => {
    const raw = movie.posterUrl || movie.poster || movie.imageUrl || movie.image || '';
    if (!raw) return '';
    // Route external URLs through the Vite image-proxy to bypass CORS
    if (raw.startsWith('http')) {
      return `/image-proxy/${encodeURIComponent(raw)}`;
    }
    return raw;
  };

  const getTitle = (movie) =>
    movie.title || movie.name || movie.movieName || 'Unknown Title';

  // Helper to generate a stylized fallback/placeholder texture
  const createPlaceholderPoster = (title) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');

    // Charcoal/Navy gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, 450);
    grad.addColorStop(0, '#1c1c24');
    grad.addColorStop(1, '#0b0b0e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 450);

    // Neon gold border outline
    ctx.strokeStyle = 'rgba(255, 179, 0, 0.3)';
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, 276, 426);

    // Decorative film circle logo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.beginPath();
    ctx.arc(150, 170, 60, 0, Math.PI * 2);
    ctx.fill();

    // Wrapped Title Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = title.split(' ');
    let line = '';
    let y = 280;
    const maxWidth = 220;
    const lineHeight = 26;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), 150, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), 150, y);

    // Cinema brand subtext
    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('FEATURE PRESENTATION', 150, 400);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Helper to generate the film strip cell background texture (acetate border + sprockets)
  const createFilmCellTexture = (index) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Translucent black acetate film sheet
    ctx.fillStyle = '#0a0a0d';
    ctx.fillRect(0, 0, 512, 512);

    // Inner transparent window background behind the poster
    ctx.fillStyle = '#111116';
    ctx.fillRect(100, 60, 312, 392);

    // Sprocket hole slots
    ctx.fillStyle = '#010101';
    ctx.strokeStyle = '#282832';
    ctx.lineWidth = 2;

    const drawSprocket = (x, y) => {
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, 36, 26, 6);
      } else {
        ctx.rect(x, y, 36, 26);
      }
      ctx.fill();
      ctx.stroke();
    };

    // 4 sprocket holes at the top, 4 at the bottom
    const sprocketX = [25, 150, 275, 400];
    sprocketX.forEach((x) => {
      drawSprocket(x, 16);
      drawSprocket(x, 470);
    });

    // Horizontal film border rules
    ctx.strokeStyle = '#1f1f28';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 56);
    ctx.lineTo(512, 56);
    ctx.moveTo(0, 456);
    ctx.lineTo(512, 456);
    ctx.stroke();

    // Vertical seam divider separating frame cells
    ctx.strokeStyle = '#15151c';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 512);
    ctx.moveTo(512, 0);
    ctx.lineTo(512, 512);
    ctx.stroke();

    // Film stock typography
    ctx.fillStyle = '#4c4c58';
    ctx.font = 'bold 12px "Courier New", Courier, monospace';
    ctx.fillText('KODAK 500T 5219', 80, 500);
    ctx.fillText(`FRAME 0${index + 1}`, 260, 500);
    ctx.fillText(`► 0${(index + 1) * 2}A`, 420, 500);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  useEffect(() => {
    if (!movies || movies.length === 0) return;

    // Pad list to have at least 8 items for a seamless wrap-around scroll
    let list = [...movies];
    while (list.length <= 11) {
      list = [...list, ...movies];
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // 4. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Projector Spotlight pointing at target center
    const projector = new THREE.SpotLight(0xffb300, 15, 18, Math.PI / 4, 0.45, 0.85);
    projector.position.set(0, 3.5, 6.5);
    scene.add(projector);

    // 5. Film Strip Elements
    const SPACING = 4.5;
    const totalWidth = list.length * SPACING;
    const stripGroup = new THREE.Group();
    scene.add(stripGroup);

    const movieItems = [];
    const loader = new THREE.TextureLoader();

    list.forEach((movie, index) => {
      const itemGroup = new THREE.Group();
      itemGroup.position.x = index * SPACING;
      stripGroup.add(itemGroup);

      // Base Film Cell Frame Mesh
      const cellGeo = new THREE.PlaneGeometry(4.54, 5.0);
      const cellMat = new THREE.MeshStandardMaterial({
        map: createFilmCellTexture(index),
        roughness: 0.5,
        metalness: 0.1,
        transparent: true,
      });
      const cellMesh = new THREE.Mesh(cellGeo, cellMat);
      itemGroup.add(cellMesh);

      // Glow border Mesh (activated on hover)
      const glowGeo = new THREE.PlaneGeometry(2.46, 3.46);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffb300,
        transparent: true,
        opacity: 0,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.z = 0.015;
      itemGroup.add(glowMesh);

      // Poster Mesh
      const posterGeo = new THREE.PlaneGeometry(2.4, 3.4);
      const posterPlaceholder = createPlaceholderPoster(getTitle(movie));
      const posterMat = new THREE.MeshStandardMaterial({
        map: posterPlaceholder,
        roughness: 0.2,
        metalness: 0.1,
      });
      const posterMesh = new THREE.Mesh(posterGeo, posterMat);
      posterMesh.position.z = 0.02;
      itemGroup.add(posterMesh);

      // Load actual poster image texture asynchronously
      const posterUrl = getImageUrl(movie);
      if (posterUrl) {
        loader.load(
          posterUrl,
          (loadedTexture) => {
            loadedTexture.minFilter = THREE.LinearFilter;
            loadedTexture.colorSpace = THREE.SRGBColorSpace;
            posterMat.map = loadedTexture;
            posterMat.needsUpdate = true;
          },
          undefined,
          () => {
            console.warn(`Failed to load poster texture for: ${getTitle(movie)}`);
          }
        );
      }

      // Attach references for animation logic and interaction raycasting
      itemGroup.userData = {
        index,
        movie,
        posterMesh,
        glowMesh,
        targetScale: 1.0,
        currentScale: 1.0,
        targetGlowOpacity: 0.0,
        currentGlowOpacity: 0.0,
      };

      movieItems.push(itemGroup);
    });

    // 6. Cinema Projector Dust Particles
    const dustCount = 120;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i++) {
      dustPositions[i] = (Math.random() - 0.5) * 16;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0xcccccc,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // 7. Interaction States and Variables
    let scrollX = 0;
    let velocity = 0;
    let isDragging = false;
    let startPointerX = 0;
    let startScrollX = 0;
    let isZoomed = false;
    let selectedIndex = -1;

    // Camera targets
    const targetCameraPos = new THREE.Vector3(0, 0, 5.5);
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3(0, 0, 0);

    let raycaster = new THREE.Raycaster();
    let pointerPos = new THREE.Vector2(-999, -999);

    // 8. Event Listeners
    const onPointerDown = (e) => {
      if (isZoomed) return;
      isDragging = true;
      startPointerX = e.clientX;
      startScrollX = scrollX;
      velocity = 0;
      setHasInteracted(true);
    };

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointerPos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerPos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!isDragging) return;
      const dx = e.clientX - startPointerX;
      const sensitivity = 0.01;
      const prevScrollX = scrollX;
      scrollX = startScrollX + dx * sensitivity;
      velocity = scrollX - prevScrollX;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onClick = () => {
      if (isZoomed) return;

      // Click to Zoom in
      raycaster.setFromCamera(pointerPos, camera);
      const intersects = raycaster.intersectObjects(stripGroup.children, true);

      if (intersects.length > 0) {
        // Find which movie group was clicked
        let clickedGroup = null;
        let obj = intersects[0].object;
        while (obj && obj !== scene) {
          if (obj.parent && obj.parent.userData && obj.parent.userData.movie) {
            clickedGroup = obj.parent;
            break;
          }
          obj = obj.parent;
        }

        if (clickedGroup) {
          const index = clickedGroup.userData.index;
          zoomToItem(index);
        }
      }
    };

    const zoomToItem = (index) => {
      isZoomed = true;
      selectedIndex = index;
      const item = movieItems[index];
      setZoomedMovie(item.userData.movie);
      setHasInteracted(true);

      const isMobileDevice = window.innerWidth < 768;
      const xOffset = isMobileDevice ? 0 : 0.8;
      const yOffset = isMobileDevice ? 0.65 : 0;
      const zoomZ = isMobileDevice ? 3.0 : 2.45;

      const worldX = item.position.x;
      targetCameraPos.set(worldX - xOffset, yOffset, zoomZ);
      targetLookAt.set(worldX - xOffset, yOffset, 0);
    };

    const closeZoom = () => {
      isZoomed = false;
      selectedIndex = -1;
      setZoomedMovie(null);

      targetCameraPos.set(0, 0, 5.5);
      targetLookAt.set(0, 0, 0);
    };

    const scrollTimeline = (direction) => {
      if (isZoomed) {
        // Navigate to next/prev zoomed frame
        let nextIndex = selectedIndex;
        if (direction === 'next') {
          nextIndex = (selectedIndex + 1) % list.length;
        } else {
          nextIndex = (selectedIndex - 1 + list.length) % list.length;
        }
        zoomToItem(nextIndex);
      } else {
        // Push scroll velocity
        velocity += direction === 'next' ? -1.0 : 1.0;
        setHasInteracted(true);
      }
    };

    // Bind navigation handlers to the React reference
    navigationRef.current = {
      next: () => scrollTimeline('next'),
      prev: () => scrollTimeline('prev'),
      close: closeZoom,
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('click', onClick);

    // Resize Handler
    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // 9a. Scroll & wrap positions if not zoomed
      if (!isZoomed) {
        if (!isDragging) {
          // Continuous timeline crawl
          scrollX -= 0.0035;
          // Apply velocity inertia
          scrollX += velocity;
          velocity *= 0.94;
        } else {
          scrollX += velocity;
        }
      }

      // 9b. Arrange item groups along the horizontal timeline
      movieItems.forEach((group) => {
        const baseX = group.userData.index * SPACING;
        // Wrapping modulo logic centered on the screen viewport
        group.position.x =
          ((baseX + scrollX + totalWidth / 2) % totalWidth + totalWidth) % totalWidth - totalWidth / 2;
      });

      // 9c. Raycast hover effects when not zoomed
      let hoveredIndex = -1;
      let raycastPoint = new THREE.Vector3();

      if (!isZoomed && !isDragging) {
        raycaster.setFromCamera(pointerPos, camera);
        const intersects = raycaster.intersectObjects(stripGroup.children, true);
        if (intersects.length > 0) {
          let obj = intersects[0].object;
          while (obj && obj !== scene) {
            if (obj.parent && obj.parent.userData && obj.parent.userData.movie) {
              hoveredIndex = obj.parent.userData.index;
              raycastPoint.copy(intersects[0].point);
              break;
            }
            obj = obj.parent;
          }
        }
      }

      // 9d. Animate poster hover transitions and tilts
      movieItems.forEach((group) => {
        const u = group.userData;
        const index = u.index;

        if (index === hoveredIndex) {
          u.targetScale = 1.12;
          u.targetGlowOpacity = 0.8;

          // Parallax mouse tilt
          const dx = raycastPoint.x - group.position.x;
          const dy = raycastPoint.y - group.position.y;
          u.posterMesh.rotation.y += (dx * 0.14 - u.posterMesh.rotation.y) * 0.12;
          u.posterMesh.rotation.x += (-dy * 0.14 - u.posterMesh.rotation.x) * 0.12;
        } else if (isZoomed && index === selectedIndex) {
          u.targetScale = 1.05;
          u.targetGlowOpacity = 0.7;
          // Return to flat facing the camera
          u.posterMesh.rotation.y += (0 - u.posterMesh.rotation.y) * 0.15;
          u.posterMesh.rotation.x += (0 - u.posterMesh.rotation.x) * 0.15;
        } else {
          u.targetScale = 1.0;
          u.targetGlowOpacity = 0.0;
          u.posterMesh.rotation.y += (0 - u.posterMesh.rotation.y) * 0.15;
          u.posterMesh.rotation.x += (0 - u.posterMesh.rotation.x) * 0.15;
        }

        // Interpolate scale and glow opacity
        u.currentScale += (u.targetScale - u.currentScale) * 0.1;
        u.posterMesh.scale.setScalar(u.currentScale);

        u.currentGlowOpacity += (u.targetGlowOpacity - u.currentGlowOpacity) * 0.1;
        u.glowMesh.material.opacity = u.currentGlowOpacity;
      });

      // Update cursor cursor style
      if (!isZoomed) {
        canvas.style.cursor =
          hoveredIndex !== -1 ? 'pointer' : isDragging ? 'grabbing' : 'grab';
      } else {
        canvas.style.cursor = 'default';
      }

      // 9e. Interpolate Camera & Spotlight lookAt target
      camera.position.lerp(targetCameraPos, 0.07);
      currentLookAt.lerp(targetLookAt, 0.07);
      camera.lookAt(currentLookAt);

      projector.target.position.copy(currentLookAt);
      projector.target.updateMatrixWorld();

      // 9f. Drift dust particles in projector beams
      const positions = dustGeo.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        // Drift up
        positions[i * 3 + 1] += 0.0018;
        if (positions[i * 3 + 1] > 4.5) {
          positions[i * 3 + 1] = -4.5;
        }
        // Drift horizontally
        positions[i * 3] += Math.sin(time * 0.5 + i) * 0.0008;
      }
      dustGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Clean up resource disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);

      // Recursive disposal
      scene.traverse((obj) => {
        if (!obj.isMesh) return;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
          }
        }
      });

      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
    };
  }, [movies]);

  const handleBookNow = (e, movie) => {
    e.stopPropagation();
    const movieId = movie.id || movie._id || movie.movieId;
    if (movieId) {
      navigate(`/movie/${movieId}`);
    }
  };

  return (
    <section className="movie-carousel-3d-wrapper" ref={containerRef}>
      {/* Three.js Canvas */}
      <canvas className="carousel-canvas" ref={canvasRef} />

      {/* Navigation Arrows */}
      <button
        className="carousel-nav-btn prev"
        onClick={() => navigationRef.current?.prev()}
        aria-label="Previous Frame"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        className="carousel-nav-btn next"
        onClick={() => navigationRef.current?.next()}
        aria-label="Next Frame"
      >
        <ChevronRight size={28} />
      </button>

      {/* Glassmorphic Details Overlay (Zoomed Frame Mode) */}
      {zoomedMovie && (
        <div className={isMobile ? 'movie-detail-overlay-mobile' : 'movie-detail-overlay'}>
          <div className="overlay-brand">
            <Film size={12} />
            <span>K&amp;L Exclusive Showcase</span>
          </div>

          <h2 className="overlay-title">{getTitle(zoomedMovie)}</h2>

          <div className="overlay-meta">
            {zoomedMovie.genre && (
              <>
                <span className="meta-genre">{zoomedMovie.genre}</span>
                <div className="meta-divider" />
              </>
            )}
            {zoomedMovie.duration && (
              <>
                <span className="meta-duration">{zoomedMovie.duration} min</span>
                <div className="meta-divider" />
              </>
            )}
            {zoomedMovie.ageRating && (
              <span className="meta-rating">{zoomedMovie.ageRating}</span>
            )}
          </div>

          <p className="overlay-desc">
            {zoomedMovie.description ||
              zoomedMovie.synopsis ||
              'Experience this cinematic masterpiece in high-definition digital sound. Book tickets today for an unforgettable screen adventure.'}
          </p>

          <div className="overlay-actions">
            <button className="btn-book" onClick={(e) => handleBookNow(e, zoomedMovie)}>
              <Play size={16} fill="currentColor" />
              <span>Book Ticket</span>
            </button>

            <button
              className="btn-close-zoom"
              onClick={() => navigationRef.current?.close()}
            >
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default MovieCarousel;

import * as THREE from 'three';
import { PERF, AdaptiveResolution, scaledCount } from '../systems/performance.js';

/**
 * High-Precision Spaceflight WebGL Scene & Cinematic Camera Engine
 * Inspired by modern spaceflight simulators:
 * - Buttery-smooth camera damping & inertia
 * - Cinematic flyTo transitions
 * - Dynamic zero-g orbital drift
 * - Real-time Cosmic Stardust particle cloud
 * - Flight attitude & telemetry telemetry export
 */
export function setupScene(container) {
  // 1. Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc87142);

  // 2. Camera
  const camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2.2, 5.5);

  // 3. WebGL Renderer
  // Quality follows the device tier (see systems/performance.js); resolution adapts at runtime
  const renderer = new THREE.WebGLRenderer({
    antialias: PERF.antialias,
    powerPreference: "high-performance",
    alpha: false
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = PERF.shadows;
  renderer.shadowMap.type = PERF.softShadows ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
  const adaptiveResolution = new AdaptiveResolution(renderer);

  container.appendChild(renderer.domElement);

  // 4. Smooth Spherical Orbit Navigation with Physics Damping
  const spherical = {
    radius: 6.0,
    theta: 0.1,
    phi: Math.PI / 3,
    target: new THREE.Vector3(0, 0.6, 0)
  };

  // Internal targets for silky smooth exponential damping (inertia)
  const targetState = {
    radius: 6.0,
    theta: 0.1,
    phi: Math.PI / 3,
    lookAt: new THREE.Vector3(0, 0.6, 0),
    velocityTheta: 0,
    velocityPhi: 0
  };

  // FPP (First Person Point of View / Pancam) look angles
  const fpp = {
    yaw: 0,
    pitch: 0,
    eyePos: new THREE.Vector3(0, 1.4, 0),
    targetYaw: 0,
    targetPitch: 0
  };

  let isDragging = false;
  let enableIdleDrift = false; // Disabled by default in mission gameplay to keep rover in front view
  let prevMouse = { x: 0, y: 0 };
  let currentCameraMode = 'orbit'; // 'orbit', 'pancam_fpp', 'top', 'surface'
  let lastUserInteractionTime = Date.now();

  // Active Cinematic Fly-To transition
  let activeTransition = null;

  // 5. Cosmic Stardust Particle Cloud
  const particleCount = scaledCount(750);
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  const particleSpeeds = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    particlePositions[idx] = (Math.random() - 0.5) * 50;
    particlePositions[idx + 1] = Math.random() * 25 - 2;
    particlePositions[idx + 2] = (Math.random() - 0.5) * 50;

    particleSizes[i] = Math.random() * 2.2 + 0.8;
    particleSpeeds[idx] = (Math.random() - 0.5) * 0.15;
    particleSpeeds[idx + 1] = (Math.random() - 0.5) * 0.08;
    particleSpeeds[idx + 2] = (Math.random() - 0.5) * 0.15;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

  // Shimmering cosmic stardust material
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x90e0ef,
    size: 0.14,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const stardustCloud = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(stardustCloud);

  // 6. Direct Camera Position Calculation
  function updateCameraPosition() {
    if (currentCameraMode === 'orbit' || currentCameraMode === 'surface') {
      camera.position.x = spherical.target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.target.y + spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(spherical.target);
    } else if (currentCameraMode === 'pancam_fpp') {
      camera.position.copy(fpp.eyePos);
      const lookTarget = new THREE.Vector3(
        fpp.eyePos.x - Math.sin(fpp.yaw) * Math.cos(fpp.pitch) * 10,
        fpp.eyePos.y + Math.sin(fpp.pitch) * 10,
        fpp.eyePos.z - Math.cos(fpp.yaw) * Math.cos(fpp.pitch) * 10
      );
      camera.lookAt(lookTarget);
    }
  }
  updateCameraPosition();

  // Mouse Dragging
  container.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
      lastUserInteractionTime = Date.now();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouse.x;
    const deltaY = e.clientY - prevMouse.y;
    prevMouse = { x: e.clientX, y: e.clientY };
    lastUserInteractionTime = Date.now();

    if (currentCameraMode === 'orbit' || currentCameraMode === 'surface') {
      targetState.theta -= deltaX * 0.007;
      targetState.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.05, targetState.phi - deltaY * 0.007));
    } else if (currentCameraMode === 'pancam_fpp') {
      fpp.targetYaw += deltaX * 0.005;
      fpp.targetPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, fpp.targetPitch - deltaY * 0.005));
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Dragging
  let touchStartDist = 0;
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastUserInteractionTime = Date.now();
    } else if (e.touches.length === 2) {
      touchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - prevMouse.x;
      const deltaY = e.touches[0].clientY - prevMouse.y;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastUserInteractionTime = Date.now();

      if (currentCameraMode === 'orbit' || currentCameraMode === 'surface') {
        targetState.theta -= deltaX * 0.008;
        targetState.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.05, targetState.phi - deltaY * 0.008));
      } else if (currentCameraMode === 'pancam_fpp') {
        fpp.targetYaw += deltaX * 0.006;
        fpp.targetPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, fpp.targetPitch - deltaY * 0.006));
      }
    } else if (e.touches.length === 2 && (currentCameraMode === 'orbit' || currentCameraMode === 'surface')) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = touchStartDist - currentDist;
      touchStartDist = currentDist;
      targetState.radius = Math.max(1.8, Math.min(26, targetState.radius + diff * 0.03));
      lastUserInteractionTime = Date.now();
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Wheel Zoom with smooth target approach
  container.addEventListener('wheel', (e) => {
    if (currentCameraMode === 'orbit' || currentCameraMode === 'surface') {
      e.preventDefault();
      targetState.radius = Math.max(1.8, Math.min(26, targetState.radius + e.deltaY * 0.0045));
      lastUserInteractionTime = Date.now();
    }
  }, { passive: false });

  // Handle Window Resize
  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    adaptiveResolution.refreshCeiling();
  }
  window.addEventListener('resize', onResize);

  // 7. Frame Update Function (Called in Main Render Loop)
  function update(delta, elapsedTime) {
    const dt = Math.min(delta, 0.1);

    // Update Cosmic Stardust particles
    if (stardustCloud) {
      const positions = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        positions[idx] += particleSpeeds[idx] * dt * 4.0;
        positions[idx + 1] += particleSpeeds[idx + 1] * dt * 4.0;
        positions[idx + 2] += particleSpeeds[idx + 2] * dt * 4.0;

        // Wrap around relative to camera position
        const relX = positions[idx] - camera.position.x;
        const relY = positions[idx + 1] - camera.position.y;
        const relZ = positions[idx + 2] - camera.position.z;

        if (relX > 25) positions[idx] -= 50;
        if (relX < -25) positions[idx] += 50;
        if (relY > 15) positions[idx + 1] -= 25;
        if (relY < -10) positions[idx + 1] += 25;
        if (relZ > 25) positions[idx + 2] -= 50;
        if (relZ < -25) positions[idx + 2] += 50;
      }
      particleGeometry.attributes.position.needsUpdate = true;
    }

    // Handle Cinematic Fly-To Interpolation
    if (activeTransition) {
      activeTransition.elapsed += dt;
      const progress = Math.min(1.0, activeTransition.elapsed / activeTransition.duration);
      // Smooth cubic-bezier easeInOut: 3t^2 - 2t^3
      const ease = progress * progress * (3 - 2 * progress);

      spherical.radius = activeTransition.startRadius + (activeTransition.targetRadius - activeTransition.startRadius) * ease;
      spherical.theta = activeTransition.startTheta + (activeTransition.targetTheta - activeTransition.startTheta) * ease;
      spherical.phi = activeTransition.startPhi + (activeTransition.targetPhi - activeTransition.startPhi) * ease;
      spherical.target.lerpVectors(activeTransition.startLookAt, activeTransition.targetLookAt, ease);

      targetState.radius = spherical.radius;
      targetState.theta = spherical.theta;
      targetState.phi = spherical.phi;
      targetState.lookAt.copy(spherical.target);

      updateCameraPosition();

      if (progress >= 1.0) {
        if (activeTransition.onComplete) activeTransition.onComplete();
        activeTransition = null;
      }
      return;
    }

    // Idle Orbital Space Drift when user is not actively interacting (disabled in mission driving)
    const idleTime = (Date.now() - lastUserInteractionTime) / 1000;
    if (enableIdleDrift && !isDragging && idleTime > 3.0 && currentCameraMode === 'orbit') {
      targetState.theta += 0.028 * dt; // slow, cinematic orbital drift
    }

    // Exponential Damping Physics Interpolation
    const lerpFactor = Math.min(1.0, 1.0 - Math.exp(-12 * dt));
    const targetLerpFactor = Math.min(1.0, 1.0 - Math.exp(-14 * dt));

    spherical.radius += (targetState.radius - spherical.radius) * lerpFactor;

    // Normalize angular difference for theta so camera doesn't spin 360 degrees when crossing +/- PI
    let dTheta = targetState.theta - spherical.theta;
    while (dTheta > Math.PI) dTheta -= Math.PI * 2;
    while (dTheta < -Math.PI) dTheta += Math.PI * 2;
    spherical.theta += dTheta * lerpFactor;
    while (spherical.theta > Math.PI) spherical.theta -= Math.PI * 2;
    while (spherical.theta < -Math.PI) spherical.theta += Math.PI * 2;

    spherical.phi += (targetState.phi - spherical.phi) * lerpFactor;
    spherical.target.lerp(targetState.lookAt, targetLerpFactor);

    // Pancam FPP Damping
    fpp.yaw += (fpp.targetYaw - fpp.yaw) * lerpFactor;
    fpp.pitch += (fpp.targetPitch - fpp.pitch) * lerpFactor;

    updateCameraPosition();
  }

  // 8. Cinematic flyTo API for smooth transitions between planets and hardware
  function flyTo({ target, radius, theta, phi, duration = 1.4, onComplete = null }) {
    activeTransition = {
      startRadius: spherical.radius,
      startTheta: spherical.theta,
      startPhi: spherical.phi,
      startLookAt: spherical.target.clone(),
      targetRadius: radius !== undefined ? radius : spherical.radius,
      targetTheta: theta !== undefined ? theta : spherical.theta,
      targetPhi: phi !== undefined ? phi : spherical.phi,
      targetLookAt: target ? (target instanceof THREE.Vector3 ? target.clone() : new THREE.Vector3(target.x, target.y, target.z)) : spherical.target.clone(),
      duration: Math.max(0.4, duration),
      elapsed: 0,
      onComplete
    };
  }

  // Set look target seamlessly
  function setTarget(x, y, z) {
    targetState.lookAt.set(x, y, z);
    if (!activeTransition) {
      spherical.target.set(x, y, z);
    }
  }

  // Expose camera attitude (pitch, roll, heading) for the Flight Cockpit HUD
  function getCameraAttitude() {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    // Heading in degrees: 0° is North, 90° is East, 180° is South, 270° is West
    let heading = Math.atan2(dir.x, dir.z) * (180 / Math.PI);
    if (heading < 0) heading += 360;

    // Pitch in degrees
    const pitch = Math.asin(Math.max(-1, Math.min(1, dir.y))) * (180 / Math.PI);

    return {
      headingDeg: heading,
      pitchDeg: pitch,
      altitudeM: Math.max(0, camera.position.y).toFixed(1)
    };
  }

  return {
    scene,
    camera,
    renderer,
    adaptiveResolution,
    spherical,
    targetState,
    fpp,
    get isDragging() {
      return isDragging;
    },
    setIdleDrift: (enabled) => {
      enableIdleDrift = enabled;
    },
    cancelTransition: () => {
      activeTransition = null;
    },
    get isOrbitEnabled() {
      return currentCameraMode === 'orbit' || currentCameraMode === 'surface';
    },
    setCameraMode: (mode) => {
      currentCameraMode = mode;
      if (mode === 'top') {
        targetState.phi = 0.15;
        targetState.radius = 16.0;
      } else if (mode === 'surface') {
        targetState.phi = Math.PI / 2.05;
        targetState.radius = 4.2;
      } else if (mode === 'orbit') {
        targetState.phi = Math.PI / 3;
        targetState.radius = 6.0;
      }
      updateCameraPosition();
    },
    updateCameraPosition,
    setTarget,
    update,
    flyTo,
    getCameraAttitude
  };
}

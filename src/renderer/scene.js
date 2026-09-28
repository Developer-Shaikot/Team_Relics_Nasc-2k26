import * as THREE from 'three';

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
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    alpha: false
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  // 4. Smooth Orbit & FPP Camera Navigation
  const spherical = {
    radius: 6.0,
    theta: 0.1,
    phi: Math.PI / 3,
    target: new THREE.Vector3(0, 0.6, 0)
  };

  // FPP (First Person Point of View / Pancam) look angles
  const fpp = {
    yaw: 0,
    pitch: 0,
    eyePos: new THREE.Vector3(0, 1.4, 0)
  };

  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let currentCameraMode = 'orbit'; // 'orbit', 'pancam_fpp', 'top', 'surface'

  function updateCameraPosition() {
    if (currentCameraMode === 'orbit' || currentCameraMode === 'surface') {
      camera.position.x = spherical.target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.target.y + spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(spherical.target);
    } else if (currentCameraMode === 'pancam_fpp') {
      // Fluid FPP PUBG-style mouse look from Rover's eye mast
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
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouse.x;
    const deltaY = e.clientY - prevMouse.y;
    prevMouse = { x: e.clientX, y: e.clientY };

    if (currentCameraMode === 'orbit' || currentCameraMode === 'surface') {
      spherical.theta -= deltaX * 0.007;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.007));
      updateCameraPosition();
    } else if (currentCameraMode === 'pancam_fpp') {
      // Smooth FPP look
      fpp.yaw += deltaX * 0.005;
      fpp.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, fpp.pitch - deltaY * 0.005));
      updateCameraPosition();
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
    } else if (e.touches.length === 2) {
      touchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - prevMouse.x;
      const deltaY = e.touches[0].clientY - prevMouse.y;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      if (currentCameraMode === 'orbit' || currentCameraMode === 'surface') {
        spherical.theta -= deltaX * 0.009;
        spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.009));
        updateCameraPosition();
      } else if (currentCameraMode === 'pancam_fpp') {
        fpp.yaw += deltaX * 0.007;
        fpp.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, fpp.pitch - deltaY * 0.007));
        updateCameraPosition();
      }
    } else if (e.touches.length === 2 && (currentCameraMode === 'orbit' || currentCameraMode === 'surface')) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = touchStartDist - currentDist;
      touchStartDist = currentDist;
      spherical.radius = Math.max(1.8, Math.min(25, spherical.radius + diff * 0.03));
      updateCameraPosition();
    }
  });

  container.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Wheel Zoom
  container.addEventListener('wheel', (e) => {
    if (currentCameraMode === 'orbit' || currentCameraMode === 'surface') {
      e.preventDefault();
      spherical.radius = Math.max(1.8, Math.min(25, spherical.radius + e.deltaY * 0.005));
      updateCameraPosition();
    }
  }, { passive: false });

  // Handle Window Resize
  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', onResize);

  return {
    scene,
    camera,
    renderer,
    spherical,
    fpp,
    get isOrbitEnabled() {
      return currentCameraMode === 'orbit' || currentCameraMode === 'surface';
    },
    setCameraMode: (mode) => {
      currentCameraMode = mode;
      updateCameraPosition();
    },
    updateCameraPosition,
    setTarget: (x, y, z) => {
      spherical.target.set(x, y, z);
      updateCameraPosition();
    }
  };
}

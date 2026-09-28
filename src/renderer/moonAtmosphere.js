import * as THREE from 'three';

// Lunar Space Environment: Pitch-black sky, Sparkling Starfield, Glowing Earthrise, Harsh Sun
export function createLunarAtmosphere(scene) {
  const group = new THREE.Group();
  group.name = "lunar_atmosphere";

  // 1. Direct Harsh Sun (1.0 AU, pure white sunlight, no atmospheric diffusion)
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
  sunLight.position.set(30, 45, 25);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 120;
  sunLight.shadow.camera.left = -25;
  sunLight.shadow.camera.right = 25;
  sunLight.shadow.camera.top = 25;
  sunLight.shadow.camera.bottom = -25;
  sunLight.shadow.bias = -0.0005;
  group.add(sunLight);

  // 2. Earthshine / Ambient Light (Dim cool blue from glowing Earth & surface bounce)
  const ambientLight = new THREE.AmbientLight(0x1a2436, 0.45);
  group.add(ambientLight);

  // 3. Deep Space Sky Dome (Pitch Black)
  const skyGeo = new THREE.SphereGeometry(190, 32, 24);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0x010204,
    side: THREE.BackSide
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  group.add(skyDome);

  // 4. Dense Starfield (3,000 sparkling stars in high vacuum)
  const starCount = 3000;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 1.8 - 0.9);
    const radius = 175;

    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) + 5; // keep above horizon
    starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const brightness = 0.6 + Math.random() * 0.4;
    starColors[i * 3] = brightness;
    starColors[i * 3 + 1] = brightness * (0.9 + Math.random() * 0.1);
    starColors[i * 3 + 2] = brightness * (1.0 + Math.random() * 0.2);
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 1.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.9
  });
  const starField = new THREE.Points(starGeo, starMat);
  group.add(starField);

  // 5. Beautiful Glowing Blue Earth in Lunar Sky (Earthrise)
  const earthCanvas = document.createElement('canvas');
  earthCanvas.width = 256;
  earthCanvas.height = 256;
  const eCtx = earthCanvas.getContext('2d');

  // Deep ocean gradient
  const eGrad = eCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
  eGrad.addColorStop(0, '#38bdf8');
  eGrad.addColorStop(0.5, '#0284c7');
  eGrad.addColorStop(0.85, '#0369a1');
  eGrad.addColorStop(1, '#075985');
  eCtx.fillStyle = eGrad;
  eCtx.beginPath();
  eCtx.arc(128, 128, 120, 0, Math.PI * 2);
  eCtx.fill();

  // Swirling white clouds & green continents
  eCtx.fillStyle = 'rgba(74, 222, 128, 0.7)';
  eCtx.beginPath();
  eCtx.ellipse(100, 110, 45, 30, 0.4, 0, Math.PI * 2);
  eCtx.ellipse(150, 160, 50, 25, -0.3, 0, Math.PI * 2);
  eCtx.fill();

  eCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  eCtx.beginPath();
  eCtx.ellipse(120, 95, 65, 18, 0.2, 0, Math.PI * 2);
  eCtx.ellipse(110, 145, 75, 22, -0.1, 0, Math.PI * 2);
  eCtx.ellipse(80, 70, 35, 12, 0.5, 0, Math.PI * 2);
  eCtx.fill();

  const earthTex = new THREE.CanvasTexture(earthCanvas);
  const earthSpriteMat = new THREE.SpriteMaterial({
    map: earthTex,
    transparent: true
  });
  const earthSprite = new THREE.Sprite(earthSpriteMat);
  earthSprite.scale.set(22, 22, 1);
  earthSprite.position.set(-60, 85, -110);
  group.add(earthSprite);

  // 6. Brilliant Sun Sprite
  const sunCanvas = document.createElement('canvas');
  sunCanvas.width = 128;
  sunCanvas.height = 128;
  const sCtx = sunCanvas.getContext('2d');
  const sGrad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 60);
  sGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  sGrad.addColorStop(0.3, 'rgba(255, 250, 230, 0.8)');
  sGrad.addColorStop(0.7, 'rgba(200, 230, 255, 0.2)');
  sGrad.addColorStop(1, 'rgba(200, 230, 255, 0.0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 128, 128);

  const sunTex = new THREE.CanvasTexture(sunCanvas);
  const sunSpriteMat = new THREE.SpriteMaterial({
    map: sunTex,
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  const sunSprite = new THREE.Sprite(sunSpriteMat);
  sunSprite.scale.set(24, 24, 1);
  sunSprite.position.copy(sunLight.position).normalize().multiplyScalar(150);
  group.add(sunSprite);

  return {
    group,
    setAtmosphericTau: (tau) => ({
      extinctionPercent: 0,
      skyColor: '#010204',
      ambientIntensity: 0.45
    }),
    update: (delta, tau) => {
      // Subtle rotation of Earth
      earthSprite.material.rotation += delta * 0.02;
    }
  };
}

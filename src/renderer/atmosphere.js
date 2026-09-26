import * as THREE from 'three';

// Martian Atmospheric Optics & Beer-Lambert Scattering Shader Simulator
// Implements Sol 5111 Planet-Encircling Dust Event (PEDE) Atmospheric Extinction

export function createMartianAtmosphere(scene) {
  const group = new THREE.Group();
  group.name = "martian_atmosphere";

  // 1. Directional Sun Light (Martian Sun at 1.524 AU)
  const sunLight = new THREE.DirectionalLight(0xffeedd, 1.8);
  sunLight.position.set(25, 35, 20);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 100;
  sunLight.shadow.camera.left = -25;
  sunLight.shadow.camera.right = 25;
  sunLight.shadow.camera.top = 25;
  sunLight.shadow.camera.bottom = -25;
  sunLight.shadow.bias = -0.0005;
  group.add(sunLight);

  // 2. Ambient Light (Martian Sky Rayleigh/Mie scattering)
  const ambientLight = new THREE.AmbientLight(0xbf6336, 0.65);
  group.add(ambientLight);

  // 3. Hemisphere Light (Upper sky vs ground bounce)
  const hemiLight = new THREE.HemisphereLight(0xe58252, 0x5a2412, 0.4);
  group.add(hemiLight);

  // 4. Sky Dome with atmospheric shader
  const skyGeo = new THREE.SphereGeometry(180, 32, 24);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0xc87142,
    side: THREE.BackSide
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  group.add(skyDome);

  // 5. Martian Sun Sprite (Smaller angular diameter from Mars, ~0.35 degrees)
  const sunCanvas = document.createElement('canvas');
  sunCanvas.width = 128;
  sunCanvas.height = 128;
  const sCtx = sunCanvas.getContext('2d');
  const grad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 60);
  grad.addColorStop(0, 'rgba(255, 255, 240, 1.0)');
  grad.addColorStop(0.2, 'rgba(255, 220, 180, 0.8)');
  grad.addColorStop(0.6, 'rgba(220, 130, 80, 0.3)');
  grad.addColorStop(1, 'rgba(200, 100, 50, 0.0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);

  const sunTex = new THREE.CanvasTexture(sunCanvas);
  const sunSpriteMat = new THREE.SpriteMaterial({
    map: sunTex,
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  const sunSprite = new THREE.Sprite(sunSpriteMat);
  sunSprite.scale.set(16, 16, 1);
  sunSprite.position.copy(sunLight.position).normalize().multiplyScalar(150);
  group.add(sunSprite);

  // 6. Volumetric Dust Storm Particle System
  const dustParticleCount = 1800;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustParticleCount * 3);
  const dustVelocities = new Float32Array(dustParticleCount * 3);

  for (let i = 0; i < dustParticleCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 60;
    dustPositions[i * 3 + 1] = Math.random() * 18;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;

    dustVelocities[i * 3] = 0.8 + Math.random() * 1.5; // X drift
    dustVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2; // Y wobble
    dustVelocities[i * 3 + 2] = -0.4 + Math.random() * 0.8; // Z drift
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

  // Dust Particle Sprite
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 32;
  pCanvas.height = 32;
  const pCtx = pCanvas.getContext('2d');
  const pGrad = pCtx.createRadialGradient(16, 16, 2, 16, 16, 15);
  pGrad.addColorStop(0, 'rgba(230, 130, 80, 0.8)');
  pGrad.addColorStop(0.6, 'rgba(180, 80, 40, 0.4)');
  pGrad.addColorStop(1, 'rgba(100, 40, 20, 0.0)');
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 32, 32);
  const pTex = new THREE.CanvasTexture(pCanvas);

  const dustMat = new THREE.PointsMaterial({
    map: pTex,
    size: 0.6,
    transparent: true,
    opacity: 0.35,
    blending: THREE.NormalBlending,
    depthWrite: false
  });

  const dustParticles = new THREE.Points(dustGeo, dustMat);
  group.add(dustParticles);

  // Fog in Scene
  scene.fog = new THREE.FogExp2(0xc87142, 0.012);

  // Real-time calculation of Beer-Lambert Law & atmospheric colors
  function setAtmosphericTau(tau) {
    const clampedTau = Math.max(0.4, Math.min(tau, 11.0));
    
    // Beer-Lambert Law: I = I_0 * exp(-tau / cos(theta))
    const cosTheta = 0.82; // solar zenith ~35 degrees
    const extinctionRatio = Math.exp(-clampedTau / cosTheta);
    
    // Solar irradiance W/m² (nominal Mars TOA ~590 W/m²)
    const solarIrradiance = 590 * extinctionRatio;
    
    // Calculate color shifts
    const normalizedTau = (clampedTau - 0.4) / (10.8 - 0.4); // 0.0 (clear) to 1.0 (blackout)

    // Sun intensity
    sunLight.intensity = Math.max(0.005, 1.8 * Math.pow(extinctionRatio, 0.6));
    
    // Ambient / Hemi lighting
    ambientLight.intensity = Math.max(0.02, 0.65 * (1 - normalizedTau * 0.92));
    hemiLight.intensity = Math.max(0.01, 0.4 * (1 - normalizedTau * 0.95));

    // Sky Dome Color interpolation: Butterscotch -> Muddy Orange -> Dark Umber -> Pitch Storm Black
    let skyR, skyG, skyB;
    if (normalizedTau < 0.5) {
      const t = normalizedTau / 0.5;
      skyR = 0.78 * (1 - t) + 0.45 * t;
      skyG = 0.44 * (1 - t) + 0.22 * t;
      skyB = 0.26 * (1 - t) + 0.12 * t;
    } else {
      const t = (normalizedTau - 0.5) / 0.5;
      skyR = 0.45 * (1 - t) + 0.04 * t;
      skyG = 0.22 * (1 - t) + 0.02 * t;
      skyB = 0.12 * (1 - t) + 0.01 * t;
    }

    skyMat.color.setRGB(skyR, skyG, skyB);
    scene.fog.color.setRGB(skyR, skyG, skyB);
    scene.fog.density = 0.012 + normalizedTau * 0.058;

    // Sun disc opacity & scale
    sunSpriteMat.opacity = Math.max(0.0, 1.0 - normalizedTau * 1.05);

    // Dust particle density & speed
    dustMat.opacity = 0.2 + normalizedTau * 0.75;
    dustMat.size = 0.4 + normalizedTau * 1.2;

    return {
      tau: clampedTau,
      solarIrradiance,
      extinctionPercent: (1 - extinctionRatio) * 100
    };
  }

  // Animate dust drifting in wind
  function update(delta, currentTau = 1.0) {
    const pos = dustGeo.attributes.position;
    const speedMult = 1.0 + (currentTau / 10.8) * 2.5;

    for (let i = 0; i < dustParticleCount; i++) {
      let x = pos.getX(i) + dustVelocities[i * 3] * delta * speedMult;
      let y = pos.getY(i) + dustVelocities[i * 3 + 1] * delta;
      let z = pos.getZ(i) + dustVelocities[i * 3 + 2] * delta * speedMult;

      // Wrap around bounding volume
      if (x > 30) x = -30;
      if (y > 18) y = 0.2;
      if (y < 0.2) y = 18;
      if (z > 30) z = -30;
      if (z < -30) z = 30;

      pos.setXYZ(i, x, y, z);
    }
    dustGeo.attributes.position.needsUpdate = true;
  }

  return {
    group,
    setAtmosphericTau,
    update
  };
}

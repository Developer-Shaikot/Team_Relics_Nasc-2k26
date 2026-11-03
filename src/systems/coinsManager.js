import * as THREE from 'three';
import { martianAudio } from './audio.js';

export class CoinsManager {
  constructor(scene) {
    this.scene = scene;
    this.coins = [];
    this.coinsGroup = new THREE.Group();
    this.coinsGroup.visible = false;
    this.scene.add(this.coinsGroup);

    // Coin balance: Default 1,000 Cosmic Dust Coins as per official game specs
    const storedCoins = localStorage.getItem('jdsn_cosmic_dust');
    if (!storedCoins || storedCoins === '3125' || storedCoins === '3875') {
      this.balance = 1000;
      localStorage.setItem('jdsn_cosmic_dust', '1000');
    } else {
      this.balance = parseInt(storedCoins, 10);
    }
    this.updateDomBalance();

    // Reusable geometry and material
    this.coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 16);
    this.coinGeo.rotateX(Math.PI / 2); // face outward

    this.marsCoinMat = new THREE.MeshStandardMaterial({
      color: 0xffb700,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0xff9900,
      emissiveIntensity: 0.4
    });

    this.moonCoinMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x00b4d8,
      emissiveIntensity: 0.45
    });
  }

  updateDomBalance() {
    const el = document.getElementById('hub-dust-val');
    if (el) el.innerText = this.balance.toLocaleString();
    localStorage.setItem('jdsn_cosmic_dust', this.balance.toString());
  }

  addCoins(amount = 25) {
    this.balance += amount;
    this.updateDomBalance();

    try {
      const activeCmdr = localStorage.getItem('jdsn_selected_commander') || 'asha';
      const key = `jdsn_${activeCmdr}_points`;
      const cur = parseInt(localStorage.getItem(key) || (activeCmdr === 'asha' ? '3250' : '3410'), 10);
      localStorage.setItem(key, (cur + amount).toString());
      window.dispatchEvent(new CustomEvent('commanderPointsUpdated'));
    } catch (e) {}

    this.showFloatingPickupText(`+${amount} Cosmic Dust 🪙`);
  }

  spendCoins(amount) {
    if (this.balance >= amount) {
      this.balance -= amount;
      this.updateDomBalance();
      return true;
    }
    return false;
  }

  clearCoins() {
    while (this.coinsGroup.children.length > 0) {
      const obj = this.coinsGroup.children[0];
      this.coinsGroup.remove(obj);
    }
    this.coins = [];
    this.coinsGroup.visible = false;
  }

  spawnCoinsForPlanet(planet, getTerrainHeightFn) {
    this.clearCoins();
    // No arcade coins in interstellar deep space (maintains scientific authenticity)
    if (planet === 'deepspace') {
      this.coinsGroup.visible = false;
      return;
    }
    this.coinsGroup.visible = true;

    const mat = planet === 'moon' ? this.moonCoinMat : this.marsCoinMat;
    const count = 18;
    const spread = 45;

    for (let i = 0; i < count; i++) {
      // Scatter in clusters along paths
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const radius = 6 + Math.random() * spread;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = getTerrainHeightFn ? getTerrainHeightFn(x, z) + 0.65 : 0.65;

      const mesh = new THREE.Mesh(this.coinGeo, mat);
      mesh.position.set(x, y, z);

      // Inner icon / detail ring
      const ringGeo = new THREE.RingGeometry(0.18, 0.32, 12);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = 0.055;
      mesh.add(ring);

      const coinData = {
        mesh,
        baseY: y,
        collected: false,
        phase: Math.random() * Math.PI * 2,
        value: 25
      };

      this.coins.push(coinData);
      this.coinsGroup.add(mesh);
    }
  }

  update(delta, elapsedTime, roverPosition) {
    if (!roverPosition) return;

    for (let i = 0; i < this.coins.length; i++) {
      const c = this.coins[i];
      if (c.collected) continue;

      // Spin and bob
      c.mesh.rotation.y += 2.4 * delta;
      c.mesh.position.y = c.baseY + Math.sin(elapsedTime * 3.5 + c.phase) * 0.14;

      // Check distance to rover
      const dist = roverPosition.distanceTo(c.mesh.position);
      if (dist < 1.9) {
        c.collected = true;
        this.collectCoin(c);
      }
    }
  }

  collectCoin(coinData) {
    martianAudio.playScannerBeep(true);
    this.addCoins(coinData.value);

    // Collection animation: expand & fade out
    const mesh = coinData.mesh;
    const startTime = Date.now();
    const anim = () => {
      const elapsed = (Date.now() - startTime) / 300;
      if (elapsed < 1.0) {
        mesh.scale.setScalar(1.0 + elapsed * 1.5);
        mesh.position.y += 0.05;
        requestAnimationFrame(anim);
      } else {
        this.coinsGroup.remove(mesh);
      }
    };
    anim();
  }

  showFloatingPickupText(text) {
    const toast = document.createElement('div');
    toast.className = 'coin-pickup-toast';
    toast.innerText = text;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-up');
    }, 20);

    setTimeout(() => {
      toast.remove();
    }, 1800);
  }
}


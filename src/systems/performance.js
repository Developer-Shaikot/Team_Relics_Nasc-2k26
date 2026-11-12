// Device-aware rendering quality + adaptive resolution, so the game stays smooth on
// phones (browser and Android app) without making desktop look worse.
//
// - Picks a quality tier once at startup: 'high' (desktop), 'medium' (phones/tablets),
//   'low' (weak phones: ≤ 4 GB RAM or ≤ 4 CPU cores).
// - Each tier sets the starting/maximum pixel ratio, antialiasing, shadow quality and
//   particle counts used by the renderers.
// - AdaptiveResolution watches real frame times and lowers the render resolution when
//   the device can't keep up (and raises it again when there is headroom).
// - Adds `perf-lite` to <html> on phones so CSS can drop GPU-heavy effects (backdrop blur).

const nav = typeof navigator !== 'undefined' ? navigator : {};
const isTouch =
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(pointer: coarse)').matches || (nav.maxTouchPoints || 0) > 0);
const isNativeApp = typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();
const smallScreen = typeof window !== 'undefined' && Math.min(screen.width, screen.height) <= 820;
const weakDevice = (nav.deviceMemory && nav.deviceMemory <= 4) || (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4);

const mobile = isNativeApp || (isTouch && smallScreen);
export const QUALITY_TIER = mobile ? (weakDevice ? 'low' : 'medium') : 'high';

const TIERS = {
  high: { maxPixelRatio: 2, minPixelRatio: 1, antialias: true, shadows: true, softShadows: true, shadowMapSize: 2048, particleScale: 1 },
  medium: { maxPixelRatio: 1.5, minPixelRatio: 0.75, antialias: false, shadows: true, softShadows: false, shadowMapSize: 1024, particleScale: 0.5 },
  low: { maxPixelRatio: 1.15, minPixelRatio: 0.6, antialias: false, shadows: false, softShadows: false, shadowMapSize: 512, particleScale: 0.35 },
};

export const PERF = { tier: QUALITY_TIER, isMobile: mobile, ...TIERS[QUALITY_TIER] };

/** Particle count scaled for the device tier (never below `min`). */
export const scaledCount = (count, min = 100) => Math.max(min, Math.round(count * PERF.particleScale));

/** Starting pixel ratio for a renderer on this device. */
export const startPixelRatio = () => Math.min(window.devicePixelRatio || 1, PERF.maxPixelRatio);

if (typeof document !== 'undefined' && mobile) {
  document.documentElement.classList.add('perf-lite');
}

/**
 * Lowers the renderer's pixel ratio when frames are slow and raises it back when fast.
 * Call `tick(deltaSeconds)` once per rendered frame.
 */
export class AdaptiveResolution {
  constructor(renderer, { onChange } = {}) {
    this.renderer = renderer;
    this.onChange = onChange;
    this.ceiling = startPixelRatio();
    this.ratio = this.ceiling;
    this.samples = 0;
    this.total = 0;
    this.cooldown = 0;
    renderer.setPixelRatio(this.ratio);
  }

  /** Re-read the ceiling (devicePixelRatio may change on rotate / window move). */
  refreshCeiling() {
    this.ceiling = startPixelRatio();
    if (this.ratio > this.ceiling) this.apply(this.ceiling);
  }

  apply(ratio) {
    const next = Math.round(Math.max(PERF.minPixelRatio, Math.min(this.ceiling, ratio)) * 100) / 100;
    if (next === this.ratio) return;
    this.ratio = next;
    this.renderer.setPixelRatio(next);
    this.onChange?.(next);
  }

  tick(delta) {
    // Ignore hitches from tab switches / scene loads
    if (!(delta > 0) || delta > 0.25) return;
    if (this.cooldown > 0) {
      this.cooldown -= delta;
      return;
    }
    this.total += delta;
    this.samples++;
    if (this.total < 1.5) return; // judge over ~1.5 s windows

    const avgMs = (this.total / this.samples) * 1000;
    this.total = 0;
    this.samples = 0;

    if (avgMs > 20 && this.ratio > PERF.minPixelRatio) {
      // Under ~50 fps: drop resolution 15%
      this.apply(this.ratio * 0.85);
      this.cooldown = 1;
    } else if (avgMs < 17.2 && this.ratio < this.ceiling) {
      // Comfortably ~57+ fps: try a bit sharper
      this.apply(this.ratio * 1.08);
      this.cooldown = 3;
    }
  }
}

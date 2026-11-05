// Keeps the onboarding wizard modal fully on screen at every viewport size.
// The modal body never scrolls: when the active step panel is taller than the
// available space, the whole panel is scaled down uniformly until it fits.
//
// The panel keeps its natural layout width (so text wrapping and 16:9 video
// heights don't change) and CSS zoom shrinks it as a picture would shrink.
// Sizes come from offsetHeight/clientHeight, which ignore CSS transforms, so the
// modal's open animation (scale 0.96) can't skew the measurement.

const MIN_ZOOM = 0.4;

export function installWizardFit() {
  const backdrop = document.getElementById('aqua-guided-modal-backdrop');
  const body = backdrop?.querySelector('.aqua-modal-body');
  if (!backdrop || !body) return;

  let frame = 0;
  let observer = null;

  const fit = () => {
    frame = 0;
    if (getComputedStyle(backdrop).display === 'none') return;
    const panel = body.querySelector('.aqua-step-panel.active');
    if (!panel) return;

    // Reset so the panel lays out at its natural size and the body grows to its full flex height.
    panel.style.zoom = '';
    panel.style.width = '';

    const cs = getComputedStyle(body);
    const availH = body.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const availW = body.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const naturalH = panel.offsetHeight;

    if (availH > 0 && naturalH > availH + 1) {
      // Rendered-height / available-height. Both rects carry the same open-animation transform,
      // so the ratio stays correct mid-animation.
      const bodyH = body.getBoundingClientRect().height;
      const overflowRatio = () => panel.getBoundingClientRect().height / (bodyH * (availH / body.clientHeight));

      // 1) Fill-width mode: shrink, and let the panel reflow wider so it uses the full modal width
      //    (no empty side gutters). Converges for text/card layouts.
      let zoom = Math.max(MIN_ZOOM, (availH / naturalH) * 0.99);
      for (let i = 0; i < 6; i++) {
        panel.style.zoom = String(zoom);
        const r = overflowRatio();
        if (r <= 1.005) break;
        zoom = Math.max(MIN_ZOOM, zoom / r * 0.99);
      }

      // 2) Width-locked mode: aspect-ratio content (16:9 video) grows as it widens, so fill-width
      //    can't converge. Keep the natural layout width and shrink it like a picture instead.
      if (overflowRatio() > 1.005) {
        panel.style.width = `${availW}px`;
        panel.style.zoom = String(Math.max(MIN_ZOOM, (availH / naturalH) * 0.99));
      }
    }

    body.classList.toggle('aqua-fit-overflow', panel.getBoundingClientRect().height > body.getBoundingClientRect().height);
    // Drop the mutations caused by our own writes so they don't re-trigger a fit.
    observer?.takeRecords();
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(fit);
  };

  window.addEventListener('resize', schedule);
  const resizeObserver = new ResizeObserver(schedule);
  resizeObserver.observe(body);
  // Panel content can change height on its own (fonts, video metadata, captions).
  body.querySelectorAll('.aqua-step-panel').forEach((p) => resizeObserver.observe(p));

  // Step switches, open/close, language toggle and dynamic text all show up as DOM mutations.
  observer = new MutationObserver(schedule);
  observer.observe(backdrop, {
    attributes: true,
    attributeFilter: ['class', 'style'],
    childList: true,
    characterData: true,
    subtree: true,
  });
  document.fonts?.ready.then(schedule);
  backdrop.addEventListener('load', schedule, true);
  backdrop.addEventListener('loadedmetadata', schedule, true);
  backdrop.addEventListener('animationend', schedule, true);

  window.fitAquaWizard = schedule;
  schedule();
}

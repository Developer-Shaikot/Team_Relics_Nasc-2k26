// Site-wide Hover Stabilizer
// ---------------------------------------------------------------------------
// Problem: many elements lift / slide on :hover (transform: translateY(-4px) ...).
// With the cursor near the edge they move out from under it -> :hover is lost ->
// element drops back under the cursor -> :hover again ... a rapid flicker loop that
// also re-fires mouseenter (and its sounds) many times per second.
//
// Fix (generic, covers every current and future :hover rule):
//  1. Every `:hover` CSS rule gets a twin that also matches `.hover-hold`.
//  2. When the mouse enters an element it (and its ancestors) get `.hover-hold` and
//     their ORIGINAL (untransformed) box is remembered.
//  3. `.hover-hold` is only removed once the pointer is outside BOTH the current box
//     and the original box, so a lifted element can't flicker at its edge.
//  4. Stable `hoverstart` / `hoverend` events (non-bubbling, like mouseenter/leave)
//     fire exactly once per real enter/leave. Use them instead of mouseenter/leave.

const HOLD = 'hover-hold';
const PAD = 2; // px tolerance around the original box
const held = new Map(); // element -> original DOMRect
let lastX = -1;
let lastY = -1;
let rafPending = false;
let installed = false;

function inRect(r, x, y, pad = PAD) {
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
}

function release(el) {
  if (!held.has(el)) return;
  held.delete(el);
  el.classList.remove(HOLD);
  el.dispatchEvent(new CustomEvent('hoverend', { bubbles: false }));
}

function stillInside(el, x, y) {
  if (!el.isConnected) return false;
  if (el.matches(':hover')) return true; // genuinely under the pointer
  // Not hovered natively: keep it only if the pointer is in the strip the element
  // vacated by moving (inside its original box but outside its current box).
  // Inside the current box but not :hover means something else covers it -> release.
  const orig = held.get(el);
  // (exact current box, no tolerance: the pointer just below a lifted edge is "vacated strip")
  return !!orig && inRect(orig, x, y) && !inRect(el.getBoundingClientRect(), x, y, -0.5);
}

function prune() {
  rafPending = false;
  // Release children before parents so hoverend order matches mouseleave
  [...held.keys()].reverse().forEach(el => {
    if (!stillInside(el, lastX, lastY)) release(el);
  });
}

function schedulePrune() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(prune);
}

function onPointerOver(e) {
  if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
  lastX = e.clientX;
  lastY = e.clientY;
  // Collect ancestors outermost-first so hoverstart order matches mouseenter
  const chain = [];
  for (let el = e.target; el && el instanceof Element && el !== document.documentElement; el = el.parentElement) {
    if (!held.has(el)) chain.push(el);
  }
  chain.reverse().forEach(el => {
    held.set(el, el.getBoundingClientRect());
    el.classList.add(HOLD);
    el.dispatchEvent(new CustomEvent('hoverstart', { bubbles: false }));
  });
  schedulePrune();
}

function onPointerMove(e) {
  if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
  lastX = e.clientX;
  lastY = e.clientY;
  if (held.size) schedulePrune();
}

function releaseAll() {
  [...held.keys()].reverse().forEach(release);
}

// Duplicate every :hover rule as a .hover-hold rule (one rule per selector so a single
// unsupported selector, e.g. ::-webkit-scrollbar-thumb:hover, can't break the rest).
function mirrorRules(ruleList, target) {
  const additions = [];
  for (const rule of Array.from(ruleList)) {
    if (rule.cssRules && !(rule instanceof CSSStyleRule)) {
      mirrorRules(rule.cssRules, rule); // @media / @supports / @layer
      continue;
    }
    if (!(rule instanceof CSSStyleRule) || !rule.selectorText.includes(':hover')) continue;
    rule.selectorText.split(/,(?![^(]*\))/).forEach(sel => {
      // Skip :not(:hover)-style selectors: mirroring would invert their meaning
      if (!sel.includes(':hover') || /:not\([^)]*:hover/.test(sel)) return;
      additions.push(`${sel.replace(/:hover/g, '.' + HOLD)} { ${rule.style.cssText} }`);
    });
  }
  additions.forEach(text => {
    try { target.insertRule(text, target.cssRules.length); } catch (e) { /* invalid selector variant */ }
  });
}

function mirrorSheet(sheet) {
  if (!sheet || sheet.__hoverMirrored) return;
  let rules;
  try { rules = sheet.cssRules; } catch (e) { return; } // cross-origin (Google Fonts)
  if (!rules) return;
  sheet.__hoverMirrored = true;
  mirrorRules(rules, sheet);
}

function mirrorAllSheets() {
  Array.from(document.styleSheets).forEach(mirrorSheet);
}

export function installHoverStabilizer() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  mirrorAllSheets();
  // Stylesheets that load later (link onload, Vite HMR <style> updates)
  new MutationObserver(() => mirrorAllSheets()).observe(document.head, { childList: true, subtree: true, characterData: true });
  document.addEventListener('load', (e) => { if (e.target?.sheet) mirrorSheet(e.target.sheet); }, true);
  window.addEventListener('load', mirrorAllSheets);

  document.addEventListener('pointerover', onPointerOver, { capture: true, passive: true });
  document.addEventListener('pointermove', onPointerMove, { capture: true, passive: true });
  // Layout shifts under a still cursor: re-check against fresh positions
  // Content scrolled under a still cursor: remembered boxes are stale, so keep only what
  // is still under the pointer and re-base its box.
  window.addEventListener('scroll', () => {
    [...held.keys()].reverse().forEach(el => {
      const r = el.getBoundingClientRect();
      if (inRect(r, lastX, lastY)) held.set(el, r);
      else release(el);
    });
  }, { capture: true, passive: true });
  document.documentElement.addEventListener('pointerleave', releaseAll);
  window.addEventListener('blur', releaseAll);
}

// Helper: stable hover listeners for an element (drop-in for mouseenter/mouseleave)
export function onStableHover(el, enter, leave) {
  if (!el) return;
  if (enter) el.addEventListener('hoverstart', enter);
  if (leave) el.addEventListener('hoverend', leave);
}

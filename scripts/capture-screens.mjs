// Captures real screenshots of the current game build via headless Chrome (CDP over pipe).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const page = 'file:///' + path.resolve('dist-shot', 'index.html').replace(/\\/g, '/');
const outDir = path.resolve('documentation', 'images', 'game');
fs.mkdirSync(outDir, { recursive: true });
const profile = path.join(os.tmpdir(), 'relics-shot-profile-' + Date.now());

const proc = spawn(chrome, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox', '--enable-unsafe-swiftshader',
  '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files',
  '--autoplay-policy=no-user-gesture-required', '--window-size=1440,810',
  `--user-data-dir=${profile}`, '--remote-debugging-pipe', 'about:blank'
], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });

const toChrome = proc.stdio[3];
const fromChrome = proc.stdio[4];
let buf = '';
let id = 0;
const pending = new Map();
fromChrome.on('data', (d) => {
  buf += d.toString('utf8');
  let i;
  while ((i = buf.indexOf('\0')) >= 0) {
    const msg = JSON.parse(buf.slice(0, i));
    buf = buf.slice(i + 1);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  }
});
const send = (method, params = {}, sessionId) => new Promise((res) => {
  const myId = ++id;
  pending.set(myId, res);
  toChrome.write(JSON.stringify({ id: myId, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0');
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (m, p) => send(m, p, sessionId);

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 810, deviceScaleFactor: 1, mobile: false });

const ev = async (expr) => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) console.log('  eval error:', expr.slice(0, 70), r.result.exceptionDetails.exception?.description?.slice(0, 160));
  return r.result?.result?.value;
};
const shot = async (name, wait = 1500) => {
  await sleep(wait);
  const r = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync(path.join(outDir, name), Buffer.from(r.result.data, 'base64'));
  console.log('saved', name);
};
const key = (type, k, code, vk) => cdp('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
const closeModals = () => ev(`document.querySelectorAll('.modal-backdrop.active').forEach(function(m){m.classList.remove('active')})`);
const distNow = () => ev(`parseFloat((document.getElementById('waypoint-dist-val')||{}).innerText)`);

// Drive with W, release early and coast, nudge if short, so we stop inside scan range (<= 4.5 m).
async function driveToRelic(tag) {
  await key('rawKeyDown', 'w', 'KeyW', 87);
  let held = true;
  let reached = false;
  for (let i = 0; i < 400 && !reached; i++) {
    await sleep(250);
    const d = await distNow();
    if (i === 12) await shot(tag + 'b_driving.jpg', 0);
    if (held && d && d <= 9) { await key('keyUp', 'w', 'KeyW', 87); held = false; }
    if (!held) {
      await sleep(900);
      const d2 = await distNow();
      if (d2 && d2 <= 4.5) { reached = true; break; }
      await key('rawKeyDown', 'w', 'KeyW', 87); await sleep(350); await key('keyUp', 'w', 'KeyW', 87);
    }
  }
  if (held) await key('keyUp', 'w', 'KeyW', 87);
  return reached;
}

await cdp('Page.navigate', { url: page });
await sleep(5000);
await ev(`localStorage.clear(); location.reload();`);
await sleep(5000);

// ---- Splash & onboarding ----
await shot('01_splash.jpg', 800);
await ev(`window.dismissAquaSplash && window.dismissAquaSplash()`);
await shot('02_onboarding_story.jpg', 1200);
await ev(`window.setAquaStep && window.setAquaStep(2)`);
await shot('03_onboarding_step2.jpg', 1000);
await ev(`window.setAquaStep && window.setAquaStep(3)`);
await shot('03b_onboarding_video.jpg', 1000);
await ev(`window.setAquaStep && window.setAquaStep(4)`);
await shot('04_onboarding_bots.jpg', 800);
await ev(`window.setAquaStep && window.setAquaStep(5)`);
await shot('04b_onboarding_levels.jpg', 800);

// ---- Hub ----
await ev(`window.completeOnboardingToHub ? window.completeOnboardingToHub() : window.openGameHub()`);
await ev(`window.setHeroEngineMode && window.setHeroEngineMode(false)`);
await shot('05_game_hub.jpg', 4000);
await ev(`document.getElementById('portal-explore-mars')?.dispatchEvent(new MouseEvent('mouseenter'))`);
await shot('05b_hub_hover_mars.jpg', 3000);
await ev(`document.getElementById('btn-arcade-menu')?.click()`);
await shot('05c_hub_menu_drawer.jpg', 1200);
await ev(`document.querySelectorAll('.drawer-backdrop.active, .hub-drawer-backdrop.active').forEach(function(m){m.classList.remove('active')}); document.getElementById('btn-close-hub-sidebar')?.click();`);
await ev(`window.profileManager?.openProfileSwitcherModal()`);
await shot('05d_cadet_registry.jpg', 1200);
await ev(`document.getElementById('btn-close-profile-modal')?.click()`);
await closeModals();
await sleep(800);

// ---- Moon: real driving until the relic is in scan range ----
await ev(`window.launchExpedition('moon')`);
await shot('06_moon_surface.jpg', 5000);
let reached = await driveToRelic('06');
console.log('moon reached:', reached);
await shot('06c_moon_scan_prompt.jpg', 800);
await key('rawKeyDown', 'e', 'KeyE', 69);
await key('keyUp', 'e', 'KeyE', 69);
await shot('06d_moon_scan_info.jpg', 2500);
await ev(`document.getElementById('modal-dismiss-btn')?.click()`);
await shot('06e_moon_discovery.jpg', 2000);
await closeModals();

// ---- Mars ----
await ev(`window.openGameHub()`);
await sleep(1500);
await ev(`window.launchExpedition('mars')`);
await shot('07_mars_surface.jpg', 5000);
reached = await driveToRelic('07');
console.log('mars reached:', reached);
await shot('07c_mars_scan_prompt.jpg', 800);
await key('rawKeyDown', 'e', 'KeyE', 69);
await key('keyUp', 'e', 'KeyE', 69);
await shot('07d_mars_scan_info.jpg', 2500);
await ev(`document.getElementById('modal-dismiss-btn')?.click()`);
await shot('07e_mars_discovery.jpg', 2000);
await closeModals();

// ---- Roadmaps ----
await ev(`document.getElementById('open-missions-btn')?.click()`);
await shot('08_mission_roadmap.jpg', 1500);
await closeModals();

// ---- Voyager ----
await ev(`window.openGameHub()`);
await sleep(1500);
await ev(`window.launchExpedition('deepspace')`);
await shot('09_voyager_deep_space.jpg', 5000);

// ---- JPL labs (all four) ----
await ev(`document.getElementById('open-minigames-tab-btn')?.click()`);
await sleep(1200);
const labs = [['apollo11', '10a_lab_apollo11.jpg'], ['opportunity', '10b_lab_opportunity.jpg'], ['insight', '10c_lab_insight.jpg'], ['voyager1', '10d_lab_voyager1.jpg']];
for (const [k, f] of labs) {
  await ev(`(document.querySelector('.mg-tab-pill[data-mg="${k}"]')||{click(){}}).click()`);
  await shot(f, 1500);
}
await closeModals();

// ---- Quiz ----
await ev(`document.getElementById('drawer-nav-quiz')?.click()`);
await shot('11_quiz.jpg', 1500);
await closeModals();

await cdp('Browser.close').catch(() => {});
proc.kill();
console.log('done');
process.exit(0);

// Exports scripts/media/story-film/story-film.html to public/videos/relics-story.mp4 (H.264 + AAC, constant 30 fps)
// plus a poster image. Runs a headless Edge/Chrome over the DevTools protocol; frames are encoded one by one
// with WebCodecs and packed with the mp4-muxer dev dependency, so the result never stutters.
//
//   node scripts/media/render-story-film.mjs            -> export the film + poster
//   node scripts/media/render-story-film.mjs --stills   -> only save preview JPGs to scripts/media/story-film/stills
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = path.join(root, 'public', 'videos');
const stillsOnly = process.argv.includes('--stills');

// Tiny static server for the film page and node_modules/mp4-muxer (ES modules cannot load from file://)
const types = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const pageUrl = `http://127.0.0.1:${server.address().port}/scripts/media/story-film/story-film.html`;
const browsers = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'
].filter(Boolean);
const exe = browsers.find(p => fs.existsSync(p));
if (!exe) throw new Error('No Chrome/Edge found. Set BROWSER=/path/to/chrome');

const port = 9333;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'story-film-'));
const proc = spawn(exe, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--window-size=1280,900', '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows', '--autoplay-policy=no-user-gesture-required', 'about:blank'
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const p = list.find(t => t.type === 'page');
      if (p) return p.webSocketDebuggerUrl;
    } catch { /* browser still starting */ }
    await sleep(200);
  }
  throw new Error('Browser did not open a debugging port');
}

const ws = new WebSocket(await target());
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let nextId = 1; const pending = new Map();
ws.addEventListener('message', e => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, m => m.error ? reject(new Error(m.error.message)) : resolve(m.result));
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};

try {
  await send('Page.enable');
  await send('Page.navigate', { url: pageUrl });
  for (let i = 0; i < 50 && !(await evaluate('typeof window.encodeFilm === "function"').catch(() => false)); i++) await sleep(100);

  if (stillsOnly) {
    const dir = path.join(root, 'scripts', 'media', 'story-film', 'stills');
    fs.mkdirSync(dir, { recursive: true });
    const times = (process.argv.find(a => a.startsWith('--at=')) || '--at=5,10,13,19,21,26,31,35,41,45,48,51,57,59,66,70,75').slice(5).split(',').map(Number);
    for (const t of times) {
      const url = await evaluate(`window.posterDataURL(${t})`);
      fs.writeFileSync(path.join(dir, `t${String(t).padStart(2, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
    }
    console.log(`Saved ${times.length} stills to ${dir}`);
  } else {
    const dur = await evaluate('window.STORY_DURATION');
    console.log(`Encoding ${dur}s frame by frame…`);
    const { mimeType, frames, bytes } = await evaluate('window.encodeFilm(30)');
    const parts = [];
    for (let i = 0; ; i += 4_000_000) {
      const part = await evaluate(`window.__filmB64.slice(${i}, ${i + 4_000_000})`);
      if (!part) break;
      parts.push(part);
    }
    fs.mkdirSync(outDir, { recursive: true });
    const file = path.join(outDir, 'relics-story.mp4');
    fs.writeFileSync(file, Buffer.from(parts.join(''), 'base64'));
    const poster = await evaluate('window.posterDataURL(5.6)');
    fs.writeFileSync(path.join(outDir, 'relics-story-poster.jpg'), Buffer.from(poster.split(',')[1], 'base64'));
    console.log(`Wrote ${file} (${mimeType}, ${frames} frames, ${(bytes / 1e6).toFixed(1)} MB) and relics-story-poster.jpg`);
  }
} finally {
  ws.close();
  proc.kill();
  server.close();
  await sleep(1500);
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch { /* temp profile still locked; harmless */ }
}

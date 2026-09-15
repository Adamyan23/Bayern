// Шаг 1: копирует исходники из media/ в assets/img/{portfolio,brands}/<id>/ и оптимизирует.
//   - расширение файла = реальный формат (в media многие .png на деле JPEG/WebP);
//   - PNG-фото > 150 КБ и любые фото шире 1400px → WebP (через headless Chrome, нужен локальный сервер);
//   - пишет tools/cards/manifest.json: путь в media → путь на сайте.
//
// Запуск (из корня проекта, при запущенном `python -m http.server 5500`):
//   node tools/cards/assets.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const PORTFOLIO = require('./portfolio.cjs');
const { BRANDS, layersFor } = require('./brands.cjs');
const SERVER = process.env.BAYERN_SERVER || 'http://localhost:5500';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const MAX_W = 1400;

const sniff = (b) => b[0] === 0x89 ? 'png' : b[0] === 0xff ? 'jpg' : b.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : b.toString('ascii', 4, 12).includes('ftypavif') ? 'avif' : b.toString('utf8', 0, 300).includes('<svg') ? 'svg' : 'bin';

const jobs = [];
for (const c of PORTFOLIO) for (const l of c.layers) if (l.src) jobs.push({ group: 'portfolio', id: c.id, src: l.src, photo: !!l.photo });
for (const b of BRANDS) for (const l of layersFor(b)) if (l.src) jobs.push({ group: 'brands', id: b.id, src: l.src, photo: true });

// headless Chrome для конвертации
const port = 9500 + Math.floor(Math.random() * 90);
const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${fs.mkdtempSync(path.join(os.tmpdir(), 'bayern-cards-'))}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, opened;
for (let i = 0; i < 60 && !ws; i++) {
  try {
    const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    const p = l.find((t) => t.type === 'page');
    if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); opened = new Promise((r) => ws.addEventListener('open', r, { once: true })); break; }
  } catch {}
  await sleep(200);
}
if (!ws) throw new Error('не удалось запустить Chrome');
await opened;
let n = 0; const pend = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++n; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.navigate', { url: SERVER + '/index.html' });
await sleep(1200);
async function convert(url, maxW) {
  const r = await send('Runtime.evaluate', { returnByValue: true, awaitPromise: true, expression: `(async()=>{const i=new Image();i.src=${JSON.stringify(url)};await i.decode();const s=Math.min(1,${maxW}/i.naturalWidth);const c=document.createElement('canvas');c.width=Math.round(i.naturalWidth*s);c.height=Math.round(i.naturalHeight*s);c.getContext('2d').drawImage(i,0,0,c.width,c.height);return [c.toDataURL('image/webp',0.88),i.naturalWidth]})()` });
  if (r.result.exceptionDetails) throw new Error('convert ' + url);
  const [data, w] = r.result.result.value;
  return { buf: Buffer.from(data.split(',')[1], 'base64'), w };
}
async function width(url) {
  const r = await send('Runtime.evaluate', { returnByValue: true, awaitPromise: true, expression: `(async()=>{const i=new Image();i.src=${JSON.stringify(url)};await i.decode();return i.naturalWidth})()` });
  return r.result.result.value;
}

const manifest = {};
for (const j of jobs) {
  const key = `${j.group}:${j.src}`;
  if (manifest[key]) continue;
  const buf = fs.readFileSync(path.join(ROOT, 'media', j.src));
  const kind = sniff(buf);
  const base = path.basename(j.src).replace(/\.[^.]+$/, '').toLowerCase().replace(/_/g, '-');
  const dir = path.join(ROOT, 'assets/img', j.group, j.id);
  fs.mkdirSync(dir, { recursive: true });
  const url = SERVER + '/media/' + j.src.split('/').map(encodeURIComponent).join('/');
  let out = `${base}.${kind}`, data = buf;
  if (kind !== 'svg') {
    const w = await width(url);
    const maxW = j.photo ? MAX_W : 900; // логотипы достаточно 900px
    if (w > maxW || kind === 'avif' || (j.photo && kind === 'png' && buf.length > 150 * 1024) || (j.photo && buf.length > 250 * 1024)) {
      data = (await convert(url, maxW)).buf; out = `${base}.webp`;
    }
  }
  fs.writeFileSync(path.join(dir, out), data);
  manifest[key] = `assets/img/${j.group}/${j.id}/${out}`;
  console.log(key.padEnd(44), kind.padEnd(5), '→', manifest[key], Math.round(data.length / 1024) + 'KB');
}
fs.writeFileSync(path.join(HERE, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
ws.close(); proc.kill();

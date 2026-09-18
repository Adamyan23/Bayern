// Нарезает PNG целого шаблона (экспорт всей доски из Figma) на готовые коллажи сайта.
// Запуск (нужен сервер: python -m http.server 5500 из корня проекта и Google Chrome):
//   node tools/figma/crop.mjs "media/4-brands 1.png"      tools/figma/templates/4-brands.svg
//   node tools/figma/crop.mjs "media/3-industries 1.png"  tools/figma/templates/3-industries.svg
//
// Координаты фреймов берутся из SVG-шаблона (PNG должен быть экспортом всей доски в 1x).
// Каждый фрейм становится одной картинкой WebP с прозрачностью:
//   brand-<id>      → assets/img/photos/brands/<id>.webp
//   industries-0N   → assets/img/photos/industries/0N.webp
// Отдельные слоты (Hero, О компании) — каждый слот в свой JPG:
//   hero            → assets/img/photos/hero/hero.jpg
//   about-N         → assets/img/photos/about/about-N.jpg
//   (полосы серого слота/подложки по краям, если фото не дотянули до края, обрезаются)
// Плитки обрезаются точно по слотам шаблона: промежутки между ними прозрачные (на сайте у каждой
// плитки своя тень), верхний правый угол срезан. Если фото занимает несколько слотов — промежуток под
// ним остаётся. Полосы холста Figma у края фрейма заполняются продолжением соседнего фото.
// Подписи слотов (tag …), если их не скрыли перед экспортом, стираются: в рамке подписи ищутся пиксели
// цвета #26373F и их сглаженные края, затем заполняются цветом соседних пикселей.
// Надёжнее — скрыть слои tag в Figma перед экспортом.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [png, svgPath] = process.argv.slice(2);
if (!png || !svgPath) { console.error('usage: node tools/figma/crop.mjs <png> <svg>'); process.exit(1); }
const svg = fs.readFileSync(path.resolve(ROOT, svgPath), 'utf8');
const num = (tag, a) => +tag.match(new RegExp(`\\s${a}="([\\d.]+)"`))[1];

const frames = [...svg.matchAll(/<rect id="frame ([^"]+)"[^>]*>/g)].map(([tag, id]) => ({ id, x: num(tag, 'x'), y: num(tag, 'y'), w: num(tag, 'width'), h: num(tag, 'height') }));
const tags = [...svg.matchAll(/<text id="tag ([^"]+)"([^>]*)>([^<]*)</g)].map(([, name, attrs, text]) => {
  const size = num(attrs, 'font-size'), bx = num(attrs, 'x'), by = num(attrs, 'y');
  return { name, text: text.replace(/&amp;/g, '&'), size, bx, by, x: bx, y: by - size };
});
const slots = [...svg.matchAll(/<rect id="([a-z0-9-]+)"([^>]*)>/g)].filter(([, id]) => id !== 'background')
  .map(([, id, attrs]) => ({ id, x: num(attrs, 'x'), y: num(attrs, 'y'), w: num(attrs, 'width'), h: num(attrs, 'height') }));
const target = (id) => {
  let m = id.match(/^brand-([a-z-]+)$/); if (m) return `brands/${m[1]}.webp`;
  m = id.match(/^industries-(\d\d)$/); if (m) return `industries/${m[1]}.webp`;
  return null;
};
const inside = (r, f) => r.x >= f.x && r.y >= f.y && r.x + r.w <= f.x + f.w && r.y + r.h <= f.y + f.h;
const CUT = { brands: 56, industries: 72 };
const OVERRIDES = createRequire(import.meta.url)('./overrides.cjs'); // ручная сборка плиток, см. overrides.cjs
const jobs = frames.map((f) => ({ ...f, out: target(f.id), ov: OVERRIDES[f.id] || null, cut: CUT[(target(f.id) || '').split('/')[0]] || 0,
  slots: slots.filter((r) => inside(r, f)).map((r) => [r.x - f.x, r.y - f.y, r.w, r.h]), tags: tags.filter((t) => t.x >= f.x - 8 && t.y >= f.y - 8 && t.x < f.x + f.w && t.y < f.y + f.h) })).filter((j) => j.out);

const SLOT_TARGET = (id) => id === 'hero' ? 'hero/hero.jpg' : (id.match(/^about-([1-3])$/) ? `about/${id}.jpg` : null);
const slotJobs = slots.map((r) => ({ ...r, out: SLOT_TARGET(r.id) })).filter((r) => r.out);

const port = 9600 + Math.floor(Math.random() * 300);
const proc = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${fs.mkdtempSync(path.join(os.tmpdir(), 'bzc-'))}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); let ws;
for (let i = 0; i < 60 && !ws; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const p = l.find((t) => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} if (!ws) await sleep(200); }
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let n = 0; const pend = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++n; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.navigate', { url: 'http://localhost:5500/index.html' }); await sleep(1000);

const expr = `(async()=>{
  const img=new Image(); img.src=${JSON.stringify('/' + png.split('/').map(encodeURIComponent).join('/'))}; await img.decode();
  const bc0=document.createElement('canvas').getContext('2d'); bc0.drawImage(img,2,2,1,1,0,0,1,1); const BOARD=[...bc0.getImageData(0,0,1,1).data].slice(0,3);
  const JOBS=${JSON.stringify(jobs)};
  // Фреймы в Figma могли сдвинуться — ищем их реальное положение: полосы содержимого на фоне холста
  {
    const BW=img.naturalWidth, BH=img.naturalHeight;
    const bc=document.createElement('canvas'); bc.width=BW; bc.height=BH;
    const bg2=bc.getContext('2d',{willReadFrequently:true}); bg2.drawImage(img,0,0);
    const BD=bg2.getImageData(0,0,BW,BH).data;
    const isBoard=(x,y)=>{const i=(y*BW+x)*4;return Math.abs(BD[i]-BOARD[0])+Math.abs(BD[i+1]-BOARD[1])+Math.abs(BD[i+2]-BOARD[2])<=14;};
    const rowHas=(y)=>{ for(let x=0;x<BW;x+=2) if(!isBoard(x,y)) return true; return false; };
    const bands=[]; for(let y=0;y<BH;y++){ if(!rowHas(y)) continue; let e=y; while(e+1<BH&&rowHas(e+1)) e++; bands.push([y,e]); y=e; }
    const found=[];
    for (const [y0,y1] of bands) {
      const h=y1-y0+1;
      const colHas=(x)=>{ for(let y=y0;y<=y1;y+=2) if(!isBoard(x,y)) return true; return false; };
      for(let x=0;x<BW;x++){ if(!colHas(x)) continue; let e=x; while(e+1<BW&&colHas(e+1)) e++; found.push({x,y:y0,w:e-x+1,h}); x=e; }
    }
    // кандидаты во фреймы: размер как в шаблоне (с допуском)
    const near=(a,b)=>Math.abs(a-b)<=14;
    const cand=found.filter((f)=>JOBS.some((j)=>near(f.w,j.w)&&near(f.h,j.h)));
    cand.sort((a,b)=>(a.y-b.y)||(a.x-b.x));
    // порядок фреймов в макете тот же, что в шаблоне
    let k=0;
    for (const j of JOBS) {
      while (k<cand.length && !(near(cand[k].w,j.w)&&near(cand[k].h,j.h))) k++;
      if (k>=cand.length) break;
      const f=cand[k++];
      if (f.x!==j.x||f.y!==j.y||f.w!==j.w||f.h!==j.h) j.shift=[f.x-j.x,f.y-j.y,f.w-j.w,f.h-j.h];
      j.src=f; // область в PNG; при отрисовке приводится к размеру шаблона
    }
  }
  const out=[];
  for (const j of JOBS) {
    const c=document.createElement('canvas'); c.width=j.w; c.height=j.h;
    const g=c.getContext('2d',{willReadFrequently:true});
    const S=j.src||j; g.drawImage(img,S.x,S.y,S.w,S.h,0,0,j.w,j.h);
    const erased=[];
    const id=g.getImageData(0,0,j.w,j.h), D=id.data;
    const P=j.w*j.h;
    const slotOf=new Int16Array(P).fill(-1);
    j.slots.forEach(([sx,sy,sw,sh],k)=>{ for(let y=sy;y<sy+sh;y++) for(let x=sx;x<sx+sw;x++) slotOf[y*j.w+x]=k; });
    // полосы холста Figma внутри слотов (фото не дотянули до края) → продолжение соседнего фото
    { const isB=(p)=>{ const i=p*4; return Math.abs(D[i]-BOARD[0])+Math.abs(D[i+1]-BOARD[1])+Math.abs(D[i+2]-BOARD[2])<14; };
      const bad=new Uint8Array(P), seen=new Uint8Array(P), st=[];
      for (let x=0;x<j.w;x++) st.push(x,(j.h-1)*j.w+x); for (let y=0;y<j.h;y++) st.push(y*j.w,y*j.w+j.w-1);
      while (st.length) { const p=st.pop(); if (seen[p]) continue; seen[p]=1; if (!isB(p)) continue; bad[p]=1;
        const x=p%j.w; if (x>0) st.push(p-1); if (x<j.w-1) st.push(p+1); if (p>=j.w) st.push(p-j.w); if (p+j.w<P) st.push(p+j.w); }
      const copy=(to,from)=>{ D[to*4]=D[from*4]; D[to*4+1]=D[from*4+1]; D[to*4+2]=D[from*4+2]; };
      for (let y=0;y<j.h;y++) { // по строке: от ближайшего хорошего пикселя
        for (let x=0;x<j.w;x++) { const p=y*j.w+x; if (!bad[p]) continue;
          let l=x, r=x; while (l>=0&&bad[y*j.w+l]) l--; while (r<j.w&&bad[y*j.w+r]) r++;
          const from = l<0 ? (r<j.w?r:-1) : r>=j.w ? l : (x-l<=r-x ? l : r);
          if (from>=0) { copy(p,y*j.w+from); } }
        for (let x=0;x<j.w;x++) { const p=y*j.w+x; if (bad[p] && !(D[p*4]===BOARD[0]&&D[p*4+1]===BOARD[1])) bad[p]=0; }
      }
      for (let x=0;x<j.w;x++) for (let y=0;y<j.h;y++) { const p=y*j.w+x; if (!bad[p]) continue; // целая строка — по столбцу
        let u=y, d=y; while (u>=0&&bad[u*j.w+x]) u--; while (d<j.h&&bad[d*j.w+x]) d++;
        const from = u<0 ? d : d>=j.h ? u : (y-u<=d-y ? u : d); if (from>=0&&from<j.h) copy(p,from*j.w+x); }
    }
    // подписи слотов: сердцевина букв — ровно #26373F, края — смесь этого цвета с белым
    const INK=[38,55,63];
    const isCore=(i)=>Math.abs(D[i]-INK[0])+Math.abs(D[i+1]-INK[1])+Math.abs(D[i+2]-INK[2])<=12;
    const isBlend=(i)=>{ const tr=(D[i]-INK[0])/(255-INK[0]), tg=(D[i+1]-INK[1])/(255-INK[1]), tb=(D[i+2]-INK[2])/(255-INK[2]);
      return tr>0&&tr<0.93&&Math.max(tr,tg,tb)-Math.min(tr,tg,tb)<0.05; };
    for (const t of j.tags) {
      const x0=Math.max(0,Math.floor(t.bx-j.x-10)), x1=Math.min(j.w,Math.ceil(t.bx-j.x+t.text.length*t.size*0.6+10));
      const y0=Math.max(0,Math.floor(t.by-j.y-t.size*0.85-6)), y1=Math.min(j.h,Math.ceil(t.by-j.y+t.size*0.3+6));
      const W=x1-x0, H=y1-y0; if (W<=0||H<=0) continue;
      const at=(x,y)=>((y+y0)*j.w+x+x0)*4;
      const core=new Uint8Array(W*H); let nCore=0;
      for (let y=0;y<H;y++) for (let x=0;x<W;x++) if (isCore(at(x,y))) { core[y*W+x]=1; nCore++; }
      // рамка почти белая — стираем и бледные следы подписи (она могла быть под полупрозрачным слоем)
      let nWhite=0; for (let y=0;y<H;y++) for (let x=0;x<W;x++){ const i=at(x,y); if (D[i]+D[i+1]+D[i+2]>720) nWhite++; }
      const onWhite=nWhite/(W*H)>0.8;
      if (nCore<8 && !onWhite) continue; // подписи не видно
      const near=(x,y,r)=>{ for(let yy=Math.max(0,y-r);yy<=Math.min(H-1,y+r);yy++) for(let xx=Math.max(0,x-r);xx<=Math.min(W-1,x+r);xx++) if(core[yy*W+xx]) return true; return false; };
      const cand=new Uint8Array(W*H);
      for (let y=0;y<H;y++) for (let x=0;x<W;x++) { const k=y*W+x; if (core[k] || (isBlend(at(x,y)) && (onWhite || near(x,y,2)))) cand[k]=1; }
      const mask=new Uint8Array(W*H);
      for (let y=0;y<H;y++) for (let x=0;x<W;x++) { if (!cand[y*W+x]) continue; for(let yy=Math.max(0,y-1);yy<=Math.min(H-1,y+1);yy++) for(let xx=Math.max(0,x-1);xx<=Math.min(W-1,x+1);xx++) mask[yy*W+xx]=1; }
      // заполнение от краёв к центру средним цветом известных соседей
      for (let pass=0; pass<30; pass++) {
        let rest=0; const next=mask.slice();
        for (let y=0;y<H;y++) for (let x=0;x<W;x++){
          if (!mask[y*W+x]) continue; let r=0,gg=0,bl=0,k=0;
          for (const [xx,yy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) {
            const X=x+xx, Y=y+yy, gx=X+x0, gy=Y+y0; if (gx<0||gy<0||gx>=j.w||gy>=j.h) continue;
            if (X>=0&&Y>=0&&X<W&&Y<H&&mask[Y*W+X]) continue;
            const i=(gy*j.w+gx)*4; r+=D[i]; gg+=D[i+1]; bl+=D[i+2]; k++;
          }
          if (k){ const i=at(x,y); D[i]=r/k; D[i+1]=gg/k; D[i+2]=bl/k; next[y*W+x]=0; } else rest++;
        }
        mask.set(next); if (!rest) break;
      }
      if (cand.some(Boolean)) erased.push(t.name);
    }
    // промежутки между слотами: прозрачные, кроме тех, через которые проходит фото с техникой
    // (одна картинка на несколько слотов). Решение принимается для каждого отрезка промежутка целиком.
    const isContent=(p)=>{ const i=p*4, r=D[i], gg=D[i+1], bl=D[i+2];
      if (Math.abs(r-243)+Math.abs(gg-242)+Math.abs(bl-240)<=8) return false;
      return Math.min(r,gg,bl)<190; };
    const groups=new Map();
    for (let y=0;y<j.h;y++) for (let x=0;x<j.w;x++) { const p=y*j.w+x; if (slotOf[p]>=0) continue;
      let l=x, r=x; while (l>0&&slotOf[y*j.w+l-1]<0) l--; while (r<j.w-1&&slotOf[y*j.w+r+1]<0) r++;
      let u=y, d=y; while (u>0&&slotOf[(u-1)*j.w+x]<0) u--; while (d<j.h-1&&slotOf[(d+1)*j.w+x]<0) d++;
      const vertical = r-l <= d-u; // вертикальная полоса: поперечное сечение — строка
      const key = vertical ? 'v'+l+','+r+','+u+','+d : 'h'+u+','+d+','+l+','+r;
      let gr=groups.get(key); if (!gr) groups.set(key, gr={px:[], sec:new Map()});
      gr.px.push(p);
      const sk = vertical ? y : x; if (isContent(p)) gr.sec.set(sk, (gr.sec.get(sk)||0)+1); else if (!gr.sec.has(sk)) gr.sec.set(sk, 0);
    }
    for (const gr of groups.values()) {
      let hit=0; for (const v of gr.sec.values()) if (v>=2) hit++;
      const keep = gr.px.length>=400 && hit/gr.sec.size>=0.06;
      if (!keep) for (const p of gr.px) D[p*4+3]=0;
    }
    // подложка фрейма внутри слотов (фото не дотянули до края ячейки) — тоже прозрачная,
    // если она примыкает к очищенному промежутку или к краю фрейма
    { const isFr=(p)=>{ const i=p*4; return Math.abs(D[i]-243)+Math.abs(D[i+1]-242)+Math.abs(D[i+2]-240)<=8; };
      const st=[], seen=new Uint8Array(P);
      for (let y=0;y<j.h;y++) for (let x=0;x<j.w;x++) { const p=y*j.w+x; if (slotOf[p]<0||!isFr(p)) continue;
        const edge = x===0||y===0||x===j.w-1||y===j.h-1;
        const nearGap = (x>0&&D[(p-1)*4+3]===0)||(x<j.w-1&&D[(p+1)*4+3]===0)||(y>0&&D[(p-j.w)*4+3]===0)||(y<j.h-1&&D[(p+j.w)*4+3]===0);
        if (edge||nearGap) st.push(p); }
      while (st.length) { const p=st.pop(); if (seen[p]) continue; seen[p]=1; if (slotOf[p]<0||!isFr(p)) continue; D[p*4+3]=0;
        const x=p%j.w; if (x>0) st.push(p-1); if (x<j.w-1) st.push(p+1); if (p>=j.w) st.push(p-j.w); if (p+j.w<P) st.push(p+j.w); } }
    // тонкие обрезки фото (≤ 24 px между прозрачными областями) — убираем
    { const T=24, op=(p)=>D[p*4+3]>0, kill=new Uint8Array(P);
      for (let y=0;y<j.h;y++) { let x=0; while (x<j.w) { if (!op(y*j.w+x)) { x++; continue; } let e=x; while (e<j.w&&op(y*j.w+e)) e++;
        if (e-x<=T && x>0 && e<j.w) for (let k=x;k<e;k++) kill[y*j.w+k]=1; x=e; } }
      for (let x=0;x<j.w;x++) { let y=0; while (y<j.h) { if (!op(y*j.w+x)) { y++; continue; } let e=y; while (e<j.h&&op(e*j.w+x)) e++;
        if (e-y<=T && y>0 && e<j.h) for (let k=y;k<e;k++) kill[k*j.w+x]=1; y=e; } }
      for (let p=0;p<P;p++) if (kill[p]) D[p*4+3]=0; }
    if (j.ov) { const [cx,cy,cw,ch]=j.ov.clear; for (let y=cy;y<cy+ch;y++) for (let x=cx;x<cx+cw;x++) D[(y*j.w+x)*4+3]=0; }
    g.putImageData(id,0,0);
    if (j.ov) for (const t of j.ov.tiles) {
      const [tx,ty,tw,th]=t.rect; g.fillStyle='#fff'; g.fillRect(tx,ty,tw,th);
      for (const it of t.items) {
        const im=new Image(); im.src='/'+it.src.split('/').map(encodeURIComponent).join('/'); await im.decode();
        // обрезаем прозрачные поля PNG
        const tc=document.createElement('canvas'); tc.width=im.naturalWidth; tc.height=im.naturalHeight;
        const tg=tc.getContext('2d',{willReadFrequently:true}); tg.drawImage(im,0,0);
        const a=tg.getImageData(0,0,tc.width,tc.height).data; let x0=tc.width,y0=tc.height,x1=-1,y1=-1;
        for (let y=0;y<tc.height;y++) for (let x=0;x<tc.width;x++) if (a[(y*tc.width+x)*4+3]>8) { if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
        const sw=x1-x0+1, sh=y1-y0+1, [bx,by,bw,bh]=it.box, k=Math.min(bw/sw,bh/sh);
        const dw=sw*k, dh=sh*k; g.imageSmoothingQuality='high';
        g.drawImage(im,x0,y0,sw,sh,tx+bx+(bw-dw)/2,ty+by+(bh-dh)/2,dw,dh);
      }
    }
    // срезанный угол сверху справа (как у плиток сайта)
    g.save(); g.globalCompositeOperation='destination-out'; g.beginPath(); g.moveTo(j.w-j.cut,0); g.lineTo(j.w,0); g.lineTo(j.w,j.cut); g.closePath(); g.fill(); g.restore();
    out.push({ out:j.out, left:[...new Set(erased)], shift:j.shift, data:c.toDataURL('image/webp',0.86) });
  }
  return out; })()`;
const slotExpr = `(async()=>{
  const img=new Image(); img.src=${JSON.stringify('/' + png.split('/').map(encodeURIComponent).join('/'))}; await img.decode();
  const out=[];
  for (const j of ${JSON.stringify(slotJobs)}) {
    const c=document.createElement('canvas'); c.width=j.w; c.height=j.h; const g=c.getContext('2d',{willReadFrequently:true});
    const S=j.src||j; g.drawImage(img,S.x,S.y,S.w,S.h,0,0,j.w,j.h);
    const D=g.getImageData(0,0,j.w,j.h).data;
    // пустые края: строка/столбец почти целиком цвета слота (#CACACA) или подложки (#F3F2F0)
    const flat=(i)=>{ const r=D[i],gg=D[i+1],b=D[i+2]; return (Math.abs(r-202)+Math.abs(gg-202)+Math.abs(b-202)<=10)||(Math.abs(r-243)+Math.abs(gg-242)+Math.abs(b-240)<=8); };
    const rowFlat=(y)=>{ let n=0; for(let x=0;x<j.w;x++) if(flat((y*j.w+x)*4)) n++; return n/j.w>0.9; };
    const colFlat=(x)=>{ let n=0; for(let y=0;y<j.h;y++) if(flat((y*j.w+x)*4)) n++; return n/j.h>0.9; };
    let t=0,b=j.h-1,l=0,rr=j.w-1;
    while(t<b&&rowFlat(t))t++; while(b>t&&rowFlat(b))b--; while(l<rr&&colFlat(l))l++; while(rr>l&&colFlat(rr))rr--;
    if (t||l||b<j.h-1||rr<j.w-1) { t+=2; l+=l?2:0; b-=b<j.h-1?2:0; rr-=rr<j.w-1?2:0; } // запас от сглаженной кромки
    const o=document.createElement('canvas'); o.width=rr-l+1; o.height=b-t+1;
    o.getContext('2d').drawImage(c,l,t,o.width,o.height,0,0,o.width,o.height);
    out.push({ out:j.out, left:[], trim:[t,j.w-1-rr,j.h-1-b,l], data:o.toDataURL('image/jpeg',0.86) });
  }
  return out; })()`;
const r = jobs.length
  ? await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
  : await send('Runtime.evaluate', { expression: slotExpr, awaitPromise: true, returnByValue: true });
ws.close(); proc.kill();
if (r.result.exceptionDetails) { console.error(JSON.stringify(r.result.exceptionDetails, null, 1)); process.exit(1); }
for (const o of r.result.result.value) {
  const to = path.join(ROOT, 'assets/img/photos', o.out);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  const buf = Buffer.from(o.data.split(',')[1], 'base64');
  fs.writeFileSync(to, buf);
  console.log(`${o.out} ${Math.round(buf.length / 1024)} KB${o.trim && o.trim.some(Boolean) ? '  · обрезаны края (сверху, справа, снизу, слева): ' + o.trim.join(', ') : ''}${o.shift ? '  · фрейм сдвинут в макете на ' + o.shift.join(', ') : ''}${o.left.length ? '  · стёрты подписи: ' + o.left.join(', ') : ''}`);
}

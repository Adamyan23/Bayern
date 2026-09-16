// Шаг 2: генерирует разметку карточек в index.html между маркерами
//   <!-- portfolio:start --> … <!-- portfolio:end -->   (карусель «Портфель»)
//   <!-- brands:start -->    … <!-- brands:end -->      (секция «Бренды»)
// Запуск: node tools/cards/build.cjs   (после node tools/cards/assets.mjs)
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PORTFOLIO = require('./portfolio.cjs');
const { BRANDS, LAYOUTS, layersFor } = require('./brands.cjs');
const MANIFEST = require('./manifest.json');

const num = (v) => +v.toFixed(3);
const box = (l, W, H) => `left:${num(l.x / W * 100)}%;top:${num(l.y / H * 100)}%;width:${num(l.w / W * 100)}%;height:${num(l.h / H * 100)}%`;
const asset = (group, src) => { const p = MANIFEST[`${group}:${src}`]; if (!p) throw new Error(`нет в manifest.json: ${group}:${src} — запустите assets.mjs`); return p; };
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
const IMG = 'alt="" draggable="false" loading="lazy" decoding="async"';

/* ---------- Портфель ---------- */
function portfolioLayer(l) {
  if (l.plate) return `<span class="bcard__plate" style="${box(l, 360, 480)};--plate:${l.plate}"></span>`;
  const src = asset('portfolio', l.src);
  const cls = `bcard__layer ${l.photo ? 'bcard__layer--photo' : 'bcard__layer--logo'}`;
  if (l.crop) {
    const [a, tx, d, ty] = l.crop;
    return `<span class="${cls} bcard__crop" style="${box(l, 360, 480)}"><img src="${src}" style="width:${num(100 / a)}%;height:${num(100 / d)}%;left:${num(-tx / a * 100)}%;top:${num(-ty / d * 100)}%" ${IMG}></span>`;
  }
  return `<img class="${cls}${l.contain ? ' bcard__layer--contain' : ''}" src="${src}" style="${box(l, 360, 480)}" ${IMG}>`;
}
function portfolioCard(b, i) {
  const bg = b.bg === 'gradient' ? '' : ` style="--card-bg:${b.bg}"`;
  return `            <a class="bcard${b.bg === 'gradient' ? ' bcard--tint' : ''}" href="#brand-${b.id}"${bg} draggable="false">
              <div class="bcard__art" aria-hidden="true">
${b.layers.map((l) => '                ' + portfolioLayer(l)).join('\n')}
              </div>
              <h3 class="sr-only">${b.name}</h3>
              <span class="bcard__num mono">${String(i + 1).padStart(2, '0')} · ${b.cc}</span>
              <p class="bcard__meta mono"><span data-i18n="country.${b.country}"></span> · <span data-i18n="cat.${b.cat}"></span></p>
              <span class="bcard__go" aria-hidden="true">${ARROW}</span>
            </a>
`;
}

/* ---------- Бренды (коллаж) ---------- */
function collageLayer(l, W, H) {
  if (l.tile && l.placeholder) return `<span class="collage__tile collage__tile--ph" style="${box(l, W, H)};background:${l.tile}"><span class="ph__label"><svg viewBox="0 0 24 24"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><path d="M9 10h6v6H9z"/></svg><span data-i18n="ph"></span> ${l.placeholder}</span></span>`;
  if (l.tile) return `<span class="collage__tile" style="${box(l, W, H)};background:${l.tile}"></span>`;
  const fit = l.fit === 'cover' ? 'cover' : 'contain';
  return `<img class="collage__img collage__img--${fit}" src="${asset('brands', l.src)}" style="${box(l, W, H)}" ${IMG}>`;
}
function brandCard(b, i) {
  const L = LAYOUTS[b.size];
  const sizeCls = b.size === 'narrow' ? '' : ` pcard--${b.size}`;
  const delay = i % 2 === 1 ? ' style="--d:.1s"' : '';
  const n = String(i + 1).padStart(2, '0');
  return `          <a class="pcard${sizeCls} reveal" id="brand-${b.id}" href="${b.catalog}" target="_blank" rel="noopener noreferrer"${delay}>
            <div class="pcard__top mono"><span>${n} · <span data-i18n="country.${b.country}"></span></span><span class="pcard__go"><span data-i18n="brands.more"></span><span class="pcard__arrow">${ARROW}</span></span></div>
            <div class="pcard__media collage collage--${b.size}" style="aspect-ratio:${L.w} / ${L.h}" data-photo="assets/img/photos/brands/${b.id}.webp" aria-hidden="true">
${layersFor(b).map((l) => '              ' + collageLayer(l, L.w, L.h)).join('\n')}
            </div>
            <div class="pcard__body">
              <p class="pcard__cat mono" data-i18n="cat.${b.cat}"></p>
              <h3 class="pcard__name">${b.name}</h3>
              <ul class="pcard__list"><li data-i18n="${b.key}.p1"></li><li data-i18n="${b.key}.p2"></li><li data-i18n="${b.key}.p3"></li></ul>
            </div>
          </a>
`;
}

function replaceBetween(html, name, content) {
  const start = `<!-- ${name}:start -->`, end = `<!-- ${name}:end -->`;
  const s = html.indexOf(start), e = html.indexOf(end);
  if (s < 0 || e < 0) throw new Error(`маркеры ${name} не найдены в index.html`);
  const indent = html.slice(html.lastIndexOf('\n', e) + 1, e);
  return html.slice(0, s + start.length) + '\n' + content + indent + html.slice(e);
}

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
html = replaceBetween(html, 'portfolio', PORTFOLIO.map(portfolioCard).join(''));
html = replaceBetween(html, 'brands', BRANDS.map(brandCard).join(''));
fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log('portfolio:', PORTFOLIO.map((b) => b.id).join(', '));
console.log('brands:   ', BRANDS.map((b) => `${b.id}(${b.size})`).join(', '));

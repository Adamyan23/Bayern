// Генерирует SVG-шаблоны фото-слотов для Figma: tools/figma/templates/*.svg
// Запуск: node tools/figma/templates.cjs
//
// SVG перетаскивается в Figma — каждый слот становится прямоугольником с именем для экспорта
// (hero, about-1, industries-01-1, brand-weber-mt-1 …). Размер слота = размер экспорта при 1x.
// Имена разбирает tools/figma/place.cjs и раскладывает файлы в assets/img/photos/.
const fs = require('fs');
const path = require('path');
const { BRANDS, LAYOUTS } = require('../cards/brands.cjs');

const OUT = path.join(__dirname, 'templates');
const SLOT = '#CACACA', FRAME = '#F3F2F0', INK = '#26373F', DEEP = '#4E6B78', COPPER = '#9A5B32';
const FONT = "font-family=\"IBM Plex Mono, Roboto Mono, monospace\"";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Раздел = набор фреймов; фрейм = набор слотов { name, x, y, w, h }.
// Фреймы идут рядами слева направо, перенос — когда ряд шире ROW.
function svg(title, note, frames, ROW = 3200) {
  const PAD = 80, GAP = 120, HEAD = 64;
  let x = PAD, y = PAD + 110, rowH = 0, width = 0, body = '';
  for (const f of frames) {
    const fw = Math.max(...f.slots.map((s) => s.x + s.w)), fh = Math.max(...f.slots.map((s) => s.y + s.h));
    const head = HEAD + (f.hint ? 40 : 0);
    if (x > PAD && x + fw > PAD + ROW) { x = PAD; y += rowH + GAP; rowH = 0; }
    const top = y + head;
    body += `  <g id="${f.id}">\n`;
    body += `    <text id="label ${f.id}" x="${x}" y="${y + 36}" ${FONT} font-size="32" font-weight="600" fill="${INK}">${esc(f.title)}</text>\n`;
    if (f.hint) body += `    <text id="hint ${f.id}" x="${x}" y="${y + 80}" ${FONT} font-size="20" fill="${DEEP}">${esc(f.hint)}</text>\n`;
    body += `    <rect id="frame ${f.id}" x="${x}" y="${top}" width="${fw}" height="${fh}" fill="${FRAME}"/>\n`;
    for (const s of f.slots) {
      body += `    <rect id="${s.name}" x="${x + s.x}" y="${top + s.y}" width="${s.w}" height="${s.h}" fill="${SLOT}"/>\n`;
      const label = `${s.name} · ${s.w}×${s.h}`;
      const size = Math.max(14, Math.min(40, Math.floor((s.w - 40) / (label.length * 0.62))));
      body += `    <text id="tag ${s.name}" x="${x + s.x + 20}" y="${top + s.y + s.h - 24}" ${FONT} font-size="${size}" fill="${INK}">${label}</text>\n`;
    }
    for (const g of f.guides || []) {
      body += `    <rect id="guide ${g.name}" x="${x + g.x}" y="${top + g.y}" width="${g.w}" height="${g.h}" fill="none" stroke="${COPPER}" stroke-width="4" stroke-dasharray="16 12"/>\n`;
      body += `    <text id="guide label ${g.name}" x="${x + g.x + 16}" y="${top + g.y + 44}" ${FONT} font-size="28" fill="${COPPER}">${esc(g.name)}</text>\n`;
    }
    body += '  </g>\n';
    x += fw + GAP;
    width = Math.max(width, x - GAP);
    rowH = Math.max(rowH, head + fh);
  }
  const W = width + PAD, H = y + rowH + PAD;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect id="background" width="${W}" height="${H}" fill="#FFFFFF"/>
  <text id="title" x="${PAD}" y="${PAD + 40}" ${FONT} font-size="48" font-weight="600" fill="${INK}">${esc(title)}</text>
  <text id="note" x="${PAD}" y="${PAD + 84}" ${FONT} font-size="22" fill="${DEEP}">${esc(note)}</text>
${body}</svg>
`;
}

const NOTE = 'Картинку — в заливку серого слота (Fill → Image). Имя слота не менять. Экспорт: JPG, 1x.';

/* Hero: фон за логотипом, cover на весь экран — края срезаются на узких экранах */
const hero = [{
  id: 'hero', title: 'HERO — фон за белым логотипом',
  hint: 'Кадр средней/тёмной тональности. Пунктир — логотип, текст, видимая часть на ноутбуке и на телефоне.',
  slots: [{ name: 'hero', x: 0, y: 0, w: 2400, h: 1350 }],
  guides: [
    { name: 'экран 1440×900', x: 132, y: 0, w: 2136, h: 1350 },
    { name: 'логотип BAYERN', x: 196, y: 350, w: 2008, h: 515 },
    { name: 'заголовок и цифры', x: 196, y: 1000, w: 2008, h: 330 },
    { name: 'телефон', x: 888, y: 20, w: 624, h: 1310 }
  ]
}];

/* About: коллаж 60% (размеры = 2x от экрана 1440, gap 32) */
const about = [{
  id: 'about', title: 'О КОМПАНИИ — коллаж',
  hint: 'about-1 — высокое слева, about-2 и about-3 — справа.',
  slots: [
    { name: 'about-1', x: 0, y: 0, w: 754, h: 1440 },
    { name: 'about-2', x: 786, y: 0, w: 686, h: 782 },
    { name: 'about-3', x: 786, y: 814, w: 686, h: 626 }
  ]
}];

/* Отрасли: 4 галереи по 4 фото (2x от экрана 1440, gap 24) */
const IND = ['Генподряд и монолит', 'Дороги и инфраструктура', 'Заводы ЖБИ', 'Агропредприятия'];
const industries = IND.map((name, i) => {
  const n = String(i + 1).padStart(2, '0');
  return {
    id: `industries-${n}`, title: `ОТРАСЛЬ ${n} — ${name}`,
    slots: [
      { name: `industries-${n}-1`, x: 0, y: 0, w: 948, h: 692 },
      { name: `industries-${n}-2`, x: 972, y: 0, w: 462, h: 1264 },
      { name: `industries-${n}-3`, x: 0, y: 716, w: 462, h: 548 },
      { name: `industries-${n}-4`, x: 486, y: 716, w: 462, h: 548 }
    ]
  };
});

/* Бренды: коллажи карточек (2x от сетки LAYOUTS) */
const brands = BRANDS.map((b, i) => {
  const L = LAYOUTS[b.size];
  return {
    id: `brand-${b.id}`, title: `${String(i + 1).padStart(2, '0')} · ${b.name} — ${b.size} ${L.w}×${L.h}`,
    slots: L.tiles.map(([x, y, w, h], k) => ({ name: `brand-${b.id}-${k + 1}`, x: x * 2, y: y * 2, w: w * 2, h: h * 2 }))
  };
});

fs.mkdirSync(OUT, { recursive: true });
const files = {
  '1-hero.svg': svg('BAYERN · Hero', NOTE, hero),
  '2-about.svg': svg('BAYERN · About', NOTE, about),
  '3-industries.svg': svg('BAYERN · Industries', NOTE, industries),
  '4-brands.svg': svg('BAYERN · Brand collages', NOTE, brands)
};
for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), content);
  console.log(name);
}

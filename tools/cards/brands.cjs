// Карточки секции «Бренды»: коллаж в области фото карточки.
//
// Размер области (px сетки, как шаблон в Figma):
//   wide   704 × 440  — широкая карточка (7 колонок)
//   narrow 480 × 440  — узкая карточка (5 колонок)
//   full  1264 × 440  — карточка на всю ширину
//
// Два способа описать коллаж:
//   1) photos: [...]  — 3 фото раскладываются автоматически по шаблону LAYOUTS (главное + 2 малых).
//      Пустой массив — плитки-заглушки. Готовый коллаж из Figma (assets/img/photos/brands/<id>.webp)
//      подставляется поверх них сам (шаблон: tools/figma/templates/4-brands.svg, нарезка: tools/figma/crop.mjs).
//      fit: 'contain' — товар целиком на светлой плитке (белый фон фото растворяется, multiply);
//      fit: 'cover'   — фото заполняет плитку (реальные кадры, баннеры).
//   2) layers: [...]  — ручная раскладка из Figma (как в portfolio.cjs): { tile|src, x, y, w, h, fit }.
//      Если layers заданы, photos игнорируются.
//
// Порядок массива = порядок карточек на сайте (такой же, как в портфеле).

const TILE = '#F3F2F0';

const LAYOUTS = {
  wide: { w: 704, h: 440, tiles: [[0, 0, 428, 440], [436, 0, 268, 216], [436, 224, 268, 216]] },
  narrow: { w: 480, h: 440, tiles: [[0, 0, 480, 268], [0, 276, 236, 164], [244, 276, 236, 164]] },
  full: { w: 1264, h: 440, tiles: [[0, 0, 620, 440], [628, 0, 314, 440], [950, 0, 314, 440]] }
};

// catalog — официальный каталог производителя (из bayern.xlsx), открывается в новой вкладке.
const BRANDS = [
  { id: 'weber-mt', name: 'Weber MT', country: 'de', cat: 'compaction', key: 'weber', size: 'wide',
    catalog: 'https://katalog.webermt.com/FlipBook_WeberMT-Katalog2025-GB/', photos: [] },
  { id: 'imer', name: 'IMER', country: 'it', cat: 'access', key: 'imer', size: 'narrow',
    catalog: 'https://www.imergroup.com/en/products/', photos: [] },
  { id: 'enar', name: 'ENAR', country: 'es', cat: 'concrete', key: 'enar', size: 'narrow',
    catalog: 'https://www.enargroup.com/eme/range/vibration/products', photos: [] },
  { id: 'kern-deudiam', name: 'Kern-Deudiam', country: 'de', cat: 'diamond', key: 'kern', size: 'wide',
    catalog: 'https://kern-deudiam.com/catalogues/kern-deudiam-diamond-tools-dubai/', photos: [] },
  { id: 'ofmer', name: 'Ofmer', country: 'it', cat: 'rebar', key: 'ofmer', size: 'wide',
    catalog: 'https://www.ofmer.com/en/products-portfolio/', photos: [] },
  { id: 'geda', name: 'Geda', country: 'de', cat: 'lifting', key: 'geda', size: 'narrow',
    catalog: 'https://www.geda.de/en/products/catalogue/', photos: [] },
  { id: 'dynapac', name: 'Dynapac', country: 'se', cat: 'light', key: 'dynapac', size: 'narrow',
    catalog: 'https://dynapac.com/en/products/light-equipment?tab=products', photos: [] },
  { id: 'hatz', name: 'Hatz', country: 'de', cat: 'power', key: 'hatz', size: 'wide',
    catalog: 'https://hatz.com/en-global/products', photos: [] },
  { id: 'yanmar', name: 'Yanmar', country: 'jp', cat: 'compact', key: 'yanmar', size: 'full',
    catalog: 'https://www.yanmar.com/global/engine/products/diesel/aircooled/', photos: [] }
];

// Автораскладка: плитка + фото внутри (contain — с полями 8%).
// Если фото нет — плитки остаются пустыми заглушками (раскладка делается в Figma).
function layersFor(brand) {
  if (brand.layers) return brand.layers;
  const L = LAYOUTS[brand.size];
  if (!brand.photos || !brand.photos.length) return L.tiles.map(([x, y, w, h], i) => ({ tile: TILE, x, y, w, h, placeholder: i + 1 }));
  const out = [];
  brand.photos.slice(0, L.tiles.length).forEach((p, i) => {
    const [x, y, w, h] = L.tiles[i];
    out.push({ tile: TILE, x, y, w, h });
    if (p.fit === 'cover') out.push({ src: p.src, x, y, w, h, fit: 'cover' });
    else {
      const pad = Math.round(Math.min(w, h) * 0.08);
      out.push({ src: p.src, x: x + pad, y: y + pad, w: w - pad * 2, h: h - pad * 2, fit: 'contain' });
    }
  });
  return out;
}

module.exports = { BRANDS, LAYOUTS, layersFor };

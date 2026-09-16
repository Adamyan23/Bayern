// Раскладывает фото, экспортированные из Figma-шаблонов, по папкам сайта.
// Запуск: node tools/figma/place.cjs [папка]   (по умолчанию media/figma-export)
//
//   hero.jpg               → assets/img/photos/hero/hero.jpg
//   about-2.jpg            → assets/img/photos/about/about-2.jpg
// Галереи отраслей и коллажи брендов нарезаются из PNG всей доски — tools/figma/crop.mjs.
//
// Суффиксы Figma (@2x, «Frame 12 - …») и .jpeg/.JPG понимаются. PNG не принимаются — экспортируйте JPG.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const SRC = path.resolve(ROOT, process.argv[2] || 'media/figma-export');
const DEST = path.join(ROOT, 'assets/img/photos');

const RULES = [
  [/^hero$/, () => 'hero/hero.jpg'],
  [/^about-([1-3])$/, (m) => `about/about-${m[1]}.jpg`],
];

if (!fs.existsSync(SRC)) { console.error(`нет папки ${SRC}`); process.exit(1); }
let placed = 0;
for (const file of fs.readdirSync(SRC)) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, path.extname(file)).replace(/@\d+(\.\d+)?x$/, '').split(' - ').pop().trim();
  const rule = RULES.find(([re]) => re.test(base));
  if (!rule) { console.warn(`пропущен: ${file} (имя не из шаблона)`); continue; }
  if (ext !== '.jpg' && ext !== '.jpeg') { console.warn(`пропущен: ${file} (нужен JPG)`); continue; }
  const to = path.join(DEST, rule[1](base.match(rule[0])));
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(path.join(SRC, file), to);
  const kb = Math.round(fs.statSync(to).size / 1024);
  console.log(`${file} → ${path.relative(ROOT, to).replace(/\\/g, '/')} (${kb} KB${kb > 600 ? ' — тяжёлый, сожмите' : ''})`);
  placed++;
}
console.log(`готово: ${placed}`);

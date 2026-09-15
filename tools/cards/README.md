# Карточки брендов: Figma → сайт

Два набора карточек собираются из данных, а не правятся руками в `index.html`:

| Где на сайте | Данные | Сетка (px) | Маркеры в `index.html` |
|---|---|---|---|
| Карусель «Портфель» | `portfolio.cjs` | карточка 360 × 480 | `<!-- portfolio:start/end -->` |
| Секция «Бренды» (коллаж) | `brands.cjs` | `wide` 704 × 440 · `narrow` 480 × 440 · `full` 1264 × 440 | `<!-- brands:start/end -->` |

Порядок брендов (одинаковый в обоих местах): Weber MT, IMER, ENAR, Kern-Deudiam, Ofmer, Geda, Dynapac, Hatz, Yanmar.

## Пересборка

```bash
python -m http.server 5500        # в отдельном окне, из корня проекта
node tools/cards/assets.mjs       # media/ → assets/img/{portfolio,brands}/ (+ manifest.json)
node tools/cards/build.cjs        # генерирует разметку карточек в index.html
```

`assets.mjs` нужен Chrome (конвертация в WebP). Исходники всегда берутся из `media/<Бренд>/`.

## Работа в Figma

Файл: **BAYERN — Portfolio cards template** (`dbip5isSSVpYgl76p9OcKE`).

### Портфель (готово)
Страница «Portfolio cards»: 9 фреймов 360 × 480. В каждом — фото (любое число слоёв), плашка `LOGO — …` и логотип. Номер, подпись и стрелка — это текст сайта, их в Figma только примеряют.

### Бренды — шаблоны коллажей (добавить, когда восстановится Figma MCP)
Страница «Brand collages»: 9 фреймов в порядке брендов, размеры по типу карточки:

| Бренд | Тип | Фрейм |
|---|---|---|
| Weber MT | wide | 704 × 440 |
| IMER | narrow | 480 × 440 |
| ENAR | narrow | 480 × 440 |
| Kern-Deudiam | wide | 704 × 440 |
| Ofmer | wide | 704 × 440 |
| Geda | narrow | 480 × 440 |
| Dynapac | narrow | 480 × 440 |
| Hatz | wide | 704 × 440 |
| Yanmar | full | 1264 × 440 |

Правила для раскладки в Figma:
- фрейм с **Clip content**, всё за краем обрежется так же, как на сайте;
- слои-плитки называть `TILE` (прямоугольник с заливкой, обычно `#F3F2F0`);
- слои с фото называть **именем файла из media** (например `weber1`), заливка — Image **Fill** или **Crop**;
- фото с белым фоном на плитке растворяются (на сайте `mix-blend-mode: multiply`), реальные кадры — на всю плитку.

### Перенос раскладки на сайт
Агент читает фреймы (позиции, размеры, порядок слоёв, crop-трансформы) и записывает их в данные:
- портфель → `portfolio.cjs` (`layers: [{ src | plate, x, y, w, h, photo, crop }]`);
- бренды → `brands.cjs`, поле `layers` у бренда (`{ tile | src, x, y, w, h, fit }`) — оно заменяет автораскладку `photos`.

Затем — пересборка (см. выше). Crop из Figma (`imageTransform [[a,0,tx],[0,d,ty]]`) записывается как `crop: [a, tx, d, ty]`.

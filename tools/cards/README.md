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

### Бренды — коллажи
Шаблон: `tools/figma/templates/4-brands.svg` (перетащить в Figma). Коллаж собирается в Figma свободно и уходит на сайт одной картинкой `assets/img/photos/brands/<id>.webp` — экспорт и нарезка по [tools/figma/README.md](../figma/README.md). Сайт подхватывает её без пересборки, пока её нет — видны плитки-заглушки.

Нужна своя раскладка (другие плитки, товар на светлом фоне) — поле `layers` в `brands.cjs`.

Карточка ведёт на официальный каталог производителя (поле `catalog`, из `bayern.xlsx`), в новой вкладке.

### Перенос раскладки на сайт
Агент читает фреймы (позиции, размеры, порядок слоёв, crop-трансформы) и записывает их в данные:
- портфель → `portfolio.cjs` (`layers: [{ src | plate, x, y, w, h, photo, crop }]`);
- бренды → `brands.cjs`, поле `layers` у бренда (`{ tile | src, x, y, w, h, fit }`) — оно заменяет автораскладку `photos`.

Затем — пересборка (см. выше). Crop из Figma (`imageTransform [[a,0,tx],[0,d,ty]]`) записывается как `crop: [a, tx, d, ty]`.

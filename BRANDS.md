# BRANDS — данные брендов для сайта BAYERN

> Источник: `bayern.xlsx` (лист 1) + файлы в `media/<Бренд>/`. Проверено 2026-09-15.
> Документ для агентов: факты о брендах, пути к логотипам и фото, цвета, ссылки на каталоги и известные проблемы файлов.
> **Статус:** карточки портфеля на сайте собраны по макету Figma (см. раздел 5); цвета брендов на сайте не используются.

## 1. Сводная таблица

| # | id на сайте | Бренд | Основной цвет | Фото на карточке | Каталог (официальный) |
|---|---|---|---|---|---|
| 01 | `weber-mt` | Weber MT | `#0082C7` | 3 | https://katalog.webermt.com/FlipBook_WeberMT-Katalog2025-GB/ |
| 02 | `enar` | ENAR | `#FEA904` | 3 | https://www.enargroup.com/eme/range/vibration/products |
| 03 | `ofmer` | Ofmer | `#46517A` | 3 | https://www.ofmer.com/en/products-portfolio/ |
| 04 | `geda` | Geda | `#6078A3` | 3 | https://www.geda.de/en/products/catalogue/ |
| 05 | `imer` | IMER | `#579F97` | 3 | https://www.imergroup.com/en/products/ |
| 06 | `hatz` | Hatz | `#DA281B` | 2 | https://hatz.com/en-global/products |
| 07 | `dynapac` | Dynapac | `#941818` | 3 | https://dynapac.com/en/products/light-equipment?tab=products |
| 08 | `yanmar` | Yanmar | `#D90738` | 3 | https://www.yanmar.com/global/engine/products/diesel/aircooled/ |
| 09 | `kern-deudiam` | Kern-Deudiam | `#3AADE1` | 3 | https://kern-deudiam.com/catalogues/kern-deudiam-diamond-tools-dubai/ |

- **id на сайте** — совпадает с `window.BRANDS[].id` в `assets/js/i18n.js` и `catalog.html?brand=<id>`.
- **Фото на карточке** — колонка `card picture number` из xlsx: сколько фото показывать в карточке бренда.
- Порядок строк в xlsx другой (Weber, ENAR, Geda, Hatz, Dynapac, IMER, Ofmer, Kern, Yanmar); здесь — порядок сайта.

## 2. Цвета брендов и читаемость текста

Контраст по WCAG. AA для обычного текста — от 4.5; для крупного текста (от 24px или от 19px жирным) — от 3.0.

| Бренд | HEX | Белый текст | Тёмный текст `#26373F` | Рекомендация |
|---|---|---|---|---|
| Weber MT | `#0082C7` | 4.2 | 3.0 | Белый, только крупный текст |
| ENAR | `#FEA904` | 1.9 ❌ | 6.4 | **Только тёмный текст** |
| Ofmer | `#46517A` | 7.7 | 1.6 ❌ | Белый |
| Geda | `#6078A3` | 4.5 | 2.8 | Белый |
| IMER | `#579F97` | 3.1 | 4.0 | Тёмный; белый — только крупный |
| Hatz | `#DA281B` | 4.9 | 2.5 | Белый |
| Dynapac | `#941818` | 8.7 | 1.4 ❌ | Белый |
| Yanmar | `#D90738` | 5.2 | 2.4 | Белый |
| Kern-Deudiam | `#3AADE1` | 2.5 ❌ | 4.8 | **Только тёмный текст** |

Правила из брендбука BAYERN, которые важны при использовании этих цветов:

- Цвета брендов — **акценты внутри блока бренда** (полоса, фон карточки, тег). Основная палитра сайта остаётся BAYERN.
- Логотипы вендоров **не перекрашиваются**; на цветном фоне — только версия, разрешённая вендором.
- Все логотипы — **одной оптической высоты**, ни один вендор не выделяется размером.
- Знак BAYERN не объединяется с логотипом вендора в один блок или рамку.

## 3. Бренды подробно

Колонки в таблицах фото:
- **Реальный формат** — что внутри файла; расширение `.png` часто не соответствует содержимому.
- **Фон** — прозрачный, белый или фото целиком.
- **Тип** — вырезанный товар (cutout) или фото/баннер.

### 01 · Weber MT — `weber-mt`

- Цвет: `#0082C7` · Фото на карточке: **3**
- Каталог: https://katalog.webermt.com/FlipBook_WeberMT-Katalog2025-GB/ (флипбук каталога 2025, EN)

**Логотип** — `media/Weber/WeberMT-Logo.png` · PNG 800×217 · тёмно-серая плашка со скруглёнными углами на прозрачном фоне. Работает на светлом и тёмном фоне.

| Файл | Реальный формат | Размер | Фон | Что на фото |
|---|---|---|---|---|
| `media/Weber/weber1.png` | PNG | 800×678 | прозрачный | Швонарезчик (cutout) |
| `media/Weber/weber2.png` | PNG | 800×920 | прозрачный | Виброплита (cutout) |
| `media/Weber/weber3.png` | PNG | 170×270 | прозрачный | Вибротрамбовка (cutout) · ⚠️ маленькое разрешение |

### 02 · ENAR — `enar`

- Цвет: `#FEA904` · Фото на карточке: **3**
- Каталог: https://www.enargroup.com/eme/range/vibration/products (линейка «Vibration»)

**Логотип** — `media/Enar/enar-logo.svg` · SVG 762×184 · ⚠️ **текст белый (`#F9F9F9`) + красная звезда `#E32C1D`**, фон прозрачный. На светлом фоне текст не виден — нужен тёмный фон или тёмная версия логотипа. Растровая копия есть только внутри xlsx.

| Файл | Реальный формат | Размер | Фон | Что на фото |
|---|---|---|---|---|
| `media/Enar/enar1.png` | **WebP** | 500×500 | прозрачный | Мотопомпа в раме (cutout) · ⚠️ не из линейки вибрации — проверить |
| `media/Enar/enar2.png` | **WebP** | 500×500 | прозрачный | Глубинный вибратор с гибким валом |
| `media/Enar/enar3.png` | **WebP** | 500×500 | прозрачный | Вибратор с преобразователем и наконечниками |
| `media/Enar/enar4.png` | **WebP** | 500×500 | прозрачный | Виброрейка |
| `media/Enar/enar5.png` | **WebP** | 500×500 | прозрачный | Затирочная машина |

Файлов 5, на карточке нужно 3. Под описание на сайте («вибраторы, виброрейки, финишный инструмент») подходят `enar2`, `enar4`, `enar5`.

### 03 · Ofmer — `ofmer`

- Цвет: `#46517A` · Фото на карточке: **3**
- Каталог: https://www.ofmer.com/en/products-portfolio/

**Логотип** — `media/Ofmer/OFMER_LOGO.png` · PNG 1072×204 · ⚠️ **белый текст «OFMER MADE TO BUILD»** + полоса триколора, фон прозрачный. На светлом фоне виден только триколор — нужен тёмный фон.

| Файл | Реальный формат | Размер | Фон | Что на фото |
|---|---|---|---|---|
| `media/Ofmer/ofmer1.png` | PNG | 850×853 | прозрачный | Станок для гибки арматуры (cutout) |
| `media/Ofmer/ofmer2.png` | PNG | 850×853 | прозрачный | Станок для резки арматуры (cutout) |
| `media/Ofmer/ofmer3.png` | PNG | 850×853 | прозрачный | Комбинированный / гибочный станок (cutout) |

### 04 · Geda — `geda`

- Цвет: `#6078A3` · Фото на карточке: **3**
- Каталог: https://www.geda.de/en/products/catalogue/

**Логотип** — `media/Geda/geda_logo.png` · PNG 153×53 · синий «GEDA» + серая плашка «ORIGINAL», фон прозрачный, обрезан вплотную. ⚠️ Очень маленькое разрешение — на экранах с высокой плотностью будет мыльным. Лучше запросить SVG.

| Файл | Реальный формат | Размер | Фон | Что на фото |
|---|---|---|---|---|
| `media/Geda/geda1.png` | PNG | 2233×1161 | светло-серый (студия) | Два грузовых подъёмника · 2.4 МБ — сжать |
| `media/Geda/geda2.png` | PNG | 1731×853 | светло-серый / фото | Подъёмник-тельфер на конструкции · 0.96 МБ — сжать |
| `media/Geda/geda3.png` | PNG | 603×694 | фото (небо) | Мачта строительного подъёмника, реальный кадр |

### 05 · IMER — `imer`

- Цвет: `#579F97` · Фото на карточке: **3**
- Каталог: https://www.imergroup.com/en/products/

**Логотип** — `media/Imer/Imer-logo.png` · PNG 686×272 · бирюзовый знак + «IMER TOGETHER WE BUILD» на **непрозрачном светло-сером фоне `#EFEFEF`**. На белом виден серый прямоугольник, на тёмном — светлая плашка.

| Файл | Реальный формат | Размер | Фон | Что на фото |
|---|---|---|---|---|
| `media/Imer/imer1.png` | **JPEG** | 2012×1080 | белый | Штукатурная станция на прицепе |
| `media/Imer/imer2.png` | **JPEG** | 1551×1920 | белый | Паукообразный подъёмник |
| `media/Imer/imer3.png` | **JPEG** | 1078×1078 | белый | Ножничный подъёмник |
| `media/Imer/imer4.png` | **JPEG** | 748×1035 | белый | Растворосмеситель / штукатурная машина |

Файлов 4, на карточке нужно 3. Под описание на сайте подходят `imer3` (ножничный), `imer2` (паукообразный), `imer1` (штукатурная станция).

### 06 · Hatz — `hatz`

- Цвет: `#DA281B` (в xlsx записан без `#`) · Фото на карточке: **2**
- Каталог: https://hatz.com/en-global/products

**Логотип** — `media/Hatz/hatz-logo.png` · **WebP** 240×216 · красный квадрат с синей плашкой «HATZ», непрозрачный. ⚠️ Маленькое разрешение. В xlsx есть PNG-версия того же логотипа (`xl/media/image10.png`).

| Файл | Реальный формат | Размер | Фон | Что на фото |
|---|---|---|---|---|
| `media/Hatz/hatz1.png` | **WebP** | 1366×911 | тёмно-синий баннер | Линейка дизельных двигателей |
| `media/Hatz/hatz2.png` | **WebP** | 1920×849 | тёмно-синий баннер | Двигатель, рекламный кадр с брызгами |

Единственный бренд, у которого фото — **тёмные баннеры, а не вырезанный товар**. На светлой карточке они будут выглядеть иначе, чем фото остальных брендов.

### 07 · Dynapac — `dynapac`

- Цвет: `#941818` · Фото на карточке: **3**
- Каталог: https://dynapac.com/en/products/light-equipment?tab=products (Light Equipment)

**Логотип** — `media/Dynapac/dynapac-logo.png` · PNG 475×120 · белый «DYNAPAC FAYAT GROUP» на **непрозрачной красной плашке `#9A2A20`**. Работает на любом фоне.

| Файл | Реальный формат | Размер | Фон | Что на фото |
|---|---|---|---|---|
| `media/Dynapac/dynapac1.png` | PNG | 608×720 | прозрачный | Виброплита (cutout) |
| `media/Dynapac/dynapac2.png` | **JPEG** | 1024×683 | белый | Двухвальцовый ручной каток |
| `media/Dynapac/dynapac3.png` | **JPEG** | 1024×683 | белый | Малый каток с сиденьем |

### 08 · Yanmar — `yanmar`

- Цвет: `#D90738` · Фото на карточке: **3**
- Каталог: https://www.yanmar.com/global/engine/products/diesel/aircooled/ (**дизельные двигатели с воздушным охлаждением**)

**Логотип** — `media/Yanmar/yanmar-logo.png` · PNG 507×112 · красный знак + «YANMAR» на **непрозрачном белом фоне**. На тёмном фоне будет белая плашка.

| Файл | Реальный формат | Размер | Фон | Что на фото |
|---|---|---|---|---|
| `media/Yanmar/yanmar1.png` | **JPEG** | 510×400 | белый | Дизельный двигатель |
| `media/Yanmar/yanmar2.png` | **AVIF** | 580×619 | белый | Дизельный двигатель (красный кожух) · ⚠️ AVIF не открывается в старых браузерах и редакторах |
| `media/Yanmar/yanmar3.png` | **JPEG** | 800×889 | белый | Мини-экскаватор |
| `media/Yanmar/yanmar4.png` | **JPEG** | 800×600 | белый | Гусеничный мини-погрузчик |

⚠️ **Расхождение:** ссылка на каталог ведёт только на двигатели, а на сайте Yanmar описан как «мини-экскаваторы, мини-погрузчики, двигатели и генераторы». Нужно решить, что BAYERN реально поставляет, и выровнять тексты (`yanmar.p1–p3`, `cat.compact` в `i18n.js`) или ссылку.

### 09 · Kern-Deudiam — `kern-deudiam`

- Цвет: `#3AADE1` · Фото на карточке: **3**
- Каталог: https://kern-deudiam.com/catalogues/kern-deudiam-diamond-tools-dubai/ (каталог алмазного инструмента, версия для Дубая)

**Логотип** — `media/Kern-Deudiam/kern-logo.png` · ⚠️ **JPEG** 1920×1080 · тёмно-синий знак «K» + «KERN DEUDIAM» на **белом фоне с большими пустыми полями**. Перед использованием нужно обрезать поля, лучше запросить SVG или PNG с прозрачным фоном.

| Файл | Реальный формат | Размер | Фон | Что на фото |
|---|---|---|---|---|
| `media/Kern-Deudiam/kern1.png` | **JPEG** | 651×750 | белый | Алмазная буровая коронка |
| `media/Kern-Deudiam/kern2.png` | **JPEG** | 768×768 | белый | Установка алмазного бурения на стойке |
| `media/Kern-Deudiam/kern3.png` | **WebP** | 640×452 | белый | Швонарезчик с алмазным диском |

## 4. Проблемы файлов (исправить перед подключением)

1. **Расширение не совпадает с форматом.** Браузеры такие файлы покажут, но редакторы, CMS и оптимизаторы могут сломаться. Переименовать или конвертировать:
   - JPEG с расширением `.png`: `dynapac2`, `dynapac3`, `imer1–4`, `kern-logo`, `kern1`, `kern2`, `yanmar1`, `yanmar3`, `yanmar4`
   - WebP с расширением `.png`: `enar1–5`, `hatz-logo`, `hatz1`, `hatz2`, `kern3`
   - AVIF с расширением `.png`: `yanmar2`
2. **Белые логотипы** (не видны на светлом фоне): ENAR (svg), Ofmer (png).
3. **Логотипы на непрозрачном фоне:** IMER (`#EFEFEF`), Yanmar (белый), Kern-Deudiam (белый, с полями), Dynapac (красная плашка — это нормально), Hatz (красный квадрат — это нормально).
4. **Маленькое разрешение:** логотип Geda (153×53), логотип Hatz (240×216), фото `weber3` (170×270).
5. **Тяжёлые файлы:** `geda1.png` 2.4 МБ и `geda2.png` 0.96 МБ — конвертировать в JPEG или WebP до ~300 КБ.
6. **Разный стиль фото:** у большинства брендов вырезанный товар на белом или прозрачном фоне, у Hatz — тёмные баннеры, у Geda — студийные и реальные кадры. Для единой сетки карточек фото лучше показывать с `object-fit: contain` на одинаковой светлой подложке.
7. **Разница xlsx и сайта:** цвет Hatz записан без `#`; каталог Yanmar — только двигатели (см. раздел 08).

## 5. Как это связано с текущим сайтом

- **Карусель «Портфель»** (`index.html`, `.carousel`) собрана по макету Figma «BAYERN — Portfolio cards template»: слои (фото, плашка, логотип) расставлены в % от сетки 360×480. Файлы — `assets/img/portfolio/<id>/` (скопированы из `media/` с правильными расширениями, тяжёлые PNG → WebP). Порядок: Weber MT, IMER, ENAR, Kern-Deudiam, Ofmer, Geda, Dynapac, Hatz, Yanmar. Клик по карточке ведёт к карточке бренда `#brand-<id>` в секции «Бренды».
- Цвета брендов на сайте **не используются** (решение заказчика) — оставлены здесь только как справка.
- Секция «Бренды»: коллаж из Figma одной картинкой `assets/img/photos/brands/<id>.webp` (подставляется сам) (шаблон — `tools/figma/templates/4-brands.svg`). Карточка и ссылки брендов в футере открывают официальный каталог (столбец «Каталог» выше) в новой вкладке; поле `catalog` в `tools/cards/brands.cjs`. Страница `catalog.html` пока не используется.

## 6. Данные в машиночитаемом виде

```json
[
  { "id": "weber-mt", "name": "Weber MT", "color": "#0082C7", "cardPhotos": 3,
    "catalogUrl": "https://katalog.webermt.com/FlipBook_WeberMT-Katalog2025-GB/",
    "logo": "media/Weber/WeberMT-Logo.png",
    "photos": ["media/Weber/weber1.png", "media/Weber/weber2.png", "media/Weber/weber3.png"] },
  { "id": "enar", "name": "ENAR", "color": "#FEA904", "cardPhotos": 3,
    "catalogUrl": "https://www.enargroup.com/eme/range/vibration/products",
    "logo": "media/Enar/enar-logo.svg", "logoOnDarkOnly": true,
    "photos": ["media/Enar/enar1.png", "media/Enar/enar2.png", "media/Enar/enar3.png", "media/Enar/enar4.png", "media/Enar/enar5.png"] },
  { "id": "ofmer", "name": "Ofmer", "color": "#46517A", "cardPhotos": 3,
    "catalogUrl": "https://www.ofmer.com/en/products-portfolio/",
    "logo": "media/Ofmer/OFMER_LOGO.png", "logoOnDarkOnly": true,
    "photos": ["media/Ofmer/ofmer1.png", "media/Ofmer/ofmer2.png", "media/Ofmer/ofmer3.png"] },
  { "id": "geda", "name": "Geda", "color": "#6078A3", "cardPhotos": 3,
    "catalogUrl": "https://www.geda.de/en/products/catalogue/",
    "logo": "media/Geda/geda_logo.png",
    "photos": ["media/Geda/geda1.png", "media/Geda/geda2.png", "media/Geda/geda3.png"] },
  { "id": "imer", "name": "IMER", "color": "#579F97", "cardPhotos": 3,
    "catalogUrl": "https://www.imergroup.com/en/products/",
    "logo": "media/Imer/Imer-logo.png",
    "photos": ["media/Imer/imer1.png", "media/Imer/imer2.png", "media/Imer/imer3.png", "media/Imer/imer4.png"] },
  { "id": "hatz", "name": "Hatz", "color": "#DA281B", "cardPhotos": 2,
    "catalogUrl": "https://hatz.com/en-global/products",
    "logo": "media/Hatz/hatz-logo.png",
    "photos": ["media/Hatz/hatz1.png", "media/Hatz/hatz2.png"] },
  { "id": "dynapac", "name": "Dynapac", "color": "#941818", "cardPhotos": 3,
    "catalogUrl": "https://dynapac.com/en/products/light-equipment?tab=products",
    "logo": "media/Dynapac/dynapac-logo.png",
    "photos": ["media/Dynapac/dynapac1.png", "media/Dynapac/dynapac2.png", "media/Dynapac/dynapac3.png"] },
  { "id": "yanmar", "name": "Yanmar", "color": "#D90738", "cardPhotos": 3,
    "catalogUrl": "https://www.yanmar.com/global/engine/products/diesel/aircooled/",
    "logo": "media/Yanmar/yanmar-logo.png",
    "photos": ["media/Yanmar/yanmar1.png", "media/Yanmar/yanmar2.png", "media/Yanmar/yanmar3.png", "media/Yanmar/yanmar4.png"] },
  { "id": "kern-deudiam", "name": "Kern-Deudiam", "color": "#3AADE1", "cardPhotos": 3,
    "catalogUrl": "https://kern-deudiam.com/catalogues/kern-deudiam-diamond-tools-dubai/",
    "logo": "media/Kern-Deudiam/kern-logo.png",
    "photos": ["media/Kern-Deudiam/kern1.png", "media/Kern-Deudiam/kern2.png", "media/Kern-Deudiam/kern3.png"] }
]
```

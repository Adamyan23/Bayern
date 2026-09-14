# BAYERN — Quality First

Лендинг официального представителя европейских и японских брендов строительной техники в Армении: Weber MT, ENAR, Ofmer, Geda, IMER, Hatz, Dynapac, Yanmar, Kern-Deudiam.

Статический сайт на **HTML + CSS + JavaScript**, без сборки и зависимостей. Три языка интерфейса: армянский (по умолчанию), английский, русский.

## Запуск

Можно просто открыть `index.html` в браузере. Для разработки удобнее локальный сервер:

```bash
python -m http.server 5500
```

и открыть <http://localhost:5500>.

## Структура

```
index.html                 — главная страница (лендинг)
catalog.html               — страница бренда (catalog.html?brand=weber-mt)
assets/
  css/style.css            — все стили: палитра, типографика, секции, адаптив
  js/i18n.js               — тексты на трёх языках + список брендов (window.BRANDS)
  js/main.js               — меню, язык, карусель, отрасли, FAQ, форма, фото
  js/glyph-portal.js       — анимация hero: камера «влетает» в букву E логотипа
  js/logo-shape.js         — векторный контур логотипа для анимации
  js/dotted-surface.js     — волна точек в секции «Контакты»
  img/
    logo-white.png / .svg  — логотип (белый)
    mark.svg               — знак «B.» (усечённый куб из фавикона)
    favicon.svg            — фавикон
    photos/                — фото сайта (см. assets/img/photos/README.md)
media/                     — исходные файлы логотипа и фавикона
```

## Секции главной

1. **Hero** — белый логотип на фото; при прокрутке камера входит в среднюю полосу буквы E.
2. **О компании** — коллаж из 3 фото, миссия, видение, 4 ценности.
3. **Портфель** — карусель карточек брендов (автопрокрутка, перетаскивание).
4. **Отрасли** — 5 сегментов с галереей и брендами.
5. **Бренды** — 9 карточек-ссылок на каталог.
6. **FAQ** — 5 вопросов.
7. **Контакты** — форма «клиент / подрядчик».
8. **Футер**.

## Как менять

- **Тексты** — `assets/js/i18n.js`, ключи одинаковые для `ru`, `en`, `hy`. Армянский перевод стоит проверить носителю языка.
- **Фото** — положить файлы в `assets/img/photos/…` по инструкции [assets/img/photos/README.md](assets/img/photos/README.md). Подставляются автоматически.
- **Цвета и шрифты** — переменные в начале `assets/css/style.css` (палитра из брендбука: Paper, Sand, Steel, Deep, Concrete, Copper; шрифты IBM Plex).
- **Новый бренд** — добавить в `window.BRANDS` и тексты в `i18n.js`, карточки в `index.html` (карусель и секция «Бренды»), фото в `photos/brands/`.
- **Анимация hero** — `initPortal()` в `main.js`: `scrollLength` (длина полёта), `enterGap` (сколько прокрутки от белого экрана до About).

## Что осталось сделать

- [ ] Реальные фото (см. инструкцию).
- [ ] Телефон в контактах и футере (сейчас `+374 (__) __-__-__`).
- [ ] Ссылки на Facebook и Instagram в футере (сейчас общие facebook.com / instagram.com).
- [ ] Отправка формы — сейчас только имитация (`initForm` в `main.js`, помечено `TODO`). Варианты: Formspree, почтовый сервис, CRM.
- [ ] Каталоги брендов — сейчас страница-заглушка.
- [ ] Проверка армянских текстов.

## Публикация на GitHub Pages

1. Создать репозиторий на GitHub и отправить код:
   ```bash
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
2. В репозитории: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)`**.
3. Сайт будет доступен по адресу `https://<user>.github.io/<repo>/`.

## Лицензии сторонних частей

- Анимация hero основана на **Glyph Portal** © 2026 Christian Katzmann (MIT) — уведомление сохранено в `assets/js/glyph-portal.js`.
- Иконки рукопожатия, Facebook и Instagram — **Lucide** (ISC).
- Шрифты IBM Plex и Noto Sans Armenian — Google Fonts (OFL).

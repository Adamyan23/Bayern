/* BAYERN — поведение лендинга и каталога */
(function () {
  'use strict';

  var LANGS = ['hy', 'en', 'ru'];
  var DEFAULT_LANG = 'hy';
  var STORAGE_KEY = 'bayern-lang';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page = document.body.dataset.page;
  var lang = DEFAULT_LANG;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------------- Фото ----------------
   * Фото подставляются автоматически: положите файл с нужным именем в assets/img/photos/…
   * Пока файла нет — остаётся заглушка. Полный список имён: assets/img/photos/README.md
   */

  var PHOTOS = 'assets/img/photos/';

  function loadPhoto(el, src) {
    if (!el) return;
    el._photoSrc = src;
    if (!src) { el.style.backgroundImage = ''; el.classList.remove('has-photo'); return; }
    var img = new Image();
    img.onload = function () {
      if (el._photoSrc !== src) return;
      el.style.backgroundImage = 'url("' + src + '")';
      el.classList.add('has-photo');
    };
    img.onerror = function () {
      if (el._photoSrc !== src) return;
      el.style.backgroundImage = '';
      el.classList.remove('has-photo');
    };
    img.src = src;
  }

  /* ---------------- i18n ---------------- */

  function t(key) {
    var dict = window.I18N[lang] || {};
    if (key in dict) return dict[key];
    if (key in window.I18N.ru) return window.I18N.ru[key];
    console.warn('[i18n] missing key:', key);
    return key;
  }

  function readStoredLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      return LANGS.indexOf(stored) > -1 ? stored : DEFAULT_LANG;
    } catch (e) { return DEFAULT_LANG; }
  }

  function applyLang(next) {
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* private mode */ }
    document.documentElement.lang = next;

    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $$('.lang__btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === next)); });

    document.title = page === 'catalog' && currentBrand
      ? currentBrand.name + ' — ' + t('meta.catalog') + ' · BAYERN'
      : t('meta.title');

    document.dispatchEvent(new CustomEvent('langchange'));
  }

  $$('.lang__btn').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.dataset.lang); });
  });

  /* ---------------- Nav ---------------- */

  var nav = $('#nav');
  var burger = $('.nav__burger');
  var menu = $('#mobileMenu');

  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(menu.hidden); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100 && !menu.hidden) setMenu(false); });
  }

  // Подсветка текущего раздела в навигации
  var navLinks = $$('.nav__links a');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var target = $(a.getAttribute('href'));
      if (target) sectionObserver.observe(target);
    });
  }

  /* ---------------- Scroll: nav ---------------- */

  var ticking = false;

  function onScroll() {
    var y = window.scrollY;

    if (nav && !nav.classList.contains('is-solid')) {
      nav.classList.toggle('is-scrolled', y > 40);
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------------- Reveal ---------------- */

  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- Карусель брендов ---------------- */

  function initCarousel(root) {
    var track = $('.carousel__track', root);
    var originals = Array.prototype.slice.call(track.children);
    // два клона набора — лента всегда шире экрана
    for (var c = 0; c < 2; c++) {
      originals.forEach(function (card) {
        var clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('tabindex', '-1');
        track.appendChild(clone);
      });
    }

    var x = 0, setWidth = 0, last = performance.now();
    var speed = 42; // px/s
    var hovered = false, dragging = false, visible = true, focused = false;
    var startX = 0, startPos = 0, moved = 0;

    function measure() {
      var first = track.children[0];
      var firstClone = track.children[originals.length];
      setWidth = firstClone.offsetLeft - first.offsetLeft;
    }

    function wrap() {
      if (setWidth <= 0) return;
      while (x <= -setWidth) x += setWidth;
      while (x > 0) x -= setWidth;
    }

    function frame(now) {
      var dt = Math.min(64, now - last) / 1000;
      last = now;
      if (!dragging && !hovered && !focused && visible && !reduceMotion) {
        x -= speed * dt;
      }
      wrap();
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
      requestAnimationFrame(frame);
    }

    root.addEventListener('mouseenter', function () { hovered = true; });
    root.addEventListener('mouseleave', function () { hovered = false; });
    root.addEventListener('focusin', function () { focused = true; });
    root.addEventListener('focusout', function () { focused = false; });

    root.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startPos = x;
      root.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      x = startPos + dx;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      root.classList.remove('is-dragging');
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // перетаскивание не должно открывать ссылку
    root.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    root.addEventListener('dragstart', function (e) { e.preventDefault(); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(root);
    }

    measure();
    window.addEventListener('resize', measure);
    document.addEventListener('langchange', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    requestAnimationFrame(frame);
  }

  /* ---------------- Hero: Glyph Portal ---------------- */

  function initPortal() {
    var section = $('[data-gp]');
    var logo = window.BAYERN_LOGO;
    if (!section || !window.GlyphPortal || !logo) return;

    // Точка входа — середина средней полосы буквы E («три полосы» из знака)
    var entry = logo.targets.filter(function (p) {
      return p.x > logo.width * 0.5 && p.x < logo.width * 0.66 && p.y > logo.height * 0.25 && p.y < logo.height * 0.45;
    })[0];

    window.GlyphPortal.mount(section, {
      shape: { width: logo.width, height: logo.height, d: logo.d, target: entry },
      label: 'BAYERN — Quality First',
      fill: 0.92,          // ширина логотипа = ширина контейнера, как в исходном hero
      scrollLength: 2.2,
      enterGap: 260        // px прокрутки от белого экрана до About (~2 шага колеса)
    });
  }

  /* ---------------- Отрасли ---------------- */

  var SEGMENTS = {
    1: { tags: ['Weber MT', 'ENAR', 'Ofmer', 'Geda', 'IMER', 'Kern-Deudiam', 'Yanmar'], tints: ['steel', 'sand', 'concrete', 'paper'] },
    2: { tags: ['Weber MT', 'Dynapac', 'Yanmar', 'Hatz'], tints: ['concrete', 'steel', 'sand', 'deep'] },
    3: { tags: ['ENAR', 'Ofmer', 'Kern-Deudiam'], tints: ['sand', 'concrete', 'steel', 'paper'] },
    4: { tags: ['Weber MT', 'Dynapac', 'Yanmar', 'Geda', 'IMER', 'Hatz'], tints: ['paper', 'steel', 'deep', 'sand'] },
    5: { tags: ['Hatz', 'Yanmar'], tints: ['sand', 'paper', 'concrete', 'steel'] }
  };

  function initIndustries() {
    var items = $$('.ind__item');
    if (!items.length) return;
    var desc = $('.ind__desc');
    var tags = $('[data-ind-tags]');
    var gallery = $('[data-ind-gallery]');
    var phs = $$('.ph', gallery);
    var current = 0;

    function activate(n, focus) {
      if (n === current) return;
      current = n;
      items.forEach(function (item) {
        var on = Number(item.dataset.ind) === n;
        item.classList.toggle('is-active', on);
        item.setAttribute('aria-selected', String(on));
        item.tabIndex = on ? 0 : -1;
        if (on && focus) item.focus();
      });

      var seg = SEGMENTS[n];
      desc.dataset.i18n = 'ind.' + n + '.text';
      desc.textContent = t(desc.dataset.i18n);
      tags.innerHTML = seg.tags.map(function (name) { return '<li>' + name + '</li>'; }).join('');

      phs.forEach(function (ph, i) {
        ph.className = ph.className.replace(/ph--\w+/, 'ph--' + seg.tints[i]);
        $$('[data-ind-num]', ph).forEach(function (num) { num.textContent = '0' + n; });
        loadPhoto(ph, PHOTOS + 'industries/0' + n + '-' + (i + 1) + '.jpg');
      });
      gallery.classList.remove('is-swapping');
      void gallery.offsetWidth; // перезапуск анимации
      gallery.classList.add('is-swapping');
    }

    items.forEach(function (item) {
      var n = Number(item.dataset.ind);
      item.addEventListener('click', function () { activate(n); });
      item.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: hover)').matches) activate(n);
      });
      item.addEventListener('keydown', function (e) {
        var dir = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        activate(((current - 1 + dir + items.length) % items.length) + 1, true);
      });
    });

    current = 0;
    activate(1);
    gallery.classList.remove('is-swapping');
  }

  /* ---------------- FAQ ---------------- */

  function initFaq() {
    var items = $$('.faq__item');
    items.forEach(function (item) {
      var btn = $('.faq__q', item);
      btn.addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        items.forEach(function (other) {
          other.classList.remove('is-open');
          $('.faq__q', other).setAttribute('aria-expanded', 'false');
        });
        if (open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------------- Форма ---------------- */

  function initForm() {
    var form = $('#contactForm');
    if (!form) return;
    var card = form.closest('.contact__card');
    var success = $('.form__success', card);
    var tabs = $$('.tabs [data-mode]', card);
    var message = form.elements.message;
    var submitBtn = $('button[type="submit"]', form);
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setMode(mode) {
      form.elements.type.value = mode;
      tabs.forEach(function (tab) { tab.setAttribute('aria-selected', String(tab.dataset.mode === mode)); });
      $$('[data-only]', form).forEach(function (el) { el.hidden = el.dataset.only !== mode; });
      message.dataset.i18nPh = mode === 'client' ? 'contact.msgClient' : 'contact.msgPartner';
      message.placeholder = t(message.dataset.i18nPh);
    }
    tabs.forEach(function (tab) { tab.addEventListener('click', function () { setMode(tab.dataset.mode); }); });

    function fieldError(input) {
      if (input.type === 'checkbox') return input.required && !input.checked ? 'contact.required' : '';
      var value = input.value.trim();
      if (input.required && !value) return 'contact.required';
      if (input.type === 'email' && value && !EMAIL_RE.test(value)) return 'contact.invalidEmail';
      return '';
    }

    function showError(input, key) {
      var field = input.closest('.field');
      var errorEl = $('.field__error', field);
      field.classList.toggle('is-invalid', !!key);
      input.setAttribute('aria-invalid', String(!!key));
      if (errorEl) {
        errorEl.dataset.i18n = key || '';
        errorEl.textContent = key ? t(key) : '';
        if (!key) delete errorEl.dataset.i18n;
      }
    }

    var checked = $$('input[required]', form);
    checked.forEach(function (input) {
      var evt = input.type === 'checkbox' ? 'change' : 'input';
      input.addEventListener(evt, function () {
        if (input.closest('.field').classList.contains('is-invalid')) showError(input, fieldError(input));
      });
      input.addEventListener('blur', function () {
        if (input.type !== 'checkbox' && input.value.trim()) showError(input, fieldError(input));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      checked.forEach(function (input) {
        var key = fieldError(input);
        showError(input, key);
        if (key && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      submitBtn.disabled = true;
      // TODO: подключить отправку (почта / CRM / Formspree). Сейчас — имитация.
      var payload = Object.fromEntries(new FormData(form).entries());
      console.info('[form] request', payload);
      setTimeout(function () {
        submitBtn.disabled = false;
        form.reset();
        setMode(payload.type);
        form.hidden = true;
        $('.tabs', card).hidden = true;
        success.hidden = false;
      }, 700);
    });

    $('[data-form-again]', card).addEventListener('click', function () {
      success.hidden = true;
      form.hidden = false;
      $('.tabs', card).hidden = false;
      form.elements.name.focus();
    });

    setMode('client');
  }

  /* ---------------- Каталог (заглушка) ---------------- */

  var currentBrand = null;

  function initCatalog() {
    var id = new URLSearchParams(location.search).get('brand');
    currentBrand = window.BRANDS.filter(function (b) { return b.id === id; })[0] || window.BRANDS[0];
    var b = currentBrand;
    var index = window.BRANDS.indexOf(b) + 1;

    $$('[data-brand-name]').forEach(function (el) { el.textContent = b.name; });
    $('[data-brand-num]').textContent = String(index).padStart(2, '0') + ' · ' + b.country.toUpperCase();
    $('[data-brand-country]').dataset.i18n = 'country.' + b.country;
    $('[data-brand-cat]').dataset.i18n = 'cat.' + b.cat;
    $$('[data-brand-product]').forEach(function (li, i) { li.dataset.i18n = b.key + '.p' + (i + 1); });
    loadPhoto($('.catalog__media .ph'), PHOTOS + 'brands/' + b.id + '.jpg');
  }

  /* ---------------- Init ---------------- */

  if (page === 'catalog') initCatalog();
  applyLang(readStoredLang());

  var carousel = $('[data-carousel]');
  if (carousel) initCarousel(carousel);
  initPortal();
  $$('[data-photo]').forEach(function (el) { loadPhoto(el, el.dataset.photo); });
  // Секция «Контакты»: волна точек (DottedSurface) цвета футера (Bayern Deep), скорость −15%
  var dots = $('[data-dotted-surface]');
  if (dots && window.DottedSurface) window.DottedSurface.mount(dots, { size: 8, opacity: 0.6, color: '78,107,120', speed: 0.85 });
  initIndustries();
  initFaq();
  initForm();
  onScroll();
})();

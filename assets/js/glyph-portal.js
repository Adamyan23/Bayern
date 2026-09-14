/*!
 * Glyph Portal © 2026 Christian Katzmann. MIT.
 * Origin: UsefulPortal.astro on https://ktzm.dk → UsefulPortal.tsx → ClarityPortal.tsx.
 * A scroll-driven camera through live type. Keep this notice with copies.
 *
 * Vanilla JS port for BAYERN (no React). Markup lives in index.html
 * (data-gp-* attributes), styles in assets/css/style.css (.gp).
 *
 * GlyphPortal.mount(section, {
 *   word, focusChar, interactive, fontFamily, fontWeight, scrollLength,
 *   labels: { choose(), entry(), pick(), letter(char, i, n) }, onProgress(p),
 *   // BAYERN: вместо живого текста — векторный контур (логотип). <path data-gp-glyph> в clipPath.
 *   shape: { width, height, d, target: { x, y, radius } }, fill: 0.84, label,
 *   enterGap: px — если задан, контент начинается через столько px после белого экрана (а не в конце travel)
 * }) → { relabel(), destroy() }
 */
(function (global) {
  'use strict';

  var DEFAULT_FONT = '"Arial Black", "Arial", sans-serif';
  var clamp = function (n, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, n)); };
  var smooth = function (a, b, n) { var t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); };

  /** Largest opaque square, in linear time. Unlike a stem guess, it works in O, S and Ø. */
  function interior(context, char, font) {
    var canvas = context.canvas;
    context.font = font;
    var m = context.measureText(char);
    var pad = 8;
    var left = Math.ceil(m.actualBoundingBoxLeft);
    var ascent = Math.ceil(m.actualBoundingBoxAscent);
    canvas.width = Math.max(1, Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2);
    canvas.height = Math.max(1, Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2);
    context.font = font;
    context.fontKerning = 'none';
    context.fillText(char, pad + left, pad + ascent);
    var width = canvas.width, height = canvas.height;
    var pixels = context.getImageData(0, 0, width, height).data;
    var rows = new Uint16Array(width + 1);
    var size = 0, bx = 0, by = 0;
    for (var y = 0; y < height; y++) {
      var diagonal = 0;
      for (var x = 0; x < width; x++) {
        var above = rows[x + 1];
        rows[x + 1] = pixels[(y * width + x) * 4 + 3] > 245 ? Math.min(above, rows[x], diagonal) + 1 : 0;
        diagonal = above;
        if (rows[x + 1] > size) { size = rows[x + 1]; bx = x; by = y; }
      }
    }
    if (size < 3) return null;
    // Scan at 3× SVG size. Inscribe a disk in the square, with room for raster disagreement.
    return { x: (bx + 1 - size / 2 - pad - left) / 3, y: (by + 1 - size / 2 - pad - ascent) / 3, radius: (size / 2 - 1) / 3 };
  }

  function scrollParent(element) {
    for (var p = element.parentElement; p; p = p.parentElement) {
      if (/(auto|scroll|hidden)/.test(getComputedStyle(p).overflowY) && p !== document.body && p !== document.documentElement) return p;
    }
    return null;
  }

  function mount(section, options) {
    options = options || {};
    var text = String(options.word || 'SUBLIME').trim().normalize('NFC') || 'SUBLIME';
    var focusChar = options.focusChar;
    var interactive = options.interactive !== false;
    var fontFamily = options.fontFamily || DEFAULT_FONT;
    var weight = Number.isFinite(options.fontWeight) ? clamp(options.fontWeight, 1, 1000) : 900;
    var length = Number.isFinite(options.scrollLength) ? clamp(options.scrollLength, 1, 8) : 2.4;
    var labels = options.labels || {};
    var onProgress = options.onProgress;
    var shape = options.shape || null;
    var fill = Number.isFinite(options.fill) ? clamp(options.fill, 0.2, 1) : 0.84;
    if (shape) interactive = false;
    var enterGap = Number.isFinite(options.enterGap) ? Math.max(0, options.enterGap) : null;
    var ZOOM_END = 0.78; // доля travel, на которой камера целиком «внутри»

    var pin = section.querySelector('[data-gp-pin]');
    var field = section.querySelector('[data-gp-field]');
    var art = section.querySelector('[data-gp-art]');
    var clip = section.querySelector('clipPath');
    var clipId = clip.id;
    var glyph = section.querySelector('[data-gp-glyph]');
    var marks = section.querySelector('[data-gp-marks]');
    var choices = section.querySelector('[data-gp-choices]');
    var picker = section.querySelector('[data-gp-select]');
    var pickerLabel = section.querySelector('[data-gp-touch-picker] [data-gp-sr]');
    var hasFront = !!section.querySelector('[data-gp-front]');

    /* --- Static markup derived from the word --- */
    var characters = [];
    var characterOffset = 0;
    if (!shape) Array.from(text).forEach(function (char) { characters.push({ char: char, index: characterOffset }); characterOffset += char.length; });

    section.setAttribute('aria-label', options.label || text);
    section.style.setProperty('--gp-length', String(length));
    section.style.setProperty('--gp-characters', String(Math.max(1, characters.length)));
    if (shape) {
      glyph.setAttribute('d', shape.d);
      glyph.setAttribute('clip-rule', 'evenodd');
    } else {
      glyph.textContent = text;
      Object.assign(glyph.style, { fontFamily: fontFamily, fontWeight: String(weight), fontSize: '100px', fontKerning: 'none', fontVariantLigatures: 'none', letterSpacing: '0' });
      var fallback = section.querySelector('[data-gp-fallback]');
      if (fallback) { fallback.textContent = text; fallback.style.fontFamily = fontFamily; fallback.style.fontWeight = String(weight); }
    }

    choices.innerHTML = '';
    picker.innerHTML = '';
    var placeholder = document.createElement('option');
    placeholder.value = ''; placeholder.disabled = true; placeholder.selected = true;
    picker.appendChild(placeholder);
    var buttons = characters.map(function (c) {
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', 'false');
      button.tabIndex = -1;
      button.dataset.gpLetter = String(c.index);
      choices.appendChild(button);
      var option = document.createElement('option');
      option.value = String(c.index);
      picker.appendChild(option);
      return button;
    });

    function relabel() {
      var n = characters.length;
      choices.setAttribute('aria-label', labels.choose ? labels.choose() : 'Choose the letter to enter through');
      if (pickerLabel) pickerLabel.textContent = labels.entry ? labels.entry() : 'Entry letter';
      placeholder.textContent = labels.pick ? labels.pick() : 'Choose a letter';
      characters.forEach(function (c, i) {
        buttons[i].setAttribute('aria-label', labels.letter ? labels.letter(c.char, i + 1, n) : c.char + ', letter ' + (i + 1) + ' of ' + n);
        picker.options[i + 1].textContent = (i + 1) + ' · ' + c.char;
      });
    }
    relabel();

    /* --- Engine (port of the React useLayoutEffect) --- */
    var root = scrollParent(section);
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d', { willReadFrequently: true });
    var disposed = false, raf = 0, dirty = true, active = true, ready = false;
    var mountedAt = performance.now();
    var browserFrameSeen = false, stalled = false;
    var W = 1, H = 1, travel = 1, startScale = 1, endScale = 1;
    var center = { x: 0, y: 0 }, target = null;
    var lastProgress = -1;
    var candidates = [], letters = [];
    var choosing = false;
    var bounds = { x: 0, y: 0, width: 1, height: 1 };
    var fontDirty = true;

    // Freeze an available face for this mount. Late font swaps move the ink under the camera.
    // Preload custom faces before mounting; pending/failed faces use the supplied fallback stack.
    if (!shape) {
    glyph.style.fontFamily = fontFamily;
    var computedFamily = getComputedStyle(glyph).fontFamily;
    var families = computedFamily.match(/(?:[^,"']+|"[^"]*"|'[^']*')+/g) || [];
    var available = families.filter(function (family) {
      try { return document.fonts.check(weight + ' 100px ' + family.trim(), text); }
      catch (e) { return false; }
    });
    glyph.style.fontFamily = available.concat(DEFAULT_FONT).join(',');
    // A pending requested face may also hold WebKit's render loop. Keep that mount static.
    stalled = available.length < families.length;
    }

    function readInk() {
      if (shape) {
        bounds = { x: 0, y: 0, width: shape.width, height: shape.height };
        center = { x: shape.width / 2, y: shape.height / 2 };
        target = shape.target ? { x: shape.target.x, y: shape.target.y, radius: shape.target.radius, index: 0 } : null;
        candidates = target ? [target] : [];
        letters = [];
        return true;
      }
      if (!context) return false;
      var font = getComputedStyle(glyph);
      var scanFont = font.fontWeight + ' 300px ' + font.fontFamily;
      context.font = font.fontWeight + ' 100px ' + font.fontFamily;
      context.fontKerning = 'none';
      var metrics = context.measureText(text);
      var advances = [];
      for (var i = 0; i < text.length; i++) advances.push(context.measureText(text.slice(0, i)).width);
      // SVG getBBox includes the font's line box in some engines. Frame visible ink instead.
      bounds = {
        x: -metrics.actualBoundingBoxLeft, y: -metrics.actualBoundingBoxAscent,
        width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
      };
      if (!bounds.width || !bounds.height) return false;
      center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
      var requested = focusChar ? text.indexOf(focusChar.normalize('NFC')) : -1;
      var offset = 0;
      candidates = []; letters = [];
      Array.from(text).forEach(function (char) {
        context.font = font.fontWeight + ' 100px ' + font.fontFamily;
        var m = context.measureText(char);
        letters.push({
          index: offset, x: advances[offset] - m.actualBoundingBoxLeft, y: -m.actualBoundingBoxAscent,
          width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
        });
        var found = interior(context, char, scanFont);
        if (found) candidates.push({ x: found.x + advances[offset], y: found.y, radius: found.radius, index: offset });
        offset += char.length;
      });
      target = candidates.filter(function (c) { return c.index === requested; })[0] ||
        candidates.slice().sort(function (a, b) { return b.radius - a.radius || Math.abs(a.x - center.x) - Math.abs(b.x - center.x); })[0] || null;
      return true;
    }

    function hasCandidate(index) { return candidates.some(function (c) { return c.index === index; }); }

    function select(next) {
      target = next;
      endScale = target ? Math.max(startScale, Math.hypot(W, H) / (target.radius * 1.35)) : startScale;
      section.dataset.gpFocus = target ? (shape ? 'shape' : Array.from(text.slice(target.index))[0]) : '';
      section.dataset.gpFocusIndex = String(target ? target.index : -1);
      buttons.forEach(function (button) {
        var index = Number(button.dataset.gpLetter);
        var selected = target && index === target.index;
        button.disabled = !hasCandidate(index);
        button.setAttribute('aria-checked', String(!!selected));
        button.tabIndex = selected ? 0 : -1;
      });
      if (picker.value !== '') picker.value = String(target ? target.index : -1);
      Array.from(picker.options).forEach(function (option) {
        option.disabled = option.value === '' || !hasCandidate(Number(option.value));
      });
      var u = 1 / startScale;
      var y = bounds.y + bounds.height + 25 * u;
      var x = bounds.x;
      var right = x + bounds.width;
      var cross = target ? 'M' + (target.x - 9 * u) + ' ' + target.y + 'h' + (18 * u) + 'M' + target.x + ' ' + (target.y - 9 * u) + 'v' + (18 * u) : '';
      var annotationPath = marks.querySelector('path');
      annotationPath.setAttribute('d', 'M' + x + ' ' + y + 'H' + right + 'M' + x + ' ' + (y - 5 * u) + 'v' + (10 * u) + 'M' + right + ' ' + (y - 5 * u) + 'v' + (10 * u) + cross);
      annotationPath.setAttribute('stroke-width', String(u));
    }

    function position() {
      var origin = root ? root.getBoundingClientRect().top + root.clientTop : 0;
      return clamp((origin - section.getBoundingClientRect().top) / travel);
    }

    function paint(progress) {
      var isStatic = motion.matches || !browserFrameSeen || stalled || !target;
      var p = isStatic ? 0 : progress;
      var t = clamp(p / ZOOM_END);
      var eased = t < 0.5 ? 4 * Math.pow(t, 3) : 1 - Math.pow(-2 * t + 2, 3) / 2;
      var scale = Math.exp(Math.log(startScale) + Math.log(endScale / startScale) * eased);
      var blend = endScale === startScale ? 0 : (1 / scale - 1 / startScale) / (1 / endScale - 1 / startScale);
      var tx = target ? target.x : center.x, ty = target ? target.y : center.y;
      var cx = center.x + (tx - center.x) * blend;
      var cy = center.y + (ty - center.y) * blend;
      var roll = -4 * smooth(0.06, 0.5, t) * (1 - smooth(0.62, 0.92, t));
      var transform = 'translate(' + (W / 2) + ' ' + (H * 0.46 + H * 0.04 * eased) + ') scale(' + scale + ') rotate(' + roll + ') translate(' + (-cx) + ' ' + (-cy) + ')';
      // Keep scale on the clip to avoid text paint limits. Text-local translation
      // follows page zoom in WebKit; translation on an HTML clip reference does not.
      var radians = roll * Math.PI / 180;
      var dx = W / 2 / scale, dy = (H * 0.46 + H * 0.04 * eased) / scale;
      clip.setAttribute('transform', 'scale(' + scale + ') rotate(' + roll + ')');
      glyph.setAttribute('transform', 'translate(' + (Math.cos(radians) * dx + Math.sin(radians) * dy - cx) + ' ' + (-Math.sin(radians) * dx + Math.cos(radians) * dy - cy) + ')');
      marks.setAttribute('transform', transform);
      marks.style.opacity = String(1 - smooth(0.015, 0.17, p));
      choosing = interactive && !isStatic && p < 0.04;
      choices.inert = !choosing;
      section.dataset.gpChoosing = String(choosing);
      // Drop the clip only after the camera has already filled the viewport with ink.
      field.style.clipPath = t >= 1 ? 'none' : 'url(#' + clipId + ')';
      section.style.setProperty('--gp-caption', String(1 - smooth(0.01, 0.16, p)));
      var revealEnd = enterGap === null ? 0.9 : ZOOM_END + Math.min(0.12, 140 / travel);
      section.style.setProperty('--gp-reveal', String(isStatic ? 1 : smooth(ZOOM_END, revealEnd, p)));
      section.style.setProperty('--gp-field-scale', String(1 + 0.16 * smooth(0, 0.82, p)));
      section.style.setProperty('--gp-caption-hit', p < 0.08 ? 'auto' : 'none');
      section.dataset.gpEntered = String(p >= revealEnd);
      section.dataset.gpProgress = p.toFixed(5);
      if (p !== lastProgress) { lastProgress = p; if (onProgress) onProgress(p); }
    }

    function layout() {
      if (!section.clientWidth) return;
      W = pin.clientWidth;
      // A 100svh probe keeps browser chrome from continually changing the scroll distance.
      var smallViewport = section.querySelector('[data-gp-viewport]').offsetHeight;
      var viewportHeight = Math.max(1, Math.min(root ? root.clientHeight : smallViewport, smallViewport));
      H = motion.matches ? Math.min(viewportHeight * 0.75, 480) : viewportHeight;
      section.style.setProperty('--gp-height', H + 'px');
      travel = H * length;
      // Смещение контента: по умолчанию (length − 1)·H, с enterGap — сразу после белого экрана
      section.style.setProperty('--gp-content-offset', (enterGap === null ? (length - 1) * H : Math.max(0, travel * ZOOM_END + enterGap - H)) + 'px');
      art.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      if (fontDirty) { ready = readInk(); fontDirty = false; }
      if (!ready) return;
      var wordHeight = hasFront && H < 480 ? Math.min(H * 0.38, Math.max(24, H - 264)) : H * 0.38;
      startScale = Math.min(W * fill / bounds.width, wordHeight / bounds.height);
      // The whole viewport fits inside measured ink, even with the small camera bank.
      select(target);
      buttons.forEach(function (button) {
        var letter = letters.filter(function (item) { return item.index === Number(button.dataset.gpLetter); })[0];
        Object.assign(button.style, {
          left: (W / 2 + (letter.x - center.x) * startScale) + 'px',
          top: (H * 0.46 + (letter.y - center.y) * startScale - Math.max(0, 44 - letter.height * startScale) / 2) + 'px',
          width: Math.max(1, letter.width * startScale) + 'px',
          height: Math.max(44, letter.height * startScale) + 'px'
        });
      });
      section.style.setProperty('--gp-word-top', (H * 0.46 - bounds.height * startScale / 2) + 'px');
      section.style.setProperty('--gp-word-bottom', (H * 0.46 + bounds.height * startScale / 2) + 'px');
      section.dataset.gpReady = 'true';
      section.dataset.gpMotion = !motion.matches && browserFrameSeen && !stalled && target ? 'on' : 'off';
    }

    function frame(time) {
      raf = 0;
      if (disposed) return;
      if (time !== undefined && !browserFrameSeen) {
        browserFrameSeen = true; stalled = stalled || performance.now() - mountedAt > 2500; dirty = true;
      }
      if (dirty) { dirty = false; layout(); }
      if (ready) paint(position());
    }
    function schedule() { if (!raf && active) raf = requestAnimationFrame(frame); }
    function resize() { cancelAnimationFrame(raf); dirty = true; frame(); }
    function scroll() { schedule(); }
    function choose(event) {
      if (!choosing || position() >= 0.04) return;
      var button = event.target.closest && event.target.closest('[data-gp-letter]');
      var next = button ? candidates.filter(function (c) { return c.index === Number(button.dataset.gpLetter); })[0] : null;
      if (!next || next === target) return;
      select(next); paint(position());
    }
    function navigate(event) {
      if (!choosing || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].indexOf(event.key) < 0) return;
      event.preventDefault();
      var current = candidates.indexOf(target);
      var index = event.key === 'Home' ? 0 : event.key === 'End' ? candidates.length - 1
        : (current + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + candidates.length) % candidates.length;
      var button = buttons.filter(function (b) { return Number(b.dataset.gpLetter) === candidates[index].index; })[0];
      if (button) button.focus({ preventScroll: true });
    }
    function pick() {
      if (!choosing || position() >= 0.04) return;
      var next = candidates.filter(function (c) { return c.index === Number(picker.value); })[0];
      if (next) { select(next); paint(position()); }
    }

    choices.addEventListener('pointerover', choose);
    choices.addEventListener('click', choose);
    choices.addEventListener('focusin', choose);
    choices.addEventListener('keydown', navigate);
    picker.addEventListener('change', pick);
    var observer = new ResizeObserver(resize);
    observer.observe(section);
    if (root) observer.observe(root);
    var visibility = new IntersectionObserver(function (entries) {
      active = entries[0].isIntersecting;
      if (active) { dirty = true; schedule(); }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { root: root, rootMargin: '100% 0px' });
    visibility.observe(section);
    (root || window).addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
    motion.addEventListener('change', resize);
    frame();
    // WebKit can withhold frames, timers and scroll events behind an initial hung font.
    // Begin in reading flow. Enable motion only when the browser starts rendering promptly.
    schedule();

    return {
      relabel: relabel,
      destroy: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        observer.disconnect();
        visibility.disconnect();
        (root || window).removeEventListener('scroll', scroll);
        window.removeEventListener('resize', resize);
        if (window.visualViewport) window.visualViewport.removeEventListener('resize', resize);
        motion.removeEventListener('change', resize);
        choices.removeEventListener('pointerover', choose);
        choices.removeEventListener('click', choose);
        choices.removeEventListener('focusin', choose);
        choices.removeEventListener('keydown', navigate);
        picker.removeEventListener('change', pick);
      }
    };
  }

  global.GlyphPortal = { mount: mount };
})(window);

/*!
 * Dotted Surface — vanilla Canvas 2D port of the DottedSurface React/three.js component
 * (PointsMaterial grid 40×60, sine waves, perspective camera). No three.js / React needed.
 *
 * DottedSurface.mount(container, { size, opacity, color, speed }) → { destroy() }
 * speed: 1 = оригинал (count += 0.1 за кадр при 60 fps)
 */
(function (global) {
  'use strict';

  var SEPARATION = 150;
  var AMOUNTX = 40;
  var AMOUNTY = 60;
  var CAMERA = { x: 0, y: 355, z: 1220, fov: 60, near: 1 };
  var FOG = { near: 2000, far: 10000 };

  function mount(container, options) {
    options = options || {};
    var size = options.size || 8;
    var opacity = options.opacity === undefined ? 0.8 : options.opacity;
    var color = options.color || '255,255,255';
    var speed = options.speed === undefined ? 1 : options.speed;
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    // Базовая сетка точек (x, z); y считается каждый кадр
    var grid = new Float32Array(AMOUNTX * AMOUNTY * 2);
    var i = 0;
    for (var ix = 0; ix < AMOUNTX; ix++) {
      for (var iy = 0; iy < AMOUNTY; iy++) {
        grid[i++] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        grid[i++] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
      }
    }

    var W = 1, H = 1, dpr = 1, focal = 1;
    var count = 0, last = 0, raf = 0, visible = false, disposed = false;

    function resize() {
      var rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      focal = (H / 2) / Math.tan((CAMERA.fov * Math.PI / 180) / 2);
      draw();
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var k = 0;
      for (var ix = 0; ix < AMOUNTX; ix++) {
        for (var iy = 0; iy < AMOUNTY; iy++) {
          var x = grid[k++], z = grid[k++];
          var y = Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50;
          var depth = CAMERA.z - z; // расстояние вдоль взгляда камеры (-Z)
          if (depth <= CAMERA.near) continue;
          var sx = W / 2 + ((x - CAMERA.x) * focal) / depth;
          var sy = H / 2 - ((y - CAMERA.y) * focal) / depth;
          // sizeAttenuation как в three.js: size * (height / 2) / depth
          var s = Math.max(0.6, size * (H / 2) / depth);
          if (sx < -s || sx > W + s || sy < -s || sy > H + s) continue;
          var fog = Math.min(1, Math.max(0, (depth - FOG.near) / (FOG.far - FOG.near)));
          var a = opacity * (1 - fog);
          if (a <= 0.01) continue;
          ctx.fillStyle = 'rgba(' + color + ',' + a.toFixed(3) + ')';
          ctx.fillRect(sx - s / 2, sy - s / 2, s, s); // квадратные точки, как у PointsMaterial
        }
      }
    }

    function frame(now) {
      raf = 0;
      if (disposed || !visible || motion.matches) return;
      var dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      count += 0.1 * 60 * dt * speed;
      draw();
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible && !motion.matches) { last = 0; raf = requestAnimationFrame(frame); } }

    var io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: '120px 0px' });
    io.observe(container);
    var ro = new ResizeObserver(resize);
    ro.observe(container);
    motion.addEventListener('change', function () { draw(); start(); });
    resize();

    return {
      destroy: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        canvas.remove();
      }
    };
  }

  global.DottedSurface = { mount: mount };
})(window);

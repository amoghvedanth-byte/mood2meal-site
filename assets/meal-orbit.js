/* Meal orbit carousel for the home page hero. Motion drives every movement; with reduced motion
   (or if Motion fails to load) meals change instantly and the carousel still works. */
(function () {
  var root = document.querySelector('[data-orbit]');
  if (!root) return;

  var M = window.Motion;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var moving = function () { return !!M && !reduced.matches; };

  var plates = [].slice.call(root.querySelectorAll('.orbit-plate'));
  var copies = [].slice.call(root.querySelectorAll('.orbit-copy'));
  var dots = [].slice.call(root.querySelectorAll('.orbit-dot'));
  var thumbs = [].slice.call(root.querySelectorAll('.orbit-thumb'));
  var band = root.querySelector('.orbit-band path');
  var live = root.querySelector('.orbit-sr');
  var stage = root.querySelector('.orbit-stage');
  var n = plates.length;
  if (n < 2) return;

  var SWING = 42;                  // degrees a plate travels round the pivot above the stage
  var R = 246, W = 62;             // band radius and thickness, in band viewBox units (plate edge is at 200)
  // Resting spans in degrees (0 = right, 90 = down). All stay below the plate's top edge so the band never sits behind the hero text.
  var REST = [[100, 210], [-25, 90], [35, 160], [140, 232]];
  var ease = [0.2, 0.7, 0.2, 1];
  var current = 0;
  var arc = { a0: REST[0][0], a1: REST[0][1] };
  var run = null;                  // the swap in progress: { controls, timer, finish }

  root.classList.add('orbit-js');

  function rest(i) { return REST[i % REST.length]; }
  function wrap(i) { return ((i % n) + n) % n; }

  // A thick stroke along a circle round the plate, tapering to points at both ends.
  function arcPath(a0, a1) {
    var out = [], inn = [], steps = 48;
    for (var s = 0; s <= steps; s++) {
      var t = s / steps;
      var a = ((a0 + (a1 - a0) * t) * Math.PI) / 180;
      var h = (W / 2) * Math.pow(Math.sin(Math.PI * t), 0.45);
      var c = Math.cos(a), si = Math.sin(a);
      out.push((c * (R + h)).toFixed(1) + ' ' + (si * (R + h)).toFixed(1));
      inn.push((c * (R - h)).toFixed(1) + ' ' + (si * (R - h)).toFixed(1));
    }
    return 'M' + out.join('L') + 'L' + inn.reverse().join('L') + 'Z';
  }
  function drawArc() { band.setAttribute('d', arcPath(arc.a0, arc.a1)); }
  // Shift a resting span by whole turns so the band takes the short way to it.
  function near(span, ref) {
    var k = Math.round((ref - span[0]) / 360);
    return [span[0] + k * 360, span[1] + k * 360];
  }

  function parts(i) {
    var c = copies[i];
    return {
      plate: plates[i], copy: c,
      mood: c.querySelector('.orbit-mood'), dish: c.querySelector('.orbit-dish'),
      rest: [c.querySelector('.orbit-eyebrow'), c.querySelector('.orbit-tags'), c.querySelector('.orbit-line')],
    };
  }

  function mark(i) {
    plates.forEach(function (p, k) { p.classList.toggle('is-current', k === i); p.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    copies.forEach(function (c, k) { c.classList.toggle('is-current', k === i); c.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    dots.concat(thumbs).forEach(function (b) {
      if (+b.getAttribute('data-go') === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    var p = parts(i);
    live.textContent = 'Meal ' + (i + 1) + ' of ' + n + ': ' + p.mood.textContent + ', ' + p.dish.textContent;
  }

  // Clear what an animation left inline so the classes decide what shows.
  function settle(i) {
    plates.concat(copies).forEach(function (el) { el.style.visibility = ''; el.style.opacity = ''; el.style.transform = ''; });
    copies.forEach(function (c) {
      [].slice.call(c.querySelectorAll('.orbit-mood,.orbit-dish,.orbit-eyebrow,.orbit-tags,.orbit-line')).forEach(function (el) {
        el.style.clipPath = ''; el.style.opacity = ''; el.style.transform = '';
      });
    });
    var r = near(rest(i), arc.a0);
    arc.a0 = r[0]; arc.a1 = r[1];
    drawArc();
    band.setAttribute('fill', plates[i].getAttribute('data-accent'));
    band.style.fill = '';
  }

  function stopRun() {
    if (!run) return;
    clearTimeout(run.timer);
    run.controls.forEach(function (c) { try { c.complete(); } catch (e) {} });
    run.finish();
    run = null;
  }

  function show(next, dir) {
    next = wrap(next);
    if (next === current) return;
    stopRun();
    var from = current;
    current = next;
    mark(next);
    if (!moving()) { settle(next); return; }

    var a = parts(from), b = parts(next), d = dir || 1, animate = M.animate;
    var controls = [];
    var go = function (el, kf, opts) { controls.push(animate(el, kf, opts)); };

    [a.plate, b.plate, a.copy, b.copy].forEach(function (el) { el.style.visibility = 'visible'; });

    // Plates: the old one swings out over the top, the next swings in from the far side.
    go(a.plate, { rotate: [0, SWING * d], opacity: [1, 1, 0] }, { duration: 0.62, ease: [0.55, 0, 0.8, 0.4] });
    b.plate.style.opacity = '0';
    go(b.plate, { rotate: [-SWING * d, 0], opacity: [0, 1, 1] }, { duration: 0.95, ease: [0.2, 0.8, 0.25, 1], delay: 0.28 });

    // Title: the mood wipes away to the right, the dish to the left, then the next pair wipes in.
    go(a.mood, { clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 100%)'] }, { duration: 0.42, ease: 'easeIn' });
    go(a.dish, { clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 100% 0% 0%)'] }, { duration: 0.42, ease: 'easeIn', delay: 0.06 });
    go(a.rest, { opacity: [1, 0], y: [0, -6] }, { duration: 0.28, ease: 'easeIn' });
    go(a.copy, { opacity: [1, 0] }, { duration: 0.01, delay: 0.48 });
    b.copy.style.opacity = '0';
    go(b.copy, { opacity: [0, 1] }, { duration: 0.01, delay: 0.5 });
    go(b.mood, { clipPath: ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'] }, { duration: 0.7, ease: ease, delay: 0.5 });
    go(b.dish, { clipPath: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'] }, { duration: 0.7, ease: ease, delay: 0.58 });
    go(b.rest, { opacity: [0, 1], y: [10, 0] }, { duration: 0.5, ease: ease, delay: M.stagger(0.07, { startDelay: 0.55 }) });

    // Band: stretches along with the plates, then settles into the next mood's span and colour.
    var s0 = { a0: arc.a0, a1: arc.a1 };
    var mid = { a0: s0.a0 + 55 * d, a1: s0.a1 + 140 * d };
    var end = near(rest(next), mid.a0);
    controls.push(animate(0, 1, { duration: 0.55, ease: 'easeInOut', onUpdate: function (t) {
      arc.a0 = s0.a0 + (mid.a0 - s0.a0) * t; arc.a1 = s0.a1 + (mid.a1 - s0.a1) * t; drawArc();
    } }));
    controls.push(animate(0, 1, { duration: 0.85, ease: ease, delay: 0.55, onUpdate: function (t) {
      arc.a0 = mid.a0 + (end[0] - mid.a0) * t; arc.a1 = mid.a1 + (end[1] - mid.a1) * t; drawArc();
    } }));
    go(band, { fill: plates[next].getAttribute('data-accent') }, { duration: 1.1, ease: 'easeInOut', delay: 0.1 });

    run = { controls: controls, finish: function () { settle(next); } };
    run.timer = setTimeout(function () { if (run) { run.finish(); run = null; } }, 1500);
  }

  function step(d) { show(current + d, d); }
  function jump(i) {
    if (i === current) return;
    var fwd = wrap(i - current);
    show(i, fwd <= n - fwd ? 1 : -1);
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go],[data-step]');
    if (!t || !root.contains(t)) return;
    if (t.hasAttribute('data-step')) step(+t.getAttribute('data-step'));
    else jump(+t.getAttribute('data-go'));
  });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });
  var swipe = null;
  stage.addEventListener('pointerdown', function (e) { swipe = { x: e.clientX, y: e.clientY }; });
  stage.addEventListener('pointercancel', function () { swipe = null; });
  stage.addEventListener('pointerup', function (e) {
    var s = swipe; swipe = null;
    if (!s) return;
    var dx = e.clientX - s.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.4) step(dx < 0 ? 1 : -1);
  });

  mark(0);
  settle(0);

  if (!moving()) return;

  // First arrival: the plate swings in, the band sweeps round and the title wipes in.
  var p0 = parts(0), s = { a0: arc.a0 - 120, a1: arc.a0 - 110 }, target = { a0: arc.a0, a1: arc.a1 };
  if (document.documentElement.classList.contains('m-js')) {
    M.animate(p0.plate, { rotate: [-SWING, 0], opacity: [0, 1] }, { duration: 1.1, ease: [0.2, 0.8, 0.25, 1], delay: 0.35 });
    M.animate(0, 1, { duration: 1.2, ease: ease, delay: 0.45, onUpdate: function (t) {
      arc.a0 = s.a0 + (target.a0 - s.a0) * t; arc.a1 = s.a1 + (target.a1 - s.a1) * t; drawArc();
    } });
    M.animate(p0.mood, { clipPath: ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'] }, { duration: 0.8, ease: ease, delay: 0.6 });
    M.animate(p0.dish, { clipPath: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'] }, { duration: 0.8, ease: ease, delay: 0.7 });
    M.animate(p0.rest, { opacity: [0, 1], y: [10, 0] }, { duration: 0.55, ease: ease, delay: M.stagger(0.08, { startDelay: 0.7 }) });
  }

  // Smooth hover and press on the controls.
  if (M.hover) {
    thumbs.forEach(function (b) {
      var img = b.querySelector('img');
      M.hover(b, function () {
        M.animate(img, { y: -3, scale: 1.05 }, { type: 'spring', stiffness: 380, damping: 26 });
        return function () { M.animate(img, { y: 0, scale: 1 }, { type: 'spring', stiffness: 380, damping: 26 }); };
      });
    });
    [].slice.call(root.querySelectorAll('.orbit-arrow')).forEach(function (b) {
      M.hover(b, function () {
        M.animate(b, { scale: 1.08, backgroundColor: 'rgba(56,90,67,0.08)' }, { type: 'spring', stiffness: 380, damping: 26 });
        return function () { M.animate(b, { scale: 1, backgroundColor: 'rgba(56,90,67,0)' }, { type: 'spring', stiffness: 380, damping: 26 }); };
      });
    });
  }
  if (M.press) {
    [].slice.call(root.querySelectorAll('.orbit-arrow,.orbit-thumb,.orbit-dot')).forEach(function (b) {
      M.press(b, function () {
        M.animate(b, { scale: 0.94 }, { type: 'spring', stiffness: 500, damping: 30 });
        return function () { M.animate(b, { scale: 1 }, { type: 'spring', stiffness: 500, damping: 30 }); };
      });
    });
  }
})();

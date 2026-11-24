/* Mood2Meal site animations, all driven by Motion (assets/vendor/motion.js). */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('m-js') || !window.Motion) { root.classList.remove('m-js'); return; }
  window.__m2mMotion = true;

  var M = window.Motion, animate = M.animate, inView = M.inView, stagger = M.stagger, hover = M.hover, press = M.press;
  var ease = [0.2, 0.7, 0.2, 1];
  var spring = { type: 'spring', stiffness: 380, damping: 28 };
  var fade = { duration: 0.22, ease: 'easeOut' };
  var $ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function rise(els, opts) {
    opts = opts || {};
    if (!els.length) return;
    animate(els, { opacity: [0, 1], y: [opts.distance || 22, 0] },
      { duration: opts.duration || 0.65, ease: ease, delay: stagger(opts.step || 0.08, { startDelay: opts.start || 0 }) });
  }
  function fadeIn(els, delay) { if (els.length) animate(els, { opacity: [0, 1] }, { duration: 0.8, ease: ease, delay: delay || 0 }); }
  function onEnter(el, fn, amount) { inView(el, function () { fn(); }, { amount: amount == null ? 0.2 : amount }); }

  /* ── Home: hero on load ─────────────────────────────── */
  rise($('.hero-copy > *'), { step: 0.09 });
  // The meal carousel fades in here; assets/meal-orbit.js swings its first plate in.
  fadeIn($('.meal-orbit'), 0.3);
  fadeIn($('.hero-gallery-note'), 1.1);

  /* ── Scroll-triggered staggered reveals ─────────────── */
  $('main .section-head').forEach(function (head) { onEnter(head, function () { rise($(':scope > *', head)); }); });
  $('main .grid').forEach(function (grid) { onEnter(grid, function () { rise($(':scope > .card', grid), { step: 0.1, distance: 28 }); }, 0.15); });
  $('.steps > li').forEach(function (li) { onEnter(li, function () { rise([li], { distance: 30, duration: 0.7 }); }, 0.25); });
  $('#premium .split > .card').forEach(function (card) {
    onEnter(card, function () { fadeIn([card]); rise($('.ticks li', card), { step: 0.07, start: 0.15, distance: 12 }); }, 0.3);
  });
  $('.cta').forEach(function (cta) {
    onEnter(cta, function () { rise($('.wrap > *', cta), { step: 0.1 }); fadeIn($('.closing-art', cta), 0.1); }, 0.3);
  });

  /* ── Doc pages: heading block on load, then each block as it scrolls in ── */
  var docBlocks = $('.doc .wrap > *');
  var lead = [];
  while (docBlocks.length && lead.length < 4 && !/^(H2|DIV|SECTION|UL|OL)$/.test(docBlocks[0].tagName)) lead.push(docBlocks.shift());
  rise(lead, { step: 0.08 });
  docBlocks.forEach(function (el) {
    if (el.classList.contains('faq')) {
      onEnter(el, function () { el.style.opacity = 1; rise($(':scope > details', el), { step: 0.05, distance: 14, duration: 0.5 }); }, 0.1);
    } else {
      onEnter(el, function () { rise([el], { distance: 16, duration: 0.55 }); }, 0.15);
    }
  });

  /* ── Smooth hover transitions on interactive elements ── */
  function colorHover(sel, to) {
    $(sel).forEach(function (a) {
      if (a.getAttribute('aria-current')) return;
      var base = getComputedStyle(a).color;
      hover(a, function () {
        animate(a, { color: to, textDecorationColor: to }, fade);
        return function () { animate(a, { color: base, textDecorationColor: 'rgba(0,0,0,0)' }, fade); };
      });
    });
  }
  var accent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#385a43';
  colorHover('.nav a', accent);
  colorHover('.site-footer a', accent);

  $('.btn:not([aria-disabled="true"])').forEach(function (btn) {
    var primary = btn.classList.contains('btn-primary');
    var baseShadow = getComputedStyle(btn).boxShadow;
    hover(btn, function () {
      animate(btn, primary ? { y: -2, filter: 'brightness(1.08)', boxShadow: '0 12px 26px rgba(38,61,48,0.16)' } : { y: -2 }, spring);
      return function () { animate(btn, primary ? { y: 0, filter: 'brightness(1)', boxShadow: baseShadow } : { y: 0 }, spring); };
    });
    press(btn, function () {
      animate(btn, { scale: 0.97 }, spring);
      return function () { animate(btn, { scale: 1 }, spring); };
    });
  });

  $('.tools .card:not(.with-screen)').forEach(function (card) {
    hover(card, function () {
      animate(card, { y: -5, boxShadow: '0 18px 40px rgba(40,59,42,0.06)' }, spring);
      return function () { animate(card, { y: 0, boxShadow: '0 0 0 rgba(40,59,42,0)' }, spring); };
    });
  });

  $('.faq summary').forEach(function (s) {
    hover(s, function () {
      animate(s, { backgroundColor: '#eeeee5' }, fade);
      return function () { animate(s, { backgroundColor: 'rgba(238,238,229,0)' }, fade); };
    });
  });

  $('.brand img').forEach(function (img) {
    hover(img.parentElement, function () {
      animate(img, { rotate: -6, scale: 1.06 }, spring);
      return function () { animate(img, { rotate: 0, scale: 1 }, spring); };
    });
  });
})();

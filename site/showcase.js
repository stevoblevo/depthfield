/* Depthfield showcase — behaviour. Uses only window.Depthfield (components/bundle.js). */
(function () {
  'use strict';
  var D = window.Depthfield;
  if (!D) return;
  var doc = document, root = doc.documentElement;
  var RM = matchMedia('(prefers-reduced-motion: reduce)');
  function $(s, el) { return (el || doc).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pad(n, k) { n = String(n); while (n.length < k) n = '0' + n; return n; }

  doc.body.classList.remove('df-no-js');
  D.mountIcons();
  D.reveal();
  D.story();
  D.cursor();

  var NAMES = { night: 'Night · mint', day: 'Day · mint', 'peach-night': 'Night · peach', 'peach-day': 'Day · peach', 'thread-night': 'Night · thread', 'thread-day': 'Day · thread', contrast: 'High contrast' };
  var chapters = $$('main > .sc-ch');
  var knots = {};
  $$('[data-scene-link]').forEach(function (a) { knots[a.getAttribute('data-scene-link')] = a; });

  /* ---------- the art's own inks, read once from the night theme ---------- */
  var probe = $('#ch-night');
  function ink(name, fallback) { var v = (D.token(name, probe) || '').trim(); return v || fallback; }
  function rgba(hex, a) {
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 'rgba(255,255,255,' + a + ')';
    var h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1], n = parseInt(h, 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  var SPORE = ink('art-accent', '#5ef2b8'), FOUND = ink('art-cue', '#cfe9ff');

  /* ---------- three spores, drawn into the glasshouse at their planes ---------- */
  var SPOTS = [
    { u: .30, v: .30, plane: 1, kicker: 'Spore · in the haze', title: 'Glass bloom', body: 'It floats on the middle ridge’s haze. Come close and it blooms.' },
    { u: .66, v: .97, plane: 2, kicker: 'Spore · the near ridge', title: 'Mint spore', body: 'On the nearest ridge, so it sinks fastest as you scroll.' },
    { u: .88, v: .97, plane: 0, kicker: 'Spore · the far ridge', title: 'Frost seed', body: 'The far ridge keeps it; it moves least of the three.' }
  ];
  var SINK = [60, 130, 220];
  function spotXY(s, info) {
    var x = s.u * info.W;
    return [x, Math.min(info.ridgeY(s.plane, x) - 24, s.v * info.H + info.scroll * SINK[s.plane])];
  }
  function drawSpores(cx, info) {
    SPOTS.forEach(function (s) {
      if (s.plane !== info.plane) return;
      var p = spotXY(s, info), x = p[0], y = p[1], c = s.found ? FOUND : SPORE, pulse = 1 + Math.sin(info.t * 2 + s.u * 9) * .12;
      var g = cx.createRadialGradient(x, y, 0, x, y, 26 * pulse);
      g.addColorStop(0, rgba(c, .55)); g.addColorStop(1, rgba(c, 0));
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, 26 * pulse, 0, 6.283); cx.fill();
      cx.save(); cx.translate(x, y); cx.rotate(info.t * .25 + s.u * 5);
      cx.strokeStyle = rgba(c, .9); cx.lineWidth = 1.5; cx.lineCap = 'round';
      for (var i = 0; i < 6; i++) { cx.rotate(1.0472); cx.beginPath(); cx.moveTo(0, 6); cx.lineTo(0, 11 * pulse); cx.stroke(); }
      cx.fillStyle = rgba(c, 1); cx.beginPath(); cx.arc(0, 0, 3.2, 0, 6.283); cx.fill();
      cx.restore();
    });
  }
  var found = 0, foundCard = D.found($('#found'), { hold: 3400 }), hint = $('#spore-hint');
  function onFound(s, n) {
    found = n; $('#spore-n').textContent = String(n);
    foundCard.show({ kicker: 'Found · ' + n + ' / 3', title: s.title, line: s.body, fact: n === 3 ? 'All three. The glasshouse has nothing left to hide.' : '', more: n < 3 ? (3 - n) + ' still in the art' : '' });
    hint.textContent = n === 3 ? 'All three spores found. Keep scrolling: the skin changes next.' : n + ' of 3 found. Keep looking: one floats, two sit on ridges.';
  }

  /* ---------- one world, switched between modes as the chapters change ---------- */
  var W = { el: $('#world'), api: null, mode: null, spots: null, timer: 0, shafts: true, parts: 240, wx: 0 };
  function build(mode) {
    if (W.spots) { W.spots.destroy(); W.spots = null; }
    if (W.api) { W.api.destroy(); W.api = null; }
    if (mode === 'none') return;
    W.api = D.world(W.el, { mode: mode, eye: mode === 'weather', accent: false, shafts: W.shafts, maxParticles: W.parts, weather: mode === 'weather' ? W.wx : null, draw: mode === 'glasshouse' ? drawSpores : null });
    if (mode === 'glasshouse' && W.api) {
      W.spots = D.hotspots(SPOTS, { world: W.api, caption: $('.df-caption--live'), onFound: onFound });
      W.spots.buttons.forEach(function (b, i) { if (SPOTS[i].found) b.classList.add('is-found'); });
      W.spots.place();
    }
    W.el.classList.remove('is-out');
  }
  function setWorld(mode, force) {
    if (mode === W.mode && !force) return;
    W.mode = mode;
    clearTimeout(W.timer);
    if (!W.api && mode !== 'none') { build(mode); return; }
    W.el.classList.add('is-out');
    W.timer = setTimeout(function () { build(mode); }, RM.matches ? 0 : 420);
  }

  /* ---------- weather: the peach chapters scrub through it; the accent follows ---------- */
  var peach = $$('.sc-ch[data-theme^="peach"]'), wxStates = $$('[data-wx-i]'), lastWx = -1;
  function weather(sec) {
    var span = (sec.getAttribute('data-wx') || '').split(' ').map(Number);
    if (span.length !== 2 || !W.api || W.mode !== 'weather') return;
    var r = sec.getBoundingClientRect(), p = clamp((innerHeight * 0.5 - r.top) / Math.max(1, r.height - innerHeight * 0.5), 0, 1);
    W.wx = span[0] + (span[1] - span[0]) * p;
    W.api.setWeather(W.wx);
    var i = clamp(Math.round(W.wx), 0, 3);
    if (i !== lastWx) {
      lastWx = i;
      var w = D.weathers[i] || { id: 'peach', name: 'peach fall', accent: 'peach' };
      $('#wx-name').textContent = w.name;
      peach.forEach(function (s) { s.style.setProperty('--accent', 'var(--' + w.accent + ')'); s.style.setProperty('--art-accent', 'var(--wx-' + w.id + '-rim)'); });
      wxStates.forEach(function (el) { el.classList.toggle('is-now', +el.getAttribute('data-wx-i') === i); });
    }
  }

  /* ---------- the chapter in view sets the theme of the chrome ---------- */
  var current = null;
  function enter(sec) {
    if (sec === current) return;
    current = sec;
    var id = sec.getAttribute('data-theme');
    root.setAttribute('data-theme', id);
    Object.keys(knots).forEach(function (k) { if (k === id) knots[k].setAttribute('aria-current', 'page'); else knots[k].removeAttribute('aria-current'); });
    $('#chip-theme').textContent = id;
    var ro = $('#ro-theme'); if (ro) ro.textContent = id;
    $('#chip-spores').hidden = sec.getAttribute('data-world') !== 'glasshouse';
    $('#chip-weather').hidden = sec.getAttribute('data-world') !== 'weather' || !sec.hasAttribute('data-wx') || sec.id === 'ch-contrast';
    setWorld(sec.getAttribute('data-world') || 'none');
    try {
      var u = new URL(location.href);
      if (id === 'night') u.searchParams.delete('theme'); else u.searchParams.set('theme', id);
      history.replaceState(null, '', u.href);
    } catch (e) {}
  }
  function pick() {
    var y = innerHeight * 0.5, hit = chapters[0];
    chapters.forEach(function (c) { if (c.getBoundingClientRect().top <= y) hit = c; });
    enter(hit);
    if (hit.hasAttribute('data-wx')) weather(hit);
    if (W.spots) W.spots.place();
    var ro = $('#ro-scroll');
    if (ro) { var max = root.scrollHeight - innerHeight; ro.textContent = pad(Math.round(max > 0 ? scrollY / max * 100 : 0), 3) + '%'; }
  }
  var tick = 0;
  addEventListener('scroll', function () { if (!tick) tick = requestAnimationFrame(function () { tick = 0; pick(); }); }, { passive: true });
  addEventListener('resize', pick);

  /* ---------- II · live settings and readout ---------- */
  var shafts = $('#set-shafts'), parts = $('#set-parts'), partsOut = $('#set-parts-out');
  if (parts) D.slider(parts);
  var rebuild = 0;
  function retune() {
    W.shafts = shafts.checked; W.parts = +parts.value; partsOut.textContent = parts.value;
    clearTimeout(rebuild); rebuild = setTimeout(function () { if (W.mode === 'glasshouse') setWorld('glasshouse', true); }, 160);
  }
  if (shafts) { shafts.addEventListener('change', retune); parts.addEventListener('input', retune); }
  var roP = $('#ro-pointer'), mv = 0;
  addEventListener('pointermove', function (e) {
    if (mv || !roP) return;
    mv = requestAnimationFrame(function () { mv = 0; roP.textContent = (e.clientX / innerWidth).toFixed(2) + ' · ' + (e.clientY / innerHeight).toFixed(2); });
  }, { passive: true });

  /* ---------- IV · the eye; V · the reality lens ---------- */
  var eye = $('#eye'); if (eye) D.eye(eye);
  var lensTool = $('#lens-tool');
  if (lensTool) D.lens(lensTool, $('#lens-banner'));
  $$('[data-sc-lens]').forEach(function (b) {
    b.addEventListener('click', function () { lensTool.click(); b.textContent = root.classList.contains('df-lens') ? 'Turn off the lens' : 'Turn on the lens'; });
  });
  addEventListener('df:lens', function (e) { $$('[data-sc-lens]').forEach(function (b) { b.textContent = e.detail && e.detail.on ? 'Turn off the lens' : 'Turn on the lens'; }); });

  /* ---------- start: ?theme= opens at that chapter ---------- */
  var q = new URLSearchParams(location.search).get('theme');
  if (q && q !== 'night' && NAMES[q]) {
    var el = $('.sc-ch[data-theme="' + q + '"]');
    if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  pick();
})();

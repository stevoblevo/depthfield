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
  var SPORE = ink('art-accent', '#5ef2b8'), FOUND = ink('art-cue', '#cfe9ff'), FROST = ink('frost', '#c9e6ff'), EMBER = ink('wx-peach-rim', '#ffb58a'), IRIS = ink('eye-iris', '#5ef2b8');

  /* ---------- three spores, drawn into the glasshouse at their planes ---------- */
  var SPOTS = [
    { id: 'glass-bloom', u: .30, v: .30, plane: 1, kicker: 'Spore · in the haze', title: 'Glass bloom', body: 'It floats on the middle ridge’s haze. Come close and it blooms.' },
    { id: 'mint-spore', u: .66, v: .97, plane: 2, kicker: 'Spore · the near ridge', title: 'Mint spore', body: 'On the nearest ridge, so it sinks fastest as you scroll.' },
    { id: 'frost-seed', u: .88, v: .97, plane: 0, kicker: 'Spore · the far ridge', title: 'Frost seed', body: 'The far ridge keeps it; it moves least of the three.' }
  ];
  var SINK = [60, 130, 220];
  function spotXY(s, info) {
    var x = s.u * info.W;
    return [x, Math.min(info.ridgeY(s.plane, x) - 24, s.v * info.H + info.scroll * SINK[s.plane])];
  }
  function drawSpores(cx, info) {   /* family F9: the spores are drawn by the kit's pets, each in its own form */
    SPOTS.forEach(function (s) {
      if (s.plane !== info.plane || s.found) return;
      var p = spotXY(s, info);
      PK.draw(cx, s.id, { x: p[0], y: p[1], size: 58, t: info.t + s.u * 9, look: 'night', still: RM.matches });
    });
  }
  var foundCard = D.found($('#found'), { hold: 3400 }), hint = $('#spore-hint');

  /* ---------- night pets: whatever you find follows you, saved with Storeybrook's day pets and Hypermetapunk's dusk pets ---------- */
  /* family F9: the pets, their save and their drawing live in the kit (project/components/pets.js); the page keeps only
     where each one waits and its dot colour */
  var PK = D.pets, DAY = 7, DUSK = 5, ALL = 17;
  var HERE = { 'glass-bloom': [FOUND, 'ch-night'], 'mint-spore': [SPORE, 'ch-night'], 'frost-seed': [FROST, 'ch-night'], 'winkle': [IRIS, 'ch-peach-day'], 'firefly': [EMBER, 'ch-contrast'] };
  var PETS = PK.list.map(function (p) { return { id: p.id, name: p.name, line: p.line, how: p.how, c: HERE[p.id][0], ch: HERE[p.id][1] }; });
  var WITH = [];   /* the found pets, in order: the procession */
  function pet(id) { return PETS.filter(function (p) { return p.id === id; })[0]; }
  function has(id) { return PK.has(id); }
  function count() { return PK.count(); }
  SPOTS.forEach(function (sp) { sp.found = has(sp.id); });

  /* the list draws each pet with the kit's pen of pets, in the chapter's look; one still out there is a faint keyline */
  var BOOK = { raf: 0, t0: 0, cvs: [] };
  function bookPaint(now) {
    var look = root.getAttribute('data-theme') || 'night', t = (now - BOOK.t0) / 1000, list = $('#petbook-list'), muted = list ? getComputedStyle(list).getPropertyValue('--ink-muted') || '#93aaa1' : '#93aaa1';
    BOOK.cvs.forEach(function (cv, i) {
      var x = cv.getContext('2d'), k = cv.width / 40, off = cv.hasAttribute('data-off');
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height); x.setTransform(k, 0, 0, k, 0, 0);
      PK.draw(x, cv.getAttribute('data-pet'), { x: 20, y: 20, size: 36, t: t + i * 0.7, look: off ? 'contrast' : look, still: off || RM.matches });
      if (off) { x.globalCompositeOperation = 'source-in'; x.globalAlpha = 0.55; x.fillStyle = muted.trim() || '#93aaa1'; x.fillRect(0, 0, 40, 40); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
    });
  }
  function bookLoop(now) { BOOK.raf = 0; if (book.hidden) return; if (!BOOK.t0) BOOK.t0 = now; bookPaint(now); if (!RM.matches) BOOK.raf = requestAnimationFrame(bookLoop); }
  function bookStart() { if (!BOOK.raf && book && !book.hidden) BOOK.raf = requestAnimationFrame(bookLoop); }
  function paintPets() {
    var n = count(), tot = PK.total(), dpr = Math.min(3, Math.ceil(window.devicePixelRatio || 1));
    WITH = PETS.filter(function (p) { return has(p.id); });
    $('#pet-n').textContent = String(n);
    $('#pet-dots').innerHTML = PETS.map(function (p) { return '<i style="' + (has(p.id) ? 'background:' + p.c : '') + '"></i>'; }).join('');
    $('#chip-pets').setAttribute('aria-label', 'Night pets: ' + n + ' of 5 found. Open the list');
    $('#petbook-count').textContent = n + ' of 5 found. ' + (n ? 'The ones you found follow your pointer through the art.' : 'Whatever you find follows your pointer through the art.');
    $('#petbook-list').innerHTML = PETS.map(function (p) {
      var f = has(p.id);
      return '<li><button type="button" class="df-drawer__item sc-petitem" data-pet-go="' + p.ch + '"><span class="df-n"><canvas class="sc-petcv" width="' + 40 * dpr + '" height="' + 40 * dpr + '" aria-hidden="true" data-pet="' + p.id + '"' + (f ? '' : ' data-off') + '></canvas></span><span>' + (f ? p.name : 'Still out there') + '<small>' + (f ? p.line : p.how) + '</small></span><span class="df-go">' + (f ? 'with you' : 'go look') + '</span></button></li>';
    }).join('');
    BOOK.cvs = $$('#petbook-list canvas[data-pet]');
    bookPaint(performance.now()); bookStart();
    var d = tot.sb, k = tot.hmp, sky = has('sb:saelion');
    var day = (sky ? 'Saelion came over from Storeybrook: look up in the night garden. ' : 'Day pets from Storeybrook: ' + d + ' of ' + DAY + '. Find all seven and something appears in the night garden’s sky. ') +
      '<a class="df-link" href="https://stevoblevo.github.io/storeybrook/">' + (d < DAY ? 'Walk the brook' : 'Visit them') + '</a>';
    var dusk = 'Dusk pets from Hypermetapunk: ' + k + ' of ' + DUSK + '. ', link = '<a class="df-link" href="https://stevoblevo.github.io/hypermetapunk/">' + (k < DUSK ? 'Find them in Hypermetapunk' : 'Visit them') + '</a>';
    var all = $('#petbook-all');
    $('#petbook-day').innerHTML = day;
    $('#petbook-dusk').innerHTML = dusk + (tot.all < ALL ? tot.all + ' of ' + ALL + ' across the three kits. ' : '') + link;
    all.innerHTML = 'All seventeen, across the three kits: the lattice is open. <a class="df-link" href="https://stevoblevo.github.io/and-so/?lattice=1">Open the lattice</a>'; all.hidden = tot.all < ALL;
    $('#cross-line').innerHTML = day + ' ' + dusk + link;
    hint.textContent = n === 5 ? 'All five night pets are with you. Move the pointer and they come along.'
      : SPOTS.every(function (sp) { return sp.found; }) ? 'All three spores found, and they follow you now. Two more night pets are further down.'
      : n ? n + ' of 5 found, and they follow you. ' + (function (r) { return r + (r > 1 ? ' spores are' : ' spore is') + ' still in the glasshouse.'; })(SPOTS.filter(function (sp) { return !sp.found; }).length)
      : 'Five night pets live in this world, three of them spores in the glasshouse. Press anything that looks like decoration; whatever you find follows you down.';
  }
  function findPet(id, quiet) {
    if (!PK.find(id)) return false;
    var p = pet(id), n = count();
    TRAIL.born[id] = 1;
    paintPets();
    if (!quiet) foundCard.show({ kicker: 'Night pet · ' + n + ' / 5', title: p.name, line: p.line, fact: n === 5 ? 'All five. They follow you from here on, and Storeybrook can see them.' : '', more: n < 5 ? (5 - n) + ' still in the art' : '' });
    return true;
  }
  function onFound(sp) {
    if (sp.id === 'stars') { foundCard.show({ kicker: 'From Storeybrook', title: 'Saelion, in stars', line: 'You found all seven day pets, so she came over for the night.' }); return; }
    findPet(sp.id);
  }

  /* the procession: found pets trail the pointer; with no pointer they take a slow loop over the near ridge */
  var TRAIL = { pts: {}, born: {}, px: -1, py: -1, at: 0 };
  function aim(e) { TRAIL.px = e.clientX; TRAIL.py = e.clientY; TRAIL.at = performance.now(); }
  addEventListener('pointermove', aim, { passive: true }); addEventListener('pointerdown', aim, { passive: true });
  var LOOK = { x: 0, y: 0, size: 40, t: 0, look: 'night', still: false, lookX: undefined, lookY: undefined };   /* one options record, reused every frame */
  function drawPet(cx, id, x, y, t, size) {
    LOOK.x = x; LOOK.y = y; LOOK.t = t; LOOK.size = size || 40; LOOK.still = RM.matches;
    LOOK.lookX = TRAIL.at ? TRAIL.px : undefined; LOOK.lookY = TRAIL.at ? TRAIL.py : undefined;
    PK.draw(cx, id, LOOK);
  }
  function drawTrail(cx, info) {
    var list = WITH; if (!list.length) return;
    var fresh = TRAIL.at && performance.now() - TRAIL.at < 6000 && !root.classList.contains('df-reeling'), t = info.t;
    var tx = fresh ? TRAIL.px : info.W * (.5 + .34 * Math.sin(t * .23)), ty = fresh ? TRAIL.py : info.H * (.66 + .08 * Math.sin(t * .51));
    var prev = null;
    list.forEach(function (p, i) {
      var st = TRAIL.pts[p.id], sp = SPOTS.filter(function (q) { return q.id === p.id; })[0];
      if (!st) st = TRAIL.pts[p.id] = TRAIL.born[p.id] && sp ? spotXY(sp, info).slice() : [tx, ty];
      if (RM.matches) { st[0] = info.W - 44 - i * 36; st[1] = info.H - 116; }
      else {
        var gx, gy, want, k;
        if (!prev) { var a = t * 1.3; gx = tx + Math.cos(a) * 30; gy = ty + Math.sin(a) * 18 - 14; want = 0; k = .07; }
        else { gx = prev[0]; gy = prev[1]; want = 30; k = .22; }
        var dx = gx - st[0], dy = gy - st[1], d = Math.hypot(dx, dy);
        if (d > want) { var m = (d - want) / d * k; st[0] += dx * m; st[1] += dy * m; }
      }
      drawPet(cx, p.id, st[0], st[1] + (RM.matches ? 0 : Math.sin(t * 2 + i * 1.7) * 3), t + i, 42);
      prev = st;
    });
  }

  /* the night garden: the firefly before it is found, and Saelion's stars once Storeybrook's seven are */
  var FIREFLY = { id: 'firefly', u: .78, v: .3, kicker: 'Night pet · the garden', title: 'Firefly', body: 'The garden’s last light. Press it before it drifts off.' };
  var STARS = { id: 'stars', u: .7, v: .17, kicker: 'A constellation', title: 'Saelion, in stars', body: 'She came over from Storeybrook for the night.' };
  var SHAPE = [[-.42, .1], [-.3, -.22], [0, -.34], [.3, -.22], [.42, .1], [.26, .38], [0, .46], [-.26, .38], [-.24, -.62], [.24, -.62], [-.92, -.2], [-.82, .32], [.92, -.2], [.82, .32], [-.4, .78], [0, .9], [.4, .78], [-.18, -.14], [.18, -.14]];
  var LINES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [1, 8], [3, 9], [0, 10], [10, 11], [11, 0], [4, 12], [12, 13], [13, 4], [7, 14], [6, 15], [5, 16]];
  function drawGarden(cx, info) {
    var t = info.t;
    if (info.plane === 0 && has('sb:saelion')) {
      var R = Math.min(info.W, info.H) * .13, ox = STARS.u * info.W, oy = STARS.v * info.H + R * .2;
      cx.strokeStyle = rgba(FROST, .28); cx.lineWidth = 1;
      LINES.forEach(function (l) { var a = SHAPE[l[0]], b = SHAPE[l[1]]; cx.beginPath(); cx.moveTo(ox + a[0] * R, oy + a[1] * R); cx.lineTo(ox + b[0] * R, oy + b[1] * R); cx.stroke(); });
      SHAPE.forEach(function (q, i) { var tw = .55 + .45 * Math.sin(t * 1.7 + i * 2.3); cx.fillStyle = rgba(FROST, tw); cx.beginPath(); cx.arc(ox + q[0] * R, oy + q[1] * R, i === 17 || i === 18 ? 2.6 : i === 2 || i === 6 ? 2.2 : 1.6, 0, 6.283); cx.fill(); });
    }
    if (info.plane === 2 && !has('firefly')) {
      FIREFLY.u = .78 + Math.sin(t * .47) * .05 + Math.sin(t * 1.3) * .012; FIREFLY.v = .3 + Math.sin(t * .71) * .04;
      drawPet(cx, 'firefly', FIREFLY.u * info.W, FIREFLY.v * info.H, t, 60);
    }
  }
  function drawWorld(mode) {
    return function (cx, info) {
      if (mode === 'glasshouse') drawSpores(cx, info);
      if (mode === 'garden') drawGarden(cx, info);
      if (info.plane === 2) drawTrail(cx, info);
    };
  }

  /* ---------- one world, switched between modes as the chapters change ---------- */
  var W = { el: $('#world'), api: null, mode: null, spots: null, timer: 0, shafts: true, parts: 240, wx: 0 };
  function build(mode) {
    if (W.spots) { W.spots.destroy(); W.spots = null; }
    if (W.api) { W.api.destroy(); W.api = null; }
    if (mode === 'none') return;
    W.api = D.world(W.el, { mode: mode === 'garden' ? 'weather' : mode, eye: mode === 'weather', accent: false, shafts: W.shafts, maxParticles: W.parts, weather: mode === 'garden' ? 3 : mode === 'weather' ? W.wx : null, draw: drawWorld(mode) });
    var list = mode === 'glasshouse' ? SPOTS.filter(function (sp) { return !sp.found; }) : mode === 'garden' ? [].concat(has('firefly') ? [] : [FIREFLY], has('sb:saelion') ? [STARS] : []) : [];
    if (list.length && W.api) {
      W.spots = D.hotspots(list, { world: W.api, caption: $('.df-caption--live'), onFound: onFound });
      W.spots.list = list;
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
    bookStart();
    Object.keys(knots).forEach(function (k) { if (k === id) knots[k].setAttribute('aria-current', 'page'); else knots[k].removeAttribute('aria-current'); });
    $('#chip-theme').textContent = id;
    var ro = $('#ro-theme'); if (ro) ro.textContent = id;
    var wx = sec.getAttribute('data-world') !== 'weather' || !sec.hasAttribute('data-wx') || sec.id === 'ch-contrast';
    $('#chip-weather').hidden = wx; $('#chip-themebox').classList.toggle('sc-hide-md', !wx);
    setWorld(sec.id === 'ch-contrast' ? 'garden' : sec.getAttribute('data-world') || 'none');
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

  if (eye) eye.addEventListener('click', function () { if (W.api && W.api.wink) W.api.wink(); setTimeout(function () { findPet('winkle'); }, 260); });

  /* ---------- the night pets list ---------- */
  var book = $('#petbook'), chip = $('#chip-pets'), drawer = D.drawer(book, chip);
  $('#petbook-list').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pet-go]'); if (!b) return;
    drawer.close(); var sec = doc.getElementById(b.getAttribute('data-pet-go'));
    if (sec) sec.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'start' });
  });
  addEventListener('storage', function (e) { if (e.key === PK.key) { SPOTS.forEach(function (sp) { sp.found = has(sp.id); }); paintPets(); } });
  new MutationObserver(bookStart).observe(book, { attributes: true, attributeFilter: ['hidden'] });
  paintPets();

  /* ---------- the reel: the whole story in seven shots; any touch hands it back ---------- */
  var reelState = {}, scrubRaf = 0;
  function goTo(sel) { var el = $(sel); if (el) el.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'start' }); }
  function scrub(sel, secs) {
    var el = $(sel); if (!el) return;
    var top = el.getBoundingClientRect().top + scrollY, to = top + el.offsetHeight - innerHeight;
    if (RM.matches) { scrollTo({ top: top, behavior: 'auto' }); setTimeout(function () { scrollTo({ top: to, behavior: 'auto' }); }, secs * 500); return; }
    goTo(sel);
    var t0 = 0;
    function step(now) {
      if (!t0) t0 = now; var k = clamp((now - t0) / 1000 / secs, 0, 1), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      scrollTo({ top: top + (to - top) * e, behavior: 'instant' }); if (k < 1) scrubRaf = requestAnimationFrame(step);
    }
    setTimeout(function () { scrubRaf = requestAnimationFrame(step); }, 900);
  }
  function hideCap() { var c = $('.df-caption--live'); if (c) c.classList.remove('is-on'); }
  function press(mode, id, tries) {
    return function () {
      var i = W.spots && W.mode === mode ? W.spots.list.map(function (sp) { return sp.id; }).indexOf(id) : -1;
      if (i < 0) { if ((tries || 0) < 6 && !has(id)) setTimeout(press(mode, id, (tries || 0) + 1), 400); return; }
      W.spots.place(); W.spots.buttons[i].click(); setTimeout(hideCap, 1300);
    };
  }
  function lensOn(v) { return function () { if (lensTool && root.classList.contains('df-lens') !== v) { lensTool.click(); reelState.lens = v; } }; }
  function shaftsTo(v) { return function () { if (shafts && shafts.checked !== v) { shafts.click(); reelState.shafts = true; } }; }
  var SHOTS = [
    { name: 'The glasshouse', tune: 'night · mint — three spores hide in the art', d: 8, go: function () { goTo('#ch-night'); }, at: [[2.2, press('glasshouse', 'glass-bloom')], [3.8, press('glasshouse', 'mint-spore')], [5.4, press('glasshouse', 'frost-seed')]] },
    { name: 'Day chrome', tune: 'day · mint — the same sky; settings change it live', d: 6, go: function () { goTo('#ch-day'); }, at: [[2, shaftsTo(false)], [4, shaftsTo(true)]] },
    { name: 'Red rain', tune: 'night · peach — the weather turns as you scroll', d: 7.5, go: function () { scrub('#ch-peach-night', 6); } },
    { name: 'The clearing', tune: 'day · peach — the eye opens, and winks back', d: 6, go: function () { goTo('#ch-peach-day'); }, at: [[2.6, function () { if (eye) eye.click(); }]] },
    { name: 'The ledger', tune: 'night · thread — the lens shows what each claim rests on', d: 6, go: function () { goTo('#ch-thread-night'); }, at: [[1.6, lensOn(true)], [4.6, lensOn(false)]] },
    { name: 'The archive', tune: 'day · thread — every version of this repository', d: 5, go: function () { goTo('#ch-thread-day'); } },
    { name: 'The night garden', tune: 'contrast — the last light, and three doors', d: 8, go: function () { goTo('#ch-contrast'); }, at: [[2.8, press('garden', 'firefly')]] }
  ];
  var reel = D.reel(SHOTS, {
    hud: $('.df-reel'),
    onStart: function () { reelState = {}; if (!book.hidden) drawer.close(); },
    onShot: function (sh) { var l = $('.df-reel__line'); if (l) l.innerHTML = '<span class="df-reel__name">' + sh.name + '</span>' + sh.tune; },
    onStop: function (done) {
      cancelAnimationFrame(scrubRaf); hideCap();
      if (reelState.lens && root.classList.contains('df-lens')) lensTool.click();
      if (reelState.shafts && shafts && !shafts.checked) shafts.click();
      var n = count();
      if (done) foundCard.show({ kicker: 'The reel · the end', title: n + ' of 5 night pets with you', line: n < 5 ? 'The rest are still in the art.' : 'Move the pointer and they come along.', more: 'Scroll anywhere: it is yours again' });
    }
  });
  $$('[data-sc-reel]').forEach(function (b) { b.addEventListener('click', function () { reel.start(); }); });
  window.DepthfieldShowcase = { reel: reel, pets: { has: has, count: count, find: findPet } };

  /* ---------- start: ?theme= opens at that chapter; ?autoplay runs the reel ---------- */
  var q = new URLSearchParams(location.search).get('theme');
  if (q && q !== 'night' && NAMES[q]) {
    var el = $('.sc-ch[data-theme="' + q + '"]');
    if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  pick();
  try {
    var u0 = new URL(location.href);
    if (u0.searchParams.has('autoplay')) { u0.searchParams.delete('autoplay'); history.replaceState(null, '', u0.href); setTimeout(function () { reel.start(); }, 1400); }
  } catch (e) {}
})();

/* Depthfield 2 — behaviors. One classic script: window.Depthfield. No dependencies, no network.
   Everything degrades: without this file the page is a static story; with reduced motion there is no scrubbing,
   no parallax and no ambient loop, and every frame is drawn on demand instead. */
(function () {
  'use strict';
  var w = window, doc = document, root = doc.documentElement;
  var mm = function (q) { try { return w.matchMedia(q); } catch (e) { return { matches: false, addEventListener: function () {} }; } };
  var RM = mm('(prefers-reduced-motion: reduce)'), FINE = mm('(pointer: fine)');
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function mix(a, b, k) { return a + (b - a) * k; }
  function mixc(a, b, k) { return [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]; }
  function $(q, r) { return (r || doc).querySelector(q); }
  function $$(q, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(q)); }
  function store(k, v) { try { if (v === undefined) return w.localStorage.getItem(k); w.localStorage.setItem(k, v); } catch (e) { return null; } return null; }
  function emit(name, detail) { try { w.dispatchEvent(new CustomEvent('df:' + name, { detail: detail })); } catch (e) {} }
  function token(name, el) { try { return getComputedStyle(el || root).getPropertyValue('--' + name).trim(); } catch (e) { return ''; } }
  function num(name, fb) { var v = parseFloat(token(name)); return isNaN(v) ? fb : v; }
  function ms(name, fb) { var v = token(name), n = parseFloat(v); if (isNaN(n)) return fb; return /ms$/.test(v) ? n : (/s$/.test(v) ? n * 1000 : n); }
  function rgb(v, fb) {
    v = (v || fb || '#000000').trim();
    if (v.charAt(0) === '#') { if (v.length === 4) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]; return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)]; }
    var m = v.match(/[\d.]+/g); return m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : rgb(fb || '#000000');
  }
  function css(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')'; }
  function pad(n, k) { n = String(n); while (n.length < k) n = '0' + n; return n; }
  function focusables(el) { return $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])', el).filter(function (x) { return x.offsetParent !== null || x === doc.activeElement; }); }

  var D = { version: '2.0.0', token: token, clamp: clamp, reducedMotion: function () { return RM.matches; } };

  /* ---------- haptics: short, rare, and only where the hand already is ---------- */
  D.haptic = function (msec) { if (D.haptic.off) return; try { if (w.navigator.vibrate) w.navigator.vibrate(msec || 8); } catch (e) {} };

  /* ---------- theme: a face (night, day) × a skin (mint, peach, thread) or high contrast ---------- */
  function themeId(face, skin) { return skin === 'contrast' ? 'contrast' : (skin && skin !== 'mint' ? skin + '-' : '') + face; }
  function parseTheme(id) { if (id === 'contrast') return { face: 'night', skin: 'contrast' }; var m = /^(?:(peach|thread)-)?(night|day)$/.exec(id || ''); return m ? { face: m[2], skin: m[1] || 'mint' } : null; }
  function syncFace() {
    var t = D.theme.get();
    $$('[data-df-tool="face"]').forEach(function (b) {
      var day = t.face === 'day'; b.setAttribute('aria-pressed', String(day));
      var l = $('.df-tool__label', b) || $('b', b); if (l) l.textContent = day ? 'Night' : 'Day';
      b.setAttribute('aria-label', day ? 'Switch to night' : 'Switch to day');
    });
  }
  D.theme = {
    skins: ['mint', 'peach', 'thread', 'contrast'], faces: ['night', 'day'],
    get: function () { return parseTheme(root.getAttribute('data-theme')) || { face: 'night', skin: 'mint' }; },
    id: themeId,
    set: function (o, keep) {
      var cur = D.theme.get(), face = (o && o.face) || cur.face, skin = (o && o.skin) || cur.skin, id = themeId(face, skin);
      root.setAttribute('data-theme', id); if (keep !== false) store('df:theme', id);
      syncFace(); emit('theme', { id: id, face: face, skin: skin }); return id;
    },
    toggleFace: function () { var c = D.theme.get(); return D.theme.set(c.skin === 'contrast' ? { skin: 'mint', face: 'day' } : { face: c.face === 'night' ? 'day' : 'night' }); },
    /* night first: the system theme is followed only when asked (followSystem), and a choice made here always wins */
    init: function (o) {
      o = o || {}; var saved = store('df:theme');
      if (saved && parseTheme(saved)) root.setAttribute('data-theme', saved);
      else if (!root.getAttribute('data-theme') || o.skin || o.face) {
        var face = o.face || (o.followSystem && mm('(prefers-color-scheme: light)').matches ? 'day' : 'night');
        root.setAttribute('data-theme', themeId(face, o.skin || D.theme.get().skin));
      }
      syncFace();
    }
  };

  /* ---------- the scroll story: progress, chapters, ticks ---------- */
  D.story = function (o) {
    o = o || {};
    var chapters = $$(o.chapters || '[data-df-chapter]'), bars = $$(o.progress || '[data-df-progress]');
    var state = { progress: 0, chapter: 0, count: chapters.length };
    function update() {
      var max = root.scrollHeight - w.innerHeight, p = max > 0 ? clamp(w.scrollY / max, 0, 1) : 0, idx = 0;
      chapters.forEach(function (c, i) { if (c.getBoundingClientRect().top < w.innerHeight * 0.5) idx = i; });
      bars.forEach(function (b) {
        var fill = $('.df-progress__fill', b), pct = $('[data-df-pct]', b), ch = $('[data-df-ch]', b);
        if (fill) fill.style.width = (p * 100).toFixed(2) + '%';
        if (pct) pct.textContent = pad(Math.round(p * 100), 3) + '%';
        if (ch) ch.textContent = pad(idx + 1, 2) + ' / ' + pad(Math.max(1, chapters.length), 2);
        if (b.getAttribute('role') === 'progressbar') b.setAttribute('aria-valuenow', String(Math.round(p * 100)));
        $$('.df-progress__tick', b).forEach(function (t, i) { t.classList.toggle('is-done', i < idx); if (i === idx) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current'); });
      });
      var changed = idx !== state.chapter; state.progress = p; state.chapter = idx;
      if (o.onProgress) o.onProgress(p, idx); emit('progress', { progress: p, chapter: idx });
      if (changed) emit('chapter', { chapter: idx, el: chapters[idx] });
    }
    bars.forEach(function (b) {
      $$('.df-progress__tick', b).forEach(function (t, i) {
        if (t.tagName !== 'BUTTON' && t.tagName !== 'A') return;
        t.addEventListener('click', function (e) { var c = chapters[i]; if (!c) return; e.preventDefault(); c.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth' }); });
      });
    });
    w.addEventListener('scroll', update, { passive: true }); w.addEventListener('resize', update); update();
    return { state: state, update: update, destroy: function () { w.removeEventListener('scroll', update); w.removeEventListener('resize', update); } };
  };

  /* ---------- reveals: text arrives once, rising 24px; siblings stagger by dur-stagger ---------- */
  D.reveal = function (scope) {
    var els = $$('[data-df-reveal]', scope);
    els.forEach(function (el) { var sib = el.parentNode ? Array.prototype.filter.call(el.parentNode.children, function (c) { return c.hasAttribute('data-df-reveal'); }) : [el]; el.style.setProperty('--df-i', String(Math.max(0, sib.indexOf(el)))); });
    if (RM.matches || !('IntersectionObserver' in w)) { els.forEach(function (e) { e.classList.add('is-in'); }); return null; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); }); return io;
  };

  /* ---------- the world canvas: sky, sun, shafts, three ridges, haze, particles, ripples, vignette ---------- */
  var WEATHER = [
    { id: 'peach', name: 'peach fall', acc: 'peach', fb: ['#261a2c', '#ff9678', '#ffc8a0', '#3c2234', '#562c3a', '#783c40', '#ffb48a'] },
    { id: 'rain', name: 'red rain', acc: 'rain', fb: ['#160e18', '#962834', '#ff6e6e', '#28121c', '#3a1620', '#501c26', '#ff6b6b'] },
    { id: 'mint', name: 'mint clearing', acc: 'mint', fb: ['#0a1a1c', '#28826e', '#c8ffe6', '#0e2e2a', '#124238', '#1e6050', '#5ef2b8'] },
    { id: 'night', name: 'night garden', acc: 'frost', fb: ['#0a0e1a', '#223050', '#c9e6ff', '#121828', '#182034', '#202a42', '#c9e6ff'] }
  ];
  D.weathers = WEATHER.map(function (x) { return { id: x.id, name: x.name, accent: x.acc }; });
  function readWeather() {
    return WEATHER.map(function (x) {
      var k = ['sky-top', 'sky-low', 'sun', 'ridge-1', 'ridge-2', 'ridge-3', 'rim'].map(function (p, i) { return rgb(token('wx-' + x.id + '-' + p), x.fb[i]); });
      return { sky: [k[0], k[1]], sun: k[2], ridge: [k[3], k[4], k[5]], rim: k[6] };
    });
  }
  function readGlass() {
    var g = function (n, fb) { return rgb(token(n), fb); };
    return { top: [g('gh-sky-top', '#081c19'), g('gh-sky-top-end', '#0e2a30')], low: [g('gh-sky-low', '#12483c'), g('gh-sky-low-end', '#609696')],
      ridge: [g('gh-ridge-1', '#0c2e26'), g('gh-ridge-2', '#104234'), g('gh-ridge-3', '#1e6852')], shaft: g('gh-shaft', '#a0ffd7'), glow: g('gh-glow', '#c9ffe6'),
      haze: g('gh-haze', '#8ce6c3'), rim: g('mint', '#5ef2b8'), frost: g('frost', '#c9e6ff') };
  }
  D.world = function (canvas, o) {
    o = o || {}; var cx = canvas && canvas.getContext && canvas.getContext('2d'); if (!cx) return null;
    var mode = o.mode === 'weather' ? 'weather' : 'glasshouse', contained = canvas.classList.contains('df-world--contained') || !!o.contained;
    var W = 0, H = 0, t = 0, last = 0, raf = 0, scroll = 0, alive = true, fixedWeather = o.weather == null ? null : +o.weather, lastWx = -1;
    var M = { x: .6, y: .45, tx: .6, ty: .45, px: -999, py: -999 }, tilt = { x: 0, y: 0 }, parts = [], ripples = [], P = [];
    for (var i = 0; i < 512; i++) P.push(Math.random());
    function noise(x) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return P[i & 511] * (1 - u) + P[(i + 1) & 511] * u; }
    var PAR = [num('depth-pointer-back', 18), num('depth-pointer-mid', 36), num('depth-pointer-front', 64)];
    var SINK = mode === 'weather' ? [30, 60, 90] : [num('depth-sink-back', 60), num('depth-sink-mid', 130), num('depth-sink-front', 220)];
    var FOLLOW = num('depth-follow', 0.05), WX = readWeather(), GL = readGlass(), VOID = rgb(token('art-void'), '#07110f');
    var OPH = num('op-haze', 0.08), OPS = num('op-shaft', 0.07), OPV = num('op-vignette', 0.75);
    var EYE = { u: .7, open: 1, cyc: 0, forced: 0, pos: null };
    function seed() {
      parts.length = 0; var n = Math.round(Math.min(o.maxParticles || 240, (W * H) / (mode === 'weather' ? 6000 : 7000)));
      for (var i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, z: Math.random(), r: Math.random() * 6.28, s: Math.random() * 6.28 });
    }
    function size() {
      var r = contained ? canvas.getBoundingClientRect() : { width: w.innerWidth, height: w.innerHeight };
      var d = Math.min(2, w.devicePixelRatio || 1); W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * d); canvas.height = Math.round(H * d); cx.setTransform(d, 0, 0, d, 0, 0); seed();
    }
    function ridgeY(L, x) {
      var g = mode === 'weather', f = [.0015, .0023, .0033][L], a = (g ? [.15, .12, .1] : [.16, .13, .1])[L] * H, base = (g ? [.6, .72, .84] : [.58, .7, .82])[L] * H;
      var par = (clamp(M.x - .5 + tilt.x, -.5, .5)) * PAR[L];
      return base + scroll * SINK[L] - a * (noise((x + par) * f + L * 40 + t * (g ? .015 : .02)) * 1.2 + noise((x + par) * f * 3 + L * 9) * .35);
    }
    function palette() {
      if (mode === 'weather') {
        var f = fixedWeather != null ? clamp(fixedWeather, 0, 3) : scroll * 3, i = Math.min(2, Math.floor(f)), k = f - i, a = WX[i], b = WX[i + 1];
        return { sky: [mixc(a.sky[0], b.sky[0], k), mixc(a.sky[1], b.sky[1], k)], sun: mixc(a.sun, b.sun, k), ridge: a.ridge.map(function (c, j) { return mixc(c, b.ridge[j], k); }), rim: mixc(a.rim, b.rim, k),
          w: [clamp(1 - f, 0, 1), clamp(1 - Math.abs(f - 1), 0, 1), clamp(1 - Math.abs(f - 2), 0, 1), clamp(f - 2, 0, 1)], f: f };
      }
      var s = scroll;
      return { sky: [mixc(GL.top[0], GL.top[1], s), mixc(GL.low[0], GL.low[1], s)], sun: GL.glow, ridge: GL.ridge.map(function (c) { return mixc(c, [40, 80, 96], s * .5); }), rim: GL.rim, w: null, f: s };
    }
    function drawEye(a, dt) {
      if (a < .02) { EYE.pos = null; return; }
      var x = EYE.u * W, y = ridgeY(0, x) - Math.min(W, H) * .14, r = Math.min(W, H) * .075, C = (ms('dur-wink-open', 2600) + ms('dur-wink-closed', 160)) / 1000, open = ms('dur-wink-open', 2600) / 1000;
      EYE.cyc += dt; if (EYE.forced > 0) { EYE.forced -= dt; EYE.open = mix(EYE.open, 0, .5); } else { EYE.open = mix(EYE.open, (EYE.cyc % C) < open ? 1 : 0, .45); }
      var lx = clamp((M.px - x) / W * 2, -1, 1) * r * .35, ly = clamp((M.py - y) / H * 2, -1, 1) * r * .25, op = Math.max(.04, EYE.open);
      var iris = rgb(token('eye-iris'), '#5ef2b8'), white = rgb(token('eye-white'), '#e9f5ef'), pupil = rgb(token('eye-pupil'), '#07110f');
      cx.save(); cx.globalAlpha = a;
      var halo = cx.createRadialGradient(x, y, 0, x, y, r * 3); halo.addColorStop(0, css(iris, .28)); halo.addColorStop(1, css(iris, 0)); cx.fillStyle = halo; cx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
      cx.beginPath(); cx.ellipse(x, y, r * 1.25, r * .75 * op, 0, 0, 7); cx.fillStyle = css(white, .92); cx.fill();
      cx.save(); cx.clip(); cx.beginPath(); cx.arc(x + lx, y + ly, r * .48, 0, 7); cx.fillStyle = css(iris); cx.fill();
      cx.beginPath(); cx.arc(x + lx, y + ly, r * .22, 0, 7); cx.fillStyle = css(pupil); cx.fill();
      cx.beginPath(); cx.arc(x + lx - r * .12, y + ly - r * .12, r * .07, 0, 7); cx.fillStyle = '#fff'; cx.fill(); cx.restore();
      cx.strokeStyle = css(iris, .9); cx.lineWidth = 2; cx.beginPath(); cx.ellipse(x, y, r * 1.25, r * .75 * op, 0, 0, 7); cx.stroke();
      for (var i = -2; i <= 2; i++) { var ang = -Math.PI / 2 + i * .32, ry = r * .75 * op; cx.beginPath(); cx.moveTo(x + Math.cos(ang) * r * 1.1, y - ry * .98); cx.lineTo(x + Math.cos(ang) * r * 1.35, y - ry - r * .28); cx.stroke(); }
      cx.restore(); EYE.pos = { x: x, y: y, r: r };
    }
    function frame(now) {
      if (!alive) return;
      var dt = RM.matches ? 0 : Math.min(.05, ((now || 0) - last) / 1000 || 0); last = now || 0; t += dt;
      M.x += (M.tx - M.x) * (RM.matches ? 1 : FOLLOW * 60 * Math.max(dt, 1 / 60)); M.y += (M.ty - M.y) * (RM.matches ? 1 : FOLLOW * 60 * Math.max(dt, 1 / 60));
      var S = palette(), g = mode === 'weather';
      var sky = cx.createLinearGradient(0, 0, 0, H * (g ? .85 : 1)); sky.addColorStop(0, css(S.sky[0])); sky.addColorStop(1, css(S.sky[1])); cx.fillStyle = sky; cx.fillRect(0, 0, W, H);
      var sx = g ? mix(.3, .7, M.x) * W : M.x * W, sy = g ? mix(.2, .3, M.y) * H : mix(.18, .32, scroll) * H + M.y * 40;
      var sg = cx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * (g ? .55 : .6)); sg.addColorStop(0, css(S.sun, .55)); sg.addColorStop(g ? .2 : .25, css(g ? S.sun : GL.rim, .18)); sg.addColorStop(1, css(S.sun, 0)); cx.fillStyle = sg; cx.fillRect(0, 0, W, H);
      if (g) { cx.fillStyle = css(S.sun, .9); cx.beginPath(); cx.arc(sx, sy, Math.min(W, H) * .045, 0, 7); cx.fill(); }
      if (!g && o.shafts !== false) {
        cx.save(); cx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < 7; i++) {
          var ang = -.35 + (M.x - .5) * .3 + i * .06 + Math.sin(t * .3 + i) * .02, ww = 40 + noise(i * 7 + t * .2) * 120;
          cx.save(); cx.translate(sx, sy - 40); cx.rotate(ang); var lg = cx.createLinearGradient(0, 0, 0, H * 1.4); lg.addColorStop(0, css(GL.shaft, OPS + .03 * Math.sin(t + i))); lg.addColorStop(1, css(GL.shaft, 0));
          cx.fillStyle = lg; cx.beginPath(); cx.moveTo(-ww * .2, 0); cx.lineTo(ww * .2, 0); cx.lineTo(ww * 2.4, H * 1.4); cx.lineTo(-ww * 2.4, H * 1.4); cx.fill(); cx.restore();
        }
        cx.restore();
      }
      if (g && S.w[3] > 0) for (var k = 0; k < 90; k++) { cx.fillStyle = css(S.rim, S.w[3] * (.3 + .5 * Math.abs(Math.sin(t + k)))); cx.fillRect(P[k] * W, P[k + 100] * H * .55, 1.4, 1.4); }
      for (var L = 0; L < 3; L++) {
        cx.beginPath(); cx.moveTo(0, H); for (var x = 0; x <= W + 8; x += 8) cx.lineTo(x, ridgeY(L, x)); cx.lineTo(W, H); cx.closePath();
        var top = ridgeY(L, W / 2) - 80, rg = cx.createLinearGradient(0, top, 0, H); rg.addColorStop(0, css(S.ridge[L].map(function (v) { return v + (g ? 26 : 30); }))); rg.addColorStop(.3, css(S.ridge[L])); rg.addColorStop(1, css(VOID)); cx.fillStyle = rg; cx.fill();
        cx.strokeStyle = css(S.rim, (g ? .3 : .25) - L * (g ? .07 : .05)); cx.lineWidth = 1.2; cx.beginPath(); for (var x2 = 0; x2 <= W + 8; x2 += 8) { var y2 = ridgeY(L, x2); if (x2) cx.lineTo(x2, y2); else cx.moveTo(x2, y2); } cx.stroke();
        if (!g) { var hz = cx.createLinearGradient(0, ridgeY(L, W / 2) - 40, 0, ridgeY(L, W / 2) + 160); hz.addColorStop(0, css(GL.haze, 0)); hz.addColorStop(.5, css(GL.haze, OPH * (1 - scroll * .6))); hz.addColorStop(1, css(GL.haze, 0)); cx.fillStyle = hz; cx.fillRect(0, 0, W, H); }
        if (g && L === 0 && o.eye) drawEye(S.w[2], dt);
        if (o.draw) o.draw(cx, { plane: L, ridgeY: ridgeY, W: W, H: H, t: t, scroll: scroll, weights: S.w, pointer: M });
      }
      for (var pi = 0; pi < parts.length; pi++) {
        var p = parts[pi], dx = p.x - M.px, dy = p.y - M.py, d2 = dx * dx + dy * dy, R2 = g ? 16000 : 14000;
        if (d2 < R2) { var fo = (R2 - d2) / R2 * (g ? 1 : .9), dd = Math.sqrt(d2 + 1); p.vx += dx / dd * fo * (g ? 1.1 : 1); p.vy += dy / dd * fo * (g ? .6 : 1); }
        for (var ri = 0; ri < ripples.length; ri++) { var rp = ripples[ri], rd = Math.hypot(p.x - rp.x, p.y - rp.y) + .01; if (Math.abs(rd - rp.r) < 30) { p.vx += (p.x - rp.x) / rd * 1.5 * rp.a; p.vy += (p.y - rp.y) / rd * 1.5 * rp.a; } }
        var fall = 0;
        if (!RM.matches) {
          if (g) { fall = S.w[0] * (.6 + p.z) + S.w[1] * (7 + p.z * 6) - S.w[2] * (.4 + p.z * .4) - S.w[3] * .05; p.s += .02; p.r += .03 * (1 - S.w[1]); p.vx += Math.cos(p.s) * .05 * (S.w[0] + S.w[3]) - S.w[1] * .08; }
          else { p.s += .01; p.vx += Math.cos(p.s) * .02; p.vy += -.015 - p.z * .02; }
        }
        p.vx *= g ? .93 : .94; p.vy *= g ? .93 : .94; p.x += p.vx; p.y += p.vy + fall;
        if (p.y > H + 12) { p.y = -12; p.x = Math.random() * W; } if (p.y < -14) { p.y = H + 12; p.x = Math.random() * W; } if (p.x < -12) p.x = W + 12; if (p.x > W + 12) p.x = -12;
        var z = .5 + p.z;
        if (!g) { cx.save(); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = css(p.z > .8 ? GL.frost : GL.shaft, .25 + p.z * .5); cx.beginPath(); cx.arc(p.x, p.y, .6 + p.z * 2, 0, 7); cx.fill(); cx.restore(); continue; }
        if (S.w[0] > .02) { cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = S.w[0] * (.45 + p.z * .5); cx.fillStyle = p.z > .7 ? '#ffd2b5' : css(WX[0].rim); cx.beginPath(); cx.ellipse(0, 0, 4 * z, 2.2 * z, 0, 0, 7); cx.fill(); cx.restore(); }
        if (S.w[1] > .02) { cx.strokeStyle = 'rgba(255,' + ((100 + p.z * 40) | 0) + ',' + ((100 + p.z * 30) | 0) + ',' + (S.w[1] * (.25 + p.z * .5)) + ')'; cx.lineWidth = .8 + p.z; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - 2 - p.vx, p.y - 10 - p.z * 14); cx.stroke(); }
        if (S.w[2] > .02) { cx.fillStyle = 'rgba(160,255,215,' + (S.w[2] * (.25 + p.z * .5)) + ')'; cx.beginPath(); cx.arc(p.x, p.y, .7 + p.z * 1.8, 0, 7); cx.fill(); }
        if (S.w[3] > .02 && p.z > .6) { var fl = .5 + .5 * Math.sin(t * 3 + p.s * 4); cx.fillStyle = 'rgba(255,226,170,' + (S.w[3] * fl * .9) + ')'; cx.beginPath(); cx.arc(p.x, p.y, 1.6, 0, 7); cx.fill(); cx.fillStyle = 'rgba(255,226,170,' + (S.w[3] * fl * .15) + ')'; cx.beginPath(); cx.arc(p.x, p.y, 7, 0, 7); cx.fill(); }
      }
      for (var j = ripples.length - 1; j >= 0; j--) { var q = ripples[j]; q.r += 8; q.a *= .965; cx.strokeStyle = css(g ? S.rim : [201, 255, 230], q.a * .6); cx.lineWidth = 1.5; cx.beginPath(); cx.arc(q.x, q.y, q.r, 0, 7); cx.stroke(); if (q.a < .03) ripples.splice(j, 1); }
      var vg = cx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .8); vg.addColorStop(0, css(VOID, 0)); vg.addColorStop(1, css(VOID, g ? .7 : OPV)); cx.fillStyle = vg; cx.fillRect(0, 0, W, H);
      if (g) { var wi = Math.round(S.f); if (fixedWeather == null && wi !== lastWx) { lastWx = wi; if (o.onWeather) o.onWeather(WEATHER[wi], wi); emit('weather', { index: wi, id: WEATHER[wi].id, name: WEATHER[wi].name, accent: WEATHER[wi].acc }); } }
      if (o.onFrame) o.onFrame(api);
      if (!RM.matches && !doc.hidden) raf = w.requestAnimationFrame(frame); else raf = 0;
    }
    function kick() { if (!raf && alive) raf = w.requestAnimationFrame(frame); }
    function onScroll() {
      if (o.scroll === false) return;
      var max = root.scrollHeight - w.innerHeight; scroll = max > 0 ? clamp(w.scrollY / max, 0, 1) : 0; if (RM.matches) kick();
    }
    function onMove(e) {
      var r = contained ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
      M.tx = clamp((e.clientX - r.left) / W, 0, 1); M.ty = clamp((e.clientY - r.top) / H, 0, 1); M.px = e.clientX - r.left; M.py = e.clientY - r.top; if (RM.matches) kick();
    }
    function onLeave() { M.px = M.py = -999; }
    function onDown(e) { var r = canvas.getBoundingClientRect(); api.ripple(e.clientX - r.left, e.clientY - r.top); }
    function onVis() { if (!doc.hidden) kick(); }
    var api = {
      canvas: canvas, mode: mode, ridgeY: ridgeY,
      size: function () { return { W: W, H: H }; },
      ripple: function (x, y, a) { ripples.push({ x: x, y: y, r: 4, a: a || 1 }); D.haptic(6); emit('ripple', { x: x, y: y }); kick(); },
      setWeather: function (f) { fixedWeather = f == null ? null : +f; kick(); },
      setScroll: function (s) { scroll = clamp(s, 0, 1); kick(); },
      setTilt: function (x, y) { tilt.x = clamp(x || 0, -.5, .5); tilt.y = clamp(y || 0, -.5, .5); kick(); },
      eye: function () { return EYE.pos; }, wink: function () { EYE.forced = ms('dur-wink-closed', 160) / 1000 * 2; kick(); },
      redraw: kick,
      destroy: function () { alive = false; if (raf) w.cancelAnimationFrame(raf); w.removeEventListener('scroll', onScroll); w.removeEventListener('resize', onResize); w.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerdown', onDown); doc.removeEventListener('visibilitychange', onVis); }
    };
    function onResize() { size(); kick(); }
    size(); onScroll();
    w.addEventListener('scroll', onScroll, { passive: true }); w.addEventListener('resize', onResize);
    w.addEventListener('pointermove', onMove, { passive: true }); root.addEventListener('pointerleave', onLeave);
    if (o.interactive !== false) canvas.addEventListener('pointerdown', onDown);
    doc.addEventListener('visibilitychange', onVis);
    if (mode === 'weather' && o.accent !== false) w.addEventListener('df:weather', function (e) { root.style.setProperty('--accent', 'var(--' + e.detail.accent + ')'); root.style.setProperty('--art-accent', 'var(--wx-' + e.detail.id + '-rim)'); $$('[data-df-weather-name]').forEach(function (n) { n.textContent = e.detail.name; }); });
    kick(); return api;
  };

  /* ---------- hotspots: real buttons laid over things drawn in the art ---------- */
  D.hotspots = function (spots, o) {
    o = o || {}; var world = o.world || null, cap = o.caption || $('.df-caption--live'), host = o.host || doc.body, found = 0;
    var btns = spots.map(function (s, i) {
      var b = doc.createElement('button'); b.type = 'button'; b.className = 'df-hotspot ' + (world && !world.canvas.classList.contains('df-world--contained') ? 'df-hotspot--fixed' : '') + (o.visible ? ' df-hotspot--visible' : '');
      b.setAttribute('aria-label', s.title + ': ' + (s.body || ''));
      b.addEventListener('mouseenter', function () { show(i); }); b.addEventListener('focus', function () { show(i); });
      b.addEventListener('mouseleave', hide); b.addEventListener('blur', hide);
      b.addEventListener('click', function () {
        if (world) world.ripple(s.x, s.y);
        if (!s.found) { s.found = true; found++; b.classList.add('is-found'); if (o.onFound) o.onFound(s, found, spots.length); emit('found', { spot: s, found: found, total: spots.length }); }
        show(i);
      });
      host.appendChild(b); return b;
    });
    function place() {
      var sz = world ? world.size() : { W: host.clientWidth, H: host.clientHeight }, sc = 0, max = root.scrollHeight - w.innerHeight;
      if (max > 0) sc = clamp(w.scrollY / max, 0, 1);
      spots.forEach(function (s, i) {
        var x = s.u * sz.W, y = s.v * sz.H;
        if (world && s.plane != null) y = Math.min(world.ridgeY(s.plane, x) - 24, s.v * sz.H + sc * [60, 130, 220][s.plane]);
        s.x = x; s.y = y; var b = btns[i]; b.style.left = x + 'px'; b.style.top = y + 'px'; b.hidden = y > sz.H - 40 || y < 40;
      });
    }
    function show(i) {
      if (!cap) return; var s = spots[i];
      var k = $('.df-caption__label', cap), t = $('.df-caption__title', cap), b = $('.df-caption__body', cap);
      if (k) k.textContent = s.found ? 'Found' : (s.kicker || 'Press'); if (t) t.textContent = s.title; if (b) b.textContent = s.body || '';
      var sz = world ? world.size() : { W: w.innerWidth, H: w.innerHeight }, cw = Math.min(cap.offsetWidth || 300, 360);
      cap.style.left = Math.min(sz.W - cw - 16, Math.max(16, s.x + (s.x > sz.W / 2 ? -(cw + 30) : 36))) + 'px';
      cap.style.top = Math.max(16, Math.min(sz.H - 200, s.y - 60)) + 'px'; cap.classList.add('is-on');
    }
    function hide() { if (cap) cap.classList.remove('is-on'); }
    var tick = function () { place(); if (alive) w.requestAnimationFrame(tick); }, alive = true;
    if (RM.matches) { place(); w.addEventListener('scroll', place, { passive: true }); w.addEventListener('resize', place); } else w.requestAnimationFrame(tick);
    return { buttons: btns, place: place, found: function () { return found; }, destroy: function () { alive = false; btns.forEach(function (b) { b.remove(); }); } };
  };

  /* ---------- the eye (SVG): follows the pointer, winks on its clock, winks back when pressed ---------- */
  D.eye = function (el) {
    if (!el || el.__dfEye) return null; el.__dfEye = true;
    var look = $('.df-eye__look', el);
    function onMove(e) {
      if (!look || RM.matches) return; var r = el.getBoundingClientRect(), cxp = r.left + r.width / 2, cyp = r.top + r.height / 2;
      var lx = clamp((e.clientX - cxp) / w.innerWidth * 2, -1, 1) * 9, ly = clamp((e.clientY - cyp) / w.innerHeight * 2, -1, 1) * 5;
      look.setAttribute('transform', 'translate(' + lx.toFixed(1) + ' ' + ly.toFixed(1) + ')');
    }
    function wink() { el.classList.add('is-winking'); D.haptic(5); setTimeout(function () { el.classList.remove('is-winking'); }, ms('dur-wink-closed', 160) * 2); emit('wink', {}); }
    w.addEventListener('pointermove', onMove, { passive: true }); el.addEventListener('click', wink);
    return { wink: wink, destroy: function () { w.removeEventListener('pointermove', onMove); el.removeEventListener('click', wink); el.__dfEye = false; } };
  };

  /* ---------- tilt: the phone's own gravity, in screen space, with a neutral that follows a resting hand ---------- */
  D.tilt = function (o) {
    o = o || {}; var chip = o.chip || null, gain = num('depth-tilt-gain', 2.2);
    var T = { on: false, live: false, gx: 0, gy: 0, nx: 0, ny: 0, n0: null, tx: 0, ty: 0, sign: 0, lastT: 0, last: 0, ua: 0, perm: 'unknown', off: !!o.off };
    var needsPerm = typeof w.DeviceOrientationEvent !== 'undefined' && typeof w.DeviceOrientationEvent.requestPermission === 'function';
    function angle() { try { return (w.screen.orientation && w.screen.orientation.angle) || w.orientation || 0; } catch (e) { return 0; } }
    function toScreen(x, y) { var a = angle() * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, -(x * s + y * c)]; }
    function onMotion(e) {
      var g = e.accelerationIncludingGravity; if (!g || g.x == null) return;
      var now = performance.now() / 1000, dt = clamp(T.last ? now - T.last : .016, .004, .1); T.last = now; T.lastT = now; T.live = true;
      var m = Math.hypot(g.x, g.y, g.z || 0); if (m < 1) return; T.raw = [g.x, g.y, g.z || 0, m];
      var a = e.acceleration; T.ua = a && a.x != null ? Math.hypot(a.x, a.y, a.z || 0) : Math.abs(m - 9.81) * 1.4;
      if (T.ua >= 3.5) return;   // a shake is not a tilt: hold gravity still while the hand moves
      var sg = T.sign || (/iP(hone|ad|od)/.test(w.navigator.userAgent) ? 1 : -1), v = toScreen(sg * g.x / m, sg * g.y / m), k = 1 - Math.exp(-dt / .11);
      T.gx += (v[0] - T.gx) * k; T.gy += (v[1] - T.gy) * k;
    }
    function onOrient(e) {
      // W3C (Android) reports the reaction to gravity, older iOS gravity itself: the orientation angles vote, away from gimbal lock, then the vote is trusted
      if (T.sign || e.beta == null || !T.raw || (T.votes || 0) >= 60) return;
      var b = e.beta * Math.PI / 180, g = (e.gamma || 0) * Math.PI / 180; if (Math.abs(b) > 1.25) return;
      var dn = [Math.cos(b) * Math.sin(g), -Math.sin(b), -Math.cos(b) * Math.cos(g)], r = T.raw, dot = -(r[0] * dn[0] + r[1] * dn[1] + r[2] * dn[2]) / r[3];
      if (Math.abs(dot) > .5) { T.vote = (T.vote || 0) + (dot > 0 ? 1 : -1); T.votes = (T.votes || 0) + 1; if (T.votes >= 8) T.sign = T.vote >= 0 ? -1 : 1; }
    }
    var listening = false;
    function listen() { if (listening) return; listening = true; w.addEventListener('devicemotion', onMotion, { passive: true }); w.addEventListener('deviceorientation', onOrient, { passive: true }); }
    function ask() {
      if (!needsPerm) { listen(); return Promise.resolve('granted'); }
      return w.DeviceOrientationEvent.requestPermission().then(function (p) { T.perm = p; if (p === 'granted') { if (w.DeviceMotionEvent && w.DeviceMotionEvent.requestPermission) w.DeviceMotionEvent.requestPermission().catch(function () {}); listen(); } return p; }).catch(function () { T.perm = 'denied'; return 'denied'; });
    }
    function level() { T.nx = T.gx; T.ny = T.gy; T.n0 = null; T.tx = T.ty = 0; }
    var lastF = 0;
    function tick(now) {
      var dt = Math.min(.05, (now - lastF) / 1000 || .016); lastF = now;
      T.on = !T.off && T.live && performance.now() / 1000 - T.lastT < 1.2;
      if (T.on) {
        var kn = 1 - Math.exp(-dt / 8); T.nx += (T.gx - T.nx) * kn; T.ny += (T.gy - T.ny) * kn;
        if (T.n0) { var back = Math.hypot(T.gx - T.n0[0], T.gy - T.n0[1]), here = Math.hypot(T.gx - T.nx, T.gy - T.ny), drift = Math.hypot(T.nx - T.n0[0], T.ny - T.n0[1]); if (drift > .02 && back < here) { T.nx = T.n0[0]; T.ny = T.n0[1]; } }
        T.tx = T.gx - T.nx; T.ty = T.gy - T.ny;
        var big = Math.abs(T.tx) > .17; if (big && !T.n0) T.n0 = [T.nx, T.ny]; if (!big && Math.abs(T.tx) < .08) { T.calm = (T.calm || 0) + dt; if (T.calm > 3) T.n0 = null; } else T.calm = 0;
        var x = clamp(T.tx * gain, -1, 1) * .5, y = clamp(T.ty * gain, -1, 1) * .5;
        if (o.onTilt) o.onTilt(x, y, T); if (o.world) o.world.setTilt(x, y);
      }
      if (chip) {
        var dot = $('.df-tilt__dot', chip), on = T.on;
        if (dot) dot.style.transform = 'translate(' + (on ? clamp(T.tx * 46, -9, 9) : 0).toFixed(1) + 'px,' + (on ? clamp(T.ty * 46, -9, 9) : 0).toFixed(1) + 'px)';
        chip.classList.toggle('is-on', on); chip.classList.toggle('is-rolling', on && Math.abs(T.tx) > .17); chip.classList.toggle('is-off', T.off);
        chip.classList.toggle('is-ask', !T.off && needsPerm && T.perm !== 'granted');
        chip.hidden = !(T.live || needsPerm || mm('(pointer: coarse)').matches);
      }
      w.requestAnimationFrame(tick);
    }
    if (chip) {
      var press = 0, long = false;
      chip.addEventListener('pointerdown', function () { long = false; press = setTimeout(function () { long = true; T.off = true; D.haptic(12); emit('tilt', { off: true }); }, 650); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { chip.addEventListener(n, function () { clearTimeout(press); }); });
      chip.addEventListener('click', function () {
        if (long) { long = false; return; }
        if (T.off) { T.off = false; emit('tilt', { off: false }); return; }
        if (needsPerm && T.perm !== 'granted') { ask().then(function (p) { if (p === 'granted') level(); }); return; }
        level(); D.haptic(8); emit('tilt', { level: true });
      });
    }
    if (!needsPerm) listen();
    w.requestAnimationFrame(tick);
    return { state: T, ask: ask, level: level, off: function (v) { T.off = v !== false; } };
  };

  /* ---------- sound: off until asked, a visible toggle, remembered for this visit only ---------- */
  D.sound = function (btn, o) {
    o = o || {}; var on = false; try { on = w.sessionStorage.getItem('df:sound') === '1'; } catch (e) {}
    function sync() { btn.setAttribute('aria-pressed', String(on)); btn.setAttribute('aria-label', on ? 'Sound on: turn off' : 'Sound off: turn on'); var l = $('.df-tool__label', btn); if (l) l.textContent = on ? 'Sound on' : 'Sound off'; }
    btn.addEventListener('click', function () { on = !on; try { w.sessionStorage.setItem('df:sound', on ? '1' : '0'); } catch (e) {} sync(); if (o.onChange) o.onChange(on); emit('sound', { on: on }); });
    sync(); return { get on() { return on; } };
  };

  /* ---------- the reality lens: the machinery shows through ---------- */
  D.lens = function (btn, banner) {
    function set(v) { root.classList.toggle('df-lens', v); btn.setAttribute('aria-pressed', String(v)); if (banner) banner.hidden = !v; emit('lens', { on: v }); }
    btn.addEventListener('click', function () { set(!root.classList.contains('df-lens')); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('df-lens')) set(false); });
    if (banner) banner.hidden = !root.classList.contains('df-lens'); return { set: set };
  };

  /* ---------- drawer and dialog: focus goes in, Escape and the veil close, focus comes back ---------- */
  D.drawer = function (el, opener) {
    var panel = $('.df-drawer__panel', el) || el, back = null;
    function onKey(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return; var f = focusables(panel); if (!f.length) return;
      if (e.shiftKey && doc.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && doc.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
    function open() { back = doc.activeElement; el.hidden = false; if (opener) opener.setAttribute('aria-expanded', 'true'); var f = focusables(panel); (f[0] || panel).focus(); doc.addEventListener('keydown', onKey); emit('drawer', { open: true, el: el }); }
    function close() { el.hidden = true; if (opener) opener.setAttribute('aria-expanded', 'false'); doc.removeEventListener('keydown', onKey); if (back && back.focus) back.focus(); emit('drawer', { open: false, el: el }); }
    el.addEventListener('click', function (e) { if (e.target === el) close(); });
    $$('[data-df-close]', el).forEach(function (b) { b.addEventListener('click', close); });
    if (opener) opener.addEventListener('click', open);
    return { open: open, close: close };
  };
  D.dialog = function (dlg) {
    if (!dlg) return null;
    $$('[data-df-close]', dlg).forEach(function (b) { b.addEventListener('click', function () { if (dlg.close) dlg.close(); }); });
    return { open: function () { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }, close: function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); } };
  };

  /* ---------- the FoundCard: one discovery at a time, a few seconds each, read out politely ---------- */
  D.found = function (el, o) {
    o = o || {}; var q = [], busy = false; if (!el.getAttribute('role')) { el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); }
    function set(cls, txt) { var n = $(cls, el); if (n) { n.textContent = txt || ''; n.hidden = !txt; } }
    function next() {
      if (!q.length) { busy = false; return; } busy = true; var it = q.shift();
      set('.df-found__kicker', it.kicker); set('.df-found__title', it.title); set('.df-found__line', it.line); set('.df-found__fact', it.fact); set('.df-found__more', it.more);
      el.classList.add('is-on'); D.haptic(8);
      setTimeout(function () { el.classList.remove('is-on'); setTimeout(next, ms('dur-base', 420)); }, o.hold || 6000);
    }
    return { show: function (it) { q.push(it); if (!busy) next(); } };
  };

  /* ---------- the reel: a guided tour; any touch hands it back, with everything as it was ---------- */
  D.reel = function (shots, o) {
    o = o || {}; var hud = o.hud || $('.df-reel'), on = false, i = -1, timers = [], t0 = 0, total = shots.reduce(function (a, s) { return a + (s.d || 6); }, 0), barRaf = 0;
    function set(cls, v) { var n = hud && $(cls, hud); if (n) n.textContent = v; }
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function bar() { var b = hud && $('.df-reel__bar > i', hud); if (b && on) { b.style.width = (clamp((performance.now() - t0) / 1000 / total, 0, 1) * 100).toFixed(2) + '%'; barRaf = w.requestAnimationFrame(bar); } }
    function shot(k) {
      clear(); i = k; if (i >= shots.length) { stop(true); return; }
      var s = shots[i]; set('.df-reel__id', 'S' + pad(i + 1, 2) + ' / ' + shots.length); set('.df-reel__name', s.name || ''); set('.df-reel__line', s.tune || s.cap || '');
      try { if (s.go) s.go(); } catch (e) {}
      (s.at || []).forEach(function (a) { timers.push(setTimeout(function () { try { a[1](); } catch (e) {} }, a[0] * 1000)); });
      if (o.onShot) o.onShot(s, i); emit('reel', { shot: i, name: s.name });
      timers.push(setTimeout(function () { shot(i + 1); }, (s.d || 6) * 1000));
    }
    function interrupt(e) { if (!on) return; if (e && e.target && e.target.closest && e.target.closest('.df-reel__stop')) return; stop(false); }
    function start() {
      if (on) return; on = true; t0 = performance.now(); root.classList.add('df-reeling'); if (hud) hud.hidden = false;
      if (o.onStart) o.onStart(); shot(0); bar();
      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (n) { w.addEventListener(n, interrupt, { capture: true, passive: true }); });
    }
    function stop(done) {
      if (!on) return; on = false; clear(); w.cancelAnimationFrame(barRaf); root.classList.remove('df-reeling'); if (hud) hud.hidden = true;
      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (n) { w.removeEventListener(n, interrupt, { capture: true }); });
      if (o.onStop) o.onStop(!!done); emit('reel', { done: !!done, stopped: true });
    }
    if (hud) { hud.hidden = true; var sb = $('.df-reel__stop', hud); if (sb) sb.addEventListener('click', function () { stop(false); }); }
    return { start: start, stop: stop, get on() { return on; }, get shot() { return i; }, total: total };
  };

  /* ---------- depth of field: blur by distance from the focus plane ---------- */
  D.focus = function (planes, index) {
    var steps = ['0px', token('blur-dof-1') || '2px', token('blur-dof-2') || '6px', token('blur-dof-3') || '12px'];
    planes.forEach(function (p, k) { p.classList.add('df-plane'); p.style.setProperty('--df-dof', steps[Math.min(3, Math.abs(k - index))]); });
  };

  /* ---------- the cursor ring: fine pointers only, never with reduced motion ---------- */
  D.cursor = function () {
    if (!FINE.matches || RM.matches || $('.df-cursor:not(.df-cursor--static)')) return null;
    var c = doc.createElement('div'); c.className = 'df-cursor'; c.setAttribute('aria-hidden', 'true'); doc.body.appendChild(c);
    var x = -100, y = -100, tx = -100, ty = -100;
    w.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; tx = e.clientX; ty = e.clientY; c.classList.add('is-on'); var t = e.target; c.classList.toggle('is-over', !!(t && t.closest && t.closest('a,button,[data-df-cursor],.df-hotspot'))); }, { passive: true });
    root.addEventListener('pointerleave', function () { c.classList.remove('is-on'); });
    (function loop() { x += (tx - x) * .25; y += (ty - y) * .25; c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; w.requestAnimationFrame(loop); })();
    return c;
  };

  /* ---------- slider fill (the track shows the value) ---------- */
  D.slider = function (input) {
    var out = input.id ? $('output[for="' + input.id + '"]') : null;
    function sync() { var p = (input.value - (input.min || 0)) / ((input.max || 100) - (input.min || 0)) * 100; input.style.setProperty('--p', p + '%'); if (out) out.textContent = input.value; }
    input.addEventListener('input', sync); sync(); return { sync: sync };
  };

  /* ---------- init: binds everything a page declares with data attributes ---------- */
  D.init = function (o) {
    o = o || {}; root.classList.remove('df-no-js'); if (doc.body) doc.body.classList.remove('df-no-js'); D.theme.init(o.theme); D.mountIcons();
    $$('[data-df-tool="face"]').forEach(function (b) { if (!b.__df) { b.__df = 1; b.addEventListener('click', D.theme.toggleFace); } });
    syncFace();
    $$('[data-df-tool="sound"]').forEach(function (b) { if (!b.__df) { b.__df = 1; D.sound(b, o.sound); } });
    $$('[data-df-tool="lens"]').forEach(function (b) { if (!b.__df) { b.__df = 1; D.lens(b, $(b.getAttribute('data-df-banner') || '.df-lens-banner')); } });
    $$('[data-df-open]').forEach(function (b) { if (b.__df) return; b.__df = 1; var t = $(b.getAttribute('data-df-open')); if (!t) return; if (t.tagName === 'DIALOG') { var d = D.dialog(t); b.addEventListener('click', d.open); } else D.drawer(t, b); });
    $$('.df-slider input[type="range"]').forEach(function (i) { if (!i.__df) { i.__df = 1; D.slider(i); } });
    var worlds = $$('canvas[data-df-world]').map(function (c) { return D.world(c, Object.assign({ mode: c.getAttribute('data-df-world') || 'glasshouse', eye: c.hasAttribute('data-df-eye') }, o.world || {})); }).filter(Boolean);
    if ($('[data-df-progress]') || $('[data-df-chapter]')) D.story(o.story);
    D.reveal();
    $$('.df-eye').forEach(function (e) { D.eye(e); });
    $$('[data-df-tilt]').forEach(function (chip) { D.tilt({ chip: chip, onTilt: function (x, y) { worlds.forEach(function (wd) { wd.setTilt(x, y); }); } }); });
    if (o.cursor) D.cursor();
    D.worlds = worlds; emit('ready', { worlds: worlds.length }); return D;
  };

  /* ---------- icons: the Depthfield set, 24px grid, 1.5px round strokes, drawn in currentColor ---------- */
  D.icons = {"arrow-right":"M5 12h14M13 6l6 6-6 6","arrow-up":"M12 19V5M6 11l6-6 6 6","arrow-down":"M12 5v14M6 13l6 6 6-6","arrow-up-right":"M7 17L17 7M9 7h8v8","chevron-left":"M15 6l-6 6 6 6","chevron-right":"M9 6l6 6-6 6","close":"M6 6l12 12M18 6L6 18","menu":"M4 6h16M4 12h16M4 18h10","play":"M8 5.5v13l10.5-6.5z","pause":"M8.5 5.5v13M15.5 5.5v13","sound-on":"M4 9.5h3.5L12 6v12l-4.5-3.5H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11","sound-off":"M4 9.5h3.5L12 6v12l-4.5-3.5H4zM16 9.5l5 5M21 9.5l-5 5","sun":"M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4","moon":"M15.5 3.2A9 9 0 1 0 20.8 16.6A7.2 7.2 0 0 1 15.5 3.2Z","lens":"M12 3v18M3 12h18M7 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0","eye":"M2.5 12C5 7.6 8.4 5.5 12 5.5s7 2.1 9.5 6.5c-2.5 4.4-5.9 6.5-9.5 6.5S5 16.4 2.5 12zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 12h.01","spore":"M12 10a2 2 0 1 0 0 4a2 2 0 1 0 0-4zM12 3.5v3M12 17.5v3M4.6 7.8l2.6 1.5M16.8 14.7l2.6 1.5M4.6 16.2l2.6-1.5M16.8 9.3l2.6-1.5","drag":"M12 3v18M3 12h18M12 3L9.5 5.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5","press":"M12 10a2 2 0 1 0 0 4a2 2 0 1 0 0-4zM12 6a6 6 0 1 0 0 12a6 6 0 1 0 0-12zM4 8.5A9 9 0 0 1 8.5 4M15.5 20A9 9 0 0 0 20 15.5","orbit":"M3 12a9 3.8 0 1 0 18 0a9 3.8 0 1 0-18 0M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM19.4 7.2h.01","tilt":"M11.22 3.69L18.91 5.89L14.78 20.31L7.09 18.11ZM15.7 16.6h.01M4 17.5a9.5 9.5 0 0 1 0-11M4 6.5l-1.6 1.8M4 6.5l2.2.6","skip":"M5 6.5l6 5.5-6 5.5zM12 6.5l6 5.5-6 5.5zM19.5 6v12","chapters":"M9 7h11M9 12h11M9 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01","check":"M5 12.5l4.5 4.5L19 7.5","info":"M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 11v5.5M12 7.8h.01","alert":"M12 3.8L21.2 19.5H2.8zM12 9.5v4.5M12 16.9h.01","door":"M6.5 21V10a5.5 5.5 0 0 1 11 0v11M4 21h16M14.5 14.5h.01","gamepad":"M7 9h10a4 4 0 0 1 3.9 4.9l-.9 3.6a2.2 2.2 0 0 1-3.8.9L14.6 16H9.4l-1.6 2.4a2.2 2.2 0 0 1-3.8-.9l-.9-3.6A4 4 0 0 1 7 9zM8 11.5v3M6.5 13h3M15.5 12.2h.01M17.5 14h.01","mic":"M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21","expand":"M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5","knot":"M12.00 9.65L12.72 9.68L13.43 9.76L14.13 9.89L14.81 10.07L15.46 10.29L16.08 10.57L16.67 10.88L17.21 11.23L17.70 11.62L18.14 12.03L18.52 12.47L18.85 12.93L19.11 13.39L19.31 13.87L19.44 14.34L19.51 14.82L19.52 15.27L19.46 15.72L19.33 16.13L19.14 16.52L18.90 16.88L18.60 17.20L18.25 17.47L17.85 17.70L17.41 17.87L16.93 18.00L16.42 18.06L15.88 18.07L15.32 18.01L14.75 17.90L14.17 17.73L13.59 17.49L13.02 17.20L12.45 16.85L11.91 16.45L11.38 16.00L10.89 15.50L10.42 14.96L10.00 14.38L9.62 13.78L9.28 13.14L8.99 12.48L8.76 11.81L8.57 11.13L8.44 10.46L8.37 9.78L8.35 9.12L8.39 8.48L8.47 7.86L8.61 7.27L8.80 6.72L9.03 6.21L9.31 5.75L9.62 5.34L9.96 4.98L10.33 4.69L10.73 4.45L11.14 4.29L11.57 4.18L12.00 4.15L12.43 4.18L12.86 4.29L13.27 4.45L13.67 4.69L14.04 4.98L14.38 5.34L14.69 5.75L14.97 6.21L15.20 6.72L15.39 7.27L15.53 7.86L15.61 8.48L15.65 9.12L15.63 9.78L15.56 10.46L15.43 11.13L15.24 11.81L15.01 12.48L14.72 13.14L14.38 13.77L14.00 14.38L13.58 14.96L13.11 15.50L12.62 16.00L12.09 16.45L11.55 16.85L10.98 17.20L10.41 17.49L9.83 17.73L9.25 17.90L8.68 18.01L8.12 18.07L7.58 18.06L7.07 18.00L6.59 17.87L6.15 17.70L5.75 17.47L5.40 17.20L5.10 16.88L4.86 16.52L4.67 16.13L4.54 15.72L4.48 15.27L4.49 14.82L4.56 14.34L4.69 13.87L4.89 13.39L5.15 12.93L5.48 12.47L5.86 12.03L6.30 11.62L6.79 11.23L7.33 10.88L7.92 10.57L8.54 10.29L9.19 10.07L9.87 9.89L10.57 9.76L11.28 9.68L12.00 9.65Z","archive":"M3.5 4.5h17v3h-17zM5 7.5v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-11M10 11.5h4","reel":"M3.5 5.5h17v13h-17zM3.5 9h17M3.5 15h17M8 5.5V9M16 5.5V9M8 15v3.5M16 15v3.5","weather":"M7.5 15.5a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17.6 8a3.75 3.75 0 0 1-.6 7.5zM9 18.5l-1 2M13 18.5l-1 2M17 18.5l-1 2","level":"M6 8.5h12a3.5 3.5 0 0 1 0 7H6a3.5 3.5 0 0 1 0-7zM9.5 8.5v7M14.5 8.5v7M12 11.2a.8.8 0 1 0 0 1.6a.8.8 0 1 0 0-1.6z","top":"M5 4h14M12 20V8M7 13l5-5 5 5","ripple":"M12 11.2a.8.8 0 1 0 0 1.6a.8.8 0 1 0 0-1.6zM12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10zM3 12a9 9 0 0 1 4-7.5M21 12a9 9 0 0 1-4 7.5"};
  D.icon = function (name, o) {
    o = o || {}; var d = D.icons[name]; if (!d) return '';
    var s = o.size || 24, label = o.label ? ' role="img" aria-label="' + String(o.label).replace(/"/g, '&quot;') + '"' : ' aria-hidden="true"';
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="' + (o.stroke || 1.5) + '" stroke-linecap="round" stroke-linejoin="round" focusable="false"' + label + '><path d="' + d + '"/></svg>';
  };
  D.mountIcons = function (scope) { $$('[data-df-icon]', scope).forEach(function (el) { if (!el.firstElementChild) el.innerHTML = D.icon(el.getAttribute('data-df-icon'), { size: +el.getAttribute('data-size') || 24 }); }); };

  w.Depthfield = D;
})();

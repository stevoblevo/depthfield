/* Depthfield 2.2 — behaviors (2.1 added folds, the stack, secrets, the field and pop-ups; 2.2 adds the cloth, the guardian, the lamp, stretch type, sense, guide, tone and taste). One classic script: window.Depthfield. No dependencies, no network.
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

  var D = { version: '2.2.0', token: token, clamp: clamp, reducedMotion: function () { return RM.matches; } };

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

  /* ---------- folds: paper that opens in panels (letter, fan, gate); a <details> underneath, so it reads with no JS ---------- */
  D.fold = function (el) {
    if (!el || el.__dfFold) return el ? el.__dfFold : null;
    var sum = $('summary', el), busy = false, ps = $$('.df-fold__panel', el);
    if (!/df-fold--(letter|gate)/.test(el.className)) { ps.forEach(function (p, k) { p.style.setProperty('--df-k', k); }); el.style.setProperty('--df-n', ps.length); }
    function set(v) {
      if (v === el.open || busy) return;
      if (v || RM.matches) { el.open = v; emit('fold', { el: el, open: v }); return; }
      busy = true; el.classList.add('is-closing');
      setTimeout(function () { el.classList.remove('is-closing'); el.open = false; busy = false; emit('fold', { el: el, open: false }); }, ms('dur-fold', 700) + ms('dur-fold-stagger', 90) * Math.max(0, ps.length - 1));
    }
    if (sum) sum.addEventListener('click', function (e) { e.preventDefault(); set(!el.open); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.open) { set(false); if (sum) sum.focus(); } });
    return (el.__dfFold = { open: function () { set(true); }, close: function () { set(false); }, toggle: function () { set(!el.open); } });
  };

  /* ---------- the stack: an exploded cross-section that opens with the scroll; the legend pulls focus to one layer ---------- */
  D.stack = function (el, o) {
    if (!el || el.__dfStack) return el ? el.__dfStack : null; o = o || {};
    var set = $('.df-stack__set', el) || el, planes = $$('.df-stack__plane', el), raf = 0;
    var legend = o.legend || (el.getAttribute('data-df-legend') ? $(el.getAttribute('data-df-legend')) : null);
    var lo = num('depth-stack-min', 12), hi = num('depth-stack-max', 56), gmax = hi;
    planes.forEach(function (p, i) { p.style.setProperty('--i', i); });
    function size() { var pw = set.offsetWidth || 300; gmax = Math.min(hi, pw * .17); el.style.setProperty('--df-stack-h', Math.round(pw * .62 + (planes.length - 1) * gmax * .9 + 96) + 'px'); }
    function update() {
      raf = 0; var g = gmax * .8;
      if (!RM.matches) { var r = el.getBoundingClientRect(), vh = w.innerHeight || 800, p = clamp((vh * .95 - r.top) / (vh * .75), 0, 1); g = mix(Math.min(lo, gmax * .4), gmax, 1 - Math.pow(1 - p, 3)); }
      set.style.setProperty('--df-gap', g.toFixed(1) + 'px');
    }
    function pull(i) {
      var steps = ['0px', token('blur-dof-1') || '2px', token('blur-dof-2') || '6px', token('blur-dof-3') || '12px'];
      planes.forEach(function (p, k) { p.classList.toggle('is-focus', k === i); p.style.setProperty('--df-dof', i == null ? '0px' : steps[Math.min(3, Math.abs(k - i))]); });
      if (legend) $$('[data-i]', legend).forEach(function (li) { li.classList.toggle('is-focus', +li.getAttribute('data-i') === i); });
      emit('stack', { el: el, focus: i });
    }
    w.addEventListener('scroll', function () { if (!raf) raf = w.requestAnimationFrame(update); }, { passive: true });
    w.addEventListener('resize', function () { size(); update(); });
    if (legend) $$('[data-i]', legend).forEach(function (li) {
      var i = +li.getAttribute('data-i'); if (!li.hasAttribute('tabindex')) li.tabIndex = 0;
      li.addEventListener('mouseenter', function () { pull(i); }); li.addEventListener('focus', function () { pull(i); });
      li.addEventListener('mouseleave', function () { pull(null); }); li.addEventListener('blur', function () { pull(null); });
    });
    planes.forEach(function (p, k) { p.addEventListener('mouseenter', function () { pull(k); }); p.addEventListener('mouseleave', function () { pull(null); }); });
    size(); update();
    return (el.__dfStack = { focus: pull, update: update });
  };

  /* ---------- secrets: a hidden mode that shows itself in stages (a glyph, then a name and a hint); never a dead end ---------- */
  D.secret = function (o) {
    o = o || {}; var id = o.id || 'secret', chip = o.chip, echoes = o.echoes || [], key = 'df:secret:' + id;
    if (!chip) return null;
    var stage = 0, seen = store(key) === '1', left = false;
    function flash() { chip.classList.remove('is-flash'); void chip.offsetWidth; chip.classList.add('is-flash'); }
    function set(s) {
      if (s <= stage) return; var from = stage; stage = s;
      if (from < 1) { chip.hidden = false; echoes.forEach(function (e) { e.hidden = false; }); chip.classList.add('is-shown'); if (!seen) { if (!RM.matches) chip.classList.add('is-pulsing'); if (s < 2) setTimeout(function () { set(2); }, o.nameAfter || 30000); } }
      if (s >= 2) { chip.classList.add('is-named'); if (!seen) { flash(); if (o.hint) o.hint(); } }
      emit('secret', { id: id, stage: s });
    }
    function open() { set(2); chip.classList.remove('is-pulsing'); if (!seen) { seen = true; store(key, '1'); } emit('secret', { id: id, stage: 3 }); if (o.onOpen) o.onOpen(); }
    if (seen) set(2);
    else {
      setTimeout(function () { set(1); }, o.after == null ? 40000 : o.after);
      if (o.revealAt && 'IntersectionObserver' in w) new IntersectionObserver(function (es) { if (es[0].isIntersecting) set(1); }).observe(o.revealAt);
      if (o.watch && 'IntersectionObserver' in w) new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) { left = true; return; }
        if (left && stage >= 1 && !seen) { left = false; if (stage < 2) set(2); else flash(); }
      }, { threshold: .3 }).observe(o.watch);
    }
    chip.addEventListener('click', open); echoes.forEach(function (e) { e.addEventListener('click', open); });
    if (o.word) { var typed = '', word = String(o.word).toLowerCase(); doc.addEventListener('keydown', function (e) {
      var t = e.target; if (t && t.closest && t.closest('input,select,textarea,[contenteditable]')) return;
      if (!e.key || e.key.length !== 1) return; typed = (typed + e.key.toLowerCase()).slice(-word.length); if (typed === word) { typed = ''; open(); }
    }); }
    return { open: open, stage: function () { return stage; }, reveal: function () { set(1); }, name: function () { set(2); } };
  };

  /* ---------- the field: a lattice of cells that hold their state at zero power (e-paper), with Life (B3/S23) built in ---------- */
  D.field = function (canvas, o) {
    if (!canvas || !canvas.getContext) return null; o = o || {};
    var ctx = canvas.getContext('2d'), sq = o.lattice === 'square', S = o.cell || 30, HH = sq ? S : S * 1.24, G = 2;
    var cells = [], W = 0, H = 0, gen = 0, run = !RM.matches && o.run !== false, pace = o.pace || ms('dur-generation', 420), next = 0, light = o.light == null ? 1 : +o.light, vis = true, paint = false;
    var C1 = rgb(o.on || token('ink'), '#ffffff'), C0 = rgb(o.off || token('surface-raised'), '#222222'), BG = token('void') || '#000000', K = [0, 0, 0];
    function dur() { return pace > 2000 ? 4000 : Math.min(300, pace * .7); }
    function put(c, a, now) { if (c.a === a) return false; c.a = a; c.t = now; return true; }
    function soup(p, quiet) { var now = quiet ? -1e9 : performance.now(); cells.forEach(function (c) { put(c, Math.random() < p, now); }); gen = 0; }
    function build() {
      var r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return; var dpr = Math.min(2, w.devicePixelRatio || 1);
      W = r.width; H = r.height; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var R = Math.ceil(H / (sq ? S : HH / 2)) + 3, Cn = Math.ceil(W / S) + 2; if (R % 2) R++;
      cells = [];
      for (var j = 0; j < R; j++) for (var i = 0; i < Cn; i++) cells.push({ x: (i - 1) * S + (!sq && (j & 1) ? S / 2 : 0), y: (j - 1) * (sq ? S : HH / 2), j: j, i: i, a: false, t: -1e9 });
      function at(j, i) { return (((j % R) + R) % R) * Cn + (((i % Cn) + Cn) % Cn); }
      /* the diamond lattice is a square grid turned 45 degrees: edge-sharing cells are its orthogonal neighbours, corner-touching ones its diagonals */
      cells.forEach(function (c) {
        var j = c.j, i = c.i, e = (j & 1) ? [i, i + 1] : [i - 1, i];
        c.n = sq ? [at(j - 1, i - 1), at(j - 1, i), at(j - 1, i + 1), at(j, i - 1), at(j, i + 1), at(j + 1, i - 1), at(j + 1, i), at(j + 1, i + 1)]
                 : [at(j, i - 1), at(j, i + 1), at(j - 2, i), at(j + 2, i), at(j - 1, e[0]), at(j - 1, e[1]), at(j + 1, e[0]), at(j + 1, e[1])];
      });
      if (o.seed !== false) soup(o.seed || .26, true);
    }
    function step() {
      var now = performance.now(), nx = new Uint8Array(cells.length), flips = 0, alive = 0;
      cells.forEach(function (c, k) { var n = 0; for (var q = 0; q < 8; q++) if (cells[c.n[q]].a) n++; nx[k] = c.a ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0); });
      cells.forEach(function (c, k) { if (put(c, nx[k] === 1, now)) flips++; if (c.a) alive++; });
      gen++; emit('field', { canvas: canvas, gen: gen, alive: alive, flips: flips }); if (o.onStep) o.onStep(gen, alive, flips); return flips;
    }
    function draw(now) {
      var amb = .05 + .95 * light, d = dur(), hw = S / 2 - G, hh = (sq ? S : HH) / 2 - G;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      cells.forEach(function (c) {
        var p = clamp((now - c.t) / d, 0, 1), A = c.a ? C1 : C0, B = c.a ? C0 : C1;
        var col = p >= 1 ? A : (p < .3 ? mixc(B, K, p / .3) : mixc(K, A, (p - .3) / .7));
        ctx.fillStyle = css([col[0] * amb, col[1] * amb, col[2] * amb]); ctx.beginPath();
        if (sq) ctx.rect(c.x - hw, c.y - hh, hw * 2, hh * 2);
        else { ctx.moveTo(c.x, c.y - hh); ctx.lineTo(c.x + hw, c.y); ctx.lineTo(c.x, c.y + hh); ctx.lineTo(c.x - hw, c.y); ctx.closePath(); }
        ctx.fill();
      });
    }
    function loop(now) { w.requestAnimationFrame(loop); if (!vis || !W || doc.hidden) return; if (run && now > next) { next = now + pace; step(); } draw(now); }
    function hit(e) {
      var r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height, rr = S * S * .5, now = performance.now(), n = 0;
      cells.forEach(function (c) { var dx = c.x - x, dy = c.y - y; if (dx * dx + dy * dy < rr && put(c, true, now)) n++; });
      if (n) emit('field', { canvas: canvas, gen: gen, painted: n });
    }
    if (o.paint !== false) {
      canvas.addEventListener('pointerdown', function (e) { paint = true; try { canvas.setPointerCapture(e.pointerId); } catch (x) {} hit(e); });
      canvas.addEventListener('pointermove', function (e) { if (paint) hit(e); });
      ['pointerup', 'pointercancel'].forEach(function (t) { canvas.addEventListener(t, function () { paint = false; }); });
    }
    if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(canvas);
    var rz = 0; w.addEventListener('resize', function () { cancelAnimationFrame(rz); rz = w.requestAnimationFrame(build); });
    build(); w.requestAnimationFrame(loop);
    return {
      step: step, soup: function (p) { soup(p || .26); }, clear: function () { var now = performance.now(); cells.forEach(function (c) { put(c, false, now); }); gen = 0; },
      run: function (v) { run = v == null ? !run : !!v; next = performance.now() + 200; return run; },
      pace: function (v) { pace = +v || pace; }, light: function (v) { light = clamp(+v, 0, 1); },
      alive: function () { var n = 0; cells.forEach(function (c) { if (c.a) n++; }); return n; }, get gen() { return gen; }
    };
  };

  /* ---------- pop-up: a spread whose pieces stand up as the book opens; --df-open runs 0 (shut) to 1 (flat) ---------- */
  D.popup = function (el, o) {
    if (!el || el.__dfPop) return el ? el.__dfPop : null; o = o || {};
    var v = 0, raf = 0, drag = null;
    function put(x) { v = clamp(x, 0, 1); el.style.setProperty('--df-open', v.toFixed(3)); emit('popup', { el: el, open: v }); }
    function to(x, d, done) {
      cancelAnimationFrame(raf); if (RM.matches) { put(x); if (done) done(); return; }
      var a = v, t0 = 0; d = d || ms('dur-scene', 1600);
      raf = w.requestAnimationFrame(function f(t) { if (!t0) t0 = t; var k = clamp((t - t0) / d, 0, 1), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; put(mix(a, x, e)); if (k < 1) raf = w.requestAnimationFrame(f); else if (done) done(); });
    }
    el.addEventListener('pointerdown', function (e) { if (e.target.closest('a,button,input,select')) return; drag = { x: e.clientX, v: v }; try { el.setPointerCapture(e.pointerId); } catch (x) {} cancelAnimationFrame(raf); });
    el.addEventListener('pointermove', function (e) { if (drag) put(drag.v + (drag.x - e.clientX) / ((el.offsetWidth || 600) * .5)); });
    ['pointerup', 'pointercancel'].forEach(function (t) { el.addEventListener(t, function () { if (!drag) return; drag = null; to(v > .5 ? 1 : 0, ms('dur-base', 420)); }); });
    put(o.open == null ? 0 : o.open);
    if (o.auto !== false) setTimeout(function () { to(1); }, o.delay == null ? 300 : o.delay);
    return (el.__dfPop = { open: function (d) { to(1, d); }, close: function (d) { to(0, d); }, to: to, get value() { return v; } });
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
    $$('details.df-fold').forEach(function (f) { D.fold(f); });
    $$('[data-df-stack]').forEach(function (s) { D.stack(s); });
    $$('[data-df-popup]').forEach(function (p) { D.popup(p, { auto: p.getAttribute('data-df-popup') !== 'shut' }); });
    $$('canvas[data-df-field]').forEach(function (c) { if (!c.__df) { c.__df = 1; c.__dfField = D.field(c, { lattice: c.getAttribute('data-df-field') || 'diamond' }); } });
    $$('[data-df-secret]').forEach(function (b) {
      if (b.__df) return; b.__df = 1;
      var id = b.getAttribute('data-df-secret'), at = function (n) { var q = b.getAttribute('data-df-' + n); return q ? $(q) : null; }, ht = at('hint-target'), hint = b.getAttribute('data-df-hint');
      D.secret({ id: id, chip: b, echoes: $$('[data-df-secret-echo="' + id + '"]'), after: b.hasAttribute('data-df-after') ? +b.getAttribute('data-df-after') : null, nameAfter: +b.getAttribute('data-df-name-after') || null,
        word: b.getAttribute('data-df-word'), revealAt: at('reveal-at'), watch: at('watch'), hint: ht && hint ? function () { ht.textContent = hint; } : null });
    });
    $$('canvas[data-df-cloth]').forEach(function (c) {
      if (c.__dfCloth) return; var tl = c.getAttribute('data-df-threads'), bl = c.getAttribute('data-df-bands');
      D.cloth(c, { view: c.getAttribute('data-df-cloth') === 'lay' ? 'lay' : 'hang', threads: tl && $(tl) ? itemsFrom($(tl)) : [], bands: bl && $(bl) ? itemsFrom($(bl)) : null });
    });
    var room = $('input[data-df-room]'); if (room && !room.__df) { room.__df = 1; D.room = D.lamp(root, { input: room }); }
    $$('[data-df-sense]').forEach(function (el) { if (!el.__df) { el.__df = 1; D.senses = D.senses || []; D.senses.push(D.sense({ el: el })); } });
    $$('[data-df-stretch]').forEach(function (el) {
      if (el.__dfS) return; el.__dfS = 1; var s = D.stretch(el, { value: parseFloat(el.getAttribute('data-df-stretch')) || .7, min: +el.getAttribute('data-df-stretch-min') || undefined, max: +el.getAttribute('data-df-stretch-max') || undefined });
      if (el.hasAttribute('data-df-stretch-sense')) { if (!D.senses) D.senses = [D.sense({})]; s.bind(); }
    });
    if (/[?&#]df-taste\b/.test(w.location.href)) setTimeout(function () { D.taste.badge(); }, 700);
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


  /* ================= 2.2: threads, light, companions and taste ================= */

  /* ---------- lamp: one warm light that follows the hand; reflective things fade with the room ---------- */
  D.lamp = function (el, o) {
    o = o || {}; el = el || root;
    var host = el === root ? w : el, lag = o.lag || num('depth-follow', .05), radius = o.radius || .42, floor = o.floor == null ? num('op-lamp-floor', .35) : o.floor;
    var st = { u: o.u == null ? .62 : o.u, v: o.v == null ? .38 : o.v, tu: 0, tv: 0, room: o.room == null ? .85 : o.room, raf: 0 };
    st.tu = st.u; st.tv = st.v;
    function rect() { return el === root ? { left: 0, top: 0, width: w.innerWidth, height: w.innerHeight } : el.getBoundingClientRect(); }
    function write() { el.style.setProperty('--df-lamp-x', (st.u * 100).toFixed(2) + '%'); el.style.setProperty('--df-lamp-y', (st.v * 100).toFixed(2) + '%'); el.style.setProperty('--df-room', st.room.toFixed(3)); if (o.onMove) o.onMove(st.u, st.v, st.room); }
    function loop() { st.raf = 0; var k = RM.matches ? 1 : lag * 2.4; st.u = mix(st.u, st.tu, k); st.v = mix(st.v, st.tv, k); write(); if (Math.abs(st.u - st.tu) + Math.abs(st.v - st.tv) > .0015) st.raf = requestAnimationFrame(loop); }
    function kick() { if (!st.raf) st.raf = requestAnimationFrame(loop); }
    function move(e) { var r = rect(); if (!r.width) return; st.tu = clamp((e.clientX - r.left) / r.width, 0, 1); st.tv = clamp((e.clientY - r.top) / r.height, 0, 1); kick(); }
    host.addEventListener('pointermove', move, { passive: true });
    var api = {
      light: function (u, v) { var du = u - st.u, dv = v - st.v; return st.room * (floor + (1 - floor) * Math.exp(-(du * du + dv * dv) / (radius * radius))); },
      at: function (u, v) { st.tu = clamp(u, 0, 1); st.tv = clamp(v, 0, 1); kick(); },
      set: function (r) { st.room = clamp(r, 0, 1); write(); emit('lamp', { el: el, room: st.room }); },
      get room() { return st.room; }, get u() { return st.u; }, get v() { return st.v; },
      destroy: function () { host.removeEventListener('pointermove', move); cancelAnimationFrame(st.raf); }
    };
    if (o.input) { var inp = o.input, read = function () { return (+inp.value - (+inp.min || 0)) / ((+inp.max || 100) - (+inp.min || 0)); }; inp.addEventListener('input', function () { api.set(read()); }); st.room = read(); }
    write(); return api;
  };

  /* ---------- stretch: type with a width axis, bound to something real ---------- */
  var STRETCH_MAP = { arriving: .7, still: .55, calm: .82, curious: .64, caffeinated: .12 };
  D.stretch = function (el, o) {
    if (!el) return null; o = o || {};
    var lo = o.min == null ? 50 : o.min, hi = o.max == null ? 132 : o.max, cur = clamp(o.value == null ? .7 : o.value, 0, 1), extra = o.extra ? ', ' + o.extra : '', off = null;
    el.classList.add('df-stretch');
    function apply(v, instant) {
      cur = clamp(v, 0, 1);
      if (instant) el.style.transition = 'none';
      el.style.fontVariationSettings = '"wdth" ' + mix(lo, hi, cur).toFixed(1) + extra;
      if (instant) { void el.offsetWidth; el.style.transition = ''; }
      emit('stretch', { el: el, value: cur });
    }
    var target = cur; if (o.intro !== false && !RM.matches) { apply(0, true); setTimeout(function () { apply(target); }, 80); } else apply(cur, true);
    var api = {
      to: function (v) { apply(v); }, get value() { return cur; },
      bind: function (map) {
        map = map || STRETCH_MAP; if (off) off();
        var fn = function (e) { var s = e.detail && e.detail.state; if (s in map) apply(map[s]); };
        w.addEventListener('df:sense', fn); off = function () { w.removeEventListener('df:sense', fn); off = null; }; return api;
      },
      unbind: function () { if (off) off(); }
    };
    return api;
  };

  /* ---------- sense: a state inferred from how the pointer moves; never asked, always labelled ---------- */
  D.sense = function (o) {
    o = o || {};
    var labels = Object.assign({ arriving: 'arriving', still: 'still', calm: 'calm', curious: 'curious', caffeinated: 'caffeinated' }, o.labels || {});
    var spd = 0, jerk = 0, last = null, moved = 0, state = 'arriving', pend = 'arriving', since = 0, subs = [], el = o.el || null, iv = 0;
    function paint() { if (!el) return; el.innerHTML = (o.prefix == null ? 'state' : o.prefix) + ' <b>' + labels[state] + '</b> <small>inferred</small>'; el.setAttribute('title', 'Inferred from how the pointer moves. Nothing is asked and nothing is sent.'); }
    function mv(e) {
      var now = performance.now();
      if (last) {
        var dt = Math.max(8, now - last.t) / 1000, vx = (e.clientX - last.x) / dt, vy = (e.clientY - last.y) / dt, v = Math.hypot(vx, vy);
        spd = mix(spd, v, .12);
        if (last.vx != null && v > 30) { var turn = Math.abs(Math.atan2(vy, vx) - Math.atan2(last.vy, last.vx)); jerk = mix(jerk, Math.min(turn, 6.283 - turn), .1); }
        last = { x: e.clientX, y: e.clientY, t: now, vx: vx, vy: vy };
      } else last = { x: e.clientX, y: e.clientY, t: now };
      moved = now;
    }
    function tick() {
      var now = performance.now(), idle = moved ? (now - moved) / 1000 : 0;
      var s = !moved ? 'arriving' : idle > (o.still || 14) ? 'still' : (spd > 1300 || jerk > 1.1) ? 'caffeinated' : spd > 320 ? 'curious' : 'calm';
      if (s !== pend) { pend = s; since = now; }
      if (s !== state && now - since > 1200) {
        state = s; paint();
        var detail = { state: state, label: labels[state], speed: Math.round(spd), jerk: +jerk.toFixed(2), inferred: true };
        emit('sense', detail); subs.forEach(function (f) { f(detail); });
      }
      spd *= .9; jerk *= .97;
    }
    w.addEventListener('pointermove', mv, { passive: true }); iv = setInterval(tick, 400); paint();
    return { get state() { return state; }, on: function (f) { subs.push(f); return this; }, destroy: function () { clearInterval(iv); w.removeEventListener('pointermove', mv); } };
  };

  /* ---------- guide: find N, one hint at a time, kept between visits ---------- */
  D.guide = function (o) {
    o = o || {}; var key = 'df:guide:' + (o.id || 'page'), steps = o.steps || [], found = {};
    try { (JSON.parse(store(key) || '[]') || []).forEach(function (s) { found[s] = 1; }); } catch (e) {}
    function count() { return steps.filter(function (s) { return found[s.id]; }).length; }
    function next() { for (var i = 0; i < steps.length; i++) if (!found[steps[i].id]) return steps[i]; return null; }
    function paint() {
      if (o.count) o.count.innerHTML = (o.label || 'found') + ' <b>' + count() + '</b> / ' + steps.length;
      var n = next(); if (o.hint) o.hint.textContent = n ? n.hint : (o.done || 'All ' + steps.length + ' found. The page is yours.');
    }
    var api = {
      find: function (id) {
        if (found[id] || !steps.some(function (s) { return s.id === id; })) return false;
        found[id] = 1; store(key, JSON.stringify(Object.keys(found))); paint(); D.haptic(8);
        var c = count(); emit('guide', { id: o.id, step: id, found: c, total: steps.length });
        if (o.onFind) o.onFind(id, c, steps.length); if (c === steps.length && o.onDone) o.onDone(); return true;
      },
      has: function (id) { return !!found[id]; }, count: count, next: next, paint: paint, total: steps.length,
      reset: function () { found = {}; store(key, '[]'); paint(); }
    };
    paint(); return api;
  };

  /* ---------- tone: a plucked string, tuned Bohlen–Pierce; silent until the sound tool is on ---------- */
  D.tone = (function () {
    var ac = null, on = false, BP = [0, 2, 4, 6, 8, 10, 13], f0 = 82.4;
    try { on = w.sessionStorage.getItem('df:sound') === '1'; } catch (e) {}
    function ensure() {
      if (!ac) { try { ac = new (w.AudioContext || w.webkitAudioContext)(); } catch (e) { return false; } }
      if (ac.state === 'suspended') ac.resume(); return true;
    }
    function freq(k) { return f0 * Math.pow(3, (BP[((k % 7) + 7) % 7] + 13 * Math.floor(k / 7)) / 13); }
    function pluck(k, vol) {
      if (!on || !ensure()) return;
      var sr = ac.sampleRate, len = Math.floor(sr * 1.8), n = Math.max(2, Math.round(sr / freq(k))), buf = ac.createBuffer(1, len, sr), d = buf.getChannelData(0), ring = new Float32Array(n), p = 0, i;
      for (i = 0; i < n; i++) ring[i] = Math.random() * 2 - 1;
      for (i = 0; i < len; i++) { var a = ring[p], b = ring[(p + 1) % n]; d[i] = a; ring[p] = (a + b) * .5 * .996; p = (p + 1) % n; }
      var src = ac.createBufferSource(), gn = ac.createGain(); src.buffer = buf; gn.gain.value = vol == null ? .28 : vol; src.connect(gn).connect(ac.destination); src.start();
    }
    function thump() {
      if (!on || !ensure()) return;
      var osc = ac.createOscillator(), gn = ac.createGain(), t = ac.currentTime; osc.frequency.setValueAtTime(90, t); osc.frequency.exponentialRampToValueAtTime(42, t + .12);
      gn.gain.setValueAtTime(.32, t); gn.gain.exponentialRampToValueAtTime(.001, t + .16); osc.connect(gn).connect(ac.destination); osc.start(t); osc.stop(t + .18);
    }
    w.addEventListener('df:sound', function (e) { on = !!(e.detail && e.detail.on); if (on) ensure(); });
    return { scale: BP, freq: freq, pluck: pluck, thump: thump, get on() { return on; }, enable: function (v) { on = v !== false; if (on) ensure(); return on; } };
  })();

  /* ---------- guardian: a small companion that follows, reviews, and can be thrown at things ---------- */
  var gid = 0;
  function strawberry(id) {
    var seeds = [[17, 29], [47, 29], [13, 42], [51, 42], [20, 52], [44, 52], [32, 58], [26, 24], [38, 24]].map(function (s) { return '<ellipse cx="' + s[0] + '" cy="' + s[1] + '" rx="1.3" ry="2"/>'; }).join('');
    return '<svg viewBox="0 0 64 72" aria-hidden="true" focusable="false"><defs><radialGradient id="' + id + 'b" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#ffc2cd"/><stop offset=".45" stop-color="#ff3d63"/><stop offset="1" stop-color="#8f0d30"/></radialGradient>' +
      '<clipPath id="' + id + 'c"><ellipse data-df-lid cx="32" cy="38" rx="11" ry="7.5"/></clipPath></defs>' +
      '<path d="M32 68 C15 58 5 43 7 30 C9 19 19 16 32 18 C45 16 55 19 57 30 C59 43 49 58 32 68 Z" fill="url(#' + id + 'b)"/><g fill="#ffe4a8">' + seeds + '</g>' +
      '<path d="M32 20 L23 10 L29 15 L32 5 L35 15 L41 10 Z M32 20 L17 17 L27 16 Z M32 20 L47 17 L37 16 Z" fill="#6fe39a"/><ellipse cx="32" cy="38" rx="11" ry="7.5" fill="#fbeee6"/>' +
      '<g clip-path="url(#' + id + 'c)"><g data-df-pupil><circle cx="32" cy="38" r="4.4" fill="#5ef2b8"/><circle cx="32" cy="38" r="2" fill="#07110f"/><circle cx="30.7" cy="36.6" r=".8" fill="#fff"/></g></g>' +
      '<ellipse data-df-lid cx="32" cy="38" rx="11" ry="7.5" fill="none" stroke="#2a0712" stroke-width="1.4"/><path d="M28 49 Q32 51.5 36 49" stroke="#2a0712" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>';
  }
  D.guardian = function (o) {
    o = o || {}; var host = o.host || doc.body, id = 'dfg' + (++gid), boxed = host !== doc.body;
    var btn = doc.createElement('button'); btn.type = 'button'; btn.className = 'df-guardian' + (boxed ? ' df-guardian--boxed' : '');
    btn.setAttribute('aria-label', o.label || 'The guardian. Press to hear it; drag and throw it at something.');
    btn.innerHTML = typeof o.svg === 'function' ? o.svg(id) : (o.svg || strawberry(id));
    var bub = doc.createElement('p'); bub.className = 'df-guardian__say is-off'; bub.setAttribute('role', 'status'); bub.setAttribute('aria-live', 'polite');
    host.appendChild(btn); host.appendChild(bub);
    var pupil = $('[data-df-pupil]', btn), lids = $$('[data-df-lid]', btn), lines = o.lines || [], li = 0, sayT = 0, raf = 0, t = 0, last = performance.now();
    var p = { x: -1, y: -1, vx: 0, vy: 0, mode: 'follow', held: null, wink: 3 + Math.random() * 3, landT: 0, spin: 0 }, ptr = { x: 0, y: 0, on: false };
    function box() { return boxed ? host.getBoundingClientRect() : { left: 0, top: 0, width: w.innerWidth, height: w.innerHeight }; }
    function local(e) { var b = box(); return [e.clientX - b.left, e.clientY - b.top]; }
    function say(text, msec) {
      bub.textContent = text; bub.classList.remove('is-off'); clearTimeout(sayT);
      sayT = setTimeout(function () { bub.classList.add('is-off'); }, msec || Math.max(2600, 60 * text.length)); emit('guardian', { say: text });
    }
    function place(x, y) { p.x = x; p.y = y; }
    function land() {
      p.mode = 'follow'; var r = o.onLand ? o.onLand(p.x, p.y) : null;
      if (typeof r === 'string') say(r); else if (r === false || r == null) { if (o.miss) say(o.miss); }
      emit('guardian', { landed: { x: p.x, y: p.y } });
    }
    function frame(now) {
      raf = requestAnimationFrame(frame); var dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
      var b = box(), W = b.width, H = b.height;
      if (p.x < 0) { var h0 = o.home || [.86, .7]; p.x = W * h0[0]; p.y = H * h0[1]; }
      if (p.mode === 'follow') {
        var tg = o.follow ? o.follow(ptr) : (ptr.on ? { x: ptr.x + 46, y: ptr.y - 30 } : null);
        if (tg) { var k = RM.matches ? 1 : .06; p.x = mix(p.x, clamp(tg.x, 30, W - 30), k); p.y = mix(p.y, clamp(tg.y, 34, H - 34), k); }
      } else if (p.mode === 'fly') {
        var fr = Math.exp(-3 * dt); p.vx *= fr; p.vy *= fr; p.x += p.vx * dt; p.y += p.vy * dt; p.spin += dt * p.vx * .9;
        if (p.x < 30) { p.x = 30; p.vx = Math.abs(p.vx) * .6; } if (p.x > W - 30) { p.x = W - 30; p.vx = -Math.abs(p.vx) * .6; }
        if (p.y < 34) { p.y = 34; p.vy = Math.abs(p.vy) * .6; } if (p.y > H - 34) { p.y = H - 34; p.vy = -Math.abs(p.vy) * .6; }
        if (Math.hypot(p.vx, p.vy) < 70 || t - p.landT > 1.4) land();
      }
      var fly = p.mode === 'fly', air = fly ? Math.min(1, Math.hypot(p.vx, p.vy) / 900) : 0;
      var hop = fly ? -Math.sin(Math.PI * Math.min(1, (t - p.landT) / 1.0)) * 46 : (p.mode === 'follow' && !RM.matches ? Math.sin(t * 3) * 2 : 0);
      btn.style.transform = 'translate(' + (p.x - 29).toFixed(1) + 'px,' + (p.y - 33 + hop).toFixed(1) + 'px) rotate(' + (fly ? p.spin : 0).toFixed(1) + 'deg) scale(' + (1 + .3 * air).toFixed(3) + ')';
      if (pupil) { var ex = ptr.on ? clamp((ptr.x - p.x) / 60, -1, 1) * 4.5 : 0, ey = ptr.on ? clamp((ptr.y - p.y) / 60, -1, 1) * 2.4 : 0; pupil.setAttribute('transform', 'translate(' + ex.toFixed(2) + ' ' + ey.toFixed(2) + ')'); }
      p.wink -= dt; var ry = 7.5;
      if (p.wink < 0 && !RM.matches) { var a = -p.wink; ry = a < .09 ? 7.5 - 7 * a / .09 : a < .2 ? .5 + 7 * (a - .09) / .11 : 7.5; if (a > .2) p.wink = 4 + Math.random() * 5; }
      lids.forEach(function (l) { l.setAttribute('ry', ry.toFixed(2)); });
      var bw = bub.offsetWidth || 200, bh = bub.offsetHeight || 40;
      bub.style.transform = 'translate(' + clamp(p.x - bw / 2, 8, W - bw - 8).toFixed(0) + 'px,' + Math.max(8, p.y - 60 - bh).toFixed(0) + 'px)';
      if (doc.hidden) { cancelAnimationFrame(raf); raf = 0; }
    }
    function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    var onMove = function (e) { var l = local(e); ptr.x = l[0]; ptr.y = l[1]; ptr.on = true; };
    (boxed ? host : w).addEventListener('pointermove', onMove, { passive: true });
    doc.addEventListener('visibilitychange', wake);
    btn.addEventListener('pointerdown', function (e) {
      e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch (er) {}
      var l = local(e); p.held = { x0: e.clientX, y0: e.clientY, ox: p.x - l[0], oy: p.y - l[1], hist: [[e.clientX, e.clientY, performance.now()]], moved: false };
      btn.classList.add('is-held'); p.mode = 'held';
    });
    btn.addEventListener('pointermove', function (e) {
      if (!p.held) return; var h = p.held, l = local(e);
      if (Math.hypot(e.clientX - h.x0, e.clientY - h.y0) > 6) h.moved = true;
      p.x = l[0] + h.ox; p.y = l[1] + h.oy; h.hist.push([e.clientX, e.clientY, performance.now()]); if (h.hist.length > 6) h.hist.shift();
    });
    function up() {
      if (!p.held) return; var h = p.held; p.held = null; btn.classList.remove('is-held');
      if (!h.moved) { p.mode = 'follow'; if (o.onPress) o.onPress(); if (lines.length) say(lines[li++ % lines.length]); return; }
      var a = h.hist[0], b = h.hist[h.hist.length - 1], dt = Math.max(16, b[2] - a[2]) / 1000, bx = box();
      p.vx = (b[0] - a[0]) / dt; p.vy = (b[1] - a[1]) / dt;
      var sp = Math.hypot(p.vx, p.vy), cap = Math.min(bx.width, bx.height) * 1.6; if (sp > cap) { p.vx *= cap / sp; p.vy *= cap / sp; }
      if (sp > 380 && !RM.matches) { p.mode = 'fly'; p.landT = t; p.spin = 0; } else land();
    }
    btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up);
    btn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (o.onPress) o.onPress(); if (lines.length) say(lines[li++ % lines.length]); } });
    wake(); if (o.hello) setTimeout(function () { say(o.hello); }, RM.matches ? 300 : 1400);
    return {
      el: btn, say: say, place: place, get x() { return p.x; }, get y() { return p.y; }, get mode() { return p.mode; },
      wink: function () { p.wink = 0; }, destroy: function () { cancelAnimationFrame(raf); btn.remove(); bub.remove(); (boxed ? host : w).removeEventListener('pointermove', onMove); }
    };
  };

  /* ---------- cloth: a woven thing to pull and pluck; hung on a loom, or laid down as land ---------- */
  D.cloth = function (canvas, o) {
    if (!canvas || !canvas.getContext || canvas.__dfCloth) return canvas && canvas.__dfCloth; o = o || {};
    var g = canvas.getContext('2d'), host = canvas.parentElement || doc.body;
    var TH = (o.threads || []).slice(0, 40).map(function (t, k) { return { k: k, c: rgb(t.color, '#f2c98a'), data: t }; });
    var NX = o.cols || Math.max(17, 2 * TH.length + 1), NY = o.rows || 26, N = NX * NY, DIST = 3.4, PITCH = num('depth-cloth-pitch', .64);
    TH = TH.slice(0, (NX - 1) / 2 | 0);
    var BA = ((o.bands && o.bands.length) ? o.bands : [{ name: '', color: token('accent') || '#5ef2b8' }]).map(function (b) { return { c: rgb(b.color, '#5ef2b8'), data: b }; });
    var P = new Float32Array(N * 3), Q = new Float32Array(N * 3), R0 = new Float32Array(N * 3), R1 = new Float32Array(N * 3), S = new Float32Array(N * 3), K0 = new Float32Array(N), K1 = new Float32Array(N), LINKS = [], i, j;
    for (i = 0; i < NY; i++) for (j = 0; j < NX; j++) { var q0 = i * NX + j; if (j < NX - 1) LINKS.push(q0, q0 + 1); if (i < NY - 1) LINKS.push(q0, q0 + NX); }
    var L0 = new Float32Array(LINKS.length / 2), L1 = new Float32Array(LINKS.length / 2), LT = {}, LP = {}, WX = readWeather();
    var C = { void: rgb(token('void'), '#0d0b1c'), muted: rgb(token('ink-muted'), '#bdb3cc'), ink: rgb(token('ink'), '#f3ece0'), acc: rgb(token('accent'), '#f2c98a'), wood: [90, 69, 50] };
    var st = { W: 0, H: 0, tall: null, t: 0, mix: o.view === 'lay' ? 1 : 0, from: 0, to: 0, t0: -1, cx: 0, cy: 0, F: 1, cos: 1, sin: 0, hc: -1, hb: -1,
      ptr: { x: -1e3, y: -1e3, on: false }, drag: null, plucks: [], parts: [], wx: clamp(o.weather || 0, 0, 3), wxFrom: clamp(o.weather || 0, 0, 3), wxMix: 1, raf: 0, last: 0, acc: 0, hold: null, holdT: 0, pulse: 0, intro: o.intro !== false && !RM.matches };
    st.from = st.to = st.mix;
    var colOf = function (k) { return 2 * k + 1; }, bandOf = function (r) { return Math.min(BA.length - 1, Math.floor((r - 1) / ((NY - 2) / BA.length))); };
    function height(u, v) { var e = Math.pow(Math.sin(Math.PI * u), .7) * Math.pow(Math.sin(Math.PI * v), .7); return e * (.12 * Math.sin(u * 6.2 + v * 1.7) + .08 * Math.sin(v * 8.3 - u * 2.9 + 1) + .05 * Math.sin(u * 13.1 + v * 6.7) + .05); }
    function rest(tall, first) {
      if (tall === st.tall) return; st.tall = tall;
      var tw = tall ? 1.3 : 2.2, th = tall ? 2.1 : 1.36, pw = tall ? 1.8 : 2.7, pd = tall ? 2.7 : 1.9;
      for (var a = 0; a < NY; a++) for (var b = 0; b < NX; b++) {
        var k = a * NX + b, u = b / (NX - 1), v = a / (NY - 1), r = k * 3;
        R0[r] = (u - .5) * tw; R0[r + 1] = (.5 - v) * th; R0[r + 2] = 0;
        R1[r] = (u - .5) * pw; R1[r + 1] = -.3 + height(u, v) * 1.7; R1[r + 2] = (v - .5) * pd;
        K0[k] = (a === 0 || a === NY - 1) ? .6 : .035; K1[k] = (a === 0 || a === NY - 1 || b === 0 || b === NX - 1) ? .6 : .05;
        if (first) { var R = st.mix ? R1 : R0; P[r] = Q[r] = R[r]; P[r + 1] = Q[r + 1] = R[r + 1]; P[r + 2] = Q[r + 2] = R[r + 2]; }
      }
      for (var m = 0; m < L0.length; m++) { var x = LINKS[2 * m] * 3, y = LINKS[2 * m + 1] * 3; L0[m] = Math.hypot(R0[y] - R0[x], R0[y + 1] - R0[x + 1], R0[y + 2] - R0[x + 2]); L1[m] = Math.hypot(R1[y] - R1[x], R1[y + 1] - R1[x + 1], R1[y + 2] - R1[x + 2]); }
    }
    function fit(R, pitch, bx, out) {
      var c = Math.cos(pitch), s = Math.sin(pitch), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (var k = 0; k < N; k++) { var r = k * 3, y = R[r + 1], z = R[r + 2], wd = DIST - (y * s + z * c), px = R[r] / wd, py = -(y * c - z * s) / wd; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
      out.F = Math.min(bx.w / (x1 - x0), bx.h / (y1 - y0)); out.cx = bx.x + bx.w / 2 - out.F * (x0 + x1) / 2; out.cy = bx.y + bx.h / 2 - out.F * (y0 + y1) / 2;
    }
    function layout() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(2, w.devicePixelRatio || 1); st.W = r.width; st.H = r.height;
      if (!st.W || !st.H) return; canvas.width = Math.round(st.W * dpr); canvas.height = Math.round(st.H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var tall = st.H > st.W * 1.15; rest(tall, st.tall === null);
      var fr = o.frame || function (view, W, H, t) { return view === 'hang' ? { x: W * .05, y: H * .1, w: W * .9, h: H * .8 } : t ? { x: -W * .4, y: H * .3, w: W * 1.8, h: H * .72 } : { x: -W * .04, y: H * .36, w: W * 1.08, h: H * .66 }; };
      fit(R0, 0, fr('hang', st.W, st.H, tall), LT); fit(R1, PITCH, fr('lay', st.W, st.H, tall), LP); kick();
    }
    function applyDrag() {
      var d = st.drag; if (!d) return;
      var dx = st.ptr.x - d.x0, dy = st.ptr.y - d.y0, ax = dx * d.w / st.F * .8, ay = -dy * d.w / st.F * .8, az = Math.min(.6, Math.hypot(ax, ay) * .7);
      var wx = ax, wy = ay * st.cos + az * st.sin, wz = -ay * st.sin + az * st.cos;
      d.region.forEach(function (q) { var r = q.k * 3; P[r] = mix(P[r], q.x + wx * q.w, q.w); P[r + 1] = mix(P[r + 1], q.y + wy * q.w, q.w); P[r + 2] = mix(P[r + 2], q.z + wz * q.w, q.w); if (q.w === 1) { Q[r] = P[r]; Q[r + 1] = P[r + 1]; Q[r + 2] = P[r + 2]; } });
    }
    function physics() {
      var m = st.mix, wind = RM.matches ? 0 : (1 - m) * .0005;
      for (var k = 0; k < N; k++) {
        var r = k * 3, ka = mix(K0[k], K1[k], m);
        for (var a = 0; a < 3; a++) { var pp = P[r + a], v = (pp - Q[r + a]) * .92; Q[r + a] = pp; P[r + a] = pp + v + (mix(R0[r + a], R1[r + a], m) - pp) * ka; }
        if (wind) P[r + 2] += wind * Math.sin(st.t * 1.3 + (k % NX) * .21 + ((k / NX) | 0) * .11);
      }
      applyDrag();
      for (var it = 0; it < 3; it++) {
        for (var n = 0; n < L0.length; n++) {
          var x = LINKS[2 * n] * 3, y = LINKS[2 * n + 1] * 3, L = mix(L0[n], L1[n], m), dx = P[y] - P[x], dy = P[y + 1] - P[x + 1], dz = P[y + 2] - P[x + 2], dd = Math.hypot(dx, dy, dz) || 1e-6, f = (dd - L) / dd * .5;
          P[x] += dx * f; P[x + 1] += dy * f; P[x + 2] += dz * f; P[y] -= dx * f; P[y + 1] -= dy * f; P[y + 2] -= dz * f;
        }
        applyDrag();
      }
    }
    function project() { for (var k = 0; k < N; k++) { var r = k * 3, y = P[r + 1], z = P[r + 2], y1 = y * st.cos - z * st.sin, wd = DIST - (y * st.sin + z * st.cos); S[r] = st.cx + st.F * P[r] / wd; S[r + 1] = st.cy - st.F * y1 / wd; S[r + 2] = wd; } }
    function impulse(x, y, rad, mag) { for (var k = 0; k < N; k++) { var d = Math.hypot(S[k * 3] - x, S[k * 3 + 1] - y); if (d > rad) continue; var f = Math.cos(d / rad * Math.PI / 2) * mag; P[k * 3 + 2] -= f * (1 - st.mix); P[k * 3 + 1] -= f * st.mix * .8; } kick(); }
    var sx = function (a, b) { return S[(a * NX + b) * 3]; }, sy = function (a, b) { return S[(a * NX + b) * 3 + 1]; };
    function warp() { return st.intro ? clamp((st.t - .15) / .55, 0, 1) : 1; }
    function row(r) { return st.intro ? clamp((st.t - .7 - (r - 1) * (1.9 / NY)) / .42, 0, 1) : 1; }
    function pluckOff(col, r) { var off = 0; st.plucks.forEach(function (p) { if (p.j !== col) return; var a = st.t - p.t0; if (a < 1.6) off += 8 * Math.sin(Math.PI * r / (NY - 1)) * Math.sin(a * 62) * Math.exp(-a * 2.6); }); return RM.matches ? 0 : off; }
    function line(pts, col, width) { g.strokeStyle = col; g.lineWidth = width; g.beginPath(); for (var n = 0; n < pts.length; n += 2) n ? g.lineTo(pts[n], pts[n + 1]) : g.moveTo(pts[n], pts[n + 1]); g.stroke(); }
    function wxc(key, idx) { var a = WX[st.wxFrom], b = WX[st.wx], k = st.wxMix; return idx == null ? mixc(a[key], b[key], k) : mixc(a[key][idx], b[key][idx], k); }
    function drawSky() {
      var m = st.mix, W = st.W, H = st.H; g.fillStyle = css(C.void); g.fillRect(0, 0, W, H); if (m <= 0) return;
      var top = wxc('sky', 0), low = wxc('sky', 1), sun = wxc('sun'), hy = 0, n = 0, b;
      var sk = g.createLinearGradient(0, 0, 0, H * .8); sk.addColorStop(0, css(top, m)); sk.addColorStop(1, css(low, m)); g.fillStyle = sk; g.fillRect(0, 0, W, H);
      for (b = 0; b < NX; b += 4) { hy += S[b * 3 + 1]; n++; } hy /= n;
      var night = (st.wx === 3 ? st.wxMix : 0) + (st.wxFrom === 3 ? 1 - st.wxMix : 0);
      if (night > 0) for (b = 0; b < 70; b++) { g.fillStyle = 'rgba(230,240,255,' + ((.35 + .35 * Math.sin(st.t * .8 + b)) * night * m).toFixed(3) + ')'; g.fillRect((b * 97.3 % 100) / 100 * W, (b * 53.7 % 55) / 100 * H, 1.6, 1.6); }
      var tall = st.tall, sx0 = W * (tall ? .74 : .7), sy0 = hy - H * (tall ? .1 : [.17, .1, .2, .24][st.wx]), sr = Math.min(W, H) * (tall ? .08 : .055);
      var sg = g.createRadialGradient(sx0, sy0, 0, sx0, sy0, sr * 7); sg.addColorStop(0, css(sun, .5 * m)); sg.addColorStop(1, css(sun, 0)); g.fillStyle = sg; g.fillRect(0, 0, W, H);
      g.fillStyle = css(sun, .95 * m); g.beginPath(); g.arc(sx0, sy0, sr, 0, 6.283); g.fill();
      var par = st.ptr.on ? st.ptr.x / W - .5 : 0;
      for (b = 0; b < 3; b++) {
        var col = mixc(wxc('ridge', 2 - b), low, [.5, .28, .1][b]), amp = H * (tall ? [.085, .06, .035] : [.15, .1, .055])[b], off = par * (8 + b * 14);
        g.fillStyle = css(col, m); g.beginPath(); g.moveTo(-20, hy + 4);
        for (var x = -20; x <= W + 20; x += 10) { var q = (x + off) / W; g.lineTo(x, hy - amp * (.55 + .3 * Math.sin(q * (5 + b * 2.3) + b * 1.9) + .15 * Math.sin(q * (17 + b * 5) + b))); }
        g.lineTo(W + 20, hy + 4); g.closePath(); g.fill();
      }
    }
    function drawLand() {
      var m = st.mix; if (m <= .02) return;
      var rim = wxc('rim'), low = wxc('sky', 1), back = mixc(wxc('ridge', 2), low, .22), front = wxc('ridge', 0), gm = mix([1, .85, .8, .4][st.wxFrom], [1, .85, .8, .4][st.wx], st.wxMix);
      for (var a = 0; a < NY - 1; a++) {
        var base = mixc(back, front, Math.pow(a / (NY - 2), .8));
        for (var b = 0; b < NX - 1; b++) {
          var A = (a * NX + b) * 3, B = A + 3, Cc = A + NX * 3, Dd = Cc + 3;
          var ux = P[B] - P[A], uy = P[B + 1] - P[A + 1], uz = P[B + 2] - P[A + 2], vx = P[Cc] - P[A], vy = P[Cc + 1] - P[A + 1], vz = P[Cc + 2] - P[A + 2];
          var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, nl = Math.hypot(nx, ny, nz) || 1; if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
          var lit = (nx * .45 + ny * .62 - nz * .64) / nl, col = mixc(mixc(base, rim, clamp((lit - .3) * 1.5, 0, .62) * gm), [6, 4, 10], clamp((.36 - lit) * 1.4, 0, .45));
          g.fillStyle = g.strokeStyle = css(col, m); g.lineWidth = .6; g.beginPath(); g.moveTo(S[A], S[A + 1]); g.lineTo(S[B], S[B + 1]); g.lineTo(S[Dd], S[Dd + 1]); g.lineTo(S[Cc], S[Cc + 1]); g.closePath(); g.fill(); g.stroke();
        }
      }
    }
    function drawWeave() {
      var m = st.mix, tm = 1 - m, rim = wxc('rim'), wn = Math.max(2, Math.ceil(warp() * (NY - 1)) + 1), a, b, pts;
      if (tm > .02) {
        [0, NY - 1].forEach(function (r) { pts = []; for (b = 0; b < NX; b++) pts.push(sx(r, b), sy(r, b)); g.lineCap = 'round'; line(pts, css(C.wood, tm), 7); line(pts, css(C.acc, .35 * tm), 1.2); });
        g.font = '500 10px ' + (token('font-mono') || 'monospace'); g.textAlign = 'center';
        TH.forEach(function (th) { var col = colOf(th.k), x = sx(0, col), y = sy(0, col), hot = st.hc === col; g.fillStyle = css(th.c, tm); g.beginPath(); g.arc(x, y, 3, 0, 6.283); g.fill(); g.fillStyle = css(hot ? th.c : C.muted, (hot ? 1 : .6) * tm); g.fillText(pad(th.k + 1, 2), x, y - 12); });
      }
      var shuttles = [];
      for (a = 1; a < NY - 1; a++) {
        var rv = row(a); if (rv <= 0) continue;
        var bd = BA[bandOf(a)], hot = st.hb === bandOf(a), n = Math.max(2, Math.ceil(rv * (NX - 1)) + 1), ltr = a % 2; pts = [];
        for (b = 0; b < n; b++) { var col2 = ltr ? b : NX - 1 - b; pts.push(sx(a, col2), sy(a, col2)); }
        line(pts, css(mixc(bd.c, rim, m), (hot ? .95 : .5) * tm + .16 * m), (hot ? 2.2 : 1.7) * tm + .7 * m);
        if (rv < 1) shuttles.push([pts[pts.length - 2], pts[pts.length - 1], ltr ? 1 : -1, bd.c]);
      }
      for (b = 0; b < NX; b += 2) { pts = []; for (a = 0; a < wn; a++) pts.push(sx(a, b), sy(a, b)); line(pts, css(mixc(C.muted, rim, m), .2 * tm + .1 * m), .8); }
      TH.forEach(function (th) {
        var col = colOf(th.k), hot = st.hc === col; pts = [];
        for (a = 0; a < wn; a++) pts.push(sx(a, col) + pluckOff(col, a), sy(a, col));
        if (hot) { g.save(); g.shadowColor = css(th.c, .9); g.shadowBlur = 14; line(pts, css(th.c), 3.4); g.restore(); } else line(pts, css(th.c, .88 * tm + .62 * m), 2.1);
      });
      if (tm > .05) {
        g.lineCap = 'butt';
        TH.forEach(function (th) {
          var col = colOf(th.k);
          for (a = 1; a < NY - 1; a++) {
            if ((a + th.k) % 2) continue; var rv = row(a); if (rv < 1 && (a % 2 ? col / (NX - 1) > rv : 1 - col / (NX - 1) > rv)) continue;
            var bd = BA[bandOf(a)], cx = sx(a, col) + pluckOff(col, a), cy = sy(a, col), dx = sx(a, col + 1) - sx(a, col - 1), dy = sy(a, col + 1) - sy(a, col - 1), dl = Math.hypot(dx, dy) || 1; dx = dx / dl * 5.5; dy = dy / dl * 5.5;
            g.strokeStyle = 'rgba(5,3,14,' + (.55 * tm) + ')'; g.lineWidth = 4.2; g.beginPath(); g.moveTo(cx - dx * 1.15, cy - dy * 1.15); g.lineTo(cx + dx * 1.15, cy + dy * 1.15); g.stroke();
            g.strokeStyle = css(bd.c, (st.hb === bandOf(a) ? 1 : .9) * tm); g.lineWidth = 2.4; g.beginPath(); g.moveTo(cx - dx, cy - dy); g.lineTo(cx + dx, cy + dy); g.stroke();
          }
        });
        g.lineCap = 'round';
        shuttles.forEach(function (s) { g.save(); g.translate(s[0], s[1]); g.scale(s[2], 1); g.fillStyle = css(C.acc, tm); g.strokeStyle = 'rgba(20,12,6,.8)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(14, 0); g.quadraticCurveTo(4, -5.5, -12, -3); g.lineTo(-12, 3); g.quadraticCurveTo(4, 5.5, 14, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = css(s[3], tm); g.fillRect(-5, -1.6, 8, 3.2); g.restore(); });
      }
      if (m > .05) TH.forEach(function (th) {
        var col = colOf(th.k), r = Math.min(NY - 3, 7 + ((th.k * 7) % 5) * 3), x = sx(r, col), y = sy(r, col), s2 = DIST / S[(r * NX + col) * 3 + 2] * (st.tall ? .8 : 1), hot = st.hc === col, fl = (hot ? 1.5 : 1) * s2, wave = RM.matches ? 0 : Math.sin(st.t * 3 + th.k) * 2 * s2;
        g.fillStyle = 'rgba(0,0,0,' + (.25 * m) + ')'; g.beginPath(); g.ellipse(x, y, 5 * s2, 1.8 * s2, 0, 0, 6.283); g.fill();
        g.strokeStyle = css(C.ink, .85 * m); g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 30 * s2); g.stroke();
        if (hot) { g.save(); g.shadowColor = css(th.c, .9); g.shadowBlur = 12; }
        g.fillStyle = css(th.c, m); g.beginPath(); g.moveTo(x, y - 30 * s2); g.quadraticCurveTo(x + 9 * fl, y - 30 * s2 + wave, x + 17 * fl, y - 26 * s2 + wave); g.lineTo(x, y - 20 * s2); g.closePath(); g.fill();
        if (hot) g.restore();
      });
    }
    function drawParts(dt) {
      var m = st.mix; if (m <= .02) return;
      var kind = WEATHER[st.wx].id, rim = WX[st.wx].rim, W = st.W, H = st.H, want = RM.matches ? 24 : (kind === 'rain' ? 140 : 80);
      while (st.parts.length < want) st.parts.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random(), r: Math.random() * 6.28 });
      if (st.parts.length > want) st.parts.length = want;
      st.parts.forEach(function (p) {
        if (!RM.matches) {
          if (kind === 'peach') { p.y += (24 + p.s * 30) * dt; p.x += Math.sin(st.t + p.r) * 18 * dt; p.r += dt * (1 + p.s); }
          else if (kind === 'rain') { p.y += (520 + p.s * 300) * dt; p.x -= 60 * dt; }
          else if (kind === 'mint') { p.y -= (8 + p.s * 10) * dt; p.x += Math.sin(st.t * .5 + p.r) * 6 * dt; }
          else { p.x += Math.sin(st.t * .7 + p.r) * 14 * dt; p.y += Math.cos(st.t * .6 + p.r) * 10 * dt; }
          if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; } if (p.y < -12) p.y = H + 8; if (p.x < -12) p.x = W + 8; if (p.x > W + 12) p.x = -8;
        }
        if (kind === 'peach') { g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = 'rgba(255,192,160,' + (.8 * m) + ')'; g.beginPath(); g.ellipse(0, 0, 4.5, 2.2, 0, 0, 6.283); g.fill(); g.restore(); }
        else if (kind === 'rain') { g.strokeStyle = css(rim, .4 * m); g.lineWidth = 1; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - 4, p.y + 14); g.stroke(); }
        else if (kind === 'mint') { g.fillStyle = css(rim, (.25 + .3 * p.s) * m); g.beginPath(); g.arc(p.x, p.y, 1.2 + p.s, 0, 6.283); g.fill(); }
        else { g.fillStyle = 'rgba(230,255,170,' + ((.5 + .5 * Math.sin(st.t * 2 + p.r * 3)) * m).toFixed(3) + ')'; g.beginPath(); g.arc(p.x, p.y, 1.8, 0, 6.283); g.fill(); }
      });
    }
    function drawHold() {
      var h = st.hold; if (!h) return; var a = Math.min(1, (st.t - h.t0) / .6), r = 60 + 22 * Math.sin(st.t * 6.3), gr = g.createRadialGradient(h.x, h.y, 0, h.x, h.y, r * 2.2);
      gr.addColorStop(0, 'rgba(255,170,90,' + .5 * a + ')'); gr.addColorStop(.5, 'rgba(255,90,70,' + .18 * a + ')'); gr.addColorStop(1, 'rgba(255,90,70,0)'); g.fillStyle = gr; g.fillRect(h.x - r * 2.4, h.y - r * 2.4, r * 4.8, r * 4.8);
    }
    function segDist(px, py, x0, y0, x1, y1) { var dx = x1 - x0, dy = y1 - y0, l = dx * dx + dy * dy || 1, k = clamp(((px - x0) * dx + (py - y0) * dy) / l, 0, 1); return Math.hypot(px - x0 - dx * k, py - y0 - dy * k); }
    function threadAt(x, y, within) {
      var best = within == null ? 14 : within, bk = -1;
      TH.forEach(function (th) { var col = colOf(th.k); for (var a = 0; a < NY - 1; a++) { var d = segDist(x, y, sx(a, col), sy(a, col), sx(a + 1, col), sy(a + 1, col)); if (d < best) { best = d; bk = th.k; } } });
      return bk;
    }
    function bandAt(x, y) { if (st.mix > .5 || BA.length < 2) return -1; var best = 18, bi = -1; for (var a = 1; a < NY - 1; a++) for (var b = 0; b < NX - 1; b += 2) { var d = segDist(x, y, sx(a, b), sy(a, b), sx(a, b + 2), sy(a, b + 2)); if (d < best) { best = d; bi = a; } } return bi > 0 ? bandOf(bi) : -1; }
    /* the default tooltip names what is under the hand; pass tip: false and use onHover to draw your own */
    var tip = null;
    if (o.tip !== false) { tip = doc.createElement('div'); tip.className = 'df-cloth__tip'; tip.hidden = true; if (getComputedStyle(host).position === 'static') host.style.position = 'relative'; host.appendChild(tip); }
    function hover(x, y) {
      var k = threadAt(x, y), b = k < 0 ? bandAt(x, y) : -1; st.hc = k >= 0 ? colOf(k) : -1; st.hb = b;
      canvas.classList.toggle('is-over', k >= 0);
      var info = k >= 0 ? { kind: 'thread', item: TH[k].data, color: css(TH[k].c) } : b >= 0 ? { kind: 'band', item: BA[b].data, color: css(BA[b].c) } : null;
      if (o.onHover) o.onHover(info, x, y);
      if (tip) { if (!info || !(info.item.name)) tip.hidden = true; else { tip.hidden = false; tip.style.setProperty('--c', info.color); tip.textContent = (info.kind === 'band' ? 'weft · ' : '') + info.item.name; var tw = tip.offsetWidth / 2 + 8; tip.style.left = clamp(x, tw, st.W - tw) + 'px'; tip.style.top = y + 'px'; } }
    }
    function pluck(k, quiet) {
      var th = TH[k]; if (!th) return; var col = colOf(k); st.plucks.push({ j: col, t0: st.t }); if (st.plucks.length > 8) st.plucks.shift();
      for (var a = 1; a < NY - 1; a++) { var r = (a * NX + col) * 3, f = Math.sin(Math.PI * a / (NY - 1)) * .035; P[r + 2] += f * (1 - st.mix); P[r + 1] += f * st.mix; }
      D.tone.pluck(k); D.haptic(5); kick();
      if (!quiet) { if (o.onPluck) o.onPluck(th.data, k); emit('cloth', { canvas: canvas, type: 'pluck', thread: th.data, index: k }); }
    }
    function release(rejected) {
      var d = st.drag; if (!d) return null; st.drag = null; canvas.classList.remove('is-held'); clearTimeout(st.holdT);
      if (st.hold) { st.hold = null; clearInterval(st.pulse); if (o.onHold) o.onHold(false); }
      if (rejected) d.region.forEach(function (q) { Q[q.k * 3 + 2] = P[q.k * 3 + 2] + .02; });
      return d;
    }
    canvas.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect(); st.ptr.x = e.clientX - r.left; st.ptr.y = e.clientY - r.top; st.ptr.on = true;
      if (!st.drag) { hover(st.ptr.x, st.ptr.y); return; }
      var d = st.drag, dist = Math.hypot(st.ptr.x - d.x0, st.ptr.y - d.y0);
      if (dist > 10) { clearTimeout(st.holdT); d.moved = true; }
      if (dist > 30 && !d.pulled) { d.pulled = true; if (o.onPull) o.onPull(); emit('cloth', { canvas: canvas, type: 'pull' }); }
      if (dist > Math.min(st.W, st.H) * (o.rejectAt || .42)) { release(true); if (o.onReject) o.onReject(); emit('cloth', { canvas: canvas, type: 'reject' }); }
      kick();
    });
    canvas.addEventListener('pointerleave', function () { st.ptr.on = false; st.hc = st.hb = -1; if (tip) tip.hidden = true; if (o.onHover) o.onHover(null); kick(); });
    canvas.addEventListener('pointerdown', function (e) {
      var r = canvas.getBoundingClientRect(); st.ptr.x = e.clientX - r.left; st.ptr.y = e.clientY - r.top; st.ptr.on = true;
      var best = 1e9, bk = -1; for (var k = 0; k < N; k++) { var d = Math.hypot(S[k * 3] - st.ptr.x, S[k * 3 + 1] - st.ptr.y); if (d < best) { best = d; bk = k; } }
      if (best > 70) { impulse(st.ptr.x, st.ptr.y, 110, .04); if (o.onRipple) o.onRipple(st.ptr.x, st.ptr.y); return; }
      try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
      var bi = (bk / NX) | 0, bj = bk % NX, region = [];
      for (var a = Math.max(0, bi - 4); a <= Math.min(NY - 1, bi + 4); a++) for (var b = Math.max(0, bj - 4); b <= Math.min(NX - 1, bj + 4); b++) {
        var dd = Math.hypot(a - bi, b - bj); if (dd > 4.2) continue; var q = a * NX + b, rr = q * 3; region.push({ k: q, x: P[rr], y: P[rr + 1], z: P[rr + 2], w: dd === 0 ? 1 : Math.exp(-dd * dd / 5.1) * .96 });
      }
      st.drag = { x0: st.ptr.x, y0: st.ptr.y, w: S[bk * 3 + 2], region: region, t0: performance.now(), moved: false, pulled: false };
      canvas.classList.add('is-held'); if (tip) tip.hidden = true;
      clearTimeout(st.holdT);
      if (o.onHold) st.holdT = setTimeout(function () {
        if (!st.drag || st.drag.moved) return; var h = st.hold = { x: st.ptr.x, y: st.ptr.y, t0: st.t }; o.onHold(true, h.x, h.y);
        var beat = function () { if (!st.hold) return; impulse(h.x, h.y, 95, .03); D.tone.thump(); D.haptic(24); }; beat(); st.pulse = setInterval(beat, RM.matches ? 900 : 380);
      }, o.holdMs || 2000);
      kick();
    });
    var up = function () {
      var d = release(false); if (!d) return;
      if (!d.moved && performance.now() - d.t0 < 400) { var k = threadAt(st.ptr.x, st.ptr.y, 16); if (k >= 0) pluck(k); else { impulse(st.ptr.x, st.ptr.y, 110, .045); if (o.onRipple) o.onRipple(st.ptr.x, st.ptr.y); } }
    };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', function () { release(false); });
    function energy() { var e = 0; for (var k = 0; k < N * 3; k += 9) e += Math.abs(P[k] - Q[k]); return e; }
    function frame(now) {
      st.raf = 0; var dt = Math.min(.05, (now - (st.last || now)) / 1000); st.last = now; st.t += dt;
      if (st.t0 >= 0) { var k = clamp((st.t - st.t0) / 1.9, 0, 1); st.mix = mix(st.from, st.to, k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2); if (k >= 1) st.t0 = -1; }
      if (st.wxMix < 1) st.wxMix = Math.min(1, st.wxMix + dt / 1.6);
      st.cos = Math.cos(PITCH * st.mix); st.sin = Math.sin(PITCH * st.mix); st.cx = mix(LT.cx, LP.cx, st.mix); st.cy = mix(LT.cy, LP.cy, st.mix); st.F = mix(LT.F, LP.F, st.mix);
      st.acc += dt; var steps = 0; while (st.acc > 1 / 60 && steps < 3) { physics(); st.acc -= 1 / 60; steps++; } if (steps === 3) st.acc = 0;
      project(); drawSky(); drawLand(); drawWeave(); drawHold(); drawParts(dt); if (o.onFrame) o.onFrame(g, api);
      var busy = !RM.matches || st.drag || st.hold || st.t0 >= 0 || st.wxMix < 1 || energy() > 1e-4 || st.t < 2;
      if (busy && !doc.hidden) st.raf = requestAnimationFrame(frame);
    }
    function kick() { if (!st.raf && !doc.hidden) { st.last = performance.now(); st.raf = requestAnimationFrame(frame); } }
    doc.addEventListener('visibilitychange', kick);
    var ro = w.ResizeObserver ? new ResizeObserver(layout) : null; if (ro) ro.observe(canvas); else w.addEventListener('resize', layout);
    var api = {
      canvas: canvas, threads: TH.map(function (t) { return t.data; }),
      get view() { return st.to ? 'lay' : 'hang'; },
      setView: function (v) {
        var to = v === 'lay' ? 1 : 0; if (to === st.to) return; st.from = st.mix; st.to = to;
        if (RM.matches) { st.mix = to; var R = to ? R1 : R0; P.set(R); Q.set(R); st.t0 = -1; } else st.t0 = st.t;
        emit('cloth', { canvas: canvas, type: 'view', view: v }); kick();
      },
      setWeather: function (n) { st.wxFrom = st.wx; st.wx = ((n % 4) + 4) % 4; st.wxMix = RM.matches ? 1 : 0; emit('cloth', { canvas: canvas, type: 'weather', weather: WEATHER[st.wx].id, name: WEATHER[st.wx].name }); kick(); return WEATHER[st.wx]; },
      get weather() { return st.wx; },
      pluck: function (k) { pluck(k, true); }, ripple: function (x, y, m) { impulse(x, y, 110, m || .045); },
      threadAt: threadAt, screen: function (r, c) { return [sx(r, c), sy(r, c)]; }, columnOf: colOf, rows: NY,
      redraw: kick, layout: layout,
      destroy: function () { cancelAnimationFrame(st.raf); if (ro) ro.disconnect(); if (tip) tip.remove(); canvas.__dfCloth = null; }
    };
    canvas.__dfCloth = api; canvas.classList.add('df-cloth'); layout(); return api;
  };
  /* a cloth reads its threads and bands from lists (itemsFrom, below): the list is also its no-JS and screen-reader route */

  /* ---------- taste: lint a page against the tells that make it read as generated ---------- */
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function words(el) { var t = el.innerText; return (t == null ? el.textContent || '' : t).replace(/\s+/g, ' ').trim(); }
  D.taste = function (o) {
    o = o || {}; var scope = o.scope || doc.body, out = [], vh = w.innerHeight, vw = w.innerWidth;
    var text = words(scope).replace(/\s+/g, ' ');
    var add = function (rule, sev, n, sample, fix) { out.push({ rule: rule, severity: sev, count: n, sample: String(sample || '').slice(0, 90), fix: fix }); };
    var cs = function (el) { return getComputedStyle(el); };
    var heads = $$('h1, h2, h3, .df-h-xl, .df-h-l, .df-h-stretch', scope);
    var xl = $$('h1, .df-h-xl, .df-h-stretch', scope).filter(vis); if (xl.length > 1) add('one-display-xl', 'warn', xl.length, words(xl[1]), 'One display-xl per page. Make the others display-l or display-m.');
    var twin = heads.filter(function (h) { return h.tagName !== 'H3' && $$('em, i', h).length > 1; }); if (twin.length) add('two-emphases', 'info', twin.length, words(twin[0]), 'One emphasized word per display line. Two means the line is two lines.');
    var second = heads.filter(function (h) { var br = $('br', h), em = $('em, i', h); return br && em && (br.compareDocumentPosition(em) & 4) && words(em).split(' ').length > 1; });
    if (second.length > 1) add('italic-second-line', 'warn', second.length, words(second[0]), 'A whole italic second line, again and again, is a template habit. Emphasize one word, or say it straight.');
    var leave = text.match(/\b(experience|journey|immersive|seamless|delve|simply|unleash|elevate)\b/gi) || [];
    if (leave.length) add('words-to-leave-out', 'warn', leave.length, leave.slice(0, 5).join(', '), 'Writing: leave these out of a page\'s own copy. Say what happens instead.');
    var bang = $$('h1,h2,h3,button,a,.df-btn,.df-hint', scope).filter(function (el) { return /!/.test(words(el)); });
    if (bang.length) add('exclamation', 'warn', bang.length, words(bang[0]), 'No exclamation marks in a page\'s own voice.');
    try { var emo = text.match(/\p{Emoji_Presentation}/gu) || []; if (emo.length) add('emoji', 'warn', emo.length, emo.slice(0, 6).join(' '), 'No emoji. Use an icon from the set, or a word.'); } catch (e) {}
    var dim = text.match(/\b(a little|a small|a hint of|little world|softly)\b/gi) || [];
    if (dim.length > 3) add('diminutive-tic', 'info', dim.length, dim.slice(0, 4).join(' · '), 'Say a size once. "A little" and "a hint of" are padding unless they measure something.');
    var becomes = text.match(/\b[\w']+ becomes (a|an|the) [\w']+/gi) || [];
    if (becomes.length > 1) add('becomes-slogan', 'warn', becomes.length, becomes[0], '"X becomes a Y" is a slogan shape. Use a line the owner actually said.');
    var eyebrows = $$('p, span, small, div, dt, legend, summary', scope).filter(function (el) {
      if (el.children.length > 1 || !vis(el)) return false; var s = cs(el), fs = parseFloat(s.fontSize), ls = parseFloat(s.letterSpacing) || 0;
      return fs <= 12.5 && s.textTransform === 'uppercase' && ls >= fs * .08 && words(el).length > 3;
    });
    var chapters = Math.max(1, $$('[data-df-chapter], h2', scope).length);
    if (eyebrows.length > chapters * 2 + 2) add('eyebrow-flood', 'warn', eyebrows.length, words(eyebrows[0]), 'Eyebrows number chapters: ' + eyebrows.length + ' of them for ' + chapters + (chapters === 1 ? ' chapter' : ' chapters') + ' is decoration. Keep one per chapter.');
    var tiles = 0, tileSample = '';
    $$('*', scope).forEach(function (p) {
      if (p.children.length < 4) return; var seen = {};
      var links = {}; Array.prototype.forEach.call(p.children, function (c) { if (c.children.length < 1) return; var el = c.lastElementChild || c, tail = words(el), a = el.closest('a[href]') || (c.matches('a[href]') ? c : null); if (a) links[a.getAttribute('href')] = 1; if (tail && tail.length < 24 && /[a-z]{2}/i.test(tail)) seen[tail] = (seen[tail] || 0) + 1; });
      if (Object.keys(links).length >= 4) return;
      Object.keys(seen).forEach(function (k) { if (seen[k] >= 4) { tiles++; tileSample = k + ' ×' + seen[k]; } });
    });
    if (tiles) add('identical-tiles', 'warn', tiles, tileSample, 'Rows of identical tiles read as a generated grid. Put the choices where they live (on the art, the body, the map) and let each one look like what it is.');
    var groups = $$('[role="tablist"], [role="radiogroup"], [role="group"], .df-segmented', scope).filter(function (gp) { return $$('[aria-pressed], [aria-selected], [role="radio"]', gp).length > 1; });
    if (groups.length > 3) add('mode-stack', 'warn', groups.length, groups.map(function (gp) { return gp.getAttribute('aria-label') || ''; }).filter(Boolean).slice(0, 4).join(' · '), groups.length + ' mode switches make a dashboard. Fold modes into what happens in the scene; keep two at most.');
    var asides = $$('aside', scope).filter(function (a) { return $$('input[type="range"], fieldset, [role="group"], [aria-pressed]', a).length >= 6; });
    if (asides.length) add('settings-sidebar', 'info', asides.length, words($('h2, h3, label, legend', asides[0]) || asides[0]).slice(0, 40), 'A sidebar of settings beside the picture is a control panel. Put the one control that matters on the scene; put the rest in a sheet.');
    var counts = {}; $$('button, a', scope).forEach(function (b) { var t = words(b); if (t && t.length < 20) counts[t] = (counts[t] || 0) + 1; });
    var dup = Object.keys(counts).filter(function (k) { return counts[k] >= 3; }); if (dup.length >= 4) add('duplicate-inventory', 'info', dup.length, dup.slice(0, 4).join(', '), 'The same set of choices appears three or more times. Show it once, where it is used.');
    var first = $$('canvas, [draggable="true"], input[type="range"], [data-df-cloth], [data-df-popup], [data-df-field], [data-df-stack], .df-hotspot, .df-guardian', scope).filter(function (el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < vh && r.width > 40; });
    if (!first.length) add('no-first-gesture', 'warn', 0, '', 'Nothing in the first screen answers a hand. Put the first gesture above the fold: something to pull, press or drag.');
    var hero = $$('img', scope).filter(function (im) { var r = im.getBoundingClientRect(); return r.top < vh && r.width * r.height > vw * vh * .3; });
    if (hero.length && !$$('canvas', scope).some(function (c) { var r = c.getBoundingClientRect(); return r.top < vh && r.width * r.height > vw * vh * .2; })) add('showroom-hero', 'info', hero.length, hero[0].getAttribute('alt') || hero[0].src, 'A render on a seamless backdrop is a catalogue. Show the thing in use, or draw it so it can answer.');
    var unnamed = $$('button, a[href], [role="button"]', scope).filter(function (b) { return vis(b) && !words(b) && !b.getAttribute('aria-label') && !b.getAttribute('title') && !b.getAttribute('aria-labelledby'); });
    if (unnamed.length) add('unnamed-control', 'warn', unnamed.length, unnamed[0].outerHTML.slice(0, 60), 'Every control has a name: words, aria-label or a title.');
    var fams = {}; $$('body, body *', scope).slice(0, 1500).forEach(function (el) { var f = cs(el).fontFamily.split(',')[0].replace(/["']/g, '').trim(); if (f) fams[f] = 1; });
    var stock = ['Inter', 'DM Sans', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans', 'Lato', 'Manrope', 'Plus Jakarta Sans', 'Space Grotesk'].filter(function (f) { return fams[f]; });
    if (stock.length) add('stock-face', 'info', stock.length, stock.join(', '), 'A stock grotesk reads as a template. Use the kit\'s faces, or Anybody with its width tied to something real.');
    var sev = { warn: 0, info: 1 }; out.sort(function (a, b) { return sev[a.severity] - sev[b.severity]; });
    if (o.log !== false && w.console && out.length) { try { console.table(out.map(function (f) { return { rule: f.rule, severity: f.severity, count: f.count, sample: f.sample }; })); } catch (e) {} }
    emit('taste', { findings: out }); return out;
  };
  D.taste.badge = function (findings) {
    findings = findings || D.taste({ log: false }); var old = $('.df-taste'); if (old) old.remove();
    var warn = findings.filter(function (f) { return f.severity === 'warn'; }).length, el = doc.createElement('details'); el.className = 'df-taste';
    el.innerHTML = '<summary>taste · <b>' + warn + '</b> warn · ' + (findings.length - warn) + ' info</summary><ol></ol><p>Depthfield.taste() reads the page for the tells that make it look generated. It never changes anything.</p>';
    var ol = $('ol', el); findings.forEach(function (f) { var li = doc.createElement('li'); li.className = 'is-' + f.severity; li.innerHTML = '<b></b> <span></span><small></small>'; li.firstChild.textContent = f.rule + (f.count ? ' ×' + f.count : ''); li.children[1].textContent = f.fix; li.children[2].textContent = f.sample; ol.appendChild(li); });
    if (!findings.length) ol.outerHTML = '<p>Nothing generic found. It reads as made.</p>';
    doc.body.appendChild(el); return el;
  };

  function itemsFrom(list) {
    return $$('li', list).map(function (li) { var a = $('a', li), nm = $('b, strong', li); return { name: (nm || a || li).textContent.trim(), href: a ? a.getAttribute('href') : '', color: li.getAttribute('data-color') || (a && a.getAttribute('data-color')), line: li.getAttribute('data-line') || (a && a.getAttribute('data-line')) || '' }; });
  }

  w.Depthfield = D;
})();

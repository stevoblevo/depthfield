/* Saelion Rock · the page. One world, five axes: where you stand (x), how near (depth), the hour (time), the look, and what you have worn (memory). */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), cv = $('#gl');
  const gl = cv.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) { document.body.classList.add('no-gl'); return; }
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the sixteen looks, each a material with its inks read from its kit's tokens ---------- */
  const K = { sb: { name: 'Storeybrook', ver: '1.5.0', band: 'Day', tod: .14 }, hmp: { name: 'Hypermetapunk', ver: '0.5.0', band: 'Dusk', tod: .42 }, df: { name: 'Depthfield', ver: '2.5.0', band: 'Night', tod: .8 } };
  const LOOKS = [
    { kit: 'sb', id: 'daylight', name: 'Meta Daylight', mat: 0, medium: 'a wash', mood: 'still', c: ['paper', 'art-line', 'accent', 'wash-sky', 'gamboge', 'art-water', 'wash-meadow', 'art-shade'] },
    { kit: 'sb', id: 'knight', name: 'Knight Night', mat: 1, medium: 'lamplight', mood: 'lit', c: ['paper', 'ink', 'gamboge', 'surface', 'cerulean', 'art-line', 'accent', 'art-shade'] },
    { kit: 'sb', id: 'inkblot', name: 'Ink Blot', mat: 2, medium: 'brush ink', mood: 'still', c: ['paper', 'ink', 'ink', 'ink', 'ink', 'ink', 'ink', 'ink'] },
    { kit: 'sb', id: 'comix', name: 'Comix', mat: 3, medium: 'print', mood: 'impact', c: ['paper', 'ink', 'rose', 'gamboge', 'cerulean', 'sap', 'copper', 'art-shade'] },
    { kit: 'sb', id: 'origami', name: 'Origami', mat: 4, medium: 'cut paper', mood: 'still', c: ['paper', 'ink', 'accent', 'art-shade', 'gamboge', 'art-water', 'page', 'line'] },
    { kit: 'sb', id: 'skein', name: 'Skein silk', mat: 5, medium: 'cross-stitch', mood: 'still', c: ['paper', 'ink', 'copper', 'line', 'gamboge', 'wash-sky', 'accent', 'art-shade'] },
    { kit: 'hmp', id: 'dusk', name: 'Dusk', mat: 6, medium: 'a neon halftone', mood: 'lit', c: ['wave-abyss', 'wave-indigo', 'wave-violet', 'wave-magenta', 'wave-tangerine', 'wave-sun', 'wave-cyan', 'punk-magenta'] },
    { kit: 'hmp', id: 'zine', name: 'Zine', mat: 7, medium: 'a xerox with one red', mood: 'impact', c: ['punk-paper', 'punk-ink', 'accent', 'surface', 'line', 'punk-acid', 'ink', 'ink'] },
    { kit: 'hmp', id: 'contrast', name: 'High contrast', mat: 8, medium: 'a solid cut', mood: 'impact', c: ['void', 'ink', 'punk-acid', 'ink', 'ink', 'ink', 'ink', 'ink'] },
    { kit: 'df', id: 'night', name: 'Night · mint', mat: 9, p: 3, medium: 'ridges in the night garden', mood: 'lit', c: ['wx-night-sky-top', 'wx-night-sky-low', 'wx-night-sun', 'wx-night-ridge-1', 'wx-night-ridge-2', 'wx-night-ridge-3', 'wx-night-rim', 'accent'] },
    { kit: 'df', id: 'day', name: 'Day · mint', mat: 9, p: 0, medium: 'ridges in the mint clearing', mood: 'still', c: ['wx-mint-sky-top', 'wx-mint-sky-low', 'wx-mint-sun', 'wx-mint-ridge-1', 'wx-mint-ridge-2', 'wx-mint-ridge-3', 'wx-mint-rim', 'accent'] },
    { kit: 'df', id: 'peach-night', name: 'Night · peach', mat: 9, p: 1, medium: 'ridges in the peach fall', mood: 'lit', c: ['wx-peach-sky-top', 'wx-peach-sky-low', 'wx-peach-sun', 'wx-peach-ridge-1', 'wx-peach-ridge-2', 'wx-peach-ridge-3', 'wx-peach-rim', 'accent'] },
    { kit: 'df', id: 'peach-day', name: 'Day · peach', mat: 9, p: 2, medium: 'ridges in the red rain', mood: 'still', c: ['wx-rain-sky-top', 'wx-rain-sky-low', 'wx-rain-sun', 'wx-rain-ridge-1', 'wx-rain-ridge-2', 'wx-rain-ridge-3', 'wx-rain-rim', 'accent'] },
    { kit: 'df', id: 'thread-night', name: 'Night · thread', mat: 10, medium: 'a scan', mood: 'lit', c: ['art-void', 'art-accent', 'art-ink', 'ink', 'ink', 'ink', 'ink', 'ink'] },
    { kit: 'df', id: 'thread-day', name: 'Day · thread', mat: 11, medium: 'a stage', mood: 'still', c: ['art-void', 'art-ink', 'thread', 'ink', 'ink', 'ink', 'ink', 'ink'] },
    { kit: 'df', id: 'contrast', name: 'High contrast', mat: 10, medium: 'a scan', mood: 'lit', c: ['art-void', 'art-accent', 'art-ink', 'ink', 'ink', 'ink', 'ink', 'ink'] },
    { kit: 'deep', id: 'deep', name: 'Deep', mat: 12, medium: 'a stereogram of the depth itself', mood: 'still', c: [] }
  ];
  LOOKS.forEach((l, i) => { l.i = i; const P = l.kit === 'deep' ? null : PAL[l.kit][l.id]; l.pal = new Float32Array(24);
    l.c.forEach((n, k) => { const v = (P && P[n]) || [128, 128, 128]; l.pal[k * 3] = v[0] / 255; l.pal[k * 3 + 1] = v[1] / 255; l.pal[k * 3 + 2] = v[2] / 255; });
    if (P) { const g = P.paper && l.kit === 'sb' ? P.paper : P.void || P.paper, ink = P.ink, acc = P.accent; l.hud = { g, ink, acc }; } });
  const DEEP = 16;

  /* ---------- GL ---------- */
  function prog(vs, fs) { const p = gl.createProgram(); for (const [t, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error('shader:', gl.getShaderInfoLog(s)); throw new Error('shader'); } gl.attachShader(p, s); }
    gl.bindAttribLocation(p, 0, 'aPos'); gl.bindAttribLocation(p, 1, 'aCol'); gl.bindAttribLocation(p, 2, 'aKind'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error('link:', gl.getProgramInfoLog(p)); throw new Error('link'); }
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i), name = info.name.replace(/\[0\]$/, ''); u[name] = gl.getUniformLocation(p, info.name); } return { p, u }; }
  let PG, PS, PP, PB;
  try { PG = prog(GV, GF); PS = prog(GV, SF); PP = prog(PV, PF); PB = prog(BV, BF); } catch (e) { document.body.classList.add('no-gl'); return; }
  const scene = buildScene();
  for (const ob of scene.objs) { ob.vao = gl.createVertexArray(); gl.bindVertexArray(ob.vao); const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, ob.data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 12); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 28, 24); ob.data = null; }
  const quad = gl.createVertexArray(); gl.bindVertexArray(quad); { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); }
  gl.bindVertexArray(null);
  function tex(w, h, ifmt, fmt, type, filter) { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
  const SH = 1024, shTex = tex(SH, SH, gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, gl.NEAREST), shFbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, shFbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shTex, 0); gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
  let G = null, W = 0, Hh = 0, scale = Math.min(devicePixelRatio || 1, 1.5);
  function resize() {
    const w = Math.max(2, Math.round(cv.clientWidth * scale)), h = Math.max(2, Math.round(cv.clientHeight * scale)); if (w === W && h === Hh) return; W = cv.width = w; Hh = cv.height = h;
    if (G) { gl.deleteTexture(G.a); gl.deleteTexture(G.n); gl.deleteTexture(G.d); gl.deleteFramebuffer(G.f); }
    G = { a: tex(w, h, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST), n: tex(w, h, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST), d: tex(w, h, gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, gl.NEAREST), f: gl.createFramebuffer() };
    gl.bindFramebuffer(gl.FRAMEBUFFER, G.f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, G.a, 0); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, G.n, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, G.d, 0); gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
  }

  /* ---------- the pets: drawn each frame by the kits' own pets add-ons into one strip, then stood on the shore ---------- */
  const PETS = { sb: window.Storeybrook && Storeybrook.pets, hmp: window.Hypermetapunk && Hypermetapunk.pets, df: window.Depthfield && Depthfield.pets };
  const strip = document.createElement('canvas'), SLOT = 144; strip.width = SLOT * 7; strip.height = 176; const sx = strip.getContext('2d');
  const petTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, petTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const petVao = gl.createVertexArray(), petBuf = gl.createBuffer(), petData = new Float32Array(7 * 6 * 5); gl.bindVertexArray(petVao); gl.bindBuffer(gl.ARRAY_BUFFER, petBuf); gl.bufferData(gl.ARRAY_BUFFER, petData, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 12); gl.bindVertexArray(null);
  /* seven places along the beach on the seal's side of the island */
  const SPOTS = (() => { const out = [], a0 = Math.atan2(scene.SR[2], scene.SR[0]); for (const da of [-1.3, -1.0, -.72, .55, .82, 1.1, 1.4]) { const a = a0 + da; let r = 7; while (r > 2 && scene.H(Math.cos(a) * r, Math.sin(a) * r) < .12) r -= .1; out.push([Math.cos(a) * (r - .05), 0, Math.sin(a) * (r - .05)]); } out.forEach(p => { p[1] = scene.H(p[0], p[2]); }); return out; })();
  let petCount = 0;
  function pets(kit, lookId, t, beat) { const P = PETS[kit]; petCount = 0; if (!P || !P.list) return; sx.clearRect(0, 0, strip.width, strip.height);
    try { P.list.forEach((p, i) => { if (i < 7 && P.draw(sx, p.id, { x: i * SLOT + SLOT / 2, y: 92, size: 112, t: t, beat: beat, look: lookId, still: still }) !== false) petCount = i + 1; }); } catch (e) { petCount = 0; return; }
    gl.bindTexture(gl.TEXTURE_2D, petTex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, strip); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    const rx = Math.cos(st.yaw), rz = -Math.sin(st.yaw), hw = .98, hh = 2.4; let o = 0; const order = petCount === 5 ? [0, 1, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6];
    for (let i = 0; i < petCount; i++) { const s = SPOTS[order[i]], u0 = i / 7, u1 = (i + 1) / 7, y0 = Math.max(s[1], .1) - .28, y1 = y0 + hh;
      const q = [[-hw, y0, u0, 0], [hw, y0, u1, 0], [hw, y1, u1, 1], [-hw, y0, u0, 0], [hw, y1, u1, 1], [-hw, y1, u0, 1]]; for (const v of q) { petData[o++] = s[0] + rx * v[0]; petData[o++] = v[1]; petData[o++] = s[2] + rz * v[0]; petData[o++] = v[2]; petData[o++] = v[3]; } }
    gl.bindBuffer(gl.ARRAY_BUFFER, petBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, petData); }

  /* ---------- state: the five axes ---------- */
  const mem = (() => { try { return JSON.parse(localStorage.getItem('saelion-rock') || '{}'); } catch (e) { return {}; } })();
  /* on a tall screen you stand behind the seal and look past it to the lighthouse; on a wide one you see them side by side */
  const tall = innerWidth / innerHeight < .8, D0 = tall ? 20.5 : 18, Y0 = tall ? -1.0 : .62, SUN_AZ = Math.atan2(-Math.cos(Y0), -Math.sin(Y0)) - (tall ? .2 : .06);
  const st = { yaw: Y0, yawT: Y0, dist: D0, distT: D0, tod: .14, todT: .14, cur: { sb: 4, hmp: 6, df: 9 }, look: 4, from: 4, wipe: 0, wiping: false, wipeC: [.5, .5], pinned: false,
    seen: mem.seen || {}, crossed: mem.crossed || {}, deep: !!mem.deep, tap: [.5, .5, 9], t: 0, last: 0, beat: 0 };
  function save() { try { localStorage.setItem('saelion-rock', JSON.stringify({ seen: st.seen, crossed: st.crossed, deep: st.deep })); } catch (e) { /* a private window: memory lasts the visit */ } }
  const kitAt = tod => tod < .34 ? 'sb' : tod < .6 ? 'hmp' : 'df';   /* the sun is up, on the horizon, or gone */
  function wear(i, c) { if (i === st.look) return; st.from = st.wiping && st.wipe < .5 ? st.from : st.look;
    st.look = i; st.wipe = still ? 1 : 0.0001; st.wiping = !still; st.wipeC = c || st.wipeC; if (still) st.from = i;
    const l = LOOKS[i]; if (l.kit !== 'deep') { st.seen[l.kit + ':' + l.id] = 1; st.crossed[l.kit] = 1; if (!st.deep && st.crossed.sb && st.crossed.hmp && st.crossed.df) { st.deep = true; toast('You crossed the day. The deep look is open.'); } save(); }
    hud(); if (AU.on) AU.mood(l.mood); }
  function pick(i) { const l = LOOKS[i]; if (i === DEEP) { if (!st.deep) { toast('The deep look opens when you have crossed the day: drag the sun down through dusk into night.'); return; } st.pinned = true; wear(i, [.5, .5]); return; }
    st.pinned = false; st.cur[l.kit] = i; if (kitAt(st.todT) !== l.kit) st.todT = K[l.kit].tod; st.travel = kitAt(st.tod) !== l.kit ? l.kit : null; wear(i, sunUV()); }

  /* ---------- sun, moon, camera ---------- */
  const norm3 = v => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
  function sky(tod) { const el = (27 - tod * 68) * Math.PI / 180, az = SUN_AZ, le = Math.max(el, -.05) * .8 + .42;   /* the light that models the world stands higher than the sun you see */ const sun = [Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)];
    const moon = norm3([Math.cos(SUN_AZ + .5), .5, Math.sin(SUN_AZ + .5)]); const la = az + 1.2, light = sun[1] > -.06 ? [Math.cos(le) * Math.cos(la), Math.sin(le), Math.cos(le) * Math.sin(la)] : norm3([moon[0] + .9, .8, moon[2] + .5]);   /* and a little to one side, so the faces toward you are modelled */ return { sun, moon, light, el }; }
  let cam = null;
  function camera() { const asp = W / Hh, hf = 44 * Math.PI / 180, fovy = asp >= 1.2 ? hf : 2 * Math.atan(Math.tan(hf / 2) * Math.min(1.9, 1.2 / asp));
    const e = [Math.sin(st.yaw) * st.dist, 3.6 + (st.dist - 18) * .14, Math.cos(st.yaw) * st.dist], c = [0, asp < 1 ? 3.9 : 2.9, 0], V = M4.look(e, c, [0, 1, 0]), P = M4.persp(fovy, asp, .5, 240), VP = M4.mul(P, V); cam = { e, VP, inv: M4.inv(VP) }; return cam; }
  function project(d) { const p = [cam.e[0] + d[0] * 200, cam.e[1] + d[1] * 200, cam.e[2] + d[2] * 200], m = cam.VP, w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]; if (w <= 0) return null;
    return [(m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]) / w * .5 + .5, (m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]) / w * .5 + .5]; }
  function sunUV() { if (!cam) return [.5, .5]; const s = sky(st.tod), p = project(s.sun[1] > -.08 ? s.sun : s.moon); return p ? [Math.max(-.2, Math.min(1.2, p[0])), Math.max(-.2, Math.min(1.2, p[1]))] : [.5, .3]; }

  /* ---------- sound: one sequence, three arrangements. 13 steps of the tritave (Bohlen-Pierce) or the ordinary 12 ---------- */
  const AU = { on: false, ctx: null, norm: false, bpm: 72, moodNow: 'still', step: 0, next: 0, beatAt: 0, beatLen: .8,
    f(n) { return this.norm ? 196 * Math.pow(2, n / 12) : 196 * Math.pow(3, n / 13); },
    scale() { return this.norm ? [0, 2, 4, 7, 9, 12, 14, 16, 19] : [0, 2, 3, 4, 6, 7, 9, 10, 12, 13, 15, 16]; },
    chord(root) { return (this.norm ? [0, 4, 7, 12] : [0, 6, 10, 13]).map(x => x + root); },
    start() { if (this.ctx) { this.ctx.resume(); return; } const C = this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.out = C.createGain(); this.out.gain.value = 0; const comp = C.createDynamicsCompressor();
      const dl = C.createDelay(1.5), fb = C.createGain(), wet = C.createGain(); dl.delayTime.value = .42; fb.gain.value = .34; wet.gain.value = .26; this.out.connect(comp); this.out.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(comp); comp.connect(C.destination);
      this.out.gain.linearRampToValueAtTime(.55, C.currentTime + 1.2); this.next = C.currentTime + .1; this.step = 0; },
    env(g, t, a, d, peak) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); },
    pluck(n, t, v) { const C = this.ctx, o = C.createOscillator(), f = C.createBiquadFilter(), g = C.createGain(); o.type = this.norm ? 'triangle' : 'square'; o.frequency.value = this.f(n); f.type = 'lowpass'; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(500, t + .5); f.Q.value = 1.2;
      this.env(g, t, .006, .7, (v || .16) * (this.norm ? 1.3 : .8)); o.connect(f); f.connect(g); g.connect(this.out); o.start(t); o.stop(t + .8); },
    pad(ns, t, len, v) { const C = this.ctx; for (const n of ns) for (const det of [-4, 4]) { const o = C.createOscillator(), g = C.createGain(), f = C.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = this.f(n) / (this.norm ? 2 : 3); o.detune.value = det; f.type = 'lowpass'; f.frequency.value = 850;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v || .045, t + len * .4); g.gain.linearRampToValueAtTime(0.0001, t + len * 1.15); o.connect(f); f.connect(g); g.connect(this.out); o.start(t); o.stop(t + len * 1.2); } },
    bell(n, t, v) { const C = this.ctx, base = this.f(n), parts = this.norm ? [1, 2, 3, 4.2, 5.4] : [1, 9 / 7, 5 / 3, 7 / 3, 3, 5]; parts.forEach((p, i) => { const o = C.createOscillator(), g = C.createGain(); o.type = 'sine'; o.frequency.value = base * p; this.env(g, t, .004, 2.6 / (1 + i * .5), (v || .12) / (1 + i * .9)); o.connect(g); g.connect(this.out); o.start(t); o.stop(t + 3); }); },
    kick(t) { const C = this.ctx, o = C.createOscillator(), g = C.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .16); this.env(g, t, .004, .3, .5); o.connect(g); g.connect(this.out); o.start(t); o.stop(t + .4); },
    hat(t, v) { const C = this.ctx, n = C.createBufferSource(), b = C.createBuffer(1, 2205, 44100), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); n.buffer = b; const f = C.createBiquadFilter(), g = C.createGain(); f.type = 'highpass'; f.frequency.value = 6500; g.gain.value = v || .07; n.connect(f); f.connect(g); g.connect(this.out); n.start(t); },
    mood(m) { this.moodNow = m; this.bpm = m === 'impact' ? 96 : m === 'lit' ? 66 : 74; },
    tick() { if (!this.on || !this.ctx) return; const C = this.ctx, sixteenth = () => 60 / this.bpm / 2; while (this.next < C.currentTime + .25) { const s = this.step, t = this.next, bar = Math.floor(s / 8), i = s % 8, m = this.moodNow;
        const roots = this.norm ? [0, 5, 7, 3] : [0, 6, 10, 4], root = roots[Math.floor(bar / 2) % 4], ch = this.chord(root), sc = this.scale();
        if (i % 2 === 0) { this.beatAt = t; this.beatLen = sixteenth() * 2; }
        if (i === 0 && bar % 2 === 0) this.pad(ch.slice(0, 3), t, sixteenth() * 16, m === 'lit' ? .06 : .04);
        if (m === 'still') { if (i % 2 === 0) this.pluck(ch[(i / 2 + bar) % 4], t, .15); if (i === 4 && bar % 4 === 3) this.bell(ch[2], t, .1); }
        else if (m === 'impact') { if (i === 0 || i === 4) this.kick(t); if (i % 2 === 1) this.hat(t, .06); this.pluck(ch[[0, 2, 1, 3, 2, 0, 3, 1][i]] + (i > 5 ? (this.norm ? 12 : 13) : 0), t, .13); if (i === 0) this.pluck(ch[0] - (this.norm ? 12 : 13), t, .2); }
        else { if (i === 0) this.pluck(ch[0] - (this.norm ? 12 : 13), t, .17); if (i === 3 || (i === 6 && bar % 2)) this.bell(ch[(bar + i) % 4] + (this.norm ? 12 : 13), t, .085); if (i === 5) this.pluck(sc[(bar * 5 + 2) % sc.length] + root, t, .09); }
        this.step++; this.next += sixteenth(); } },
    note(k) { if (!this.on || !this.ctx) return; this.bell((this.norm ? Math.round(k * 12 / 13) : k) % 27, this.ctx.currentTime + .01, .17); },
    ring(y) { if (!this.on || !this.ctx) return; const sc = this.scale(); this.bell(sc[Math.max(0, Math.min(sc.length - 1, Math.round(y * (sc.length - 1))))] + (this.norm ? 12 : 13), this.ctx.currentTime + .01, .16); },
    beat() { if (this.on && this.ctx) { const ph = (this.ctx.currentTime - this.beatAt) / this.beatLen; return ph >= 0 ? Math.exp(-3.5 * ph) : 0; } const len = 60 / 74, ph = (performance.now() / 1000 % len) / len; return still ? 0 : Math.exp(-3.5 * ph) * .6; }
  };

  /* ---------- HUD ---------- */
  const elLook = $('#look'), elSub = $('#sub'), elAx = $('#axes'), elChips = $('#chips'), elToast = $('#toast');
  let toastT = 0; function toast(s) { elToast.textContent = s; elToast.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { elToast.hidden = true; }, 5200); }
  LOOKS.forEach(l => { if (l.i === 0 || l.i === 6 || l.i === 9 || l.i === DEEP) { const h = document.createElement('span'); h.className = 'grp'; h.textContent = l.i === DEEP ? 'Beyond' : K[l.kit].band + ' · ' + K[l.kit].name; elChips.appendChild(h); }
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = l.name; b.dataset.i = l.i; b.addEventListener('click', () => pick(l.i)); elChips.appendChild(b); l.btn = b; });
  function css(v) { return 'rgb(' + v[0] + ',' + v[1] + ',' + v[2] + ')'; }
  function hud() { const l = LOOKS[st.look], r = document.documentElement; document.body.dataset.kit = l.kit;
    const h = l.hud || { g: [10, 12, 16], ink: [240, 240, 240], acc: [240, 200, 90] }; r.style.setProperty('--g', css(h.g)); r.style.setProperty('--ink', css(h.ink)); r.style.setProperty('--acc', css(h.acc));
    elLook.textContent = l.name; elSub.textContent = l.kit === 'deep' ? 'Relax your eyes past the screen until the two marks become three. The island rises out of the pattern.' : K[l.kit].name + ' ' + K[l.kit].ver + ' · ' + l.medium + ' · rewards ' + ({ still: 'stillness', impact: 'impact', lit: 'a light' })[l.mood];
    LOOKS.forEach(x => { x.btn.setAttribute('aria-pressed', String(x.i === st.look)); x.btn.classList.toggle('seen', !!st.seen[x.kit + ':' + x.id]); }); LOOKS[DEEP].btn.classList.toggle('locked', !st.deep);
    LOOKS[DEEP].btn.setAttribute('aria-label', st.deep ? 'Deep' : 'Deep, locked: cross the day to open it'); if (l.btn.scrollIntoView && !still) l.btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
  function axes() { const s = sky(st.tod), hour = 12 + st.tod * 11.5, hh = Math.floor(hour) % 24, mm = Math.floor((hour % 1) * 60), seen = Object.keys(st.seen).length;
    const gap = innerWidth < 520 ? ' · ' : '   '; elAx.textContent = ['x ' + String(Math.round(((st.yaw * 180 / Math.PI) % 360 + 360) % 360)).padStart(3, '0') + '°', 'depth ' + st.dist.toFixed(0), 'time ' + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), 'look ' + String(st.look + 1).padStart(2, '0') + '/17', (innerWidth < 520 ? 'mem ' : 'memory ') + seen + '/16'].join(gap); }
  $('#snd').addEventListener('click', e => { AU.on = !AU.on; if (AU.on) { AU.start(); AU.mood(LOOKS[st.look].mood); } else if (AU.ctx) AU.ctx.suspend(); e.currentTarget.setAttribute('aria-pressed', String(AU.on)); e.currentTarget.textContent = AU.on ? 'Sound on' : 'Sound off'; });
  $('#tune').addEventListener('click', e => { AU.norm = !AU.norm; e.currentTarget.textContent = AU.norm ? '12 steps' : '13 steps'; e.currentTarget.setAttribute('aria-label', AU.norm ? 'Tuning: the ordinary 12 steps of the octave. Switch to 13 steps of the tritave' : 'Tuning: 13 steps of the tritave. Switch to the ordinary 12'); });
  $('#up').addEventListener('click', () => { st.todT = Math.max(0, st.todT - .09); st.pinned = false; st.travel = null; }); $('#down').addEventListener('click', () => { st.todT = Math.min(1, st.todT + .09); st.pinned = false; st.travel = null; });
  $('#help').addEventListener('click', () => { const h = $('#hint'); h.hidden = !h.hidden; });

  /* ---------- input: sideways walks round, up and down moves the sun, a pinch or the wheel comes nearer, a tap rings ---------- */
  const ptr = new Map(); let moved = 0, downT = 0, pinch = 0;
  cv.addEventListener('pointerdown', e => { try { cv.setPointerCapture(e.pointerId); } catch (x) {} ptr.set(e.pointerId, [e.clientX, e.clientY]); if (ptr.size === 1) { moved = 0; downT = performance.now(); } if (ptr.size === 2) { const p = [...ptr.values()]; pinch = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); } $('#hint').hidden = true; });
  cv.addEventListener('pointermove', e => { const p = ptr.get(e.pointerId); if (!p) return; const dx = e.clientX - p[0], dy = e.clientY - p[1]; ptr.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptr.size === 2) { const q = [...ptr.values()], d = Math.hypot(q[0][0] - q[1][0], q[0][1] - q[1][1]); if (pinch) st.distT = Math.max(12, Math.min(36, st.distT * pinch / d)); pinch = d; return; }
    moved += Math.abs(dx) + Math.abs(dy); st.yawT -= dx / cv.clientWidth * 3.2; if (Math.abs(dy) > Math.abs(dx) * .6) { st.todT = Math.max(0, Math.min(1, st.todT + dy / cv.clientHeight * 1.15)); st.pinned = false; st.travel = null; } });
  const up = e => { if (!ptr.has(e.pointerId)) return; ptr.delete(e.pointerId); pinch = 0; if (e.type === 'pointerup' && moved < 8 && performance.now() - downT < 400) { const r = cv.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = 1 - (e.clientY - r.top) / r.height; if (starHit(u, v)) { juggle(); st.tap = [u, v, .0]; } else { st.tap = [u, v, 0]; AU.ring(v); } } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { e.preventDefault(); st.distT = Math.max(12, Math.min(36, st.distT + e.deltaY * .01)); }, { passive: false });
  addEventListener('keydown', e => { if (e.target.closest && e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return; const k = e.key;
    if (k === 'ArrowLeft') st.yawT += .18; else if (k === 'ArrowRight') st.yawT -= .18; else if (k === 'ArrowUp') { st.todT = Math.max(0, st.todT - .05); st.pinned = false; st.travel = null; } else if (k === 'ArrowDown') { st.todT = Math.min(1, st.todT + .05); st.pinned = false; st.travel = null; } else return; e.preventDefault(); });

  /* ---------- the juggle: tap the star and the seal heads it. Each touch in the air rings one step higher; thirteen is a whole tritave ---------- */
  const J = { h: 0, v: 0, n: 0, best: mem.best || 0, spin: 0, pos: [0, 0, 0] };
  function starHit(u, v) { if (!cam) return false; const m = cam.VP, p = J.pos, w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]; if (w <= 0) return false;
    const x = (m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]) / w * .5 + .5, y = (m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]) / w * .5 + .5; return Math.hypot((u - x) * cv.clientWidth, (v - y) * cv.clientHeight) < 54; }
  function juggle() { J.n = J.h > .08 ? J.n + 1 : 1; J.v = 5.4 + Math.min(J.n, 13) * .12; if (J.n > J.best) { J.best = J.n; try { const o = JSON.parse(localStorage.getItem('saelion-rock') || '{}'); o.best = J.best; localStorage.setItem('saelion-rock', JSON.stringify(o)); } catch (e) {} }
    const sc = AU.scale(); AU.note(J.n - 1); $('#jug').hidden = false; $('#jug').textContent = J.n + (J.n === 1 ? ' touch' : ' touches') + ' · best ' + J.best;
    if (J.n === 13) toast('Thirteen touches: a whole tritave. The scale has come home, three times as high.'); }
  function jugglePhys(dt) { if (J.h <= 0 && J.v <= 0) return; J.v -= 9.5 * dt; J.h += J.v * dt; J.spin += dt * 9; if (J.h <= 0) { J.h = 0; J.v = 0; J.n = 0; setTimeout(() => { if (!J.n) $('#jug').hidden = true; }, 2400); } }

  /* ---------- the frame ---------- */
  const U = PP.u, lightVP = { m: null };
  function animate(t) { const S = scene, b = st.beat;
    S.seal.model = M4.trs(S.seal.base, .5, Math.sin(t * .9) * .04 - J.h * .012, Math.sin(t * .7) * .03, 1.32 + b * .02);
    J.pos = [S.star.base[0], S.star.base[1] + Math.sin(t * 1.8) * .05 + b * .1 + J.h, S.star.base[2]]; S.star.model = M4.trs(J.pos, t * 1.1 + J.spin, Math.sin(t) * .2, 0, 1.3 + b * .2);
    const kx = -1.2 + Math.sin(t * .23) * 1.6, ky = 8.2 + Math.sin(t * .31) * .5, kz = -1.6 + Math.cos(t * .19) * 1.2; S.kite.model = M4.trs([kx, ky, kz], .8 + Math.sin(t * .4) * .3, Math.sin(t * .9) * .12, .25 + Math.sin(t * .6) * .08, 1);
    const f = S.string.from, dx = kx - f[0], dy = ky - 1.05 - f[1], dz = kz - f[2], len = Math.hypot(dx, dy, dz); S.string.model = M4.trs(f, Math.atan2(-dz, dx), Math.asin(dy / len), 0, [len, 1, 1]);
    const ba = t * .05 + 1; S.boat.model = M4.trs([Math.cos(ba) * 10.5, .1 + Math.sin(t * 1.1) * .07, Math.sin(ba) * 10.5], -ba - Math.PI / 2, Math.sin(t * .9) * .05, Math.sin(t * 1.3) * .05, .9);
    for (const c of S.cranes) { const a = t * c.sp + c.ph, p = [Math.cos(a) * c.r, c.y + Math.sin(t * .5 + c.ph) * .5, Math.sin(a) * c.r], ry = -a - Math.PI / 2, fl = Math.sin(t * 3.2 + c.ph) * .55;
      c.body.model = M4.trs(p, ry, 0, 0, 1.2); c.wl.model = M4.trs(p, ry, 0, fl, 1.2); c.wr.model = M4.trs(p, ry, 0, -fl, 1.2); }
    for (const c of S.clouds) { const a = c.a + t * .008; c.ob.model = M4.trs([Math.cos(a) * c.r, c.y, Math.sin(a) * c.r], a, 0, 0, c.s); }
    const lit = st.tod > .3 ? 1 : 0; S.beam.model = M4.trs(S.lamp, t * .5, 0, 0, lit ? 1 : .0001); return lit; }
  function drawScene(P, shadow) { for (const ob of scene.objs) { if (shadow && !ob.cast) continue; gl.uniformMatrix4fv(P.u.uModel, false, ob.model); gl.bindVertexArray(ob.vao); gl.drawArrays(gl.TRIANGLES, 0, ob.count); } }
  let acc = 0, frames = 0;
  function frame(now) { requestAnimationFrame(frame); if (document.hidden) return; const dt = Math.min(.05, (now - st.last) / 1000 || .016); st.last = now; if (!still) st.t += dt;
    acc += dt; frames++; if (frames === 50) { if (acc / 50 > .03 && scale > .7) { scale = Math.max(.7, scale * .82); } acc = 0; frames = 0; }
    resize(); AU.tick(); st.beat = AU.beat();
    const ease = 1 - Math.pow(.001, dt); st.yaw += (st.yawT - st.yaw) * ease; st.dist += (st.distT - st.dist) * ease; st.tod += (st.todT - st.tod) * (1 - Math.pow(.02, dt));
    if (st.travel) { if (kitAt(st.tod) === st.travel) st.travel = null; } else if (!st.pinned) { const k = kitAt(st.tod), want = st.cur[k]; if (st.look !== want) { camera(); wear(want, sunUV()); } }
    if (st.wiping) { st.wipe += dt / 1.15; if (st.wipe >= 1) { st.wiping = false; st.wipe = 0; st.from = st.look; } }
    st.tap[2] += dt; jugglePhys(dt); const s = sky(st.tod), c = camera(), lampOn = animate(st.t);
    { const L0 = LOOKS[st.look], bk = L0.kit === 'deep' ? kitAt(st.tod) : L0.kit; pets(bk, L0.kit === 'deep' ? LOOKS[st.cur[bk]].id : L0.id, st.t, st.beat); }
    /* the shadow map, from the light */
    const L = s.light, le = [L[0] * 40, L[1] * 40, L[2] * 40], LV = M4.look(le, [0, 1, 0], [0, 1, 0]), LP = M4.ortho(-12, 12, -12, 12, 5, 80), LVP = M4.mul(LP, LV);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.bindFramebuffer(gl.FRAMEBUFFER, shFbo); gl.viewport(0, 0, SH, SH); gl.clear(gl.DEPTH_BUFFER_BIT); gl.useProgram(PS.p); gl.uniformMatrix4fv(PS.u.uVP, false, LVP); gl.uniform1f(PS.u.uTime, st.t); drawScene(PS, true);
    /* the one drawing: flat colour, facets, shadow, depth */
    gl.bindFramebuffer(gl.FRAMEBUFFER, G.f); gl.viewport(0, 0, W, Hh); gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]); gl.clearBufferfv(gl.COLOR, 1, [.5, .5, 1, 1]); gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(PG.p); gl.uniformMatrix4fv(PG.u.uVP, false, c.VP); gl.uniformMatrix4fv(PG.u.uLightVP, false, LVP); gl.uniform3fv(PG.u.uCam, c.e); gl.uniform1f(PG.u.uTime, st.t);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, shTex); gl.uniform1i(PG.u.uShadow, 0); drawScene(PG, false);
    if (petCount) { gl.useProgram(PB.p); gl.uniformMatrix4fv(PB.u.uVP, false, c.VP); gl.uniform3fv(PB.u.uCam, c.e); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, petTex); gl.uniform1i(PB.u.uTex, 0); gl.bindVertexArray(petVao); gl.drawArrays(gl.TRIANGLES, 0, petCount * 6); }
    /* the look: a material over the drawing */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, Hh); gl.disable(gl.DEPTH_TEST); gl.useProgram(PP.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.a); gl.uniform1i(U.uAlb, 0); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, G.n); gl.uniform1i(U.uNrm, 1); gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, G.d); gl.uniform1i(U.uDepth, 2);
    const A = LOOKS[st.wiping ? st.from : st.look], B = LOOKS[st.look], deepPal = LOOKS[st.cur[kitAt(st.tod)]].pal;
    gl.uniform2f(U.uRes, W, Hh); gl.uniform1f(U.uTime, st.t); gl.uniform1f(U.uBeat, st.beat); gl.uniform1f(U.uPx, scale * Math.max(1, Math.min(1.5, cv.clientWidth / 520))); gl.uniform1f(U.uNear, .5); gl.uniform1f(U.uFar, 240); gl.uniform1f(U.uFocus, st.dist);
    gl.uniformMatrix4fv(U.uInvVP, false, c.inv); gl.uniform3fv(U.uCam, c.e); gl.uniform3fv(U.uSun, s.sun); gl.uniform3fv(U.uMoon, s.moon); gl.uniform3fv(U.uLight, s.light); gl.uniform3fv(U.uLamp, scene.lamp); gl.uniform1f(U.uLampOn, 1);
    gl.uniform1i(U.uMatA, A.mat); gl.uniform1i(U.uMatB, B.mat); gl.uniform3fv(U.uCA, A.i === DEEP ? deepPal : A.pal); gl.uniform3fv(U.uCB, B.i === DEEP ? deepPal : B.pal); gl.uniform1f(U.uPA, A.i === DEEP ? st.dist - 8 : A.p || 0); gl.uniform1f(U.uPB, B.i === DEEP ? st.dist - 8 : B.p || 0);
    gl.uniform1f(U.uWipe, st.wiping ? st.wipe : 0); gl.uniform2fv(U.uWipeC, st.wipeC); gl.uniform3fv(U.uTap, st.tap);
    gl.bindVertexArray(quad); gl.drawArrays(gl.TRIANGLES, 0, 3); if ((frames & 7) === 0) axes();
  }
  window.__rock = { st, LOOKS, pick, wear, AU, J, juggle };
  resize(); camera(); st.seen['sb:origami'] = 1; st.crossed.sb = 1; hud(); axes(); requestAnimationFrame(frame);
  setTimeout(() => { $('#hint').hidden = true; }, 11000);   /* the hint steps aside by itself; the ? brings it back */
})();

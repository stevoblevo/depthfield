/* Saelion Rock · the scene. Low-poly, flat fills, nothing else: the same rule as the plate's source drawing.
   Every object is triangles of one colour each; the looks add light, line and material. */
const M4 = {
  id() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; },
  persp(fovy, asp, n, f) { const t = 1 / Math.tan(fovy / 2), m = new Float32Array(16); m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = 2 * f * n / (n - f); return m; },
  ortho(l, r, b, t, n, f) { const m = new Float32Array(16); m[0] = 2 / (r - l); m[5] = 2 / (t - b); m[10] = -2 / (f - n); m[12] = -(r + l) / (r - l); m[13] = -(t + b) / (t - b); m[14] = -(f + n) / (f - n); m[15] = 1; return m; },
  look(e, c, u) { let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx; l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx, m = new Float32Array(16);
    m[0] = xx; m[1] = yx; m[2] = zx; m[4] = xy; m[5] = yy; m[6] = zy; m[8] = xz; m[9] = yz; m[10] = zz;
    m[12] = -(xx * e[0] + xy * e[1] + xz * e[2]); m[13] = -(yx * e[0] + yy * e[1] + yz * e[2]); m[14] = -(zx * e[0] + zy * e[1] + zz * e[2]); m[15] = 1; return m; },
  inv(m) { const o = new Float32Array(16), a = m, b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4], b03 = a[1] * a[6] - a[2] * a[5], b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6],
      b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12], b08 = a[8] * a[15] - a[11] * a[12], b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
    let d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; d = 1 / d;
    o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * d; o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * d; o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * d; o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * d;
    o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * d; o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * d; o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * d; o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * d;
    o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * d; o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * d; o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * d; o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * d;
    o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * d; o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * d; o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * d; o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * d; return o; },
  /* translate * rotY * rotZ * rotX * scale */
  trs(t, ry, rz, rx, s) { const cy = Math.cos(ry || 0), sy = Math.sin(ry || 0), cz = Math.cos(rz || 0), sz = Math.sin(rz || 0), cx = Math.cos(rx || 0), sx = Math.sin(rx || 0), S = s == null ? [1, 1, 1] : typeof s === 'number' ? [s, s, s] : s;
    const Y = [cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1], Z = [cz, sz, 0, 0, -sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], X = [1, 0, 0, 0, 0, cx, sx, 0, 0, -sx, cx, 0, 0, 0, 0, 1];
    let m = M4.mul(M4.mul(Y, Z), X); for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) m[c * 4 + r] *= S[c]; m[12] = t[0]; m[13] = t[1]; m[14] = t[2]; return m; },
  pt(m, p) { return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]]; }
};

function buildScene() {
  let seed = 20261125; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const hex = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  const C = { seal: hex('#6b8fae'), belly: hex('#c9dbe8'), flip: hex('#4d6f8c'), rock: hex('#3f4a5a'), dark: hex('#1f2a37'), star: hex('#f2c14e'), cream: hex('#e9e2d0'), red: hex('#c8553d'),
    sand: hex('#e6d3a0'), grass: hex('#86b06c'), grass2: hex('#6f9f62'), stone: hex('#8d939c'), stone2: hex('#a7acb3'), pine: hex('#3f7a5a'), pine2: hex('#346a50'), trunk: hex('#7a5a3a'),
    sea: hex('#5f93b5'), sea2: hex('#4f84aa'), paper: hex('#f4f6f2'), rose: hex('#d95f6a'), blue: hex('#6b8fae'), navy: hex('#4d6f8c'), cloud: hex('#eef2f5'), beam: hex('#f7e3a1') };
  const objs = [];
  function mesh(name, fn, o) { const v = []; const tri = (a, b, c, col, kind, vary) => { const k = 1 + (rnd() - .5) * 2 * (vary == null ? .06 : vary); for (const p of [a, b, c]) v.push(p[0], p[1], p[2], col[0] * k, col[1] * k, col[2] * k, kind == null ? .2 : kind); };
    fn(tri); const ob = Object.assign({ name, data: new Float32Array(v), count: v.length / 7, model: M4.id(), cast: true }, o || {}); objs.push(ob); return ob; }
  /* a unit sphere of 80 facets */
  const ICO = (() => { const t = (1 + Math.sqrt(5)) / 2; let V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(p => { const l = Math.hypot(...p); return p.map(x => x / l); });
    let F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    const mid = (a, b) => { const p = [(V[a][0] + V[b][0]) / 2, (V[a][1] + V[b][1]) / 2, (V[a][2] + V[b][2]) / 2], l = Math.hypot(...p); V.push(p.map(x => x / l)); return V.length - 1; };
    const F2 = []; for (const [a, b, c] of F) { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); F2.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); } return { V, F: F2, F0: F }; })();
  function blob(tri, m, col, kind, o) { o = o || {}; const fs = o.coarse ? ICO.F0 : ICO.F, jit = o.jit || 0; const P = ICO.V.map(p => { const q = o.shape ? o.shape(p) : p; const j = 1 + (rnd() - .5) * jit; return M4.pt(m, [q[0] * j, q[1] * j, q[2] * j]); });
    for (const [a, b, c] of fs) tri(P[a], P[b], P[c], typeof col === 'function' ? col(ICO.V[a], ICO.V[b], ICO.V[c]) : col, kind, o.vary); }
  function prism(tri, m, n, r0, r1, y0, y1, col, kind, cap) { for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832;
      const p = (r, a, y) => M4.pt(m, [Math.cos(a) * r, y, Math.sin(a) * r]); const A = p(r0, a0, y0), B = p(r0, a1, y0), Cc = p(r1, a1, y1), D = p(r1, a0, y1);
      tri(A, B, Cc, col, kind); tri(A, Cc, D, col, kind); if (cap) tri(D, Cc, M4.pt(m, [0, y1, 0]), col, kind); } }

  /* ---- the island ---- */
  const vnoise = (x, z) => { const h = (i, j) => { let n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return n - Math.floor(n); }; const xi = Math.floor(x), zi = Math.floor(z); let fx = x - xi, fz = z - zi; fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
    return (h(xi, zi) * (1 - fx) + h(xi + 1, zi) * fx) * (1 - fz) + (h(xi, zi + 1) * (1 - fx) + h(xi + 1, zi + 1) * fx) * fz; };
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const H = (x, z) => { const r = Math.hypot(x * .9, z * 1.05); let h = sm(6.7, 2, r) * 1.7 - .5; h += (vnoise(x * .5 + 3, z * .5 + 1) - .5) * 1.2 * sm(7, 3, r) + (vnoise(x * 1.3, z * 1.3 + 5) - .5) * .35 * sm(6.5, 4, r);
    h += 2.5 * Math.exp(-((x + 1.1) ** 2 + (z + 1.9) ** 2) / 3.4); h += 1.0 * Math.exp(-((x - 3.3) ** 2 + (z - .7) ** 2) / 1.5); return h; };
  mesh('island', tri => { const N = 44, R = 7.6, st = 2 * R / N; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const x = -R + i * st, z = -R + j * st;
      const P = [[x, H(x, z), z], [x + st, H(x + st, z), z], [x + st, H(x + st, z + st), z + st], [x, H(x, z + st), z + st]]; const flip = (i + j) % 2;
      for (const T of (flip ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 3], [1, 2, 3]])) { const a = P[T[0]], b = P[T[1]], c = P[T[2]]; const hy = (a[1] + b[1] + c[1]) / 3; if (Math.max(a[1], b[1], c[1]) < -.35) continue;
        const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2]; let ny = Math.abs(uz * vx - ux * vz) / Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
        const col = hy < .16 ? C.sand : ny < .74 || hy > 2.5 ? (rnd() < .5 ? C.stone : C.stone2) : (rnd() < .5 ? C.grass : C.grass2); tri(a, b, c, col, .2, .05); } } });
  /* ---- the sea: rings that widen with distance ---- */
  mesh('sea', tri => { const rings = [0]; let r = 1.2; while (r < 210) { rings.push(r); r *= 1.17; r += .25; } const n = 56;
    for (let k = 0; k < rings.length - 1; k++) for (let i = 0; i < n; i++) { const o0 = k * .056, o1 = (k + 1) * .056, a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832, r0 = rings[k], r1 = rings[k + 1];   /* each ring is turned a little, and shares its points with the next */
        const A = [Math.cos(a0 + o0) * r0, 0, Math.sin(a0 + o0) * r0], B = [Math.cos(a1 + o0) * r0, 0, Math.sin(a1 + o0) * r0], Cc = [Math.cos(a1 + o1) * r1, 0, Math.sin(a1 + o1) * r1], D = [Math.cos(a0 + o1) * r1, 0, Math.sin(a0 + o1) * r1];
        if (k > 0) tri(A, B, Cc, rnd() < .5 ? C.sea : C.sea2, .4, .05); tri(A, Cc, D, rnd() < .5 ? C.sea : C.sea2, .4, .05); } }, { cast: false });
  /* ---- the lighthouse ---- */
  const LH = [3.3, H(3.3, .7) - .1, .7]; const lamp = [LH[0], LH[1] + 4.55, LH[2]];
  mesh('lighthouse', tri => { const m = M4.trs(LH); const segs = 5, h = 3.9; for (let i = 0; i < segs; i++) { const t0 = i / segs, t1 = (i + 1) / segs; prism(tri, m, 10, .66 - .26 * t0, .66 - .26 * t1, h * t0, h * t1, i % 2 ? C.red : C.cream, .2); }
    prism(tri, m, 10, .62, .62, h, h + .14, C.dark, .2, true); prism(tri, m, 8, .3, .3, h + .14, h + .2, C.dark, .2); prism(tri, m, 8, .34, 0, h + .78, h + 1.25, C.red, .2);
    const d = M4.trs([LH[0] - .66, LH[1], LH[2]]); tri(M4.pt(d, [-.01, 0, -.16]), M4.pt(d, [-.01, 0, .16]), M4.pt(d, [.05, .62, .14]), C.dark, .2); tri(M4.pt(d, [-.01, 0, -.16]), M4.pt(d, [.05, .62, .14]), M4.pt(d, [.05, .62, -.14]), C.dark, .2); });
  mesh('lamp', tri => { prism(tri, M4.trs(LH), 8, .29, .29, 4.1, 4.68, C.star, .6); }, { cast: false });
  const beam = mesh('beam', tri => { const L = 8; tri([0, 0, 0], [L, .42, 0], [L, -.42, 0], C.beam, .6, 0); tri([0, 0, 0], [L, 0, .42], [L, 0, -.42], C.beam, .6, 0); }, { cast: false, lamp });
  /* ---- the seal on its rock, balancing a star ---- */
  const SR = [-3.1, 0, 4.5];
  mesh('rock', tri => { blob(tri, M4.trs([SR[0], .12, SR[2]], .3, 0, 0, [1.9, .78, 1.6]), C.rock, .2, { jit: .16, vary: .1 }); blob(tri, M4.trs([SR[0] + 1.5, -.05, SR[2] + .5], 1, 0, 0, [.6, .35, .5]), C.rock, .2, { jit: .2, coarse: true, vary: .1 }); blob(tri, M4.trs([SR[0] - 1.3, -.08, SR[2] - .7], 2, 0, 0, [.5, .3, .6]), C.rock, .2, { jit: .2, coarse: true, vary: .1 }); });
  const sealParts = tri => { const body = M4.trs([0, .95, 0], 0, .38, 0, [.56, 1.02, .52]); blob(tri, body, (a, b, c) => ((a[0] + b[0] + c[0]) / 3 < -.25 && (a[1] + b[1] + c[1]) / 3 < .75 ? C.belly : C.seal), .2, { shape: p => [p[0] * (1.12 - .28 * p[1]), p[1], p[2] * (1.12 - .28 * p[1])], vary: .04 });
    blob(tri, M4.trs([-.5, 1.92, 0], 0, .2, 0, [.4, .36, .36]), C.seal, .2, { vary: .04 }); blob(tri, M4.trs([-.84, 1.9, 0], 0, .15, 0, [.2, .17, .2]), C.seal, .2, { coarse: true, vary: .04 });
    blob(tri, M4.trs([-1.02, 1.96, 0], 0, 0, 0, .07), C.dark, .2, { coarse: true, vary: 0 }); for (const s of [-1, 1]) { blob(tri, M4.trs([-.62, 2.08, .26 * s], 0, 0, 0, .055), C.dark, .2, { coarse: true, vary: 0 });
      blob(tri, M4.trs([-.5, .82, .56 * s], .5 * s, -.5, 0, [.52, .1, .22]), C.flip, .2, { coarse: true, vary: .05 }); blob(tri, M4.trs([.78, .22, .26 * s], -.35 * s, .25, 0, [.5, .09, .2]), C.flip, .2, { coarse: true, vary: .05 }); } };
  const seal = mesh('seal', sealParts, { base: [SR[0], .78, SR[2]] });
  const star = mesh('star', tri => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .13 : .32; pts.push([Math.cos(a) * r, -Math.sin(a) * r]); }
    for (let i = 0; i < 10; i++) { const p = pts[i], q = pts[(i + 1) % 10]; tri([0, 0, .1], [p[0], p[1], 0], [q[0], q[1], 0], C.star, .6, .08); tri([0, 0, -.1], [q[0], q[1], 0], [p[0], p[1], 0], C.star, .6, .08); } }, { base: [SR[0] - 1.5, 4.25, SR[2] + .82] });
  /* ---- pines ---- */
  mesh('pines', tri => { for (const [x, z, s] of [[-.2, 2.6, 1], [.9, 2.9, .8], [1.9, -2.6, 1.1], [-3.4, -1.2, .9], [-2.6, .9, 1.15], [.6, -3.9, .85], [4.3, -1.6, .8], [-1.6, 3.1, .7], [2.2, 3.0, .9]]) { const y = H(x, z) - .05, m = M4.trs([x, y, z], rnd() * 6, 0, 0, s);
      prism(tri, m, 5, .1, .08, 0, .5, C.trunk, .2); prism(tri, m, 6, .62, 0, .4, 1.35, C.pine, .2); prism(tri, m, 6, .46, 0, .95, 1.85, C.pine2, .2); prism(tri, m, 6, .3, 0, 1.45, 2.2, C.pine, .2); } });
  /* ---- the kite, tied to the lighthouse rail ---- */
  const kite = mesh('kite', tri => { const T = [0, .95, 0], R = [.62, .2, 0], B = [0, -1.05, 0], L = [-.62, .2, 0], O = [0, .2, .12]; tri(T, O, L, C.rose, .2, 0); tri(T, R, O, C.star, .2, 0); tri(L, O, B, C.blue, .2, 0); tri(O, R, B, C.navy, .2, 0);
    for (let i = 0; i < 3; i++) { const y = -1.35 - i * .42, x = Math.sin(i * 2.1) * .14, col = i % 2 ? C.star : C.rose; tri([x - .2, y + .12, 0], [x, y, 0], [x - .2, y - .12, 0], col, .2, 0); tri([x + .2, y + .12, 0], [x, y, 0], [x + .2, y - .12, 0], col, .2, 0); } }, { cast: true });
  const string = mesh('string', tri => { tri([0, 0, 0], [1, 0, 0], [1, .035, 0], C.dark, .2, 0); tri([0, 0, 0], [1, .035, 0], [0, .035, 0], C.dark, .2, 0); }, { cast: false, from: [LH[0], LH[1] + 4.0, LH[2] + .6] });
  /* ---- a paper boat and three cranes ---- */
  const boat = mesh('boat', tri => { const bow = [1.1, .34, 0], stern = [-1.1, .34, 0], keel = [0, -.14, 0], pk = [0, 1.05, 0]; for (const s of [-1, 1]) { const side = [0, .3, .42 * s]; tri(bow, keel, side, C.paper, .2, .05); tri(stern, side, keel, C.paper, .2, .05); tri(bow, side, [.2, .3, 0], C.cream, .2, .03); tri(stern, [-.2, .3, 0], side, C.cream, .2, .03); }
    tri([-.5, .3, 0], [.5, .3, 0], pk, C.paper, .2, 0); tri([-.5, .3, .02], pk, [.5, .3, .02], C.rose, .2, 0); });
  const cranes = []; for (let i = 0; i < 3; i++) { const body = mesh('crane', tri => { tri([.62, .16, 0], [0, .12, .1], [0, -.1, 0], C.paper, .2, .04); tri([.62, .16, 0], [0, -.1, 0], [0, .12, -.1], C.paper, .2, .04); tri([-.6, .22, 0], [0, -.1, 0], [0, .12, .1], C.paper, .2, .04); tri([-.6, .22, 0], [0, .12, -.1], [0, -.1, 0], C.paper, .2, .04); tri([.62, .16, 0], [.82, .02, 0], [.6, .1, .03], C.rose, .2, 0); });
    const wl = mesh('wing', tri => { tri([.28, .1, 0], [-.3, .1, 0], [-.05, .12, .95], C.paper, .2, .05); }), wr = mesh('wing', tri => { tri([.28, .1, 0], [-.05, .12, -.95], [-.3, .1, 0], C.paper, .2, .05); }); cranes.push({ body, wl, wr, ph: i * 2.1, r: 9.5 + i * 2.2, y: 6.2 + i * .9, sp: .16 - i * .02 }); }
  /* ---- clouds ---- */
  const clouds = []; for (let i = 0; i < 6; i++) { const ob = mesh('cloud', tri => { const n = 3 + (rnd() * 2 | 0); for (let k = 0; k < n; k++) blob(tri, M4.trs([(k - n / 2) * 1.5 + rnd(), rnd() * .5, rnd() * 1.2], rnd() * 6, 0, 0, [1.4 + rnd() * .9, .75 + rnd() * .4, 1.1 + rnd() * .6]), C.cloud, .25, { coarse: true, jit: .12, vary: .03 }); }, { cast: false });
    clouds.push({ ob, a: i * 1.05 + rnd(), r: 17 + rnd() * 16, y: 8.5 + rnd() * 4, s: .8 + rnd() * .7 }); }
  return { objs, H, lamp, beam, seal, star, kite, string, boat, cranes, clouds, LH, SR };
}

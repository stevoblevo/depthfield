/* Saelion Rock · shaders. The scene is drawn once into a G-buffer (flat colour, facet normal, shadow, depth);
   every look is a material: a process over that one drawing, the family's Media contract, run on the GPU each frame. */
const GV = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aCol; layout(location=2) in float aKind;
uniform mat4 uModel, uVP; uniform float uTime;
out vec3 vW; flat out vec3 vCol; out float vKind;
void main(){
  vec4 w = uModel * vec4(aPos, 1.);
  if (aKind > .3 && aKind < .5) { float k = smoothstep(4., 16., length(w.xz)) * .85 + .2;
    w.y += k * (.12 * sin(w.x * .55 + uTime * 1.1) + .09 * sin(w.z * .7 - uTime * .9) + .05 * sin((w.x + w.z) * 1.3 + uTime * 1.6)); }
  vW = w.xyz; vCol = aCol; vKind = aKind; gl_Position = uVP * w;
}`;
const GF = `#version 300 es
precision highp float;
in vec3 vW; flat in vec3 vCol; in float vKind;
uniform vec3 uCam; uniform mat4 uLightVP; uniform highp sampler2D uShadow;
layout(location=0) out vec4 o0; layout(location=1) out vec4 o1;
void main(){
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW))); if (dot(n, uCam - vW) < 0.) n = -n;
  if (vKind > .3 && vKind < .5) n = normalize(mix(n, vec3(0., 1., 0.), smoothstep(14., 70., distance(uCam, vW)) * .85 + .1));   /* the far sea lies calm */
  float sh = 1.;
  if (vKind < .55) { vec4 lp = uLightVP * vec4(vW + n * .07, 1.); vec3 p = lp.xyz / lp.w * .5 + .5;
    if (p.x > 0. && p.x < 1. && p.y > 0. && p.y < 1. && p.z < 1.) { float s = 0.; vec2 e = vec2(1. / 1024.);
      s += step(p.z - .003, texture(uShadow, p.xy + vec2(-.5, -.5) * e).r); s += step(p.z - .003, texture(uShadow, p.xy + vec2(.5, -.5) * e).r);
      s += step(p.z - .003, texture(uShadow, p.xy + vec2(-.5, .5) * e).r); s += step(p.z - .003, texture(uShadow, p.xy + vec2(.5, .5) * e).r); sh = s * .25; } }
  o0 = vec4(vCol, vKind); o1 = vec4(n * .5 + .5, sh);
}`;
/* the pets: the kits' own drawings, stood up in the world as cut-outs and then made in the look's material like everything else */
const BV = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec2 aUv; uniform mat4 uVP; out vec2 vUv; out vec3 vW;
void main(){ vUv = aUv; vW = aPos; gl_Position = uVP * vec4(aPos, 1.); }`;
const BF = `#version 300 es
precision highp float;
in vec2 vUv; in vec3 vW; uniform sampler2D uTex; uniform vec3 uCam;
layout(location=0) out vec4 o0; layout(location=1) out vec4 o1;
void main(){ vec4 t = texture(uTex, vUv); if (t.a < .5) discard; vec3 n = normalize(vec3(uCam.x - vW.x, 0., uCam.z - vW.z)); o0 = vec4(t.rgb, .8); o1 = vec4(n * .5 + .5, 1.); }`;
const SF = `#version 300 es
precision highp float; void main(){}`;
const PV = `#version 300 es
layout(location=0) in vec2 aP; out vec2 vUv; void main(){ vUv = aP * .5 + .5; gl_Position = vec4(aP, 0., 1.); }`;

const PF = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 outC;
uniform sampler2D uAlb, uNrm; uniform highp sampler2D uDepth;
uniform vec2 uRes; uniform float uTime, uBeat, uWipe, uPx, uNear, uFar, uPA, uPB, uLampOn, uFocus;
uniform mat4 uInvVP; uniform vec3 uCam, uSun, uMoon, uLight, uLamp, uTap; uniform vec2 uWipeC;
uniform int uMatA, uMatB; uniform vec3 uCA[8], uCB[8];

const float PI = 3.14159265;
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= .5; } return s; }
float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }
float lin(float d){ return uNear * uFar / (uFar - d * (uFar - uNear)); }

struct S { vec3 alb; float kind; vec3 n; float sh; float d; vec3 w; vec3 dir; float sky; float lit; float dist; };
S fetch(vec2 uv){
  S s; vec4 a = texture(uAlb, uv), n = texture(uNrm, uv); s.alb = a.rgb; s.kind = a.a; s.n = normalize(n.rgb * 2. - 1.); s.sh = n.a; s.d = texture(uDepth, uv).r;
  vec4 p = uInvVP * vec4(uv * 2. - 1., s.d * 2. - 1., 1.); s.w = p.xyz / p.w; s.dir = normalize(s.w - uCam); s.dist = length(s.w - uCam);
  s.sky = step(.99999, s.d); s.lit = max(dot(s.n, uLight), 0.) * s.sh; if (s.kind > .22 && s.kind < .3) s.lit = mix(s.lit, 1., .7);   /* clouds are lit from within */
  if (s.kind > .75) s.lit = .85;   /* a pet is already a finished drawing */
  return s;
}
bool isSea(S s){ return s.kind > .3 && s.kind < .5; }
bool isGlow(S s){ return s.kind > .55 && s.kind < .7; }
/* x: a silhouette (depth step), y: a crease (normal step) */
vec2 edge2(vec2 uv, float w){
  /* 1 - depth is linear across any flat surface on screen, so its second difference is zero on a plane however steeply it is seen,
     and large only where one thing stands in front of another */
  vec2 e = w / uRes; float d0 = 1. - texture(uDepth, uv).r; vec3 n0 = texture(uNrm, uv).rgb; float kn = 0.;
  float xa = 1. - texture(uDepth, uv + vec2(e.x, 0.)).r, xb = 1. - texture(uDepth, uv - vec2(e.x, 0.)).r, ya = 1. - texture(uDepth, uv + vec2(0., e.y)).r, yb = 1. - texture(uDepth, uv - vec2(0., e.y)).r;
  float kd = max(abs(xa + xb - 2. * d0), abs(ya + yb - 2. * d0)) / max(max(d0, max(xa, xb)), max(ya, yb) + 1e-6);
  kn = max(max(distance(n0, texture(uNrm, uv + vec2(e.x, 0.)).rgb), distance(n0, texture(uNrm, uv - vec2(e.x, 0.)).rgb)), max(distance(n0, texture(uNrm, uv + vec2(0., e.y)).rgb), distance(n0, texture(uNrm, uv - vec2(0., e.y)).rgb)));
  return vec2(smoothstep(.035, .12, kd), smoothstep(.2, .5, kn));
}
/* the sun's own flat coordinates: (0,0) its centre, 1 = one radian */
vec2 sunP(vec3 dir, vec3 s){ vec3 r = normalize(cross(s, vec3(0., 1., 0.))); vec3 u = cross(r, s); return vec2(dot(dir, r), dot(dir, u)); }
float disc(vec3 dir, vec3 s, float rad){ float a = acos(clamp(dot(dir, s), -1., 1.)); return smoothstep(rad, rad - .004, a); }
float stars(vec3 dir, float dens){ vec2 q = dir.xz / (abs(dir.y) + .35) * 70.; vec2 id = floor(q); vec2 f = fract(q) - .5; float r = h21(id);
  return step(1. - dens, r) * smoothstep(.22, .0, length(f + (vec2(h21(id + 1.7), h21(id + 9.2)) - .5) * .5)) * (.6 + .4 * sin(uTime * 2. + r * 60.)) * step(0., dir.y); }

/* ===== Storeybrook ===== */
/* Meta Daylight: a wash. Pigment sits in the paper, blooms, pools at its edge; pencil shows a little off the wash. */
vec3 mWash(vec2 uv, vec3 c[8]){
  vec2 q = uv * uRes / uPx; vec2 wob = (vec2(fbm(q * .018), fbm(q * .018 + 9.)) - .5) * 7. * uPx / uRes;
  S s = fetch(uv + wob); float grain = fbm(q * .33), tooth = vn(q * 1.6); vec3 paper = c[0] * (.965 + .06 * grain), col;
  if (s.sky > .5) { float cl = fbm(s.dir.xz / (abs(s.dir.y) + .25) * 1.3 + uTime * .012);
    col = mix(paper, c[3], smoothstep(-.05, .8, s.dir.y) * (.35 + .65 * cl) * .9);
    float a = acos(clamp(dot(s.dir, uSun), -1., 1.)); col = mix(col, c[4], smoothstep(.28, .05, a) * .32); col = mix(col, mix(c[4], vec3(1.), .35), smoothstep(.066, .056, a + (tooth - .5) * .012)); }
  else { vec3 pig = s.alb; if (isSea(s)) pig = mix(c[5], s.alb, .4); if (isGlow(s)) pig = c[4];
    float wet = mix(.5, 1., fbm(q * .011 + 3.)); col = paper * mix(vec3(1.), pig * (.62 + .62 * s.lit) * 1.22, wet);
    col *= 1. - .16 * tooth * (1. - lum(pig)); vec2 ed = edge2(uv + wob, 1.6 * uPx); col *= 1. - .3 * ed.x; }
  vec2 e2 = edge2(uv + wob + vec2(1.8, 1.3) * uPx / uRes, 1.1 * uPx);
  return mix(col, c[1], .42 * max(e2.x, e2.y * .5) * (.55 + .45 * tooth));
}
/* Knight Night: lamplight. The world dims to the night's paper; the lamp and the moon pick it out in gold. */
vec3 mLamp(vec2 uv, vec3 c[8]){
  S s = fetch(uv); vec2 q = uv * uRes / uPx; float grain = fbm(q * .33); vec3 col;
  if (s.sky > .5) { col = mix(c[0] * 1.25, c[0] * .78, smoothstep(-.05, .8, s.dir.y)); col += c[2] * stars(s.dir, .012);
    float a = acos(clamp(dot(s.dir, uMoon), -1., 1.)); col = mix(col, c[2], smoothstep(.3, .04, a) * .22);
    float m = smoothstep(.062, .056, a); vec2 mp = sunP(s.dir, uMoon) / .06; col = mix(col, mix(c[1], c[0], .25 * step(.55, vn(mp * 2.3 + 4.))), m); }
  else { vec3 base = mix(c[0], s.alb, .5) * (.3 + .55 * s.lit); if (isSea(s)) base = mix(c[0] * .9, c[4] * .5, .35) * (.6 + .5 * s.lit);
    vec3 L = uLamp - s.w; float dl = length(L); float att = uLampOn * max(dot(s.n, L / dl), 0.) / (1. + dl * dl * .035);
    col = base + c[2] * att * .95 * mix(vec3(1.), s.alb, .5); if (isGlow(s)) col = mix(c[2], vec3(1.), .3);
    vec2 ed = edge2(uv, 1.5 * uPx); col += c[2] * ed.x * .35 * (.3 + att * 2.); }
  vec2 lp = vec2(0.); return col * (.94 + .1 * grain);
}
/* Ink Blot: brush ink. Darks are solid, the rest is stippled by tone, a heavy line holds the shapes. */
vec3 mInk(vec2 uv, vec3 c[8]){
  S s = fetch(uv); float tone;
  if (s.sky > .5) { float a = acos(clamp(dot(s.dir, uSun), -1., 1.)); tone = 1. - .5 * smoothstep(.07, .02, a) * step(a, .066) - .9 * smoothstep(.006, .0, abs(a - .066)); tone = min(tone, 1. - .12 * smoothstep(.35, -.05, s.dir.y)); }
  else { tone = clamp(lum(s.alb) * (.5 + .85 * s.lit) + .1, 0., 1.); if (isSea(s)) tone = clamp(.86 - .16 * step(.72, fract(s.w.z * .8 + .3 * sin(s.w.x * .5) + uTime * .15)) - .3 * (1. - s.sh), 0., 1.); if (isGlow(s)) tone = 1.; }
  float cs = 4.2 * uPx; vec2 g = uv * uRes / cs; vec2 id = floor(g), f = fract(g) - .5; vec2 jit = (vec2(h21(id + 3.1), h21(id + 7.7)) - .5) * .7;
  float dark = 1. - tone, rad = sqrt(clamp(dark * 1.1, 0., 1.)) * .66; float ink = tone < .27 ? 1. : smoothstep(rad, rad - .16, length(f - jit)) * step(.05, dark);
  vec2 ed = edge2(uv, 1.7 * uPx); ink = max(ink, max(ed.x, ed.y * (isSea(s) ? .0 : .85)) * (1. - s.sky * .0));
  return mix(c[0], c[1], clamp(ink, 0., 1.));
}
/* Comix: print. Flat colour a hair off register, Ben-Day dots in the shade, a heavy line, a burst round the sun. */
vec3 mPrint(vec2 uv, vec3 c[8]){
  vec2 off = vec2(2.2, 1.4) * uPx / uRes; S s = fetch(uv); S r = fetch(uv + off); vec3 col;
  float ang = .6; mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)); vec2 g = R * (uv * uRes / (5.5 * uPx)); vec2 f = fract(g) - .5;
  if (s.sky > .5) { float t = smoothstep(-.05, .9, s.dir.y); col = mix(c[0], c[4], step(length(f), .5 * t * .85) * .55);
    vec2 sp = sunP(s.dir, uSun); float a = length(sp); float th = atan(sp.y, sp.x); float burst = step(a, .1 + .035 * step(.5, fract(th / PI * 7. + uTime * .05)));
    col = mix(col, c[3], step(a, .15) * burst); col = mix(col, c[3], step(a, .066)); col = mix(col, c[1], smoothstep(.006, .003, abs(a - .066)) + step(a, .15) * burst * smoothstep(.006, .003, abs(a - (.1 + .035 * step(.5, fract(th / PI * 7. + uTime * .05)))))); }
  else { float st = floor(s.lit * 2.6 + .6) / 3.; vec3 a = s.alb, b = r.sky > .5 ? s.alb : r.alb; vec3 fc = vec3(b.r, a.g, a.b);
    fc = mix(vec3(lum(fc)), fc, 1.35) * (.74 + .42 * st); if (isSea(s)) fc = mix(c[4], fc, .45); if (isGlow(s)) fc = c[3];
    float dk = clamp(1. - st * 1.35, 0., 1.); col = mix(fc, c[1], step(length(f), .36 * sqrt(dk)) * .45); }
  vec2 ed = edge2(uv, 2.3 * uPx); float line = max(ed.x, ed.y * (isSea(s) ? .25 : 1.));
  return mix(col, c[1], line);
}
/* Origami: cut paper. Every facet is a fold lit from one side; creases catch light, sheets throw shadows, fibres lie over it. */
vec3 mPaper(vec2 uv, vec3 c[8]){
  S s = fetch(uv); vec2 q = uv * uRes / uPx; vec3 col;
  float fib = fbm(vec2(q.x * .9, q.y * .12) + 3.) * .5 + fbm(vec2(q.x * .12, q.y * .9)) * .5;
  if (s.sky > .5) { col = mix(c[6], c[0], smoothstep(-.1, .7, s.dir.y)); vec2 gq = q / 26.; float gl = max(step(.96, fract(gq.x)), step(.96, fract(gq.y))); col = mix(col, c[7], gl * .35);
    vec2 sp = sunP(s.dir, uSun); float a = length(sp), th = atan(sp.y, sp.x); float pleat = fract(th / PI * 6. + .25); float tone = .78 + .22 * step(.5, pleat) + .1 * (pleat - .5);
    float rr = .074 + .014 * abs(pleat - .5) * 2.; col = mix(col, c[4] * tone, step(a, rr)); col = mix(col, c[1], smoothstep(.004, .0015, abs(a - rr)) * .5);
    col *= 1. - .18 * smoothstep(.03, .0, a - rr) * step(rr, a) * step(sp.y + sp.x * .4, 0.); }
  else { vec3 base = s.alb; if (isSea(s)) base = mix(c[5], s.alb, .5); if (isGlow(s)) base = c[4];
    float facet = h21(floor(s.n.xy * 31.) + floor(s.n.z * 17.) + floor(base.rg * 9.)); col = base * (.56 + .58 * s.lit) * (.95 + .1 * facet) + c[0] * .06;
    vec2 ed = edge2(uv, 1.3 * uPx); vec2 eh = edge2(uv - vec2(1.4, -1.4) * uPx / uRes, 1.2 * uPx);
    col *= 1. - .3 * ed.y * (isSea(s) ? .22 : 1.); col += .16 * eh.y * (1. - ed.y) * (isSea(s) ? 0. : 1.); col *= 1. - .32 * ed.x * (isSea(s) ? .4 : 1.); }
  return col * (.95 + .09 * fib);
}
/* Skein silk: cross-stitch. The world is counted out in stitches on the cloth, a running stitch round the edge. */
vec3 mStitch(vec2 uv, vec3 c[8]){
  float cs = 7.5 * uPx; vec2 g = uv * uRes / cs; vec2 id = floor(g), f = fract(g); S s = fetch((id + .5) * cs / uRes);
  vec3 cloth = c[0] * (.95 + .05 * sin(g.x * 6.2832) * sin(g.y * 6.2832)) * (.97 + .05 * vn(g * 3.)), col = cloth; vec3 th = vec3(0.); float on = 0.;
  if (s.sky > .5) { float a = acos(clamp(dot(s.dir, uSun), -1., 1.)); if (a < .07) { th = c[4]; on = 1.; } else if (a < .12 && h21(id) > .55) { th = c[2]; on = 1.; }
    else if (s.dir.y > .12 && fbm(s.dir.xz / (s.dir.y + .25) * 1.4 + uTime * .01) > .62) { th = mix(c[5], c[3], .5); on = 1.; } }
  else { th = s.alb * (.66 + .5 * s.lit); if (isSea(s)) th = mix(th, c[3] * .9, .25) * (.9 + .15 * step(.5, h21(id + floor(uTime * .7)))); if (isGlow(s)) th = c[4]; on = 1.; }
  if (on > .5) { float m = step(.1, f.x) * step(f.x, .9) * step(.1, f.y) * step(f.y, .9); float d1 = abs(f.x - f.y), d2 = abs(f.x + f.y - 1.);
    col = mix(col, th * .74, smoothstep(.2, .11, d1) * m); col = mix(col, th * (1.02 + .1 * (f.y - .5)), smoothstep(.2, .11, d2) * m); }
  vec2 px = uv * uRes; float bd = min(min(px.x, uRes.x - px.x), min(px.y, uRes.y - px.y)) / uPx; float along = (min(px.x, uRes.x - px.x) < min(px.y, uRes.y - px.y)) ? px.y : px.x;
  col = mix(col, c[2], smoothstep(1.6, .8, abs(bd - 12.)) * step(.42, fract(along / (13. * uPx))));
  return col;
}

/* ===== Hypermetapunk ===== */
vec3 hmpBand(float k, vec3 c[8]){ k = clamp(k, 0., 1.08);
  if (k < .34) return mix(c[0], c[1], k / .34); if (k < .52) return mix(c[1], c[2], (k - .34) / .18); if (k < .72) return mix(c[2], c[3], (k - .52) / .2);
  if (k < .9) return mix(c[3], c[4], (k - .72) / .18); return mix(c[4], c[5], (k - .9) / .18); }
/* Dusk: a neon halftone. Toner-band sky, the banded sun, a grid floor running to the horizon, tube-light outlines, a slipped magenta plate. */
vec3 mNeon(vec2 uv, vec3 c[8]){
  S s = fetch(uv); vec2 px = uv * uRes / uPx; vec3 col;
  if (s.sky > .5) { float k = 1. - clamp(s.dir.y / .75, 0., 1.); col = hmpBand(floor(pow(k, 2.3) * 13.) / 13. * .92, c);
    vec2 sp = sunP(s.dir, uSun); float a = length(sp), R = .17; float y = sp.y / R; float bars = step(.0, y) + step(y, 0.) * step(.5 - .32 * (-y), fract(-y * 4.6));
    vec3 sc = mix(c[3], c[5], smoothstep(-.9, .9, y)); col = mix(col, sc, step(a, R) * bars); col += c[3] * smoothstep(.5, .17, a) * .16 * step(R, a); }
  else if (isSea(s)) { vec2 gq = s.w.xz / 2.4; vec2 gl = abs(fract(gq) - .5) / fwidth(gq); float line = 1. - min(min(gl.x, gl.y) * .7, 1.); float far = smoothstep(120., 12., s.dist);
    col = mix(c[1], c[0], smoothstep(8., 70., s.dist)); col += c[3] * line * far * 1.1; col += c[6] * line * far * .35 * uBeat;
    vec2 sp = sunP(reflect(s.dir, vec3(0., 1., 0.)), uSun); col += mix(c[4], c[5], .5) * smoothstep(.2, .0, abs(sp.x)) * smoothstep(.5, .0, sp.y) * .35 * step(.5, fract(s.dist * .5 - uTime * .4)); }
  else { float t = clamp(lum(s.alb) * (.42 + .85 * s.lit), 0., 1.); if (isGlow(s)) t = 1.;
    float cs = 6.; vec2 g = px / cs; g.x += .5 * mod(floor(g.y), 2.); float r = length(fract(g) - .5);
    vec3 dc = t > .72 ? c[5] : t > .5 ? c[4] : t > .3 ? c[3] : c[2]; col = mix(c[0] * .9, dc, step(r, .2 + .32 * t));
    if (isGlow(s)) col = mix(c[5], vec3(1.), .4); }
  vec2 ed = edge2(uv, 1.5 * uPx), eg = edge2(uv, 4.5 * uPx), em = edge2(uv - vec2(3., 2.) * uPx / uRes, 1.5 * uPx);
  float sea = isSea(s) ? 0. : 1.; col = mix(col, c[7], em.x * .9); col += c[6] * eg.x * .3; col = mix(col, c[6], max(ed.x, ed.y * .55 * sea));
  col *= 1. - .115 * step(3., mod(px.y, 5.)); float gr = h21(floor(px * .5) + floor(uTime * 12.)); return col * (.9 + .2 * gr);
}
/* Zine: a xerox with one red. Darks go to toner, middle tones to the one spot colour off register, lights stay paper. */
vec3 mXerox(vec2 uv, vec3 c[8]){
  vec2 off = vec2(3., 2.) * uPx / uRes; S s = fetch(uv), r = fetch(uv - off); vec2 px = uv * uRes / uPx; float sp = h21(floor(px * .7) + 11.);
  vec3 col = c[0];
  float tone = 1., rt = 1.;
  if (s.sky < .5) { tone = clamp(lum(s.alb) * (.55 + .8 * s.lit) + .1, 0., 1.); if (isSea(s)) tone = .52 + .2 * s.lit + .16 * step(.55, fract(s.w.z * .9 + .3 * sin(s.w.x * .7) + uTime * .25)); if (isGlow(s)) tone = 1.; }
  else { vec2 q = sunP(s.dir, uSun); if (length(q) < .09) tone = .6; }
  if (r.sky < .5) { rt = clamp(lum(r.alb) * (.55 + .8 * r.lit) + .1, 0., 1.); if (isSea(r)) rt = .6; if (isGlow(r)) rt = 1.; } else { vec2 q = sunP(r.dir, uSun); if (length(q) < .09) rt = .6; }
  if (s.sky < .5 && tone >= .74) col = c[3];
  col = mix(col, c[2], step(.44, rt) * step(rt, .74));
  col = mix(col, c[1], step(tone, .44) * step(.03, 1. - s.sky + step(tone, .0)));
  vec2 ed = edge2(uv, 1.9 * uPx); col = mix(col, c[1], max(ed.x, ed.y * (isSea(s) ? 0. : .8)));
  col = mix(col, c[1], step(.992, sp) * .7); col = mix(col, c[0], step(sp, .008) * .8);
  float streak = step(.992, h21(vec2(floor(px.x / 2.), 3.))); return mix(col, c[1], streak * .08) * (.96 + .06 * h21(floor(px) + floor(uTime * 8.)));
}
/* High contrast: a solid cut. White on black with an acid keyline; nothing is lost and nothing shimmers. */
vec3 mSolid(vec2 uv, vec3 c[8]){
  S s = fetch(uv); vec3 col = c[0];
  if (s.sky > .5) { col = mix(col, c[1], disc(s.dir, uSun, .075)); }
  else if (isSea(s)) { col = mix(c[0], c[1], step(.94, fract(s.w.z * .45 + .25 * sin(s.w.x * .6) + uTime * .12)) * smoothstep(70., 16., s.dist)); }
  else { col = mix(c[0], c[1], step(.16, s.lit)); if (isGlow(s)) col = c[2]; }
  vec2 ed = edge2(uv, 1.6 * uPx), ek = edge2(uv, 4. * uPx); float inner = ed.y * (isSea(s) ? 0. : 1.);
  col = mix(col, lum(col) > .5 ? c[0] : c[1], inner); return mix(col, c[2], max(ek.x * (1. - s.sky), ed.x) * (isSea(s) ? 0. : 1.));
}

/* ===== Depthfield ===== */
float df_wx(vec2 uv, float kind, out vec3 tint){
  vec2 px = uv * uRes / uPx; float m = 0.; tint = vec3(1.);
  if (kind > 2.5) { for (int i = 0; i < 9; i++) { float fi = float(i); vec2 p = vec2(fract(h21(vec2(fi, 1.)) + .03 * sin(uTime * .3 + fi)), fract(h21(vec2(fi, 7.)) * .5 + .08 * sin(uTime * .21 + fi * 2.)));
      float d = length((uv - p) * uRes / uPx); m += smoothstep(9., 0., d) * (.5 + .5 * sin(uTime * 1.7 + fi * 3.)); } }
  else if (kind > 1.5) { vec2 q = vec2(px.x + px.y * .22, px.y); vec2 id = floor(q / vec2(14., 90.)); float r = h21(vec2(id.x, 3.)); float y = fract(q.y / 90. + uTime * (1.3 + r) + r * 7.);
      m = step(.4, r) * smoothstep(1.2, .2, abs(fract(q.x / 14.) - .5) * 14.) * smoothstep(.0, .25, y) * smoothstep(.55, .25, y) * .8; }
  else if (kind > .5) { for (int i = 0; i < 12; i++) { float fi = float(i); float r = h21(vec2(fi, 2.)); vec2 p = vec2(fract(r + .05 * sin(uTime * .5 + fi) + uTime * .01), fract(1. - (uTime * (.03 + .03 * r) + h21(vec2(fi, 5.)))));
      vec2 d = (uv - p) * uRes / uPx; float a = uTime * (.6 + r) + fi; d = mat2(cos(a), -sin(a), sin(a), cos(a)) * d; m += smoothstep(5., 3.5, length(d * vec2(1., 2.1))); } }
  return clamp(m, 0., 1.);
}
/* The weathers: ridges. Distance is colour; three planes with air between them, a rim where the light lands. */
vec3 mRidge(vec2 uv, vec3 c[8], float wx){
  S s = fetch(uv); vec3 col; float nightly = step(lum(c[0]), .22);
  if (s.sky > .5) { col = mix(c[1], c[0], smoothstep(.0, .65, s.dir.y)); vec3 body = nightly > .5 ? uMoon : uSun; float a = acos(clamp(dot(s.dir, body), -1., 1.));
    col = mix(col, c[2], smoothstep(.45, .06, a) * .3); col = mix(col, c[2], smoothstep(.07, .064, a)); col += vec3(1.) * stars(s.dir, .014) * nightly; }
  else { float t = clamp((s.dist - (uFocus - 6.)) / 11.5, 0., 1.); if (isSea(s)) t = clamp((s.dist - (uFocus - 9.)) / 60., 0., 1.);
    float b = floor(t * 2.999); vec3 plane = b < .5 ? c[5] : b < 1.5 ? c[4] : c[3]; float inb = fract(t * 2.999);
    col = plane * (.74 + .46 * lum(s.alb)); col = mix(col, c[1], (t * .5 + inb * .2));
    if (isSea(s)) { col = mix(c[1], c[4], .45 + .25 * t); col += c[6] * step(.93, fract(s.w.z * .7 + .2 * sin(s.w.x) + uTime * .15)) * .14 * smoothstep(80., 10., s.dist); }
    col += c[6] * pow(s.lit, 2.) * .42 * (1. - t * .6); vec2 ed = edge2(uv, 1.4 * uPx); col = mix(col, c[6], ed.x * .5 * step(.02, s.lit) ); col *= 1. - .18 * ed.y * (isSea(s) ? 0. : 1.);
    if (isGlow(s)) col = mix(c[2], vec3(1.), .3); }
  vec3 tint; float m = df_wx(uv, wx, tint); col = mix(col, wx > 2.5 ? c[7] : wx > 1.5 ? vec3(.86, .16, .2) : c[2], m * (wx > 2.5 ? .9 : .7));
  vec2 v = uv - .5; return col * (1. - .5 * dot(v, v));
}
/* The scan: contour lines at every height, a glow, a sweep. For anything measured. */
vec3 mScan(vec2 uv, vec3 c[8]){
  S s = fetch(uv); vec2 px = uv * uRes / uPx; vec3 col = c[0];
  vec2 gq = px / 26.; col += c[1] * .07 * max(step(.96, fract(gq.x)), step(.96, fract(gq.y)));
  if (s.sky > .5) { col += c[2] * stars(s.dir, .012) * .8; float a = acos(clamp(dot(s.dir, uMoon), -1., 1.)); col += c[1] * (smoothstep(.006, .001, abs(a - .07)) + .08 * step(a, .07)); }
  else { float h = s.w.y * 3.2; float iso = isSea(s) ? length(s.w.xz) * .55 - uTime * .12 : h; float line = 1. - smoothstep(.0, 1.4, abs(fract(iso) - .5) / fwidth(iso));
    float sweep = smoothstep(.5, .0, abs(s.w.y - (mod(uTime * .7, 7.) - .5))) * (isSea(s) ? 0. : 1.);
    col += c[1] * (isSea(s) ? .035 : .13); col += c[1] * line * (isSea(s) ? .22 * smoothstep(60., 8., s.dist) : .75); col += c[2] * sweep * line * .8 + c[1] * sweep * .12;
    if (isGlow(s)) col = c[2]; }
  vec2 ed = edge2(uv, 1.4 * uPx), eg = edge2(uv, 5. * uPx); col += c[1] * eg.x * .3; col = mix(col, mix(c[1], c[2], .35), ed.x); return col;
}
/* The stage: a footlit shadow play. Everything is a silhouette with a rim; stars hang on threads. */
vec3 mStage(vec2 uv, vec3 c[8]){
  S s = fetch(uv); vec2 v = (uv - vec2(.5, -.05)) * vec2(uRes.x / uRes.y, 1.); float r = length(v); float ang = atan(v.x, v.y);
  float rays = .75 + .25 * fbm(vec2(ang * 9., uTime * .08)); vec3 warm = c[2], col = mix(mix(warm, vec3(.69, .48, .23), smoothstep(.1, .55, r)), c[0], smoothstep(.3, 1.15, r)) * rays;
  vec2 px = uv * uRes / uPx; for (int i = 0; i < 6; i++) { float fi = float(i); float x = (.1 + fi * .16) * uRes.x / uPx; float y = uRes.y / uPx * (.9 - .07 * mod(fi, 2.) - .02 * sin(uTime * .7 + fi));
    col = mix(col, c[1] * .5, smoothstep(1., .3, abs(px.x - x)) * step(y, px.y) * .5); vec2 d = px - vec2(x, y); float a = atan(d.x, d.y), st = cos(a * 5.) * .45 + .75; col = mix(col, warm, smoothstep(st * 7. + .8, st * 7., length(d))); }
  if (s.sky < .5) { vec3 sil = mix(vec3(.043, .04, .063), c[0], .2); if (isSea(s)) { sil = mix(sil, warm * .5, .28 * smoothstep(.9, .0, r) * (.6 + .4 * step(.5, fract(s.w.z * .8 + uTime * .2)))); }
    col = sil; if (isGlow(s)) col = warm; vec2 ed = edge2(uv + vec2(1.5, -1.5) * uPx / uRes, 1.6 * uPx); col = mix(col, c[1], ed.x * .85 * (isSea(s) ? .3 : 1.)); col += c[1] * .1 * edge2(uv, 1.2 * uPx).y * (isSea(s) ? 0. : 1.); }
  return col;
}
/* The deep look: a single-image stereogram of the depth buffer. Let your eyes relax past the screen until the two marks become three. */
vec3 mDeep(vec2 uv, vec3 c[8]){
  float per = clamp(96. * uPx / uRes.x, .09, .19); vec2 p = uv;
  for (int i = 0; i < 16; i++) { if (p.x < per) break; float d = lin(texture(uDepth, p).r); float z = clamp(1. - (d - uPA) / 17., 0., 1.); p.x -= per * (1. - .24 * z); }
  vec2 t = vec2(p.x / per, uv.y * uRes.y / (uRes.x * per)); vec2 id = floor(t * 26.); float r = h21(id), r2 = h21(id * 1.7 + 3.), r3 = h21(id + 9.);
  vec3 a = lum(c[0]) < .5 ? c[0] : c[1], b = lum(c[0]) < .5 ? c[1] : c[0]; vec3 col = mix(a, mix(b, c[2], step(.6, r2)), step(.45, r)); col = mix(col, c[3], step(.9, r3));
  col *= .86 + .14 * fbm(t * 9.);
  vec2 m = (uv - vec2(.5, .94)) * vec2(uRes.x / uRes.y, 1.); float mk = step(length(m - vec2(per * .5 * uRes.x / uRes.y, 0.)), .012) + step(length(m + vec2(per * .5 * uRes.x / uRes.y, 0.)), .012);
  return mix(col, vec3(1.) - step(.5, lum(col)), mk);
}

vec3 look(int m, vec2 uv, vec3 c[8], float p){
  if (m == 0) return mWash(uv, c); if (m == 1) return mLamp(uv, c); if (m == 2) return mInk(uv, c); if (m == 3) return mPrint(uv, c);
  if (m == 4) return mPaper(uv, c); if (m == 5) return mStitch(uv, c); if (m == 6) return mNeon(uv, c); if (m == 7) return mXerox(uv, c);
  if (m == 8) return mSolid(uv, c); if (m == 9) return mRidge(uv, c, p); if (m == 10) return mScan(uv, c); if (m == 11) return mStage(uv, c);
  return mDeep(uv, c);
}
void main(){
  vec3 col;
  if (uWipe <= 0.) col = look(uMatA, vUv, uCA, uPA);
  else { vec2 asp = vec2(uRes.x / uRes.y, 1.); float d = distance(vUv * asp, uWipeC * asp) + (fbm(vUv * uRes / (70. * uPx)) - .5) * .3;
    float edge = uWipe * 2.4 - d; float m = smoothstep(.0, .05, edge);
    if (m <= 0.) col = look(uMatA, vUv, uCA, uPA); else if (m >= 1.) col = look(uMatB, vUv, uCB, uPB); else col = mix(look(uMatA, vUv, uCA, uPA), look(uMatB, vUv, uCB, uPB), m);
    col += vec3(1.) * smoothstep(.06, .0, abs(edge - .03)) * .35; }
  /* a pet is the kit's own finished drawing: it keeps its inks, and takes only the look's line */
  { vec4 pa = texture(uAlb, vUv); if (pa.a > .75 && uMatB != 12) col = mix(col, pa.rgb, .8); }
  float ta = uTap.z; if (ta < 1.2) { vec2 asp = vec2(uRes.x / uRes.y, 1.); float d = distance(vUv * asp, uTap.xy * asp); float ring = smoothstep(.02, .0, abs(d - ta * .55)) * (1. - ta / 1.2); col = mix(col, vec3(1.) - col, ring * .7); }
  outC = vec4(col, 1.);
}`;

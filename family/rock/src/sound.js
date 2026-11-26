  /* ---------- sound (0.5): one piece, arranged by the kit you are in and shaped by the look's mood.
     Storeybrook: a plucked kalimba tune over a warm pad, a soft bass and a faint church bell far off.
     Hypermetapunk: dusk synthwave, an octave-pulsing bass, a sixteenth arpeggio, an electric-piano tune, claps.
     Depthfield: night air, glass bells over a dark pad and a low drone, a harp now and then, the same far bell.
     Every pitch is a step of the tuning: 13 of the tritave (Bohlen-Pierce), the ordinary 12, or 10 equal steps.
     The tune is written a phrase at a time (eight bars: a motif, the motif again on the next chord, an answer,
     the motif, a long last note), so it repeats enough to be remembered. A plucked string is made by the
     Karplus-Strong method and tuned exactly; the room is a convolution reverb made in the page. ---------- */
  const AU = (() => {
    const rnd = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const BPM = { sb: { still: 78, impact: 100, lit: 68 }, hmp: { still: 88, impact: 96, lit: 84 }, df: { still: 62, impact: 70, lit: 58 }, deep: { still: 54, impact: 54, lit: 54 } };
    const RHY = {
      sb: [[[0, 3], [4, 2], [6, 2], [8, 4], [12, 4]], [[0, 2], [2, 2], [4, 4], [8, 2], [10, 2], [12, 4]], [[0, 6], [6, 2], [8, 8]], [[0, 4], [4, 4], [8, 4], [12, 2], [14, 2]], [[2, 2], [4, 2], [6, 2], [8, 6]]],
      hmp: [[[0, 2], [3, 1], [4, 2], [6, 2], [8, 3], [11, 1], [12, 4]], [[0, 3], [3, 3], [6, 2], [8, 4], [12, 2], [14, 2]], [[0, 4], [6, 2], [8, 2], [10, 6]], [[2, 2], [4, 2], [6, 2], [8, 8]]],
      df: [[[0, 8], [8, 8]], [[0, 12], [12, 4]], [[0, 4], [8, 8]], [[4, 4], [8, 8]], [[0, 16]]]
    };
    RHY.deep = RHY.df;
    const A = { on: false, ctx: null, tun: 13, bpm: 78, moodNow: 'still', kit: 'sb', step: 0, next: 0, beatAt: 0, beatLen: .8, swing: 0, bank: {}, nbank: 0, phr: {} };
    Object.defineProperty(A, 'norm', { get() { return this.tun !== 13; } });
    A.f = function (n) { return this.tun === 13 ? 196 * Math.pow(3, n / 13) : 196 * Math.pow(2, n / this.tun); };
    /* the mode the tune walks in, one period of it */
    A.mode = function () { return this.tun === 12 ? [0, 2, 4, 7, 9] : this.tun === 10 ? [0, 2, 3, 4, 6, 7, 9] : [0, 2, 3, 4, 6, 7, 9, 10, 12]; };
    A.scale = function () { const M = this.mode(), P = this.tun; return M.concat(M.map(x => x + P)); };
    /* 10 steps: a neutral triad, 360 and 720 cents, between minor and major; odd, but easy on the ear */
    A.chord = function (root) { return (this.tun === 12 ? [0, 4, 7, 12] : this.tun === 10 ? [0, 3, 6, 10] : [0, 6, 10, 13]).map(x => x + root); };
    A.roots = function () { return this.tun === 12 ? [0, 5, 7, 3] : this.tun === 10 ? [0, 4, 6, 3] : [0, 6, 10, 4]; };
    /* keep a part in its own range whatever the tuning: a period is an octave in 12 and 10, but a tritave (x3) in 13 */
    A.fit = function (n, lo, hi) { let k = 0; while (this.f(n) > hi && k++ < 4) n -= this.tun; while (this.f(n) < lo && k++ < 8) n += this.tun; return n; };
    A.mood = function (m, kit) { this.moodNow = m || 'still'; if (kit) this.kit = kit; const b = BPM[this.kit] || BPM.sb; this.bpm = b[this.moodNow] || b.still; this.swing = this.kit === 'sb' && this.moodNow !== 'impact' ? .12 : 0; };

    A.start = function () {
      if (this.ctx) { this.ctx.resume(); return; }
      const C = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const master = C.createGain(), comp = C.createDynamicsCompressor(), tone = C.createBiquadFilter(), rev = C.createConvolver(), pre = C.createDelay(.2);
      comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = .012; comp.release.value = .22;
      tone.type = 'lowpass'; tone.frequency.value = 10500; tone.Q.value = .5;
      this.dry = C.createGain(); this.wet = C.createGain(); this.wet.gain.value = .85; this.send = C.createGain(); this.duck = C.createGain();
      rev.buffer = this.ir(3.6); pre.delayTime.value = .03; this.send.connect(pre); pre.connect(rev); rev.connect(this.wet);
      this.duck.connect(this.dry); this.dry.connect(comp); this.wet.connect(comp); comp.connect(tone); tone.connect(master); master.connect(C.destination);
      master.gain.setValueAtTime(0, C.currentTime); master.gain.linearRampToValueAtTime(.75, C.currentTime + 1.5);
      const nb = this.noiseBuf = C.createBuffer(1, C.sampleRate, C.sampleRate), nd = nb.getChannelData(0), r = rnd(3); for (let i = 0; i < nd.length; i++) nd[i] = r() * 2 - 1;
      this.out = this.dry; this.next = C.currentTime + .1; this.step = 0;
    };
    /* the room: two channels of noise falling away over a few seconds, darker as it goes */
    A.ir = function (sec) {
      const C = this.ctx, sr = C.sampleRate, n = Math.floor(sr * sec), b = C.createBuffer(2, n, sr);
      for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch), r = rnd(11 + ch); let lp = 0;
        for (let i = 0; i < n; i++) { const x = i / n; lp += (r() * 2 - 1 - lp) * (.9 - .78 * x); d[i] = lp * Math.pow(1 - x, 2.6) * Math.min(1, i / (sr * .004)); } }
      return b;
    };
    A.voice = function (pan, wet) {
      const C = this.ctx, g = C.createGain(), p = C.createStereoPanner ? C.createStereoPanner() : null;
      if (p) { p.pan.value = pan || 0; g.connect(p); p.connect(this.dry); } else g.connect(this.dry);
      if (wet) { const s = C.createGain(); s.gain.value = wet; g.connect(s); s.connect(this.send); }
      return g;
    };
    /* a plucked string, Karplus-Strong, made once per pitch and kept; tuned exactly by the playback rate */
    A.ks = function (freq, soft) {
      const key = freq.toFixed(2) + (soft ? 's' : ''); if (this.bank[key]) return this.bank[key];
      if (this.nbank > 160) { this.bank = {}; this.nbank = 0; }
      const C = this.ctx, sr = C.sampleRate, n = Math.floor(sr * 2.4), b = C.createBuffer(1, n, sr), d = b.getChannelData(0), N = Math.max(4, Math.floor(sr / freq)), buf = new Float32Array(N), r = rnd(Math.round(freq * 7));
      let m = 0; for (let i = 0; i < N; i++) { buf[i] = r() * 2 - 1; m += buf[i]; } m /= N; for (let i = 0; i < N; i++) buf[i] -= m;
      for (let k = 0; k < (soft ? 4 : 1); k++) for (let i = 1; i < N; i++) buf[i] = (buf[i] + buf[i - 1]) * .5;
      const fb = soft ? .994 : .997; let j = 0;
      for (let i = 0; i < n; i++) { const a = buf[j], c = buf[(j + 1) % N]; d[i] = a; buf[j] = (a + c) * .5 * fb; j = (j + 1) % N; }
      for (let i = n - 3000; i < n; i++) d[i] *= (n - i) / 3000;
      b.rate = (N - .5) * freq / sr;   /* the loop averages each sample with the next, so a period is N - 1/2 samples */ this.nbank++; return this.bank[key] = b;
    };
    A.pluck = function (n, t, v, o) {
      o = o || {}; const C = this.ctx, f = this.f(n), b = this.ks(f, o.soft), s = C.createBufferSource(), g = this.voice(o.pan || 0, o.wet == null ? .3 : o.wet), lp = C.createBiquadFilter();
      s.buffer = b; s.playbackRate.value = b.rate; lp.type = 'lowpass'; lp.frequency.value = o.cut || 5200; s.connect(lp); lp.connect(g);
      g.gain.setValueAtTime(v, t); g.gain.setTargetAtTime(.0001, t + (o.len || 1.8), .12); s.start(t); s.stop(t + (o.len || 1.8) + .7);
    };
    /* two-operator FM: an electric piano at ratio 1, glass at 3.5 (3 in the tritave, which keeps to odd harmonics) */
    A.fm = function (n, t, v, o) {
      o = o || {}; const C = this.ctx, f = this.f(n), car = C.createOscillator(), mod = C.createOscillator(), mg = C.createGain(), g = this.voice(o.pan || 0, o.wet == null ? .35 : o.wet);
      const ratio = o.ratio || 1, idx = o.idx || 1.6, len = o.len || 2.2;
      car.frequency.value = f; mod.frequency.value = f * ratio; mg.gain.setValueAtTime(f * idx, t); mg.gain.exponentialRampToValueAtTime(f * idx * .06 + .01, t + len * .7);
      mod.connect(mg); mg.connect(car.frequency); car.connect(g);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.att || .006)); g.gain.exponentialRampToValueAtTime(.0001, t + len);
      car.start(t); mod.start(t); car.stop(t + len + .05); mod.stop(t + len + .05);
    };
    A.glass = function (n, t, v, o) { this.fm(n, t, v, Object.assign({ ratio: this.tun === 13 ? 3 : 3.5, idx: 2.4, len: 3.2, wet: .55 }, o)); };
    A.epiano = function (n, t, v, o) { this.fm(n, t, v, Object.assign({ ratio: 1, idx: 1.3, len: 1.6, wet: .3 }, o)); };
    /* a church bell a long way off: bell partials, long low hum, mostly room */
    A.church = function (n, t, v) {
      const C = this.ctx, f = this.f(n), g = this.voice(-.35, 1.6), lp = C.createBiquadFilter(), r = rnd(Math.round(t * 100));
      lp.type = 'lowpass'; lp.frequency.value = 2000; lp.connect(g); g.gain.value = .55;
      const parts = this.tun === 13 ? [[1 / 3, 1, 8], [1, .8, 6], [9 / 7, .3, 3.6], [5 / 3, .45, 3.2], [7 / 3, .28, 2.4], [3, .18, 1.8]]
        : [[.5, 1, 8], [1, .8, 6], [1.2, .42, 3.6], [1.5, .32, 3], [2, .5, 2.6], [3, .18, 1.7], [4.2, .1, 1.1]];
      parts.forEach(p => { const o = C.createOscillator(), e = C.createGain(); o.frequency.value = f * p[0]; o.detune.value = (r() - .5) * 6;
        e.gain.setValueAtTime(.0001, t); e.gain.exponentialRampToValueAtTime(v * p[1], t + .012); e.gain.exponentialRampToValueAtTime(.0001, t + p[2]); o.connect(e); e.connect(lp); o.start(t); o.stop(t + p[2] + .05); });
    };
    A.pad = function (ns, t, len, v, cut) {
      const C = this.ctx, lp = C.createBiquadFilter(), g = C.createGain(), lfo = C.createOscillator(), lg = C.createGain(), s = C.createGain();
      cut = cut || 900; lp.type = 'lowpass'; lp.frequency.value = cut; lp.Q.value = .6; lfo.frequency.value = .08; lg.gain.value = cut * .3; lfo.connect(lg); lg.connect(lp.frequency);
      lp.connect(g); g.connect(this.duck); s.gain.value = .7; g.connect(s); s.connect(this.send);
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + Math.min(1.8, len * .4)); g.gain.setValueAtTime(v, t + len * .85); g.gain.linearRampToValueAtTime(.0001, t + len + 1.4);
      ns.map(n => this.fit(n, 130, 660)).forEach((n, k) => [-8, 8].forEach((det, j) => { const o = C.createOscillator(), p = C.createStereoPanner ? C.createStereoPanner() : null;
        o.type = this.tun === 13 ? 'square' : 'sawtooth'; o.frequency.value = this.f(n); o.detune.value = det + (k - 1) * 2;
        if (p) { p.pan.value = j ? .45 : -.45; o.connect(p); p.connect(lp); } else o.connect(lp); o.start(t); o.stop(t + len + 1.5); }));
      lfo.start(t); lfo.stop(t + len + 1.5);
    };
    A.bass = function (n, t, len, v, synth) {
      const C = this.ctx, o = C.createOscillator(), sub = C.createOscillator(), lp = C.createBiquadFilter(), g = this.voice(0, .04), sg = C.createGain();
      o.type = synth ? (this.tun === 13 ? 'square' : 'sawtooth') : 'triangle'; o.frequency.value = this.f(n); sub.type = 'sine'; sub.frequency.value = this.f(n); sg.gain.value = .8;
      lp.type = 'lowpass'; lp.Q.value = synth ? 5 : .7; lp.frequency.setValueAtTime(synth ? 1500 : 520, t); lp.frequency.exponentialRampToValueAtTime(synth ? 240 : 320, t + Math.max(.08, len * .8));
      o.connect(lp); lp.connect(g); sub.connect(sg); sg.connect(g);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.setValueAtTime(v, t + len * .7); g.gain.exponentialRampToValueAtTime(.0001, t + len + .06);
      o.start(t); sub.start(t); o.stop(t + len + .1); sub.stop(t + len + .1);
    };
    A.noise = function (t, v, type, freq, q, dec, pan, wet) {
      const C = this.ctx, s = C.createBufferSource(), f = C.createBiquadFilter(), g = this.voice(pan || 0, wet || 0);
      s.buffer = this.noiseBuf; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q; s.connect(f); f.connect(g);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .003); g.gain.exponentialRampToValueAtTime(.0001, t + dec); s.start(t, (t * 7.3) % .9); s.stop(t + dec + .02);
    };
    A.kick = function (t, v) {
      const C = this.ctx, o = C.createOscillator(), g = this.voice(0, 0); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(46, t + .12);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + .38); o.connect(g); o.start(t); o.stop(t + .42);
      this.noise(t, v * .18, 'highpass', 3000, .7, .012);
      const d = this.duck.gain; d.cancelScheduledValues(t); d.setValueAtTime(1, t); d.linearRampToValueAtTime(.4, t + .012); d.linearRampToValueAtTime(1, t + .3);
    };
    A.clap = function (t, v) { for (let k = 0; k < 3; k++) this.noise(t + k * .011, v * (k === 2 ? 1 : .6), 'bandpass', 1300, .9, k === 2 ? .2 : .03, 0, .25);
      const C = this.ctx, o = C.createOscillator(), g = this.voice(0, .1); o.type = 'triangle'; o.frequency.value = 185; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v * .35, t + .003); g.gain.exponentialRampToValueAtTime(.0001, t + .09); o.connect(g); o.start(t); o.stop(t + .1); };
    A.hat = function (t, v, open) { this.noise(t, v, 'highpass', 7500, .8, open ? .16 : .04, .25); };
    A.shaker = function (t, v) { this.noise(t, v, 'bandpass', 5200, 1.2, .07, -.25, .1); };

    /* the tune, a phrase of eight bars at a time, kept so the same phrase comes back the same */
    A.phrase = function (ph) {
      const key = this.kit + ':' + this.tun + ':' + (ph % 4); if (this.phr[key]) return this.phr[key];
      const P = this.tun, M = this.mode(), L = M.length, R = this.roots(), r = rnd(ph % 4 * 977 + P * 31 + (this.kit.charCodeAt(0) << 4)), RH = RHY[this.kit] || RHY.sb;
      const deg2 = d => M[((d % L) + L) % L] + P * Math.floor(d / L), near = st => { let best = 0, bd = 1e9; for (let d = -L; d < 3 * L; d++) { const e = Math.abs(deg2(d) - st); if (e < bd) { bd = e; best = d; } } return best; };
      const lo = this.kit === 'hmp' ? 300 : 280, hi = this.kit === 'df' || this.kit === 'deep' ? 1200 : 900;
      const order = ph % 2 ? [0, 2, 3, 1] : [0, 1, 2, 3], chordOf = b => this.chord(R[order[Math.floor(b / 2)]]);
      const motif = () => { const bars = [0, 1].map(() => RH[Math.floor(r() * RH.length)]); const steps = bars.map(rh => rh.map(() => [-2, -1, -1, 0, 1, 1, 1, 2, 3, -3][Math.floor(r() * 10)])); return { bars, steps }; };
      const mA = motif(), mB = motif(), plan = [[mA, 0], [mA, 1], [mA, 0], [mA, 1], [mB, 0], [mB, 1], [mA, 0], null];
      let d = near(P + this.chord(0)[1]); const out = [];
      plan.forEach((pl, b) => { const ch = chordOf(b), notes = [];
        if (!pl) { const tgt = ch.map(x => x + P).concat(ch); let st = tgt[0], bd = 1e9; tgt.forEach(x => { const e = Math.abs(x - deg2(d)); if (e < bd) { bd = e; st = x; } }); notes.push({ pos: 0, dur: 14, n: st, v: 1 }); out.push(notes); return; }
        const [m, k] = pl; m.bars[k].forEach(([pos, dur], j) => {
          if (j > 0 || b % 2 === 0) d += m.steps[k][j];
          let st = deg2(d); let fr = this.f(st); while (fr > hi) { d -= L; st = deg2(d); fr = this.f(st); } while (fr < lo) { d += L; st = deg2(d); fr = this.f(st); }
          if (pos % 8 === 0) { let best = st, bd = 1e9; for (let q = -1; q <= 2; q++) ch.forEach(x => { const c = x + q * P, e = Math.abs(c - st); if (e < bd) { bd = e; best = c; } }); st = best; d = near(st); }
          notes.push({ pos, dur, n: st, v: pos % 8 === 0 ? 1 : pos % 4 === 0 ? .85 : .7 }); });
        out.push(notes); });
      return this.phr[key] = out;
    };

    A.play = function (s, t, d) {
      const P = this.tun, bar = Math.floor(s / 16), i = s % 16, ph = Math.floor(bar / 8), b8 = bar % 8, K = this.kit, M = this.moodNow;
      if (i % 4 === 0) { this.beatAt = t; this.beatLen = d * 4; }
      const R = this.roots(), order = ph % 2 ? [0, 2, 3, 1] : [0, 1, 2, 3], root = R[order[Math.floor(b8 / 2)]], ch = this.chord(root), mel = this.phrase(ph)[b8];
      const lead = (n, tt, dur, v) => {
        if (K === 'sb') { if (M === 'lit') this.glass(n, tt, .1 * v, { len: 2.6 }); else this.pluck(n, tt, .34 * v, { len: Math.max(.5, dur), pan: .1 }); }
        else if (K === 'hmp') this.epiano(n, tt, .13 * v, { len: Math.max(.35, dur * 1.1), pan: -.1 });
        else this.glass(n, tt, .085 * v, { len: 3.4, pan: .15 }); };
      if (K !== 'deep') mel.forEach(nt => { if (nt.pos === i && !(K === 'df' && M === 'still' && nt.v < .8)) lead(nt.n, t, nt.dur * d, nt.v); });
      if (K === 'sb') {
        if (i === 0 && b8 % 2 === 0) this.pad(ch.slice(0, 3), t, d * 32, .016, M === 'lit' ? 700 : 1100);
        if (i === 0 || (i === 8 && M !== 'lit')) this.bass(root - P, t, d * 6, .26);
        if (M !== 'lit' && i % 4 === 2) this.pluck(this.fit(ch[(i / 2 + b8) % 3] + (i > 7 ? P : 0), 260, 820), t, .07, { soft: true, pan: -.35, len: .8 });
        if (M === 'still' && i % 2 === 0) this.shaker(t, i % 4 === 0 ? .018 : .03);
        if (M === 'impact') { if (i === 0 || i === 8 || i === 10) this.kick(t, .7); if (i === 4 || i === 12) this.clap(t, .22); if (i % 2 === 0) this.hat(t, .05); }
        if (b8 === 0 && i === 0 && ph % 2 === 0) this.church(root - P, t + d * 2, M === 'lit' ? .12 : .07);
      } else if (K === 'hmp') {
        if (i === 0 && b8 % 2 === 0) this.pad(ch.slice(0, 3), t, d * 32, .014, 1500);
        if (i % 2 === 0) this.bass(root - P + (i % 4 === 2 ? P : 0), t, d * 1.6, .17, true);
        if (M === 'impact' || i % 2 === 0) { const ar = [0, 1, 2, 3, 2, 1][Math.floor(i / (M === 'impact' ? 1 : 2)) % 6]; this.pluck(this.fit(ch[ar] + P, 330, 1000), t, .06, { pan: i % 4 < 2 ? -.4 : .4, len: .35, cut: 3200 }); }
        if (M === 'impact') { if (i % 4 === 0) this.kick(t, .75); if (i === 4 || i === 12) this.clap(t, .26); if (i % 4 === 2) this.hat(t, .07, i === 14); else if (i % 2) this.hat(t, .025); }
        else { if (i === 0 || i === 10) this.kick(t, .6); if (i === 8) this.clap(t, .2); if (i % 4 === 2) this.hat(t, .05); }
      } else {
        if (i === 0 && b8 % 2 === 0) this.pad(ch.slice(0, 3), t, d * 32, .018, K === 'deep' ? 500 : 650);
        if (i === 0 && b8 % 4 === 0) this.bass(R[order[0]] - P, t, d * 60, .14);
        if (M === 'lit' && b8 % 2 === 1 && i % 2 === 0 && i < 8) this.pluck(this.fit(ch[i / 2 % 4] + P, 300, 1100), t, .05, { soft: true, pan: (i / 4 - .5) * .6, len: 1.6, wet: .6 });
        if (K === 'deep' && i === 8 && b8 % 2 === 0) this.glass(this.fit(ch[b8 / 2 % 3] + P, 300, 1100), t, .06, { len: 5 });
        if (b8 === 0 && i === 0) this.church(root - P, t + d * 4, .08);
      }
    };
    A.tick = function () {
      if (!this.on || !this.ctx) return; const C = this.ctx;
      /* if the scheduler fell behind the clock (a hidden tab, a locked phone), skip what was missed instead of firing it all at once */
      if (this.next < C.currentTime - .1) this.next = C.currentTime + .05;
      while (this.next < C.currentTime + .25) { const d = 60 / this.bpm / 4, s = this.step; const t = this.next + (this.swing && s % 2 ? d * this.swing : 0); this.play(s, t, d); this.step++; this.next += d; }
    };
    A.note = function (k) { if (!this.on || !this.ctx) return; const P = this.tun, n = Math.round(k * P / 13) + (P === 13 ? 0 : P); this.glass(n, this.ctx.currentTime + .01, .16, { len: 2.2, idx: 2.8, pan: ((k % 5) - 2) * .2, wet: .45 }); };
    A.ring = function (y) { if (!this.on || !this.ctx) return; const sc = this.scale(); this.glass(sc[Math.max(0, Math.min(sc.length - 1, Math.round(y * (sc.length - 1))))] + this.tun, this.ctx.currentTime + .01, .14, { len: 2 }); };
    A.beat = function () { if (this.on && this.ctx) { const ph = (this.ctx.currentTime - this.beatAt) / this.beatLen; return ph >= 0 ? Math.exp(-3.5 * ph) : 0; } const len = 60 / 74, ph = (performance.now() / 1000 % len) / len; return still ? 0 : Math.exp(-3.5 * ph) * .6; };
    return A;
  })();

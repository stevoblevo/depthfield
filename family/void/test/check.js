/* The Void: a headless check. node family/void/test/check.js [page.html] [shots-dir]
   Needs Playwright and a Chrome with software GL. Exits 1 on any failed line. */
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/npm-tools/node_modules/playwright'); }
const fs = require('fs'), path = require('path');
const page0 = path.resolve(process.argv[2] || path.join(__dirname, '../index.html'));
const shots = process.argv[3] ? path.resolve(process.argv[3]) : null;
const three = path.join(__dirname, '../src/vendor/three-r128.min.js');
const ARGS = ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
let failed = 0;
const ok = (name, pass, note) => { if (!pass) failed++; console.log((pass ? 'ok   ' : 'FAIL ') + name + (note !== undefined ? '  ' + note : '')); };
(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ARGS });
  const errs = [];
  const open = async (opts, hash) => {
    const ctx = await browser.newContext(opts), page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text())) errs.push(m.text()); });
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    await page.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(three), contentType: 'application/javascript' }));
    await page.goto('file://' + page0 + (hash || ''));
    await page.evaluate(() => { Depthfield5D.pinQuality = true; });
    await page.waitForTimeout(900);
    return page;
  };
  const st = page => page.evaluate(() => { const S = Depthfield5D.state; return { d: S.d, x: S.x, ts: S.ts, beat: S.beat, look: S.look, marks: Depthfield5D.marks.length, hash: location.hash }; });
  const set = (page, d) => page.evaluate(d => { const S = Depthfield5D.state; S.travel = null; S.dT = S.d = d; }, d);
  const slide = (page, id, v) => page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, v]);
  const shot = async (page, name) => { if (shots) { fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: path.join(shots, name + '.png') }); } };

  const phone = { viewport: { width: 390, height: 760 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, colorScheme: 'dark' };
  let page = await open(phone);
  ok('the strip is the kit add-on, five axes', await page.evaluate(() => !!(window.Depthfield && Depthfield.axes) && document.querySelectorAll('#axes .df-axis').length === 5 && !!document.querySelector('style[data-df="axes"]')));
  await shot(page, 'phone-0');
  await page.mouse.move(200, 500); await page.mouse.down();
  for (let i = 0; i < 12; i++) { await page.mouse.move(200 + i * 4, 500 - i * 30); await page.waitForTimeout(16); }
  await page.mouse.up(); await page.waitForTimeout(1200);
  let s = await st(page); ok('a swipe up descends and turns', s.d > 0.2 && s.x > 0.02, `d ${s.d.toFixed(2)} x ${s.x.toFixed(2)}`);
  await set(page, 1.7); await page.waitForTimeout(900);
  for (const [x, y] of [[90, 200], [300, 260], [200, 420], [120, 560], [320, 610]]) { await page.mouse.click(x, y); await page.waitForTimeout(200); }
  s = await st(page); ok('five taps leave five marks', s.marks === 5, s.marks); ok('the address follows the descent', s.hash === '#gap', s.hash);
  await shot(page, 'phone-gap');
  await set(page, 3.5); await page.waitForTimeout(900);
  await page.mouse.move(200, 300); await page.mouse.down(); await page.waitForTimeout(1300);
  s = await st(page); ok('a hold stops the clock', Math.abs(s.ts) < 0.02, s.ts.toFixed(2)); await shot(page, 'phone-rest');
  await page.mouse.up(); await page.waitForTimeout(700);
  s = await st(page); ok('letting go starts it', s.ts > 0.95 && s.marks === 5, s.ts.toFixed(2));
  await slide(page, 'ax-time', -1); await slide(page, 'ax-look', 2); await slide(page, 'ax-x', 0.4); await page.waitForTimeout(900);
  s = await st(page); ok('the sliders write the world', s.ts < -0.9 && s.look === 1 && Math.abs(s.x - 0.4) < 0.01, `ts ${s.ts.toFixed(2)} look ${s.look} x ${s.x.toFixed(2)}`);
  await slide(page, 'ax-time', 1); await slide(page, 'ax-look', 0); await slide(page, 'ax-x', 0);
  await set(page, 4.4); await page.mouse.move(380, 20); await page.waitForTimeout(5200);
  ok('the eye opens when you hold still', /looks back/.test(await page.textContent('#hint4'))); await shot(page, 'phone-pupil');
  await page.mouse.click(195, 243); await page.waitForTimeout(500);
  s = await st(page); ok('a tap on the eye is a blink, not a mark', s.marks === 5 && /blinks/.test(await page.textContent('#hint4')));
  await set(page, 5.0); await page.waitForTimeout(900);
  const png = await page.locator('#world').screenshot();
  let sharp = null; try { sharp = require('sharp'); } catch (e) { try { sharp = require('/opt/npm-tools/node_modules/sharp'); } catch (e2) {} }
  if (sharp) {
    const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true }); let all = true;
    for (let y = 240; y < 600; y += 37) for (let x = 20; x < info.width; x += 53) { const i = (y * info.width + x) * info.channels; if (data[i] !== 7 || data[i + 1] !== 17 || data[i + 2] !== 15) all = false; }
    ok('at depth 5.0 the canvas is exactly #07110f', all);
  }
  await set(page, 5.6); await page.waitForTimeout(600); await shot(page, 'phone-trace-weaving'); await page.waitForTimeout(3200);
  s = await st(page); ok('the trace is addressed', s.hash === '#trace', s.hash); await shot(page, 'phone-trace');
  await page.click('#indexBtn'); await page.waitForTimeout(300); await shot(page, 'phone-index');
  ok('the sheet counts the marks', /05 marks/.test(await page.textContent('#memNote')));
  await page.click('[data-jump="2"]'); await page.waitForTimeout(3500);
  s = await st(page); ok('the index jumps to a chapter', Math.abs(s.d - 2.5) < 0.05, s.d.toFixed(2));
  await page.click('#indexBtn'); await page.click('#reelBtn'); await page.waitForTimeout(5000);
  const a = (await st(page)).d; await page.waitForTimeout(2500); const b = (await st(page)).d;
  ok('the reel plays by itself', b > a, `${a.toFixed(2)} -> ${b.toFixed(2)}`);
  await page.mouse.click(200, 300); await page.waitForTimeout(400);
  ok('a touch hands it back', await page.evaluate(() => Depthfield5D.state.travel === null));
  await page.reload(); await page.waitForTimeout(1000);
  s = await st(page); ok('marks are kept across a reload', s.marks === 6, s.marks);
  await page.close();

  page = await open(phone, '#pupil'); s = await st(page);
  ok('a link to a chapter opens there', Math.abs(s.d - 4.5) < 0.01 && s.beat === 4, s.d.toFixed(2));
  /* the sound, rendered offline: a fall from the top to the bottom with marks rung on the way */
  const audio = await page.evaluate(async () => {
    const S = Depthfield5D.state, snd = Depthfield5D.sound, SR = 44100, T = 16;
    const ctx = new OfflineAudioContext(2, SR * T, SR);
    if (!snd.start(ctx)) return null;
    snd.state.on = true;
    for (let i = 1; i < T * 10; i++) {
      ctx.suspend(i / 10).then(() => {
        const d = Math.min(5.6, i / 10 * 0.4); S.dT = S.d = d; S.v = 0.9; S.ts = (i > 60 && i < 75) ? 0 : 1;
        snd.frame(); if (i % 9 === 0) snd.bell((i % 5) / 2.5 - 1); if (i === 110) snd.thump();
        ctx.resume();
      });
    }
    const buf = await ctx.startRendering(); let peak = 0, sq = 0, rest = 0; const ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) { const v = Math.abs(ch[i]); if (v > peak) peak = v; sq += v * v; if (i > SR * 7.0 && i < SR * 7.4 && v > rest) rest = v; }
    return { peak, rms: Math.sqrt(sq / ch.length), rest };
  });
  const db = v => (20 * Math.log10(Math.max(v, 1e-9))).toFixed(1);
  ok('the sound does not clip', audio && audio.peak < 0.9 && audio.peak > 0.02, audio ? `peak ${db(audio.peak)} dBFS, rms ${db(audio.rms)} dBFS, in a hold ${db(audio.rest)} dBFS` : 'no audio');
  await page.close();

  page = await open({ viewport: { width: 1366, height: 800 }, colorScheme: 'light' });
  await shot(page, 'desk-0-day');
  for (const k of ['ArrowDown', 'ArrowDown', 'ArrowRight', 'l', 'm']) await page.keyboard.press(k);
  await page.waitForTimeout(1200); s = await st(page);
  ok('keys move every axis', s.d > 0.15 && s.x > 0.03 && s.look === 0 && s.marks === 1, `d ${s.d.toFixed(2)} x ${s.x.toFixed(2)} marks ${s.marks}`);
  for (const d of [1.6, 2.5, 3.5]) { await set(page, d); await page.waitForTimeout(1500); await shot(page, 'desk-' + String(d).replace('.', '_')); }
  await page.close();

  const b2 = await pw.chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-gpu', '--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] });
  const p2 = await (await b2.newContext({ viewport: { width: 390, height: 760 } })).newPage();
  p2.on('pageerror', e => errs.push('no-gl pageerror: ' + e.message));
  await p2.goto('file://' + page0); await p2.waitForTimeout(600);
  ok('without WebGL the words still read', await p2.evaluate(() => document.documentElement.classList.contains('no-gl') && document.documentElement.scrollHeight > 1500));
  await b2.close();
  ok('no console errors', errs.length === 0, errs.slice(0, 5).join(' | '));
  await browser.close();
  console.log(failed ? failed + ' failed' : 'all passed');
  process.exit(failed ? 1 : 0);
})();

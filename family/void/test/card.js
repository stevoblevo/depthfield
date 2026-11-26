/* The share card: node family/void/test/card.js out.jpg  (1200 x 630, the eye from the page itself, the title in the page's type) */
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/npm-tools/node_modules/playwright'); }
let sharp; try { sharp = require('sharp'); } catch (e) { sharp = require('/opt/npm-tools/node_modules/sharp'); }
const path = require('path');
(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2, colorScheme: 'dark' })).newPage();
  await page.goto('file://' + path.join(__dirname, '../index.html') + '#pupil');
  await page.evaluate(() => { Depthfield5D.pinQuality = true; const S = Depthfield5D.state; S.dT = S.d = 4.36; });
  await page.addStyleTag({ content: '.top,.axes,.cue,.beat{display:none!important}#card{position:fixed;left:64px;bottom:64px;z-index:20;display:grid;gap:14px}#card p{margin:0;font:500 15px/20px "JetBrains Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:#93aaa1;text-shadow:0 1px 16px rgba(7,17,15,.8)}#card h1{margin:0;font:300 150px/.9 "Fraunces",serif;letter-spacing:-.03em;font-variation-settings:"opsz" 144;color:#e9f5ef;text-shadow:0 2px 30px rgba(7,17,15,.6)}#card em{font-style:italic;color:#5ef2b8}' });
  await page.evaluate(() => { const d = document.createElement('div'); d.id = 'card'; d.innerHTML = '<p>Depthfield 5D · under the page</p><h1>The <em>void</em>.</h1>'; document.body.appendChild(d); });
  await page.mouse.move(1150, 40); await page.waitForTimeout(6500);
  await page.mouse.move(520, 380); await page.waitForTimeout(2600);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot();
  await sharp(png).resize(1200, 630).jpeg({ quality: 88, mozjpeg: true }).toFile(process.argv[2] || 'card.jpg');
  await browser.close();
})();

/* plan D1: real-browser interaction, fallback, family-regression and screenshot gate. */
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const kind=process.env.BROWSER||'chromium',base='http://127.0.0.1:8091',KEY='crossing:df-missing-page:v1';
fs.mkdirSync('missing-page-qa',{recursive:true});
let checks=0;const results=[];
function ok(value,label){assert.ok(value,label);checks++;results.push(label);}
const complete={version:1,clues:['rule','room','receipt'],layer:'wall',alignment:2,deduced:true,trial:'sheltered',complete:true,guardian:'none',hints:[0,0,0,0,0]};
(async()=>{
 const browser=await (kind==='webkit'?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true}));
 const contexts=[];
 async function setup(options={},seed){const context=await browser.newContext(options);contexts.push(context);if(seed)await context.addInitScript(seed);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));return {page,context,errors};}
 async function load(page,path='/missing-page/'){await page.goto(base+path,{waitUntil:'networkidle'});}
 async function value(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);}
 async function noOverflow(page,label){ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label);}
 async function discover(page){await page.locator('#read-margin-copy').click();await page.locator('[data-layer=wall]').click();await page.locator('#alignment').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');await page.locator('[data-receipt=blankets]').click();}
 async function solve(page){await discover(page);await page.locator('input[value=absent]').check();await page.locator('#connect').click();await page.locator('[data-light-choice=sheltered]').click();await page.locator('#keep-room').click();}
 // First screen and every theme at phone/tablet/desktop widths.
 for(const width of [320,390,768,1440])for(const theme of ['night','day','contrast']){
  const {page,context,errors}=await setup({viewport:{width,height:900},reducedMotion:'reduce'});await load(page,'/missing-page/?theme='+theme);
  await noOverflow(page,`${width}/${theme}: no sideways scroll`);
  const first=await page.locator('#read-margin-copy').boundingBox();ok(first.y+first.height<=900,`${width}/${theme}: first action above fold`);
  ok(await page.locator('html').getAttribute('data-theme')===theme,`${width}/${theme}: theme applied`);
  const taste=await page.evaluate(()=>Depthfield.taste({log:false}));ok(!taste.some(r=>r.severity==='warn'),`${width}/${theme}: taste clean ${JSON.stringify(taste)}`);
  await page.screenshot({path:`missing-page-qa/open-${width}-${theme}.png`});
  if(width===390||width===1440){await solve(page);await page.locator('#ending').scrollIntoViewIfNeeded();await page.screenshot({path:`missing-page-qa/ending-${width}-${theme}.png`});await noOverflow(page,`${width}/${theme}: ending no sideways scroll`);}
  ok(!errors.length,`${width}/${theme}: no script errors ${errors}`);await context.close();
 }
 // Actual state transitions, wrong routes, explicit commit, replay and reset.
 {
  const {page,context,errors}=await setup({viewport:{width:1440,height:1000}});await load(page);
  await page.locator('#connect').click();ok((await page.locator('#deduction-response').textContent()).includes('Choose a claim'),'empty claim has feedback');
  for(let i=0;i<4;i++)await page.locator('#hint').click();ok((await page.locator('#hint-copy').textContent()).includes('Press “Read the margin”'),'third hint states answer');
  await page.locator('input[value=absent]').check();await page.locator('#connect').click();ok(await page.locator('#refuge').isHidden(),'cannot skip all clues');
  await discover(page);ok((await value(page)).clues.length===3,'all discoveries persisted');
  await page.locator('[data-layer=glass]').click();ok(await page.locator('#room-note').isVisible(),'found room survives changed layer');
  await page.locator('input[value=unlit]').check();await page.locator('#connect').click();ok((await page.locator('#deduction-response').textContent()).includes('channel'),'wrong deduction teaches reason');
  await page.locator('input[value=absent]').check();await page.locator('#connect').click();ok(await page.locator('#refuge').isVisible(),'correct deduction opens light lab');
  for(const action of ['dark','exposed']){await page.locator(`[data-light-choice=${action}]`).click();await page.locator('#keep-room').click();ok(await page.locator('#ending').isHidden(),`${action}: wrong trial remains reversible`);ok((await page.locator('#census-reading').textContent())===(action==='exposed'?'07':'06'),`${action}: visible count`);}
  await page.locator('[data-light-choice=sheltered]').click();ok(await page.locator('#ending').isHidden(),'correct trial is not automatic ending');await page.locator('#keep-room').click();ok((await value(page)).complete,'explicit Keep commits ending');
  await page.locator('#close-book').click();await page.waitForTimeout(1800);ok(await page.evaluate(()=>document.querySelector('#refuge-book').__dfPop.value)<.01,'popup close button works');await page.locator('#open-book').click();await page.waitForTimeout(1800);ok(await page.evaluate(()=>document.querySelector('#refuge-book').__dfPop.value)>.99,'popup open button works');
  await page.reload({waitUntil:'networkidle'});ok(await page.locator('#return-note').isVisible(),'return remembers kept room');ok(await page.locator('#guardian-select option').count()===1,'no new pet granted');
  await page.locator('#retry-light').click();ok(!(await value(page)).complete&&(await value(page)).clues.length===3,'retry keeps evidence');ok(await page.locator('#keep-room').evaluate(e=>e===document.activeElement),'retry restores visible focus');
  await page.locator('#reset-open').click();await page.locator('#reset-cancel').click();ok((await value(page)).clues.length===3,'reset cancel preserves progress');await page.locator('#reset-open').click();await page.locator('#reset-yes').click();ok((await value(page)).clues.length===0,'confirmed reset clears only mystery');ok(await page.locator('#read-margin-copy').evaluate(e=>e===document.activeElement),'reset restores beginning focus');ok(!errors.length,'full play no script errors');await context.close();
 }
 // Existing pets and shared preferences are read-only; stable single Guardian.
 for(const reducedMotion of ['reduce','no-preference']){
  const {page,context,errors}=await setup({viewport:{width:390,height:844},reducedMotion},()=>{localStorage.setItem('crossing:pets',JSON.stringify({found:{'df:winkle':123,'sb:poppy':456}}));localStorage.setItem('df:theme','peach-day');sessionStorage.setItem('df:sound','1');});
  await load(page);const originalPets=await page.evaluate(()=>localStorage.getItem('crossing:pets'));await solve(page);await page.locator('#guardian-select').selectOption('winkle');
  const guardian=page.locator(reducedMotion==='reduce'?'.mp-guardian-static':'.df-guardian');await guardian.scrollIntoViewIfNeeded();ok(await guardian.isVisible(),`${reducedMotion}: found pet renders`);await guardian.focus();await page.keyboard.press('Enter');ok((await page.locator('.mp-keeper-line').textContent()).includes('Six on the ledger'),`${reducedMotion}: guardian keyboard note`);
  await guardian.evaluate(e=>e.click());ok((await page.locator('.mp-keeper-line').textContent()).includes('shade stays'),`${reducedMotion}: guardian synthetic activation`);
  await page.locator('#guardian-select').selectOption('none');await page.locator('#guardian-select').selectOption('winkle');ok(await page.locator('.df-guardian').count()===(reducedMotion==='reduce'?0:1),`${reducedMotion}: no duplicate guardian`);
  ok(await page.evaluate(()=>Depthfield.tone.on)===false,`${reducedMotion}: sound stays off despite saved on`);
  await page.locator('#theme').selectOption('contrast');ok(await page.evaluate(()=>localStorage.getItem('df:theme'))==='peach-day',`${reducedMotion}: shared theme untouched`);
  await page.locator('#reset-open').click();await page.locator('#reset-yes').click();ok(await page.evaluate(()=>localStorage.getItem('crossing:pets'))===originalPets,`${reducedMotion}: pets unchanged after reset`);ok(!errors.length,`${reducedMotion}: no guardian errors ${errors}`);await context.close();
 }
 // Storage denied: usable complete ending, honest nonpersistent message.
 {
  const {page,context,errors}=await setup({viewport:{width:390,height:844},reducedMotion:'reduce'},()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError');}}));await load(page);await solve(page);ok(await page.locator('#ending').isVisible(),'blocked storage still completes');ok((await page.locator('#save-status').textContent()).includes('this visit'),'blocked storage disclosed');ok(!errors.length,'blocked storage no errors');await context.close();
 }
 // Corrupt state and no-JS full text route.
 {
  const {page,context}=await setup({},()=>localStorage.setItem('crossing:df-missing-page:v1','{broken'));await load(page);ok((await page.locator('#clue-count').textContent())==='00 / 03','corrupt save resets safely');await context.close();
  const fallback=await setup({javaScriptEnabled:false,viewport:{width:390,height:844}});await load(fallback.page);await fallback.page.locator('.mp-transcript summary').click();ok((await fallback.page.locator('.mp-transcript').textContent()).includes('Six windows answer. Seven rooms remain.'),'no-JS route has same complete ending');await noOverflow(fallback.page,'no-JS no sideways scroll');await fallback.context.close();
 }
 // Touch is an equal route, no pointer precision required.
 {
  const {page,context,errors}=await setup({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await load(page);await page.locator('#read-margin-copy').tap();await page.locator('[data-layer=wall]').tap();await page.locator('#alignment').fill('2');await page.locator('[data-receipt=blankets]').tap();await page.locator('input[value=absent]').tap();await page.locator('#connect').tap();await page.locator('[data-light-choice=sheltered]').tap();await page.locator('#keep-room').tap();ok(await page.locator('#ending').isVisible(),'touch-only controls complete story');ok(!errors.length,'touch route no errors');await context.close();
 }
 // Main showcase and shared docs keep existing boot and phone layout.
 for(const path of ['/','/docs.html']){
  const {page,context,errors}=await setup({viewport:{width:390,height:844},reducedMotion:'reduce'});await load(page,path);await noOverflow(page,`${path}: baseline phone no sideways scroll`);ok(!errors.length,`${path}: no script errors ${errors}`);if(path==='/'){ok(await page.locator('[data-df-chapter]').count()===7,'baseline seven chapters intact');ok(await page.locator('a[href="missing-page/"]').count()===2,'chapter reachable from hero and ledger');}await context.close();
 }
 fs.writeFileSync('missing-page-qa/results.json',JSON.stringify({browser:kind,checks,results},null,2));console.log(`${kind}: ${checks} checks passed`);await browser.close();
})().catch(e=>{fs.writeFileSync('missing-page-qa/failure.txt',e.stack);console.error(e);process.exitCode=1;});

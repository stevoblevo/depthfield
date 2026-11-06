/* plan D6 candidate: browser + model gate. Nothing is deployed by this workflow. */
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const kind=process.env.BROWSER||'chromium',base=process.env.BASE_URL||'http://127.0.0.1:8096';
const out='hush-room-qa';fs.mkdirSync(out,{recursive:true});const checks=[],metrics=[];
function ok(v,label){assert.ok(v,label);checks.push(label);}
(async()=>{
 const b=kind==='webkit'?await webkit.launch({headless:true}):await chromium.launch({channel:'chrome',headless:true,chromiumSandbox:true});
 async function setup(options={}){const c=await b.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',...options});const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));return {c,p,errors};}
 async function load(p){await p.goto(base+'/hush-room/',{waitUntil:'networkidle'});await p.waitForFunction(()=>window.HushRoom);}
 async function noOverflow(p,label){ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label);}
 async function contrast(p,selector,label){const n=await p.locator(selector).first().evaluate(el=>{const can=document.createElement('canvas');can.width=can.height=1;const g=can.getContext('2d');function rgba(s){g.clearRect(0,0,1,1);g.fillStyle=s;g.fillRect(0,0,1,1);return [...g.getImageData(0,0,1,1).data];}let bg=[255,255,255];let list=[];for(let n=el;n;n=n.parentElement)list.unshift(n);for(const n of list){const c=rgba(getComputedStyle(n).backgroundColor),a=c[3]/255;bg=bg.map((v,i)=>c[i]*a+v*(1-a));}const fg=rgba(getComputedStyle(el).color);const l=c=>c.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0),a=l(fg),z=l(bg);return(Math.max(a,z)+.05)/(Math.min(a,z)+.05);});ok(n>=4.5,label+' '+n.toFixed(2));}
 for(const width of [320,390,768,1440])for(const theme of ['night','day','contrast']){
  const {c,p,errors}=await setup({viewport:{width,height:1000}});await load(p);await p.locator('#theme').selectOption(theme);await noOverflow(p,`${width}/${theme}: no overflow`);const firstAction=await p.locator('#quiet').boundingBox();ok(firstAction.y+firstAction.height<844,`${width}/${theme}: first action visible in 844px view`);
  for(const selector of ['#quiet','#trace','#change-room','.small','#status','#theme','.scene-heading p'])await contrast(p,selector,`${width}/${theme}: ${selector}`);
  await p.mouse.move(1,1);
  const ui=await p.locator('#quiet').evaluate(el=>({fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor}));
  await p.locator('#quiet').click();ok((await p.evaluate(()=>HushRoom.snapshot())).mode==='protan','quiet selects matching protan model');
  await p.mouse.move(1,1);
  const uiAfter=await p.locator('#quiet').evaluate(el=>({fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor}));ok(JSON.stringify(ui)===JSON.stringify(uiAfter),'art model leaves UI colours unchanged');
  await p.locator('#trace').click();ok(await p.locator('#trace').getAttribute('aria-pressed')==='true','outline state exposed');
  await p.locator('#change-room').click();ok((await p.evaluate(()=>HushRoom.snapshot())).family==='deutan','second room opens');ok((await p.evaluate(()=>HushRoom.snapshot())).mode==='original','room change restores original');
  if(width===390||width===1440){await p.screenshot({path:`${out}/${width}-${theme}-original.png`,fullPage:true});await p.locator('#quiet').click();await p.screenshot({path:`${out}/${width}-${theme}-quiet.png`,fullPage:true});}
  ok(!errors.length,`${width}/${theme}: no script errors ${errors}`);await c.close();
 }
 {
  const {c,p,errors}=await setup();await load(p);
  for(const family of ['protan','deutan']){
   for(const mode of ['original','protan','deutan','tritan']){
    await p.locator('.preview-controls').evaluate(e=>e.open=true);await p.locator('#vision').selectOption(mode);await p.locator('#art').screenshot({path:`${out}/art-${family}-${mode}.png`});
    const m=await p.evaluate(()=>{const d=document.getElementById('art').getContext('2d').getImageData(0,0,1200,760).data;let sum=0,max=0,count=0,above4=0;for(let i=0;i<d.length;i+=4){const c=Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2]);sum+=c;max=Math.max(max,c);count++;if(c>4)above4++;}return {mean:sum/count,max,fractionAbove4:above4/count};});metrics.push({family,mode,...m});if(mode===family){ok(m.mean<1.5,`${family}: rendered mean channel spread below 1.5`);ok(m.fractionAbove4<.025,`${family}: over 97.5% of pixels at most 4-channel spread`);}
   }
   await p.locator('#quiet').click();await p.locator('#trace').click();await p.locator('#art').screenshot({path:`${out}/art-${family}-traced.png`});
   if(family==='protan')await p.locator('#change-room').click();
  }
  await p.locator('#trace').focus();await p.keyboard.press('Enter');ok(await p.locator('#trace').getAttribute('aria-pressed')==='false','keyboard removes outlines');await p.keyboard.press('Space');ok(await p.locator('#trace').getAttribute('aria-pressed')==='true','keyboard restores outlines');
  for(let i=0;i<10;i++)await p.locator('#quiet').click();ok((await p.evaluate(()=>HushRoom.snapshot())).trace,'repeated model toggles retain explicit outline state');
  await p.reload({waitUntil:'networkidle'});ok((await p.evaluate(()=>HushRoom.snapshot())).mode==='original','reload starts original, no inferred vision');
  await p.addScriptTag({url:base+'/project/components/bundle.js'});const taste=await p.evaluate(()=>Depthfield.taste({log:false}));fs.writeFileSync(`${out}/taste.json`,JSON.stringify(taste,null,2));ok(!taste.some(x=>x.severity==='warn'),'Depthfield taste has no warning');
  ok(!errors.length,'all comparison paths no script errors');await c.close();
 }
 {
  const {c,p,errors}=await setup({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await c.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage intentionally unavailable');}});Object.defineProperty(window,'sessionStorage',{get(){throw new Error('storage intentionally unavailable');}});});await load(p);await p.locator('#quiet').tap();await p.locator('#trace').tap();ok((await p.evaluate(()=>HushRoom.snapshot())).trace,'touch and blocked storage reveal both');ok(!errors.length,'no storage dependency');await c.close();
 }
 {
  const {c,p}=await setup({javaScriptEnabled:false,viewport:{width:390,height:844}});await p.goto(base+'/hush-room/');await p.locator('.second-way summary').click();ok((await p.locator('.second-way').textContent()).includes('keeping the room company'),'no-JS complete story');ok(await p.locator('#poster').isVisible(),'no-JS original poster');ok(await p.locator('.controls').isHidden(),'no-JS no inert control buttons');await noOverflow(p,'no-JS no overflow');await p.screenshot({path:`${out}/no-js.png`,fullPage:true});await c.close();
 }
 if(kind==='chromium'){
  const {c,p}=await setup({forcedColors:'active',viewport:{width:390,height:844}});await load(p);await p.locator('#trace').click();ok(await p.locator('#trace').getAttribute('aria-pressed')==='true','forced colors has equal reveal');await noOverflow(p,'forced-colors no overflow');await p.screenshot({path:`${out}/forced-colors.png`,fullPage:true});await c.close();
 }
 // The exact packaged file works offline and makes no network requests.
 {
  const {c,p,errors}=await setup({viewport:{width:390,height:844}});let network=0;p.on('request',r=>{if(/^https?:/.test(r.url()))network++;});await p.goto('file://'+process.cwd()+'/hush-room-qa/The-Hush-Room-0.1.0.html');await p.waitForFunction(()=>window.HushRoom);await p.locator('#quiet').click();await p.locator('#trace').click();ok((await p.evaluate(()=>HushRoom.snapshot())).trace,'offline single file reveals both secrets');ok(network===0,'offline single file makes zero network requests');await noOverflow(p,'offline file fits phone');ok(!errors.length,'offline file no script errors');await c.close();
 }
 // Load existing surfaces without modifying their preferences or source.
 for(const path of ['/','/docs.html','/missing-page/']){const {c,p,errors}=await setup({viewport:{width:390,height:844}});await p.goto(base+path,{waitUntil:'networkidle'});await noOverflow(p,`${path}: existing page fits phone`);ok(!errors.length,`${path}: no script errors ${errors}`);await c.close();}
 await b.close();const report={browser:kind,checks:checks.length,results:checks,metrics,commit:process.env.GITHUB_SHA||'local'};fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{fs.writeFileSync(`${out}/failure.txt`,e.stack);console.error(e);process.exit(1);});

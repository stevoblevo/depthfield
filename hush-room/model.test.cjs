const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('./model.js');
function close(a,b,t=1e-7){assert.equal(a.length,b.length);a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<t,`${v} != ${b[i]}`));}
test('Independent red/green fixtures catch encoded-RGB and transpose mistakes',()=>{
 close(C.simulate([255,0,0],'protan'),[108.78516028625047,95.02684074297856,0]);
 close(C.simulate([0,255,0],'deutan'),[238.693016629301,214.00817251781015,58.44392573035105]);
 close(C.simulate([0,255,0],'tritan'),[0,247.0816177521814,216.65214940253554]);
});
test('Original and unknown modes preserve input without mutating it',()=>{const x=[11,89,241];close(C.simulate(x),x);close(C.simulate(x,'invalid'),x);assert.notEqual(C.simulate(x),x);});
test('sRGB transfer round-trip for all byte values',()=>{for(let x=0;x<=255;x++)assert.ok(Math.abs(C.encode(C.decode(x/255))*255-x)<1e-8);});
test('Neutral colours remain neutral within six-decimal matrix tolerance',()=>{for(const f of Object.keys(C.matrices))for(let n=0;n<=255;n++)close(C.simulate([n,n,n],f),[n,n,n],.002);});
test('Authored palette inputs are in gamut and target outputs nearly neutral',()=>{
 for(const family of ['protan','deutan'])for(let y=.01;y<.95;y+=.01)for(let t=-1;t<=1;t+=.05){const rgb=C.palette(family,y,t),out=C.simulate(rgb,family);assert.ok(rgb.every(v=>Number.isInteger(v)&&v>=0&&v<=255));assert.ok(Math.max(...out)-Math.min(...out)<1.25);}
});
test('Both signs are visibly chromatic, but model collapse is not a grayscale filter',()=>{
 for(const f of ['protan','deutan']){const rgb=C.palette(f,.2,-.9);assert.ok(Math.max(...rgb)-Math.min(...rgb)>90);const other=C.simulate(rgb,f==='protan'?'deutan':'protan');assert.ok(Math.max(...other)-Math.min(...other)>15);}
 const tritan=C.simulate([220,40,130],'tritan');assert.ok(Math.max(...tritan)-Math.min(...tritan)>90);
});
test('Pixel transform preserves alpha and leaves original pixel bytes alone',()=>{const a=new Uint8ClampedArray([255,0,0,17,0,255,0,0]);C.transformPixels(a,'protan');assert.equal(a[3],17);assert.equal(a[7],0);assert.deepEqual([...a.slice(0,3)],[109,95,0]);const b=new Uint8ClampedArray([14,52,98,19]);C.transformPixels(b,'original');assert.deepEqual([...b],[14,52,98,19]);});
test('Deterministic scene noise is stable across model and palette changes',()=>{const a=C.rng(2086),b=C.rng(2086);for(let i=0;i<10000;i++){const v=a();assert.equal(v,b());assert.ok(v>=0&&v<1);}});
test('Geometric reveals have explicit interiors and exclusions',()=>{assert.ok(C.isDoor(405,450));assert.ok(!C.isDoor(550,450));assert.ok(C.isMoth(810,400));assert.ok(!C.isMoth(980,400));});
test('Public model metadata is immutable',()=>{assert.ok(Object.isFrozen(C)&&Object.isFrozen(C.matrices)&&Object.isFrozen(C.directions.protan));});

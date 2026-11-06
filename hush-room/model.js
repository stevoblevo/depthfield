/* plan D6 candidate: art-only colour model, Machado et al. (2009), severity 1.
   Not diagnostic. All RGB transforms are performed in linear sRGB. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HushColor = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const VERSION = '0.1.0';
  const matrices = Object.freeze({
    protan: Object.freeze([.152286,1.052583,-.204868,.114503,.786281,.099216,-.003882,-.048116,1.051998]),
    deutan: Object.freeze([.367322,.860646,-.227968,.280085,.672501,.047413,-.011820,.042940,.968881]),
    tritan: Object.freeze([1.255528,-.076749,-.178779,-.078411,.930809,.147602,.004733,.691367,.303900])
  });
  // Near-null directions of the severity-1 matrices. Neutral level is preserved.
  const directions = Object.freeze({protan:Object.freeze([-1,.14525328,.00295345]),deutan:Object.freeze([1,-.41865151,.03075403])});
  const clamp = x => Math.min(1,Math.max(0,x));
  const decode = x => x <= .04045 ? x/12.92 : ((x+.055)/1.055)**2.4;
  const encode = x => x <= .0031308 ? 12.92*x : 1.055*x**(1/2.4)-.055;
  function simulate(rgb, mode = 'original') {
    if (!matrices[mode]) return rgb.slice();
    const [r,g,b] = rgb.map(v => decode(clamp(v/255))), m = matrices[mode];
    return [0,3,6].map(i => 255*encode(clamp(m[i]*r+m[i+1]*g+m[i+2]*b)));
  }
  function palette(family, level, chroma) {
    const v=directions[family] || directions.protan;
    const y=Math.min(.96,Math.max(.005,level)), t=Math.min(1,Math.max(-1,chroma));
    const sign=t<0?-1:1;
    const max=Math.min(...v.map(k=>{k*=sign;return k>0?(1-y)/k:k<0?y/-k:Infinity;}));
    return v.map(k=>Math.round(255*encode(clamp(y+k*max*t*.94))));
  }
  function transformPixels(data,mode) {
    if(!matrices[mode])return data;
    for(let i=0;i<data.length;i+=4){const c=simulate([data[i],data[i+1],data[i+2]],mode);data[i]=Math.round(c[0]);data[i+1]=Math.round(c[1]);data[i+2]=Math.round(c[2]);}
    return data;
  }
  function rng(seed){let s=seed>>>0;return ()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296;};}
  function isDoor(x,y){return x>338&&x<472&&y<616&&y>360 && (y>425||((x-405)/67)**2+((y-425)/65)**2<1);}
  function isMoth(x,y){const dx=(x-810)/120,dy=(y-397)/72;return ((dx+.53)**2/.53**2+(dy+.05)**2/.88**2<1)||((dx-.53)**2/.53**2+(dy+.05)**2/.88**2<1)||(Math.abs(dx)<.075&&Math.abs(dy)<.85);}
  return Object.freeze({VERSION,matrices,directions,decode,encode,simulate,palette,transformPixels,rng,isDoor,isMoth});
});

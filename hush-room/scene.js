/* plan D6 candidate: no storage, analytics, scoring, timers, audio or game-state writes. */
(function () {
'use strict';
const $=id=>document.getElementById(id), C=window.HushColor;
const canvas=$('art'), ctx=canvas.getContext('2d',{willReadFrequently:true});
if(!ctx||!C){$('status').textContent='The drawing is unavailable here. Read the complete little story below for the same discoveries.';document.querySelectorAll('.controls button,#vision').forEach(e=>e.disabled=true);return;}
document.documentElement.classList.add('js');
let family='protan',mode='original',trace=false,drawCount=0;
const names={original:'Original colours',protan:'Approx. protanopia',deutan:'Approx. deuteranopia',tritan:'Approx. tritanopia'};
function paint(){
 const r=C.rng(2086), g=ctx;g.clearRect(0,0,1200,760);
 const color=(y,t)=>`rgb(${C.palette(family,y,t).join(',')})`;
 function poly(points,y,t){g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fillStyle=color(y,t);g.fill();}
 function line(points,y,t,width=1){g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.strokeStyle=color(y,t);g.lineWidth=width;g.stroke();}
 // Integer scanline discs avoid gamma-encoded antialias blends leaking a door outline.
 function dot(x,y,radius){for(let yy=Math.ceil(y-radius);yy<=Math.floor(y+radius);yy++){const half=Math.sqrt(Math.max(0,radius*radius-(yy-y)**2));const left=Math.ceil(x-half),right=Math.floor(x+half);if(right>=left)g.fillRect(left,yy,right-left+1,1);}}
 g.fillStyle=color(.012,.25);g.fillRect(0,0,1200,760);
 // Three architectural planes, all authored in the same linear-light family.
 poly([[0,0],[1200,0],[1005,110],[195,110]],.025,.88);
 poly([[0,0],[195,110],[195,610],[0,760]],.04,-.8);
 poly([[1200,0],[1005,110],[1005,610],[1200,760]],.038,.82);
 poly([[195,110],[1005,110],[1005,610],[195,610]],.071,.8);
 poly([[195,610],[1005,610],[1200,760],[0,760]],.047,.25);
 for(let i=0;i<13;i++){const x=i*100;line([[600+(x-600)*.65,610],[x,760]],.13,-.6,1.5);}
 for(let i=0;i<4;i++){const y=617+(i/3)**1.5*143;line([[0,y],[1200,y]],.13,-.3,1);}
 // Tall colour-bearing ribs frame the two independently revealable secrets.
 for(let i=0;i<9;i++){let x=217+i*96;poly([[x,128],[x+9,128],[x+9,603],[x,603]],.095,i%2?.95:-.95);}
 poly([[267,213],[545,213],[545,616],[267,616]],.19,.83);
 poly([[647,213],[972,213],[972,616],[647,616]],.19,-.83);
 // Equal level distributions on either side of the door's chromatic boundary.
 for(let y=228;y<613;y+=12)for(let x=280;x<541;x+=12){
  const xx=x+(r()-.5)*5, yy=y+(r()-.5)*5, lum=.13+r()*.15;
  g.fillStyle=color(lum,C.isDoor(xx,yy)?-.93:.9);dot(xx,yy,3.6+r()*1.7);
 }
 // The moth's weak lightness signal survives while hue noise converges.
 for(let y=227;y<610;y+=11)for(let x=660;x<964;x+=11){
  const xx=x+(r()-.5)*4,yy=y+(r()-.5)*4;
  const lum=(C.isMoth(xx,yy)?.31:.215)+(r()-.5)*.043;
  g.fillStyle=color(lum,r()*2-1);dot(xx,yy,3.4+r()*1.5);
 }
 // Hanging lanterns and a low reflective threshold, never gameplay signals.
 [275,925].forEach((x,i)=>{line([[x,0],[x,137]],.23,-.9,2);poly([[x-22,137],[x+22,137],[x+28,182],[x-28,182]],.54,i?.9:-.9);poly([[x-27,181],[x+27,181],[x+35,190],[x-35,190]],.15,-.8);});
 poly([[316,617],[494,617],[548,655],[280,655]],.10,-.93);
 poly([[328,617],[480,617],[499,630],[314,630]],.28,-.8);
 for(let i=0;i<35;i++){const x=205+r()*790,y=117+r()*80;g.fillStyle=color(.15+r()*.18,r()*1.8-.9);g.fillRect(x,y,1+r()*2,1+r()*2);}
 if(mode!=='original'){const img=g.getImageData(0,0,1200,760);C.transformPixels(img.data,mode);g.putImageData(img,0,0);}
 if(trace){
  function outline(fn){g.beginPath();fn();g.strokeStyle='#050505';g.lineWidth=10;g.stroke();g.strokeStyle='#ffffff';g.lineWidth=4;g.stroke();}
  outline(()=>{g.moveTo(338,616);g.lineTo(338,425);g.bezierCurveTo(338,338,472,338,472,425);g.lineTo(472,616);g.closePath();});
  outline(()=>{g.moveTo(810,397);g.bezierCurveTo(670,270,650,435,795,459);g.lineTo(810,397);g.bezierCurveTo(950,270,970,435,825,459);g.closePath();});
  outline(()=>{g.moveTo(810,345);g.lineTo(810,458);g.moveTo(810,353);g.lineTo(795,331);g.moveTo(810,353);g.lineTo(825,331);});
 }
 drawCount++;
}
function update(message){
 $('room-title').textContent=family==='protan'?'01 / The copper lantern':'02 / The moss room';
 $('family-note').textContent=`A palette tuned for the ${family==='protan'?'protanopia':'deuteranopia'} approximation.`;
 $('vision').value=mode;$('stamp').textContent=names[mode];
 $('quiet').innerHTML=mode===family?'Restore the colour <span aria-hidden="true">↗</span>':'Quiet the colour <span aria-hidden="true">↗</span>';
 $('quiet').setAttribute('aria-label',mode===family?'Restore original art colours':`Quiet the colour using the ${family==='protan'?'protanopia':'deuteranopia'} approximation`);
 $('trace').setAttribute('aria-pressed',String(trace));$('trace').textContent=trace?'Hide the outlines':'Trace both secrets';
 $('change-room').textContent=family==='protan'?'Enter the moss room':'Return to the copper room';
 if(message)$('status').textContent=message;
 paint();
}
$('quiet').addEventListener('click',()=>{mode=mode===family?'original':family;update(mode==='original'?'Original colours restored. The two secrets and their outlines are still available.':`The ${family==='protan'?'protanopia':'deuteranopia'} model quiets this palette toward gray. The door fades; the moth keeps its lightness pattern. This is an approximation.`);});
$('trace').addEventListener('click',()=>{trace=!trace;update(trace?'The door is outlined on the left; the moth is outlined on the right. The moth was keeping the room company.':'The outlines are hidden again. You can reveal them at any time.');});
$('change-room').addEventListener('click',()=>{family=family==='protan'?'deutan':'protan';mode='original';trace=false;update('A different palette, the same room. Original colours restored. Try quieting the colour, or trace both secrets.');});
$('vision').addEventListener('change',e=>{mode=e.target.value;update(mode==='original'?'Original colours restored.':`${names[mode]} applied to the art only. ${mode===family?'This is the matching model for the current palette.':'This is a comparison, not the matching model for this palette.'} No inference is made about your vision.`);});
$('theme').addEventListener('change',e=>{document.documentElement.dataset.theme=e.target.value;});
window.HushRoom=Object.freeze({snapshot:()=>Object.freeze({family,mode,trace,drawCount,version:C.VERSION})});
update();
})();

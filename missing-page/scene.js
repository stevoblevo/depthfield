/* plan D1: an original playable chapter. Existing kit APIs; isolated local progress. */
(function () {
  'use strict';
  const D = window.Depthfield, M = window.MissingPage;
  if (!D || !M) return;
  const $ = s => document.querySelector(s), all = s => Array.from(document.querySelectorAll(s));
  let storage; try { storage = window.localStorage; } catch (_) { storage = null; }
  const saved = M.read(storage); let state = saved.state, persistent = saved.available;
  const returned = state.complete, reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const positions = ['I · gutter', 'II · window', 'III · channel', 'IV · buttress'];
  const receipts = [
    { id: 'glass', name: 'Glass repairs', color: '#b8d6ca', body: 'Six clear panes washed.\nOne blind pane painted again.', detail: 'The paint was ordered, not an accident. The counter faces the outer glass.' },
    { id: 'oil', name: 'Lamp oil', color: '#94bce0', body: 'Passage lamp: one measure.\nRoom 07: none.', detail: 'A lamp can light more than the room it stands in.' },
    { id: 'blankets', name: 'Blankets', color: '#d4bd85', body: 'Night issue · 07\nSeven blankets. Seven bowls.\nLamp oil: none.', detail: 'Return nothing before dawn. Initialled by the keeper, in the census clerk’s ink.' }
  ];
  const pets = [
    {id:'glass-bloom', name:'Glass bloom', color:'#b8d6ca', kind:'spore'},
    {id:'mint-spore', name:'Mint spore', color:'#7ccba6', kind:'spore'},
    {id:'frost-seed', name:'Frost seed', color:'#a8cce9', kind:'spore'},
    {id:'winkle', name:'Winkle', color:'#b8a1d5', kind:'eye'},
    {id:'firefly', name:'Firefly', color:'#e9bb78', kind:'fly'}
  ];
  let found = {}; try { const p = JSON.parse(storage.getItem('crossing:pets')); if (p && p.found && typeof p.found === 'object') found = p.found; } catch (_) {}
  const eligible = pets.filter(p => !!found['df:' + p.id]);
  if (!eligible.some(p => p.id === state.guardian)) state.guardian = 'none';
  eligible.forEach(p => { const option = document.createElement('option'); option.value = p.id; option.textContent = p.name; $('#guardian-select').append(option); });
  const hintText = [
    ['The census rule is written near the glasshouse.', 'Read the margin, using the marked button.', 'Press “Read the margin”. Covered lights are not counted.'],
    ['The wall is the oldest layer of the plan.', 'Select Wall. Compare the four section positions.', 'Select Wall and move Section position to III · channel.'],
    ['Supply records can say what a room is for.', 'One thread carries blankets rather than glass or oil.', 'Open Blankets from the thread list. Its receipt names room 07.'],
    ['Separate a direct fact from a likely purpose.', 'The plan proves there is a room. Blankets alone do not prove who is in it.', 'Choose “The seventh room does not exist”, then connect the evidence.'],
    ['The counter only sees outside windows.', 'Passage light can reach 07 without passing through its outer pane.', 'Choose “Cover the pane; keep the passage lit”, then “Keep this arrangement”.']
  ];
  const evidence = {
    rule: ['The counter reads outer glass. Covered light does not enter its count.', 'Not yet found. Read the margin on the glasshouse.'],
    room: ['Room 07 is behind the wall. A channel borrows passage light. Its outer pane is black.', 'Not yet found. Separate the wall and align the section drawing.'],
    receipt: ['Seven blankets and seven bowls go to 07. No lamp oil. Return nothing before dawn.', 'Not yet found. Open the blanket thread.']
  };
  D.init();
  const queryTheme = new URLSearchParams(location.search).get('theme');
  function setTheme(value) { D.theme.set(value === 'contrast' ? {skin:'contrast',face:'night'} : {skin:'mint',face:value === 'day' ? 'day' : 'night'}, false); $('#theme').value = value; }
  setTheme(['night','day','contrast'].includes(queryTheme) ? queryTheme : 'night');
  $('#theme').addEventListener('change', e => setTheme(e.target.value));
  // No sound or haptic permission is requested by this chapter.
  D.haptic.off = true; D.tone.enable(false);
  let lamp, cloth, guardian, pop;
  const stack = D.stack($('#section-stack'));
  lamp = D.lamp($('#glasshouse'), {room:.96, radius:.5, floor:.64, onMove(u,v,room) {
    const brightness = room * (.64 + .36 * Math.exp(-((.5-u)**2 + (.5-v)**2)/.25));
    $('#glasshouse').style.setProperty('--mp-reflection', brightness.toFixed(3));
  }});
  $('#glasshouse').addEventListener('pointerdown', e => { const r = e.currentTarget.getBoundingClientRect(); if (r.width && r.height) lamp.at((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height); });
  function announce(text) { if (text) $('#announcement').textContent = text; }
  function save() { persistent = M.write(storage,state); }
  function dispatch(event, target) {
    const result = M.transition(state,event); state = result.state; save(); render();
    if (target && result.message) $(target).textContent = result.message;
    if (result.found) announce('Field note found. ' + result.message);
    return result;
  }
  function readMargin() { lamp.at(.76,.78); dispatch({type:'margin'}); }
  $('#read-margin').addEventListener('click',readMargin);
  $('#read-margin-copy').addEventListener('click', () => { readMargin(); $('#margin-note').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'}); });
  all('[data-layer]').forEach(b => b.addEventListener('click', () => dispatch({type:'layer',layer:b.dataset.layer})));
  $('#alignment').addEventListener('input',e => dispatch({type:'align',value:Number(e.target.value)}));
  function openReceipt(id) {
    const r = receipts.find(x => x.id === id); if (!r) return;
    $('#receipt-title').textContent = r.name; $('#receipt-body').textContent = r.body; $('#receipt-detail').textContent = r.detail;
    all('[data-receipt]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.receipt===id)));
    dispatch({type:'receipt',id}); announce(r.name + '. ' + r.body.replace(/\n/g,' ') + ' ' + r.detail);
  }
  function mountCloth() {
    if (cloth) return;
    const c = $('#receipt-cloth'); if (!c.getContext('2d')) return;
    cloth = D.cloth(c,{threads:receipts,bands:[{name:'Night issue',color:'#7baa95'},{name:'Dawn return',color:'#b7b28e'}],cols:7,rows:22,intro:false,onPluck:thread => openReceipt(thread.id)});
  }
  all('[data-receipt]').forEach((b,i) => b.addEventListener('click', () => { mountCloth(); if (cloth) cloth.pluck(i); openReceipt(b.dataset.receipt); }));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { mountCloth(); observer.disconnect(); } }, {rootMargin:'200px'}); observer.observe($('#threads'));
  } else mountCloth();
  $('#connect').addEventListener('click', () => {
    const choice = $('input[name=claim]:checked');
    if (!choice) { $('#deduction-response').textContent = 'Choose a claim to compare with the evidence.'; return; }
    const was = state.deduced; dispatch({type:'deduce',claim:choice.value},'#deduction-response');
    if (!was && state.deduced) announce('The seventh room is found. The next section, A borrowed light, is now open.');
  });
  $('#hint').addEventListener('click', () => dispatch({type:'hint'}));
  all('[data-light-choice]').forEach(b => b.addEventListener('click', () => dispatch({type:'trial',action:b.dataset.lightChoice},'#light-response')));
  $('#keep-room').addEventListener('click', () => { const was = state.complete; dispatch({type:'keep'},'#light-response'); if (!was && state.complete) { getPop().open(); $('#ending-title').focus(); announce('The missing page is kept. Six windows. Seven blankets.'); } });
  function getPop() { if (!pop) pop = D.popup($('#refuge-book'),{auto:false,open:returned?1:0}); return pop; }
  $('#open-book').addEventListener('click', () => getPop().open());
  $('#close-book').addEventListener('click', () => getPop().close());
  $('#retry-light').addEventListener('click', () => { dispatch({type:'retry'},'#light-response'); $('#keep-room').focus(); });
  $('#guardian-select').addEventListener('change', e => dispatch({type:'guardian',id:eligible.some(p=>p.id===e.target.value)?e.target.value:'none'}));
  const stage = $('#guardian-stage'), line = document.createElement('p'), still = document.createElement('button');
  line.className='mp-keeper-line'; line.setAttribute('role','status'); stage.append(line);
  still.type='button'; still.className='mp-guardian-static'; still.hidden=true; stage.append(still);
  let keeperLine = 0, lastKeeper = null;
  function keeperSays() { line.textContent = ['Six on the ledger. I checked the room.','The shade stays down.','Blankets accounted for. Occupants excused.'][keeperLine++%3]; }
  still.addEventListener('click',keeperSays);
  // One stable glyph: the kit retains pupil/lid nodes, so they are never replaced.
  const glyph = '<svg viewBox="0 0 80 80" width="64" height="64" aria-hidden="true"><g class="mp-keeper-spore" stroke="currentColor" stroke-width="2"><circle cx="40" cy="40" r="25" fill="currentColor" opacity=".15"/><path d="M40 19V9M40 61V71M22 30L13 25M58 50L67 55M22 50L13 55M58 30L67 25"/><circle cx="40" cy="40" r="8" fill="currentColor"/></g><g class="mp-keeper-eye"><ellipse cx="40" cy="40" rx="25" ry="16" fill="#e9f5ef"/><g data-df-pupil><circle cx="40" cy="40" r="11" fill="currentColor"/><circle cx="40" cy="40" r="5" fill="#07110f"/></g><ellipse cx="40" cy="40" rx="25" ry="16" fill="none" stroke="currentColor" stroke-width="2"/></g><g class="mp-keeper-fly" fill="currentColor"><circle cx="40" cy="40" r="26" opacity=".18"/><circle cx="40" cy="40" r="13" opacity=".55"/><circle cx="40" cy="40" r="5" fill="#fff8e8"/></g></svg>';
  function renderKeeper() {
    const p = eligible.find(p => p.id === state.guardian), active = state.complete && !!p;
    still.hidden = !active || !reduced.matches;
    if (guardian) guardian.el.hidden = !active || reduced.matches;
    if (!active) { lastKeeper=null; line.textContent = 'The perch is ready. Nobody has to stay.'; return; }
    if (!reduced.matches && !guardian) {
      guardian = D.guardian({host:stage,svg:glyph,label:'The keeper. Press for a note.',home:[.66,.66],follow:()=>null,onPress:keeperSays});
      guardian.el.addEventListener('click', e => { if (e.detail === 0) keeperSays(); });
    }
    const button = reduced.matches ? still : guardian.el;
    if (reduced.matches && !still.firstChild) still.innerHTML=glyph;
    button.hidden=false; button.dataset.kind=p.kind; button.style.color=p.color; button.setAttribute('aria-label',p.name+'. Press for the keeper’s note.');
    if (lastKeeper !== p.id) { line.textContent=p.name+' keeps the shade in place.'; lastKeeper=p.id; }
  }
  reduced.addEventListener('change',renderKeeper);
  function render() {
    $('#save-status').textContent = persistent ? 'Progress stays only in this browser.' : 'Progress lasts for this visit. Browser storage is unavailable.';
    $('#clue-count').textContent = String(state.clues.length).padStart(2,'0')+' / 03';
    $('#margin-note').hidden = !state.clues.includes('rule'); $('#room-note').hidden = !state.clues.includes('room');
    all('[data-evidence]').forEach(el => { const present=state.clues.includes(el.dataset.evidence); el.classList.toggle('is-found',present); el.querySelector('p').textContent=evidence[el.dataset.evidence][present?0:1]; });
    all('[data-layer]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.layer===state.layer)));
    $('#alignment').value=String(state.alignment); $('#alignment-value').textContent=positions[state.alignment]; $('#alignment').setAttribute('aria-valuetext',positions[state.alignment]);
    $('#section-stack').dataset.layer=state.layer;
    $('#section-stack').classList.toggle('is-aligned',state.layer==='wall' && state.alignment===2);
    $('#section-stack').style.setProperty('--mp-channel',[22,34,44,60][state.alignment]+'%');
    stack.focus({glass:2,passage:1,wall:0}[state.layer]);
    const n=M.stage(state), h=state.hints[n]; $('#hint-copy').textContent=h?hintText[n][h-1]:''; $('#hint').textContent=h>=3?'Show the answer again':h?'Show the next hint':'Show a hint';
    $('#refuge').hidden=!state.deduced; $('#ending').hidden=!state.complete;
    $('#light-lab').dataset.light=state.trial||'none'; $('#census-reading').textContent=state.trial==='exposed'?'07':'06'; $('#room-reading').textContent=!state.trial?'Waiting':state.trial==='dark'?'Dark':'Lit';
    all('[data-light-choice]').forEach(b => { b.setAttribute('aria-pressed',String(b.dataset.lightChoice===state.trial)); b.disabled=state.complete; });
    $('#keep-room').disabled=state.complete; $('#return-note').hidden=!(returned&&state.complete); $('#guardian-select').value=state.guardian;
    if (state.complete) getPop(); renderKeeper();
  }
  $('#reset-open').addEventListener('click', () => { $('#reset-confirm').hidden=false; $('#reset-cancel').focus(); });
  $('#reset-cancel').addEventListener('click', () => { $('#reset-confirm').hidden=true; $('#reset-open').focus(); });
  $('#reset-yes').addEventListener('click', () => {
    state=M.fresh(); save(); $('#reset-confirm').hidden=true;
    all('input[name=claim]').forEach(r=>r.checked=false); all('[data-receipt]').forEach(b=>b.setAttribute('aria-pressed','false'));
    $('#receipt-title').textContent='No thread open'; $('#receipt-body').textContent='The cloth and the list lead to the same records.'; $('#receipt-detail').textContent='Nothing leaves this page.';
    $('#deduction-response').textContent=''; $('#light-response').textContent=''; if(pop) pop.to(0,1); render(); announce('This case is clear. Existing night pets are unchanged.'); $('#read-margin-copy').focus();
  });
  render();
})();

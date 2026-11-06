/* plan D1: The Missing Page. Pure, versioned mystery state; no browser access. */
(function (root, make) {
  const api = make();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MissingPage = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const KEY = 'crossing:df-missing-page:v1';
  const CLUES = ['rule', 'room', 'receipt'];
  const LAYERS = ['glass', 'passage', 'wall'];
  const ACTIONS = ['dark', 'exposed', 'sheltered'];
  function fresh() { return { version: 1, clues: [], layer: 'glass', alignment: 0, deduced: false, trial: null, complete: false, guardian: 'none', hints: [0, 0, 0, 0, 0] }; }
  function normalize(input) {
    const s = fresh();
    if (!input || typeof input !== 'object' || Array.isArray(input) || input.version !== 1) return s;
    s.clues = CLUES.filter(x => Array.isArray(input.clues) && input.clues.includes(x));
    s.layer = LAYERS.includes(input.layer) ? input.layer : 'glass';
    s.alignment = Number.isInteger(input.alignment) && input.alignment >= 0 && input.alignment <= 3 ? input.alignment : 0;
    s.deduced = input.deduced === true && s.clues.length === 3;
    s.trial = s.deduced && ACTIONS.includes(input.trial) ? input.trial : null;
    s.complete = input.complete === true && s.deduced && s.trial === 'sheltered';
    s.guardian = ['none', 'glass-bloom', 'mint-spore', 'frost-seed', 'winkle', 'firefly'].includes(input.guardian) ? input.guardian : 'none';
    s.hints = s.hints.map((_, i) => Array.isArray(input.hints) && Number.isInteger(input.hints[i]) ? Math.min(3, Math.max(0, input.hints[i])) : 0);
    return s;
  }
  function stage(s) { return !s.clues.includes('rule') ? 0 : !s.clues.includes('room') ? 1 : !s.clues.includes('receipt') ? 2 : !s.deduced ? 3 : 4; }
  function transition(input, event) {
    const s = normalize(input), e = event || {}; let message = '', found = null;
    function discover(id) { if (!s.clues.includes(id)) { s.clues.push(id); s.clues = CLUES.filter(x => s.clues.includes(x)); found = id; } }
    if (e.type === 'margin') { discover('rule'); message = 'The counter reads the glass. A covered light does not enter its count.'; }
    if (e.type === 'layer' && LAYERS.includes(e.layer)) s.layer = e.layer;
    if (e.type === 'align' && Number.isInteger(e.value) && e.value >= 0 && e.value <= 3) s.alignment = e.value;
    if ((e.type === 'align' || e.type === 'layer') && s.layer === 'wall' && s.alignment === 2) { discover('room'); message = 'Room 07 sits behind the wall. A narrow channel borrows light from the passage.'; }
    if (e.type === 'receipt' && e.id === 'blankets') { discover('receipt'); message = 'Seven blankets go to 07. No lamp oil. Someone expects them back after dawn.'; }
    if (e.type === 'deduce') {
      if (s.clues.length < 3) message = 'The record is incomplete. Read the margin, find the recess, and inspect the blanket thread.';
      else if (e.claim === 'absent') { s.deduced = true; message = 'The room exists. The keepers omitted it. Its borrowed light explains the empty oil column.'; }
      else if (e.claim === 'unlit') message = 'No lamp oil does not mean no light. The passage has a channel into 07.';
      else message = 'Blankets suggest a purpose. The plan is the direct proof: a seventh room exists.';
    }
    if (e.type === 'trial' && s.deduced && !s.complete && ACTIONS.includes(e.action)) {
      s.trial = e.action;
      message = e.action === 'dark' ? 'The count stays at 06. Room 07 loses its borrowed light.' : e.action === 'exposed' ? 'Room 07 is lit. Its outer window takes the count to 07.' : 'The outer pane is covered. Passage light still reaches 07. The counter sees six windows.';
    }
    if (e.type === 'keep') {
      if (s.deduced && s.trial === 'sheltered') { s.complete = true; message = 'Room 07 is kept. Six windows in the census. Seven blankets behind the wall.'; }
      else message = 'Keep 07 lit without lighting another outer window. The three lighting choices can be tried again.';
    }
    if (e.type === 'retry') { s.complete = false; s.trial = null; message = 'The room stays found. Try its lighting again.'; }
    if (e.type === 'guardian' && ['none', 'glass-bloom', 'mint-spore', 'frost-seed', 'winkle', 'firefly'].includes(e.id)) s.guardian = e.id;
    if (e.type === 'hint') { const n = stage(s); s.hints[n] = Math.min(3, s.hints[n] + 1); }
    return { state: s, message, found };
  }
  function read(storage) {
    try { const raw = storage.getItem(KEY); return { state: raw ? normalize(JSON.parse(raw)) : fresh(), available: true }; }
    catch (_) { return { state: fresh(), available: false }; }
  }
  function write(storage, s) { try { storage.setItem(KEY, JSON.stringify(normalize(s))); return true; } catch (_) { return false; } }
  return { KEY, CLUES, LAYERS, ACTIONS, fresh, normalize, transition, stage, read, write };
});

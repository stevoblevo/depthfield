/* Depthfield · axes: the five-axis strip (plan D2). A world has five things a hand can move: x, depth, time, look and
   memory. The strip reads all five on one line and lets each be moved from it, so every gesture in a world has a
   second way in that a keyboard and a screen reader can use.
   Depthfield.axes(el, state, opts) -> { el, update(live), set(id, v), destroy() }
     el      an empty element (the strip is built in it) or one that already holds [data-axis] rows (they are bound)
     state   a plain object { x, depth, time, look, memory }; read on every update(), written when a slider moves.
             Leave it null and give opts.get and opts.set to keep the numbers somewhere else.
     opts    { axes:   [{ id, label, min, max, step }] to rename, re-range or drop axes (default: the five below),
               text:   function (id, value) -> the readout (default: a short number),
               get:    function (id) -> number,   set: function (id, value),
               live:   the id of the axis the scene is teaching now (it takes the accent),
               label:  the strip's accessible name (default 'Five axes'),
               readonly: true for a readout that cannot be moved }
   Call update() once a frame, or whenever the state changes; it writes to the page only when a value has changed.
   An add-on like pen.js: load it after bundle.js, or alone. It carries its own few rules and reads the kit's tokens
   where they exist (chrome, line, ink, ink-muted, accent, surface-raised, font-mono), with night values where not. */
(function (w) {
  'use strict';
  var D = w.Depthfield = w.Depthfield || {};
  if (D.axes) return;
  var VERSION = '0.2.0';
  var FIVE = [
    { id: 'x', label: 'x', min: -1, max: 1, step: 0.001 },
    { id: 'depth', label: 'depth', min: 0, max: 1, step: 0.001 },
    { id: 'time', label: 'time', min: -1, max: 1, step: 0.01 },
    { id: 'look', label: 'look', min: 0, max: 6, step: 1 },
    { id: 'memory', label: 'memory', min: 0, max: 1, step: 0.01 }
  ];
  var CSS = [
    '.df-axes{margin:0;padding:10px 12px 8px;border:1px solid var(--line,#23352f);border-radius:10px;background:var(--chrome,rgba(20,36,32,.86));color:var(--ink,#e9f5ef);display:grid;grid-template-columns:repeat(var(--df-axes-n,5),minmax(0,1fr));gap:12px;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}',
    '.df-axis{display:grid;gap:0;min-width:0;border:0;margin:0;padding:0}',
    '.df-axis__name{font-family:var(--font-mono,ui-monospace,Menlo,monospace);font-size:10px;line-height:14px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-muted,#93aaa1);display:flex;align-items:center;gap:5px;white-space:nowrap}',
    '.df-axis__name::before{content:"";width:5px;height:5px;border-radius:50%;border:1px solid var(--ink-muted,#93aaa1);flex:none}',
    '.df-axis.is-live .df-axis__name{color:var(--ink,#e9f5ef)}',
    '.df-axis.is-live .df-axis__name::before{background:var(--accent,#5ef2b8);border-color:var(--accent,#5ef2b8)}',
    '.df-axis output{font-family:var(--font-mono,ui-monospace,Menlo,monospace);font-size:12px;line-height:16px;font-variant-numeric:tabular-nums;color:var(--ink,#e9f5ef);white-space:nowrap;overflow:hidden}',
    '.df-axis input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:30px;margin:0;background:transparent;cursor:ew-resize;touch-action:none;--df-thumb:var(--ink,#e9f5ef)}',
    '.df-axis.is-live input[type=range]{--df-thumb:var(--accent,#5ef2b8)}',
    '.df-axis input[type=range]:disabled{cursor:default}',
    '.df-axis input[type=range]::-webkit-slider-runnable-track{height:2px;background:var(--ink-muted,#93aaa1);border-radius:1px}',
    '.df-axis input[type=range]::-moz-range-track{height:2px;background:var(--ink-muted,#93aaa1);border-radius:1px}',
    '.df-axis input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;margin-top:-6px;border-radius:50%;background:var(--df-thumb);border:2px solid var(--surface-raised,#142420)}',
    '.df-axis input[type=range]::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:var(--df-thumb);border:2px solid var(--surface-raised,#142420)}',
    '.df-axis input[type=range]:focus-visible{outline:2px solid var(--focus,#c9e6ff);outline-offset:1px;border-radius:6px}'
  ].join('\n');
  var styled = false, seq = 0;
  function style() {
    if (styled || !w.document) return; styled = true;
    var s = document.createElement('style'); s.setAttribute('data-df', 'axes'); s.textContent = CSS;
    document.head.insertBefore(s, document.head.firstChild);     /* first, so a page's own rules win */
  }
  function short(v) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(2); }

  D.axes = function (el, state, opts) {
    opts = opts || {};
    if (!el) return null;
    style();
    var list = opts.axes || FIVE, rows = {}, busy = {}, offs = [], live = opts.live || null, n = ++seq;
    var get = opts.get || function (id) { return state ? +state[id] || 0 : 0; };
    var set = opts.set || function (id, v) { if (state) state[id] = v; };
    var text = opts.text || function (id, v) { return short(v); };
    function on(node, ev, fn) { node.addEventListener(ev, fn); offs.push(function () { node.removeEventListener(ev, fn); }); }
    var made = !el.querySelector('[data-axis]');
    if (made) {
      list.forEach(function (a) {
        var f = document.createElement('fieldset'), id = 'df-axis-' + n + '-' + a.id;
        f.className = 'df-axis'; f.setAttribute('data-axis', a.id);
        f.innerHTML = '<label class="df-axis__name" for="' + id + '"></label><input type="range" id="' + id + '"><output for="' + id + '"></output>';
        f.firstChild.textContent = a.label || a.id;
        var i = f.querySelector('input'); i.min = a.min; i.max = a.max; i.step = a.step; i.value = get(a.id);
        el.appendChild(f);
      });
    }
    el.classList.add('df-axes');
    if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) el.setAttribute('aria-label', opts.label || 'Five axes');
    if (el.tagName !== 'FORM' && !el.getAttribute('role')) el.setAttribute('role', 'group');
    Array.prototype.forEach.call(el.querySelectorAll('[data-axis]'), function (f) {
      var id = f.getAttribute('data-axis'), input = f.querySelector('input'), out = f.querySelector('output');
      if (!input) return;
      f.classList.add('df-axis');
      var name = f.querySelector('label'); if (name) name.classList.add('df-axis__name');
      rows[id] = { f: f, input: input, out: out, text: null };
      if (opts.readonly) { input.disabled = true; return; }
      on(input, 'input', function () { set(id, parseFloat(input.value)); });
      ['pointerdown', 'focus'].forEach(function (ev) { on(input, ev, function () { busy[id] = true; }); });
      ['pointerup', 'pointercancel', 'blur', 'change'].forEach(function (ev) { on(input, ev, function () { busy[id] = false; }); });
    });
    var count = Object.keys(rows).length;
    if (count !== 5) el.style.setProperty('--df-axes-n', count);
    if (el.tagName === 'FORM') on(el, 'submit', function (e) { e.preventDefault(); });
    var api = {
      el: el, version: VERSION,
      update: function (now) {
        if (now !== undefined) live = now;
        for (var id in rows) {
          var r = rows[id], v = get(id), t = String(text(id, v));
          if (!busy[id] && Math.abs(parseFloat(r.input.value) - v) > 1e-4) r.input.value = v;
          if (t !== r.text) { r.text = t; if (r.out) r.out.textContent = t; r.input.setAttribute('aria-valuetext', t); }
          r.f.classList.toggle('is-live', id === live);
        }
        return api;
      },
      set: function (id, v) { set(id, v); return api.update(); },
      destroy: function () { offs.forEach(function (f) { f(); }); offs = []; if (made) el.textContent = ''; }
    };
    return api.update();
  };
  D.axes.five = FIVE.map(function (a) { return a.id; });
  D.axesVersion = VERSION;
})(typeof window !== 'undefined' ? window : this);

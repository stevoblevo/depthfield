/* Site shell for a design system exported from a Claude Design System artifact.
   Reads site/site.json (written by site/build.py) and project/tokens.json, and hosts every
   preview the way the artifact does: tokens.css, bundle.css and bundle.js loaded first,
   <html data-theme> set to the chosen theme. */
(function () {
  'use strict';
  var S = null, T = null, theme = null;
  var main = document.getElementById('main');
  var cache = {};
  var KEY = 'site:theme:' + location.pathname;
  var MODEKEY = 'site:mode:' + location.pathname + ':';
  var modes = {};
  var ICON = {
    check: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    sun: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></g></svg>',
    moon: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'
  };

  function $(sel, el) { return (el || document).querySelector(sel); }
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null) continue;
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k === 'style') el.setAttribute('style', attrs[k]);
      else el.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function get(path, as) {
    var k = as + ':' + path;
    if (!cache[k]) cache[k] = fetch(path).then(function (r) {
      if (!r.ok) throw new Error(path + ' — ' + r.status);
      return as === 'json' ? r.json() : r.text();
    });
    return cache[k];
  }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function abs(p) { return new URL(p, location.href).href; }
  function slug(path) { return path.replace(/^project\//, '').replace(/\.md$/i, ''); }

  /* ---------- Markdown ---------- */
  function md(text, filePath) {
    var html = DOMPurify.sanitize(marked.parse(text, { gfm: true }));
    var wrap = h('div', { class: 'prose', html: html });
    var dir = filePath.replace(/[^/]+$/, '');
    wrap.querySelectorAll('table').forEach(function (t) {
      var w = h('div', { class: 'tablewrap' }); t.parentNode.insertBefore(w, t); w.appendChild(t);
    });
    wrap.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (/^[a-z]+:/i.test(href)) { a.target = '_blank'; a.rel = 'noopener'; return; }
      if (href.charAt(0) === '#') return;
      var target = new URL(href, abs(dir)).href.replace(abs(''), '');
      var mdTarget = target.split('#')[0];
      if (/\.md$/i.test(mdTarget)) {
        var comp = /^project\/components\/([^/]+)\/README\.md$/.exec(mdTarget);
        a.setAttribute('href', comp ? '#/components/' + comp[1] : '#/book/' + slug(mdTarget));
      } else a.setAttribute('href', target);
    });
    wrap.querySelectorAll('img[src]').forEach(function (img) {
      var src = img.getAttribute('src');
      if (!/^([a-z]+:|\/)/i.test(src)) img.src = new URL(src, abs(dir)).href;
    });
    return wrap;
  }

  /* ---------- Previews ---------- */
  function previewDoc(path) {
    return get(path, 'text').then(function (src) {
      var base = abs(path.replace(/[^/]+$/, ''));
      var head = '<base href="' + base + '">' +
        '<link rel="stylesheet" href="' + abs('project/tokens.css') + '">' +
        '<link rel="stylesheet" href="' + abs('project/components/bundle.css') + '">' +
        '<script src="' + abs('project/components/bundle.js') + '"><\/script>' +
        '<script>document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");' +
        'if(a&&/^#/.test(a.getAttribute("href")||""))e.preventDefault();},true);' +
        '(function(){var t=0;["pointerdown","keydown"].forEach(function(n){addEventListener(n,function(){t=Date.now()},true)});' +
        'new MutationObserver(function(){var v=document.documentElement.getAttribute("data-theme");if(v&&Date.now()-t<1500)parent.postMessage({dsTheme:v},"*")})' +
        '.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});})();<\/script>';
      var html = src;
      if (/<html[^>]*>/i.test(html)) {
        html = html.replace(/<html([^>]*)>/i, function (m, a) {
          return '<html' + a.replace(/\sdata-theme=("[^"]*"|'[^']*'|\S+)/i, '') + rootAttrs() + '>';
        });
      } else html = '<html' + rootAttrs() + '>' + html;
      if (/<head[^>]*>/i.test(html)) html = html.replace(/<head([^>]*)>/i, function (m) { return m + head; });
      else html = html.replace(/<html([^>]*)>/i, function (m) { return m + '<head>' + head + '</head>'; });
      return html;
    });
  }
  function frame(path, height, title, opts) {
    opts = opts || {};
    var f = h('iframe', { class: 'frame', title: title + ' preview', loading: 'lazy', style: 'height:' + height + 'px' + (opts.width ? ';width:' + opts.width + 'px' : '') });
    previewDoc(path).then(function (doc) {
      f.addEventListener('load', function () {
        applyTheme(f);
        setTimeout(function () { applyTheme(f); if (!opts.fixed) grow(f, height); }, 350);
      });
      f.srcdoc = doc;
    }).catch(function (e) { f.replaceWith(h('p', { class: 'err', text: 'Preview failed to load: ' + e.message })); });
    return f;
  }
  function rootAttrs() {
    var a = ' data-theme="' + theme + '"';
    for (var k in modes) a += ' ' + k + '="' + modes[k] + '"';
    return a;
  }
  function applyTheme(f) {
    try {
      var d = f.contentDocument; if (!d || !d.documentElement) return;
      d.documentElement.setAttribute('data-theme', theme);
      for (var k in modes) d.documentElement.setAttribute(k, modes[k]);
    } catch (e) {}
  }
  function grow(f, min) {
    try {
      var d = f.contentDocument, need = Math.max(d.documentElement.scrollHeight, d.body ? d.body.scrollHeight : 0);
      if (need > min + 4) f.style.height = Math.min(need, 1600) + 'px';
    } catch (e) {}
  }

  /* ---------- Themes, looks and modes ---------- */
  function themeName(id) { var t = S.themes.find(function (x) { return x.id === id; }); return t ? (t.name || t.id) : id; }
  function hasTheme(id) { return S.themes.some(function (t) { return t.id === id; }); }
  function rawColor(name, id, depth) {
    var tok = (T.color && T.color.tokens || []).find(function (t) { return t.name === name; });
    if (!tok) return null;
    var v = tok.value; if (v && typeof v === 'object') v = v[id] != null ? v[id] : v[S.themes[0].id];
    var m = /^\{(.+)\}$/.exec(v || '');
    return m ? ((depth || 0) < 16 ? rawColor(m[1], id, (depth || 0) + 1) : null) : v;
  }
  function isDark(id) {
    var c = String(rawColor('paper', id) || rawColor('void', id) || '#fff').replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])\b/i, '#$1$1$2$2$3$3');
    var m = /^#([0-9a-f]{6})/i.exec(c); if (!m) return false;
    var n = parseInt(m[1], 16);
    return 0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255) < 128;
  }
  function partner(id) {
    var g = S.style.groups.find(function (x) { return x.themes.indexOf(id) >= 0; });
    return g && g.themes.length === 2 ? g.themes[1 - g.themes.indexOf(id)] : null;
  }
  function plural(w) { w = w.toLowerCase(); return /s$/.test(w) ? w : w + 's'; }
  function markCurrent() {
    document.querySelectorAll('[data-look]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-look') === theme)); });
    document.querySelectorAll('[data-col]').forEach(function (c) { c.classList.toggle('is-cur', c.getAttribute('data-col') === theme); });
    document.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String(modes[b.getAttribute('data-mode')] === b.value)); });
  }
  function setTheme(id, persist) {
    theme = id;
    var root = document.documentElement;
    root.setAttribute('data-theme', id);
    root.style.colorScheme = isDark(id) ? 'dark' : 'light';
    if (persist) store(KEY, id);
    $('#style-name').textContent = themeName(id);
    $('#style-btn').setAttribute('aria-label', S.style.label + ': ' + themeName(id) + '. Change ' + S.style.label.toLowerCase());
    var flip = $('#face'), p = partner(id);
    flip.hidden = !p;
    if (p) {
      flip.innerHTML = isDark(p) ? ICON.moon : ICON.sun;
      flip.setAttribute('aria-label', 'Switch to ' + themeName(p));
      flip.title = 'Switch to ' + themeName(p);
    }
    markCurrent();
    syncUrl();
    document.querySelectorAll('iframe.frame').forEach(applyTheme);
  }
  function setMode(m, value, persist) {
    modes[m.attr] = value;
    document.documentElement.setAttribute(m.attr, value);
    if (persist) store(MODEKEY + m.attr, value);
    markCurrent();
    syncUrl();
    document.querySelectorAll('iframe.frame').forEach(applyTheme);
  }
  function modeParam(m) { return m.attr.replace(/^data-/, ''); }
  function syncUrl() {
    try {
      var u = new URL(location.href);
      u.searchParams.delete('look');
      if (theme !== S.themes[0].id) u.searchParams.set('theme', theme); else u.searchParams.delete('theme');
      (S.style.modes || []).forEach(function (m) {
        var v = modes[m.attr];
        if (v && v !== m.default) u.searchParams.set(modeParam(m), v); else u.searchParams.delete(modeParam(m));
      });
      if (u.href !== location.href) history.replaceState(null, '', u.href);
    } catch (e) {}
  }

  function lookCard(id, size) {
    var b = h('button', { type: 'button', class: 'look', 'data-theme': id, 'data-look': id, 'aria-pressed': String(id === theme) }, [
      h('span', { class: 'look-face' + (S.style.cardClass ? ' ' + S.style.cardClass : '') }, [
        h('span', { class: 'look-aa', text: 'Aa', 'aria-hidden': 'true' }),
        h('span', { class: 'look-dots', 'aria-hidden': 'true' }, [
          h('i', { style: 'background:var(--s-accent)' }), h('i', { style: 'background:var(--cue, var(--s-muted))' }), h('i', { style: 'background:var(--s-ink)' })
        ]),
        h('span', { class: 'look-check', html: ICON.check })
      ]),
      h('span', { class: 'look-name', text: themeName(id) })
    ]);
    b.addEventListener('click', function () { setTheme(id, true); });
    return b;
  }
  function lookGrid(size) {
    var many = S.style.groups.length > 1;
    return h('div', { class: 'looks looks--' + size }, S.style.groups.map(function (g) {
      return h('div', { class: 'look-group', role: 'group', 'aria-label': g.name }, [
        many ? h('p', { class: 'look-group-h', text: g.name }) : null,
        h('div', { class: 'look-row' }, g.themes.map(function (id) { return lookCard(id, size); }))
      ]);
    }));
  }
  function lookChips() {
    var row = h('div', { class: 'look-chips', role: 'group', 'aria-label': S.style.label }, [h('span', { class: 'look-chips-h', 'aria-hidden': 'true', text: 'See it in' })]);
    S.style.groups.forEach(function (g) {
      g.themes.forEach(function (id) {
        var c = h('button', { type: 'button', class: 'look-chip', 'data-theme': id, 'data-look': id, 'aria-pressed': String(id === theme) }, [h('i', { 'aria-hidden': 'true' }), themeName(id)]);
        c.addEventListener('click', function () { setTheme(id, true); });
        row.appendChild(c);
      });
    });
    return row;
  }
  function modeControls() {
    return (S.style.modes || []).map(function (m) {
      return h('div', { class: 'mode' }, [
        h('p', { class: 'look-group-h', id: 'mode-' + m.attr, text: m.name }),
        h('div', { class: 'seg', role: 'group', 'aria-labelledby': 'mode-' + m.attr }, m.options.map(function (o) {
          var b = h('button', { type: 'button', 'data-mode': m.attr, value: o.value, 'aria-pressed': String(modes[m.attr] === o.value), text: o.name });
          b.addEventListener('click', function () { setMode(m, o.value, true); });
          return b;
        }))
      ]);
    });
  }
  function buildSwitcher() {
    var panel = $('#style-panel'), btn = $('#style-btn');
    var widest = Math.max.apply(null, S.style.groups.map(function (g) { return g.themes.length; }));
    panel.style.setProperty('--panel-w', (widest >= 3 ? 560 : 400) + 'px');
    var x = h('button', { type: 'button', class: 'panel-x', 'aria-label': 'Close', html: ICON.close });
    panel.replaceChildren(
      h('div', { class: 'panel-h' }, [h('b', { id: 'style-panel-h', text: S.style.label }), x]),
      lookGrid('sm')
    );
    modeControls().forEach(function (el) { panel.appendChild(el); });
    panel.appendChild(h('p', { class: 'panel-note', text: 'The whole site, the cover and every live preview follow. The address keeps your pick, so a shared link opens in the same ' + S.style.label.toLowerCase() + '.' }));
    function place() {
      var r = btn.getBoundingClientRect();
      if (innerWidth > 720) { panel.style.top = Math.round(r.bottom + 10) + 'px'; panel.style.right = Math.max(12, Math.round(innerWidth - r.right)) + 'px'; }
      else { panel.style.top = ''; panel.style.right = ''; }
    }
    function open(on, refocus) {
      panel.hidden = !on;
      btn.setAttribute('aria-expanded', String(on));
      if (on) { place(); var cur = panel.querySelector('.look[aria-pressed="true"]') || panel.querySelector('button'); if (cur) cur.focus(); }
      else if (refocus) btn.focus();
    }
    btn.addEventListener('click', function () { open(panel.hidden); });
    x.addEventListener('click', function () { open(false, true); });
    $('#face').addEventListener('click', function () { var p = partner(theme); if (p) setTheme(p, true); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) open(false, true); });
    document.addEventListener('pointerdown', function (e) { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) open(false); });
    addEventListener('resize', function () { if (!panel.hidden) place(); });
  }

  /* ---------- Views ---------- */
  function head(kicker, title, lede) {
    return [h('p', { class: 'kicker', text: kicker }), h('h1', { class: 'page', text: title }), lede ? h('p', { class: 's-lede', text: lede }) : null];
  }

  function viewOverview() {
    var out = h('div');
    if (S.cover && S.cover.preview) {
      var hgt = S.cover.height || 288;
      var scale = h('div', { class: 'cover-scale' }, [frame(S.cover.preview, hgt, S.title + ' cover', { fixed: true, width: 960 })]);
      var box = h('div', { class: 'cover', style: 'height:' + hgt + 'px' }, [scale]);
      var fit = function () {
        var k = box.clientWidth / 960;
        scale.style.transform = 'scale(' + k + ')';
        box.style.height = Math.round(hgt * k) + 'px';
      };
      out.appendChild(box);
      requestAnimationFrame(fit);
      if (window.ResizeObserver) new ResizeObserver(fit).observe(box); else addEventListener('resize', fit);
    }
    var nColors = (T.color && T.color.tokens || []).length, nAssets = S.assets.reduce(function (n, g) { return n + g.files.length; }, 0);
    out.appendChild(h('div', { class: 'stats' }, [
      stat('#/book', S.sections.length + 1, 'brand book sections'),
      stat('#/tokens', S.themes.length, S.themes.length === 1 ? S.style.label.toLowerCase() : plural(S.style.label)),
      stat('#/tokens', nColors, 'colour tokens'),
      stat('#/components', S.components.length, 'components'),
      stat('#/assets', nAssets, 'assets')
    ]));
    if (S.themes.length > 1) {
      out.appendChild(h('h2', { class: 'sec', text: S.themes.length + ' ' + plural(S.style.label) }));
      out.appendChild(h('p', { class: 'styles-intro' }, [(S.style.intro ? S.style.intro + ' ' : '') + 'Pick one: the site, the cover and every live preview follow. Or ', h('a', { href: './', text: 'walk through all of them in the showcase' }), ', where each one gets a scene of its own.']));
      out.appendChild(lookGrid('lg'));
      out.appendChild(h('h2', { class: 'sec', text: 'The brand book' }));
    }
    var doc = h('div', null, [h('p', { class: 'loading', text: 'Loading the brand book…' })]);
    out.appendChild(doc);
    get(S.readme, 'text').then(function (t) { doc.replaceChildren(md(t, S.readme)); });
    return out;
  }
  function stat(href, n, label) { return h('a', { class: 'stat', href: href }, [h('b', { text: String(n) }), h('span', { text: label })]); }

  function viewBook(which) {
    var docs = [{ path: S.readme, title: 'Overview' }].concat(S.sections);
    var i = Math.max(0, docs.findIndex(function (d) { return slug(d.path) === which; }));
    var cur = docs[i];
    var toc = h('nav', { class: 'toc', 'aria-label': 'Brand book' }, docs.map(function (d, j) {
      return h('a', { href: '#/book/' + slug(d.path), 'aria-current': j === i ? 'page' : null, text: d.title });
    }));
    var art = h('article', null, [h('p', { class: 'loading', text: 'Loading…' })]);
    get(cur.path, 'text').then(function (t) {
      var pager = h('div', { class: 'pager' }, [
        i > 0 ? h('a', { href: '#/book/' + slug(docs[i - 1].path) }, [h('small', { text: 'Previous' }), docs[i - 1].title]) : h('span'),
        i < docs.length - 1 ? h('a', { class: 'next', href: '#/book/' + slug(docs[i + 1].path) }, [h('small', { text: 'Next' }), docs[i + 1].title]) : h('span')
      ]);
      art.replaceChildren(md(t, cur.path), pager);
    });
    return h('div', { class: 'book' }, [toc, art]);
  }

  function valueOf(tok, th) {
    var v = tok.value;
    if (v && typeof v === 'object') v = v[th] != null ? v[th] : v[S.themes[0].id];
    return v == null ? '' : String(v);
  }
  function viewTokens() {
    var out = h('div', null, head('Tokens', 'Tokens', 'Every value in tokens.json, rendered from the compiled tokens.css. Colours show every ' + S.style.label.toLowerCase() + ' side by side, the current one marked; the ' + S.style.label + ' menu sets everything else.'));
    var fams = Object.keys(T).filter(function (k) { return T[k] && typeof T[k] === 'object' && Array.isArray(T[k].tokens) && ['color', 'shadow', 'spacing', 'radius'].indexOf(k) < 0; });
    var nav = h('div', { class: 'subnav' }, ['Colour', 'Type', 'Spacing', 'Radius', 'Shadow'].concat(fams.map(title)).map(function (n) {
      return h('a', { href: '#tok-' + n.toLowerCase().replace(/\s+/g, '-'), text: n });
    }));
    nav.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return; e.preventDefault();
      var t = document.getElementById(a.getAttribute('href').slice(1)); if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
    out.appendChild(nav);

    // Colour
    out.appendChild(h('h2', { class: 'sec', id: 'tok-colour', text: 'Colour' }));
    var themes = S.themes;
    var thead = h('tr', null, [h('th', { text: 'Token' })].concat(themes.map(function (t) { return h('th', { 'data-col': t.id, text: t.name || t.id }); })));
    var rows = [], stem = null;
    (T.color.tokens || []).forEach(function (tok) {
      var s = tok.name.split(/[-.]/)[0];
      var tr = h('tr', { class: stem !== null && s !== stem ? 'stem' : null }, [h('td', null, [h('div', { class: 'tok-name', text: tok.name }), tok.usage ? h('div', { class: 'tok-use', title: tok.usage, text: tok.usage }) : null])].concat(themes.map(function (t) {
        var raw = valueOf(tok, t.id);
        return h('td', { 'data-col': t.id }, [h('span', { class: 'chip', 'data-theme': t.id, style: 'background:var(--' + tok.name.replace(/\./g, '\\.') + ')' }), h('span', { class: 'chip-val', text: raw.replace(/^\{(.+)\}$/, '→ $1') })]);
      })));
      stem = s; rows.push(tr);
    });
    out.appendChild(h('div', { class: 'swatches' }, [h('table', null, [h('thead', null, [thead]), h('tbody', null, rows)])]));

    // Type
    out.appendChild(h('h2', { class: 'sec', id: 'tok-type', text: 'Type' }));
    var famsT = T.type && T.type.families || {};
    out.appendChild(h('div', { class: 'fam' }, Object.keys(famsT).map(function (k) {
      return h('div', null, [h('p', { class: 'glyphs', style: 'font-family:var(--font-' + k + ')', text: 'Aa Gg 123' }), h('div', { class: 's-label', text: '--font-' + k }), h('code', { text: famsT[k] })]);
    })));
    (T.type && T.type.groups || []).forEach(function (g) {
      out.appendChild(h('p', { class: 'group-h', text: g.name }));
      g.styles.forEach(function (s) {
        var px = parseFloat(s.fontSize) || 16;
        out.appendChild(h('div', { class: 'typerow' }, [
          h('div', { class: 'meta' }, [h('b', { text: s.name }), [s.fontSize, s.lineHeight != null ? '/ ' + s.lineHeight : '', s.fontWeight != null ? '· ' + s.fontWeight : '', s.fontStyle === 'italic' ? 'italic' : ''].join(' ').replace(/\s+/g, ' '), h('br'), 'var(--font-' + (s.family || g.family) + ')']),
          h('div', { class: s.name + ' sample' + (px > 48 ? ' clip' : ''), title: s.usage || '', text: s.sample || 'The quick brown fox jumps over the lazy dog' })
        ]));
      });
    });

    // Spacing
    out.appendChild(h('h2', { class: 'sec', id: 'tok-spacing', text: 'Spacing' }));
    out.appendChild(h('div', { class: 'scale' }, (T.spacing && T.spacing.tokens || []).map(function (t) {
      return h('div', { class: 'row', title: t.usage || '' }, [h('span', { class: 'tok-name', text: t.name }), h('span', { class: 'chip-val', text: String(t.value) }), h('div', { class: 'bar-v', style: 'width:var(--' + t.name + ')' })]);
    })));

    // Radius
    out.appendChild(h('h2', { class: 'sec', id: 'tok-radius', text: 'Radius' }));
    out.appendChild(h('div', { class: 'radii' }, (T.radius && T.radius.tokens || []).map(function (t) {
      return h('div', { title: t.usage || '' }, [h('div', { class: 'box', style: 'border-radius:var(--' + t.name + ')' }), h('div', { class: 's-label' }, [t.name, h('small', { text: String(t.value) })])]);
    })));

    // Shadow
    out.appendChild(h('h2', { class: 'sec', id: 'tok-shadow', text: 'Shadow' }));
    out.appendChild(h('div', { class: 'shadows' }, (T.shadow && T.shadow.tokens || []).map(function (t) {
      return h('div', { title: t.usage || '' }, [h('div', { class: 'box', style: 'box-shadow:var(--' + t.name + ')' }), h('div', { class: 's-label' }, [t.name, h('small', { text: t.usage || '' })])]);
    })));

    // Other families
    fams.forEach(function (k) {
      out.appendChild(h('h2', { class: 'sec', id: 'tok-' + title(k).toLowerCase().replace(/\s+/g, '-'), text: title(k) }));
      if (T[k].note) out.appendChild(h('p', { class: 'sec-note', text: T[k].note }));
      out.appendChild(h('div', { class: 'kv' }, [h('table', null, [h('tbody', null, T[k].tokens.map(function (t) {
        return h('tr', null, [h('td', { text: t.name }), h('td', { text: String(t.value) }), h('td', { text: t.usage || '' })]);
      }))])]));
    });
    return out;
  }
  function title(k) { return k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, function (c) { return c.toUpperCase(); }); }

  function compCard(c) {
    var hd = h('div', { class: 'comp-h' }, [
      h('div', null, [h('h3', null, [h('a', { href: '#/components/' + c.name, text: c.name })]), c.summary ? h('p', { text: c.summary }) : null]),
      c.readme ? h('a', { class: 'more', href: '#/components/' + c.name, text: 'Guidelines →' }) : null
    ]);
    return h('section', { class: 'comp', id: 'c-' + c.name }, [hd, c.preview ? frame(c.preview, c.height, c.name) : h('p', { class: 'err', style: 'padding:16px', text: 'No preview.' })]);
  }
  function viewComponents() {
    var out = h('div', null, head('Components', 'Components', S.components.length + ' components, each running live on ' + S.namespace + ' (bundle.js and bundle.css) in the ' + S.style.label.toLowerCase() + ' you pick.'));
    if (S.themes.length > 1) out.appendChild(lookChips());
    S.groups.forEach(function (g) {
      out.appendChild(h('h2', { class: 'group-h', text: g }));
      S.components.filter(function (c) { return c.group === g; }).forEach(function (c) { out.appendChild(compCard(c)); });
    });
    return out;
  }
  function viewComponent(name) {
    var c = S.components.find(function (x) { return x.name === name; });
    if (!c) return h('p', { class: 'err', text: 'No component named ' + name + '.' });
    var out = h('div', null, [h('a', { class: 'back', href: '#/components', text: '← All components' }), h('p', { class: 'kicker', text: c.group }), h('h1', { class: 'page', text: c.name })]);
    if (S.themes.length > 1) { var chips = lookChips(); chips.style.margin = '0 0 16px'; out.appendChild(chips); }
    out.appendChild(h('section', { class: 'comp' }, [c.preview ? frame(c.preview, c.height, c.name) : null]));
    if (c.readme) {
      var doc = h('div', null, [h('p', { class: 'loading', text: 'Loading guidelines…' })]);
      out.appendChild(doc);
      get(c.readme, 'text').then(function (t) { doc.replaceChildren(md(t.replace(/^#\s+.*\n/, ''), c.readme)); });
    }
    return out;
  }

  function viewAssets() {
    var out = h('div', null, head('Assets', 'Assets', 'The SVG files from the artifact’s asset store, by group. In pages, draw these through the bundle so they take the current theme.'));
    S.assets.forEach(function (g) {
      out.appendChild(h('h2', { class: 'sec', text: g.name }));
      var note = h('div'); out.appendChild(note);
      if (g.readme) get(g.readme, 'text').then(function (t) { var p = md(t, g.readme); p.className = 'asset-note'; note.replaceChildren(p); });
      out.appendChild(h('div', { class: 'tiles t-' + (g.tile || 'm') }, g.files.map(function (f) {
        return h('a', { class: 'tile', href: f.path, target: '_blank', rel: 'noopener' }, [h('img', { src: f.path, alt: '', loading: 'lazy' }), h('span', { text: f.name.replace(/\.svg$/i, '') })]);
      })));
    });
    return out;
  }

  /* ---------- Router ---------- */
  function route() {
    var parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    var tab = parts[0] || 'overview', view;
    if (tab === 'book') view = viewBook(parts.slice(1).join('/'));
    else if (tab === 'tokens') view = viewTokens();
    else if (tab === 'components') view = parts[1] ? viewComponent(decodeURIComponent(parts[1])) : viewComponents();
    else if (tab === 'assets') view = viewAssets();
    else { tab = 'overview'; view = viewOverview(); }
    document.querySelectorAll('.tabs a').forEach(function (a) { a.setAttribute('aria-current', a.dataset.tab === tab ? 'page' : 'false'); });
    main.replaceChildren(view);
    markCurrent();
    document.title = S.title + (tab === 'overview' ? ' — design system' : ' · ' + title(tab));
    if (route.ran) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
    route.ran = true;
  }

  Promise.all([get('site/site.json', 'json'), get('project/tokens.json', 'json')]).then(function (r) {
    S = r[0]; T = r[1];
    $('#brand').textContent = S.title;
    var repo = $('#repo'); if (S.repo) repo.href = S.repo; else repo.remove();
    var root = document.documentElement, sv = S.style.shellVars || {};
    for (var v in sv) root.style.setProperty(v, sv[v]);
    if (S.style.bodyClass) document.body.classList.add(S.style.bodyClass);
    $('#style-k').textContent = S.style.label;
    var q = new URLSearchParams(location.search);
    (S.style.modes || []).forEach(function (m) {
      var ok = function (x) { return m.options.some(function (o) { return o.value === x; }); };
      var want = q.get(modeParam(m)), saved = store(MODEKEY + m.attr);
      modes[m.attr] = ok(want) ? want : ok(saved) ? saved : m.default;
      root.setAttribute(m.attr, modes[m.attr]);
    });
    var fromUrl = q.get('theme') || q.get('look'), saved = store(KEY);
    theme = hasTheme(fromUrl) ? fromUrl : hasTheme(saved) ? saved : S.themes[0].id;
    buildSwitcher();
    setTheme(theme, false);
    addEventListener('message', function (e) {
      var id = e.data && e.data.dsTheme;
      if (!id || id === theme || e.origin !== location.origin || !hasTheme(id)) return;
      var mine = Array.prototype.some.call(document.querySelectorAll('iframe.frame'), function (f) { return f.contentWindow === e.source; });
      if (mine) setTheme(id, true);
    });
    var foot = $('#foot');
    if (S.repo) { foot.appendChild(h('a', { href: S.repo, rel: 'noopener', text: 'Source on GitHub' })); foot.append(' · '); }
    foot.append('Exported from the ' + S.title + ' Claude artifact');
    if (S.artifact) { foot.append(' ('); foot.appendChild(h('a', { href: S.artifact, rel: 'noopener', text: 'source' })); foot.append(')'); }
    foot.append('. Styles, previews and tokens are the system’s own.');
    if (S.sibling) { foot.append(' Sibling system: '); foot.appendChild(h('a', { href: S.sibling.url, text: S.sibling.name })); foot.append('.'); }
    addEventListener('hashchange', route);
    route();
  }).catch(function (e) {
    main.replaceChildren(h('p', { class: 'err', text: 'Could not load the design system: ' + e.message }));
  });
})();

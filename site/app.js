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
        'if(a&&/^#/.test(a.getAttribute("href")||""))e.preventDefault();},true);<\/script>';
      var html = src;
      if (/<html[^>]*>/i.test(html)) {
        html = html.replace(/<html([^>]*)>/i, function (m, a) {
          return '<html' + a.replace(/\sdata-theme=("[^"]*"|'[^']*'|\S+)/i, '') + ' data-theme="' + theme + '">';
        });
      } else html = '<html data-theme="' + theme + '">' + html;
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
  function applyTheme(f) {
    try { var d = f.contentDocument; if (d && d.documentElement) d.documentElement.setAttribute('data-theme', theme); } catch (e) {}
  }
  function grow(f, min) {
    try {
      var d = f.contentDocument, need = Math.max(d.documentElement.scrollHeight, d.body ? d.body.scrollHeight : 0);
      if (need > min + 4) f.style.height = Math.min(need, 1600) + 'px';
    } catch (e) {}
  }

  /* ---------- Themes ---------- */
  function setTheme(id, persist) {
    theme = id;
    document.documentElement.setAttribute('data-theme', id);
    $('#theme').value = id;
    if (persist) store(KEY, id);
    document.querySelectorAll('iframe.frame').forEach(applyTheme);
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
      stat('#/tokens', S.themes.length, S.themes.length === 1 ? 'theme' : 'themes'),
      stat('#/tokens', nColors, 'colour tokens'),
      stat('#/components', S.components.length, 'components'),
      stat('#/assets', nAssets, 'assets')
    ]));
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
    var out = h('div', null, head('Tokens', 'Tokens', 'Every value in tokens.json, rendered from the compiled tokens.css. Colours show each theme side by side; the theme menu above sets everything else.'));
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
    var thead = h('tr', null, [h('th', { text: 'Token' })].concat(themes.map(function (t) { return h('th', { text: t.name || t.id }); })));
    var rows = [], stem = null;
    (T.color.tokens || []).forEach(function (tok) {
      var s = tok.name.split(/[-.]/)[0];
      var tr = h('tr', { class: stem !== null && s !== stem ? 'stem' : null }, [h('td', null, [h('div', { class: 'tok-name', text: tok.name }), tok.usage ? h('div', { class: 'tok-use', title: tok.usage, text: tok.usage }) : null])].concat(themes.map(function (t) {
        var raw = valueOf(tok, t.id);
        return h('td', { 'data-theme': t.id }, [h('span', { class: 'chip', style: 'background:var(--' + tok.name.replace(/\./g, '\\.') + ')' }), h('span', { class: 'chip-val', text: raw.replace(/^\{(.+)\}$/, '→ $1') })]);
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
    var out = h('div', null, head('Components', 'Components', S.components.length + ' components, each running live on ' + S.namespace + ' (bundle.js and bundle.css) in the theme chosen above.'));
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
    document.title = S.title + (tab === 'overview' ? ' — design system' : ' · ' + title(tab));
    if (route.ran) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
    route.ran = true;
  }

  Promise.all([get('site/site.json', 'json'), get('project/tokens.json', 'json')]).then(function (r) {
    S = r[0]; T = r[1];
    (S.fonts || []).forEach(function (u) { document.head.appendChild(h('link', { rel: 'stylesheet', href: u })); });
    $('#brand').textContent = S.title;
    var repo = $('#repo'); if (S.repo) repo.href = S.repo; else repo.remove();
    var sel = $('#theme');
    S.themes.forEach(function (t) { sel.appendChild(h('option', { value: t.id, text: t.name || t.id })); });
    sel.addEventListener('change', function () { setTheme(sel.value, true); });
    var saved = store(KEY);
    setTheme(S.themes.some(function (t) { return t.id === saved; }) ? saved : S.themes[0].id, false);
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

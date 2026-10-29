#!/usr/bin/env python3
"""Build the GitHub Pages files for a design system exported from a Claude Design System artifact.

Generates, from the exported sources under project/:
  project/tokens.css   compiled from project/tokens.json, following the artifact's tokens.css contract
  site/site.json       the index the site shell (index.html + site/app.js) reads

Run from the repository root:  python3 site/build.py
Re-run it whenever project/ changes. It reads site/config.json for the artifact and repo links.
"""
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
P = lambda *a: os.path.join(ROOT, *a)

NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$")
COLOR_FN_RE = re.compile(r"^(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\([0-9a-zA-Z .,%/+-]*\)$")
HEX_RE = re.compile(r"^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")
ALIAS_RE = re.compile(r"^\{([A-Za-z0-9][A-Za-z0-9_.-]{0,63})\}$")
LENGTH_RE = re.compile(r"^-?\d*\.?\d+(px|rem|em|%)?$")


def css_name(name):
    return name.lstrip("-.").replace(".", "\\.")


def length(v):
    if isinstance(v, (int, float)):
        return "0" if v == 0 else f"{v}px"
    return str(v)


def color_value(v, names):
    """A color token value as CSS, or None when the grammar drops it."""
    if not isinstance(v, str):
        return None
    v = v.strip()
    m = ALIAS_RE.match(v)
    if m:
        return f"var(--{css_name(m.group(1))})" if m.group(1) in names else None
    if HEX_RE.match(v):
        return v.lower()
    if COLOR_FN_RE.match(v) and "var(" not in v:
        return v
    return None


def themed(tok, themes):
    """Map theme id -> raw value; a plain string belongs to the first theme."""
    v = tok.get("value")
    if isinstance(v, dict):
        return {t: v[t] for t in themes if t in v}
    return {themes[0]: v}


def compile_tokens(tokens, title):
    out = [f"/* {title} — generated from tokens.json */"]
    color = tokens.get("color", {})
    themes = [t["id"].lower() for t in color.get("themes", [])] or ["default"]
    first = themes[0]
    ctoks = [t for t in color.get("tokens", []) if NAME_RE.match(t.get("name", ""))]
    cnames = {t["name"] for t in ctoks}
    shadow = tokens.get("shadow", {}).get("tokens", []) if isinstance(tokens.get("shadow"), dict) else []

    # Resolve every themed token: {theme: css}; a missing theme inherits the first.
    blocks = {t: [] for t in themes}
    dropped = []
    for tok in ctoks + shadow:
        is_color = tok in ctoks
        raw = themed(tok, themes)
        vals = {}
        for th, rv in raw.items():
            cv = color_value(rv, cnames) if is_color else (str(rv) if isinstance(rv, str) and "var(" not in rv and "url(" not in rv else None)
            if cv is not None:
                vals[th] = cv
        if not vals:
            dropped.append(tok["name"])
            continue
        if first not in vals:  # a value only in a later theme is borrowed for the first
            vals[first] = next(iter(vals.values()))
        base = vals[first]
        n = css_name(tok["name"])
        blocks[first].append(f"  --{n}: {base};")
        for th in themes[1:]:
            v = vals.get(th, base)
            if v != base or v.startswith("var("):  # overrides, and aliases re-declared
                blocks[th].append(f"  --{n}: {v};")

    for f in tokens.get("type", {}).get("fonts", []) or []:
        file = f.get("file", "")
        file = file if "/" in file else f"fonts/{file}"
        out.append(
            "@font-face { font-family: \"%s\"; src: url(\"%s\"); font-weight: %s; font-style: %s; font-display: swap; }"
            % (f.get("family"), file, f.get("weight", "400"), f.get("style", "normal"))
        )

    out.append(f':root, [data-theme="{first}"] {{')
    out += blocks[first]
    out.append("}")
    for th in themes[1:]:
        out.append(f'[data-theme="{th}"] {{')
        out += blocks[th]
        out.append("}")

    root = []
    for key, fam in tokens.items():
        if key in ("color", "type", "shadow", "name", "version") or not isinstance(fam, dict) or "tokens" not in fam:
            continue
        for tok in fam["tokens"]:
            if not NAME_RE.match(tok.get("name", "")):
                continue
            v = tok.get("value")
            if isinstance(v, (int, float)):
                v = length(v) if key in ("spacing", "radius") else str(v)
            if not isinstance(v, str) or "var(" in v or "url(" in v:
                dropped.append(tok["name"])
                continue
            root.append(f"  --{css_name(tok['name'])}: {v};")
    for k, stack in (tokens.get("type", {}).get("families") or {}).items():
        root.append(f"  --font-{k.lower()}: {stack};")
    out.append(":root {")
    out += root
    out.append("}")

    for g in tokens.get("type", {}).get("groups", []) or []:
        for s in g.get("styles", []):
            if not NAME_RE.match(s.get("name", "")):
                continue
            fam = (s.get("family") or g.get("family") or "").lower()
            decl = []
            if fam:
                decl.append(f"font-family: var(--font-{fam})")
            fs = s.get("fontSize")
            if fs is None or not LENGTH_RE.match(str(fs)):
                dropped.append(s["name"])
                continue
            decl.append(f"font-size: {length(fs)}")
            lh = s.get("lineHeight")
            if lh is not None:
                decl.append(f"line-height: {lh if isinstance(lh, (int, float)) and lh < 10 else length(lh)}")
            fw = s.get("fontWeight")
            if fw is not None:
                fw = {"normal": 400, "bold": 700}.get(fw, fw)
                decl.append(f"font-weight: {fw}")
            if s.get("letterSpacing") is not None:
                decl.append(f"letter-spacing: {length(s['letterSpacing'])}")
            if s.get("fontStyle"):
                decl.append(f"font-style: {s['fontStyle']}")
            if s.get("opticalSize") is not None:
                decl.append(f"font-variation-settings: 'opsz' {s['opticalSize']}")
            out.append(f".{css_name(s['name'])} {{ {'; '.join(decl)}; }}")
    return "\n".join(out) + "\n", dropped


def first_heading(md, fallback):
    m = re.search(r"^#\s+(.+)$", md, re.M)
    return m.group(1).strip() if m else fallback


def first_sentence(md):
    body = re.sub(r"^#\s+.*$", "", md, count=1, flags=re.M).strip()
    para = body.split("\n\n")[0].replace("\n", " ").strip()
    m = re.match(r"(.+?[.!?])(\s|$)", para)
    return (m.group(1) if m else para)[:300]


def marker(html):
    line = html.split("\n", 1)[0]
    out = {}
    if "@dsCard" in line:
        for k, v in re.findall(r'(\w+)=("[^"]*"|\S+)', line):
            out[k] = v.strip('"').rstrip("-").strip()
    return out


def main():
    cfg = json.load(open(P("site", "config.json")))
    index = json.load(open(P("project", "design-system.json")))
    tokens = json.load(open(P("project", "tokens.json")))
    title = index.get("title") or tokens.get("name") or "Design system"

    css, dropped = compile_tokens(tokens, title)
    open(P("project", "tokens.css"), "w").write(css)

    sections = []
    for f in sorted(os.listdir(P("project"))):
        if f.lower().endswith(".md") and f != "README.md":
            sections.append({"path": f"project/{f}", "title": first_heading(open(P("project", f)).read(), f[:-3])})

    comps, cover = [], None
    cdir = P("project", "components")
    for name in sorted(os.listdir(cdir)):
        d = os.path.join(cdir, name)
        if not os.path.isdir(d):
            continue
        prev = os.path.join(d, "preview.html")
        mk = marker(open(prev).read()) if os.path.exists(prev) else {}
        entry = {
            "name": name,
            "group": mk.get("group") or "Other",
            "height": int(mk["height"]) if mk.get("height", "").isdigit() else 120,
            "preview": f"project/components/{name}/preview.html" if os.path.exists(prev) else None,
        }
        if mk.get("width", "").isdigit():
            entry["width"] = int(mk["width"])
        rd = os.path.join(d, "README.md")
        if os.path.exists(rd):
            entry["readme"] = f"project/components/{name}/README.md"
            entry["summary"] = first_sentence(open(rd).read())
        if name == "Cover" and "readme" not in entry:
            cover = entry
        else:
            comps.append(entry)
    groups = []
    for c in comps:
        if c["group"] not in groups:
            groups.append(c["group"])
    comps.sort(key=lambda c: (groups.index(c["group"]), c["name"]))

    assets = []
    for g in index.get("groups", []):
        ag = index.get("assetGroups", {}).get(g, {})
        files = {r["name"]: r for r in ag.get("files", {}).values()}
        order = [n for n in ag.get("order", []) if n in files] + sorted(n for n in files if n not in ag.get("order", []))
        readme = f"project/assets/{g}/README.md"
        assets.append({
            "name": g,
            "tile": ag.get("tile", "m"),
            "readme": readme if os.path.exists(P(readme)) else None,
            "files": [{"name": n, "path": f"project/assets/{g}/{n}"} for n in order if os.path.exists(P("project", "assets", g, n))],
        })

    bundle_css = P("project", "components", "bundle.css")
    fonts = re.findall(r'@import\s+url\(["\']?(https://fonts\.googleapis\.com/[^"\')]+)', open(bundle_css).read()) if os.path.exists(bundle_css) else []

    site = {
        "title": title,
        "namespace": index.get("namespace"),
        "fonts": fonts,
        "artifact": cfg.get("artifact"),
        "repo": cfg.get("repo"),
        "sibling": cfg.get("sibling"),
        "themes": tokens.get("color", {}).get("themes", []),
        "readme": "project/README.md",
        "sections": sections,
        "cover": cover,
        "groups": groups,
        "components": comps,
        "assets": assets,
    }
    json.dump(site, open(P("site", "site.json"), "w"), indent=1)
    print(f"{title}: tokens.css {len(css)} bytes, {len(sections)} sections, {len(comps)} components, "
          f"{sum(len(a['files']) for a in assets)} assets" + (f"; dropped {dropped}" if dropped else ""))


if __name__ == "__main__":
    sys.exit(main())

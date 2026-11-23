#!/usr/bin/env python3
"""Fail when the pen's ink tables in pen.js no longer match project/tokens.json (references followed)."""
import json, re
from pathlib import Path
r = Path(__file__).resolve().parents[1]
color = json.loads((r/'project/tokens.json').read_text())['color']
themes = [t['id'] for t in color['themes']]
raw = {th: {k['name']: (k['value'][th] if isinstance(k['value'], dict) else k['value']) for k in color['tokens']} for th in themes}
def resolve(th, v):
    m = re.fullmatch(r'\{([a-z0-9-]+)\}', v)
    if m: return resolve(th, raw[th][m.group(1)])
    m = re.fullmatch(r'#([0-9a-fA-F]{6})', v)
    if m: return [float(int(m.group(1)[i:i+2], 16)) for i in (0, 2, 4)]
    return [float(x) for x in re.fullmatch(r'rgba\(([^)]+)\)', v).group(1).split(', ')]
js = (r/'project/components/pen.js').read_text()
def table(row): return {m.group(1): [float(x) for x in m.group(2).split(', ')] for m in re.finditer(r"'([a-z0-9-]+)': \[([^\]]+)\]", row)}
base = table(re.search(r"var BASE = \{ (.*) \};", js).group(1))
block = re.search(r"var INKS = \{\n(.*?)\n  \};", js, re.S).group(1)
bad = 0
for th in themes:
    inks = dict(base); inks.update(table(re.search(rf"^\s*'{th}': \{{ (.*) \}},?$", block, re.M).group(1)))
    for name, v in raw[th].items():
        if inks.get(name) != resolve(th, v): bad += 1; print(f'{th} {name}: tokens.json {resolve(th, v)}, pen {inks.get(name)}')
    for name in inks:
        if name not in raw[th]: bad += 1; print(f'{th} {name}: in the pen, not in tokens.json')
if bad: raise SystemExit(f'{bad} ink(s) drifted')
print(f'Pen inks match tokens.json: {len(color["tokens"])} tokens in {len(themes)} looks')

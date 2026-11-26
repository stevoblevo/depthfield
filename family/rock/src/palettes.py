#!/usr/bin/env python3
"""Resolve every colour token of the three kits, per look, to [r, g, b] (0..255), from each kit's tokens.json.
The kits are found beside this repository (../storeybrook, ../hypermetapunk) unless STOREYBROOK or HYPERMETAPUNK say otherwise."""
import json, os, re, sys
from pathlib import Path
DF = Path(__file__).resolve().parents[3]
ROOTS = {'sb': Path(os.environ.get('STOREYBROOK', DF.parent / 'storeybrook')), 'hmp': Path(os.environ.get('HYPERMETAPUNK', DF.parent / 'hypermetapunk')), 'df': DF}
def rgb(v):
    m = re.fullmatch(r'#([0-9a-fA-F]{6})', v)
    if m: return [int(m.group(1)[i:i+2], 16) for i in (0, 2, 4)]
    m = re.fullmatch(r'rgba?\(([^)]+)\)', v)
    if m: return [round(float(x)) for x in m.group(1).split(',')[:3]]
    return None
def palettes():
    out = {}
    for kit, root in ROOTS.items():
        c = json.loads((root / 'project/tokens.json').read_text())['color']; toks = {t['name']: t['value'] for t in c['tokens']}; out[kit] = {}
        for th in c['themes']:
            def res(name, depth=0):
                v = toks.get(name)
                if isinstance(v, dict): v = v.get(th['id'])
                if v is None or depth > 6: return None
                m = re.fullmatch(r'\{([a-z0-9-]+)\}', v.strip())
                return res(m.group(1), depth + 1) if m else rgb(v.strip())
            out[kit][th['id']] = {n: res(n) for n in toks if res(n)}
    return out
if __name__ == '__main__':
    json.dump(palettes(), sys.stdout, separators=(',', ':'))

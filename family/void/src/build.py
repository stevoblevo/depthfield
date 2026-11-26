#!/usr/bin/env python3
"""Build The Void from src/shell.html.

  python3 -I family/void/src/build.py                      writes family/void/index.html: one self-contained file
                                                           (three.js r128 and the kit's axes add-on inlined)
  python3 -I family/void/src/build.py out.html artifact    three.js from cdnjs instead, for the Claude artifact,
                                                           whose pages may not carry a library's source

The strip is project/components/axes.js, read from this repository at build time, so the page and the kit cannot drift.
The card and the canonical address are saelion.co's; the page is the same wherever it is served.
"""
import re, sys
from pathlib import Path

src = Path(__file__).resolve().parent
repo = src.parents[2]
out = Path(sys.argv[1]) if len(sys.argv) > 1 else src.parent / 'index.html'
mode = sys.argv[2] if len(sys.argv) > 2 else 'inline'

shell = (src / 'shell.html').read_text(encoding='utf-8')
version = re.search(r"Depthfield5D = \{ version: '(\d+)\.(\d+)\.\d+'", shell)
short = f'{version.group(1)}.{version.group(2)}'
card = f'https://saelion.co/void/card-{short}.jpg'
alt = 'A green iris around a black pupil, opening in the dark at the bottom of a shaft of falling light.'
head = '\n'.join([
    '<link rel="canonical" href="https://saelion.co/void">',
    '<meta property="og:type" content="website">',
    '<meta property="og:title" content="The Void">',
    '<meta property="og:description" content="Depthfield grounds every page on a color named void. This page goes under it: six signs people use for nothing, and at the bottom one of them looks back.">',
    '<meta property="og:url" content="https://saelion.co/void">',
    f'<meta property="og:image" content="{card}">',
    '<meta property="og:image:type" content="image/jpeg">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    f'<meta property="og:image:alt" content="{alt}">',
    '<meta name="twitter:card" content="summary_large_image">',
    f'<meta name="twitter:image" content="{card}">',
    f'<meta name="twitter:image:alt" content="{alt}">',
])

def script(text):
    assert '</script' not in text.lower(), 'a script source may not hold a closing script tag'
    return '<script>\n' + text.rstrip() + '\n</script>'

if mode == 'artifact':
    three = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
else:
    three = script((src / 'vendor/three-r128.min.js').read_text(encoding='utf-8'))
axes = script((repo / 'project/components/axes.js').read_text(encoding='utf-8'))

for slot in ('<!--HEAD-->', '<!--THREE-->', '<!--AXES-->'):
    assert shell.count(slot) == 1, slot
page = shell.replace('<!--HEAD-->', head).replace('<!--THREE-->', three).replace('<!--AXES-->', axes)
assert f'The Void {short}' in page, 'the sheet names a different version than Depthfield5D.version'
out.write_text(page, encoding='utf-8')
print(f'The Void {short}: {out} ({mode}, {len(page.encode("utf-8"))} bytes)')

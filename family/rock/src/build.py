#!/usr/bin/env python3
"""Assemble Saelion Rock into one page: the shell, the four scripts (the sound goes inside main.js), and the looks' inks read from the kits' tokens.
  python3 -I family/rock/src/build.py                    writes family/rock/index.html, with the kits' pets pinned by address
  python3 -I family/rock/src/build.py out.html inline    writes one self-contained file (the Claude artifact), the pets inlined
The kits are found beside this repository unless STOREYBROOK or HYPERMETAPUNK say otherwise."""
import json, sys
from pathlib import Path
here = Path(__file__).resolve().parent
sys.dont_write_bytecode = True; sys.path.insert(0, str(here))
import palettes as P
VERS = {'sb': '1.5.0', 'hmp': '0.5.0', 'df': '2.5.0'}
KITS = [('/storeybrook/v/%s/bundle.js' % VERS['sb'], P.ROOTS['sb'] / 'v' / VERS['sb'] / 'bundle.js'), ('/storeybrook/v/%s/pets.js' % VERS['sb'], P.ROOTS['sb'] / 'v' / VERS['sb'] / 'pets.js'),
        ('/hypermetapunk/v/%s/pets.js' % VERS['hmp'], P.ROOTS['hmp'] / 'v' / VERS['hmp'] / 'pets.js'), ('/depthfield/v/%s/pets.js' % VERS['df'], P.ROOTS['df'] / 'v' / VERS['df'] / 'pets.js')]
out = Path(sys.argv[1]) if len(sys.argv) > 1 else here.parent / 'index.html'
inline = len(sys.argv) > 2 and sys.argv[2] == 'inline'
s = (here / 'shell.html').read_text()
for tag, f in (('/*SHADERS*/', 'shaders.js'), ('/*SCENE*/', 'scene.js'), ('/*MAIN*/', 'main.js')):
    assert tag in s; s = s.replace(tag, (here / f).read_text().replace('</script', '<\\/script'))
assert '/*SOUND*/' in s; s = s.replace('/*SOUND*/', (here / 'sound.js').read_text().replace('</script', '<\\/script'))
assert '/*PALETTES*/null' in s; s = s.replace('/*PALETTES*/null', json.dumps(P.palettes(), separators=(',', ':')))
kits = '\n'.join('<script>/* ' + url + ' */\n' + path.read_text().replace('</script', '<\\/script') + '</script>' if inline else f'<script src="{url}"></script>' for url, path in KITS)
assert '<!--KITS-->' in s; s = s.replace('<!--KITS-->', kits)
out.parent.mkdir(parents=True, exist_ok=True); out.write_text(s); print(f'{out}: {len(s.encode())} bytes, pets {"inlined" if inline else "pinned by address"}')

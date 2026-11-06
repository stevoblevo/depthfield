"""Create an offline single-file preview from the exact candidate source."""
from pathlib import Path
from base64 import b64encode
import hashlib,json
root=Path(__file__).resolve().parent.parent
src=root/'hush-room'
out=root/'hush-room-qa'
out.mkdir(exist_ok=True)
html=(src/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="scene.css">','<style>'+ (src/'scene.css').read_text()+'</style>')
for name in ['model.js','scene.js']:
 text=(src/name).read_text()
 assert '</script' not in text.lower()
 html=html.replace(f'<script src="{name}"></script>','<script>'+text+'</script>')
html=html.replace('src="poster.svg"','src="data:image/svg+xml;base64,'+b64encode((src/'poster.svg').read_bytes()).decode()+'"')
p=out/'The-Hush-Room-0.1.0.html'
p.write_text(html)
files=['index.html','scene.css','scene.js','model.js','poster.svg']
manifest={str(f):hashlib.sha256((src/f).read_bytes()).hexdigest() for f in files}
manifest[p.name]=hashlib.sha256(p.read_bytes()).hexdigest()
(out/'preview-source-hashes.json').write_text(json.dumps(manifest,indent=2))
print(p)

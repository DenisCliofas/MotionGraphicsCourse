"""Compile the editable English/German copy into a local browser module."""
import json
import hashlib
import re
from pathlib import Path

def build():
    root = Path(__file__).resolve().parent
    pairs = {}
    for line in (root / 'german.txt').read_text(encoding='utf-8-sig').splitlines():
        if line.strip():
            en, de = line.split('|', 1)
            pairs[en.strip()] = de.strip()
    (root / 'dist/language-data.js').write_text(
        'export default ' + json.dumps(pairs, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    runtime = root / 'dist/language.js'
    version = hashlib.sha256((root / 'dist/language-data.js').read_bytes()).hexdigest()[:12]
    source = re.sub(r"language-data\.js(?:\?v=[a-f0-9]+)?", f'language-data.js?v={version}', runtime.read_text(encoding='utf-8'))
    runtime.write_text(source, encoding='utf-8')

def script_tag():
    root = Path(__file__).resolve().parent
    version = hashlib.sha256((root / 'dist/language.js').read_bytes()).hexdigest()[:12]
    return f'<script type="module" src="language.js?v={version}"></script>'

if __name__ == '__main__':
    build()

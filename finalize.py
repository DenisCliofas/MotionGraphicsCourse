from pathlib import Path
import json,re,urllib.request
root=Path(__file__).parent
assets=root/'dist/assets'
css=(root/'dist/styles.css').read_text(encoding='utf-8')
url='https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Manrope:wght@400;500;600;650;700;750;800&display=swap'
try:
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
 fonts=urllib.request.urlopen(req).read().decode()
 for index,font_url in enumerate(dict.fromkeys(re.findall(r'url\((https[^)]+)\)',fonts))):
  name='font-'+str(index)+Path(font_url).suffix
  (assets/name).write_bytes(urllib.request.urlopen(font_url).read())
  fonts=fonts.replace(font_url,'assets/'+name)
 css=re.sub(r"@import url\('[^']+'\);",fonts,css,count=1)
 print('Bundled course fonts for local loading.')
except Exception as e:print('Font bundling unavailable; system fallback retained:',str(e))
(root/'dist/styles.css').write_text(css,encoding='utf-8')
slides=json.loads((root/'dist/course.json').read_text())
keep={Path(a[k]).name for s in slides for a in s['assets'] for k in ['src','poster'] if k in a}
keep.update(['three.module.js','three.core.js','THREE-LICENSE.txt'])
# Remove only generated, unreferenced files in this new site's asset directory.
for path in assets.iterdir():
 if path.is_file() and path.name not in keep and not path.name.startswith('font-'):
  assert path.resolve().parent==assets.resolve()
  path.unlink()
license_url='https://cdn.jsdelivr.net/npm/three@0.180.0/LICENSE'
(assets/'THREE-LICENSE.txt').write_bytes(urllib.request.urlopen(license_url).read())
print('Retained only Day 1 media and site dependencies.')

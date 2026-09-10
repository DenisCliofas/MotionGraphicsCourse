from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import json,re,subprocess,concurrent.futures
root=Path(__file__).parent;dist=root/'dist'
class Audit(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.refs=[];self.videos=[];self.errors=[];self.title=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id'in a:self.ids.append(a['id'])
  for key in ['src','href','poster','data-src']:
   if a.get(key):self.refs.append(a[key])
  if tag=='img' and not a.get('alt'):self.errors.append('Missing image alt')
  if tag=='video':
   self.videos.append(a['src'])
   for attr in ['controls','muted','playsinline']:assert attr in a,(a['src'],attr)
audit=Audit();audit.feed((dist/'index.html').read_text(encoding='utf-8'))
assert not audit.errors,audit.errors
assert not [i for i,c in Counter(audit.ids).items() if c>1],'Duplicate HTML IDs'
assert all(f'slide-{n}' in audit.ids for n in range(1,30))
assert not any(f'slide-{n}' in audit.ids for n in range(30,104))
for ref in audit.refs:
 if ref.startswith('#'):assert ref[1:] in audit.ids,ref
 elif not re.match(r'^(https?:|mailto:|data:)',ref):assert (dist/ref).is_file(),ref
for src in ['app.js','motion.js','assets/three.module.js','assets/three.core.js']:
 r=subprocess.run(['node','--check',str(dist/src)],capture_output=True,text=True);assert r.returncode==0,r.stderr
for ref in re.findall(r'url\(([^)]+)\)',(dist/'styles.css').read_text(encoding='utf-8')):
 ref=ref.strip('"\'')
 if not ref.startswith(('data:','http')):assert (dist/ref).is_file(),ref
ffmpeg=root.parent/'Intro/tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
def decode(src):
 r=subprocess.run([str(ffmpeg),'-v','error','-i',str(dist/src),'-f','null','-'],capture_output=True);assert r.returncode==0,(src,r.stderr);return src
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(decode,sorted(set(audit.videos))))
slides=json.loads((dist/'course.json').read_text());assert len(slides)==29
print(json.dumps({'source_slides':len(slides),'unique_section_ids':len(audit.ids),'video_decodes_passed':len(set(audit.videos)),'local_references_checked':len(audit.refs),'site_size_mb':round(sum(p.stat().st_size for p in dist.rglob('*') if p.is_file())/1048576,2),'result':'PASS'},indent=2))

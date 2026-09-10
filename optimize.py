from pathlib import Path
from PIL import Image
import subprocess,concurrent.futures,json
root=Path(__file__).parent
ffmpeg=root.parent/'Intro/tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
assets=root/'dist/assets'
def convert(p):
 im=Image.open(p)
 if p.suffix=='.gif' and getattr(im,'n_frames',1)>1:
  poster=p.with_suffix('.webp');im.convert('RGB').save(poster,quality=82)
  out=p.with_suffix('.mp4')
  r=subprocess.run([str(ffmpeg),'-hide_banner','-loglevel','error','-y','-i',str(p),'-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(out)],capture_output=True)
  if r.returncode:raise RuntimeError(r.stderr.decode())
  return p.name,{'src':'assets/'+out.name,'poster':'assets/'+poster.name,'animated':True}
 elif p.suffix.lower() in ['.png','.jpg','.jpeg','.gif']:
  out=p.with_suffix('.webp');im.convert('RGB').save(out,quality=88)
  return p.name,{'src':'assets/'+out.name,'animated':False}
source=json.loads((root/'slides-source.json').read_text(encoding='utf-8'))
names={Path(a['src']).name for s in source for a in s['assets']}
files=[p for p in assets.iterdir() if p.name in names]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:mapping=dict(pool.map(convert,files))
slides=json.loads((root/'slides-source.json').read_text(encoding='utf-8'))
for s in slides:
 for a in s['assets']:a.update(mapping[Path(a['src']).name])
(root/'dist/course.json').write_text(json.dumps(slides),encoding='utf-8')
print(f'Optimized {len(files)} assets.')

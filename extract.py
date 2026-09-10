import zipfile,xml.etree.ElementTree as E,json,posixpath,collections
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
root=Path(__file__).parent
z=zipfile.ZipFile(root.parent/'Motion_Design_Day1_Moption_Graphics_Principles.pptx')
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
slides=[]
for i in range(1,30):
 name=f'ppt/slides/slide{i}.xml'; tree=E.fromstring(z.read(name)); rels={r.attrib['Id']:r.attrib for r in E.fromstring(z.read(f'ppt/slides/_rels/slide{i}.xml.rels'))}
 blocks=[]
 for sp in tree.findall('.//p:sp',ns):
  paras=[''.join(p.itertext()) for p in []]
  paras=[''.join(t.text or '' for t in p.findall('.//a:t',ns)).strip() for p in sp.findall('.//a:p',ns)]
  text='\n'.join(p for p in paras if p and p!='style.visibility')
  off=sp.find('.//a:xfrm/a:off',ns)
  if text: blocks.append({'text':text,'x':int(off.get('x',0)) if off is not None else 0,'y':int(off.get('y',0)) if off is not None else 0})
 assets=[]
 for pic in tree.findall('.//p:pic',ns):
  b=pic.find('.//a:blip',ns)
  if b is None: continue
  rel=rels.get(b.get('{'+ns['r']+'}embed'))
  if not rel: continue
  path=posixpath.normpath(posixpath.join('ppt/slides',rel['Target']))
  filename=Path(path).name
  if path not in z.namelist():continue
  dest=root/'dist/assets'/filename;dest.write_bytes(z.read(path))
  im=Image.open(dest)
  if im.width<100 or im.height<80:continue
  assets.append({'src':'assets/'+filename,'width':im.width,'height':im.height,'animated':getattr(im,'n_frames',1)>1})
 links=list(dict.fromkeys(r['Target'] for r in rels.values() if r.get('TargetMode')=='External' and (r.get('Type','').endswith('/hyperlink') or r.get('Type','').endswith('/video'))))
 slides.append({'number':i,'blocks':blocks,'assets':assets,'links':links})
(root/'slides-source.json').write_text(json.dumps(slides,indent=2),encoding='utf-8')
(root/'dist/course.json').write_text(json.dumps(slides),encoding='utf-8')
samples=[]
for s in slides:
 if s['assets'] and (s['number']<33 or s['number'] in [33,46,63,89,100]):
  for a in s['assets'][:2]:
   im=Image.open(root/'dist'/a['src']).convert('RGB');im.thumbnail((300,180)); tile=Image.new('RGB',(320,215),'#F8F5EE');tile.paste(im,((320-im.width)//2,0));ImageDraw.Draw(tile).text((10,187),f"Slide {s['number']} / {a['src']}",fill='black');samples.append(tile)
sheet=Image.new('RGB',(1280,215*((len(samples)+3)//4)),'white')
for k,im in enumerate(samples):sheet.paste(im,((k%4)*320,(k//4)*215))
sheet.save(root/'source-contact-sheet.jpg')
print(json.dumps([{'number':s['number'],'text':[b['text'] for b in s['blocks']],'assets':s['assets'],'links':s['links']} for s in slides if s['number']>=63],indent=2))

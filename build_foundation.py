from pathlib import Path
import hashlib
import zipfile,xml.etree.ElementTree as E,posixpath,json,re,subprocess,concurrent.futures,io
from html import escape as h
from PIL import Image
root=Path(__file__).parent;out=root/'dist';assets=out/'assets/foundation';assets.mkdir(exist_ok=True)
z=zipfile.ZipFile(root.parent/'Motion_Design_Day1_Blender_Foundation.pptx');ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
slides=[];media={}
for i in range(1,66):
 tree=E.fromstring(z.read(f'ppt/slides/slide{i}.xml'));rels={r.get('Id'):r for r in E.fromstring(z.read(f'ppt/slides/_rels/slide{i}.xml.rels'))}
 texts=[''.join(t.text or '' for t in sp.findall('.//a:t',ns)).strip() for sp in tree.findall('.//p:sp',ns)];texts=[t for t in texts if t and not t.isdigit()]
 title=next((t for t in texts if ':' in t and not t.startswith('Shortcut')),texts[0]);pics=[]
 for pic in tree.findall('.//p:pic',ns):
  b=pic.find('.//a:blip',ns)
  if b is None:continue
  rel=rels.get(b.get('{'+ns['r']+'}embed'))
  if rel is None:continue
  name=posixpath.normpath(posixpath.join('ppt/slides',rel.get('Target')))
  try:im=Image.open(io.BytesIO(z.read(name)))
  except Exception:continue
  if im.width<150 or im.height<100:continue
  media[name]=(im.width,im.height,getattr(im,'n_frames',1)>1);pics.append(name)
 slides.append({'number':i,'title':title,'texts':texts,'media':list(dict.fromkeys(pics))})
ffmpeg=root.parent/'Intro/tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
def convert(name):
 w,ht,animated=media[name];stem=Path(name).stem;
 poster=assets/(stem+'.webp');im=Image.open(io.BytesIO(z.read(name)));im.convert('RGBA').save(poster,quality=86)
 if animated:
  dest=assets/(stem+'.mp4')
  if not dest.exists():
   temp=root/(stem+'-foundation.gif');temp.write_bytes(z.read(name))
   r=subprocess.run([str(ffmpeg),'-v','error','-y','-i',str(temp),'-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(dest)],capture_output=True);temp.unlink();assert r.returncode==0,r.stderr
 return name,{'src':'assets/foundation/'+stem+('.mp4' if animated else '.webp?v=alpha2'),'poster':'assets/foundation/'+stem+'.webp?v=alpha2','animated':animated,'width':w,'height':ht}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:mapping=dict(pool.map(convert,media))
groups=[(1,'interface','User Interface'),(16,'navigation','Navigation'),(20,'objects','Objects Transform & Management'),(32,'modeling','Modeling'),(49,'materials','Materials'),(57,'animation','Animations')]
short={1:'Learn the Blender tools you need to start building motion.',6:'Unwrap a mesh into a flat map for image textures.',7:'Paint colors and details directly onto a model.',8:'Build materials by connecting nodes in the Shader Editor.',9:'Work with the scene, timeline, and animation keyframes together.',10:'Review rendered images and animation.',11:'Adjust and combine rendered images with nodes.',12:'Generate and arrange geometry procedurally with nodes.',13:'Use Python to automate tasks and build tools.',15:'Split editors to create more views, or join them to simplify the workspace.',32:'Vertices, edges, and faces define the shape of a mesh.',49:'Shading describes how surfaces respond to light: color, highlights, and shadows.',50:'The Principled BSDF combines material properties in one shader.',51:'Use Metallic 0 for non-metals and 1 for metals. Roughness controls how sharp or soft their reflections appear.',52:'Low roughness gives sharp reflections. High roughness spreads them out.',53:'Adjust specular reflection for non-metals without turning them into metals.'}
sections=[]
for slide in slides:
 i=slide['number'];group=next(g for g in reversed(groups) if i>=g[0]);title=slide['title'].split(':',1)[-1].strip()
 if i==1:title='Blender Foundations'
 texts=[t for t in slide['texts'] if t!=slide['title'] and len(t)>35 and not t.startswith('Shortcut:')]
 if i in short:texts=[short[i]]
 if i==32:texts=['Vertices are points. Edges connect them. Faces form the surfaces.']
 if i==49:texts=['Compare the same cube with edges only, a flat surface, and shading.']
 if i==41:texts=['Follow the steps to add a loop cut and slide it into position.']
 if i==63:texts=['Compare Bezier, Linear, and Constant interpolation.']
 visuals=[]
 for name in slide['media']:
  a=mapping[name];label=h(title,quote=True)
  if a['animated']:visuals.append(f'<video controls muted loop playsinline preload="none" poster="{a["poster"]}" data-src="{a["src"]}" aria-label="{label} demonstration" width="{a["width"]}" height="{a["height"]}"></video>')
  else:visuals.append(f'<img loading="lazy" src="{a["src"]}" alt="{label} — Blender demonstration" width="{a["width"]}" height="{a["height"]}">')
 visuals=[f'<div class="foundation-frame" style="aspect-ratio:{mapping[name]["width"]}/{mapping[name]["height"]}">{visual}</div>' for name,visual in zip(slide['media'],visuals)]
 anchor=f'<span id="{group[1]}" class="chapter-anchor"></span>' if i==group[0] else ''
 sections.append(f'<section class="lesson foundation-lesson" id="foundation-{i}" data-group="{group[1]}">{anchor}<div class="lesson-top"><span class="eyebrow">Part 2 / {group[2]}</span></div><h2>{h(title)}</h2>'+''.join(f'<p class="lead">{h(t)}</p>' for t in texts)+f'<div class="foundation-media media-count-{len(visuals)}" style="--media-columns:{min(3,len(visuals))}">'+''.join(visuals)+'</div></section>')

sections[0]='<section class="hero foundation-hero foundation-lesson" id="foundation-1" data-group="interface"><span id="interface" class="chapter-anchor"></span><div class="hero-copy"><p class="eyebrow">DAY 1 / PART 2</p><h1>Blender<br>Foundations.</h1><p class="hero-intro">The tools to turn your ideas into motion.</p><a class="start-link" href="#foundation-2"><span class="round-arrow">↓</span> Explore Blender</a><p class="byline">Cliofas Denis / FH Graubünden</p></div><div class="hero-visual"><div class="scene" id="foundation-scene"><img class="scene-fallback" src="assets/blender.svg" alt="Blender software logo"><canvas role="img" aria-label="Rotating three-dimensional Blender logo. Drag to rotate."></canvas><span class="drag-hint">Drag to rotate</span></div><a class="blender-credit" href="https://www.blender.org/">Blender — open-source 3D software ↗</a></div></section>'

# Editorial hierarchy: chapter introductions, then focused topic groups.
chapters={
 2:('interface','Find your way around.','Get comfortable with the workspace before you start building.'),
 16:('navigation','Move around your scene.','Orbit, pan, zoom, and focus on the objects you want to work with.'),
 20:('objects','Build a clear scene.','Select, transform, and organize the objects you will animate.'),
 32:('modeling','Shape your objects.','Understand the mesh, then use a few tools to change its form.'),
 49:('materials','Give surfaces character.','Use light and material properties to make form readable.'),
 57:('animation','Bring the scene to life.','Set keyframes, shape the timing, and connect movement to a path.')}
topics={
 2:('Read the interface','Identify the editors you will use most.'),
 3:('Choose a workspace','Start with Layout. Explore the other workspaces when you need them.'),
 14:('Arrange your workspace','Switch editors, split views, and make room for the task.'),
 16:('Navigate the viewport','Orbit, pan, zoom, and return to your selection.'),
 20:('Select and transform','Choose an object, then change its position, rotation, or scale.'),
 24:('Manage the scene','Add objects and keep the scene organized as it grows.'),
 32:('Understand the mesh','Work with vertices, edges, and faces in Edit Mode.'),
 35:('Select and remove geometry','Choose connected elements and control what you delete.'),
 40:('Build and refine forms','Use the demonstrations as a reference while you model.'),
 49:('Understand surface response','Compare how surfaces reflect and scatter light.'),
 54:('Work with materials','Create, edit, and assign materials to your objects.'),
 57:('Create and edit keyframes','Record a change, then adjust when it happens.'),
 63:('Control the movement','Choose interpolation, follow a path, and direct an object toward a target.')}
chapter_for=lambda i:next(g for g in reversed(groups) if i>=g[0])
rebuilt=[sections[0].replace('<span id="interface" class="chapter-anchor"></span>','')]
for i in range(2,66):
 group=chapter_for(i)
 if i in chapters:
  slug,title,intro=chapters[i]
  local=[(n,t[0]) for n,t in topics.items() if chapter_for(n)[1]==slug]
  links=''.join(f'<a href="#topic-{n}">{h(label)} <span aria-hidden="true">↓</span></a>' for n,label in local)
  rebuilt.append(f'<section class="lesson foundation-lesson foundation-chapter" id="{slug}" data-group="{slug}"><span class="eyebrow">Part 2 / {group[2]}</span><h2>{h(title)}</h2><p class="lead">{h(intro)}</p><nav class="foundation-topics" aria-label="{group[2]} topics">{links}</nav></section>')
 if i in topics:
  title,intro=topics[i]
  rebuilt.append(f'<section class="foundation-topic foundation-lesson" id="topic-{i}" data-group="{group[1]}"><h2>{h(title)}</h2><p>{h(intro)}</p></section>')
 lesson=sections[i-1]
 lesson=re.sub(r'<span id="[^"]+" class="chapter-anchor"></span>','',lesson)
 lesson=re.sub(r'<div class="lesson-top">.*?</div>','',lesson)
 lesson=lesson.replace('<h2>','<h3>').replace('</h2>','</h3>')
 lesson=lesson.replace('class="lesson foundation-lesson"','class="lesson foundation-lesson foundation-detail"')
 # Keep secondary workspaces available without making everyone scroll through them.
 if 4<=i<=13:
  title=re.search(r'<h3>(.*?)</h3>',lesson)[1]
  lesson=re.sub(r'<h3>.*?</h3>','',lesson)
  lesson=lesson.replace('><div class="foundation-media">','><div class="foundation-media">')
  opening=lesson.index('>')+1
  lesson=lesson[:opening]+f'<details class="workspace-reference"><summary>{title}</summary><div class="workspace-body">'+lesson[opening:-10]+'</div></details></section>'
 rebuilt.append(lesson)
for j,section in enumerate(rebuilt):
 if 'id="foundation-52"' in section:
  start=section.index('<div class="foundation-media');reference=section[start:-10]
  demo='<div class="roughness-demo"><div id="roughness-scene"><canvas role="img" aria-label="Silver material sample showing the selected surface roughness"></canvas></div><div class="roughness-controls"><label for="roughness-value">Roughness</label><output id="roughness-output" for="roughness-value">0.35</output><input id="roughness-value" type="range" min="0" max="1" step="0.01" value="0.35"><div class="roughness-scale"><span>0 · Smooth</span><span>1 · Rough</span></div><p id="roughness-help">Move the slider. Watch the reflections soften while the lighting stays fixed.</p></div></div>'
  rebuilt[j]=section[:start]+demo+'<details id="roughness-reference" class="workspace-reference"><summary>Reference images</summary><div class="workspace-body">'+reference+'</div></details></section>'

for number,kind,label,initial,left,right,hint in [
 (51,'metallic','Metallic','0','Non-metal','Metal','Compare the same base color as a non-metal and a metal.'),
 (53,'specular','Specular intensity','1','No specular reflection','Full specular reflection','Adjust reflection strength on a non-metal. Roughness stays fixed.')]:
 for j,section in enumerate(rebuilt):
  if f'id="foundation-{number}"' not in section:continue
  start=section.index('<div class="foundation-media');reference=section[start:-10]
  demo=f'<div class="roughness-demo"><div id="{kind}-scene" class="material-scene"><canvas role="img" aria-label="Interactive {label} material sample"></canvas></div><div class="roughness-controls"><label for="{kind}-value">{label}</label><output id="{kind}-output" for="{kind}-value">{initial}</output><input id="{kind}-value" type="range" min="0" max="1" step="0.01" value="{initial}"><div class="roughness-scale"><span>0 · {left}</span><span>1 · {right}</span></div><p id="{kind}-help">{hint}</p></div></div>'
  rebuilt[j]=section[:start]+demo+f'<details id="{kind}-reference" class="workspace-reference"><summary>Reference images</summary><div class="workspace-body">'+reference+'</div></details></section>'

combined=[]
for section in rebuilt:
 if any(f'id="foundation-{n}"' in section for n in [51,52,53]):continue
 combined.append(section)
 if 'id="foundation-50"' in section:
  controls='<div class="material-control"><label for="material-color">Base color</label><input id="material-color" type="color" value="#b66c35"><p>Sets the surface color. On metals, it also tints reflections.</p></div>'
  for key,label,value,explanation in [('metallic','Metallic','0','0 is a non-metal; 1 is a metal. Intermediate values blend the two.'),('roughness','Roughness','0.35','Low values create sharp reflections. High values soften them.'),('specular','Specular intensity','1','Controls reflection strength on non-metals. It has no effect on a fully metallic surface.')]:
   controls+=f'<div class="material-control"><label for="{key}-value">{label}</label><output id="{key}-output" for="{key}-value">{value}</output><input id="{key}-value" type="range" min="0" max="1" step="0.01" value="{value}" aria-describedby="{key}-explanation"><p id="{key}-explanation">{explanation}</p></div>'
  combined.append('<section class="lesson foundation-lesson foundation-detail" id="foundation-51" data-group="materials"><span id="foundation-52"></span><span id="foundation-53"></span><h3>Explore one material.</h3><p class="lead">Change the surface. Keep the room and lighting fixed.</p><div class="roughness-demo combined-material"><div id="material-scene" class="material-scene"><canvas role="img" aria-label="Interactive material sphere. Drag to rotate."></canvas></div><div class="material-panel">'+controls+'<p id="material-help" class="material-note">Drag the sphere to inspect its reflections.</p></div></div></section>')
rebuilt=combined

sections=rebuilt

index=(out/'index.html').read_text(encoding='utf-8');head=index.split('<body>')[0];head=re.sub(r'<title>.*?</title>','<title>Part 2 — Blender Foundations</title>',head);head=re.sub(r'<script.*?</script>','<script type="module" src="foundation.js"></script>',head)
head=head.replace('src="foundation.js"',f'src="foundation.js?v={hashlib.sha256((out/"foundation.js").read_bytes()).hexdigest()[:12]}"')
header=index[index.index('<header'):index.index('</header>')+9];header=re.sub(r'<nav class="topnav".*?</nav>','<nav class="topnav" aria-label="Course navigation">'+''.join(f'<a href="#{g[1]}">{g[2]}</a>' for g in groups)+'</nav>',header);header=re.sub(r'<details class="contents">.*?</details>','<a class="part-link" href="index.html">Part 1 ↗</a>',header);header=re.sub(r'<a class="part-link".*?</a>','<a class="part-link" href="index.html">Part 1 ↗</a>',header);header=header.replace('href="#slide-1"','href="#interface"')
(out/'foundation.html').write_text(head+'<body class="foundation-page"><a class="skip" href="#course">Skip to course</a>'+header+'<main id="course">'+''.join(sections)+'</main><footer class="lesson"><a class="part-link" href="index.html">Back to Part 1 ↗</a></footer></body></html>',encoding='utf-8')
(root/'foundation-source.json').write_text(json.dumps(slides,indent=2),encoding='utf-8')
print(f'Built Part 2: {len(slides)} slides, {len(media)} media assets.')

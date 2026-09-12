from pathlib import Path
import json,html,re,hashlib
from course_content import experiment, prediction, PREDICTIONS, appeal
root=Path(__file__).parent
slides=json.loads((root/'dist/course.json').read_text(encoding='utf-8'))
def esc(s):return html.escape(s).replace('\n',' ')
def texts(s):return [b['text'] for b in s['blocks'] if b['y']<6200000 and b['text']!='WATCH VIDEO']
def media(a,label):
 if a['animated']:
  return f'<video controls muted loop playsinline preload="none" poster="{a["poster"]}" src="{a["src"]}" data-src="{a["src"]}" aria-label="{esc(label)}" style="--ratio:{a["width"]}/{a["height"]}"><a href="{a["src"]}">Watch {esc(label)}</a></video>'
 return f'<img src="{a["src"]}" alt="{esc(label)}" width="{a["width"]}" height="{a["height"]}" loading="lazy" decoding="async">'
def top(n,tag):return f'<div class="lesson-top"><span class="eyebrow">{esc(tag)}</span></div>'
def prompt(s):return f'<p class="prompt">{esc(s)}</p>'
out=[]
for s in slides[1:]:
 if s['number'] in (2,4,12,13,15,17,19):continue # Removed requirements and merged film discussions/answers.
 n=s['number'];t=texts(s);chapter='The course' if n<5 else 'See & understand motion' if n<20 else 'Core motion principles'
 if n==21:t[1]='Timing is how long a move takes. Spacing is the distance between successive frames. Together they shape rhythm.'
 if n==24:t[1]='A small pullback or compression prepares the viewer for the main action.'
 if n==28:
  t[0]='Overshoot gives motion a satisfying settle.'
  t[1]='The object passes its target, then returns. This is one way to exaggerate an action.'
  t[-1]='Ask: how much overshoot suits this movement?'
 if n==29:
  t[2]='COMPETING MOTION'
  t[5]='SUPPORTING MOTION'
 cls='lesson tracked'
 if n in [5,20]:cls+=' chapter-cover'
 if n in [11,12,14,16,18]:cls+=' reference-lesson'
 out.append(f'<section class="{cls}" id="slide-{n}" data-number="{n}" data-chapter="{chapter}">')
 if n==3:
  out.append(top(n,'The course structure')+'<h2>First we build together.<br>Then you make it yours.</h2><div class="day-grid">')
  days=[
   ('01','Explore','Learn motion principles and bring your first movement to life in Blender.'),
   ('02','Build','Create the Kinetic Relay with clear timing, rhythm, and connected reactions.'),
   ('03','Refine','Polish the loop, apply feedback, and develop your own animation.')
  ]
  for day,title,body in days:
   out.append(f'<div><span class="day-number" aria-hidden="true">{day}</span><span class="eyebrow">DAY {int(day)}</span><h3>{title}</h3><p class="day-intro">{esc(body)}</p></div>')
  out.append('</div>')
 elif n in [5,20]:
  out.append(top(n,t[0])+f'<h2>{esc(t[1])}</h2><p class="lead">{esc(t[2])}</p><p class="chapter-statement">{esc(t[3])}</p><span class="chapter-digit" aria-hidden="true">0{1 if n==5 else 2}</span>')
  if n==20:
   out.append('<nav class="principle-index" aria-label="Motion principles">')
   for i,label in enumerate(t[4].replace('Exageration','Overshoot & settle').split('\n')):
    out.append(f'<a href="#slide-{21+i}">{esc(label)}</a>' if i<9 else '<a href="#appeal">Appeal</a>')
   out.append('</nav>')
 elif n in [7,9] or n>=21:
  label=next((b['text'] for b in s['blocks'] if b['y']>=6200000 and len(b['text'])>3),'Motion study')
  out.append(top(n,label)+f'<h2>{esc(t[0])}</h2><p class="lead">{esc(t[1])}</p>'+ (prediction(n) if n in PREDICTIONS else '')+'<div class="comparison">')
  count=(len(t)-3)//2
  comparison_assets=s['assets'][:2]
  if n in (26,27,29):comparison_assets=list(reversed(comparison_assets)) # Correct the swapped squash/stretch, follow-through, and secondary-motion examples.
  for i,a in enumerate(comparison_assets):
   group=t[2+i*count:2+(i+1)*count]
   out.append(f'<article class="comparison-card"><div class="comparison-title"><span class="eyebrow">{esc(group[0])}</span><h3>{esc(group[1])}</h3></div>{media(a,group[0]+": "+group[1])}<div class="comparison-description">'+''.join(f'<p>{esc(line)}</p>' for line in group[2:])+'</div></article>')
  out.append('</div>'+ (experiment(n) if n>=21 else '')+prompt(t[-1]))
 elif n in [11,14,16,18]:
  if n==11:t[3]='With the sound low, follow the attention driver. What makes the movement feel athletic, even without the logo?'
  url=s['links'][0];video_id=url.split('/embed/')[1].split('?')[0]
  out.append(top(n,t[0])+f'<div class="reference-layout"><div><h2>{esc(t[1])}</h2><p class="lead">{esc(t[2])}</p>{prompt(t[3])}</div><div class="film" data-video-id="{video_id}"><button class="film-play" aria-label="Play reference film: {esc(t[4])}">{media(s["assets"][0],t[4])}<span class="film-play-label"><span class="film-play-icon" aria-hidden="true">▶</span><span class="film-play-copy">Watch reference film<small>by {esc(t[4])}</small></span></span></button></div></div>')
  answer_number={11:13,14:15,16:17,18:19}[n]
  answer=texts(slides[answer_number-1])
  out.append(f'<details class="film-observations" id="slide-{answer_number}"><summary>What to notice <span>Reveal observations</span></summary><div class="answer-layout"><ul class="film-points">'+''.join(f'<li>{esc(answer[i])}</li>' for i in [4,6,8,10])+f'</ul><aside class="blender-note"><span class="eyebrow">IN BLENDER</span><p>{esc(answer[12])}</p></aside></div></details>')

 else:
  out.append(top(n,'Learning to see')+f'<h2>{esc(t[0])}</h2><p class="lead">{esc(t[1])}</p><p class="statement">{esc(t[2])}</p>')
 out.append('</section>')
out.append(appeal())
out.append((root/'playground.html').read_text(encoding='utf-8'))
p=root/'dist/index.html';page=p.read_text(encoding='utf-8');start=page.index('<!-- COURSE_CONTENT -->');end=page.index('<!-- END_COURSE_CONTENT -->');page=page[:start]+'<!-- COURSE_CONTENT -->\n'+''.join(out)+'\n'+page[end:];page=page.replace('A 3-DAY','DAY 1').replace('OBSERVE → UNDERSTAND → CREATE','DAY 1 / MOTION GRAPHICS PRINCIPLES').replace('29 SLIDES, ONE CONTINUOUS JOURNEY','29 SLIDES · SCROLL TO EXPLORE').replace('assets/image1.png','assets/image1.webp');p.write_text(page,encoding='utf-8')
page=page.replace('href="#slide-2"','href="#slide-3"').replace('29 SLIDES · SCROLL TO EXPLORE','27 SECTIONS · SCROLL TO EXPLORE').replace('28 SECTIONS · SCROLL TO EXPLORE','27 SECTIONS · SCROLL TO EXPLORE')
page=re.sub(r'<span><b id="current-slide">.*?</b> / 29</span>','',page)
page=page.replace('27 SECTIONS · SCROLL TO EXPLORE','SCROLL TO EXPLORE')
navigation=[('#slide-1','Overview'),('#slide-5','Observe'),('#slide-20','Understand'),('#motion-lab','Experiment')]
navigation_links=''.join(f'<a href="{target}">{label}</a>' for target,label in navigation)
page=re.sub(r'<nav class="topnav" aria-label="Course navigation">.*?</nav>',f'<nav class="topnav" aria-label="Course navigation">{navigation_links}</nav>',page)
page=re.sub(r'<nav aria-label="Chapters">.*?</nav>',f'<nav aria-label="Chapters">{navigation_links}</nav>',page)
page=re.sub(r'<details class="contents">.*?</details>', '<a class="part-link" href="foundation.html">Part 2 ↗</a>',page)
css_version=hashlib.sha256((root/'dist/styles.css').read_bytes()).hexdigest()[:12]
module_paths=[root/'dist'/name for name in ('app.js','motion.js','learning.js','playground.js')]
module_sources=[re.sub(r'\.js\?v=[a-f0-9]+','.js',file.read_text(encoding='utf-8')) for file in module_paths]
module_version=hashlib.sha256(''.join(module_sources).encode()).hexdigest()[:12]
for file,source in zip(module_paths,module_sources):
 source=re.sub(r"from '(\./(?:motion|learning|playground)\.js)'",lambda m:f"from '{m[1]}?v={module_version}'",source)
 file.write_text(source,encoding='utf-8')
js_version=hashlib.sha256((root/'dist/app.js').read_bytes()).hexdigest()[:12]
page=re.sub(r'src="app\.js(?:\?[^" ]*)?"',f'src="app.js?v={js_version}"',page)
page=re.sub(r'href="styles\.css(?:\?[^" ]*)?"',f'href="styles.css?v={css_version}"',page)
page=page.replace('</head>', '<script defer src="fullscreen.js"></script></head>') if 'src="fullscreen.js"' not in page else page
p.write_text(page,encoding='utf-8')
print('Composed streamlined course with merged references and inline experiments.')

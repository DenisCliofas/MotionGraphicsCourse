from pathlib import Path
import json,html,re,hashlib
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
 if s['number'] in (2,4):continue # Project overview and deliverables are presented separately.
 n=s['number'];t=texts(s);chapter='The course' if n<5 else 'See & understand motion' if n<20 else 'Core motion principles'
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
   for i,label in enumerate(t[4].replace('Exageration','Exaggeration').split('\n')):
    out.append(f'<a href="#slide-{21+i}">{esc(label)}</a>' if i<9 else '<span>Appeal</span>')
   out.append('</nav>')
 elif n in [7,9] or n>=21:
  label=next((b['text'] for b in s['blocks'] if b['y']>=6200000 and len(b['text'])>3),'Motion study')
  out.append(top(n,label)+f'<h2>{esc(t[0])}</h2><p class="lead">{esc(t[1])}</p><div class="comparison">')
  count=(len(t)-3)//2
  comparison_assets=s['assets'][:2]
  if n in (26,27,29):comparison_assets=list(reversed(comparison_assets)) # Correct the swapped squash/stretch, follow-through, and secondary-motion examples.
  for i,a in enumerate(comparison_assets):
   group=t[2+i*count:2+(i+1)*count]
   out.append(f'<article class="comparison-card"><div class="comparison-title"><span class="eyebrow">{esc(group[0])}</span><h3>{esc(group[1])}</h3></div>{media(a,group[0]+": "+group[1])}<div class="comparison-description">'+''.join(f'<p>{esc(line)}</p>' for line in group[2:])+'</div></article>')
  out.append('</div><div class="comparison-tools"><span>Same object. Different motion.</span></div>'+prompt(t[-1]))
 elif n in [11,12,14,16,18]:
  url=s['links'][0];video_id=url.split('/embed/')[1].split('?')[0]
  out.append(top(n,t[0])+f'<div class="reference-layout"><div><h2>{esc(t[1])}</h2><p class="lead">{esc(t[2])}</p>{prompt(t[3])}</div><div class="film" data-video-id="{video_id}"><button class="film-play" aria-label="Play reference film: {esc(t[4])}">{media(s["assets"][0],t[4])}<span class="film-play-label"><span class="film-play-icon" aria-hidden="true">▶</span><span class="film-play-copy">Watch reference film<small>by {esc(t[4])}</small></span></span></button></div></div>')
 elif n in [13,15,17,19]:
  out.append(top(n,t[0])+f'<h2>{esc(t[1])}</h2><p class="lead">{esc(t[2])}</p><div class="answer-layout"><ol class="observations">')
  for i in [4,6,8,10]:out.append(f'<li>{esc(t[i])}</li>')
  out.append(f'</ol><aside class="blender-note"><span class="eyebrow">IN BLENDER</span><p>{esc(t[12])}</p></aside></div>'+prompt(t[13]))
 else:
  out.append(top(n,'Learning to see')+f'<h2>{esc(t[0])}</h2><p class="lead">{esc(t[1])}</p><p class="statement">{esc(t[2])}</p><p class="watch-note">{esc(t[3])}</p>')
 out.append('</section>')
out.append('''<section class="lesson lab tracked" id="motion-lab" data-number="29" data-chapter="Motion playground"><div class="lesson-top"><span class="eyebrow">INTERACTIVE STUDY</span><a class="source-link" href="#slide-20">Revisit the principles ↑</a></div><h2>One object.<br>Different personalities.</h2><p class="lead">Change the movement. Keep the object. Compare how timing, easing, and a small anticipation change what you feel.</p><div class="lab-layout"><div class="lab-stage"><div class="scene" id="lab-scene"><img class="scene-fallback" src="assets/image1.webp" alt="Geometric motion study illustration"><canvas role="img" aria-label="Motion study: an orange object moves from A to B above a smaller gray ball that always moves linearly."></canvas><div class="lab-scene-label"><span>MOTION COMPARISON</span><span>A → B</span></div></div><div class="motion-legend" aria-label="Animation legend"><span><i class="legend-dot selected" aria-hidden="true"></i><span>Orange: <strong id="study-label">Ease in / out</strong></span></span><span><i class="legend-dot reference" aria-hidden="true"></i><span>Gray: <strong>Always linear</strong></span></span></div><div class="lab-bar"><button id="lab-play" type="button" aria-pressed="false">Pause</button><label for="scrub">Time</label><input id="scrub" type="range" min="0" max="1000" value="0" aria-label="Scrub motion study"><output id="lab-time" for="scrub">0.0 s</output></div></div><div class="lab-controls"><fieldset class="mode-controls"><legend>Movement</legend>''')
for mode,label in [('linear','Linear'),('ease','Ease in / out'),('anticipation','Anticipation'),('overshoot','Overshoot'),('heavy','Heavy'),('playful','Playful')]:out.append(f'<label><input type="radio" name="motion-mode" value="{mode}" {"checked" if mode=="ease" else ""}><span>{label}</span></label>')
out.append('''</fieldset><p id="lab-description" class="lab-description" aria-live="polite">Slow at the start, fast in the middle, soft at the end. The same distance feels more deliberate.</p><label class="control-label" for="duration">Move duration <output id="duration-value">2.0 s</output></label><input id="duration" type="range" min="0.6" max="4" step="0.1" value="2"><div class="curve-panel"><svg viewBox="0 0 300 110" role="img" aria-label="Position over time. Orange shows the selected movement; grey shows linear motion."><path d="M15 8V90H290" fill="none" stroke="#bdb6aa" stroke-width="1"/><path d="M15 85L285 15" fill="none" stroke="#bdb6aa" stroke-dasharray="4 5"/><path id="motion-curve" fill="none" stroke="#e74429" stroke-width="2.5"/><circle id="curve-dot" r="4" fill="#151515"/></svg><p>Position over time · orange: selected motion · grey: linear</p></div></div></div><p class="prompt">What changed in the way you read the object? Try a short movement, then a long one.</p></section>''')
p=root/'dist/index.html';page=p.read_text(encoding='utf-8');start=page.index('<!-- COURSE_CONTENT -->');end=page.index('<!-- END_COURSE_CONTENT -->');page=page[:start]+'<!-- COURSE_CONTENT -->\n'+''.join(out)+'\n'+page[end:];page=page.replace('A 3-DAY','DAY 1').replace('OBSERVE → UNDERSTAND → CREATE','DAY 1 / MOTION GRAPHICS PRINCIPLES').replace('29 SLIDES, ONE CONTINUOUS JOURNEY','29 SLIDES · SCROLL TO EXPLORE').replace('assets/image1.png','assets/image1.webp');p.write_text(page,encoding='utf-8')
page=page.replace('href="#slide-2"','href="#slide-3"').replace('29 SLIDES · SCROLL TO EXPLORE','27 SECTIONS · SCROLL TO EXPLORE').replace('28 SECTIONS · SCROLL TO EXPLORE','27 SECTIONS · SCROLL TO EXPLORE')
page=re.sub(r'<span><b id="current-slide">.*?</b> / 29</span>','',page)
page=page.replace('27 SECTIONS · SCROLL TO EXPLORE','SCROLL TO EXPLORE')
navigation=[('#slide-1','Overview'),('#slide-5','Observe'),('#slide-20','Understand'),('#motion-lab','Experiment')]
navigation_links=''.join(f'<a href="{target}">{label}</a>' for target,label in navigation)
page=re.sub(r'<nav class="topnav" aria-label="Course navigation">.*?</nav>',f'<nav class="topnav" aria-label="Course navigation">{navigation_links}</nav>',page)
page=re.sub(r'<nav aria-label="Chapters">.*?</nav>',f'<nav aria-label="Chapters">{navigation_links}</nav>',page)
css_version=hashlib.sha256((root/'dist/styles.css').read_bytes()).hexdigest()[:12]
js_version=hashlib.sha256((root/'dist/app.js').read_bytes()).hexdigest()[:12]
page=re.sub(r'src="app\.js(?:\?[^" ]*)?"',f'src="app.js?v={js_version}"',page)
page=re.sub(r'href="styles\.css(?:\?[^" ]*)?"',f'href="styles.css?v={css_version}"',page)
p.write_text(page,encoding='utf-8')
print('Composed 27 Day 1 sections without visible slide numbering.')

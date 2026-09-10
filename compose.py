from pathlib import Path
import json,html,re
root=Path(__file__).parent
slides=json.loads((root/'dist/course.json').read_text(encoding='utf-8'))
def esc(s):return html.escape(s).replace('\n',' ')
def texts(s):return [b['text'] for b in s['blocks'] if b['y']<6200000 and b['text']!='WATCH VIDEO']
def media(a,label):
 if a['animated']:
  return f'<video controls muted loop playsinline preload="none" poster="{a["poster"]}" src="{a["src"]}" data-src="{a["src"]}" aria-label="{esc(label)}" style="--ratio:{a["width"]}/{a["height"]}"><a href="{a["src"]}">Watch {esc(label)}</a></video>'
 return f'<img src="{a["src"]}" alt="{esc(label)}" width="{a["width"]}" height="{a["height"]}" loading="lazy" decoding="async">'
def top(n,tag):return f'<div class="lesson-top"><span class="eyebrow">{esc(tag)}</span><span class="slide-number">{n:02d} / 29</span></div>'
def prompt(s):return f'<p class="prompt">{esc(s)}</p>'
out=[]
for s in slides[1:]:
 n=s['number'];t=texts(s);chapter='The course' if n<5 else 'See & understand motion' if n<20 else 'Core motion principles'
 cls='lesson tracked'
 if n in [5,20]:cls+=' chapter-cover'
 if n in [11,12,14,16,18]:cls+=' reference-lesson'
 out.append(f'<section class="{cls}" id="slide-{n}" data-number="{n}" data-chapter="{chapter}">')
 if n==2:
  out.append(top(n,'The project')+f'<h2>A small system.<br>A satisfying loop.</h2><p class="lead">{esc(t[1])}</p><div class="spec-grid">')
  for title,body in [('10 sec','Minimum duration'),('Full HD','1920 × 1080 render'),('30 fps','Minimum frame rate'),('301 = 1','Frame 301 matches frame 1')]:out.append(f'<div><strong>{title}</strong><span>{body}</span></div>')
  out.append('</div>')
 elif n==3:
  out.append(top(n,'The course structure')+f'<h2>{esc(t[0])}</h2><p class="lead">{esc(t[1])}</p><div class="day-grid">')
  for day,title,body in [('01','Foundations','Blender basics, scene setup, first beautiful movement.'),('02','Rhythm','Relay timing, staggered actions, composition build.'),('03','Reveal','Loop closure, render setup, independent project launch.')]:out.append(f'<div><span class="day-number">{day}</span><span class="eyebrow">DAY {int(day)}</span><h3>{title}</h3><p>{body}</p></div>')
  out.append('</div>')
 elif n==4:
  out.append(top(n,'Final deliverables')+f'<h2>{esc(t[0])}</h2><p class="lead">{esc(t[1])}</p><div class="deliverables">')
  for i in range(2,len(t),3):out.append(f'<div><span>{esc(t[i])}</span><h3>{esc(t[i+1])}</h3><p>{esc(t[i+2])}</p></div>')
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
  for i,a in enumerate(s['assets'][:2]):
   group=t[2+i*count:2+(i+1)*count]
   out.append(f'<article class="comparison-card"><div class="comparison-title"><span class="eyebrow">{esc(group[0])}</span><h3>{esc(group[1])}</h3></div>{media(a,group[0]+": "+group[1])}<div class="comparison-description">'+''.join(f'<p>{esc(line)}</p>' for line in group[2:])+'</div></article>')
  out.append('</div><div class="comparison-tools"><button class="replay-pair" type="button"><span aria-hidden="true">↻</span> Replay both</button><span>Same object. Different motion.</span></div>'+prompt(t[-1]))
 elif n in [11,12,14,16,18]:
  url=s['links'][0];video_id=url.split('/embed/')[1].split('?')[0];watch='https://www.youtube.com/watch?v='+video_id
  out.append(top(n,t[0])+f'<div class="reference-layout"><div><h2>{esc(t[1])}</h2><p class="lead">{esc(t[2])}</p>{prompt(t[3])}<p class="film-credit">{esc(t[4])}</p><a class="source-link" href="{watch}" target="_blank" rel="noopener noreferrer">Open original film ↗</a></div><div class="film" data-video-id="{video_id}"><button class="film-play" aria-label="Play reference film: {esc(t[4])}">{media(s["assets"][0],t[4])}<span class="film-play-label"><span aria-hidden="true">▶</span> Watch reference film</span></button></div></div>')
 elif n in [13,15,17,19]:
  out.append(top(n,t[0])+f'<h2>{esc(t[1])}</h2><p class="lead">{esc(t[2])}</p><div class="answer-layout"><ol class="observations">')
  for i in [4,6,8,10]:out.append(f'<li>{esc(t[i])}</li>')
  out.append(f'</ol><aside class="blender-note"><span class="eyebrow">IN BLENDER</span><p>{esc(t[12])}</p></aside></div>'+prompt(t[13]))
 else:
  out.append(top(n,'Learning to see')+f'<h2>{esc(t[0])}</h2><p class="lead">{esc(t[1])}</p><p class="statement">{esc(t[2])}</p><p class="watch-note">{esc(t[3])}</p>')
 out.append('</section>')
out.append('''<section class="lesson lab tracked" id="motion-lab" data-number="29" data-chapter="Motion playground"><div class="lesson-top"><span class="eyebrow">INTERACTIVE STUDY</span><a class="source-link" href="#slide-20">Revisit the principles ↑</a></div><h2>One object.<br>Different personalities.</h2><p class="lead">Change the movement. Keep the object. Compare how timing, easing, and a small anticipation change what you feel.</p><div class="lab-layout"><div class="lab-stage"><div class="scene" id="lab-scene"><img class="scene-fallback" src="assets/image1.webp" alt="Geometric motion study illustration"><canvas role="img" aria-label="Motion study: an orange object moves from A to B above a linear reference object."></canvas><div class="lab-scene-label"><span id="study-label">EASE IN / OUT</span><span>A → B</span></div></div><div class="lab-bar"><button id="lab-play" type="button" aria-pressed="false">Pause</button><label for="scrub">Time</label><input id="scrub" type="range" min="0" max="1000" value="0" aria-label="Scrub motion study"><output id="lab-time" for="scrub">0.0 s</output></div></div><div class="lab-controls"><fieldset class="mode-controls"><legend>Movement</legend>''')
for mode,label in [('linear','Linear'),('ease','Ease in / out'),('anticipation','Anticipation'),('overshoot','Overshoot'),('heavy','Heavy'),('playful','Playful')]:out.append(f'<label><input type="radio" name="motion-mode" value="{mode}" {"checked" if mode=="ease" else ""}><span>{label}</span></label>')
out.append('''</fieldset><p id="lab-description" class="lab-description" aria-live="polite">Slow at the start, fast in the middle, soft at the end. The same distance feels more deliberate.</p><label class="control-label" for="duration">Move duration <output id="duration-value">2.0 s</output></label><input id="duration" type="range" min="0.6" max="4" step="0.1" value="2"><div class="curve-panel"><svg viewBox="0 0 300 110" role="img" aria-label="Position over time. Orange shows the selected movement; grey shows linear motion."><path d="M15 8V90H290" fill="none" stroke="#bdb6aa" stroke-width="1"/><path d="M15 85L285 15" fill="none" stroke="#bdb6aa" stroke-dasharray="4 5"/><path id="motion-curve" fill="none" stroke="#e74429" stroke-width="2.5"/><circle id="curve-dot" r="4" fill="#151515"/></svg><p>Position over time · orange: selected motion · grey: linear</p></div></div></div><p class="prompt">What changed in the way you read the object? Try a short movement, then a long one.</p></section>''')
p=root/'dist/index.html';page=p.read_text(encoding='utf-8');start=page.index('<!-- COURSE_CONTENT -->');end=page.index('<!-- END_COURSE_CONTENT -->');page=page[:start]+'<!-- COURSE_CONTENT -->\n'+''.join(out)+'\n'+page[end:];page=page.replace('A 3-DAY','DAY 1').replace('OBSERVE → UNDERSTAND → CREATE','DAY 1 / MOTION GRAPHICS PRINCIPLES').replace('29 SLIDES, ONE CONTINUOUS JOURNEY','29 SLIDES · SCROLL TO EXPLORE').replace('assets/image1.png','assets/image1.webp');p.write_text(page,encoding='utf-8')
print('Composed all 29 Day 1 slides and the interactive motion study.')

from pathlib import Path
p=Path(__file__).parent/'dist/index.html'
s=p.read_text(encoding='utf-8')
s=s.replace('103','29').replace('3-DAY BEGINNER COURSE','DAY 1 / MOTION GRAPHICS PRINCIPLES').replace('A DAY 1','DAY 1').replace('An interactive course','Day 1: Motion Graphics Principles')
s=s.replace('<a href="#slide-31">Create</a>','<a href="#motion-lab">Experiment</a>')
start=s.index('<a href="#slide-31"><span>03</span>')
end=s.index('</nav></details>',start)
s=s[:start]+'<a href="#motion-lab"><span>03</span> Motion playground</a>'+s[end:]
p.write_text(s,encoding='utf-8')

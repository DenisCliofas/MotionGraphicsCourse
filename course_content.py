from html import escape

EXPERIMENTS={
 21:('timing','Duration',.6,4,.1,2,'s','Change duration. Dots mark equal time intervals; their gaps show spacing.'),
 22:('easing','Easing',0,1,.05,.7,'','Keep duration fixed. Change how the object gains and loses speed.'),
 23:('weight','Bounce height',0,1,.05,.2,'','Compare a restrained impact with a lively rebound.'),
 24:('anticipation','Pullback',0,1,.05,.45,'','Prepare the main action with a small move in the opposite direction.'),
 25:('arcs','Arc height',0,1,.05,.55,'','Compare a straight path with a curved gesture.'),
 26:('squash','Deformation',0,1,.05,.6,'','Compress on impact and stretch in flight. The diagram preserves area.'),
 27:('overlap','Follow delay',0,.5,.02,.2,'s','Let the second part follow and settle after the leader.'),
 28:('overshoot','Overshoot',0,1,.05,.45,'','Pass the destination, then settle back onto it.'),
 29:('secondary','Supporting motion',0,1,.05,.3,'','Keep the supporting reaction smaller than the main action.')
}

def experiment(n):
 key,label,minimum,maximum,step,value,unit,hint=EXPERIMENTS[n]
 if key=='arcs':
  return '''<details class="mini-experiment" data-experiment="arcs"><summary>Try it <span>Shape the motion path</span></summary><div class="mini-body"><div class="mini-control"><span>Motion path</span><button class="arc-reset" type="button">Reset path</button><button class="mini-pause" type="button" aria-pressed="false">Pause</button></div><svg class="arc-editor" viewBox="0 0 720 300" aria-label="Editable motion path"><path class="arc-guides"/><path class="arc-path"/><circle cx="70" cy="240" r="5" fill="#626262"/><circle cx="650" cy="240" r="5" fill="#626262"/><text x="65" y="274">A</text><text x="645" y="274">B</text><circle class="arc-ball" r="15" fill="#ff5a3d"/><g class="arc-handle" tabindex="0" role="button" aria-label="First path handle. Drag or use arrow keys."><circle r="24" fill="transparent"/><circle r="10" class="arc-knob"/></g><g class="arc-handle" tabindex="0" role="button" aria-label="Second path handle. Drag or use arrow keys."><circle r="24" fill="transparent"/><circle r="10" class="arc-knob"/></g></svg><p>Drag the handles sideways or up and down. Use arrow keys when focused.</p></div></details>'''

 return f'''<details class="mini-experiment" data-experiment="{key}"><summary>Try it <span>Adjust {label.lower()}</span></summary><div class="mini-body"><div class="mini-control"><label for="experiment-{key}">{label}</label><output for="experiment-{key}">{value}{unit}</output><button class="mini-pause" type="button" aria-pressed="false">Pause</button></div><input id="experiment-{key}" type="range" min="{minimum}" max="{maximum}" step="{step}" value="{value}" data-unit="{unit}"><canvas width="720" height="210" role="img" aria-label="Interactive {key} diagram. {escape(hint)}"></canvas><p>{escape(hint)}</p></div></details>'''

PREDICTIONS={
 22:('Which movement changes speed?',1,'The right example accelerates and decelerates. The left keeps a constant speed.'),
 23:('Which object feels heavier?',1,'The right example uses a more restrained rebound and settle to suggest weight.'),
 26:('Which example makes deformation visible?',1,'The right example compresses and stretches. The left keeps its shape.')
}

def prediction(n):
 question,answer,explanation=PREDICTIONS[n]
 return f'''<div class="prediction" data-answer="{answer}" data-explanation="{escape(explanation,quote=True)}"><button class="prediction-start" type="button" aria-expanded="false">Try a prediction</button><div class="prediction-question" hidden><p>{question}</p><div class="prediction-choices"><button type="button" data-choice="0">Left example</button><button type="button" data-choice="1">Right example</button><button type="button" class="prediction-reveal">Show explanation</button></div><p class="prediction-feedback" role="status"></p></div></div>'''

def appeal():
 return '''<section class="lesson tracked" id="appeal" data-chapter="Core motion principles"><div class="lesson-top"><span class="eyebrow">Appeal</span></div><h2>Make the idea easy to read.</h2><p class="lead">Clear silhouettes, deliberate spacing, and a strong focal point make a design inviting. Appeal can be playful, precise, or quiet.</p><details class="mini-experiment" data-experiment="appeal"><summary>Try it <span>Adjust visual hierarchy</span></summary><div class="mini-body"><div class="mini-control"><label for="experiment-appeal">Visual hierarchy</label><output for="experiment-appeal">0.7</output><button class="mini-pause" type="button" aria-pressed="false">Pause</button></div><input id="experiment-appeal" type="range" min="0" max="1" step="0.05" value="0.7" data-unit=""><canvas width="720" height="210" role="img" aria-label="Composition diagram: adjust hierarchy to separate one focal object from supporting objects."></canvas><p>Give one object priority through spacing, scale, and contrast.</p></div></details><p class="prompt">Can you tell where to look before anything moves?</p></section>'''

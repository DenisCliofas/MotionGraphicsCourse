# Motion Design in Blender · Day 1

Scroll-based adaptation of `Motion_Design_Day1_Moption_Graphics_Principles.pptx`. Project requirements are omitted as requested. Reference films and observations are combined, repeated copy is removed, and selected principles include optional prediction questions and schematic experiments. Original slide IDs are retained where useful; visible numbering is omitted. The PowerPoint remains unchanged.

## Preview

Serve `dist` over HTTP, for example `python -m http.server 4173 --directory dist`, then open http://localhost:4173. ES modules require HTTP rather than opening the HTML directly.

## Editing

- `dist/index.html`: the complete course, readable without JavaScript.
- `dist/styles.css`: a white, neutral gray, charcoal, and orange palette, responsive layouts and UI transitions.
- `dist/app.js`: Three.js relay, motion playground, progress, media playback and navigation.
- `dist/motion.js`: preset curves, cubic Bézier inversion and teaching-diagram motion.
- `dist/playground.js`: 3D study, equal-time trails, draggable Bézier handles, keyboard editing and numeric sliders.
- `dist/learning.js`: prediction questions and inline Canvas teaching diagrams.
- `course_content.py`: inline experiment configuration and Appeal lesson.
- `playground.html`: the interactive study layout.
- `check-motion.mjs`: curve and deformation regression checks.
- `dist/assets`: locally bundled Three.js, fonts, and optimized media from the Day 1 deck. Reference films use the deck's original YouTube links and load only on request.
- `dist/course.json`: extracted text, assets and links for all 29 original slides.

The site uses native HTML controls, CSS and Three.js 0.180.0; no package installation or build is required. Its Sites configuration is `.openai/hosting.json`.

## Rebuilding the course content

`extract.py` reads the source deck in the parent directory. `optimize.py` creates MP4/WebP versions of its media using the local FFmpeg executable. `compose.py` writes the course sections into the marked region of `dist/index.html`. `finalize.py` bundles fonts and removes unused generated media. These authoring scripts require Pillow. Run in that order if changing the PowerPoint.

The 3D relay is an illustrative study of the slide's geometric system. The interactive study supports six presets plus a custom Bézier curve, duration adjustment, scrubbing and equal-time trails, with a linear reference. The source videos remain the course's demonstrations. Custom 3D models can replace the procedural geometry in a future edit; no upload control is included.

## Accessibility and performance

Native scroll and anchor navigation, visible keyboard focus, reduced-motion support, global pause, touch controls, lazy media playback and offscreen rendering suspension. When WebGL is unavailable, the original illustration and the interactive curve remain available. Font and Three.js files are local. Only external reference films require third-party access.

Run `validate.py` for lesson coverage, local links/assets, JavaScript module syntax, media decoding and curve mathematics. Browser/device visual testing has not been performed.

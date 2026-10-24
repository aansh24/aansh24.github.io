# Aansh Yadav — Portfolio

Plain HTML/CSS/JS — no build step.

## Run locally
Open a terminal in this folder and run:

    powershell -ExecutionPolicy Bypass -File serve.ps1

then visit http://localhost:5173

## Edit content
- **All text, journey entries and projects:** `js/data.js`
- **Your photo in the hero:** save a transparent cut-out PNG as `assets/aansh.png` (it replaces the silhouette automatically)
- **Resume:** `assets/Aansh-Yadav-Resume.pdf`

## Live site
https://aansh24.github.io — served by GitHub Pages from the `main` branch of
https://github.com/aansh24/aansh24.github.io. Push to `main` and the site updates in a minute or two.

## How it works
- `js/starry.js` paints the Starry-Night-style sky stroke by stroke on a canvas (nothing downloaded).
- `js/covers.js` draws every project cover (the Fractals cover is a real Newton fractal).
- `js/main.js` runs the scroll choreography (GSAP + ScrollTrigger) and smooth scrolling (Lenis).
- `js/film.js` + `css/film.css` are "The Story" section (between Journey and Featured Projects): a pinned,
  scroll-scrubbed film — velvet curtain sweep, cloud push-in, a live WebGL Newton-fractal zoom, a paper tear,
  a real SVD of the site's sky sharpening from rank 1 to 48, and clouds that part into the next section.
  Its timing lives in the `T` and `TEXT` tables at the top of `film.js`; delete the `<section class="film">`
  block in `index.html` to remove it.
- `js/skills.js` + `css/skills.css` are "The Hall of Skills" (between More Works and Let's Talk): a scroll-driven
  first-person walk through four three.js halls — Code, Signals, Craft and Numbers — with one animated sculpture
  per LinkedIn skill. Edit the `SKILLS` list at the top of `skills.js` to add, remove or reword a skill; each
  entry names its hall, its sculpture (`obj`), an example line and its LinkedIn context chips.

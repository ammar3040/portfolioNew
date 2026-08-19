# Ammar Shaikh — Studio Portfolio

Editorial portfolio with warm terracotta palette, light/dark toggle, split‑text hero animation, horizontal pin‑scroll for projects, animated counters, timeline draw, big scroll‑fill contact heading, and a matte low‑poly 3D sculpture in the hero.

## Run locally

Uses ES modules + importmap, so it must be served over HTTP (not opened as `file://`).

```bash
cd portfolio
python3 -m http.server 8765
# open http://localhost:8765/
```

## Stack

- **Three.js** — hero: matte low‑poly icosahedron with warm rim lighting (theme‑aware colors)
- **GSAP + ScrollTrigger** — split‑text, horizontal pin, text fill, timeline draw, counters
- **Lenis** — smooth scrolling (vendored in `vendor/lenis.mjs`)
- **Vanilla HTML + CSS + JS** — no build step

## Themes

Click the sun/moon icon in the nav to toggle between:
- **Dark** — deep warm charcoal `#0f0d0a` + terracotta `#d97b57` + ochre + sage
- **Light** — warm cream paper `#f4ecdb` + deep terracotta `#b8542e` + forest + ochre

Choice is stored in `localStorage`. The 3D scene recolors on toggle.

## Notable animations

| Element | Behavior |
|---------|----------|
| Preloader | Counts 0→100 with animated bar |
| Hero title | Char‑by‑char reveal, staggered by line, using Fraunces italic |
| Stats | Numbers animate 0→target on scroll |
| Nav "Hire me" | Text scrolls to "Let's talk" on hover |
| Section indicator | Fixed bottom‑left, updates as you scroll |
| Marquee strips | Horizontal auto‑scroll, boosts with scroll velocity |
| Projects (`#work`) | **Pin + horizontal scroll** — vertical scroll drives horizontal movement across 4 cards |
| Timeline | Line draws in top‑to‑bottom, dots pop in sequence |
| Testimonials | Rise on scroll with subtle tilt |
| Contact heading | Text fills from surface → ink → accent as you scroll into it |
| Contact cards | Terracotta fills up from bottom on hover |
| 3D sculpture | Slow rotation, follows cursor, shrinks and drops on scroll |

## Files

| File | Purpose |
|------|---------|
| `index.html` | Structure |
| `styles.css` | Themes + all animation states |
| `main.js` | All interactions and the 3D scene |
| `vendor/lenis.mjs` | Local Lenis build |

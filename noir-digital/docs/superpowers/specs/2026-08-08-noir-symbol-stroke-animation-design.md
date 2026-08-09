# NOIR Symbol Stroke Animation Design

## Objective

Create a standalone HTML study that reproduces only the opening act of the supplied "Stroke Study — GPT Mark" animation with the official NOIR symbol. The result contains no wordmark, copy, navigation, 3D extrusion, spin, tunnel, or closing lockup. It ends with the completed NOIR symbol held at rest.

The production artifact will be `prototypes/noir-symbol-stroke-study.html`. It must work when opened directly as a local file and when served over HTTP.

## Source artwork

The canonical artwork is `public/brand/noir-symbol.svg`, whose `0 0 164 186` viewBox contains two closed filled paths. The prototype will copy those two path definitions inline without changing their geometry.

The animation treats each official filled path as a closed contour, matching the supplied reference: the contour is rendered as line art while it is drawn, then receives the reference's restrained final fill. It will not invent a replacement monoline logo or redraw the NOIR silhouette.

## Visual sequence

The sequence keeps the visual grammar and approximate pacing of the reference's first act:

1. **Void, 0.00–0.50 s:** monochrome ground, central halo, no visible mark.
2. **Heart and dolly, 0.50–1.35 s:** a small light swells at the symbol's optical center, breathes, and compresses before the burst. In parallel, the stage settles from 113% to 100% scale between 0.80 s and 2.70 s, preserving the reference's restrained opening dolly.
3. **Emissaries, from 1.35 s:** one light particle per official path leaves the heart on a curved spiral, with a short stagger. Each particle has a crisp core, bloom, and a continuous tapered tail. It lands at that contour's seam and wakes its ghost outline.
4. **Contour construction, 2.20–5.15 s:** the two official paths are drawn progressively. Their start times are staggered, while their durations are derived from measured contour length and normalized so the last contour lands by 5.15 s. Each active contour uses the same visual stack as the reference: ghost, soft chase, blurred bloom, main stroke, pen tip, decaying trail, and deterministic pen embers.
5. **Ignition, 5.35–6.25 s:** a clockwise angular sweep moves across both contours, brightening the nearby path windows. A short completion pulse locks the icon and introduces the subtle final fill.
6. **Rest, after 6.25 s:** the completed icon remains centered as quiet line art with restrained bloom and fill. There is no ambient comet cycle or later film act.

The master timeline is deterministic: every rendered value is a pure function of the current animation time. No random value may change between replays; ember variation uses seeded deterministic noise.

## Rendering architecture

The study is a single dependency-free HTML document containing inline CSS, SVG, and JavaScript.

Only SVG is needed for this reduced scope. The reference's full-screen canvases and manual 3D projection are omitted because those systems begin after the approved cutoff.

The SVG layer order is:

1. restrained final fill;
2. ghost contours;
3. chase contours;
4. one blurred bloom group containing glow beds, flash windows, emissary halos, and tip halos;
5. main contours;
6. crisp emissaries, pen tips, trails, and embers.

At startup, the script creates the layers for both official path definitions and measures them with `getTotalLength()`. Progressive drawing uses `stroke-dasharray` and `stroke-dashoffset`. `getPointAtLength()` positions running tips, trails, emissaries, angular sweep windows, and embers.

The heart is placed at the artwork center `(82, 93)`. Each emissary targets the first point of its corresponding contour. Its spiral is precomputed once from the center to that seam.

The opening dolly is a 2D stage scale driven by the same numerically solved cubic Bézier timing function as the reference. There is no 3D scene or perspective after it settles.

## Styling and layout

- The icon is centered in a square responsive stage sized with `vmin` and capped for desktop.
- The page uses the reference's monochrome ethereal-depth atmosphere: one background color, one ink color, a central radial lift, and a restrained vignette.
- Dark mode is the default. System light mode and explicit `data-theme="dark|light"` overrides use the same token model as the reference.
- The document contains no visible interface or text.
- Device pixel ratio is irrelevant because the approved sequence is SVG-only.

## Replay and motion preferences

Primary click, `Enter`, or `Space` triggers replay after there is something to unravel. Replay first retracts the current contours in reverse order, including captured ghost, fill, and camera state, then restarts from the void. A replay already in progress ignores additional gestures.

The document clock pauses while the page is hidden so returning to the tab does not skip ahead.

With `prefers-reduced-motion: reduce`, the film is replaced by the completed static symbol with a very gentle luminance breath. Replay gestures do nothing in this mode.

## Accessibility

The stage is keyboard focusable and exposes a Portuguese accessible label equivalent to: "Ícone da NOIR sendo desenhado. Ative para reproduzir novamente." The internal SVG uses `role="img"`; decorative layers remain hidden from assistive technology. Focus styling is visible without adding persistent on-screen copy.

## Failure behavior

If SVG geometry measurement fails or returns an invalid length, the animation must never leave a blank screen. It falls back to the canonical filled NOIR symbol and logs one concise diagnostic to the console.

## Verification

Verification will cover:

- direct local-file loading and HTTP loading;
- absence of console and page errors;
- screenshots at the void, heart, emissary, active drawing, ignition, and final-rest beats;
- exact final geometry against `public/brand/noir-symbol.svg`;
- primary-click, `Enter`, and `Space` replay behavior;
- reverse unravel before restart;
- pause/resume across `visibilitychange`;
- responsive framing on desktop and a narrow mobile viewport;
- static reduced-motion behavior;
- dark, system-light, and explicit theme overrides.

A `?probe` hook will expose deterministic `at(time)` rendering for screenshot verification. It must not exist for ordinary URLs.

## Scope boundaries

This task does not integrate the study into the Next.js site, replace existing brand assets, modify the current preloader, publish or deploy the prototype, add sound, or reproduce any act after the initial ignition and rest state.

# NOIR Symbol Entry Preloader — Design

**Date:** 2026-08-09
**Status:** Approved in conversation; awaiting written-spec review
**Surface:** Home-page entry preloader

## Objective

Replace the current centered progress bar with the approved NOIR symbol-creation animation. The preloader must remain compact, communicate that the experience is loading, and preserve the existing readiness gates and dotted reveal into the hero.

The preloader contains only the NOIR icon. It must not add a wordmark, loading label, percentage, or other visible copy.

## Existing behavior to preserve

`EntryPreloader` currently:

- covers the viewport while critical fonts and the first compiled 3D scene frame become ready;
- locks page scrolling through the `data-entry-loading` document state;
- waits for the reveal shader to initialize before uncovering the page;
- begins the hero text shortly before the dotted reveal completes;
- skips the entry sequence during route transitions;
- removes non-essential motion when `prefers-reduced-motion` is enabled.

The new symbol animation changes the loading indicator, not these contracts.

## Visual design

- Keep the current full-viewport preloader surface and theme-aware background.
- Center the NOIR icon at an optical width of **118 px** on desktop and mobile.
- Use the two canonical paths from `public/brand/noir-symbol.svg`.
- Preserve the six approved luminous origins:
  - upper right;
  - inner lower fold;
  - lower right;
  - top;
  - upper left;
  - lower left.
- Retain the faint ghost contour, emissary trails, bright drawing tips, restrained bloom, ignition sweep, and final solid fill.
- The completed dark-theme mark is pure white (`#ffffff`), not gray.
- Do not show the former progress bar once the symbol preloader is active.

## Choreography

Compress the standalone study into a **2,600 ms** entry sequence:

1. **Pulse:** a central light appears and compresses.
2. **Flight:** six emissaries leave the center and reach the approved origins with a short stagger.
3. **Draw:** six independent fronts construct the two canonical contours.
4. **Ignition:** a localized light sweep seals the completed line art.
5. **Fill and settle:** the mark becomes solid white and holds briefly.

The symbol animation starts when the preloader mounts. The dotted page reveal starts only after both conditions are true:

- the 2,600 ms symbol sequence has completed; and
- document, critical fonts, and the first compiled 3D scene frame are ready.

If loading outlasts the animation, the mark remains fully white. A separate faint surrounding bloom breathes between 0.28 and 0.42 opacity over 1,400 ms to indicate a live waiting state; the white mark itself does not dim or loop through the creation sequence.

Once both gates are satisfied, retain the existing 250 ms reveal delay and 800 ms dotted reveal. Keep the current 500 ms hero-text lead so the entry transition remains synchronized with the first screen.

## Reduced motion

With `prefers-reduced-motion: reduce`:

- render the completed white symbol immediately;
- do not enforce the 2,600 ms minimum;
- continue waiting for the existing readiness gates;
- skip the animated dotted reveal according to the current behavior;
- never hide required page content behind an ornamental delay.

## Architecture

Create a focused client component named `NoirSymbolPreloaderMark` inside `components/preloader/`. It owns only the SVG layers and symbol timeline.

Extract deterministic timeline calculations into a small pure module so individual beats can be tested without animation-frame timing. The component uses one `requestAnimationFrame` loop while the creation sequence is active, then stops at the completed state. The waiting bloom uses only opacity animation and is disabled for reduced motion.

`EntryPreloader` remains the orchestration boundary. It will:

- keep tracking document, font, scene, and reveal-shader readiness;
- track whether the symbol sequence has completed;
- begin the existing page reveal only when all gates pass;
- render the symbol mark in place of the current progress track;
- keep all current document dataset and route-transition contracts.

The standalone prototype remains a design/reference artifact. Production must not embed it through an iframe or copy its full document shell.

## Failure behavior

- If SVG path measurement or animation initialization fails, render the canonical symbol in its completed white state and signal the symbol gate as complete.
- If the 3D scene is still pending, continue holding the completed mark under the existing scene-readiness contract.
- Do not introduce a new timeout that reveals an unready 3D scene.
- Clean up animation frames and listeners when the component unmounts.

## Testing and verification

### Unit and component tests

- Confirm the canonical two-path artwork is rendered.
- Confirm six emissaries and six drawing tips exist at the approved origins.
- Confirm the deterministic timeline reaches pulse, flight, draw, ignition, and complete states.
- Confirm `EntryPreloader` does not reveal before both the symbol and readiness gates pass.
- Confirm a slow scene holds the completed white mark without replaying creation.
- Confirm reduced motion renders the completed mark immediately and does not impose the minimum duration.
- Confirm route transitions do not replay the entry preloader.
- Confirm cleanup cancels active animation work.

### Browser verification

- Inspect the full first-load sequence in dark theme at desktop and mobile viewports.
- Verify the icon remains 118 px wide, centered, contained, and visually legible.
- Verify all six light fronts are visible during construction.
- Verify the final mark computes to pure white in dark theme.
- Verify a deliberately delayed scene holds the final mark and releases only after readiness.
- Verify reduced motion, no layout shift, no console errors, no scroll leak, and a continuous transition into the hero.

## Scope boundaries

This change does not redesign the hero, route transitions, 3D scene, theme system, or dotted reveal shader. It does not add copy, audio, progress percentages, replay controls, or a looping logo animation. It applies to the existing initial home-page entry preloader only.

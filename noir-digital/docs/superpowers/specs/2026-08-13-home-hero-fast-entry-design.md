# NOIR Home Hero Fast Entry — Design

**Date:** 2026-08-13
**Status:** Approved in conversation
**Surface:** Initial home-page entry and hero readiness

## Objective

Reduce the time before the home hero becomes usable without changing its layout, glass material, spectral lighting, stickers, typography, or dotted reveal signature.

The measured production build paints at 188 ms and settles the hero WebGL scene at about 1,009 ms, but the current entry sequence holds the hero text until about 3,398 ms and removes the preloader at about 3,900 ms. The dominant delay is the fixed 2,600 ms symbol choreography followed by a 250 ms delay and an 800 ms reveal.

## Approaches considered

### 1. Compress the existing entry and decouple it from WebGL readiness — selected

Keep every visual beat and the dotted reveal, but shorten the choreography and allow the page to reveal once the document, fonts, symbol, and reveal shader are ready. The hero canvas continues loading independently and appears in its reserved fixed layer when ready.

This provides the largest perceived improvement with the smallest visual change. A slow or unsupported GPU no longer holds the whole page behind an ornamental loader.

### 2. Remove the entry preloader

This would expose the HTML fastest, but would discard the approved NOIR symbol construction and dotted transition. It is not selected because the entry is part of the brand experience.

### 3. Replace the dotted WebGL reveal and bake the glass environment

This can reduce GPU startup work further, but risks changing the approved dotted mask or the glass reflections. It remains a possible second optimization only if the first batch is insufficient.

## Selected behavior

- Compress the NOIR symbol sequence from 2,600 ms to **1,400 ms** while preserving pulse, flight, draw, ignition, fill, and settle beats.
- Reduce the post-gate reveal delay from 250 ms to **80 ms**.
- Reduce the dotted reveal duration from 800 ms to **520 ms**.
- Start hero text **360 ms before** the reveal completes, so it begins 160 ms after the reveal starts.
- Do not require `sceneReady` to uncover the HTML hero.
- Keep the canvas mounted immediately during entry so WebGL initialization continues in parallel.
- Keep the existing stable canvas layer and no-layout-shift behavior. If WebGL is late, the typography and background appear first; the NOIR model appears when its current readiness marker completes.
- Keep route-transition and reduced-motion shortcuts unchanged.
- Keep the existing progressive loading of stickers and contact models after the entry and headline settle.

Expected local timing is approximately 1.6 seconds for hero text and 2.0 seconds for full preloader removal, instead of 3.4 and 3.9 seconds respectively. Browser measurement, not the estimate, decides whether the batch is retained.

## Architecture

`EntryPreloader` remains the entry orchestrator. Its reveal gate will contain only requirements needed to present usable HTML safely: document, critical fonts, symbol timeline, and reveal runtime. Scene readiness remains independent and continues to drive the canvas-ready state.

The pure symbol timeline keeps its current phase model and origins. Only beat boundaries change, making the faster choreography deterministic and testable.

No changes are made to the GLB, glass shader, lighting palette, hero layout, page copy, or z-index composition.

## Failure and accessibility behavior

- If WebGL is slow or fails, the HTML hero still opens on schedule.
- If the reveal shader cannot initialize, its existing fallback marks the reveal gate ready.
- If symbol initialization fails, its existing completed-mark fallback remains.
- Reduced motion continues to show the completed mark immediately and skips ornamental transition timing.
- Route transitions continue to bypass the first-load sequence.

## Verification

- Update timeline and entry-gate unit tests for the new boundaries.
- Add a component test proving a pending 3D scene no longer blocks the entry.
- Run focused Vitest, lint, type/build checks, and `git diff --check`.
- Measure a fresh production-local navigation at desktop and mobile.
- Verify hero text timing, preloader removal timing, canvas readiness, no layout shift, no new console error, and unchanged first-screen composition.

## Scope boundary

This batch intentionally does not replace the dotted WebGL reveal, bake the PMREM environment, change shader compilation, remove the preloader, or alter the visible hero design. Those changes require a separate visual comparison if startup remains unsatisfactory.

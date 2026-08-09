# Homepage verification ledger

Date: 2026-07-10
Project: `noir-digital`
Scope: homepage only

## Contract

- The current local NOIR homepage and its approved viewport captures are the visual authority.
- `https://haoqi.design` is used for interaction and responsive intent, not as the Portuguese NOIR pixel oracle.
- The implementation is independent source code. It does not import the mirrored HTML or original minified Next.js chunks.
- Deterministic Chromium captures are enforced at a maximum one-percent differing-pixel ratio.
- Exact per-frame WebGL output may vary by GPU. This ledger does not claim mathematical pixel identity with the live HAOQI site.

## Final automated gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Biome | PASS | `npm run check`; 101 files, zero diagnostics |
| TypeScript | PASS | `npm run typecheck`; Next route types and strict `tsc --noEmit` |
| Unit/component | PASS | `npm test`; 21 files, 132 tests |
| Production build | PASS | `npm run build`; `/` prerendered, `/api/weather` dynamic |
| Interaction | PASS | `npm run test:e2e`; 33 passed, 1 intentional desktop skip |
| Visual/browser | PASS | `playwright.visual.config.ts`; 46 passed |
| React Doctor | PASS | `npm run doctor -- --verbose`; 100/100, no issues |
| Dependency audit | PASS | `npm audit --omit=dev`; zero vulnerabilities |

## Browser matrix

- Desktop: 1280x720 and 1440x900.
- Tablet: 768x1024.
- Mobile: 390x844, plus 320px reflow coverage.
- States: home, work, contact, light, dark, mobile menu, reduced motion, WebGL unavailable, and effects disabled.
- Stable screenshots: `tests/visual/home.visual.spec.ts-snapshots/`.
- Manual evidence: `.omo/evidence/home-shell/`, `.omo/evidence/principles/`, and `.omo/evidence/scene/`.

## Runtime debugging hypotheses

### H1: WebGL state leaks across theme and viewport changes

Result: rejected. The runtime audit retained exactly one canvas through dark/light and desktop/mobile transitions and observed zero unexpected `pageerror` or `console.error` messages. Unsupported WebGL is detected before the R3F module mounts; the page reports `failed`, marks readiness complete, and keeps the semantic DOM usable.

### H2: repeated menu/navigation cycles accumulate listeners or canvases

Result: rejected. Instrumented `keydown`, `pointermove`, and `resize` listener counts returned to their baseline after four open/Escape cycles; canvas count remained one.

### H3: fonts or model readiness cause cold-load layout shift

Result: rejected. Hero heading x/y/width changed by less than two CSS pixels between DOMContentLoaded, font readiness, and core-scene readiness; cumulative layout shift remained below `0.05`.

## Scene readiness and fallback

- `__NOIR_READY__` covers the hero/pointer critical path.
- `__NOIR_DECOR_READY__` covers sticker textures before approved home captures.
- `__NOIR_CONTACT_READY__` covers the progressively mounted contact GLTF before contact captures.
- `effects=off` downloads no model or sticker scene resources.
- WebGL failure uses the DOM/CSS fallback and preserves readable Principles backgrounds.

## Accessibility and resilience

- Theme and sound are native buttons with announced state.
- Character shortcuts require `Alt`, satisfying the character-key shortcut constraint.
- Pointer coordinates are visual decoration, not a high-frequency live region.
- Mobile menu traps focus, closes with Escape, and restores focus.
- Reduced motion exposes all content and switches the canvas to demand rendering.
- Weather, Web Storage, audio, images, and WebGL have deterministic failure paths.

## Accepted limitations

- HAOQI contact information, social links, metadata, six client placeholders, and external project-detail destinations remain temporary by approved scope.
- Weather cache/coalescing is per server instance; distributed rate limiting/cache belongs to deployment infrastructure.
- CSP/HSTS must be finalized with the production HTTPS host and nonce strategy.
- GPU-specific subpixel rendering can differ outside the pinned Chromium baseline environment.

## Independent QA

- QA FINAL-5: PASS, no blockers.
- Fresh 390px light/dark captures confirmed clear brand, full headline, `CRESCER`, and unobstructed 44x44 menu target.
- Fresh desktop/mobile review confirmed caustics, phase-specific stickers, contact readiness/contrast, and readable WebGL fallback.
- Final review lanes: code PASS, goal/spec PASS, security PASS, context/fidelity PASS, and QA PASS.

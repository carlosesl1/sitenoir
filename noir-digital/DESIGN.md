# NOIR Digital design system

What is on the site today. Values live in `styles/tokens.css`; `tests/brand-system.test.ts` fails if a
migrated screen stops using them. The brand guide is written from this file and those tokens.

## 1. Identity

Black, with light passing through it. The reference is the prism on *The Dark Side of the Moon*: white
light goes in, the spectrum comes out.

- **White dominates.** Colour appears as light: split at an edge, in a short moving glint, or as dots that
  fade out. It is never the main surface.
- **The spectrum is continuous.** Never show its colours flat and side by side, by letter, pixel, stripe or
  swatch: that reads as a pride flag, which is not what the brand says. All six colours appear together.
- **Green and lime are not brand colours.** Green is only one step of the spectrum.
- **There is one appearance: black.** No light theme.

## 2. Colour

| Token | Value | Use |
|---|---|---|
| `--color-noir-black` | `#030303` | Canvas, text on the white button |
| `--color-noir-graphite` | `#0b0d0e` | Raised surface |
| `--color-noir-warm-white` | `#f4f4f0` | Light, selection, focus |
| `--text-primary` | `rgb(244 244 240 / 96%)` | Text |
| `--text-secondary` | `rgb(168 173 178 / 68%)` | Labels, supporting text |
| `--text-disabled` | `rgb(168 173 178 / 36%)` | Placeholders |
| `--border-default` | `rgb(168 173 178 / 16%)` | Hairlines |
| `--border-strong` | `rgb(168 173 178 / 44%)` | Fields, secondary button contour |

The spectrum, always in this order: `--color-spectral-red` `#f2383a`, `-orange` `#ff8a2a`, `-yellow`
`#f7d94a`, `-green` `#55d86a`, `-blue` `#2f80ff`, `-violet` `#a855f7`.

Use it through `--spectrum-linear` (a continuous gradient), `--spectrum-glint` (the moving contour of the
buttons) and `--fringe-primary` / `--fringe-secondary` (split edges on letters). Red and green may also mean
error and success in form feedback.

A client's colour appears only inside that client's case page, as `--case-accent`. The optical tokens
(`--color-optical-*`, `--color-flare-tail`) belong to the 3D background and are not for interface use.

## 3. Type

Two families: **TikTok Sans** (variable weight and width) and **Departure Mono**. Every text picks a role
with `font: var(--role-x)`; no screen sets its own size, weight or line height.

| Role | Size | Weight / line | Family | Use |
|---|---|---|---|---|
| `--role-display-l` | `clamp(2.5rem, 5.4vw, 5.75rem)`, `7.6vw` on phones | 700 / 0.98 | Sans | Opens a screen: hero, mission, principles, closing, case and legal titles |
| `--role-display-m` | `clamp(1.75rem, 3vw, 3rem)`, `6.6vw` on phones | 700 / 1 | Sans | Opens a section or column |
| `--role-title` | `clamp(1.5rem, 2.2vw, 2rem)` | 600 / 1.1 | Sans | Legal section titles, project and channel names |
| `--role-subtitle` | `1.25rem` | 600 / 1.25 | Sans | Titles inside lists and cards |
| `--role-lead` | `clamp(1.125rem, 1.4vw, 1.25rem)` | 450 / 1.45 | Sans | Summaries, editorial paragraphs |
| `--role-body` | `1rem` | 450 / 1.55 | Sans | Running text, form fields |
| `--role-note` | `0.875rem` | 450 / 1.45 | Sans | Captions, notes, feedback |
| `--role-nav` | `1rem`, `0.875rem` below 1024px | 450 / 1.2 | Mono | Navigation |
| `--role-label` | `0.75rem` | 450 / 1.3 | Mono | Labels, numbers, metadata |
| `--role-button` | `0.875rem` | 700 / 1 | Sans | Buttons |
| `--role-wordmark` | `1rem` | 700 / 1 | Sans | "NOIR DIGITAL" in the header |

Rules that come with the roles:

- **One voice for titles.** Both display roles are uppercase and wide: `text-transform: uppercase` and
  `font-variation-settings: var(--wdth-wide)`. Keep titles short.
- **Tracking comes from tokens.** `--tracking-wide` on uppercase labels and buttons, `--tracking-tight` on
  titles and subtitles, `--tracking-none` to reset.
- **Mono is for labels only.** Sentences are never set in mono, legal text included.

## 4. Layout

- **One text axis.** Left-aligned text starts at `--text-axis`: 66px from 768px up, 26px below, 18px under
  360px. Brand, titles, labels and the status bar all share it.
- **Page gutter.** `--page-inline` and `--site-grid-inset`: 56px, 16px on phones.
- **Spacing.** `--space-*` is the 4px scale for new work. Most existing screens still use their own values.
- **Lines.** One-pixel hairlines separate things; cards have no shadows.

## 5. Components

### Button: `SpectrumContactCta`

One button, chamfered at two opposite corners. Every labelled action uses it; only the floating WhatsApp
button has its own compact shape.

| State | Prop | Look | Use |
|---|---|---|---|
| Primary | none | White surface; the glint runs around the contour on hover | Actions in general |
| Emphasis | `emphasis` | Same, with the glint always running and a glow behind it | The one main action of a screen: hero, closing, the end of a case, WhatsApp |
| Secondary | `variant="secondary"` | No surface, thin contour, 48px high | Navigation between pages |

Use at most one emphasis button per screen. On hover the white surface shifts off its contour.

### Service card

Used by the AI services and the WhatsApp card. Plain border, small marks on two opposite corners, a white
line icon in the top corner, and the **halftone light** behind it.

The halftone light is `public/brand/ai-halftone.svg`, generated by `npm run assets:halftone`: one colourless
dot mask over `--spectrum-linear`. Always use it at its own 280px, because scaling it down loses the faintest
dots. On narrow cards (below 380px) move it further into the corner so the icon stays readable.

AI service icons are line drawings on a 48-unit grid (`AiSignalIcon`, stroke 1.6, round caps), and each one
shows what the service does.

### Letters and pointer

Display letters resolve from scrambled characters with a split edge (`--fringe-*`). The pointer trail is white
at its head and opens into the spectrum at its edges.

## 6. 3D

**The hero's glass is the standard**: clear body refracting what is behind it, a thin white rim, prismatic
stars on a few corners (`HERO_CANVAS_UI_GLASS_CONFIG`, `HERO_CANVAS_UI_RIM_CONFIG`,
`HERO_OPTICAL_FLARE_ANCHORS`).

- **NOIR letters and hero cursor** use it as it is.
- **Contact symbol** uses it with less reflection (`CONTACT_REFLECTION`): its wide bevels would otherwise
  mirror the lights as white bands behind the headline.
- **Principles cursor** is that glass at rest. The hyperspace portal fades in only as it opens
  (`resolvePrinciplePortalOpacity`), and a small tilt keeps its flat face from flashing white as it travels
  (`resolvePrincipleGlassTilt`).
- **Stickers keep their original colours.** They are outside this rule.

The background runs `vignette -> swirl -> sine -> shatter -> bokeh`. The transition from the hero into the
dither is one state machine in `scene/scene-transition.ts`.

## 7. Motion

| Token | Value | Use |
|---|---|---|
| `--duration-micro` | `120ms` | Hover, focus, press |
| `--duration-standard` | `240ms` | Panels, menus |
| `--ease-standard` | `cubic-bezier(0.16, 1, 0.3, 1)` | Interface |
| `--ease-noir` | `cubic-bezier(0.66, 0, 0.01, 1)` | Homepage choreography |

- Animate transform and opacity; colour and filter only for direct feedback. Never animate layout.
- Scroll choreography follows measured section geometry, not page percentages.
- The entry animation pauses rather than jumps when the main thread stalls, and heavy canvas work waits until
  the symbol has finished drawing.

## 8. Accessibility

- Target WCAG 2.2 AA, with visible focus on every interactive element and logical landmarks and headings.
- Interactive targets are at least 44x44px.
- `prefers-reduced-motion` removes non-essential motion. JavaScript motion checks the preference too; CSS is
  only the safety net.
- Canvases and decorative grids are hidden from assistive technology, with equivalent text in the DOM.
- Pages reflow at 320 CSS px without sideways scrolling.

## 9. Not migrated yet

- **`/services`** still has placeholder copy and its own type styles. It is public but linked from nowhere.
- **`/glass-test` and `/glass-prism-test`** are internal, `noindex` labs for the glass.
- **`?glass=current`** previews the older hero glass and is the last user of the older flare pass.

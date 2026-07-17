# Home Hero Hybrid Recomposition Design

## Objective

Recompose the home hero on tablet and desktop to follow the approved reference: a centered dominant NOIR 3D mark, supporting copy at the upper sides, a large three-line headline in the lower-left area, a compact description below it, and the existing spectral contact CTA to the right. Preserve the current mobile hero and all existing performance work.

## Scope

The change applies to the home page hero and desktop header at viewport widths of 768px and above.

In scope:

- Reorganize the desktop and tablet hero layout.
- Refine desktop header distribution while keeping its current controls.
- Reuse the footer contact CTA in the hero.
- Adjust only position and scale transforms for the hero 3D model and pointer on tablet and desktop.
- Preserve existing text, scramble reveal, opening transition, pointer response, flare, material, and shader behavior.

Out of scope:

- Mobile hero redesign.
- New navigation labels or routes.
- Shader, flare, material, camera, renderer, or WebGL architecture changes.
- New decorative assets or continuous animation loops.
- Copy changes.

## Visual thesis

The hero is a technical brand canvas organized around one vertical reading axis: NOIR 3D mark, structural headline, explanation, and contact action. The composition should feel engineered rather than card-based, using the existing black atmosphere, grid lines, monochrome model, and restrained spectral highlights.

The single visual risk is the partial overlap between the headline and the lower area of the 3D mark. This overlap is intentional and should create depth without reducing headline legibility.

## Desktop and tablet composition

The hero keeps a minimum height of `100svh` and the existing 12-column site grid.

### Header

- Keep the `NOIR.DIGITAL` brand at the upper left.
- Keep exactly the existing controls: Work, Contact, Theme, and Sound.
- Center and distribute those controls across a compact horizontal navigation group.
- Do not add the reference labels Serviços, Sobre, or Cases.
- Keep the existing bottom status row with clock, coordinates, and status mark.

### Supporting copy

- Place Design, Tecnologia, and Posicionamento in the upper-left region below the header.
- Place “Visibilidade para vender.” and “Tecnologia para crescer.” in the upper-right region.
- Keep the existing text and scramble behavior.
- Keep both blocks visually secondary to the 3D mark and headline.

### 3D mark and pointer

- Center the NOIR 3D mark in the middle band of the first viewport.
- Increase its useful horizontal occupancy while reducing unused vertical space around it.
- Preserve its current material, transparency, refraction, flare, and mouse response.
- Keep the pointer as a secondary element near the lower-right area of the main mark.
- Adjust only tablet and desktop transforms in `scene-layout.ts` and the hero scene anchor when needed.
- Do not alter the mobile transforms.

### Headline

- Keep the approved three lines exactly:
  - `A estrutura digital`
  - `para sua empresa`
  - `crescer`
- Anchor the headline in the lower-left area beneath the main 3D band.
- Allow a controlled partial overlap with the bottom of the mark.
- Keep the headline above WebGL content in stacking order so the model and atmospheric effects cannot reduce text contrast.
- Maintain uppercase display typography and current scramble timing.

### Description and CTA

- Place the existing three-line description below the headline, centered within the middle columns.
- Place `Entrar em contato` to the description’s right.
- Use the same `mailto:` destination and the exact same visual/interaction component as the footer CTA.
- Keep the description and CTA aligned on one lower action row when viewport height permits.
- On shorter desktop viewports, preserve separation and containment even if the row moves closer to the headline.

## Shared contact CTA

Extract the approved footer CTA into a focused shared component. The component owns only the semantic anchor and its surface/spectrum presentation.

Requirements:

- Accessible name: `Entrar em contato`.
- Destination: `mailto:${contactEmail}`.
- Same 300 × 64px maximum size, opposing 14px cuts, light gradient surface, spectral base, external glow, hover/focus displacement, and reduced-motion behavior already approved for the footer.
- The footer and hero use the same component and stylesheet so the two instances cannot visually drift.
- The hero instance is hidden below 768px to preserve the current mobile composition.

## Responsive behavior

### Desktop, 1280px and above

- Use the full reference hierarchy and 12-column distribution.
- The 3D mark is the dominant central element.
- The headline occupies the lower-left region.
- Description and CTA form a lower horizontal action row.

### Tablet, 768px through 1279px

- Preserve the same reading order and relative placement.
- Reduce headline, model, gaps, and CTA spacing proportionally.
- Keep all text and controls within the viewport without horizontal overflow.
- Allow the description and CTA row to compress, but do not stack it in a way that collides with the bottom status row.

### Mobile, below 768px

- Preserve the existing hero markup presentation, sizing, model transform, cursor placement, and mobile menu behavior.
- Hide the new hero CTA.
- Do not move the current mobile headline or description.

## Motion and performance

- Preserve the entry preloader and opening reveal.
- Preserve hero text scramble timing and reduced-motion behavior.
- Preserve pointer-driven 3D motion.
- Preserve the shared CTA hover/focus animation.
- Do not add new scroll listeners, pointer listeners, WebGL passes, shader branches, or continuous decorative loops.
- Animate only the properties already used by existing components.

## Component boundaries

- `components/hero/Hero.tsx`: semantic hero content and shared CTA placement.
- `components/hero/Hero.module.css`: tablet/desktop grid composition and mobile preservation.
- `components/header/Header.module.css`: desktop-only distribution refinements; `SiteHeader.tsx` changes only if the current markup cannot express the approved layout.
- `components/contact/SpectrumContactCta.tsx` and its CSS Module: shared CTA presentation and behavior.
- `components/contact/ContactFooter.tsx`: replace local CTA markup with the shared component.
- `scene/scene-layout.ts`: tablet and desktop hero/pointer transform values only.

No component should own both DOM layout and WebGL rendering logic.

## Accessibility

- Preserve the existing `h1` and its accessible name.
- Preserve semantic navigation and button roles in the header.
- Keep the CTA as a real anchor with a visible focus state.
- Keep text above the WebGL scene in stacking order.
- Maintain sufficient contrast in both light and dark themes.
- Respect `prefers-reduced-motion` for scramble and CTA movement.

## Verification

- Add or update component tests for the hero CTA, shared CTA, footer CTA, current header labels, and unchanged mobile behavior contracts.
- Update scene layout tests for the approved tablet and desktop transforms while confirming mobile values remain unchanged.
- Run the focused tests and production build.
- Inspect the live home page at representative widths:
  - 1536 × 960 desktop.
  - 1024 × 768 tablet.
  - 390 × 844 mobile.
- Verify headline containment, description wrapping, CTA focus/hover state, 3D/pointer placement, bottom status separation, and absence of horizontal overflow.
- Compare the desktop composition directly with the supplied reference.

## Success criteria

- The desktop/tablet first viewport clearly reads as the approved reference composition.
- The 3D mark remains the dominant visual anchor.
- The title, description, and CTA have a clear reading order and do not collide.
- Current header controls remain available and correctly labeled.
- Mobile appearance remains unchanged.
- No shader, flare, or material regression is introduced.
- Tests and production build pass.

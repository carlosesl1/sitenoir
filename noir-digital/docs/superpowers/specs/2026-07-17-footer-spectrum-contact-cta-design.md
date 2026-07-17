# Footer Spectrum Contact CTA — Design Specification

## Objective

Add a single contact CTA to the existing footer composition without changing the approved headline, 3D asset, footer information grid, or scene motion. The CTA reads `ENTRAR EM CONTATO` and opens the existing contact email through a `mailto:` link.

## Placement and hierarchy

- The CTA belongs to the main contact stage, centered beneath the three-line headline and above the editorial information footer.
- It sits above the WebGL scene in the same readable UI layer as the headline.
- The CTA must not change the current horizontal or vertical position of the headline.
- Desktop size is `300 × 64px`.
- Mobile width is constrained to the available viewport width, with a maximum of `300px`; the height remains `64px`.

## Geometry

- Base geometry is a compact horizontal rectangle.
- The top-right and bottom-left corners use opposing `14px` diagonal cuts.
- The remaining corners retain a subtle `4px` radius.
- The spectral base and the light surface use exactly the same silhouette so the revealed layer reads as the button's original position.

## Surface treatment

- The resting surface is light and neutral, using a controlled white-to-gray vertical gradient.
- A thin light border, one-pixel top highlight, short bottom inset shadow, and compact external shadow provide depth without chrome or decorative metadata.
- The label uses the site's clean sans-serif display family, uppercase, centered, and sized for immediate legibility.
- No icon, secondary label, index, divider, or microcopy is added inside the button.

## Spectrum and glow

- A spectrum layer sits directly behind the surface at the surface's resting coordinates.
- The spectrum travels only on the horizontal axis by animating its background position.
- A second copy of the spectrum supplies an external `16px` blur with balanced opacity.
- In the resting state, both the spectrum and glow are hidden by the light surface.

## Interaction

- On pointer hover and keyboard focus, the light surface moves `14px` to the right and `14px` upward.
- The spectral base remains fixed at the original coordinates and becomes visible.
- The spectrum moves horizontally with a restrained `1.8s` alternating linear cycle while the interaction remains active.
- The surface transition uses a smooth, responsive easing and animates only `transform`.
- The entire visible surface remains the link hit target throughout the movement.

## Reduced motion and touch

- Under `prefers-reduced-motion`, the surface moves only `6px` diagonally and the spectrum remains static at its midpoint.
- Keyboard focus receives the same visual result as hover through `:focus-visible`/`:focus-within` behavior.
- On touch devices, the CTA remains fully usable without requiring the hover effect for meaning.

## Component and data boundaries

- `ContactFooter` owns the semantic link because it already imports `contactEmail`.
- The CTA label is local, fixed copy; the destination reuses `contactEmail` from `data/content.ts`.
- Styling stays scoped to `ContactFooter.module.css`; no WebGL, shader, global animation, or scene-layout code is modified.
- The implementation may group the headline and CTA in a local content wrapper only if the headline's current rendered position is preserved exactly.

## Accessibility

- Render a semantic `<a href="mailto:…">`, not a button with scripted navigation.
- Provide a visible focus treatment that follows the cut silhouette.
- Maintain WCAG-readable dark text against the light surface in resting and active states.
- The CTA's accessible name is exactly `Entrar em contato`.

## Verification

- Component test confirms the CTA label and `mailto:` destination.
- Desktop browser check confirms size, placement, opposing cuts, diagonal surface movement, fixed spectral base, and external glow.
- Mobile browser check confirms containment and no horizontal overflow.
- Reduced-motion check confirms that continuous spectrum animation is disabled.
- Production build must complete without TypeScript or rendering errors.

## Out of scope

- Changing the footer headline, 3D model, flare, stickers, information footer, or background grid.
- Adding a contact form or a new contact route.
- Reusing the CTA globally before the footer version is approved in the live composition.

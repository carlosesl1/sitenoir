# NOIR Physical Prism Test — Design

## Goal

Create an isolated full-screen route that tests physically derived prismatic reflections on the NOIR glass model. The home page and its current spectral implementation must remain unchanged.

## Route and presentation

- Add `/glass-prism-test` as a development comparison route.
- Render only the NOIR model on a black background.
- Exclude stickers, hero copy, navigation, atmospheric marks, and contact effects.
- Keep the existing camera framing, model geometry, clear glass response, and white rim treatment where they can be reused without coupling the route to the home.

## Optical approach

- Reuse the installed Drei `MeshTransmissionMaterial` and the existing refraction-buffer architecture.
- Do not render the current colored spectral fragments in this route.
- Render one low-resolution monochrome optical card into the refraction buffer. The card contains five to seven soft, irregular white light regions and is hidden from the final camera render.
- Let `MeshTransmissionMaterial.chromaticAberration` split the refracted white content into RGB according to the model geometry, IOR, and thickness.
- Keep the optical card static. The only visible variation may come from the existing subtle model movement and view-dependent refraction.
- Preserve predominantly clear or dark glass, with white rims and localized prismatic reflections. The result must not resemble colored paint or uniform bands.

## Performance limits

- Add no dependency.
- Use one optical-card mesh and one small texture or canvas texture.
- Reuse the existing refraction pass instead of adding a new post-processing composer.
- Use four transmission samples on desktop and two on mobile.
- Cap the prototype refraction buffer at a moderate resolution suitable for visual evaluation.
- Dispose geometry, texture, material, and render-target resources when the route unmounts.

## Isolation

- Do not change the home route, its query parameters, or its default Canvas UI configuration.
- Do not remove the current spectral implementation yet; the prototype must be reversible by deleting only its new route and prototype-specific modules.
- Prototype-specific configuration must live outside the current production spectral configuration.

## Verification

- A route test proves `/glass-prism-test` renders the isolated prototype without home content.
- Unit tests prove the optical card is monochrome, static, bounded, and uses a single drawable surface.
- Unit tests prove the prototype disables the current spectral-fragment source and uses responsive transmission sample counts.
- TypeScript, Biome, focused Vitest, and production build must pass.
- Browser verification must cover desktop and mobile, confirm zero console errors, and verify that the home remains visually and functionally unchanged.

## Acceptance criteria

- The isolated route visibly produces localized RGB separation from refracted white light.
- No pre-colored rainbow stripe is drawn into the buffer.
- Reflections follow the model and change naturally with the view rather than remaining screen-space paint.
- The glass stays predominantly dark or transparent, with readable white edges.
- The home page remains untouched.

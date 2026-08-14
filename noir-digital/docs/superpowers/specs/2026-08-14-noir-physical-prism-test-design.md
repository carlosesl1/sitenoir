# NOIR Physical Prism Test — Design

## Goal

Create an isolated full-screen route that tests physically derived prismatic reflections on the NOIR glass model. The home page and its current spectral implementation must remain unchanged.

## Route and presentation

- Add `/glass-prism-test` as a development comparison route.
- Render only the NOIR model on a black background.
- Exclude stickers, hero copy, navigation, atmospheric marks, and contact effects.
- Keep the existing camera framing, model geometry, clear glass response, and white rim treatment where they can be reused without coupling the route to the home.

## Optical approach

- Reuse the installed Drei `MeshRefractionMaterial`, which performs view-dependent refraction and chromatic separation against a cubemap.
- Do not render the current colored spectral fragments in this route.
- Supply one low-resolution monochrome `CubeTexture` containing soft white light regions on black. It exists only as the refraction environment and is never rendered as visible scene geometry.
- Let `MeshRefractionMaterial.aberrationStrength` split the refracted white content into RGB according to model geometry, IOR, and view angle.
- Keep the cubemap static. The only visible variation may come from the subtle model movement and view-dependent refraction.
- Preserve predominantly clear or dark glass, with white rims and localized prismatic reflections. The result must not resemble colored paint or uniform bands.

## Performance limits

- Add no dependency.
- Use one optical-card mesh and one small texture or canvas texture.
- Avoid an additional refraction or post-processing pass; the static cubemap is sampled directly by the refraction material.
- Use two internal bounces and the material's accurate chromatic path.
- Cap the prototype refraction buffer at a moderate resolution suitable for visual evaluation.
- Dispose geometry, texture, material, and render-target resources when the route unmounts.

## Isolation

- Do not change the home route, its query parameters, or its default Canvas UI configuration.
- Do not remove the current spectral implementation yet; the prototype must be reversible by deleting only its new route and prototype-specific modules.
- Prototype-specific configuration must live outside the current production spectral configuration.

## Verification

- A route test proves `/glass-prism-test` renders the isolated prototype without home content.
- Unit tests prove the refraction values are bounded, static, and independent from the production spectral source.
- Unit tests prove the prototype disables the current spectral-fragment source and uses responsive transmission sample counts.
- TypeScript, Biome, focused Vitest, and production build must pass.
- Browser verification must cover desktop and mobile, confirm zero console errors, and verify that the home remains visually and functionally unchanged.

## Acceptance criteria

- The isolated route visibly produces localized RGB separation from refracted white light.
- No pre-colored rainbow stripe is drawn into the buffer.
- Reflections follow the model and change naturally with the view rather than remaining screen-space paint.
- The glass stays predominantly dark or transparent, with readable white edges.
- The home page remains untouched.

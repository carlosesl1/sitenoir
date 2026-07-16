# Footer Chrome Material Design

## Objective

Replace only the footer contact model's current silver material with polished mirror chrome matching the supplied reference. Preserve the hero, model geometry, lighting interaction, flare behavior, animation, scale, and layout.

## Visual Direction

The material should produce strong white and black reflections, sharp edge highlights, and readable extrusion depth. It should look like polished chrome rather than matte silver, brushed steel, transparent glass, or a white painted surface.

## Technical Design

- Keep the existing `MeshPhysicalMaterial` pipeline for the contact asset.
- Use a neutral near-white metal base, `metalness: 1`, low roughness between `0.06` and `0.1`, and a restrained clearcoat.
- Generate a studio-style PMREM environment once from Three.js `RoomEnvironment`.
- Assign that environment map only to the contact material; do not set `scene.environment`.
- Dispose the PMREM render target and temporary environment resources when the contact asset unmounts.
- Do not add an external HDRI, texture download, CubeCamera, or per-frame reflection render.

## Performance Constraints

The environment is generated once during model initialization. The finished material uses a static filtered cubemap and introduces no additional render pass per frame. The implementation must reuse the existing demand-driven canvas and must not affect hero rendering.

## Verification

- Run the existing Biome check and production build.
- Inspect the footer at the desktop localhost viewport.
- Confirm chrome has white/black reflected bands, defined edges, and visible extrusion depth.
- Confirm the hero remains visually unchanged and the browser console has no errors.

# NOIR environment highlight softening design

## Goal

Reduce the blown-out fixed white reflection on the Canvas UI NOIR glass by 35% while preserving the approved glass transparency, neutral rim, RGB spectrum, geometry, motion, and background interaction.

## Scope

The change is limited to the effective environment-map intensity in `scene/hero-canvas-ui-glass-config.ts`:

- `environmentIntensity: 0.72` becomes `environmentIntensity: 0.47`.

The value applies the requested 35% reduction at the material control that actually drives the visible reflection. The internal reflector-card values remain unchanged because their HDR output is already saturated inside the generated PMREM map and reducing them by 35% did not visibly alter the final material.

## Preserved behavior

- Keep the internal reflector cards, `environmentBlur`, clearcoat, roughness, transmission, and chromatic aberration unchanged.
- Keep the neutral Fresnel rim unchanged.
- Keep the fixed RGB spectral beams and their palette unchanged.
- Do not restore any pointer-bound light.
- Do not change the GLB, layout, camera, stickers, loader, responsive behavior, or the standard glass variant.

## Verification

- Update the glass configuration test to require `environmentIntensity: 0.47` and the original reflector values.
- Run the focused Canvas UI environment and glass tests.
- Run Biome, TypeScript, and the production build.
- Inspect the production Canvas UI variant in the browser and confirm that the white highlight retains visible surface detail without weakening the RGB spectrum.

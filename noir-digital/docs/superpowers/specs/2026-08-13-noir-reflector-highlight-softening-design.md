# NOIR reflector highlight softening design

## Goal

Reduce the blown-out fixed white reflection on the Canvas UI NOIR glass by 35% while preserving the approved glass transparency, neutral rim, RGB spectrum, geometry, motion, and background interaction.

## Scope

The change is limited to the three fixed optical reflector intensities in `scene/hero-canvas-ui-glass-config.ts`:

- `78` becomes `50.7`.
- `62.4` becomes `40.6`.
- `90` becomes `58.5`.

The rounded values retain exactly the requested visual reduction to practical one-decimal configuration values.

## Preserved behavior

- Keep `environmentIntensity`, `environmentBlur`, clearcoat, roughness, transmission, and chromatic aberration unchanged.
- Keep the neutral Fresnel rim unchanged.
- Keep the fixed RGB spectral beams and their palette unchanged.
- Do not restore any pointer-bound light.
- Do not change the GLB, layout, camera, stickers, loader, responsive behavior, or the standard glass variant.

## Verification

- Update the environment configuration test to require the reduced reflector values.
- Run the focused Canvas UI environment and glass tests.
- Run Biome, TypeScript, and the production build.
- Inspect the production Canvas UI variant in the browser and confirm that the white highlight retains visible surface detail without weakening the RGB spectrum.

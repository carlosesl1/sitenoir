# Footer Chrome Material Design

## Objective

Replace only the footer contact model's current silver material with polished mirror chrome matching the supplied reference. Preserve the hero, model geometry, spectral flare behavior, animation, scale, and layout. The contact surface itself becomes view-dependent rather than light-dependent; the existing pointer-driven flare remains a separate overlay.

## Visual Direction

The material should produce strong white and black reflections, sharp edge highlights, and readable extrusion depth. It should look like polished chrome rather than matte silver, brushed steel, transparent glass, or a white painted surface.

## Technical Design

- Replace the contact asset's `MeshPhysicalMaterial` with `MeshMatcapMaterial` only for the footer model.
- Generate a small procedural matcap texture once with a bright silver crown, a dark mirrored middle band, narrow white highlights, and bright edge falloff.
- Keep the matcap neutral grayscale so the existing spectral flare remains the only colored light treatment.
- Reuse the original physical-material path for the hero, cursor, and every non-contact asset.
- Dispose the generated matcap texture and footer material when the contact asset unmounts.
- Do not add an external HDRI, texture download, CubeCamera, PMREM, or per-frame reflection render.

## Performance Constraints

The 256 px matcap is generated once during contact-model initialization. The finished material uses one small static texture, introduces no additional render pass, and is cheaper than the current PMREM path. The implementation must reuse the existing demand-driven canvas and must not affect hero rendering.

## Verification

- Run the existing Biome check and production build.
- Inspect the footer at the desktop localhost viewport.
- Confirm chrome has a bright silver body, black mirrored bands, defined white edges, and visible extrusion depth across the model's pointer-driven rotation.
- Confirm the hero remains visually unchanged and the browser console has no errors.

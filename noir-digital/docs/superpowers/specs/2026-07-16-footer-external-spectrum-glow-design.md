# Footer External Spectrum Glow Design

## Objective

Move the footer contact model's spectral glow from its bright surfaces and internal openings to the external silhouette only. Preserve the chrome matcap, model motion, layout, stickers, background effects, and the hero's existing lens flare.

## Visual Direction

The footer icon remains readable as polished chrome. A compact rainbow halo sits behind the model and follows only its outer projected contour. The model surface and internal openings receive no spectral fill. Narrow channels that connect internal openings to the background are sealed in the glow mask so they do not produce internal light.

## Architecture

- Build a 256 x 256 local-space silhouette from the contact GLB geometry once after the asset loads.
- Project transformed mesh triangles onto the model's local XY bounds and rasterize them into a binary mask.
- Apply a fixed-radius morphological closing pass to seal the logo's narrow internal channels without changing its visible geometry.
- Flood-fill transparent pixels from the texture edges to classify the true exterior. Treat unvisited transparent regions as enclosed holes and fill them into the solid silhouette.
- Expand outward from the filled silhouette for a compact fixed pixel radius and encode a neutral-to-spectrum gradient only in exterior pixels. Keep every silhouette and enclosed-hole pixel transparent in the glow texture.
- Render the texture on one transparent plane placed behind the contact model and aligned to the same local XY bounds. The plane travels and rotates with the existing contact group.
- Disable the current full-screen lens flare only while the contact section is visible. Keep the hero lens flare path unchanged.

## Components

- `scene/contact-external-glow.ts`: pure mask classification, exterior distance expansion, spectrum encoding, and texture creation.
- `scene/ContactExternalGlow.tsx`: plane geometry, material, placement, and GPU cleanup.
- `scene/ContactModel.tsx`: mounts the glow beside the contact primitive inside the same transformed group.
- `scene/HeroLensFlare.tsx`: skips the full-screen flare while `contactVisible` is true.

## Performance Constraints

The mask and texture are generated once per contact asset load. Runtime cost is one 256 px texture and one transparent plane draw call. No render-target readback, per-frame texture update, extra full-screen pass, external image, or HDRI is added. Disabling the existing footer flare avoids duplicating its full-screen cost.

## Verification

- Unit-test edge-connected exterior classification so enclosed holes are excluded from the glow.
- Unit-test that the spectrum alpha is zero on the solid silhouette and enclosed holes, and positive only outside the external contour.
- Run Biome, the production build, and the full Vitest suite.
- Inspect the footer in the browser at multiple pointer positions.
- Confirm the glow stays outside the icon, enclosed openings remain clear, the chrome surface remains unchanged, and the hero flare remains visually unchanged.

# NOIR Canvas UI Edge Rim

Status: approved visual direction, pending implementation
Date: 2026-08-10
Branch: `codex/noir-prismatic-glass`

## Problem

The Canvas UI NOIR model is transparent and refracts the approved red, yellow, green, and blue spectral beams, but its edge visibility currently depends on the PMREM environment. Portions facing dark environment pixels disappear, so the wordmark is less legible than the reference.

The reference separates two optical jobs: refraction supplies color inside the glass, while a narrow neutral highlight defines the outer silhouette, the inner opening of the `O`, and the model's bevels.

## Goal

Make the complete NOIR wordmark immediately legible on the dark hero while keeping it recognizably transparent glass.

The result must:

- retain the current model geometry, placement, scale, camera, interaction, and responsive composition;
- keep the existing four-color spectral source unchanged;
- show a continuous narrow white core along visible silhouettes and bevels;
- add a restrained soft white halo around that core;
- keep the flat front faces transparent instead of filling them with white or gray;
- avoid coloring the entire outline; RGB remains a refraction detail rather than a decorative stroke.

## Selected approach

Render a dedicated Fresnel rim layer over the existing transmission mesh. Both layers reuse the same geometry:

1. The existing `MeshTransmissionMaterial` remains responsible for glass, environment reflections, and spectral refraction.
2. A lightweight transparent shader renders only view-dependent edge energy.

This is preferred over increasing the environment lights because it keeps edge legibility stable without brightening the glass faces. It is preferred over `EdgesGeometry` because the Fresnel response follows curved and chamfered normals instead of producing a rigid CAD-like wireframe.

## Rim shader

The vertex stage passes the view-space normal and view direction to the fragment stage. The fragment stage derives a Fresnel term from their dot product.

Two neutral masks are composed:

- **Core:** a narrow, high-threshold white response that defines the edge at approximately 1–2 CSS pixels in the approved desktop framing.
- **Halo:** a wider, low-opacity response that softens the core over approximately 2–4 CSS pixels.

The output color is neutral white. Core and halo opacity are configurable independently. The flat face must remain effectively transparent, and the rim material must not sample or reconstruct the RGB palette.

The overlay uses front-side rendering, depth testing, disabled depth writes, normal alpha blending, and a small polygon offset to avoid coplanar flicker. It is not tone-mapped, so the white edge stays stable against the black hero instead of becoming brown or gray.

Initial calibration targets:

- core opacity: `0.82–0.92`;
- halo opacity: `0.12–0.20`;
- no visible white fill on front-facing flat surfaces;
- no opaque band wider than 2 CSS pixels at the normal desktop hero size.

Exact shader thresholds remain implementation constants and may be adjusted once during the bounded visual QA pass.

## Components and ownership

- `HeroCanvasUiGlassAsset.tsx` mounts the transmission mesh and the new rim mesh with shared geometry.
- A dedicated rim configuration module owns core threshold, core opacity, halo threshold, halo opacity, and neutral color.
- A dedicated rim shader module owns the vertex and fragment programs.
- The existing glass, environment, and spectral-source modules remain behaviorally unchanged.

The rim layer must be isolated: a rim shader failure must not require rewriting the transmission implementation or coupling the RGB source to the material.

## Motion and accessibility

The rim has no autonomous animation. It reacts only to the model and camera transforms already present. Reduced-motion behavior therefore remains unchanged. The effect is decorative and adds no DOM semantics or input handling.

## Performance

The design adds one draw call using the existing geometry, no texture, no render target, and no additional refraction samples. The geometry remains disposed by its existing owner; only the shader material needs normal React Three Fiber lifecycle disposal.

## Verification

Automated checks must prove that:

- the transmission material and refraction buffer remain present;
- the rim layer uses the same geometry and a separate shader material;
- the rim configuration is neutral white and contains no spectral palette;
- depth writes are disabled and the overlay has no autonomous time uniform;
- the previous assumption of exactly one hero mesh is deliberately updated;
- the focused Canvas UI tests, typecheck, formatter, and production build pass.

Visual QA must inspect the homepage Canvas UI variant and `/glass-test/` at desktop and mobile widths. Acceptance requires a readable outer silhouette and `O` opening, visible chamfer highlights, transparent faces, unchanged RGB beams, and no flicker or thick cartoon outline.

## Out of scope

- Changing or re-exporting the GLB geometry.
- Recoloring, moving, or adding spectral beams.
- Altering stickers, atmospheric brush strokes, typography, or hero layout.
- Replacing `MeshTransmissionMaterial`.

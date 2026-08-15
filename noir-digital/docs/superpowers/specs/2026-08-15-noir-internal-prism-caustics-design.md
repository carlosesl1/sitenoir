# NOIR Internal Prism Caustics — Design

## Goal

Build a visual-only replacement for the failed physical-prism experiment at
`/glass-prism-test`. The isolated scene must make the NOIR logo read as dark,
transparent glass with bright neutral edges and localized RGB caustic
reflections inside the letter faces. It must not change the production home.

## Why the prior experiment is not sufficient

The `MeshRefractionMaterial` experiment correctly separated RGB at sharp,
view-dependent edges, but the front faces of the NOIR model are nearly planar.
Their similar normals leave little physical ray variation across the interior,
so the desired large, localized reflections do not appear there. A full
physical simulation would need extra geometry or expensive runtime caustics,
without guaranteeing the art direction.

## Chosen approach

Keep the existing isolated model, neutral rim mesh, camera and black backdrop.
Replace its current refraction-only body with a hybrid of:

1. a dark transparent glass base, responsible for the subtle gray internal
   reflections;
2. a single custom caustic overlay material on the same geometry, responsible
   only for local RGB optical reflections in the front-facing surfaces; and
3. the existing white rim shader, rendered last.

The caustic overlay is a direct material pass, not a post-processing effect
and not a new scene render target. This keeps the prototype light while giving
art direction control over the feature that must match the reference: multiple
irregular, localized prism marks inside the logo.

## Optical field

The shader will construct a monochrome caustic field from 9 fixed asymmetric
lobes. Each lobe has a centre, elliptical radius, rotation, strength, softness
and deterministic distortion seed. It is composed with warped signed-distance
shapes and low-frequency value noise, avoiding rectangular bands or repeated
uniform streaks.

For each fragment, the field is sampled three times along one shared diagonal
dispersion direction. The sample weights create the exact NOIR prism sequence:

- red `#d23012`
- yellow `#FCE609`
- green `#21D344`
- blue `#03357C`

The underlying field remains monochrome in concept; the palette is assigned
only after the displaced optical samples are measured. The shader limits the
overlap of the channels so broad white centres cannot replace the intended
colours. A tiny neutral glint is permitted only near a bevel, where it supports
the existing white rim.

All lobes use one optical angle (about 35 degrees upward-right), with at most a
3-degree lobe-level variance. This matches the reference's coherent light
direction without looking stamped.

## Coordinate and masking model

The pattern is anchored in planar local model space, not screen space or mouse
position. A normalized XY coordinate is derived from the already centred
geometry bounds, so the reflections remain attached to the logo through the
idle movement and retain their position across viewport sizes.

The overlay is gated by a front-face visibility factor and a restrained
surface mask. It appears inside the visible faces, reduces strongly on side
walls, and is not painted over the black page outside the model silhouette.
The rim shader remains responsible for white edge definition.

## Motion and accessibility

The caustic placement remains static. Only a very low-amplitude noise phase
may drift over 18 seconds on desktop, creating an optical shimmer rather than
a moving light beam. Reduced-motion users receive a fully static field. No
pointer or mouse-driven light is permitted.

## Performance budget

- One additional geometry draw call for the overlay; no render target,
  post-process pass, external texture or new dependency.
- Fixed lobe count of 9 and constant-bounded GLSL loops.
- Device pixel ratio stays at the existing isolated-scene cap of 1.5.
- The overlay is disabled below the mobile visual-quality threshold only if
  profiling shows it cannot hold a smooth interaction; otherwise the same
  field renders with a lower intensity on mobile.

## Validation criteria

Desktop and mobile screenshots of `/glass-prism-test` must show:

- black background and only the NOIR prototype;
- dark/transparent body, not opaque gray lettering;
- bright white neutral rims;
- at least six non-uniform RGB caustic regions within the letter faces;
- a shared diagonal light direction rather than four repeated bands;
- no mouse-reactive illumination, sticker overlap or production-home changes.

Focused unit tests cover the caustic configuration and source boundaries.
Visual review covers desktop and mobile screenshots. The route remains
`noindex` and the production home is checked for unchanged files.

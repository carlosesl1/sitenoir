# NOIR Reflection Atlas Test Design

## Goal

Replace the procedural RGB caustic lobes in the isolated `/glass-prism-test` route with one art-directed, transparent WebP atlas. The result should read as localized glass reflections rather than repeated shader bands, while leaving the production home untouched.

## Scope

- Add `public/assets/v1/textures/noir-prism-reflections-atlas-v1.webp`.
- Replace only the isolated `PhysicalPrismCausticsOverlay` implementation and its shader boundary with an atlas-backed overlay.
- Keep the existing dark physical glass base and neutral-white rim layer.
- Do not import the production refraction buffer, pointer lighting, post-processing, a new package or a second render target.

## Asset contract

The atlas is a 75,628-byte WebP with alpha and nine independently shaped RGB reflections. Its artwork uses the approved red (`#d23012`), yellow (`#FCE609`), green (`#21D344`) and blue (`#03357C`) palette. The directional flow is baked into the art, so no runtime movement, random seed or pointer coordinate is needed.

The source was generated on a flat magenta chroma-key background, then converted locally to alpha. The runtime must suppress residual dark, low-saturation pixels so only the colored reflective material contributes to the glass.

## Rendering design

The model continues to render three ordered layers:

1. `meshPhysicalMaterial` dark transmissive base (`renderOrder={1}`).
2. One transparent atlas overlay on the same geometry (`renderOrder={2}`).
3. Existing white rim overlay (`renderOrder={3}`).

The atlas overlay maps the texture from the already-established local planar XY UVs. Its fragment shader samples the alpha texture, gates it by luminance and saturation to remove dark residual material, then applies the front-facing mask already used by the procedural layer. The texture is therefore clipped by the real NOIR geometry, remains anchored while the group idly rotates, and cannot overlap stickers or page content.

The overlay uses normal alpha blending, depth testing, no depth write, one texture sample and no animation loop of its own. The texture is marked sRGB and uses the renderer's supported anisotropy limit. It is disposed when the isolated asset unmounts.

## Verification

- A source-boundary test proves the isolated overlay uses `TextureLoader`, the atlas URL and `uReflectionMap`, and excludes procedural `causticField`, `uPointer`, render targets and the production spectral source.
- Static tests preserve the dark glass/rim composition and route isolation.
- `npm run typecheck`, Biome, focused Vitest and `npm run build` pass.
- At 1440 × 900 and 390 × 844, the NOIR remains visible and inside the viewport, has white rims, and shows several compact internal RGB reflections rather than broad repeated stripes.

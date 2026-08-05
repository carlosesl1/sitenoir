from __future__ import annotations

import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "asset-sources"
OUTPUT = ROOT / "public" / "assets" / "v1"
UNICODES = "U+0000-024F,U+1E00-1EFF,U+2000-214F"
GENERATED_ASSET_PATHS = (
    Path("audio/bgm.mp3"),
    Path("fonts/DepartureMono.woff2"),
    Path("fonts/TikTokSans.woff2"),
    Path("model/contact.glb"),
    Path("stickers/atlas-mobile.webp"),
    Path("stickers/atlas.webp"),
)


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=ROOT, check=True)


def subset_font(source: Path, output: Path, axes: tuple[str, ...] = ()) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as temporary_directory:
        instanced = Path(temporary_directory) / source.name
        if axes:
            run(
                [
                    sys.executable,
                    "-m",
                    "fontTools.varLib.instancer",
                    str(source),
                    *axes,
                    "--no-recalc-timestamp",
                    "--output",
                    str(instanced),
                ]
            )
        else:
            shutil.copy2(source, instanced)

        run(
            [
                sys.executable,
                "-m",
                "fontTools.subset",
                str(instanced),
                f"--output-file={output}",
                "--flavor=woff2",
                f"--unicodes={UNICODES}",
                "--layout-features=*",
                "--glyph-names",
                "--symbol-cmap",
                "--legacy-cmap",
                "--notdef-glyph",
                "--notdef-outline",
                "--recommended-glyphs",
            ]
        )


def build_fonts() -> None:
    subset_font(
        SOURCES / "fonts" / "TikTokSans.ttf",
        OUTPUT / "fonts" / "TikTokSans.woff2",
        ("wght=400:700", "wdth=100:120", "opsz=12:36"),
    )
    (OUTPUT / "fonts" / "GeistMono.woff2").unlink(missing_ok=True)
    subset_font(
        SOURCES / "fonts" / "DepartureMono-Regular.otf",
        OUTPUT / "fonts" / "DepartureMono.woff2",
    )


def build_sticker_atlas() -> None:
    source_names = [f"s_{index:02}.png" for index in range(1, 12)] + ["noir-face.png"]
    atlas_specs = (
        ("atlas.webp", 512, 471),
        ("atlas-mobile.webp", 256, 236),
    )

    for output_name, cell_size, maximum_sticker_size in atlas_specs:
        output = OUTPUT / "stickers" / output_name
        output.parent.mkdir(parents=True, exist_ok=True)
        atlas = Image.new("RGBA", (cell_size * 4, cell_size * 3), (0, 0, 0, 0))

        for index, source_name in enumerate(source_names):
            with Image.open(SOURCES / "stickers" / source_name) as source:
                image = source.convert("RGBA")
                scale = maximum_sticker_size / max(image.size)
                size = tuple(max(1, round(dimension * scale)) for dimension in image.size)
                resized = image.resize(size, Image.Resampling.LANCZOS)
                cell_x = (index % 4) * cell_size
                cell_y = (index // 4) * cell_size
                position = (
                    cell_x + (cell_size - size[0]) // 2,
                    cell_y + (cell_size - size[1]) // 2,
                )
                atlas.alpha_composite(resized, position)

        atlas.save(output, "WEBP", lossless=False, quality=94, method=6, exact=True)


def build_audio() -> None:
    output = OUTPUT / "audio" / "bgm.mp3"
    output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCES / "audio" / "bgm.mp3", output)


def build_contact_model() -> None:
    output = OUTPUT / "model" / "contact.glb"
    output.parent.mkdir(parents=True, exist_ok=True)
    npx = shutil.which("npx")
    if npx is None:
        raise RuntimeError("npx is required to optimize the contact model")
    run(
        [
            npx,
            "--yes",
            "@gltf-transform/cli@4.4.1",
            "optimize",
            str(SOURCES / "model" / "cnt.gltf"),
            str(output),
            "--compress",
            "meshopt",
            "--simplify",
            "false",
            "--texture-compress",
            "false",
            "--palette",
            "false",
            "--instance",
            "false",
        ]
    )


def write_manifest() -> None:
    paths = [OUTPUT / relative_path for relative_path in GENERATED_ASSET_PATHS]
    manifest = {
        "pipeline": 1,
        "assets": [
            {
                "path": path.relative_to(OUTPUT).as_posix(),
                "bytes": path.stat().st_size,
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            }
            for path in paths
        ],
    }
    (OUTPUT / "manifest.json").write_bytes((json.dumps(manifest, indent=2) + "\n").encode())


def main() -> None:
    build_fonts()
    build_sticker_atlas()
    build_audio()
    build_contact_model()
    write_manifest()


if __name__ == "__main__":
    main()

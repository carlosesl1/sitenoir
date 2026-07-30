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
    subset_font(
        SOURCES / "fonts" / "GeistMono[wght].ttf",
        OUTPUT / "fonts" / "GeistMono.woff2",
        ("wght=400:650",),
    )
    subset_font(
        SOURCES / "fonts" / "DepartureMono-Regular.otf",
        OUTPUT / "fonts" / "DepartureMono.woff2",
    )


def build_sticker_atlas() -> None:
    output = OUTPUT / "stickers" / "atlas.webp"
    output.parent.mkdir(parents=True, exist_ok=True)
    atlas = Image.new("RGBA", (2048, 1536), (0, 0, 0, 0))
    source_names = [f"s_{index:02}.png" for index in range(1, 12)] + ["noir-face.png"]

    for index, source_name in enumerate(source_names):
        with Image.open(SOURCES / "stickers" / source_name) as source:
            image = source.convert("RGBA")
            scale = 471 / max(image.size)
            size = tuple(max(1, round(dimension * scale)) for dimension in image.size)
            resized = image.resize(size, Image.Resampling.LANCZOS)
            cell_x = (index % 4) * 512
            cell_y = (index // 4) * 512
            position = (cell_x + (512 - size[0]) // 2, cell_y + (512 - size[1]) // 2)
            atlas.alpha_composite(resized, position)

    atlas.save(output, "WEBP", lossless=True, quality=100, method=6, exact=True)


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
    paths = sorted(path for path in OUTPUT.rglob("*") if path.is_file() and path.name != "manifest.json")
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

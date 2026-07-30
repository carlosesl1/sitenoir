import argparse
import json
from pathlib import Path

import bpy
from mathutils import Vector


def parse_args() -> argparse.Namespace:
    arguments = []
    if "--" in __import__("sys").argv:
        arguments = __import__("sys").argv[__import__("sys").argv.index("--") + 1 :]
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    return parser.parse_args(arguments)


def main() -> None:
    args = parse_args()
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=str(Path(args.input).resolve()))

    points: list[Vector] = []
    objects = []
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        object_points = [obj.matrix_world @ vertex.co for vertex in obj.data.vertices]
        points.extend(object_points)
        object_minimum = [min(point[axis] for point in object_points) for axis in range(3)]
        object_maximum = [max(point[axis] for point in object_points) for axis in range(3)]
        objects.append(
            {
                "name": obj.name,
                "dimensions": [
                    object_maximum[axis] - object_minimum[axis] for axis in range(3)
                ],
                "polygons": len(obj.data.polygons),
                "vertices": len(obj.data.vertices),
                "depth_levels": sorted(
                    {round(point[1], 4) for point in object_points}
                )[:20],
            }
        )

    minimum = [min(point[axis] for point in points) for axis in range(3)]
    maximum = [max(point[axis] for point in points) for axis in range(3)]
    dimensions = [maximum[axis] - minimum[axis] for axis in range(3)]
    depth_axis = min(range(3), key=lambda axis: dimensions[axis])
    width_axis = max(
        (axis for axis in range(3) if axis != depth_axis),
        key=lambda axis: dimensions[axis],
    )

    center = (minimum[depth_axis] + maximum[depth_axis]) * 0.5
    half_depth = dimensions[depth_axis] * 0.5
    global_width_max = maximum[width_axis]
    levels: dict[float, float] = {}
    for point in points:
        depth = round(point[depth_axis], 4)
        levels[depth] = max(levels.get(depth, -float("inf")), point[width_axis])

    profile = []
    for depth, width_max in sorted(levels.items()):
        normalized_depth = abs(depth - center) / half_depth if half_depth else 0
        if normalized_depth > 1.001:
            continue
        profile.append(
            {
                "depth": depth,
                "depth_normalized": round(normalized_depth, 4),
                "outline_inset": round(global_width_max - width_max, 4),
            }
        )

    print(
        "NOIR_CONTACT_PROFILE="
        + json.dumps(
            {
                "depth_axis": depth_axis,
                "dimensions": dimensions,
                "levels": profile,
                "objects": objects,
                "width_axis": width_axis,
            },
            sort_keys=True,
        )
    )


main()

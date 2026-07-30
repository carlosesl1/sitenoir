import argparse
import json
import math
import statistics
from pathlib import Path

import bmesh
import bpy


def parse_args() -> argparse.Namespace:
    arguments = []
    if "--" in __import__("sys").argv:
        arguments = __import__("sys").argv[__import__("sys").argv.index("--") + 1 :]
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output")
    parser.add_argument("--inspect-only", action="store_true")
    parser.add_argument("--bevel-ratio", type=float, default=0.42)
    parser.add_argument("--depth-scale", type=float, default=1.0)
    parser.add_argument("--segments", type=int, default=6)
    return parser.parse_args(arguments)


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablock in bpy.data.meshes:
        if datablock.users == 0:
            bpy.data.meshes.remove(datablock)


def mesh_objects() -> list[bpy.types.Object]:
    return [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]


def world_bounds(objects: list[bpy.types.Object]) -> tuple[list[float], list[float]]:
    minimum = [math.inf, math.inf, math.inf]
    maximum = [-math.inf, -math.inf, -math.inf]
    for obj in objects:
        for corner in obj.bound_box:
            point = obj.matrix_world @ __import__("mathutils").Vector(corner)
            for axis in range(3):
                minimum[axis] = min(minimum[axis], point[axis])
                maximum[axis] = max(maximum[axis], point[axis])
    return minimum, maximum


def inspect(objects: list[bpy.types.Object]) -> dict[str, object]:
    minimum, maximum = world_bounds(objects)
    dimensions = [maximum[index] - minimum[index] for index in range(3)]
    return {
        "bounds_max": maximum,
        "bounds_min": minimum,
        "dimensions": dimensions,
        "meshes": len(objects),
        "polygons": sum(len(obj.data.polygons) for obj in objects),
        "vertices": sum(len(obj.data.vertices) for obj in objects),
    }


def apply_depth_scale(objects: list[bpy.types.Object], depth_scale: float) -> int:
    minimum, maximum = world_bounds(objects)
    dimensions = [maximum[index] - minimum[index] for index in range(3)]
    depth_axis = min(range(3), key=lambda index: dimensions[index])
    if abs(depth_scale - 1.0) < 0.000001:
        return depth_axis
    for obj in objects:
        obj.scale[depth_axis] *= depth_scale
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.select_set(False)
    return depth_axis


def apply_bevel(
    objects: list[bpy.types.Object],
    bevel_ratio: float,
    segments: int,
) -> None:
    minimum, maximum = world_bounds(objects)
    dimensions = [maximum[index] - minimum[index] for index in range(3)]
    depth_axis = min(range(3), key=lambda index: dimensions[index])
    bevel_width = dimensions[depth_axis] * bevel_ratio
    selected_edges = 0

    for obj in objects:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

        mesh = obj.data
        bm = bmesh.new()
        bm.from_mesh(mesh)
        vertices_before_weld = len(bm.verts)
        bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.001)
        welded_vertices = vertices_before_weld - len(bm.verts)
        bmesh.ops.dissolve_limit(
            bm,
            angle_limit=math.radians(0.5),
            use_dissolve_boundaries=False,
            verts=list(bm.verts),
            edges=list(bm.edges),
            delimit={"NORMAL"},
        )
        bm.normal_update()

        edges = []
        for edge in bm.edges:
            if len(edge.link_faces) != 2:
                continue
            first_cap = abs(edge.link_faces[0].normal[depth_axis]) > 0.82
            second_cap = abs(edge.link_faces[1].normal[depth_axis]) > 0.82
            if first_cap != second_cap:
                edges.append(edge)

        edge_lengths = [edge.calc_length() for edge in edges]
        selected_edges += len(edges)
        result = bmesh.ops.bevel(
            bm,
            geom=edges,
            offset=bevel_width,
            offset_type="OFFSET",
            segments=max(1, segments),
            profile=0.5,
            affect="EDGES",
            clamp_overlap=False,
            loop_slide=True,
            harden_normals=True,
            miter_outer="ARC",
            miter_inner="ARC",
        )
        for face in bm.faces:
            face.smooth = face in result["faces"]
        bm.normal_update()
        bm.to_mesh(mesh)
        bm.free()
        mesh.update()

        obj.select_set(False)
    print(
        "NOIR_CONTACT_BEVEL="
        + json.dumps(
            {
                "depth_axis": depth_axis,
                "segments": segments,
                "selected_edges": selected_edges,
                "selected_edge_length_min": min(edge_lengths, default=0),
                "selected_edge_length_median": statistics.median(edge_lengths) if edge_lengths else 0,
                "welded_vertices": welded_vertices,
                "width": bevel_width,
            },
            sort_keys=True,
        )
    )


def export_glb(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        export_apply=True,
        export_materials="EXPORT",
        export_meshopt_compression_enable=True,
        export_meshopt_extension="EXT_meshopt_compression",
        export_normals=True,
        export_tangents=False,
        export_texcoords=True,
        export_yup=True,
    )


def main() -> None:
    args = parse_args()
    input_path = Path(args.input).resolve()
    reset_scene()
    bpy.ops.import_scene.gltf(filepath=str(input_path))
    objects = mesh_objects()
    before = inspect(objects)
    print("NOIR_CONTACT_BEFORE=" + json.dumps(before, sort_keys=True))
    if args.inspect_only:
        return
    if not args.output:
        raise ValueError("--output is required unless --inspect-only is used")
    depth_axis = apply_depth_scale(objects, args.depth_scale)
    print(
        "NOIR_CONTACT_DEPTH="
        + json.dumps(
            {
                "axis": depth_axis,
                "scale": args.depth_scale,
                "scaled_dimensions": inspect(objects)["dimensions"],
            },
            sort_keys=True,
        )
    )
    apply_bevel(objects, args.bevel_ratio, args.segments)
    after = inspect(objects)
    print("NOIR_CONTACT_AFTER=" + json.dumps(after, sort_keys=True))
    export_glb(Path(args.output).resolve())


main()

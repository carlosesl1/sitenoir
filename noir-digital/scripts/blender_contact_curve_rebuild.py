import argparse
import math
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector


def parse_args() -> argparse.Namespace:
    arguments = []
    if "--" in __import__("sys").argv:
        arguments = __import__("sys").argv[__import__("sys").argv.index("--") + 1 :]
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--depth", type=float, default=39.81269454956055)
    parser.add_argument("--bevel-radius", type=float, default=3.5)
    parser.add_argument("--bevel-resolution", type=int, default=5)
    return parser.parse_args(arguments)


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def mesh_objects() -> list[bpy.types.Object]:
    return [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]


def bounds(objects: list[bpy.types.Object]) -> tuple[list[float], list[float]]:
    minimum = [math.inf, math.inf, math.inf]
    maximum = [-math.inf, -math.inf, -math.inf]
    for obj in objects:
        for corner in obj.bound_box:
            point = obj.matrix_world @ Vector(corner)
            for axis in range(3):
                minimum[axis] = min(minimum[axis], point[axis])
                maximum[axis] = max(maximum[axis], point[axis])
    return minimum, maximum


def signed_area(loop: list[Vector]) -> float:
    return sum(
        loop[index].x * loop[(index + 1) % len(loop)].z
        - loop[(index + 1) % len(loop)].x * loop[index].z
        for index in range(len(loop))
    ) * 0.5


def point_inside(point: Vector, polygon: list[Vector]) -> bool:
    inside = False
    previous = polygon[-1]
    for current in polygon:
        intersects = (
            (current.z > point.z) != (previous.z > point.z)
            and point.x
            < (previous.x - current.x)
            * (point.z - current.z)
            / ((previous.z - current.z) or 1e-12)
            + current.x
        )
        if intersects:
            inside = not inside
        previous = current
    return inside


def remove_collinear(loop: list[Vector], tolerance: float = 0.0005) -> list[Vector]:
    simplified = []
    for index, point in enumerate(loop):
        previous = loop[index - 1]
        following = loop[(index + 1) % len(loop)]
        first = Vector((point.x - previous.x, point.z - previous.z))
        second = Vector((following.x - point.x, following.z - point.z))
        if first.length < tolerance or second.length < tolerance:
            continue
        if abs(first.normalized().cross(second.normalized())) < tolerance:
            continue
        simplified.append(point)
    return simplified


def extract_cap_loops(obj: bpy.types.Object) -> list[list[Vector]]:
    mesh = obj.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.001)
    bm.normal_update()

    maximum_depth = max(vertex.co.y for vertex in bm.verts)
    cap_faces = {
        face
        for face in bm.faces
        if abs(face.normal.y) > 0.9
        and all(abs(vertex.co.y - maximum_depth) < 0.01 for vertex in face.verts)
    }
    boundary_edges = [
        edge
        for edge in bm.edges
        if sum(face in cap_faces for face in edge.link_faces) == 1
    ]
    adjacency: dict[object, list[object]] = {}
    for edge in boundary_edges:
        first, second = edge.verts
        adjacency.setdefault(first, []).append(second)
        adjacency.setdefault(second, []).append(first)

    unused = {frozenset(edge.verts) for edge in boundary_edges}
    loops = []
    while unused:
        seed = next(iter(unused))
        start, current = tuple(seed)
        loop_vertices = [start]
        previous = start
        unused.discard(frozenset((start, current)))
        while current is not start:
            loop_vertices.append(current)
            candidates = [
                vertex
                for vertex in adjacency[current]
                if vertex is not previous
                and frozenset((current, vertex)) in unused
            ]
            if not candidates:
                break
            following = candidates[0]
            unused.discard(frozenset((current, following)))
            previous, current = current, following
        if current is start and len(loop_vertices) >= 3:
            world_loop = [obj.matrix_world @ vertex.co for vertex in loop_vertices]
            loops.append(remove_collinear(world_loop))
    bm.free()
    return loops


def create_curve(
    name: str,
    loops: list[list[Vector]],
    depth: float,
    bevel_radius: float,
    bevel_resolution: int,
) -> bpy.types.Object:
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "2D"
    curve.resolution_u = 1
    curve.render_resolution_u = 1
    curve.fill_mode = "BOTH"
    radius = min(max(bevel_radius, 0.01), depth * 0.49)
    curve.extrude = max(depth * 0.5 - radius, 0.01)
    curve.bevel_depth = radius
    curve.bevel_resolution = bevel_resolution
    curve.resolution_v = bevel_resolution
    curve.use_fill_caps = True

    for loop in loops:
        nesting = sum(
            point_inside(loop[0], other)
            for other in loops
            if other is not loop and abs(signed_area(other)) > abs(signed_area(loop))
        )
        should_be_counter_clockwise = nesting % 2 == 0
        is_counter_clockwise = signed_area(loop) > 0
        ordered = loop if is_counter_clockwise == should_be_counter_clockwise else list(reversed(loop))
        spline = curve.splines.new("POLY")
        spline.points.add(len(ordered) - 1)
        for point, source in zip(spline.points, ordered):
            point.co = (source.x, source.z, 0, 1)
        spline.use_cyclic_u = True

    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.rotation_euler.x = math.pi * 0.5
    return obj


def convert_curves(curves: list[bpy.types.Object]) -> list[bpy.types.Object]:
    bpy.ops.object.select_all(action="DESELECT")
    for curve in curves:
        curve.select_set(True)
    bpy.context.view_layer.objects.active = curves[0]
    bpy.ops.object.convert(target="MESH")
    return mesh_objects()


def fit_bounds(
    objects: list[bpy.types.Object],
    target_minimum: list[float],
    target_maximum: list[float],
    target_depth: float,
) -> None:
    current_minimum, current_maximum = bounds(objects)
    current_center = [
        (current_minimum[axis] + current_maximum[axis]) * 0.5 for axis in range(3)
    ]
    target_center = [
        (target_minimum[axis] + target_maximum[axis]) * 0.5 for axis in range(3)
    ]
    scale = [
        (target_maximum[0] - target_minimum[0])
        / (current_maximum[0] - current_minimum[0]),
        target_depth / (current_maximum[1] - current_minimum[1]),
        (target_maximum[2] - target_minimum[2])
        / (current_maximum[2] - current_minimum[2]),
    ]
    for obj in objects:
        inverse = obj.matrix_world.inverted()
        for vertex in obj.data.vertices:
            point = obj.matrix_world @ vertex.co
            fitted = Vector(
                (
                    (point.x - current_center[0]) * scale[0] + target_center[0],
                    (point.y - current_center[1]) * scale[1] + target_center[1],
                    (point.z - current_center[2]) * scale[2] + target_center[2],
                )
            )
            vertex.co = inverse @ fitted
        obj.data.update()


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
        export_texcoords=False,
        export_yup=True,
    )


def main() -> None:
    args = parse_args()
    reset_scene()
    bpy.ops.import_scene.gltf(filepath=str(Path(args.input).resolve()))
    sources = mesh_objects()
    target_minimum, target_maximum = bounds(sources)
    loop_sets = [(source.name, extract_cap_loops(source)) for source in sources]
    for source in sources:
        bpy.data.objects.remove(source, do_unlink=True)

    curves = [
        create_curve(name, loops, args.depth, args.bevel_radius, args.bevel_resolution)
        for name, loops in loop_sets
        if loops
    ]
    rebuilt = convert_curves(curves)
    fit_bounds(rebuilt, target_minimum, target_maximum, args.depth)
    for obj in rebuilt:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        obj.select_set(False)
    print(
        "NOIR_CONTACT_CURVE_REBUILD="
        + str(
            {
                "objects": len(rebuilt),
                "polygons": sum(len(obj.data.polygons) for obj in rebuilt),
                "vertices": sum(len(obj.data.vertices) for obj in rebuilt),
            }
        )
    )
    export_glb(Path(args.output).resolve())


main()

import { readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

import { JSDOM } from "jsdom";
import { Box3, Group, Mesh, MeshBasicMaterial, Vector3 } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const [, , inputArgument, outputArgument, targetArgument] = process.argv;

if (!inputArgument || !outputArgument) {
  throw new Error(
    "Usage: node scripts/convert-hero-3mf.mjs <input.3mf|input.glb> <output.glb> [target.glb]",
  );
}

const inputPath = resolve(inputArgument);
const outputPath = resolve(outputArgument);
const targetPath = targetArgument ? resolve(targetArgument) : null;

const domWindow = new JSDOM("").window;
globalThis.DOMParser = domWindow.DOMParser;

class NodeFileReader {
  result = null;
  onloadend = null;
  onerror = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(
      (buffer) => {
        this.result = buffer;
        this.onloadend?.();
      },
      (error) => this.onerror?.(error),
    );
  }

  readAsDataURL(blob) {
    blob.arrayBuffer().then(
      (buffer) => {
        const base64 = Buffer.from(buffer).toString("base64");
        this.result = `data:${blob.type};base64,${base64}`;
        this.onloadend?.();
      },
      (error) => this.onerror?.(error),
    );
  }
}

globalThis.FileReader = NodeFileReader;

function exactArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function geometryStats(geometry) {
  const position = geometry.getAttribute("position");
  const indexCount = geometry.index?.count ?? position.count;
  geometry.computeBoundingBox();
  const size = geometry.boundingBox.getSize(new Vector3());
  return {
    bounds: [size.x, size.y, size.z],
    triangles: indexCount / 3,
    vertices: position.count,
  };
}

async function targetWidthFromGlb(path) {
  if (!path) return null;
  const bytes = await readFile(path);
  const gltf = await new Promise((onLoad, onError) => {
    new GLTFLoader().parse(exactArrayBuffer(bytes), "", onLoad, onError);
  });
  const bounds = new Box3().setFromObject(gltf.scene);
  return bounds.getSize(new Vector3()).x;
}

async function loadSource(bytes, path) {
  if (extname(path).toLowerCase() === ".3mf") {
    return new ThreeMFLoader().parse(exactArrayBuffer(bytes));
  }
  if (extname(path).toLowerCase() === ".glb") {
    const gltf = await new Promise((onLoad, onError) => {
      new GLTFLoader().parse(exactArrayBuffer(bytes), "", onLoad, onError);
    });
    return gltf.scene;
  }
  throw new Error("Only .3mf and .glb hero sources are supported.");
}

const inputBytes = await readFile(inputPath);
const source = await loadSource(inputBytes, inputPath);

// Hero sources are authored Y-up; bake their existing object transforms only.
source.updateMatrixWorld(true);

const geometries = [];
source.traverse((object) => {
  if (!(object instanceof Mesh)) return;

  let geometry = object.geometry.clone();
  geometry.applyMatrix4(object.matrixWorld);
  for (const attributeName of Object.keys(geometry.attributes)) {
    if (attributeName !== "position") geometry.deleteAttribute(attributeName);
  }
  geometry = mergeVertices(geometry, 0.0001);
  geometry.computeVertexNormals();
  geometries.push(geometry);
});

if (geometries.length === 0) {
  throw new Error("The 3MF did not contain any mesh geometry.");
}

const merged = mergeGeometries(geometries, false);
for (const geometry of geometries) {
  if (geometry !== merged) geometry.dispose();
}
if (!merged) throw new Error("The 3MF meshes could not be merged.");

const sourceStats = geometryStats(merged);
merged.center();

const targetWidth = await targetWidthFromGlb(targetPath);
if (targetWidth && sourceStats.bounds[0] > 0) {
  const scale = targetWidth / sourceStats.bounds[0];
  merged.scale(scale, scale, scale);
}
merged.computeBoundingBox();
merged.computeBoundingSphere();

const scene = new Group();
scene.name = "NOIR_REFERENCE_OPTIMIZED";
scene.add(new Mesh(merged, new MeshBasicMaterial({ color: 0xffffff, name: "NOIR_GLASS_SOURCE" })));

const exported = await new GLTFExporter().parseAsync(scene, {
  binary: true,
  includeCustomExtensions: false,
  onlyVisible: true,
});
await writeFile(outputPath, Buffer.from(exported));

const outputStats = geometryStats(merged);
console.log(
  JSON.stringify(
    {
      inputBytes: inputBytes.byteLength,
      meshCount: geometries.length,
      output: outputPath,
      outputStats,
      sourceStats,
      targetWidth,
    },
    null,
    2,
  ),
);

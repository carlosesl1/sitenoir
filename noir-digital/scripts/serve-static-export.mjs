import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "out");
const port = Number.parseInt(process.argv[3] ?? "3100", 10);
const host = "127.0.0.1";

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mp3", "audio/mpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

async function resolveFile(pathname) {
  const relativePath = decodeURIComponent(pathname).replace(/^[/\\]+/, "");
  const requestedPath = path.resolve(root, relativePath);
  if (requestedPath !== root && !requestedPath.startsWith(`${root}${path.sep}`)) return undefined;

  const candidates = path.extname(requestedPath)
    ? [requestedPath]
    : [path.join(requestedPath, "index.html"), `${requestedPath}.html`];

  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      // Continue to the next static-export route shape.
    }
  }

  return undefined;
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  try {
    const pathname = new URL(request.url ?? "/", `http://${host}:${port}`).pathname;
    const file = await resolveFile(pathname);
    if (!file) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type":
        contentTypes.get(path.extname(file).toLowerCase()) ?? "application/octet-stream",
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(400);
    response.end("Bad request");
  }
});

server.listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}

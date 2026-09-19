/**
 * Production server for the mediaserver SPA — plain Deno.serve, no framework.
 *
 * - Serves the Vite build output from client/dist
 * - Falls back to index.html for unknown paths (SPA history-mode routing)
 *
 * Environment variables:
 *   PORT  listen port (default 8000)
 */

const PORT = Number(Deno.env.get("PORT") ?? "8000");
const DIST_DIR = new URL("../client/dist/", import.meta.url);

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

function contentType(path: string): string {
  const idx = path.lastIndexOf(".");
  if (idx < 0) return "application/octet-stream";
  return MIME_TYPES[path.slice(idx).toLowerCase()] ?? "application/octet-stream";
}

async function serveStatic(pathname: string): Promise<Response | null> {
  // Prevent path traversal, then resolve relative to the dist directory.
  const rel = pathname.replace(/^\/+/, "").split("/").filter((p) => p !== "..").join("/");
  if (rel === "") return null;
  const fileUrl = new URL(rel, DIST_DIR);
  try {
    const stat = await Deno.stat(fileUrl);
    if (!stat.isFile) return null;
    const body = await Deno.readFile(fileUrl);
    return new Response(body, {
      headers: { "content-type": contentType(rel) },
    });
  } catch {
    return null;
  }
}

async function serveIndex(): Promise<Response> {
  try {
    const body = await Deno.readFile(new URL("index.html", DIST_DIR));
    return new Response(body, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch {
    return new Response(
      "client/dist not found — run `deno task build` first.",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const staticResp = await serveStatic(url.pathname);
  if (staticResp) return staticResp;

  // SPA fallback: let the client-side router handle unknown paths.
  return await serveIndex();
}

console.log(`mediaserver SPA server listening on http://0.0.0.0:${PORT}`);
Deno.serve({ port: PORT, hostname: "0.0.0.0" }, handler);

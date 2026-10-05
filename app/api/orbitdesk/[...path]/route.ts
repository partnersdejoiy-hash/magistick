import { NextRequest, NextResponse } from "next/server";
import { proxyToOrbitDesk } from "@/lib/orbitdesk";
import { getSessionUser } from "@/lib/auth";

/**
 * GET/POST/PATCH /api/orbitdesk/[...path] → OrbitDesk /api/[...path]
 * Server-side only: the browser never sees OrbitDesk credentials or tokens.
 * Requires a signed-in magistick user (any role).
 */
async function handle(req: NextRequest, ctx: { params: { path: string[] } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const subPath = (ctx.params.path ?? []).join("/");
  if (!subPath) {
    return NextResponse.json({ error: "missing OrbitDesk path" }, { status: 400 });
  }

  const method = req.method.toUpperCase();
  if (!["GET", "POST", "PATCH"].includes(method)) {
    return NextResponse.json({ error: "method not allowed" }, { status: 405 });
  }

  let body: string | undefined;
  if (method !== "GET") {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  const incoming = new URL(req.url);
  const result = await proxyToOrbitDesk(subPath, {
    method,
    body: body || undefined,
    query: incoming.search,
  });

  return new NextResponse(result.body, {
    status: result.status,
    headers: { "Content-Type": result.contentType, "Cache-Control": "no-store" },
  });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;

// Route handlers run on the server; keep them dynamic (no static caching).
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Phase-2 gate: every route except /login + /api/auth/login needs a valid
 * session cookie. /admin* and /api/admin/* additionally need the right role.
 */

const SESSION_COOKIE = "magistick_session";

type Role = "admin" | "collaborator" | "employee";

async function sessionRole(req: NextRequest): Promise<Role | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const role = (payload as { role?: unknown }).role;
    return role === "admin" || role === "collaborator" || role === "employee" ? role : null;
  } catch {
    return null;
  }
}

function deny(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not allowed for your role." }, { status: 403 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/not-allowed";
  return NextResponse.rewrite(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static assets, login page, and the login API stay public.
  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/login" ||
    pathname === "/api/auth/login" ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const role = await sessionRole(req);
  if (!role) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const startsWithOne = (list: string[]) =>
    list.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const isPostsArea = startsWithOne(["/admin/posts", "/api/admin/posts"]);
  const isAdminArea =
    pathname === "/admin" ||
    (pathname.startsWith("/admin/") && !isPostsArea) ||
    startsWithOne(["/api/admin/users", "/api/admin/apps", "/api/admin/permissions"]);

  if (isAdminArea && role !== "admin") return deny(req);
  if (isPostsArea && role !== "admin" && role !== "collaborator") return deny(req);

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

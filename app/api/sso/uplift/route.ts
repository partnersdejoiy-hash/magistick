import { NextResponse, type NextRequest } from "next/server";
import { SignJWT } from "jose";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const UPLIFT = process.env.UPLIFT_URL || "https://uplift.dejoiy.com";

/**
 * GET /api/sso/uplift → one-click into Uplift (DEJOIY's coaching tool, a separate app).
 * Signs a one-minute token for the "uplift-handoff" audience with UPLIFT_SECRET (shared with Uplift only);
 * Uplift swaps it for its own session. Signed out → magistick sign-in first, then back here.
 */
export async function GET(req: NextRequest) {
  const me = await getSessionUser();
  const secret = process.env.UPLIFT_SECRET;
  if (!secret) return NextResponse.redirect(`${UPLIFT}/login`);
  if (!me) return NextResponse.redirect(new URL("/login?next=/api/sso/uplift", req.url));
  const t = await new SignJWT({ id: me.id })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("uplift-handoff")
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(new TextEncoder().encode(secret));
  return NextResponse.redirect(`${UPLIFT}/sso?t=${encodeURIComponent(t)}`);
}

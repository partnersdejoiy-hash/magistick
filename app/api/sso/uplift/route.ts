import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const UPLIFT = process.env.UPLIFT_URL || "https://uplift.dejoiy.com";

/**
 * GET /api/sso/uplift → one-click into Uplift (DEJOIY's coaching tool, a separate app).
 * Signs a one-minute token for the "uplift-handoff" audience with the shared AUTH_SECRET;
 * Uplift swaps it for its own session. Signed out → Uplift's own sign-in page.
 */
export async function GET() {
  const me = await getSessionUser();
  const secret = process.env.AUTH_SECRET;
  if (!me || !secret) return NextResponse.redirect(`${UPLIFT}/login`);
  const t = await new SignJWT({ id: me.id })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("uplift-handoff")
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(new TextEncoder().encode(secret));
  return NextResponse.redirect(`${UPLIFT}/sso?t=${encodeURIComponent(t)}`);
}

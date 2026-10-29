import { NextResponse, type NextRequest } from "next/server";
import { SignJWT } from "jose";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TEMPO = process.env.TEMPO_URL || "https://tempo.dejoiy.com";

/**
 * GET /api/sso/tempo → one-click into Tempo (DEJOIY's scheduling tool, a separate app).
 * Signs a one-minute token for the "tempo-handoff" audience with TEMPO_SECRET (shared with Tempo only);
 * Tempo swaps it for its own session. Signed out → magistick sign-in first, then back here.
 */
export async function GET(req: NextRequest) {
  const me = await getSessionUser();
  const secret = process.env.TEMPO_SECRET;
  if (!secret) return NextResponse.redirect(`${TEMPO}/login`);
  if (!me) return NextResponse.redirect(new URL("/login?next=/api/sso/tempo", req.url));
  const t = await new SignJWT({ id: me.id })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("tempo-handoff")
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(new TextEncoder().encode(secret));
  return NextResponse.redirect(`${TEMPO}/sso?t=${encodeURIComponent(t)}`);
}

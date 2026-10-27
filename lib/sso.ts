import { SignJWT } from "jose";
import { timingSafeEqual } from "crypto";

/**
 * Sign-in for DEJOIY's other apps (Workloom first). magistick is the identity
 * provider: a signed-in user is sent back to the app with a 2-minute token
 * signed with SSO_SECRET, which only magistick and the app know.
 */

function secret(): Uint8Array {
  const s = process.env.SSO_SECRET ?? "";
  if (s.length < 32) throw new Error("SSO_SECRET is not set (min 32 chars) — add it in Vercel env vars.");
  return new TextEncoder().encode(s);
}

/** Only DEJOIY hosts and Workloom's own Vercel previews may receive a token. */
export function allowedReturn(raw: string | null): URL | null {
  try {
    const u = new URL(raw ?? "");
    const ok =
      u.protocol === "https:" &&
      (u.hostname.endsWith(".dejoiy.com") || /^workloom[a-z0-9-]*\.vercel\.app$/.test(u.hostname));
    return ok ? u : null;
  } catch {
    return null;
  }
}

export type SsoClaims = {
  email: string;
  name: string;
  level: string;
  department: string;
  title: string;
  location: string;
  manager_email: string | null;
};

export async function signSso(claims: SsoClaims, audience: string) {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("magistick")
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(secret());
}

/** Server-to-server calls: Authorization: Bearer <SSO_SECRET>. */
export function bearerOk(header: string | null) {
  const want = Buffer.from(`Bearer ${process.env.SSO_SECRET ?? ""}`);
  const got = Buffer.from(header ?? "");
  return (process.env.SSO_SECRET ?? "").length >= 32 && got.length === want.length && timingSafeEqual(got, want);
}

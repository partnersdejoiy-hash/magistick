import { NextResponse } from "next/server";
import { requireMe } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/auth/me → the signed-in user with live level, department and permissions. */
export async function GET() {
  const g = await requireMe();
  if ("error" in g) return g.error;
  return NextResponse.json({ user: g.me });
}
